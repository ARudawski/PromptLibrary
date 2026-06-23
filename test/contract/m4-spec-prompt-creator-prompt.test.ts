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

describe("M4.4 spec-prompt-creator prompt local runtime contract", () => {
  it("invokes, inspects, and lists spec-prompt-creator once with its aliases", async () => {
    await withLocalPromptClient(async (client) => {
      const canonicalInvokeResult = await client.callTool({
        name: INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "spec-prompt-creator" },
      });
      const specCreatorAliasInvokeResult = await client.callTool({
        name: INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "spec-creator" },
      });
      const promptCreatorAliasInvokeResult = await client.callTool({
        name: INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "prompt-creator" },
      });
      const inspectResult = await client.callTool({
        name: INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "spec-prompt-creator" },
      });
      const specCreatorAliasInspectResult = await client.callTool({
        name: INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "spec-creator" },
      });
      const promptCreatorAliasInspectResult = await client.callTool({
        name: INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "prompt-creator" },
      });
      const listResult = await client.callTool({
        name: LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME,
        arguments: {},
      });

      expect(canonicalInvokeResult.isError).not.toBe(true);
      expect(canonicalInvokeResult.structuredContent).toMatchObject({
        title: "Spec & Prompt Creator",
        lifecycle: "persistent_mode",
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

      expect(specCreatorAliasInvokeResult.isError).not.toBe(true);
      expect(promptCreatorAliasInvokeResult.isError).not.toBe(true);
      expect(specCreatorAliasInvokeResult.structuredContent).toEqual(
        canonicalInvokeResult.structuredContent,
      );
      expect(promptCreatorAliasInvokeResult.structuredContent).toEqual(
        canonicalInvokeResult.structuredContent,
      );

      const invocationPromptBody = asRecord(canonicalInvokeResult.structuredContent).prompt_body;
      expect(invocationPromptBody).toContain("an ongoing chat mode for turning rough requests");
      expect(invocationPromptBody).toContain(
        "Stay in this mode across the conversation until the user clearly changes direction.",
      );
      expect(invocationPromptBody).toContain(
        "do not claim that the connector stores, activates, pauses, resumes, or ends a mode",
      );
      expect(invocationPromptBody).toContain("coding-agent prompt");

      expect(inspectResult.isError).not.toBe(true);
      expect(inspectResult.structuredContent).toMatchObject({
        ok: true,
        type: "prompt_inspection",
        inspection_only: true,
        no_prompt_invoked: true,
        metadata: {
          schema_version: "1",
          slug: "spec-prompt-creator",
          title: "Spec & Prompt Creator",
          description:
            "Establish a chat mode for turning rough requests into precise specs and coding-agent prompts.",
          aliases: ["spec-creator", "prompt-creator"],
          lifecycle: "persistent_mode",
          input_mode: "either",
          status: "active",
        },
      });
      expect(specCreatorAliasInspectResult.structuredContent).toEqual(
        inspectResult.structuredContent,
      );
      expect(promptCreatorAliasInspectResult.structuredContent).toEqual(
        inspectResult.structuredContent,
      );

      expect(listResult.isError).not.toBe(true);
      const commands = asCommandSummaries(asRecord(listResult.structuredContent).commands);
      expect(commands.filter((command) => command.command === "spec-prompt-creator")).toEqual([
        {
          command: "spec-prompt-creator",
          title: "Spec & Prompt Creator",
          description:
            "Establish a chat mode for turning rough requests into precise specs and coding-agent prompts.",
          aliases: ["spec-creator", "prompt-creator"],
          lifecycle: "persistent_mode",
          input_mode: "either",
        },
      ]);
      expect(commands.some((command) => command.command === "spec-creator")).toBe(false);
      expect(commands.some((command) => command.command === "prompt-creator")).toBe(false);
      expect(commands).toContainEqual({
        command: "grill-me",
        title: "Grill Me",
        description:
          "Interview the user one question at a time until intent and constraints are clear.",
        aliases: ["grill"],
        lifecycle: "interactive_workflow",
        input_mode: "either",
      });
      expect(commands).toContainEqual({
        command: "handoff",
        title: "Handoff",
        description: "Produce a concise handoff from the current conversation context.",
        aliases: [],
        lifecycle: "one_shot",
        input_mode: "conversation_context",
      });
      expect(JSON.stringify(listResult)).not.toContain("an ongoing chat mode");
    });
  });
});

async function withLocalPromptClient<T>(run: (client: Client) => Promise<T>): Promise<T> {
  return withClient(await createLocalPromptLibraryServer(), run);
}

async function withClient<T>(server: McpServer, run: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({
    name: "m4-spec-prompt-creator-contract-test",
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
