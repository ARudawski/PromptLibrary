import { buildPromptIndex, type PromptIndex, resolvePromptCommand } from "../cache/index.js";
import type { PromptDefinition, PromptInvocationResult } from "../domain/index.js";
import { toInvocationPayload } from "../projection/index.js";
import { suggestCommands } from "../suggestions/index.js";

export interface InvokePromptInput {
  readonly command: string;
  readonly attached_input?: string;
}

export class InvokePromptUseCase {
  readonly #index: PromptIndex;

  public constructor(index: PromptIndex) {
    this.#index = index;
  }

  public execute(input: InvokePromptInput): PromptInvocationResult {
    const command = input.command.trim();
    const resolution = resolvePromptCommand(this.#index, command);

    if (resolution.kind === "found") {
      return {
        kind: "success",
        value: toInvocationPayload(resolution.prompt),
      };
    }

    if (resolution.kind === "conflict") {
      return {
        kind: "failure",
        error: {
          reason: "command_ambiguous",
          message: `Command "${resolution.command}" is ambiguous and no prompt was invoked.`,
        },
      };
    }

    if (resolution.kind === "not_invokable") {
      return {
        kind: "failure",
        error: {
          reason: "prompt_not_invokable",
          message: `Command "${resolution.command}" is not invokable.`,
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

export function createInvokePromptUseCase(
  prompts: readonly PromptDefinition[],
): InvokePromptUseCase {
  return new InvokePromptUseCase(buildPromptIndex(prompts));
}
