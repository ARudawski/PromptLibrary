import { describe, expect, it } from "vitest";
import type { PromptDefinition } from "../../../src/domain/index.js";
import { toPromptInspection } from "../../../src/projection/index.js";

describe("toPromptInspection", () => {
  it("projects full active prompt metadata, prompt body, and non-invocation flags", () => {
    const prompt = {
      metadata: {
        schema_version: "1",
        slug: "deep-inspect",
        title: "Deep Inspect",
        description: "Prompt with optional metadata for inspection.",
        aliases: ["inspect-deep"],
        lifecycle: "interactive_workflow",
        input_mode: "either",
        status: "active",
        tags: ["qa", "slice-3"],
        notes: "Visible to explicit inspection only.",
        debug_marker: "debug-inspect-marker",
        prompt_version: "2026-06-21",
        created_at: "2026-06-20T10:00:00.000Z",
        updated_at: "2026-06-21T10:00:00.000Z",
      },
      promptBody: "Inspect this exact prompt body.\n",
    } satisfies PromptDefinition;

    const inspection = toPromptInspection(prompt);

    expect(inspection).toEqual({
      ok: true,
      type: "prompt_inspection",
      inspection_only: true,
      no_prompt_invoked: true,
      metadata: prompt.metadata,
      prompt_body: "Inspect this exact prompt body.\n",
    });
    expect(Object.keys(inspection).sort()).toEqual([
      "inspection_only",
      "metadata",
      "no_prompt_invoked",
      "ok",
      "prompt_body",
      "type",
    ]);
  });
});
