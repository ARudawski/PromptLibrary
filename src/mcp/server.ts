import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  createInspectPromptUseCase,
  createInvokePromptUseCase,
  createListPromptsUseCase,
  type FixtureBackedPromptDefinitionOptions,
  type InspectPromptUseCase,
  type InvokePromptUseCase,
  type ListPromptsUseCase,
  loadFixtureBackedPromptDefinitions,
} from "../application/index.js";
import { registerInspectPromptLibraryCommandTool } from "./inspectPromptLibraryCommandTool.js";
import { registerInvokePromptLibraryCommandTool } from "./invokePromptLibraryCommandTool.js";
import { registerListPromptLibraryCommandsTool } from "./listPromptLibraryCommandsTool.js";

export interface PromptLibraryServerOptions extends FixtureBackedPromptDefinitionOptions {
  readonly invokeUseCase?: InvokePromptUseCase;
  readonly inspectUseCase?: InspectPromptUseCase;
  readonly listUseCase?: ListPromptsUseCase;
}

export async function createPromptLibraryServer(
  options: PromptLibraryServerOptions = {},
): Promise<McpServer> {
  const server = new McpServer({
    name: "project-prompt-library",
    version: "0.0.0",
  });
  const fixtureBackedPrompts =
    options.invokeUseCase === undefined ||
    options.inspectUseCase === undefined ||
    options.listUseCase === undefined
      ? await loadFixtureBackedPromptDefinitions(options)
      : undefined;
  const invokeUseCase =
    options.invokeUseCase ?? createInvokePromptUseCase(fixtureBackedPrompts ?? []);
  const inspectUseCase =
    options.inspectUseCase ?? createInspectPromptUseCase(fixtureBackedPrompts ?? []);
  const listUseCase = options.listUseCase ?? createListPromptsUseCase(fixtureBackedPrompts ?? []);

  registerInvokePromptLibraryCommandTool(server, invokeUseCase);
  registerInspectPromptLibraryCommandTool(server, inspectUseCase);
  registerListPromptLibraryCommandsTool(server, listUseCase);

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
