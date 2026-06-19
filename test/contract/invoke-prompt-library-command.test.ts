import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it } from "vitest";
import {
  createFixtureBackedInvokePromptUseCase,
  createInvokePromptUseCase,
} from "../../src/application/index.js";
import {
  INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
  invokePromptLibraryCommand,
} from "../../src/mcp/invokePromptLibraryCommandTool.js";
import { createPromptLibraryServer } from "../../src/mcp/server.js";
import { loadValidatedPromptFixtures } from "../unit/promptFixtures.js";

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

async function withClient<T>(server: McpServer, run: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({
    name: "slice-1-contract-test",
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

describe("invoke_prompt_library_command MCP adapter", () => {
  it("publishes only the approved invoke tool with structured input and output schemas", async () => {
    await withDefaultClient(async (client) => {
      const listedTools = await client.listTools();

      expect(listedTools.tools.map((tool) => tool.name)).toEqual([
        INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
      ]);

      const invokeTool = listedTools.tools[0];
      const inputSchema = asRecord(invokeTool?.inputSchema);
      const inputProperties = asRecord(inputSchema.properties);
      const outputSchema = asRecord(invokeTool?.outputSchema);
      const outputProperties = asRecord(outputSchema.properties);

      expect(Object.keys(inputProperties).sort()).toEqual(["attached_input", "command"]);
      expect(inputSchema.required).toEqual(["command"]);
      expect(inputProperties).not.toHaveProperty("raw_text");
      expect(inputProperties).not.toHaveProperty("conversation");
      expect(inputProperties).not.toHaveProperty("messages");
      expect(inputProperties).not.toHaveProperty("cache_control");
      expect(inputProperties).not.toHaveProperty("include_drafts");
      expect(inputProperties).not.toHaveProperty("refresh");

      expect(Object.keys(outputProperties).sort()).toEqual([
        "input_mode",
        "lifecycle",
        "prompt_body",
        "title",
      ]);
      expect(outputSchema.required).toEqual(["title", "lifecycle", "input_mode", "prompt_body"]);
      expect(outputProperties).not.toHaveProperty("ok");
      expect(outputProperties).not.toHaveProperty("type");
      expect(outputProperties).not.toHaveProperty("payload");
      expect(outputProperties).not.toHaveProperty("error_code");
      expect(outputProperties).not.toHaveProperty("message");
      expect(outputProperties).not.toHaveProperty("no_prompt_invoked");
      expect(outputProperties).not.toHaveProperty("suggestions");
      expect(outputSchema.additionalProperties).toBe(false);
    });
  });

  it("returns active fixture invocation by slug with model-visible reduced payload", async () => {
    await withDefaultClient(async (client) => {
      const result = await client.callTool({
        name: INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "active-basic", attached_input: "Some input." },
      });

      expect(result.isError).not.toBe(true);
      expect(result.structuredContent).toEqual({
        title: "Active Basic",
        lifecycle: "one_shot",
        input_mode: "attached_input",
        prompt_body: "Apply the Active Basic fixture prompt to the attached input.\n",
      });
      expect(Object.keys(asRecord(result.structuredContent)).sort()).toEqual([
        "input_mode",
        "lifecycle",
        "prompt_body",
        "title",
      ]);
      for (const forbiddenKey of FORBIDDEN_INVOCATION_KEYS) {
        expect(result.structuredContent).not.toHaveProperty(forbiddenKey);
      }
      expect(result.content).toEqual([
        {
          type: "text",
          text: "Prompt invoked: Active Basic.",
        },
      ]);
      expect(result).not.toHaveProperty("_meta.prompt_body");
    });
  });

  it("returns active fixture invocation by alias", async () => {
    await withDefaultClient(async (client) => {
      const result = await client.callTool({
        name: INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "alias-basic" },
      });

      expect(result.isError).not.toBe(true);
      expect(result.structuredContent).toMatchObject({
        title: "Active With Alias",
        lifecycle: "interactive_workflow",
        input_mode: "either",
      });
    });
  });

  it("fails closed for unknown commands with no_prompt_invoked and non-executing suggestions", async () => {
    await withDefaultClient(async (client) => {
      await client.listTools();

      const result = await client.callTool({
        name: INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "active" },
      });

      expect(result.isError).toBe(true);
      expect(result.structuredContent).toBeUndefined();

      const text = textContent(result);
      expect(text).toContain("No prompt invoked.");
      expect(text).toContain("no_prompt_invoked: true");
      expect(text).toContain("error_code: PROMPT_NOT_FOUND");
      expect(text).toContain('message: Command "active" was not found.');
      expect(text).toContain("suggestions: active-basic, active-with-alias");
      expect(text).not.toContain("prompt_body");
    });
  });

  it("fails closed for valid draft fixture prompts", async () => {
    await withDefaultClient(async (client) => {
      const result = await client.callTool({
        name: INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "draft-valid" },
      });

      expect(result.isError).toBe(true);
      expect(result.structuredContent).toBeUndefined();

      const text = textContent(result);
      expect(text).toContain("no_prompt_invoked: true");
      expect(text).toContain("error_code: PROMPT_NOT_INVOKABLE");
      expect(text).toContain('message: Command "draft-valid" is not invokable.');
      expect(text).not.toContain("prompt_body");
    });
  });

  it("fails closed for ambiguous fixture commands", async () => {
    const server = await createPromptLibraryServer({
      promptPaths: [
        "test/fixtures/prompts-conflicts/alias-slug-conflict-a.md",
        "test/fixtures/prompts-conflicts/alias-slug-conflict-b.md",
      ],
    });

    await withClient(server, async (client) => {
      const result = await client.callTool({
        name: INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
        arguments: { command: "conflict-target" },
      });

      expect(result.isError).toBe(true);
      expect(result.structuredContent).toBeUndefined();

      const text = textContent(result);
      expect(text).toContain("no_prompt_invoked: true");
      expect(text).toContain("error_code: PROMPT_AMBIGUOUS");
      expect(text).toContain(
        'message: Command "conflict-target" is ambiguous and no prompt was invoked.',
      );
      expect(text).not.toContain("prompt_body");
    });
  });

  it("maps direct use-case results without MCP SDK types leaking into application code", async () => {
    const useCase = createInvokePromptUseCase(
      loadValidatedPromptFixtures([
        "test/fixtures/prompts-valid/active-basic.md",
        "test/fixtures/prompts-valid/draft-valid.md",
      ]),
    );

    expect(
      invokePromptLibraryCommand(useCase, { command: "active-basic" }).structuredContent,
    ).toEqual({
      title: "Active Basic",
      lifecycle: "one_shot",
      input_mode: "attached_input",
      prompt_body: "Apply the Active Basic fixture prompt to the attached input.\n",
    });
  });

  it("builds the invoke use case from local fixture Markdown outside the MCP adapter", async () => {
    const useCase = await createFixtureBackedInvokePromptUseCase();

    expect(useCase.execute({ command: "active-basic" })).toMatchObject({
      kind: "success",
      value: {
        title: "Active Basic",
      },
    });
  });
});
