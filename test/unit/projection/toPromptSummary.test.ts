import { describe, expect, it } from "vitest";
import type { PromptDefinition } from "../../../src/domain/index.js";
import { toPromptSummary } from "../../../src/projection/index.js";

describe("toPromptSummary", () => {
  it("projects only discovery metadata and never includes prompt bodies or operational fields", () => {
    const prompt = {
      metadata: {
        schema_version: "1",
        slug: "deep-list",
        title: "Deep List",
        description: "Prompt with optional metadata for list discovery.",
        aliases: ["list-deep"],
        lifecycle: "interactive_workflow",
        input_mode: "either",
        status: "active",
        tags: ["qa", "slice-3"],
        notes: "Inspection-only note.",
        debug_marker: "debug-list-marker",
        prompt_version: "2026-06-22",
        created_at: "2026-06-20T10:00:00.000Z",
        updated_at: "2026-06-22T10:00:00.000Z",
      },
      promptBody: "This body must not be listed.\n",
    } satisfies PromptDefinition;

    const summary = toPromptSummary(prompt);

    expect(summary).toEqual({
      command: "deep-list",
      title: "Deep List",
      description: "Prompt with optional metadata for list discovery.",
      aliases: ["list-deep"],
      lifecycle: "interactive_workflow",
      input_mode: "either",
    });
    expect(Object.keys(summary).sort()).toEqual([
      "aliases",
      "command",
      "description",
      "input_mode",
      "lifecycle",
      "title",
    ]);
    expect(summary).not.toHaveProperty("prompt_body");
    expect(summary).not.toHaveProperty("status");
    expect(summary).not.toHaveProperty("debug_marker");
    expect(summary).not.toHaveProperty("prompt_version");
    expect(summary).not.toHaveProperty("created_at");
    expect(summary).not.toHaveProperty("updated_at");
  });
});
