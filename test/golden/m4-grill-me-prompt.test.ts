import { readFileSync } from "node:fs";
import { copyFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it, vi } from "vitest";
import { INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME } from "../../src/mcp/inspectPromptLibraryCommandTool.js";
import { INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME } from "../../src/mcp/invokePromptLibraryCommandTool.js";
import { LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME } from "../../src/mcp/listPromptLibraryCommandsTool.js";
import { createLocalPromptLibraryServer } from "../../src/mcp/server.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(testDirectory, "../..");
const goldenPath = resolve(testDirectory, "m4-grill-me-prompt.golden.json");

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

describe("M4.3 grill-me prompt golden contract", () => {
  it("matches the approved local grill-me invoke, alias, inspect, and list payloads", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      throw new Error("M4.3 grill-me golden tests must not call network fetch.");
    });

    try {
      const actual = await buildGrillMeGolden();
      const expected = JSON.parse(readFileSync(goldenPath, "utf8")) as unknown;

      expect(actual).toEqual(expected);
      expect(fetchSpy).not.toHaveBeenCalled();
      assertGrillMeBoundaries(actual);
    } finally {
      fetchSpy.mockRestore();
    }
  });
});

async function buildGrillMeGolden(): Promise<Record<string, unknown>> {
  return withM4PromptClient(async (client) => ({
    invoke_grill_me_success: normalizeToolResult(
      await client.callTool({
        name: INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "grill-me" },
      }),
    ),
    invoke_grill_alias_success: normalizeToolResult(
      await client.callTool({
        name: INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "grill" },
      }),
    ),
    inspect_grill_me_success: normalizeToolResult(
      await client.callTool({
        name: INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "grill-me" },
      }),
    ),
    inspect_grill_alias_success: normalizeToolResult(
      await client.callTool({
        name: INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "grill" },
      }),
    ),
    list_m4_prompts_success: normalizeToolResult(
      await client.callTool({
        name: LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME,
        arguments: {},
      }),
    ),
  }));
}

async function withM4PromptClient<T>(run: (client: Client) => Promise<T>): Promise<T> {
  const repoRoot = await createM4RepoRoot();

  try {
    return await withClient(await createLocalPromptLibraryServer({ repoRoot }), run);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
}

async function createM4RepoRoot(): Promise<string> {
  const repoRoot = await mkdtemp(join(tmpdir(), "ppl-m4-grill-me-"));
  const promptsDirectory = join(repoRoot, "prompts");
  await mkdir(promptsDirectory, { recursive: true });
  await copyFile(
    resolve(repositoryRoot, "prompts", "handoff.md"),
    join(promptsDirectory, "handoff.md"),
  );
  await copyFile(
    resolve(repositoryRoot, "prompts", "grill-me.md"),
    join(promptsDirectory, "grill-me.md"),
  );
  return repoRoot;
}

async function withClient<T>(server: McpServer, run: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({
    name: "m4-grill-me-golden-test",
    version: "0.0.0",
  });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await server.connect(serverTransport);
  await client.connect(clientTransport);

  try {
    return await run(client);
  } finally {
    await client.close();
    await server.close();
  }
}

function normalizeToolResult(result: unknown): Record<string, unknown> {
  const resultRecord = asRecord(result);
  assertAllowedToolResultKeys(resultRecord);

  return {
    isError: resultRecord.isError === true,
    structuredContent: resultRecord.structuredContent ?? null,
    content: resultRecord.content,
  };
}

function assertGrillMeBoundaries(golden: Record<string, unknown>): void {
  const invokeSuccess = asRecord(golden.invoke_grill_me_success);
  const aliasInvokeSuccess = asRecord(golden.invoke_grill_alias_success);
  const invocationPayload = asRecord(invokeSuccess.structuredContent);

  expect(aliasInvokeSuccess.structuredContent).toEqual(invokeSuccess.structuredContent);
  expect(Object.keys(invocationPayload).sort()).toEqual([
    "input_mode",
    "lifecycle",
    "prompt_body",
    "title",
  ]);
  for (const forbiddenKey of FORBIDDEN_INVOCATION_KEYS) {
    expect(invocationPayload).not.toHaveProperty(forbiddenKey);
  }

  const listSuccess = asRecord(golden.list_m4_prompts_success);
  const listPayload = asRecord(listSuccess.structuredContent);
  const commands = asCommandSummaries(listPayload.commands);
  expect(commands.filter((command) => command.command === "grill-me")).toHaveLength(1);
  expect(commands.some((command) => command.command === "grill")).toBe(false);

  const listSerialized = JSON.stringify(listSuccess);
  expect(listSerialized).not.toContain("Ask exactly one meaningful question");
  expect(listSerialized).not.toContain("Do not produce the final artifact");
}

function assertAllowedToolResultKeys(result: Record<string, unknown>): void {
  expect(Object.keys(result).sort()).toEqual(expect.arrayContaining(["content"]));

  for (const key of Object.keys(result)) {
    expect(["content", "isError", "structuredContent"]).toContain(key);
  }
}

function asCommandSummaries(value: unknown): Record<string, unknown>[] {
  expect(value).toEqual(expect.any(Array));
  return value as Record<string, unknown>[];
}

function asRecord(value: unknown): Record<string, unknown> {
  expect(value).toBeTypeOf("object");
  expect(value).not.toBeNull();
  return value as Record<string, unknown>;
}
