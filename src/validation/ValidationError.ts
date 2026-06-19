import type { PromptDefinition } from "../domain/index.js";

export const PROMPT_VALIDATION_ISSUE_CODES = [
  "missing_required_field",
  "invalid_field_type",
  "invalid_lifecycle",
  "invalid_input_mode",
  "invalid_status",
  "invalid_slug",
  "invalid_alias",
  "unknown_metadata_field",
  "empty_prompt_body",
] as const;

export type PromptValidationIssueCode = (typeof PROMPT_VALIDATION_ISSUE_CODES)[number];

export interface PromptValidationIssue {
  readonly code: PromptValidationIssueCode;
  readonly field?: string;
  readonly message: string;
}

export type PromptValidationResult =
  | {
      readonly kind: "success";
      readonly prompt: PromptDefinition;
    }
  | {
      readonly kind: "failure";
      readonly issues: readonly PromptValidationIssue[];
    };
