import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import { createInspectPromptUseCase } from "../../src/application/index.js";
import {
  INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
  inspectOutputSchema,
  inspectPromptLibraryCommand,
} from "../../src/mcp/inspectPromptLibraryCommandTool.js";
import { INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME } from "../../src/mcp/invokePromptLibraryCommandTool.js";
import { LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME } from "../../src/mcp/listPromptLibraryCommandsTool.js";
import { createPromptLibraryServer } from "../../src/mcp/server.js";
import { ScriptedPromptSource, validPromptFile } from "../helpers/sourceCacheTestHarness.js";
import { loadValidatedPromptFixtures } from "../unit/promptFixtures.js";

const APPROVED_CHATGPT_FACING_TOOLS = [
  INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
  INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
  LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME,
] as const;

const EXPECTED_METADATA_KEYS = [
  "aliases",
  "created_at",
  "debug_marker",
  "description",
  "input_mode",
  "lifecycle",
  "notes",
  "prompt_version",
  "schema_version",
  "slug",
  "status",
  "tags",
  "title",
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

function expectInspectionFailure(
  result: unknown,
  expected: {
    readonly errorCode: string;
    readonly message: string;
    readonly suggestions?: readonly string[];
  },
): void {
  const resultRecord = asRecord(result);

  expect(resultRecord.isError).toBe(true);
  expect(resultRecord).not.toHaveProperty("structuredContent");

  const text = textContent(result);
  expect(text).toContain("Inspection failed; no prompt was invoked.");
  expect(text).toContain("inspection_only: true");
  expect(text).toContain("no_prompt_invoked: true");
  expect(text).toContain(`error_code: ${expected.errorCode}`);
  expect(text).toContain(`message: ${expected.message}`);

  if (expected.suggestions !== undefined) {
    expect(text).toContain(`suggestions: ${expected.suggestions.join(", ")}`);
  }

  expect(JSON.stringify(result)).not.toContain("prompt_body");
}

async function withClient<T>(server: McpServer, run: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({
    name: "slice-3-2-contract-test",
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

describe("inspect_prompt_library_command MCP adapter", () => {
  it("publishes only approved invoke and inspect tools with command-only inspect input", async () => {
    await withDefaultClient(async (client) => {
      const listedTools = await client.listTools();

      expect(listedTools.tools.map((tool) => tool.name).sort()).toEqual(
        [...APPROVED_CHATGPT_FACING_TOOLS].sort(),
      );
      expect(listedTools.tools.map((tool) => tool.name)).not.toContain(
        "refresh_prompt_library_cache",
      );
      expect(listedTools.tools.map((tool) => tool.name)).not.toContain("inspect_draft");

      const inspectTool = listedTools.tools.find(
        (tool) => tool.name === INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
      );
      const inputSchema = asRecord(inspectTool?.inputSchema);
      const inputProperties = asRecord(inputSchema.properties);

      expect(Object.keys(inputProperties)).toEqual(["command"]);
      expect(inputSchema.required).toEqual(["command"]);
      expect(inputSchema.additionalProperties).toBe(false);
      expect(inputProperties).not.toHaveProperty("attached_input");
      expect(inputProperties).not.toHaveProperty("raw_text");
      expect(inputProperties).not.toHaveProperty("conversation");
      expect(inputProperties).not.toHaveProperty("messages");
      expect(inputProperties).not.toHaveProperty("cache_control");
      expect(inputProperties).not.toHaveProperty("include_drafts");
      expect(inputProperties).not.toHaveProperty("refresh");
    });
  });

  it("publishes a strict inspect success output schema requiring metadata and prompt body", async () => {
    await withDefaultClient(async (client) => {
      const listedTools = await client.listTools();
      const inspectTool = listedTools.tools.find(
        (tool) => tool.name === INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
      );
      const outputSchema = asRecord(inspectTool?.outputSchema);
      const outputProperties = asRecord(outputSchema.properties);
      expect(Object.keys(outputProperties).sort()).toEqual([
        "inspection_only",
        "metadata",
        "no_prompt_invoked",
        "ok",
        "prompt_body",
        "type",
      ]);
      expect(outputSchema.required).toEqual([
        "ok",
        "type",
        "inspection_only",
        "no_prompt_invoked",
        "metadata",
        "prompt_body",
      ]);
      expect(outputSchema.additionalProperties).toBe(false);
      expect(propertyConst(outputProperties.ok)).toBe(true);
      expect(propertyConst(outputProperties.type)).toBe("prompt_inspection");
      expect(propertyConst(outputProperties.inspection_only)).toBe(true);
      expect(propertyConst(outputProperties.no_prompt_invoked)).toBe(true);

      const metadataSchema = asRecord(outputProperties.metadata);
      const metadataProperties = asRecord(metadataSchema.properties);
      expect(Object.keys(metadataProperties).sort()).toEqual([...EXPECTED_METADATA_KEYS].sort());
      expect(metadataSchema.additionalProperties).toBe(false);

      expect(outputProperties.prompt_body).toBeDefined();
    });
  });

  it("rejects invalid minimal success and failure-shaped structured-content payloads", () => {
    expect(
      inspectOutputSchema.safeParse({
        ok: true,
        type: "prompt_inspection",
        inspection_only: true,
        no_prompt_invoked: true,
      }).success,
    ).toBe(false);
    expect(
      inspectOutputSchema.safeParse({
        ok: false,
        type: "prompt_inspection_error",
        inspection_only: true,
        no_prompt_invoked: true,
      }).success,
    ).toBe(false);
  });

  it("returns active fixture inspection by alias with model-visible metadata and prompt body", async () => {
    await withDefaultClient(async (client) => {
      const result = await client.callTool({
        name: INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "alias-basic" },
      });

      expect(result.isError).not.toBe(true);
      expect(result.structuredContent).toEqual({
        ok: true,
        type: "prompt_inspection",
        inspection_only: true,
        no_prompt_invoked: true,
        metadata: {
          schema_version: "1",
          slug: "active-with-alias",
          title: "Active With Alias",
          description: "Active fixture prompt with a command alias.",
          aliases: ["alias-basic"],
          lifecycle: "interactive_workflow",
          input_mode: "either",
          status: "active",
        },
        prompt_body: "Use this fixture prompt as a simple alias-backed active command.\n",
      });
      expect(result.content).toEqual([
        {
          type: "text",
          text: "Inspection only; no prompt was invoked. Prompt inspected: Active With Alias.",
        },
      ]);
      expect(result).not.toHaveProperty("_meta.prompt_body");
    });
  });

  it("builds invoke and inspect defaults from the same prompt-source snapshot", async () => {
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
      const staleSecondSnapshotResult = await client.callTool({
        name: INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "beta" },
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
      expect(staleSecondSnapshotResult.isError).toBe(true);
      expectInspectionFailure(staleSecondSnapshotResult, {
        errorCode: "PROMPT_NOT_FOUND",
        message: 'Command "beta" was not found.',
      });
    });
  });

  it("delivers listTools-cached draft failures without returning prompt body", async () => {
    await withDefaultClient(async (client) => {
      await client.listTools();

      const result = await client.callTool({
        name: INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "draft-valid" },
      });

      expectInspectionFailure(result, {
        errorCode: "PROMPT_NOT_INVOKABLE",
        message: 'Command "draft-valid" is not inspectable.',
      });
    });
  });

  it("delivers listTools-cached unknown failures without returning prompt body", async () => {
    await withDefaultClient(async (client) => {
      await client.listTools();

      const result = await client.callTool({
        name: INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "active" },
      });

      expectInspectionFailure(result, {
        errorCode: "PROMPT_NOT_FOUND",
        message: 'Command "active" was not found.',
        suggestions: ["active-basic", "active-with-alias"],
      });
    });
  });

  it("delivers listTools-cached ambiguous failures without returning prompt body", async () => {
    const server = await createPromptLibraryServer({
      promptPaths: [
        "test/fixtures/prompts-conflicts/alias-slug-conflict-a.md",
        "test/fixtures/prompts-conflicts/alias-slug-conflict-b.md",
      ],
    });

    await withClient(server, async (client) => {
      await client.listTools();

      const result = await client.callTool({
        name: INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "conflict-target" },
      });

      expectInspectionFailure(result, {
        errorCode: "PROMPT_AMBIGUOUS",
        message: 'Command "conflict-target" is ambiguous and no prompt was inspected.',
      });
    });
  });

  it("maps injected use-case results without changing invocation behavior", () => {
    const useCase = createInspectPromptUseCase(
      loadValidatedPromptFixtures(["test/fixtures/prompts-valid/active-basic.md"]),
    );

    expect(inspectPromptLibraryCommand(useCase, { command: "active-basic" })).toMatchObject({
      structuredContent: {
        ok: true,
        type: "prompt_inspection",
        inspection_only: true,
        no_prompt_invoked: true,
        metadata: {
          slug: "active-basic",
        },
        prompt_body: "Apply the Active Basic fixture prompt to the attached input.\n",
      },
      content: [
        {
          type: "text",
          text: "Inspection only; no prompt was invoked. Prompt inspected: Active Basic.",
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
