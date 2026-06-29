import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME } from "../../src/mcp/listPromptLibraryCommandsTool.js";
import { handleWorkerRequest } from "../../src/mcp/worker.js";

const MCP_URL = "https://project-prompt-library.example/mcp";
const PROTECTED_RESOURCE_METADATA_URL =
  "https://project-prompt-library.example/.well-known/oauth-protected-resource";
const ALLOWED_ORIGIN = "https://chatgpt.com";
const AUTHORIZATION_SERVER = "https://auth.example.com";
const BEARER_TOKEN = "test-oauth-access-token";

describe("Cloudflare Worker MCP endpoint", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fails closed when the Origin allow-list is not configured", async () => {
    const response = await handleWorkerRequest(
      new Request(MCP_URL, {
        method: "POST",
        headers: { Origin: ALLOWED_ORIGIN },
        body: "{}",
      }),
      {},
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: "origin_policy_not_configured",
    });
  });

  it("rejects requests from origins outside the allow-list", async () => {
    const response = await handleWorkerRequest(
      new Request(MCP_URL, {
        method: "POST",
        headers: { Origin: "https://example.com" },
        body: "{}",
      }),
      { PPL_ALLOWED_ORIGINS: ALLOWED_ORIGIN },
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: "origin_not_allowed",
    });
  });

  it("rejects disallowed Origin requests even when bearer auth is present", async () => {
    const response = await handleWorkerRequest(
      new Request(MCP_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
          Origin: "https://example.com",
        },
        body: "{}",
      }),
      {
        PPL_ALLOWED_ORIGINS: ALLOWED_ORIGIN,
        PPL_OAUTH_AUTHORIZATION_SERVERS: AUTHORIZATION_SERVER,
        PPL_OAUTH_BEARER_TOKEN: BEARER_TOKEN,
      },
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: "origin_not_allowed",
    });
  });

  it("challenges unauthenticated no-Origin requests instead of rejecting by Origin", async () => {
    const response = await handleWorkerRequest(
      new Request(MCP_URL, {
        method: "POST",
        body: "{}",
      }),
      {
        PPL_OAUTH_AUTHORIZATION_SERVERS: AUTHORIZATION_SERVER,
        PPL_OAUTH_BEARER_TOKEN: BEARER_TOKEN,
      },
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("WWW-Authenticate")).toBe(
      `Bearer resource_metadata="${PROTECTED_RESOURCE_METADATA_URL}"`,
    );
    await expect(response.json()).resolves.toMatchObject({
      error: "authentication_required",
    });
  });

  it("serves protected-resource metadata for OAuth discovery", async () => {
    const response = await handleWorkerRequest(
      new Request(PROTECTED_RESOURCE_METADATA_URL, {
        method: "GET",
      }),
      {
        PPL_OAUTH_AUTHORIZATION_SERVERS: AUTHORIZATION_SERVER,
        PPL_OAUTH_BEARER_TOKEN: BEARER_TOKEN,
        PPL_OAUTH_SCOPES: "prompt-library.invoke,prompt-library.inspect",
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      resource: MCP_URL,
      authorization_servers: [`${AUTHORIZATION_SERVER}/`],
      bearer_methods_supported: ["header"],
      scopes_supported: ["prompt-library.invoke", "prompt-library.inspect"],
    });
  });

  it("fails closed when the Origin allow-list is invalid", async () => {
    const response = await handleWorkerRequest(
      new Request(MCP_URL, {
        method: "POST",
        headers: { Origin: ALLOWED_ORIGIN },
        body: "{}",
      }),
      { PPL_ALLOWED_ORIGINS: "not an origin" },
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: "origin_policy_not_configured",
    });
  });

  it("serves the approved tools through Streamable HTTP when Origin is allowed", async () => {
    const client = new Client({
      name: "worker-mcp-contract-test",
      version: "0.0.0",
    });
    const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
      fetch: async (input, init) =>
        handleWorkerRequest(toRequestWithAllowedOrigin(input, init), {
          PPL_ALLOWED_ORIGINS: ALLOWED_ORIGIN,
        }),
      requestInit: {
        headers: {
          Origin: ALLOWED_ORIGIN,
        },
      },
    });

    // The SDK client transport type currently conflicts with exactOptionalPropertyTypes.
    await client.connect(transport as unknown as Transport);

    try {
      const tools = await client.listTools();

      expect(tools.tools.map((tool) => tool.name).sort()).toEqual([
        "inspect_prompt_library_command",
        "invoke_prompt_library_command",
        "list_prompt_library_commands",
      ]);

      const listResult = await client.callTool({
        name: LIST_PROMPT_LIBRARY_COMMANDS_TOOL_NAME,
        arguments: {},
      });

      expect(listResult.isError).not.toBe(true);
      expect(listResult.structuredContent).toMatchObject({
        ok: true,
        type: "prompt_command_list",
        commands: [
          expect.objectContaining({ command: "grill-me" }),
          expect.objectContaining({ command: "handoff" }),
          expect.objectContaining({ command: "spec-prompt-creator" }),
        ],
      });
    } finally {
      await client.close();
    }
  });

  it("serves the approved tools through Streamable HTTP when no-Origin auth succeeds", async () => {
    const client = new Client({
      name: "worker-mcp-contract-test",
      version: "0.0.0",
    });
    const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
      fetch: async (input, init) =>
        handleWorkerRequest(toRequest(input, init), {
          PPL_OAUTH_AUTHORIZATION_SERVERS: AUTHORIZATION_SERVER,
          PPL_OAUTH_BEARER_TOKEN: BEARER_TOKEN,
        }),
      requestInit: {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      },
    });

    // The SDK client transport type currently conflicts with exactOptionalPropertyTypes.
    await client.connect(transport as unknown as Transport);

    try {
      const tools = await client.listTools();

      expect(tools.tools.map((tool) => tool.name).sort()).toEqual([
        "inspect_prompt_library_command",
        "invoke_prompt_library_command",
        "list_prompt_library_commands",
      ]);
    } finally {
      await client.close();
    }
  });
});

function toRequest(input: string | URL | Request, init: RequestInit | undefined): Request {
  return new Request(input, init);
}

function toRequestWithAllowedOrigin(
  input: string | URL | Request,
  init: RequestInit | undefined,
): Request {
  const request = new Request(input, init);
  const headers = new Headers(request.headers);

  headers.set("Origin", ALLOWED_ORIGIN);

  return new Request(request, { headers });
}
