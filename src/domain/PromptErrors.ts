export const PROMPT_ERROR_REASONS = [
  "command_not_found",
  "command_ambiguous",
  "prompt_not_invokable",
  "prompt_invalid",
  "library_invalid",
] as const;

export type PromptErrorReason = (typeof PROMPT_ERROR_REASONS)[number];

export interface PromptLibraryError {
  readonly reason: PromptErrorReason;
  readonly message: string;
  readonly suggestions?: readonly string[];
}
