import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { StaticPromptSource } from "../prompt-source/StaticPromptSource.js";
import { createPromptLibraryServerFromSource } from "./createPromptLibraryServerFromSource.js";
import { BUNDLED_PROMPT_FILES } from "./workerPromptCatalog.generated.js";

const MCP_PATH = "/mcp";
const HEALTH_PATH = "/health";

const CORS_ALLOWED_HEADERS = [
  "content-type",
  "last-event-id",
  "mcp-protocol-version",
  "mcp-session-id",
].join(", ");
const CORS_EXPOSED_HEADERS = ["mcp-protocol-version", "mcp-session-id"].join(", ");
const MCP_ALLOWED_METHODS = "GET, POST, DELETE, OPTIONS";

export interface WorkerEnv {
  readonly PPL_ALLOWED_ORIGINS?: string;
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

  if (url.pathname !== MCP_PATH) {
    return jsonResponse({ ok: false, error: "not_found" }, { status: 404 });
  }

  const originPolicy = evaluateOriginPolicy(request, env.PPL_ALLOWED_ORIGINS);

  if (originPolicy.kind !== "allowed") {
    return originPolicy.response;
  }

  if (request.method === "OPTIONS") {
    return withMcpCors(new Response(null, { status: 204 }), originPolicy.origin);
  }

  const transport = new WebStandardStreamableHTTPServerTransport();
  const server = await createPromptLibraryServerFromSource(
    new StaticPromptSource(BUNDLED_PROMPT_FILES),
  );

  await server.connect(transport);

  const response = await transport.handleRequest(request);

  return withMcpCors(response, originPolicy.origin);
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
