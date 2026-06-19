import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { PromptDefinition } from "../../src/domain/index.js";
import { parsePromptMarkdown } from "../../src/prompt-parser/index.js";
import { validatePromptDefinition } from "../../src/validation/index.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export function loadValidatedPromptFixture(relativePath: string): PromptDefinition {
  const parseResult = parsePromptMarkdown(readFileSync(resolve(repoRoot, relativePath), "utf8"));

  if (parseResult.kind !== "success") {
    throw new Error(`Expected ${relativePath} to parse.`);
  }

  const validationResult = validatePromptDefinition(parseResult.prompt);

  if (validationResult.kind !== "success") {
    throw new Error(`Expected ${relativePath} to validate.`);
  }

  return validationResult.prompt;
}

export function loadValidatedPromptFixtures(
  relativePaths: readonly string[],
): readonly PromptDefinition[] {
  return relativePaths.map((relativePath) => loadValidatedPromptFixture(relativePath));
}

export function promptFixtureFailsDefinitionValidation(relativePath: string): boolean {
  const parseResult = parsePromptMarkdown(readFileSync(resolve(repoRoot, relativePath), "utf8"));

  if (parseResult.kind !== "success") {
    return true;
  }

  return validatePromptDefinition(parseResult.prompt).kind === "failure";
}
