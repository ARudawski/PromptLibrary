import { describe, expect, it } from "vitest";
import { toInvocationPayload } from "../../../src/projection/index.js";
import { loadValidatedPromptFixture } from "../promptFixtures.js";

describe("toInvocationPayload", () => {
  it("projects only the allowed model-visible invocation fields", () => {
    const payload = toInvocationPayload(
      loadValidatedPromptFixture("test/fixtures/prompts-valid/active-with-alias.md"),
    );

    expect(payload).toEqual({
      title: "Active With Alias",
      lifecycle: "interactive_workflow",
      input_mode: "either",
      prompt_body: "Use this fixture prompt as a simple alias-backed active command.\n",
    });
    expect(Object.keys(payload).sort()).toEqual([
      "input_mode",
      "lifecycle",
      "prompt_body",
      "title",
    ]);
    expect(payload).not.toHaveProperty("slug");
    expect(payload).not.toHaveProperty("aliases");
    expect(payload).not.toHaveProperty("description");
    expect(payload).not.toHaveProperty("status");
  });
});
