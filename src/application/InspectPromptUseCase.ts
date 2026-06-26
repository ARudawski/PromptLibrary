import {
  buildPromptIndex,
  isPromptIndexStructurallyValid,
  type PromptIndex,
  resolvePromptCommand,
} from "../cache/index.js";
import type { PromptDefinition, PromptInspectionResult } from "../domain/index.js";
import { toPromptInspection } from "../projection/index.js";
import { suggestCommands } from "../suggestions/index.js";

export interface InspectPromptInput {
  readonly command: string;
}

export class InspectPromptUseCase {
  readonly #index: PromptIndex;

  public constructor(index: PromptIndex) {
    this.#index = index;
  }

  public execute(input: InspectPromptInput): PromptInspectionResult {
    const command = input.command.trim();

    if (!isPromptIndexStructurallyValid(this.#index)) {
      return {
        kind: "failure",
        error: {
          reason: "library_invalid",
          message: "Prompt library index is invalid and no prompt was inspected.",
        },
      };
    }

    const resolution = resolvePromptCommand(this.#index, command);

    if (resolution.kind === "found") {
      return {
        kind: "success",
        value: toPromptInspection(resolution.prompt),
      };
    }

    if (resolution.kind === "conflict") {
      return {
        kind: "failure",
        error: {
          reason: "command_ambiguous",
          message: `Command "${resolution.command}" is ambiguous and no prompt was inspected.`,
        },
      };
    }

    if (resolution.kind === "not_invokable") {
      return {
        kind: "failure",
        error: {
          reason: "prompt_not_invokable",
          message: `Command "${resolution.command}" is not inspectable.`,
        },
      };
    }

    const suggestions = suggestCommands(command, this.#index.activeCommands);

    return {
      kind: "failure",
      error: {
        reason: "command_not_found",
        message: `Command "${resolution.command}" was not found.`,
        ...(suggestions.length > 0 ? { suggestions } : {}),
      },
    };
  }
}

export function createInspectPromptUseCase(
  prompts: readonly PromptDefinition[],
): InspectPromptUseCase {
  return new InspectPromptUseCase(buildPromptIndex(prompts));
}
