import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, it } from "vitest";
import {
  createPromptLibraryProofServer,
  invokePromptLibraryCommand,
  PROOF_PROMPT,
} from "../../src/mcp/server.js";

const INVOKE_TOOL_NAME = "invoke_prompt_library_command";
const UNKNOWN_COMMAND_ERROR =
  "Unknown prompt-library command. Slice 0 supports only command: proof.";

function asRecord(value: unknown): Record<string, unknown> {
  expect(value).toBeTypeOf("object");
  expect(value).not.toBeNull();
  return value as Record<string, unknown>;
}

async function withProofClient<T>(run: (client: Client) => Promise<T>): Promise<T> {
  const server = createPromptLibraryProofServer();
  const client = new Client({
    name: "slice-0-contract-test",
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

describe("Slice 0 proof invocation", () => {
  it("returns the hardcoded proof prompt in model-visible structuredContent and content", () => {
    const result = invokePromptLibraryCommand({
      command: "proof",
      attached_input: "I want to build a small app.",
    });

    expect(result.isError).not.toBe(true);
    expect(result.structuredContent).toEqual({
      title: "Project Prompt Library Proof",
      lifecycle: "one_shot_proof",
      input_mode: "optional_attached_input",
      prompt_body: PROOF_PROMPT,
    });
    expect(result.content).toEqual([
      {
        type: "text",
        text: `Proof prompt retrieved.\n\n${PROOF_PROMPT}`,
      },
    ]);
  });

  it("publishes and validates the success outputSchema through the registered MCP server", async () => {
    await withProofClient(async (client) => {
      const listedTools = await client.listTools();
      const invokeTool = listedTools.tools.find((tool) => tool.name === INVOKE_TOOL_NAME);
      expect(invokeTool).toBeDefined();

      const outputSchema = asRecord(invokeTool?.outputSchema);
      const properties = asRecord(outputSchema.properties);

      expect(outputSchema.type).toBe("object");
      expect(Object.keys(properties).sort()).toEqual([
        "error",
        "input_mode",
        "lifecycle",
        "no_prompt_invoked",
        "prompt_body",
        "title",
      ]);
      expect(properties).not.toHaveProperty("ok");
      expect(properties).not.toHaveProperty("type");
      expect(properties).not.toHaveProperty("payload");
      expect(outputSchema.additionalProperties).toBe(false);

      const result = await client.callTool({
        name: INVOKE_TOOL_NAME,
        arguments: { command: "proof" },
      });

      expect(result.isError).not.toBe(true);
      expect(result.structuredContent).toEqual({
        title: "Project Prompt Library Proof",
        lifecycle: "one_shot_proof",
        input_mode: "optional_attached_input",
        prompt_body: PROOF_PROMPT,
      });
    });
  });

  it("returns fail-closed structured errors through an SDK client that cached outputSchema", async () => {
    await withProofClient(async (client) => {
      await client.listTools();

      const result = await client.callTool({
        name: INVOKE_TOOL_NAME,
        arguments: { command: "grill-me" },
      });

      expect(result.isError).toBe(true);
      expect(result.structuredContent).toEqual({
        no_prompt_invoked: true,
        error: UNKNOWN_COMMAND_ERROR,
      });
      expect(result.structuredContent).not.toHaveProperty("prompt_body");
      expect(result.content).toEqual([
        {
          type: "text",
          text: "No prompt invoked: unknown command.",
        },
      ]);
    });
  });

  it("fails closed for unknown commands without returning a prompt body", () => {
    const result = invokePromptLibraryCommand({ command: "grill-me" });

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toEqual({
      no_prompt_invoked: true,
      error: UNKNOWN_COMMAND_ERROR,
    });
    expect(result.structuredContent).not.toHaveProperty("prompt_body");
    expect(result.content).toEqual([
      {
        type: "text",
        text: "No prompt invoked: unknown command.",
      },
    ]);
  });
});
