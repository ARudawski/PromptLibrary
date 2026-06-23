import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import type { InspectPromptInput, InspectPromptUseCase } from "../application/index.js";
import {
  INPUT_MODES,
  PROMPT_LIFECYCLES,
  PROMPT_STATUSES,
  type PromptErrorReason,
} from "../domain/index.js";

export const INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME = "inspect_prompt_library_command";

const inspectInputSchema = z
  .object({
    command: z.string().min(1).describe("Prompt Library command to inspect."),
  })
  .strict();

const INSPECT_ERROR_CODES = [
  "PROMPT_NOT_FOUND",
  "PROMPT_AMBIGUOUS",
  "PROMPT_NOT_INVOKABLE",
  "PROMPT_INVALID",
  "PROMPT_LIBRARY_INVALID",
] as const;

const promptMetadataOutputSchema = z
  .object({
    schema_version: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    aliases: z.array(z.string()),
    lifecycle: z.enum(PROMPT_LIFECYCLES),
    input_mode: z.enum(INPUT_MODES),
    status: z.enum(PROMPT_STATUSES).optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().optional(),
    debug_marker: z.string().optional(),
    prompt_version: z.string().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .strict();

export const inspectOutputSchema = z
  .object({
    ok: z.literal(true),
    type: z.literal("prompt_inspection"),
    inspection_only: z.literal(true),
    no_prompt_invoked: z.literal(true),
    metadata: promptMetadataOutputSchema,
    prompt_body: z.string(),
  })
  .strict();

type InspectPromptFailureErrorCode = (typeof INSPECT_ERROR_CODES)[number];

export interface InspectPromptFailureContent {
  readonly ok: false;
  readonly type: "prompt_inspection_error";
  readonly inspection_only: true;
  readonly no_prompt_invoked: true;
  readonly error_code: InspectPromptFailureErrorCode;
  readonly message: string;
  readonly suggestions?: readonly string[];
}

export function registerInspectPromptLibraryCommandTool(
  server: McpServer,
  useCase: InspectPromptUseCase,
): void {
  server.registerTool(
    INSPECT_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
    {
      title: "Inspect Prompt Library Command",
      description:
        "Inspects an active Prompt Library command by exact slug or alias without invoking it.",
      inputSchema: inspectInputSchema,
      outputSchema: inspectOutputSchema,
    },
    (input) => inspectPromptLibraryCommand(useCase, normalizeInspectPromptInput(input)),
  );
}

export function inspectPromptLibraryCommand(
  useCase: InspectPromptUseCase,
  input: InspectPromptInput,
): CallToolResult {
  const result = useCase.execute(input);

  if (result.kind === "success") {
    return {
      structuredContent: {
        ok: true,
        type: "prompt_inspection",
        inspection_only: true,
        no_prompt_invoked: true,
        metadata: result.value.metadata,
        prompt_body: result.value.prompt_body,
      },
      content: [
        {
          type: "text",
          text: `Inspection only; no prompt was invoked. Prompt inspected: ${result.value.metadata.title}.`,
        },
      ],
    };
  }

  const failureContent: InspectPromptFailureContent = {
    ok: false,
    type: "prompt_inspection_error",
    inspection_only: true,
    no_prompt_invoked: true,
    error_code: errorCodeForReason(result.error.reason),
    message: result.error.message,
    ...(result.error.suggestions === undefined ? {} : { suggestions: result.error.suggestions }),
  };

  // SDK clients validate any returned structuredContent against the advertised success schema
  // after listTools(), so inspect failures keep their stable contract in model-visible text.
  return {
    isError: true,
    content: [
      {
        type: "text",
        text: formatFailureContent(failureContent),
      },
    ],
  };
}

function formatFailureContent(failureContent: InspectPromptFailureContent): string {
  const suggestions =
    failureContent.suggestions === undefined
      ? ""
      : `\nsuggestions: ${failureContent.suggestions.join(", ")}`;

  return [
    "Inspection failed; no prompt was invoked.",
    "inspection_only: true",
    "no_prompt_invoked: true",
    `error_code: ${failureContent.error_code}`,
    `message: ${failureContent.message}${suggestions}`,
  ].join("\n");
}

function errorCodeForReason(reason: PromptErrorReason): InspectPromptFailureErrorCode {
  switch (reason) {
    case "command_not_found":
      return "PROMPT_NOT_FOUND";
    case "command_ambiguous":
      return "PROMPT_AMBIGUOUS";
    case "prompt_not_invokable":
      return "PROMPT_NOT_INVOKABLE";
    case "prompt_invalid":
      return "PROMPT_INVALID";
    case "library_invalid":
      return "PROMPT_LIBRARY_INVALID";
  }
}

function normalizeInspectPromptInput(input: { readonly command: string }): InspectPromptInput {
  return { command: input.command };
}
