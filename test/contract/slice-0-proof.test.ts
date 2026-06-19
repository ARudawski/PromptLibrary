import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, it } from "vitest";
import {
  createPromptLibraryProofServer,
  invokePromptLibraryCommand,
  PROOF_PROMPT,
} from "../../src/mcp/server.js";

const INVOKE_TOOL_NAME = "invoke_prompt_library_command";

function asRecord(value: unknown): Record<string, unknown> {
  expect(value).toBeTypeOf("object");
  expect(value).not.toBeNull();
  return value as Record<string, unknown>;
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
    const server = createPromptLibraryProofServer();
    const client = new Client({
      name: "slice-0-contract-test",
      version: "0.0.0",
    });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await server.connect(serverTransport);
    await client.connect(clientTransport);

    try {
      const listedTools = await client.listTools();
      const invokeTool = listedTools.tools.find((tool) => tool.name === INVOKE_TOOL_NAME);
      expect(invokeTool).toBeDefined();

      const outputSchema = asRecord(invokeTool?.outputSchema);
      const properties = asRecord(outputSchema.properties);

      expect(outputSchema.type).toBe("object");
      expect(Object.keys(properties).sort()).toEqual([
        "input_mode",
        "lifecycle",
        "prompt_body",
        "title",
      ]);
      expect(outputSchema.required).toEqual(["title", "lifecycle", "input_mode", "prompt_body"]);
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
    } finally {
      await client.close();
      await server.close();
    }
  });

  it("fails closed for unknown commands without returning a prompt body", () => {
    const result = invokePromptLibraryCommand({ command: "grill-me" });

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toEqual({
      no_prompt_invoked: true,
      error: "Unknown prompt-library command. Slice 0 supports only command: proof.",
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
