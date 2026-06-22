import type { PromptDefinition } from "../domain/index.js";
import { parsePromptMarkdown } from "../prompt-parser/index.js";
import {
  LocalFixturePromptSource,
  type LocalFixturePromptSourceOptions,
  type PromptSource,
} from "../prompt-source/index.js";
import { validatePromptDefinition } from "../validation/index.js";

export interface FixtureBackedPromptDefinitionOptions extends LocalFixturePromptSourceOptions {
  readonly promptSource?: PromptSource;
}

export async function loadFixtureBackedPromptDefinitions(
  options: FixtureBackedPromptDefinitionOptions = {},
): Promise<readonly PromptDefinition[]> {
  const promptSource = options.promptSource ?? new LocalFixturePromptSource(options);
  const loadedPromptFiles = await promptSource.loadAllPrompts();
  const prompts: PromptDefinition[] = [];

  for (const loadedPromptFile of loadedPromptFiles) {
    const parseResult = parsePromptMarkdown(loadedPromptFile.rawMarkdown);

    if (parseResult.kind !== "success") {
      continue;
    }

    const validationResult = validatePromptDefinition(parseResult.prompt);

    if (validationResult.kind !== "success") {
      continue;
    }

    prompts.push(validationResult.prompt);
  }

  return prompts;
}
