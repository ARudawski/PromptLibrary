import type { PromptCommandSummary, PromptDefinition } from "../domain/index.js";

export function toPromptSummary(prompt: PromptDefinition): PromptCommandSummary {
  return {
    command: prompt.metadata.slug,
    title: prompt.metadata.title,
    description: prompt.metadata.description,
    aliases: prompt.metadata.aliases,
    lifecycle: prompt.metadata.lifecycle,
    input_mode: prompt.metadata.input_mode,
  };
}
