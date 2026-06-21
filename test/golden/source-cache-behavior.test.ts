import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { describe, expect, it, vi } from "vitest";
import { InvokePromptUseCase } from "../../src/application/index.js";
import type { PromptCommandResolution, PromptIndex } from "../../src/cache/index.js";
import {
  PromptCache,
  type PromptCacheGetIndexResult,
  resolvePromptCommand,
} from "../../src/cache/index.js";
import { invokePromptLibraryCommand } from "../../src/mcp/invokePromptLibraryCommandTool.js";
import {
  invalidPromptFile,
  mutableClock,
  ScriptedPromptSource,
  validPromptFile,
} from "../helpers/sourceCacheTestHarness.js";

const goldenPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "source-cache-behavior.golden.json",
);

describe("source/cache golden contract", () => {
  it("matches the approved source/cache safety payloads without network", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      throw new Error("Golden source/cache tests must not call network fetch.");
    });

    try {
      const actual = await buildSourceCacheGolden();
      const expected = JSON.parse(readFileSync(goldenPath, "utf8")) as unknown;

      expect(actual).toEqual(expected);
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });
});

async function buildSourceCacheGolden(): Promise<Record<string, unknown>> {
  const freshClock = mutableClock(1_000);
  const freshCache = new PromptCache({
    promptSource: new ScriptedPromptSource([
      [
        validPromptFile("alpha", {
          aliases: ["alpha-alias"],
          body: "Apply alpha.\n",
        }),
      ],
      [validPromptFile("beta", { body: "Apply beta.\n" })],
    ]),
    clock: freshClock,
    ttlMilliseconds: 50,
  });
  const freshResult = await freshCache.getIndex();
  freshClock.setNow(1_050);
  const staleRefreshResult = await freshCache.getIndex();

  const failedRefreshClock = mutableClock(2_000);
  const failedRefreshCache = new PromptCache({
    promptSource: new ScriptedPromptSource([
      [validPromptFile("stable", { body: "Apply stable.\n" })],
      new Error("source unavailable"),
    ]),
    clock: failedRefreshClock,
    ttlMilliseconds: 50,
  });
  await failedRefreshCache.getIndex();
  failedRefreshClock.setNow(2_050);
  const failedRefreshResult = await failedRefreshCache.getIndex();

  const partialCache = new PromptCache({
    promptSource: new ScriptedPromptSource([
      [validPromptFile("safe", { body: "Apply safe.\n" }), invalidPromptFile("invalid-active")],
    ]),
    clock: mutableClock(3_000),
    ttlMilliseconds: 50,
  });
  const partialResult = await partialCache.getIndex();

  const coldFailureCache = new PromptCache({
    promptSource: new ScriptedPromptSource([[]]),
    clock: mutableClock(4_000),
    ttlMilliseconds: 50,
  });
  const coldFailureResult = await coldFailureCache.getIndex();

  const conflictCache = new PromptCache({
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
    clock: mutableClock(5_000),
    ttlMilliseconds: 50,
  });
  const conflictResult = await conflictCache.getIndex();

  if (conflictResult.kind !== "success") {
    throw new Error("Expected conflict scenario to retain the unrelated safe command.");
  }

  const useCase = new InvokePromptUseCase(conflictResult.index);
  const invocationResult = invokePromptLibraryCommand(useCase, { command: "run-safe" });
  const conflictInvocationResult = invokePromptLibraryCommand(useCase, {
    command: "shared-alias",
  });

  return {
    fresh_cache: {
      cache: normalizeCacheResult(freshResult),
      commands:
        freshResult.kind === "success"
          ? {
              alpha: normalizeResolution(resolvePromptCommand(freshResult.index, "alpha")),
              "alpha-alias": normalizeResolution(
                resolvePromptCommand(freshResult.index, "alpha-alias"),
              ),
              beta: normalizeResolution(resolvePromptCommand(freshResult.index, "beta")),
            }
          : {},
    },
    stale_refresh_success: {
      cache: normalizeCacheResult(staleRefreshResult),
      commands:
        staleRefreshResult.kind === "success"
          ? {
              alpha: normalizeResolution(resolvePromptCommand(staleRefreshResult.index, "alpha")),
              beta: normalizeResolution(resolvePromptCommand(staleRefreshResult.index, "beta")),
            }
          : {},
    },
    failed_refresh_preserves_lkg: {
      cache: normalizeCacheResult(failedRefreshResult),
      commands:
        failedRefreshResult.kind === "success"
          ? {
              stable: normalizeResolution(
                resolvePromptCommand(failedRefreshResult.index, "stable"),
              ),
            }
          : {},
    },
    partial_valid_cache: {
      cache: normalizeCacheResult(partialResult),
      commands:
        partialResult.kind === "success"
          ? {
              safe: normalizeResolution(resolvePromptCommand(partialResult.index, "safe")),
              "invalid-active": normalizeResolution(
                resolvePromptCommand(partialResult.index, "invalid-active"),
              ),
            }
          : {},
    },
    cold_cache_failure: {
      cache: normalizeCacheResult(coldFailureResult),
    },
    invalid_conflicting_prompt_exclusion: {
      cache: normalizeCacheResult(conflictResult),
      commands: {
        safe: normalizeResolution(resolvePromptCommand(conflictResult.index, "safe")),
        "invalid-active": normalizeResolution(
          resolvePromptCommand(conflictResult.index, "invalid-active"),
        ),
        "shared-alias": normalizeResolution(
          resolvePromptCommand(conflictResult.index, "shared-alias"),
        ),
      },
      invocation_payload: normalizeToolResult(invocationResult),
      conflict_invocation: normalizeToolResult(conflictInvocationResult),
    },
  };
}

function normalizeCacheResult(result: PromptCacheGetIndexResult): Record<string, unknown> {
  if (result.kind === "failure") {
    return {
      kind: "failure",
      error: {
        code: result.error.code,
        reason: result.error.reason,
        message: result.error.message,
      },
    };
  }

  return {
    kind: "success",
    status: result.status,
    loadedAtMilliseconds: result.loadedAtMilliseconds,
    expiresAtMilliseconds: result.expiresAtMilliseconds,
    index: normalizeIndex(result.index),
  };
}

function normalizeIndex(index: PromptIndex): Record<string, unknown> {
  return {
    activeCommands: [...index.activeCommands],
    issues: index.issues.map((issue) => ({
      code: issue.code,
      command: issue.command,
      promptSlugs: issue.promptSlugs,
    })),
  };
}

function normalizeResolution(resolution: PromptCommandResolution): Record<string, unknown> {
  if (resolution.kind === "found") {
    return {
      kind: "found",
      title: resolution.prompt.metadata.title,
    };
  }

  if (resolution.kind === "conflict") {
    return {
      kind: "conflict",
      command: resolution.command,
      issueCodes: resolution.issues.map((issue) => issue.code),
    };
  }

  return {
    kind: resolution.kind,
    command: resolution.command,
  };
}

function normalizeToolResult(result: CallToolResult): Record<string, unknown> {
  return {
    isError: result.isError === true,
    structuredContent: result.structuredContent ?? null,
    content: result.content,
  };
}
