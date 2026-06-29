import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { StaticPromptSource } from "../prompt-source/StaticPromptSource.js";
import { createPromptLibraryServerFromSource } from "./createPromptLibraryServerFromSource.js";
import { BUNDLED_PROMPT_FILES } from "./workerPromptCatalog.generated.js";

const MCP_PATH = "/mcp";
const HEALTH_PATH = "/health";
const PROTECTED_RESOURCE_METADATA_PATH = "/.well-known/oauth-protected-resource";

const CORS_ALLOWED_HEADERS = [
  "authorization",
  "content-type",
  "last-event-id",
  "mcp-protocol-version",
  "mcp-session-id",
].join(", ");
const CORS_EXPOSED_HEADERS = ["mcp-protocol-version", "mcp-session-id"].join(", ");
const MCP_ALLOWED_METHODS = "GET, POST, DELETE, OPTIONS";

export interface WorkerEnv {
  readonly PPL_ALLOWED_ORIGINS?: string;
  readonly PPL_OAUTH_AUTHORIZATION_SERVERS?: string;
  readonly PPL_OAUTH_BEARER_TOKEN?: string;
  readonly PPL_OAUTH_RESOURCE?: string;
  readonly PPL_OAUTH_SCOPES?: string;
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    return handleWorkerRequest(request, env);
  },
};

export async function handleWorkerRequest(
  request: Request,
  env: WorkerEnv = {},
): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === HEALTH_PATH) {
    return handleHealthRequest(request);
  }

  if (isProtectedResourceMetadataPath(url.pathname)) {
    return handleProtectedResourceMetadataRequest(request, env);
  }

  if (url.pathname !== MCP_PATH) {
    return jsonResponse({ ok: false, error: "not_found" }, { status: 404 });
  }

  const accessPolicy = evaluateMcpAccessPolicy(request, env);

  if (accessPolicy.kind !== "allowed") {
    return accessPolicy.response;
  }

  if (request.method === "OPTIONS") {
    return withMcpCorsIfNeeded(new Response(null, { status: 204 }), accessPolicy.corsOrigin);
  }

  const transport = new WebStandardStreamableHTTPServerTransport();
  const server = await createPromptLibraryServerFromSource(
    new StaticPromptSource(BUNDLED_PROMPT_FILES),
  );

  await server.connect(transport);

  const response = await transport.handleRequest(request);

  return withMcpCorsIfNeeded(response, accessPolicy.corsOrigin);
}

function handleHealthRequest(request: Request): Response {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return jsonResponse({ ok: false, error: "method_not_allowed" }, { status: 405 });
  }

  return jsonResponse({
    ok: true,
    service: "project-prompt-library",
    transport: "cloudflare-worker",
  });
}

type OriginPolicy =
  | {
      readonly kind: "allowed";
      readonly origin: string;
    }
  | {
      readonly kind: "rejected";
      readonly response: Response;
    };

type McpAccessPolicy =
  | {
      readonly kind: "allowed";
      readonly corsOrigin?: string;
    }
  | {
      readonly kind: "rejected";
      readonly response: Response;
    };

function evaluateMcpAccessPolicy(request: Request, env: WorkerEnv): McpAccessPolicy {
  const origin = request.headers.get("origin");

  if (origin !== null) {
    const originPolicy = evaluateOriginPolicy(request, env.PPL_ALLOWED_ORIGINS);

    if (originPolicy.kind !== "allowed") {
      return originPolicy;
    }

    return {
      kind: "allowed",
      corsOrigin: originPolicy.origin,
    };
  }

  return evaluateNoOriginAuthorizationPolicy(request, env);
}

function evaluateOriginPolicy(
  request: Request,
  configuredAllowedOrigins: string | undefined,
): OriginPolicy {
  const allowedOrigins = parseAllowedOrigins(configuredAllowedOrigins);

  if (allowedOrigins.length === 0) {
    return {
      kind: "rejected",
      response: jsonResponse(
        {
          ok: false,
          error: "origin_policy_not_configured",
          message: "PPL_ALLOWED_ORIGINS must be configured before /mcp is exposed.",
        },
        { status: 503 },
      ),
    };
  }

  const origin = request.headers.get("origin");

  if (origin === null || !allowedOrigins.includes(origin)) {
    return {
      kind: "rejected",
      response: jsonResponse(
        {
          ok: false,
          error: "origin_not_allowed",
          message: "The request Origin is not allowed for this MCP endpoint.",
        },
        { status: 403 },
      ),
    };
  }

  return {
    kind: "allowed",
    origin,
  };
}

function evaluateNoOriginAuthorizationPolicy(request: Request, env: WorkerEnv): McpAccessPolicy {
  const metadata = buildProtectedResourceMetadata(request, env);

  if (metadata.kind !== "configured") {
    return metadata;
  }

  const expectedToken = env.PPL_OAUTH_BEARER_TOKEN?.trim();

  if (expectedToken === undefined || expectedToken.length === 0) {
    return {
      kind: "rejected",
      response: jsonResponse(
        {
          ok: false,
          error: "oauth_policy_not_configured",
          message:
            "PPL_OAUTH_BEARER_TOKEN must be configured before no-Origin /mcp access is exposed.",
        },
        { status: 503 },
      ),
    };
  }

  const suppliedToken = parseBearerToken(request.headers.get("authorization"));

  if (suppliedToken === null || !tokensMatch(suppliedToken, expectedToken)) {
    return {
      kind: "rejected",
      response: jsonResponse(
        {
          ok: false,
          error: "authentication_required",
          message: "Bearer-token authorization is required for no-Origin MCP requests.",
        },
        {
          status: 401,
          headers: {
            "WWW-Authenticate": buildBearerChallenge(metadata.metadataUrl),
          },
        },
      ),
    };
  }

  return { kind: "allowed" };
}

function parseAllowedOrigins(value: string | undefined): readonly string[] {
  if (value === undefined) {
    return [];
  }

  const allowedOrigins: string[] = [];

  for (const rawOrigin of value.split(",")) {
    const origin = rawOrigin.trim();

    if (origin.length === 0) {
      continue;
    }

    try {
      allowedOrigins.push(new URL(origin).origin);
    } catch {
      return [];
    }
  }

  return allowedOrigins;
}

function isProtectedResourceMetadataPath(pathname: string): boolean {
  return (
    pathname === PROTECTED_RESOURCE_METADATA_PATH ||
    pathname === `${PROTECTED_RESOURCE_METADATA_PATH}${MCP_PATH}`
  );
}

function handleProtectedResourceMetadataRequest(request: Request, env: WorkerEnv): Response {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return jsonResponse({ ok: false, error: "method_not_allowed" }, { status: 405 });
  }

  const metadata = buildProtectedResourceMetadata(request, env);

  if (metadata.kind !== "configured") {
    return metadata.response;
  }

  return jsonResponse(metadata.body);
}

type ProtectedResourceMetadata =
  | {
      readonly kind: "configured";
      readonly metadataUrl: string;
      readonly body: {
        readonly resource: string;
        readonly authorization_servers: readonly string[];
        readonly bearer_methods_supported: readonly ["header"];
        readonly scopes_supported?: readonly string[];
      };
    }
  | {
      readonly kind: "rejected";
      readonly response: Response;
    };

function buildProtectedResourceMetadata(
  request: Request,
  env: WorkerEnv,
): ProtectedResourceMetadata {
  const requestUrl = new URL(request.url);
  const authorizationServers = parseUrlList(env.PPL_OAUTH_AUTHORIZATION_SERVERS);

  if (authorizationServers.length === 0) {
    return {
      kind: "rejected",
      response: jsonResponse(
        {
          ok: false,
          error: "oauth_policy_not_configured",
          message:
            "PPL_OAUTH_AUTHORIZATION_SERVERS must be configured before no-Origin /mcp access is exposed.",
        },
        { status: 503 },
      ),
    };
  }

  const resource = parseResourceUrl(env.PPL_OAUTH_RESOURCE, requestUrl);

  if (resource === null) {
    return {
      kind: "rejected",
      response: jsonResponse(
        {
          ok: false,
          error: "oauth_policy_not_configured",
          message: "PPL_OAUTH_RESOURCE must be an absolute URL when configured.",
        },
        { status: 503 },
      ),
    };
  }

  const scopes = parseTokenList(env.PPL_OAUTH_SCOPES);
  const body = {
    resource,
    authorization_servers: authorizationServers,
    bearer_methods_supported: ["header"] as const,
    ...(scopes.length > 0 ? { scopes_supported: scopes } : {}),
  };

  return {
    kind: "configured",
    metadataUrl: `${requestUrl.origin}${PROTECTED_RESOURCE_METADATA_PATH}`,
    body,
  };
}

function parseUrlList(value: string | undefined): readonly string[] {
  const urls: string[] = [];

  for (const item of parseTokenList(value)) {
    try {
      urls.push(new URL(item).href);
    } catch {
      return [];
    }
  }

  return urls;
}

function parseResourceUrl(value: string | undefined, requestUrl: URL): string | null {
  if (value === undefined || value.trim().length === 0) {
    return `${requestUrl.origin}${MCP_PATH}`;
  }

  try {
    return new URL(value.trim()).href;
  } catch {
    return null;
  }
}

function parseTokenList(value: string | undefined): readonly string[] {
  if (value === undefined) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function parseBearerToken(authorization: string | null): string | null {
  if (authorization === null) {
    return null;
  }

  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (match === null || match[1] === undefined) {
    return null;
  }

  return match[1].trim();
}

function tokensMatch(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return difference === 0;
}

function buildBearerChallenge(metadataUrl: string): string {
  return `Bearer resource_metadata="${metadataUrl}"`;
}

function withMcpCorsIfNeeded(response: Response, origin: string | undefined): Response {
  if (origin === undefined) {
    return response;
  }

  return withMcpCors(response, origin);
}

function withMcpCors(response: Response, origin: string): Response {
  const headers = new Headers(response.headers);

  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", MCP_ALLOWED_METHODS);
  headers.set("Access-Control-Allow-Headers", CORS_ALLOWED_HEADERS);
  headers.set("Access-Control-Expose-Headers", CORS_EXPOSED_HEADERS);
  headers.set("Vary", appendVary(headers.get("Vary"), "Origin"));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function appendVary(current: string | null, value: string): string {
  if (current === null || current.trim().length === 0) {
    return value;
  }

  const parts = current.split(",").map((part) => part.trim().toLowerCase());

  return parts.includes(value.toLowerCase()) ? current : `${current}, ${value}`;
}

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");

  return new Response(JSON.stringify(body), {
    ...init,
    headers,
  });
}
