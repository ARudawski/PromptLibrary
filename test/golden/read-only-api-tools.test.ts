import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it, vi } from "vitest";
import { ListPromptsUseCase } from "../../src/application/index.js";
import type { PromptIndex } from "../../src/cache/index.js";
import { INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME } from "../../src/mcp/inspectPromptLibraryCommandTool.js";
import { INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME } from "../../src/mcp/invokePromptLibraryCommandTool.js";
import { LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME } from "../../src/mcp/listPromptLibraryCommandsTool.js";
import { createPromptLibraryServer } from "../../src/mcp/server.js";

const goldenPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "read-only-api-tools.golden.json",
);

const FORBIDDEN_LIST_KEYS = [
  "prompt_body",
  "slug",
  "status",
  "schema_version",
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

describe("read-only API tool golden contract", () => {
  it("matches the approved invoke, inspect, and list tool payloads without network", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      throw new Error("Read-only API golden tests must not call network fetch.");
    });

    try {
      const actual = await buildReadOnlyApiGolden();
      const expected = JSON.parse(readFileSync(goldenPath, "utf8")) as unknown;

      expect(actual).toEqual(expected);
      expect(fetchSpy).not.toHaveBeenCalled();
      assertReadOnlyApiBoundaries(actual);
    } finally {
      fetchSpy.mockRestore();
    }
  });
});

async function buildReadOnlyApiGolden(): Promise<Record<string, unknown>> {
  return {
    invoke_active_success: await withDefaultClient(async (client) =>
      normalizeToolResult(
        await client.callTool({
          name: INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
          arguments: { command: "active-basic", attached_input: "Some input." },
        }),
      ),
    ),
    invoke_unknown_failure: await withDefaultClient(async (client) => {
      await client.listTools();

      return normalizeToolResult(
        await client.callTool({
          name: INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
          arguments: { command: "active" },
        }),
      );
    }),
    invoke_draft_failure: await withDefaultClient(async (client) => {
      await client.listTools();

      return normalizeToolResult(
        await client.callTool({
          name: INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
          arguments: { command: "draft-valid" },
        }),
      );
    }),
    invoke_ambiguous_failure: await withClient(await createAmbiguousServer(), async (client) => {
      await client.listTools();

      return normalizeToolResult(
        await client.callTool({
          name: INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
          arguments: { command: "conflict-target" },
        }),
      );
    }),
    inspect_active_success: await withDefaultClient(async (client) =>
      normalizeToolResult(
        await client.callTool({
          name: INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
          arguments: { command: "alias-basic" },
        }),
      ),
    ),
    inspect_unknown_failure: await withDefaultClient(async (client) => {
      await client.listTools();

      return normalizeToolResult(
        await client.callTool({
          name: INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
          arguments: { command: "active" },
        }),
      );
    }),
    inspect_draft_failure: await withDefaultClient(async (client) => {
      await client.listTools();

      return normalizeToolResult(
        await client.callTool({
          name: INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
          arguments: { command: "draft-valid" },
        }),
      );
    }),
    inspect_ambiguous_failure: await withClient(await createAmbiguousServer(), async (client) => {
      await client.listTools();

      return normalizeToolResult(
        await client.callTool({
          name: INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
          arguments: { command: "conflict-target" },
        }),
      );
    }),
    list_active_success: await withDefaultClient(async (client) =>
      normalizeToolResult(
        await client.callTool({
          name: LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME,
          arguments: {},
        }),
      ),
    ),
    list_failure: await withClient(
      await createPromptLibraryServer({ listUseCase: invalidListUseCase() }),
      async (client) => {
        await client.listTools();

        return normalizeToolResult(
          await client.callTool({
            name: LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME,
            arguments: {},
          }),
        );
      },
    ),
  };
}

async function createAmbiguousServer(): Promise<McpServer> {
  return createPromptLibraryServer({
    promptPaths: [
      "test/fixtures/prompts-conflicts/alias-slug-conflict-a.md",
      "test/fixtures/prompts-conflicts/alias-slug-conflict-b.md",
    ],
  });
}

function invalidListUseCase(): ListPromptsUseCase {
  const invalidIndex = {
    activeCommands: ["ghost-command"],
    issues: [],
    activeByCommand: new Map(),
    conflictedCommands: new Map(),
    notInvokableCommands: new Set(),
  } satisfies PromptIndex;

  return new ListPromptsUseCase(invalidIndex);
}

async function withDefaultClient<T>(run: (client: Client) => Promise<T>): Promise<T> {
  return withClient(await createPromptLibraryServer(), run);
}

async function withClient<T>(server: McpServer, run: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({
    name: "slice-3-5-golden-test",
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

function assertReadOnlyApiBoundaries(golden: Record<string, unknown>): void {
  const listSuccess = asRecord(golden.list_active_success);
  const listStructuredContent = asRecord(listSuccess.structuredContent);
  const commands = listStructuredContent.commands;
  expect(commands).toEqual(expect.any(Array));

  const serializedList = JSON.stringify(listSuccess);
  expect(serializedList).not.toContain("Apply the Active Basic fixture prompt");
  expect(serializedList).not.toContain("Use this fixture prompt");

  for (const summary of commands as readonly unknown[]) {
    const summaryRecord = asRecord(summary);
    expect(summaryRecord.command).not.toBe("draft-valid");
    expect(summaryRecord.command).not.toBe("alias-basic");

    for (const forbiddenKey of FORBIDDEN_LIST_KEYS) {
      expect(summaryRecord).not.toHaveProperty(forbiddenKey);
    }
  }

  for (const key of [
    "invoke_unknown_failure",
    "invoke_draft_failure",
    "invoke_ambiguous_failure",
    "inspect_unknown_failure",
    "inspect_draft_failure",
    "inspect_ambiguous_failure",
    "list_failure",
  ] as const) {
    const failure = asRecord(golden[key]);
    expect(failure.isError).toBe(true);
    expect(failure.structuredContent).toBeNull();
    expect(JSON.stringify(failure)).not.toContain("prompt_body");
  }
}

function assertAllowedToolResultKeys(result: Record<string, unknown>): void {
  expect(Object.keys(result).sort()).toEqual(expect.arrayContaining(["content"]));

  for (const key of Object.keys(result)) {
    expect(["content", "isError", "structuredContent"]).toContain(key);
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  expect(value).toBeTypeOf("object");
  expect(value).not.toBeNull();
  return value as Record<string, unknown>;
}
