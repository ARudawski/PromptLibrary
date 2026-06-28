import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InspectPromptUseCase } from "../application/InspectPromptUseCase.js";
import { InvokePromptUseCase } from "../application/InvokePromptUseCase.js";
import { ListPromptsUseCase } from "../application/ListPromptsUseCase.js";
import type { PromptIndex } from "../cache/index.js";
import { buildPromptIndex, PromptCache } from "../cache/index.js";
import type { PromptSource } from "../prompt-source/PromptSource.js";
import { registerInspectPromptLibraryCommandTool } from "./inspectPromptLibraryCommandTool.js";
import { registerInvokePromptLibraryCommandTool } from "./invokePromptLibraryCommandTool.js";
import { registerListPromptLibraryCommandsTool } from "./listPromptLibraryCommandsTool.js";

export async function createPromptLibraryServerFromSource(
  promptSource: PromptSource,
): Promise<McpServer> {
  const index = await loadPromptIndexFromSource(promptSource);
  const server = new McpServer({
    name: "project-prompt-library",
    version: "0.0.0",
  });

  registerInvokePromptLibraryCommandTool(server, new InvokePromptUseCase(index));
  registerInspectPromptLibraryCommandTool(server, new InspectPromptUseCase(index));
  registerListPromptLibraryCommandsTool(server, new ListPromptsUseCase(index));

  return server;
}

async function loadPromptIndexFromSource(promptSource: PromptSource): Promise<PromptIndex> {
  const loadedPromptFiles = await promptSource.loadAllPrompts();

  if (loadedPromptFiles.length === 0) {
    return buildPromptIndex([]);
  }

  const promptCache = new PromptCache({
    promptSource,
  });
  const result = await promptCache.getIndex();

  if (result.kind === "success") {
    return result.index;
  }

  throw new Error(result.error.message, { cause: result.error.cause });
}
