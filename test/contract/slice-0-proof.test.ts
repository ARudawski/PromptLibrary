import { describe, expect, it } from "vitest";
import { invokePromptLibraryCommand, PROOF_PROMPT } from "../../src/mcp/server.js";

describe("Slice 0 proof invocation", () => {
  it("returns the hardcoded proof prompt in model-visible structuredContent and content", () => {
    const result = invokePromptLibraryCommand({ command: "proof", attached_input: "An idea" });

    expect(result.isError).not.toBe(true);
    expect(result.structuredContent).toMatchObject({
      title: "Project Prompt Library Proof",
      lifecycle: "one_shot_proof",
      input_mode: "optional_attached_input",
      prompt_body: PROOF_PROMPT,
    });
    expect(result.content?.[0]).toMatchObject({
      type: "text",
      text: expect.stringContaining(PROOF_PROMPT),
    });
  });

  it("fails closed for unknown commands without returning a prompt body", () => {
    const result = invokePromptLibraryCommand({ command: "grill-me" });

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toMatchObject({ no_prompt_invoked: true });
    expect(result.structuredContent).not.toHaveProperty("prompt_body");
    expect(result.content?.[0]).toMatchObject({
      type: "text",
      text: "No prompt invoked: unknown command.",
    });
  });
});
