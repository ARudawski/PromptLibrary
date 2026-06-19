import { type ZodIssue, z } from "zod";
import {
  INPUT_MODES,
  PROMPT_LIFECYCLES,
  PROMPT_STATUSES,
  type PromptDefinition,
  type PromptMetadata,
} from "../domain/index.js";
import type { ParsedPromptMarkdown } from "../prompt-parser/index.js";
import type {
  PromptValidationIssue,
  PromptValidationIssueCode,
  PromptValidationResult,
} from "./ValidationError.js";

export const PROMPT_COMMAND_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const nonEmptyStringSchema = z.string().min(1);
const commandNameSchema = z.string().regex(PROMPT_COMMAND_NAME_PATTERN);

const promptMetadataSchema = z
  .object({
    schema_version: nonEmptyStringSchema,
    slug: commandNameSchema,
    title: nonEmptyStringSchema,
    description: nonEmptyStringSchema,
    aliases: z.array(commandNameSchema),
    lifecycle: z.enum(PROMPT_LIFECYCLES),
    input_mode: z.enum(INPUT_MODES),
    status: z.enum(PROMPT_STATUSES).optional(),
    tags: z.array(nonEmptyStringSchema).optional(),
    notes: z.string().optional(),
    debug_marker: z.string().optional(),
    prompt_version: z.string().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .strict();

type ValidPromptMetadata = z.infer<typeof promptMetadataSchema>;

export function validatePromptDefinition(
  parsedPrompt: ParsedPromptMarkdown,
): PromptValidationResult {
  const metadataResult = promptMetadataSchema.safeParse(parsedPrompt.metadata);
  const issues: PromptValidationIssue[] = [];

  if (!metadataResult.success) {
    issues.push(...metadataResult.error.issues.map(mapZodIssue));
  }

  if (parsedPrompt.promptBody.trim().length === 0) {
    issues.push({
      code: "empty_prompt_body",
      field: "promptBody",
      message: "Prompt body must not be empty.",
    });
  }

  const metadata = metadataResult.success ? metadataResult.data : undefined;

  if (metadata === undefined || issues.length > 0) {
    return {
      kind: "failure",
      issues,
    };
  }

  return {
    kind: "success",
    prompt: {
      metadata: toPromptMetadata(metadata),
      promptBody: parsedPrompt.promptBody,
    } satisfies PromptDefinition,
  };
}

function toPromptMetadata(metadata: ValidPromptMetadata): PromptMetadata {
  return {
    schema_version: metadata.schema_version,
    slug: metadata.slug,
    title: metadata.title,
    description: metadata.description,
    aliases: metadata.aliases,
    lifecycle: metadata.lifecycle,
    input_mode: metadata.input_mode,
    ...(metadata.status === undefined ? {} : { status: metadata.status }),
    ...(metadata.tags === undefined ? {} : { tags: metadata.tags }),
    ...(metadata.notes === undefined ? {} : { notes: metadata.notes }),
    ...(metadata.debug_marker === undefined ? {} : { debug_marker: metadata.debug_marker }),
    ...(metadata.prompt_version === undefined ? {} : { prompt_version: metadata.prompt_version }),
    ...(metadata.created_at === undefined ? {} : { created_at: metadata.created_at }),
    ...(metadata.updated_at === undefined ? {} : { updated_at: metadata.updated_at }),
  };
}

function mapZodIssue(issue: ZodIssue): PromptValidationIssue {
  if (issue.code === "unrecognized_keys") {
    const firstUnknownKey = issue.keys[0] ?? "metadata";

    return {
      code: "unknown_metadata_field",
      field: firstUnknownKey,
      message: "Prompt metadata contains an unknown field.",
    };
  }

  const field = issue.path.map(String).join(".");
  const code = promptValidationCodeForIssue(issue, field);
  const message = validationMessageForCode(code);

  return field.length > 0 ? { code, field, message } : { code, message };
}

function promptValidationCodeForIssue(issue: ZodIssue, field: string): PromptValidationIssueCode {
  if (issue.code === "invalid_type" && issue.received === "undefined") {
    return "missing_required_field";
  }

  if (field === "lifecycle") {
    return "invalid_lifecycle";
  }

  if (field === "input_mode") {
    return "invalid_input_mode";
  }

  if (field === "status") {
    return "invalid_status";
  }

  if (field === "slug") {
    return "invalid_slug";
  }

  if (field === "aliases" || field.startsWith("aliases.")) {
    return "invalid_alias";
  }

  return "invalid_field_type";
}

function validationMessageForCode(code: PromptValidationIssueCode): string {
  switch (code) {
    case "missing_required_field":
      return "Prompt metadata is missing a required field.";
    case "invalid_lifecycle":
      return "Prompt lifecycle must be one of the approved values.";
    case "invalid_input_mode":
      return "Prompt input_mode must be one of the approved values.";
    case "invalid_status":
      return "Prompt status must be active or draft when present.";
    case "invalid_slug":
      return "Prompt slug must be lowercase kebab-case.";
    case "invalid_alias":
      return "Prompt aliases must be lowercase kebab-case.";
    case "unknown_metadata_field":
      return "Prompt metadata contains an unknown field.";
    case "empty_prompt_body":
      return "Prompt body must not be empty.";
    case "invalid_field_type":
      return "Prompt metadata field has an invalid type.";
  }
}
