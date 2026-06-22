import { buildPromptIndex, type PromptIndex } from "../cache/index.js";
import type { PromptDefinition, PromptListResult } from "../domain/index.js";
import { toPromptSummary } from "../projection/index.js";

export class ListPromptsUseCase {
  readonly #index: PromptIndex;

  public constructor(index: PromptIndex) {
    this.#index = index;
  }

  public execute(): PromptListResult {
    if (!isPromptIndexStructurallyValid(this.#index)) {
      return {
        kind: "failure",
        error: {
          reason: "library_invalid",
          message: "Prompt library index is invalid and no prompt summaries were listed.",
        },
      };
    }

    const activePromptsBySlug = new Map<string, PromptDefinition>();

    for (const prompt of this.#index.activeByCommand.values()) {
      activePromptsBySlug.set(prompt.metadata.slug, prompt);
    }

    return {
      kind: "success",
      value: [...activePromptsBySlug.values()].map(toPromptSummary).sort(compareByCommand),
    };
  }
}

export function createListPromptsUseCase(prompts: readonly PromptDefinition[]): ListPromptsUseCase {
  return new ListPromptsUseCase(buildPromptIndex(prompts));
}

function compareByCommand(
  left: { readonly command: string },
  right: { readonly command: string },
): number {
  if (left.command < right.command) {
    return -1;
  }

  if (left.command > right.command) {
    return 1;
  }

  return 0;
}

function isPromptIndexStructurallyValid(index: PromptIndex): boolean {
  const activeCommandSet = new Set(index.activeCommands);

  if (activeCommandSet.size !== index.activeCommands.length) {
    return false;
  }

  if (activeCommandSet.size !== index.activeByCommand.size) {
    return false;
  }

  for (const command of activeCommandSet) {
    const prompt = index.activeByCommand.get(command);

    if (prompt === undefined || prompt.metadata.status !== "active") {
      return false;
    }
  }

  for (const [command, prompt] of index.activeByCommand) {
    if (!activeCommandSet.has(command) || prompt.metadata.status !== "active") {
      return false;
    }
  }

  return true;
}
