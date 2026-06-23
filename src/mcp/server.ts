import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  createInspectPromptUseCase,
  createInvokePromptUseCase,
  createListPromptsUseCase,
  type FixtureBackedPromptDefinitionOptions,
  InspectPromptUseCase,
  InvokePromptUseCase,
  ListPromptsUseCase,
  loadFixtureBackedPromptDefinitions,
} from "../application/index.js";
import type { PromptIndex } from "../cache/index.js";
import { buildPromptIndex, PromptCache } from "../cache/index.js";
import {
  type LoadedPromptFile,
  LocalPromptFileSource,
  type LocalPromptFileSourceOptions,
  type PromptSource,
} from "../prompt-source/index.js";
import { registerInspectPromptLibraryCommandTool } from "./inspectPromptLibraryCommandTool.js";
import { registerInvokePromptLibraryCommandTool } from "./invokePromptLibraryCommandTool.js";
import { registerListPromptLibraryCommandsTool } from "./listPromptLibraryCommandsTool.js";

export interface PromptLibraryServerOptions extends FixtureBackedPromptDefinitionOptions {
  readonly invokeUseCase?: InvokePromptUseCase;
  readonly inspectUseCase?: InspectPromptUseCase;
  readonly listUseCase?: ListPromptsUseCase;
}

export type LocalPromptLibraryServerOptions = LocalPromptFileSourceOptions;

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

export async function createLocalPromptLibraryServer(
  options: LocalPromptLibraryServerOptions = {},
): Promise<McpServer> {
  const index = await loadLocalPromptIndex(options);

  return createPromptLibraryServer({
    invokeUseCase: new InvokePromptUseCase(index),
    inspectUseCase: new InspectPromptUseCase(index),
    listUseCase: new ListPromptsUseCase(index),
  });
}

async function loadLocalPromptIndex(
  options: LocalPromptLibraryServerOptions,
): Promise<PromptIndex> {
  const promptSource = new LocalPromptFileSource(options);
  const loadedPromptFiles = await promptSource.loadAllPrompts();

  if (loadedPromptFiles.length === 0) {
    return buildPromptIndex([]);
  }

  const promptCache = new PromptCache({
    promptSource: new SnapshotPromptSource(loadedPromptFiles),
  });
  const result = await promptCache.getIndex();

  if (result.kind === "success") {
    return result.index;
  }

  throw new Error(result.error.message, { cause: result.error.cause });
}

class SnapshotPromptSource implements PromptSource {
  readonly #loadedPromptFiles: readonly LoadedPromptFile[];

  public constructor(loadedPromptFiles: readonly LoadedPromptFile[]) {
    this.#loadedPromptFiles = loadedPromptFiles;
  }

  public async loadAllPrompts(): Promise<readonly LoadedPromptFile[]> {
    return this.#loadedPromptFiles;
  }
}

async function main(): Promise<void> {
  const server = await createLocalPromptLibraryServer();
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
