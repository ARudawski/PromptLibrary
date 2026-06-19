import type { PromptDefinition } from "../domain/index.js";
import { parsePromptMarkdown } from "../prompt-parser/index.js";
import {
  LocalFixturePromptSource,
  type LocalFixturePromptSourceOptions,
  type PromptSource,
} from "../prompt-source/index.js";
import { validatePromptDefinition } from "../validation/index.js";
import { createInvokePromptUseCase, type InvokePromptUseCase } from "./InvokePromptUseCase.js";

export interface FixtureBackedInvokePromptUseCaseOptions extends LocalFixturePromptSourceOptions {
  readonly promptSource?: PromptSource;
}

export async function createFixtureBackedInvokePromptUseCase(
  options: FixtureBackedInvokePromptUseCaseOptions = {},
): Promise<InvokePromptUseCase> {
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

  return createInvokePromptUseCase(prompts);
}
