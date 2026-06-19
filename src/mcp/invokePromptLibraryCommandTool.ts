import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import type { InvokePromptInput, InvokePromptUseCase } from "../application/index.js";
import { INPUT_MODES, PROMPT_LIFECYCLES, type PromptErrorReason } from "../domain/index.js";

export const INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME = "invoke_prompt_library_command";

const invokeInputSchema = {
  command: z.string().min(1).describe("Prompt Library command to invoke."),
  attached_input: z.string().optional().describe("Optional user text attached to the command."),
};

const INVOKE_ERROR_CODES = [
  "PROMPT_NOT_FOUND",
  "PROMPT_AMBIGUOUS",
  "PROMPT_NOT_INVOKABLE",
  "PROMPT_INVALID",
  "PROMPT_LIBRARY_INVALID",
] as const;

export const invokeOutputSchema = z
  .object({
    title: z.string(),
    lifecycle: z.enum(PROMPT_LIFECYCLES),
    input_mode: z.enum(INPUT_MODES),
    prompt_body: z.string(),
  })
  .strict();

type InvokePromptFailureErrorCode = (typeof INVOKE_ERROR_CODES)[number];

export interface InvokePromptFailureContent {
  readonly no_prompt_invoked: true;
  readonly error_code: InvokePromptFailureErrorCode;
  readonly message: string;
  readonly suggestions?: readonly string[];
}

export function registerInvokePromptLibraryCommandTool(
  server: McpServer,
  useCase: InvokePromptUseCase,
): void {
  server.registerTool(
    INVOKE_PROMPT_LIBRARY_COMMAND_TOOL_NAME,
    {
      title: "Invoke Prompt Library Command",
      description:
        "Invokes an active fixture-backed Prompt Library command by exact slug or alias.",
      inputSchema: invokeInputSchema,
      outputSchema: invokeOutputSchema,
    },
    (input) => invokePromptLibraryCommand(useCase, normalizeInvokePromptInput(input)),
  );
}

export function invokePromptLibraryCommand(
  useCase: InvokePromptUseCase,
  input: InvokePromptInput,
): CallToolResult {
  const result = useCase.execute(input);

  if (result.kind === "success") {
    return {
      structuredContent: {
        title: result.value.title,
        lifecycle: result.value.lifecycle,
        input_mode: result.value.input_mode,
        prompt_body: result.value.prompt_body,
      },
      content: [
        {
          type: "text",
          text: `Prompt invoked: ${result.value.title}.`,
        },
      ],
    };
  }

  const failureContent: InvokePromptFailureContent = {
    no_prompt_invoked: true,
    error_code: errorCodeForReason(result.error.reason),
    message: result.error.message,
    ...(result.error.suggestions === undefined ? {} : { suggestions: result.error.suggestions }),
  };

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

function formatFailureContent(failureContent: InvokePromptFailureContent): string {
  const suggestions =
    failureContent.suggestions === undefined
      ? ""
      : `\nsuggestions: ${failureContent.suggestions.join(", ")}`;

  return [
    "No prompt invoked.",
    "no_prompt_invoked: true",
    `error_code: ${failureContent.error_code}`,
    `message: ${failureContent.message}${suggestions}`,
  ].join("\n");
}

function errorCodeForReason(reason: PromptErrorReason): InvokePromptFailureErrorCode {
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

function normalizeInvokePromptInput(input: {
  readonly command: string;
  readonly attached_input?: string | undefined;
}): InvokePromptInput {
  return input.attached_input === undefined
    ? { command: input.command }
    : { command: input.command, attached_input: input.attached_input };
}
