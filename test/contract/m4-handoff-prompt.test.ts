import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME } from "../../src/mcp/inspectPromptLibraryCommandTool.js";
import { INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME } from "../../src/mcp/invokePromptLibraryCommandTool.js";
import { LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME } from "../../src/mcp/listPromptLibraryCommandsTool.js";
import { createLocalPromptLibraryServer } from "../../src/mcp/server.js";

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

describe("M4.2 handoff prompt local runtime contract", () => {
  it("invokes, inspects, and lists the active handoff prompt from prompts/*.md", async () => {
    await withLocalPromptClient(async (client) => {
      const invokeResult = await client.callTool({
        name: INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "handoff" },
      });
      const inspectResult = await client.callTool({
        name: INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "handoff" },
      });
      const listResult = await client.callTool({
        name: LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME,
        arguments: {},
      });

      expect(invokeResult.isError).not.toBe(true);
      expect(invokeResult.structuredContent).toMatchObject({
        title: "Handoff",
        lifecycle: "one_shot",
        input_mode: "conversation_context",
      });
      expect(Object.keys(asRecord(invokeResult.structuredContent)).sort()).toEqual([
        "input_mode",
        "lifecycle",
        "prompt_body",
        "title",
      ]);
      for (const forbiddenKey of FORBIDDEN_INVOCATION_KEYS) {
        expect(invokeResult.structuredContent).not.toHaveProperty(forbiddenKey);
      }

      const invocationPromptBody = asRecord(invokeResult.structuredContent).prompt_body;
      expect(invocationPromptBody).toContain(
        "Produce one concise handoff artifact from the current conversation context.",
      );
      expect(invocationPromptBody).toContain("Do not establish a persistent mode");
      expect(invocationPromptBody).toContain("Recommended next action");

      expect(inspectResult.isError).not.toBe(true);
      expect(inspectResult.structuredContent).toMatchObject({
        ok: true,
        type: "prompt_inspection",
        inspection_only: true,
        no_prompt_invoked: true,
        metadata: {
          schema_version: "1",
          slug: "handoff",
          title: "Handoff",
          description: "Produce a concise handoff from the current conversation context.",
          aliases: [],
          lifecycle: "one_shot",
          input_mode: "conversation_context",
          status: "active",
        },
      });

      expect(listResult.isError).not.toBe(true);
      const commands = asRecord(listResult.structuredContent).commands;
      expect(commands).toEqual(expect.any(Array));
      expect(commands).toContainEqual({
        command: "handoff",
        title: "Handoff",
        description: "Produce a concise handoff from the current conversation context.",
        aliases: [],
        lifecycle: "one_shot",
        input_mode: "conversation_context",
      });
      expect(JSON.stringify(listResult)).not.toContain("Produce one concise handoff artifact");
    });
  });
});

async function withLocalPromptClient<T>(run: (client: Client) => Promise<T>): Promise<T> {
  return withClient(await createLocalPromptLibraryServer(), run);
}

async function withClient<T>(server: McpServer, run: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({
    name: "m4-handoff-contract-test",
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

function asRecord(value: unknown): Record<string, unknown> {
  expect(value).toBeTypeOf("object");
  expect(value).not.toBeNull();
  return value as Record<string, unknown>;
}
