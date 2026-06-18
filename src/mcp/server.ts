import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const PROOF_COMMAND = "proof";

export const PROOF_PROMPT = `You are running the Project Prompt Library proof workflow.
Ask exactly one clarifying question about the user's input.
Do not answer or solve the user's topic yet.
End your response with: PPL-PROOF-001`;

const invocationInputSchema = {
  command: z
    .string()
    .describe("Explicit prompt-library command to invoke. Slice 0 supports only proof."),
  attached_input: z
    .string()
    .optional()
    .describe("Optional user text attached to the explicit command."),
};

const invocationOutputSchema = {
  title: z.string(),
  lifecycle: z.string(),
  input_mode: z.string(),
  prompt_body: z.string(),
};

type InvocationInput = {
  command: string;
  attached_input?: string | undefined;
};

export function invokePromptLibraryCommand(input: InvocationInput): CallToolResult {
  if (input.command !== PROOF_COMMAND) {
    return {
      isError: true,
      structuredContent: {
        no_prompt_invoked: true,
        error: "Unknown prompt-library command. Slice 0 supports only command: proof.",
      },
      content: [
        {
          type: "text",
          text: "No prompt invoked: unknown command.",
        },
      ],
    };
  }

  return {
    structuredContent: {
      title: "Project Prompt Library Proof",
      lifecycle: "one_shot_proof",
      input_mode: "optional_attached_input",
      prompt_body: PROOF_PROMPT,
    },
    content: [
      {
        type: "text",
        text: `Proof prompt retrieved.\n\n${PROOF_PROMPT}`,
      },
    ],
  };
}

export function createPromptLibraryProofServer(): McpServer {
  const server = new McpServer({
    name: "project-prompt-library-slice-0",
    version: "0.0.0",
  });

  server.registerTool(
    "invoke_prompt_library_command",
    {
      title: "Invoke Prompt Library Command",
      description:
        "Slice 0 proof tool. Invoke only an explicit prompt-library command. Supports command: proof.",
      inputSchema: invocationInputSchema,
      outputSchema: invocationOutputSchema,
    },
    (input) => invokePromptLibraryCommand(input),
  );

  return server;
}

async function main(): Promise<void> {
  const server = createPromptLibraryProofServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
