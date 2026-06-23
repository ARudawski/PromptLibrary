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

describe("M4.3 grill-me prompt local runtime contract", () => {
  it("invokes, inspects, and lists grill-me once with its grill alias", async () => {
    await withLocalPromptClient(async (client) => {
      const canonicalInvokeResult = await client.callTool({
        name: INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "grill-me" },
      });
      const aliasInvokeResult = await client.callTool({
        name: INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "grill" },
      });
      const inspectResult = await client.callTool({
        name: INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "grill-me" },
      });
      const aliasInspectResult = await client.callTool({
        name: INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "grill" },
      });
      const listResult = await client.callTool({
        name: LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME,
        arguments: {},
      });

      expect(canonicalInvokeResult.isError).not.toBe(true);
      expect(canonicalInvokeResult.structuredContent).toMatchObject({
        title: "Grill Me",
        lifecycle: "interactive_workflow",
        input_mode: "either",
      });
      expect(Object.keys(asRecord(canonicalInvokeResult.structuredContent)).sort()).toEqual([
        "input_mode",
        "lifecycle",
        "prompt_body",
        "title",
      ]);
      for (const forbiddenKey of FORBIDDEN_INVOCATION_KEYS) {
        expect(canonicalInvokeResult.structuredContent).not.toHaveProperty(forbiddenKey);
      }

      expect(aliasInvokeResult.isError).not.toBe(true);
      expect(aliasInvokeResult.structuredContent).toEqual(canonicalInvokeResult.structuredContent);

      const invocationPromptBody = asRecord(canonicalInvokeResult.structuredContent).prompt_body;
      expect(invocationPromptBody).toContain("Ask exactly one meaningful question at a time.");
      expect(invocationPromptBody).toContain("Do not produce the final artifact");
      expect(invocationPromptBody).toContain(
        "Do not maintain or imply connector-managed workflow state",
      );

      expect(inspectResult.isError).not.toBe(true);
      expect(inspectResult.structuredContent).toMatchObject({
        ok: true,
        type: "prompt_inspection",
        inspection_only: true,
        no_prompt_invoked: true,
        metadata: {
          schema_version: "1",
          slug: "grill-me",
          title: "Grill Me",
          description:
            "Interview the user one question at a time until intent and constraints are clear.",
          aliases: ["grill"],
          lifecycle: "interactive_workflow",
          input_mode: "either",
          status: "active",
        },
      });
      expect(aliasInspectResult.structuredContent).toEqual(inspectResult.structuredContent);

      expect(listResult.isError).not.toBe(true);
      const commands = asCommandSummaries(asRecord(listResult.structuredContent).commands);
      expect(commands.filter((command) => command.command === "grill-me")).toEqual([
        {
          command: "grill-me",
          title: "Grill Me",
          description:
            "Interview the user one question at a time until intent and constraints are clear.",
          aliases: ["grill"],
          lifecycle: "interactive_workflow",
          input_mode: "either",
        },
      ]);
      expect(commands.some((command) => command.command === "grill")).toBe(false);
      expect(commands).toContainEqual({
        command: "handoff",
        title: "Handoff",
        description: "Produce a concise handoff from the current conversation context.",
        aliases: [],
        lifecycle: "one_shot",
        input_mode: "conversation_context",
      });
      expect(JSON.stringify(listResult)).not.toContain("Ask exactly one meaningful question");
    });
  });
});

async function withLocalPromptClient<T>(run: (client: Client) => Promise<T>): Promise<T> {
  return withClient(await createLocalPromptLibraryServer(), run);
}

async function withClient<T>(server: McpServer, run: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({
    name: "m4-grill-me-contract-test",
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

function asCommandSummaries(value: unknown): Record<string, unknown>[] {
  expect(value).toEqual(expect.any(Array));
  return value as Record<string, unknown>[];
}

function asRecord(value: unknown): Record<string, unknown> {
  expect(value).toBeTypeOf("object");
  expect(value).not.toBeNull();
  return value as Record<string, unknown>;
}
