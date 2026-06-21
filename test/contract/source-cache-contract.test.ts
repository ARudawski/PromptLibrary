import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { describe, expect, it, vi } from "vitest";
import { InvokePromptUseCase } from "../../src/application/index.js";
import { PromptCache, resolvePromptCommand } from "../../src/cache/index.js";
import { invokePromptLibraryCommand } from "../../src/mcp/invokePromptLibraryCommandTool.js";
import {
  invalidPromptFile,
  mutableClock,
  ScriptedPromptSource,
  validPromptFile,
} from "../helpers/sourceCacheTestHarness.js";

const FORBIDDEN_INVOCATION_KEYS = [
  "slug",
  "aliases",
  "description",
  "status",
  "hash",
  "source_path",
  "repo_commit",
  "indexed_at",
  "validation_diagnostics",
  "cache_diagnostics",
  "debug_marker",
  "prompt_version",
  "created_at",
  "updated_at",
] as const;

describe("source/cache contract", () => {
  it("serves fresh cache and replaces stale cache after a successful no-network refresh", async () => {
    await expectNoNetwork(async () => {
      const clock = mutableClock(1_000);
      const promptSource = new ScriptedPromptSource([
        [
          validPromptFile("alpha", {
            aliases: ["alpha-alias"],
            body: "Apply alpha.\n",
          }),
        ],
        [validPromptFile("beta", { body: "Apply beta.\n" })],
      ]);
      const cache = new PromptCache({ promptSource, clock, ttlMilliseconds: 50 });

      const freshResult = await cache.getIndex();
      clock.setNow(1_049);
      const freshHitResult = await cache.getIndex();
      clock.setNow(1_050);
      const refreshedResult = await cache.getIndex();

      expect(freshResult).toMatchObject({
        kind: "success",
        status: "fresh",
        loadedAtMilliseconds: 1_000,
        expiresAtMilliseconds: 1_050,
      });
      expect(freshHitResult).toMatchObject({
        kind: "success",
        status: "fresh",
        loadedAtMilliseconds: 1_000,
        expiresAtMilliseconds: 1_050,
      });
      expect(refreshedResult).toMatchObject({
        kind: "success",
        status: "fresh",
        loadedAtMilliseconds: 1_050,
        expiresAtMilliseconds: 1_100,
      });
      expect(promptSource.loadCount).toBe(2);

      if (refreshedResult.kind !== "success") {
        throw new Error("Expected stale refresh to succeed.");
      }

      expect(resolvePromptCommand(refreshedResult.index, "alpha")).toEqual({
        kind: "not_found",
        command: "alpha",
      });
      expect(resolvePromptCommand(refreshedResult.index, "beta")).toMatchObject({
        kind: "found",
      });
    });
  });

  it("serves stale last-known-good cache when refresh fails", async () => {
    await expectNoNetwork(async () => {
      const clock = mutableClock(1_000);
      const promptSource = new ScriptedPromptSource([
        [validPromptFile("stable", { body: "Apply stable.\n" })],
        new Error("source unavailable"),
      ]);
      const cache = new PromptCache({ promptSource, clock, ttlMilliseconds: 50 });

      await cache.getIndex();
      clock.setNow(1_050);
      const result = await cache.getIndex();

      expect(result).toMatchObject({
        kind: "success",
        status: "stale",
        loadedAtMilliseconds: 1_000,
        expiresAtMilliseconds: 1_050,
      });
      expect(cache.status()).toMatchObject({
        kind: "ready",
        freshness: "stale",
      });

      if (result.kind !== "success") {
        throw new Error("Expected stale last-known-good cache to be served.");
      }

      expect(resolvePromptCommand(result.index, "stable")).toMatchObject({
        kind: "found",
      });
    });
  });

  it("accepts partial valid cache data and fails closed on cold no-cache builds", async () => {
    await expectNoNetwork(async () => {
      const partialCache = new PromptCache({
        promptSource: new ScriptedPromptSource([
          [validPromptFile("safe", { body: "Apply safe.\n" }), invalidPromptFile("invalid-active")],
        ]),
        clock: mutableClock(2_000),
      });
      const coldFailureCache = new PromptCache({
        promptSource: new ScriptedPromptSource([[]]),
        clock: mutableClock(3_000),
      });

      const partialResult = await partialCache.getIndex();
      const coldFailureResult = await coldFailureCache.getIndex();

      expect(partialResult).toMatchObject({
        kind: "success",
        status: "fresh",
      });
      if (partialResult.kind !== "success") {
        throw new Error("Expected partial valid cache build to succeed.");
      }

      expect(resolvePromptCommand(partialResult.index, "safe")).toMatchObject({
        kind: "found",
      });
      expect(resolvePromptCommand(partialResult.index, "invalid-active")).toEqual({
        kind: "not_found",
        command: "invalid-active",
      });
      expect(coldFailureResult).toMatchObject({
        kind: "failure",
        error: {
          code: "PROMPT_CACHE_UNAVAILABLE",
          reason: "no_cache",
        },
      });
    });
  });

  it("excludes invalid/conflicting prompts and keeps source/cache diagnostics out of invocation payloads", async () => {
    await expectNoNetwork(async () => {
      const cache = new PromptCache({
        promptSource: new ScriptedPromptSource([
          [
            validPromptFile("safe", {
              aliases: ["run-safe"],
              body: "Apply safe without exposing cache details.\n",
              title: "Safe Prompt",
            }),
            invalidPromptFile("invalid-active"),
            validPromptFile("conflict-a", {
              aliases: ["shared-alias"],
              body: "Conflict A.\n",
            }),
            validPromptFile("conflict-b", {
              aliases: ["shared-alias"],
              body: "Conflict B.\n",
            }),
          ],
        ]),
        clock: mutableClock(4_000),
      });

      const result = await cache.getIndex();

      expect(result).toMatchObject({
        kind: "success",
        status: "fresh",
      });

      if (result.kind !== "success") {
        throw new Error("Expected cache build to succeed with one safe active command.");
      }

      expect(resolvePromptCommand(result.index, "safe")).toMatchObject({
        kind: "found",
      });
      expect(resolvePromptCommand(result.index, "invalid-active")).toEqual({
        kind: "not_found",
        command: "invalid-active",
      });
      expect(resolvePromptCommand(result.index, "shared-alias")).toMatchObject({
        kind: "conflict",
        command: "shared-alias",
      });

      const useCase = new InvokePromptUseCase(result.index);
      const success = invokePromptLibraryCommand(useCase, { command: "run-safe" });
      const conflict = invokePromptLibraryCommand(useCase, { command: "shared-alias" });

      expect(success.structuredContent).toEqual({
        title: "Safe Prompt",
        lifecycle: "one_shot",
        input_mode: "attached_input",
        prompt_body: "Apply safe without exposing cache details.\n",
      });
      assertNoInvocationDiagnostics(success);
      expect(conflict.isError).toBe(true);
      expect(conflict.structuredContent).toBeUndefined();
      expect(conflict.content?.[0]).toMatchObject({
        type: "text",
        text: expect.stringContaining("error_code: PROMPT_AMBIGUOUS"),
      });
      expect(conflict.content?.[0]).toMatchObject({
        type: "text",
        text: expect.not.stringContaining("prompt_body"),
      });
    });
  });
});

async function expectNoNetwork(run: () => Promise<void>): Promise<void> {
  const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
    throw new Error("Deterministic source/cache tests must not call network fetch.");
  });

  try {
    await run();
    expect(fetchSpy).not.toHaveBeenCalled();
  } finally {
    fetchSpy.mockRestore();
  }
}

function assertNoInvocationDiagnostics(result: CallToolResult): void {
  expect(result).not.toHaveProperty("_meta");

  const structuredContent = asRecord(result.structuredContent);
  expect(Object.keys(structuredContent).sort()).toEqual([
    "input_mode",
    "lifecycle",
    "prompt_body",
    "title",
  ]);

  for (const forbiddenKey of FORBIDDEN_INVOCATION_KEYS) {
    expect(structuredContent).not.toHaveProperty(forbiddenKey);
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  expect(value).toBeTypeOf("object");
  expect(value).not.toBeNull();
  return value as Record<string, unknown>;
}
