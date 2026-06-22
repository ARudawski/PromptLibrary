import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  createFixtureBackedInspectPromptUseCase,
  createFixtureBackedInvokePromptUseCase,
  type FixtureBackedInvokePromptUseCaseOptions,
  type InspectPromptUseCase,
  type InvokePromptUseCase,
} from "../application/index.js";
import { registerInspectPromptLibraryCommandTool } from "./inspectPromptLibraryCommandTool.js";
import { registerInvokePromptLibraryCommandTool } from "./invokePromptLibraryCommandTool.js";

export interface PromptLibraryServerOptions extends FixtureBackedInvokePromptUseCaseOptions {
  readonly invokeUseCase?: InvokePromptUseCase;
  readonly inspectUseCase?: InspectPromptUseCase;
}

export async function createPromptLibraryServer(
  options: PromptLibraryServerOptions = {},
): Promise<McpServer> {
  const server = new McpServer({
    name: "project-prompt-library",
    version: "0.0.0",
  });
  const invokeUseCase =
    options.invokeUseCase ?? (await createFixtureBackedInvokePromptUseCase(options));
  const inspectUseCase =
    options.inspectUseCase ?? (await createFixtureBackedInspectPromptUseCase(options));

  registerInvokePromptLibraryCommandTool(server, invokeUseCase);
  registerInspectPromptLibraryCommandTool(server, inspectUseCase);

  return server;
}

async function main(): Promise<void> {
  const server = await createPromptLibraryServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

const entrypoint =
  process.argv[1] === undefined ? undefined : pathToFileURL(resolve(process.argv[1])).href;

if (import.meta.url === entrypoint) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
