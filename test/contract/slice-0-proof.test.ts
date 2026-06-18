import { describe, expect, it } from "vitest";
import { invokePromptLibraryCommand, PROOF_PROMPT } from "../../src/mcp/server.js";

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
