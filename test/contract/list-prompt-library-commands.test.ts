import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { ListPromptsUseCase } from "../../src/application/index.js";
import type { PromptIndex } from "../../src/cache/index.js";
import { INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME } from "../../src/mcp/inspectPromptLibraryCommandTool.js";
import { INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME } from "../../src/mcp/invokePromptLibraryCommandTool.js";
import {
  LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME,
  listOutputSchema,
  listPromptLibraryCommands,
} from "../../src/mcp/listPromptLibraryCommandsTool.js";
import { createPromptLibraryServer } from "../../src/mcp/server.js";
import { ScriptedPromptSource, validPromptFile } from "../helpers/sourceCacheTestHarness.js";

const APPROVED_CHATGPT_FACING_TOOLS = [
  INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
  INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
  LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME,
] as const;

const EXPECTED_COMMAND_KEYS = [
  "aliases",
  "command",
  "description",
  "input_mode",
  "lifecycle",
  "title",
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

function asRecord(value: unknown): Record<string, unknown> {
  expect(value).toBeTypeOf("object");
  expect(value).not.toBeNull();
  return value as Record<string, unknown>;
}

function textContent(result: unknown): string {
  const resultRecord = asRecord(result);
  const content = resultRecord.content;
  expect(content).toEqual(expect.any(Array));
  const firstContent = (content as readonly unknown[])[0];
  const firstContentRecord = asRecord(firstContent);

  expect(firstContentRecord.type).toBe("text");
  expect(firstContentRecord.text).toBeTypeOf("string");

  return firstContentRecord.text as string;
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

async function withClient<T>(server: McpServer, run: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({
    name: "slice-3-4-contract-test",
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

async function withDefaultClient<T>(run: (client: Client) => Promise<T>): Promise<T> {
  return withClient(await createPromptLibraryServer(), run);
}

describe("list_prompt_library_commands MCP adapter", () => {
  it("publishes only approved tools with empty list input and strict list output schema", async () => {
    await withDefaultClient(async (client) => {
      const listedTools = await client.listTools();

      expect(listedTools.tools.map((tool) => tool.name).sort()).toEqual(
        [...APPROVED_CHATGPT_FACING_TOOLS].sort(),
      );
      expect(listedTools.tools.map((tool) => tool.name)).not.toContain(
        "refresh_prompt_library_cache",
      );
      expect(listedTools.tools.map((tool) => tool.name)).not.toContain("list_drafts");
      expect(listedTools.tools.map((tool) => tool.name)).not.toContain("inspect_draft");

      const listTool = listedTools.tools.find(
        (tool) => tool.name === LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME,
      );
      const inputSchema = asRecord(listTool?.inputSchema);
      const inputProperties = asRecord(inputSchema.properties);

      expect(Object.keys(inputProperties)).toEqual([]);
      expect(inputSchema.required ?? []).toEqual([]);
      expect(inputSchema.additionalProperties).toBe(false);
      expect(inputProperties).not.toHaveProperty("command");
      expect(inputProperties).not.toHaveProperty("attached_input");
      expect(inputProperties).not.toHaveProperty("raw_text");
      expect(inputProperties).not.toHaveProperty("conversation");
      expect(inputProperties).not.toHaveProperty("messages");
      expect(inputProperties).not.toHaveProperty("cache_control");
      expect(inputProperties).not.toHaveProperty("include_drafts");
      expect(inputProperties).not.toHaveProperty("refresh");

      const outputSchema = asRecord(listTool?.outputSchema);
      const outputProperties = asRecord(outputSchema.properties);
      expect(Object.keys(outputProperties).sort()).toEqual(["commands", "ok", "type"]);
      expect(outputSchema.required).toEqual(["ok", "type", "commands"]);
      expect(outputSchema.additionalProperties).toBe(false);
      expect(propertyConst(outputProperties.ok)).toBe(true);
      expect(propertyConst(outputProperties.type)).toBe("prompt_command_list");

      const commandsSchema = asRecord(outputProperties.commands);
      const commandItemSchema = asRecord(commandsSchema.items);
      const commandProperties = asRecord(commandItemSchema.properties);
      expect(Object.keys(commandProperties).sort()).toEqual([...EXPECTED_COMMAND_KEYS].sort());
      expect(commandItemSchema.additionalProperties).toBe(false);
    });
  });

  it("rejects failure-shaped structured-content payloads", () => {
    expect(
      listOutputSchema.safeParse({
        ok: false,
        type: "prompt_command_list_error",
        no_prompt_invoked: true,
        error_code: "PROMPT_LIBRARY_INVALID",
        message: "No summaries were listed.",
      }).success,
    ).toBe(false);
  });

  it("returns deterministic active command summaries without prompt bodies or diagnostics", async () => {
    await withDefaultClient(async (client) => {
      const result = await client.callTool({
        name: LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME,
        arguments: {},
      });

      expect(result.isError).not.toBe(true);
      expect(result.structuredContent).toEqual({
        ok: true,
        type: "prompt_command_list",
        commands: [
          {
            command: "active-basic",
            title: "Active Basic",
            description: "Basic active fixture prompt.",
            aliases: [],
            lifecycle: "one_shot",
            input_mode: "attached_input",
          },
          {
            command: "active-with-alias",
            title: "Active With Alias",
            description: "Active fixture prompt with a command alias.",
            aliases: ["alias-basic"],
            lifecycle: "interactive_workflow",
            input_mode: "either",
          },
        ],
      });
      expect(result.content).toEqual([
        {
          type: "text",
          text: "Available active Prompt Library commands listed.",
        },
      ]);
      expect(result).not.toHaveProperty("_meta.prompt_body");

      const structuredContent = asRecord(result.structuredContent);
      const commands = structuredContent.commands;
      expect(commands).toEqual(expect.any(Array));
      for (const summary of commands as readonly unknown[]) {
        expect(Object.keys(asRecord(summary)).sort()).toEqual([...EXPECTED_COMMAND_KEYS].sort());
        for (const forbiddenKey of FORBIDDEN_LIST_KEYS) {
          expect(summary).not.toHaveProperty(forbiddenKey);
        }
      }
      expect(JSON.stringify(result)).not.toContain("Apply the Active Basic fixture prompt");
      expect(JSON.stringify(result)).not.toContain("Use this fixture prompt");
      expect(
        (commands as readonly { readonly command: string }[]).map(({ command }) => command),
      ).not.toContain("alias-basic");
      expect(
        (commands as readonly { readonly command: string }[]).map(({ command }) => command),
      ).not.toContain("draft-valid");
    });
  });

  it("builds invoke, inspect, and list defaults from the same prompt-source snapshot", async () => {
    const promptSource = new ScriptedPromptSource([
      [validPromptFile("alpha", { body: "Apply alpha.\n", title: "Alpha Prompt" })],
      [validPromptFile("beta", { body: "Apply beta.\n", title: "Beta Prompt" })],
    ]);
    const server = await createPromptLibraryServer({ promptSource });

    expect(promptSource.loadCount).toBe(1);

    await withClient(server, async (client) => {
      const invokeResult = await client.callTool({
        name: INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "alpha" },
      });
      const inspectResult = await client.callTool({
        name: INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "alpha" },
      });
      const listResult = await client.callTool({
        name: LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME,
        arguments: {},
      });

      expect(invokeResult.structuredContent).toMatchObject({
        title: "Alpha Prompt",
        prompt_body: "Apply alpha.\n",
      });
      expect(inspectResult.structuredContent).toMatchObject({
        ok: true,
        metadata: {
          slug: "alpha",
          title: "Alpha Prompt",
        },
        prompt_body: "Apply alpha.\n",
      });
      expect(listResult.structuredContent).toMatchObject({
        ok: true,
        type: "prompt_command_list",
        commands: [
          {
            command: "alpha",
            title: "Alpha Prompt",
          },
        ],
      });
    });
  });

  it("delivers listTools-cached failures without structured content or prompt bodies", async () => {
    const server = await createPromptLibraryServer({ listUseCase: invalidListUseCase() });

    await withClient(server, async (client) => {
      await client.listTools();

      const result = await client.callTool({
        name: LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME,
        arguments: {},
      });

      expect(result.isError).toBe(true);
      expect(result.structuredContent).toBeUndefined();

      const text = textContent(result);
      expect(text).toContain("Command list failed; no prompt was invoked.");
      expect(text).toContain("no_prompt_invoked: true");
      expect(text).toContain("error_code: PROMPT_LIBRARY_INVALID");
      expect(text).toContain(
        "message: Prompt library index is invalid and no prompt summaries were listed.",
      );
      expect(JSON.stringify(result)).not.toContain("prompt_body");
      expect(JSON.stringify(result)).not.toContain("cache_diagnostics");
      expect(JSON.stringify(result)).not.toContain("validation_diagnostics");
    });
  });

  it("maps direct use-case results without MCP SDK types leaking into application code", () => {
    expect(listPromptLibraryCommands(invalidListUseCase())).toMatchObject({
      isError: true,
      content: [
        {
          type: "text",
          text: expect.stringContaining("PROMPT_LIBRARY_INVALID"),
        },
      ],
    });
  });
});

function propertyConst(propertySchema: unknown): unknown {
  const propertyRecord = asRecord(propertySchema);

  if ("const" in propertyRecord) {
    return propertyRecord.const;
  }

  const enumValues = propertyRecord.enum;

  if (Array.isArray(enumValues) && enumValues.length === 1) {
    return enumValues[0];
  }

  return undefined;
}
