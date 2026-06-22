import { createInvokePromptUseCase, type InvokePromptUseCase } from "./InvokePromptUseCase.js";
import {
  type FixtureBackedPromptDefinitionOptions,
  loadFixtureBackedPromptDefinitions,
} from "./loadFixtureBackedPromptDefinitions.js";

export type FixtureBackedInvokePromptUseCaseOptions = FixtureBackedPromptDefinitionOptions;

export async function createFixtureBackedInvokePromptUseCase(
  options: FixtureBackedInvokePromptUseCaseOptions = {},
): Promise<InvokePromptUseCase> {
  const prompts = await loadFixtureBackedPromptDefinitions(options);
  return createInvokePromptUseCase(prompts);
}
