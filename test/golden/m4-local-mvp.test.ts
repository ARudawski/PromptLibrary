import { createHash } from "node:crypto";
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

const testDirectory = dirname(fileURLToPath(import.meta.url));
const goldenPath = resolve(testDirectory, "m4-local-mvp.golden.json");

const CANONICAL_COMMANDS = ["grill-me", "handoff", "spec-prompt-creator"] as const;
const ALIASES = ["grill", "spec-creator", "prompt-creator"] as const;

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

describe("M4.5 local MVP prompt catalog golden contract", () => {
  it("matches the three-prompt local MVP invoke, inspect, alias, and list payloads", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      throw new Error("M4.5 local MVP golden tests must not call network fetch.");
    });

    try {
      const actual = await buildLocalMvpGolden();
      const expected = JSON.parse(readFileSync(goldenPath, "utf8")) as unknown;

      expect(actual).toEqual(expected);
      expect(fetchSpy).not.toHaveBeenCalled();
      assertLocalMvpBoundaries(actual);
    } finally {
      fetchSpy.mockRestore();
    }
  });
});

async function buildLocalMvpGolden(): Promise<Record<string, unknown>> {
  return withLocalPromptClient(async (client) => {
    const invokeResults = await collectToolResults(
      client,
      INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
      [...CANONICAL_COMMANDS, ...ALIASES],
    );
    const inspectResults = await collectToolResults(
      client,
      INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
      [...CANONICAL_COMMANDS, ...ALIASES],
    );
    const listResult = normalizeToolResult(
      await client.callTool({
        name: LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME,
        arguments: {},
      }),
    );

    return {
      invoke: invokeResults,
      inspect: inspectResults,
      list: listResult,
    };
  });
}

async function collectToolResults(
  client: Client,
  toolName: string,
  commands: readonly string[],
): Promise<Record<string, unknown>> {
  const results: Record<string, unknown> = {};

  for (const command of commands) {
    results[command] = normalizeToolResult(
      await client.callTool({
        name: toolName,
        arguments: { command },
      }),
    );
  }

  return results;
}

async function withLocalPromptClient<T>(run: (client: Client) => Promise<T>): Promise<T> {
  return withClient(await createLocalPromptLibraryServer(), run);
}

async function withClient<T>(server: McpServer, run: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({
    name: "m4-local-mvp-golden-test",
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
    structuredContent: normalizeStructuredContent(resultRecord.structuredContent),
    content: resultRecord.content,
  };
}

function normalizeStructuredContent(value: unknown): unknown {
  if (value === undefined) {
    return null;
  }

  const structuredContent = asRecord(value);

  if ("prompt_body" in structuredContent && typeof structuredContent.prompt_body === "string") {
    return {
      ...structuredContent,
      prompt_body_sha256: sha256(structuredContent.prompt_body),
      prompt_body_length: structuredContent.prompt_body.length,
      prompt_body: "[sha256-normalized]",
    };
  }

  return structuredContent;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function assertLocalMvpBoundaries(golden: Record<string, unknown>): void {
  const invokeResults = asRecord(golden.invoke);
  const inspectResults = asRecord(golden.inspect);
  const listResult = asRecord(golden.list);
  const listPayload = asRecord(listResult.structuredContent);
  const commands = asCommandSummaries(listPayload.commands);

  expect(commands.map((command) => command.command)).toEqual([...CANONICAL_COMMANDS]);
  expect(commands.some((command) => command.command === "grill")).toBe(false);
  expect(commands.some((command) => command.command === "spec-creator")).toBe(false);
  expect(commands.some((command) => command.command === "prompt-creator")).toBe(false);

  for (const command of CANONICAL_COMMANDS) {
    const invokeResult = asRecord(invokeResults[command]);
    const invocationPayload = asRecord(invokeResult.structuredContent);
    expect(Object.keys(invocationPayload).sort()).toEqual([
      "input_mode",
      "lifecycle",
      "prompt_body",
      "prompt_body_length",
      "prompt_body_sha256",
      "title",
    ]);

    for (const forbiddenKey of FORBIDDEN_INVOCATION_KEYS) {
      expect(invocationPayload).not.toHaveProperty(forbiddenKey);
    }

    const inspectResult = asRecord(inspectResults[command]);
    expect(inspectResult.structuredContent).toMatchObject({
      inspection_only: true,
      no_prompt_invoked: true,
    });
  }

  expect(asRecord(invokeResults.grill).structuredContent).toEqual(
    asRecord(invokeResults["grill-me"]).structuredContent,
  );
  expect(asRecord(invokeResults["spec-creator"]).structuredContent).toEqual(
    asRecord(invokeResults["spec-prompt-creator"]).structuredContent,
  );
  expect(asRecord(invokeResults["prompt-creator"]).structuredContent).toEqual(
    asRecord(invokeResults["spec-prompt-creator"]).structuredContent,
  );
  expect(asRecord(inspectResults.grill).structuredContent).toEqual(
    asRecord(inspectResults["grill-me"]).structuredContent,
  );
  expect(asRecord(inspectResults["spec-creator"]).structuredContent).toEqual(
    asRecord(inspectResults["spec-prompt-creator"]).structuredContent,
  );
  expect(asRecord(inspectResults["prompt-creator"]).structuredContent).toEqual(
    asRecord(inspectResults["spec-prompt-creator"]).structuredContent,
  );

  const serializedList = JSON.stringify(listResult);
  expect(serializedList).not.toContain("Produce one concise handoff artifact");
  expect(serializedList).not.toContain("Ask exactly one meaningful question");
  expect(serializedList).not.toContain("an ongoing chat mode");
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
