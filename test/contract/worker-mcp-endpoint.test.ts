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
const INTROSPECTION_URL = "https://auth.example.com/oauth/introspect";
const OAUTH_ACCESS_TOKEN = "test-oauth-access-token";
const REQUIRED_SCOPE = "prompt-library.invoke";
const TOKEN_EXPIRATION = 2_000_000_000;

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
          Authorization: `Bearer ${OAUTH_ACCESS_TOKEN}`,
          Origin: "https://example.com",
        },
        body: "{}",
      }),
      {
        PPL_ALLOWED_ORIGINS: ALLOWED_ORIGIN,
        PPL_OAUTH_AUTHORIZATION_SERVERS: AUTHORIZATION_SERVER,
        PPL_OAUTH_TOKEN_INTROSPECTION_URL: INTROSPECTION_URL,
      },
      {
        fetch: vi.fn(async () => {
          throw new Error("introspection must not run for disallowed Origin requests");
        }),
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
        PPL_OAUTH_TOKEN_INTROSPECTION_URL: INTROSPECTION_URL,
      },
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("WWW-Authenticate")).toContain(
      `resource_metadata="${PROTECTED_RESOURCE_METADATA_URL}"`,
    );
    expect(response.headers.get("WWW-Authenticate")).toContain('error="invalid_token"');
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
    const introspectionFetch = createIntrospectionFetch({
      active: true,
      aud: MCP_URL,
      exp: TOKEN_EXPIRATION,
      iss: `${AUTHORIZATION_SERVER}/`,
      scope: REQUIRED_SCOPE,
    });
    const client = new Client({
      name: "worker-mcp-contract-test",
      version: "0.0.0",
    });
    const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
      fetch: async (input, init) =>
        handleWorkerRequest(
          toRequest(input, init),
          {
            PPL_OAUTH_AUTHORIZATION_SERVERS: AUTHORIZATION_SERVER,
            PPL_OAUTH_SCOPES: REQUIRED_SCOPE,
            PPL_OAUTH_TOKEN_INTROSPECTION_URL: INTROSPECTION_URL,
          },
          {
            fetch: introspectionFetch,
            nowSeconds: () => TOKEN_EXPIRATION - 60,
          },
        ),
      requestInit: {
        headers: {
          Authorization: `Bearer ${OAUTH_ACCESS_TOKEN}`,
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
      expect(introspectionFetch).toHaveBeenCalled();
    } finally {
      await client.close();
    }
  });

  it("rejects no-Origin requests when OAuth introspection returns an inactive token", async () => {
    const response = await handleWorkerRequest(
      new Request(MCP_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OAUTH_ACCESS_TOKEN}`,
        },
        body: "{}",
      }),
      {
        PPL_OAUTH_AUTHORIZATION_SERVERS: AUTHORIZATION_SERVER,
        PPL_OAUTH_TOKEN_INTROSPECTION_URL: INTROSPECTION_URL,
      },
      {
        fetch: createIntrospectionFetch({ active: false }),
      },
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("WWW-Authenticate")).toContain('error="invalid_token"');
    await expect(response.json()).resolves.toMatchObject({
      error: "authentication_required",
    });
  });

  it("rejects no-Origin requests when OAuth token audience does not match the MCP resource", async () => {
    const response = await handleWorkerRequest(
      new Request(MCP_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OAUTH_ACCESS_TOKEN}`,
        },
        body: "{}",
      }),
      {
        PPL_OAUTH_AUTHORIZATION_SERVERS: AUTHORIZATION_SERVER,
        PPL_OAUTH_TOKEN_INTROSPECTION_URL: INTROSPECTION_URL,
      },
      {
        fetch: createIntrospectionFetch({
          active: true,
          aud: "https://other.example.com/mcp",
          exp: TOKEN_EXPIRATION,
          iss: `${AUTHORIZATION_SERVER}/`,
        }),
        nowSeconds: () => TOKEN_EXPIRATION - 60,
      },
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: "authentication_required",
    });
  });

  it("rejects no-Origin requests when OAuth token issuer is not trusted", async () => {
    const response = await handleWorkerRequest(
      new Request(MCP_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OAUTH_ACCESS_TOKEN}`,
        },
        body: "{}",
      }),
      {
        PPL_OAUTH_AUTHORIZATION_SERVERS: AUTHORIZATION_SERVER,
        PPL_OAUTH_TOKEN_INTROSPECTION_URL: INTROSPECTION_URL,
      },
      {
        fetch: createIntrospectionFetch({
          active: true,
          aud: MCP_URL,
          exp: TOKEN_EXPIRATION,
          iss: "https://other-auth.example.com/",
        }),
        nowSeconds: () => TOKEN_EXPIRATION - 60,
      },
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: "authentication_required",
    });
  });

  it("rejects no-Origin requests when OAuth token is expired", async () => {
    const response = await handleWorkerRequest(
      new Request(MCP_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OAUTH_ACCESS_TOKEN}`,
        },
        body: "{}",
      }),
      {
        PPL_OAUTH_AUTHORIZATION_SERVERS: AUTHORIZATION_SERVER,
        PPL_OAUTH_TOKEN_INTROSPECTION_URL: INTROSPECTION_URL,
      },
      {
        fetch: createIntrospectionFetch({
          active: true,
          aud: MCP_URL,
          exp: TOKEN_EXPIRATION,
          iss: `${AUTHORIZATION_SERVER}/`,
        }),
        nowSeconds: () => TOKEN_EXPIRATION,
      },
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: "authentication_required",
    });
  });

  it("rejects no-Origin requests when OAuth token scopes are insufficient", async () => {
    const response = await handleWorkerRequest(
      new Request(MCP_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OAUTH_ACCESS_TOKEN}`,
        },
        body: "{}",
      }),
      {
        PPL_OAUTH_AUTHORIZATION_SERVERS: AUTHORIZATION_SERVER,
        PPL_OAUTH_SCOPES: REQUIRED_SCOPE,
        PPL_OAUTH_TOKEN_INTROSPECTION_URL: INTROSPECTION_URL,
      },
      {
        fetch: createIntrospectionFetch({
          active: true,
          aud: MCP_URL,
          exp: TOKEN_EXPIRATION,
          iss: `${AUTHORIZATION_SERVER}/`,
          scope: "prompt-library.inspect",
        }),
        nowSeconds: () => TOKEN_EXPIRATION - 60,
      },
    );

    expect(response.status).toBe(403);
    expect(response.headers.get("WWW-Authenticate")).toContain('error="insufficient_scope"');
    expect(response.headers.get("WWW-Authenticate")).toContain(`scope="${REQUIRED_SCOPE}"`);
    await expect(response.json()).resolves.toMatchObject({
      error: "insufficient_scope",
    });
  });
});

function createIntrospectionFetch(responseBody: Record<string, unknown>): typeof fetch {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const request = new Request(input, init);
    const body = await request.text();
    const params = new URLSearchParams(body);

    expect(request.url).toBe(INTROSPECTION_URL);
    expect(request.method).toBe("POST");
    expect(params.get("token")).toBe(OAUTH_ACCESS_TOKEN);
    expect(params.get("token_type_hint")).toBe("access_token");
    expect(params.get("resource")).toBe(MCP_URL);

    return new Response(JSON.stringify(responseBody), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }) as unknown as typeof fetch;
}

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
