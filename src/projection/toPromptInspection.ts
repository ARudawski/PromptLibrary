import type { PromptDefinition, PromptInspection } from "../domain/index.js";

export function toPromptInspection(prompt: PromptDefinition): PromptInspection {
  return {
    ok: true,
    type: "prompt_inspection",
    inspection_only: true,
    no_prompt_invoked: true,
    metadata: prompt.metadata,
    prompt_body: prompt.promptBody,
  };
}
