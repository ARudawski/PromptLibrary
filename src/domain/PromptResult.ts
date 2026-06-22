import type { PromptCommandSummary } from "./PromptCommandSummary.js";
import type { PromptLibraryError } from "./PromptErrors.js";
import type { PromptInspection } from "./PromptInspection.js";
import type { PromptInvocationPayload } from "./PromptInvocationPayload.js";

export type DomainResult<TValue, TError extends PromptLibraryError = PromptLibraryError> =
  | {
      readonly kind: "success";
      readonly value: TValue;
    }
  | {
      readonly kind: "failure";
      readonly error: TError;
    };

export type PromptInvocationResult = DomainResult<PromptInvocationPayload>;
export type PromptInspectionResult = DomainResult<PromptInspection>;
export type PromptListResult = DomainResult<readonly PromptCommandSummary[]>;
