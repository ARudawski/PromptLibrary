import type { PromptDefinition, PromptInvocationPayload } from "../domain/index.js";

export function toInvocationPayload(prompt: PromptDefinition): PromptInvocationPayload {
  return {
    title: prompt.metadata.title,
    lifecycle: prompt.metadata.lifecycle,
    input_mode: prompt.metadata.input_mode,
    prompt_body: prompt.promptBody,
  };
}
