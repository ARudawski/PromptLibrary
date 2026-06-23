import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it, vi } from "vitest";
import { INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME } from "../../src/mcp/inspectPromptLibraryCommandTool.js";
import { INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME } from "../../src/mcp/invokePromptLibraryCommandTool.js";
import { LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME } from "../../src/mcp/listPromptLibraryCommandsTool.js";
import { createLocalPromptLibraryServer } from "../../src/mcp/server.js";

const goldenPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "m4-handoff-prompt.golden.json",
);

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

describe("M4.2 handoff prompt golden contract", () => {
  it("matches the approved local handoff invoke, inspect, and list payloads", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      throw new Error("M4.2 handoff golden tests must not call network fetch.");
    });

    try {
      const actual = await buildHandoffGolden();
      const expected = JSON.parse(readFileSync(goldenPath, "utf8")) as unknown;

      expect(actual).toEqual(expected);
      expect(fetchSpy).not.toHaveBeenCalled();
      assertHandoffBoundaries(actual);
    } finally {
      fetchSpy.mockRestore();
    }
  });
});

async function buildHandoffGolden(): Promise<Record<string, unknown>> {
  return withLocalPromptClient(async (client) => ({
    invoke_handoff_success: normalizeToolResult(
      await client.callTool({
        name: INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "handoff" },
      }),
    ),
    inspect_handoff_success: normalizeToolResult(
      await client.callTool({
        name: INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "handoff" },
      }),
    ),
    list_handoff_success: normalizeToolResult(
      await client.callTool({
        name: LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME,
        arguments: {},
      }),
    ),
  }));
}

async function withLocalPromptClient<T>(run: (client: Client) => Promise<T>): Promise<T> {
  return withClient(await createLocalPromptLibraryServer(), run);
}

async function withClient<T>(server: McpServer, run: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({
    name: "m4-handoff-golden-test",
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

function assertHandoffBoundaries(golden: Record<string, unknown>): void {
  const invokeSuccess = asRecord(golden.invoke_handoff_success);
  const invocationPayload = asRecord(invokeSuccess.structuredContent);

  expect(Object.keys(invocationPayload).sort()).toEqual([
    "input_mode",
    "lifecycle",
    "prompt_body",
    "title",
  ]);
  for (const forbiddenKey of FORBIDDEN_INVOCATION_KEYS) {
    expect(invocationPayload).not.toHaveProperty(forbiddenKey);
  }

  const listSuccess = asRecord(golden.list_handoff_success);
  const listSerialized = JSON.stringify(listSuccess);
  expect(listSerialized).not.toContain("Produce one concise handoff artifact");
  expect(listSerialized).not.toContain("Do not establish a persistent mode");
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
