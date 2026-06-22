import { createInspectPromptUseCase, type InspectPromptUseCase } from "./InspectPromptUseCase.js";
import {
  type FixtureBackedPromptDefinitionOptions,
  loadFixtureBackedPromptDefinitions,
} from "./loadFixtureBackedPromptDefinitions.js";

export type FixtureBackedInspectPromptUseCaseOptions = FixtureBackedPromptDefinitionOptions;

export async function createFixtureBackedInspectPromptUseCase(
  options: FixtureBackedInspectPromptUseCaseOptions = {},
): Promise<InspectPromptUseCase> {
  const prompts = await loadFixtureBackedPromptDefinitions(options);
  return createInspectPromptUseCase(prompts);
}
