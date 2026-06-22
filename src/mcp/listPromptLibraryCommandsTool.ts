import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import type { ListPromptsUseCase } from "../application/index.js";
import { INPUT_MODES, PROMPT_LIFECYCLES } from "../domain/index.js";

export const LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME = "list_prompt_library_commands";

const listInputSchema = z.object({}).strict();

const promptCommandSummaryOutputSchema = z
  .object({
    command: z.string(),
    title: z.string(),
    description: z.string(),
    aliases: z.array(z.string()),
    lifecycle: z.enum(PROMPT_LIFECYCLES),
    input_mode: z.enum(INPUT_MODES),
  })
  .strict();

export const listOutputSchema = z
  .object({
    ok: z.literal(true),
    type: z.literal("prompt_command_list"),
    commands: z.array(promptCommandSummaryOutputSchema),
  })
  .strict();

export interface ListPromptFailureContent {
  readonly ok: false;
  readonly type: "prompt_command_list_error";
  readonly no_prompt_invoked: true;
  readonly error_code: "PROMPT_LIBRARY_INVALID";
  readonly message: string;
}

export function registerListPromptLibraryCommandsTool(
  server: McpServer,
  useCase: ListPromptsUseCase,
): void {
  server.registerTool(
    LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME,
    {
      title: "List Prompt Library Commands",
      description:
        "Lists active fixture-backed Prompt Library commands for discovery without returning prompt bodies.",
      inputSchema: listInputSchema,
      outputSchema: listOutputSchema,
    },
    () => listPromptLibraryCommands(useCase),
  );
}

export function listPromptLibraryCommands(useCase: ListPromptsUseCase): CallToolResult {
  const result = useCase.execute();

  if (result.kind === "success") {
    return {
      structuredContent: {
        ok: true,
        type: "prompt_command_list",
        commands: result.value,
      },
      content: [
        {
          type: "text",
          text: "Available active Prompt Library commands listed.",
        },
      ],
    };
  }

  const failureContent: ListPromptFailureContent = {
    ok: false,
    type: "prompt_command_list_error",
    no_prompt_invoked: true,
    error_code: "PROMPT_LIBRARY_INVALID",
    message: result.error.message,
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

function formatFailureContent(failureContent: ListPromptFailureContent): string {
  return [
    "Command list failed; no prompt was invoked.",
    "no_prompt_invoked: true",
    `error_code: ${failureContent.error_code}`,
    `message: ${failureContent.message}`,
  ].join("\n");
}
