import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME } from "../../src/mcp/inspectPromptLibraryCommandTool.js";
import { INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME } from "../../src/mcp/invokePromptLibraryCommandTool.js";
import { LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME } from "../../src/mcp/listPromptLibraryCommandsTool.js";
import { createLocalPromptLibraryServer } from "../../src/mcp/server.js";

const MVP_COMMANDS = [
  {
    command: "grill-me",
    title: "Grill Me",
    lifecycle: "interactive_workflow",
    input_mode: "either",
    aliases: ["grill"],
    promptBodyMarkers: [
      "Ask exactly one meaningful question at a time.",
      "Do not maintain or imply connector-managed workflow state",
    ],
  },
  {
    command: "handoff",
    title: "Handoff",
    lifecycle: "one_shot",
    input_mode: "conversation_context",
    aliases: [],
    promptBodyMarkers: [
      "Produce one concise handoff artifact from the current conversation context.",
      "Do not establish a persistent mode",
    ],
  },
  {
    command: "spec-prompt-creator",
    title: "Spec & Prompt Creator",
    lifecycle: "persistent_mode",
    input_mode: "either",
    aliases: ["spec-creator", "prompt-creator"],
    promptBodyMarkers: [
      "an ongoing chat mode for turning rough requests",
      "do not claim that the connector stores, activates, pauses, resumes, or ends a mode",
    ],
  },
] as const;

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

describe("M4.5 local MVP prompt catalog contract", () => {
  it("invokes, inspects, and lists exactly the three active MVP prompts", async () => {
    await withLocalPromptClient(async (client) => {
      const listResult = await client.callTool({
        name: LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME,
        arguments: {},
      });

      expect(listResult.isError).not.toBe(true);
      expect(listResult.structuredContent).toMatchObject({
        ok: true,
        type: "prompt_command_list",
      });

      const commands = asCommandSummaries(asRecord(listResult.structuredContent).commands);
      expect(commands.map((command) => command.command)).toEqual(
        MVP_COMMANDS.map((command) => command.command),
      );

      for (const summary of commands) {
        expect(Object.keys(summary).sort()).toEqual([
          "aliases",
          "command",
          "description",
          "input_mode",
          "lifecycle",
          "title",
        ]);
        for (const forbiddenKey of FORBIDDEN_LIST_KEYS) {
          expect(summary).not.toHaveProperty(forbiddenKey);
        }
      }

      const listedCommandNames = new Set(commands.map((command) => command.command));

      for (const mvpCommand of MVP_COMMANDS) {
        expect(commands).toContainEqual(
          expect.objectContaining({
            command: mvpCommand.command,
            title: mvpCommand.title,
            aliases: [...mvpCommand.aliases],
            lifecycle: mvpCommand.lifecycle,
            input_mode: mvpCommand.input_mode,
          }),
        );

        for (const alias of mvpCommand.aliases) {
          expect(listedCommandNames.has(alias)).toBe(false);
        }

        const canonicalInvoke = await client.callTool({
          name: INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
          arguments: { command: mvpCommand.command },
        });
        expect(canonicalInvoke.isError).not.toBe(true);
        expect(canonicalInvoke.structuredContent).toMatchObject({
          title: mvpCommand.title,
          lifecycle: mvpCommand.lifecycle,
          input_mode: mvpCommand.input_mode,
        });

        const invocationPayload = asRecord(canonicalInvoke.structuredContent);
        expect(Object.keys(invocationPayload).sort()).toEqual([
          "input_mode",
          "lifecycle",
          "prompt_body",
          "title",
        ]);
        for (const forbiddenKey of FORBIDDEN_INVOCATION_KEYS) {
          expect(invocationPayload).not.toHaveProperty(forbiddenKey);
        }
        for (const marker of mvpCommand.promptBodyMarkers) {
          expect(invocationPayload.prompt_body).toEqual(expect.stringContaining(marker));
        }

        const canonicalInspect = await client.callTool({
          name: INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
          arguments: { command: mvpCommand.command },
        });
        expect(canonicalInspect.isError).not.toBe(true);
        expect(canonicalInspect.structuredContent).toMatchObject({
          ok: true,
          type: "prompt_inspection",
          inspection_only: true,
          no_prompt_invoked: true,
          metadata: {
            slug: mvpCommand.command,
            title: mvpCommand.title,
            aliases: [...mvpCommand.aliases],
            lifecycle: mvpCommand.lifecycle,
            input_mode: mvpCommand.input_mode,
            status: "active",
          },
        });

        for (const alias of mvpCommand.aliases) {
          const aliasInvoke = await client.callTool({
            name: INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
            arguments: { command: alias },
          });
          const aliasInspect = await client.callTool({
            name: INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
            arguments: { command: alias },
          });

          expect(aliasInvoke.isError).not.toBe(true);
          expect(aliasInspect.isError).not.toBe(true);
          expect(aliasInvoke.structuredContent).toEqual(canonicalInvoke.structuredContent);
          expect(aliasInspect.structuredContent).toEqual(canonicalInspect.structuredContent);
        }
      }

      const serializedList = JSON.stringify(listResult);
      expect(serializedList).not.toContain("Produce one concise handoff artifact");
      expect(serializedList).not.toContain("Ask exactly one meaningful question");
      expect(serializedList).not.toContain("an ongoing chat mode");
    });
  });
});

async function withLocalPromptClient<T>(run: (client: Client) => Promise<T>): Promise<T> {
  return withClient(await createLocalPromptLibraryServer(), run);
}

async function withClient<T>(server: McpServer, run: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({
    name: "m4-local-mvp-contract-test",
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
