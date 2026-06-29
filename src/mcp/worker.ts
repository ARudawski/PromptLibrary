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
  readonly PPL_OAUTH_INTROSPECTION_CLIENT_ID?: string;
  readonly PPL_OAUTH_INTROSPECTION_CLIENT_SECRET?: string;
  readonly PPL_OAUTH_ISSUER?: string;
  readonly PPL_OAUTH_RESOURCE?: string;
  readonly PPL_OAUTH_SCOPES?: string;
  readonly PPL_OAUTH_TOKEN_INTROSPECTION_URL?: string;
}

type FetchLike = typeof fetch;

export interface WorkerRuntimeOptions {
  readonly fetch?: FetchLike;
  readonly nowSeconds?: () => number;
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    return handleWorkerRequest(request, env);
  },
};

export async function handleWorkerRequest(
  request: Request,
  env: WorkerEnv = {},
  options: WorkerRuntimeOptions = {},
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

  const accessPolicy = await evaluateMcpAccessPolicy(request, env, options);

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

async function evaluateMcpAccessPolicy(
  request: Request,
  env: WorkerEnv,
  options: WorkerRuntimeOptions,
): Promise<McpAccessPolicy> {
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

  return evaluateNoOriginAuthorizationPolicy(request, env, options);
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

async function evaluateNoOriginAuthorizationPolicy(
  request: Request,
  env: WorkerEnv,
  options: WorkerRuntimeOptions,
): Promise<McpAccessPolicy> {
  const metadata = buildProtectedResourceMetadata(request, env);

  if (metadata.kind !== "configured") {
    return metadata;
  }

  const suppliedToken = parseBearerToken(request.headers.get("authorization"));

  if (suppliedToken === null) {
    return {
      kind: "rejected",
      response: jsonResponse(
        {
          ok: false,
          error: "authentication_required",
          message: "OAuth bearer-token authorization is required for no-Origin MCP requests.",
        },
        {
          status: 401,
          headers: {
            "WWW-Authenticate": buildBearerChallenge(metadata.metadataUrl, {
              error: "invalid_token",
              description: "Bearer token is required.",
            }),
          },
        },
      ),
    };
  }

  const validationConfig = buildTokenValidationConfig(env, metadata.body);

  if (validationConfig.kind !== "configured") {
    return validationConfig;
  }

  const validation = await validateOAuthAccessToken(
    suppliedToken,
    validationConfig.config,
    options,
  );

  if (validation.kind === "valid") {
    return { kind: "allowed" };
  }

  if (validation.kind === "insufficient_scope") {
    return {
      kind: "rejected",
      response: jsonResponse(
        {
          ok: false,
          error: "insufficient_scope",
          message: validation.message,
        },
        {
          status: 403,
          headers: {
            "WWW-Authenticate": buildBearerChallenge(metadata.metadataUrl, {
              error: "insufficient_scope",
              description: validation.message,
              scopes: validation.requiredScopes,
            }),
          },
        },
      ),
    };
  }

  if (validation.kind === "server_error") {
    return {
      kind: "rejected",
      response: jsonResponse(
        {
          ok: false,
          error: "oauth_token_validation_failed",
          message: validation.message,
        },
        { status: 503 },
      ),
    };
  }

  return {
    kind: "rejected",
    response: jsonResponse(
      {
        ok: false,
        error: "authentication_required",
        message: validation.message,
      },
      {
        status: 401,
        headers: {
          "WWW-Authenticate": buildBearerChallenge(metadata.metadataUrl, {
            error: "invalid_token",
            description: validation.message,
          }),
        },
      },
    ),
  };
}

type TokenValidationConfig =
  | {
      readonly kind: "configured";
      readonly config: OAuthTokenValidationSettings;
    }
  | {
      readonly kind: "rejected";
      readonly response: Response;
    };

interface OAuthTokenValidationSettings {
  readonly introspectionUrl: string;
  readonly issuer: string;
  readonly resource: string;
  readonly requiredScopes: readonly string[];
  readonly clientId?: string;
  readonly clientSecret?: string;
}

function buildTokenValidationConfig(
  env: WorkerEnv,
  metadata: Extract<ProtectedResourceMetadata, { readonly kind: "configured" }>["body"],
): TokenValidationConfig {
  const introspectionUrl = parseAbsoluteUrl(env.PPL_OAUTH_TOKEN_INTROSPECTION_URL);

  if (introspectionUrl === null) {
    return {
      kind: "rejected",
      response: jsonResponse(
        {
          ok: false,
          error: "oauth_policy_not_configured",
          message:
            "PPL_OAUTH_TOKEN_INTROSPECTION_URL must be configured as an absolute URL before no-Origin /mcp access is exposed.",
        },
        { status: 503 },
      ),
    };
  }

  const configuredIssuer = normalizeOptionalSecret(env.PPL_OAUTH_ISSUER);
  const issuer =
    configuredIssuer !== undefined
      ? parseAbsoluteUrl(configuredIssuer)
      : metadata.authorization_servers[0];

  if (issuer === null || issuer === undefined) {
    return {
      kind: "rejected",
      response: jsonResponse(
        {
          ok: false,
          error: "oauth_policy_not_configured",
          message:
            "PPL_OAUTH_ISSUER or PPL_OAUTH_AUTHORIZATION_SERVERS must identify the token issuer.",
        },
        { status: 503 },
      ),
    };
  }

  const clientId = normalizeOptionalSecret(env.PPL_OAUTH_INTROSPECTION_CLIENT_ID);
  const clientSecret = normalizeOptionalSecret(env.PPL_OAUTH_INTROSPECTION_CLIENT_SECRET);

  if (clientSecret !== undefined && clientId === undefined) {
    return {
      kind: "rejected",
      response: jsonResponse(
        {
          ok: false,
          error: "oauth_policy_not_configured",
          message:
            "PPL_OAUTH_INTROSPECTION_CLIENT_ID must be configured when PPL_OAUTH_INTROSPECTION_CLIENT_SECRET is configured.",
        },
        { status: 503 },
      ),
    };
  }

  return {
    kind: "configured",
    config: {
      introspectionUrl,
      issuer,
      resource: metadata.resource,
      requiredScopes: metadata.scopes_supported ?? [],
      ...(clientId !== undefined ? { clientId } : {}),
      ...(clientSecret !== undefined ? { clientSecret } : {}),
    },
  };
}

type TokenValidationResult =
  | {
      readonly kind: "valid";
    }
  | {
      readonly kind: "invalid_token";
      readonly message: string;
    }
  | {
      readonly kind: "insufficient_scope";
      readonly message: string;
      readonly requiredScopes: readonly string[];
    }
  | {
      readonly kind: "server_error";
      readonly message: string;
    };

async function validateOAuthAccessToken(
  token: string,
  config: OAuthTokenValidationSettings,
  options: WorkerRuntimeOptions,
): Promise<TokenValidationResult> {
  const fetchImpl = options.fetch ?? fetch;
  const body = new URLSearchParams();
  body.set("token", token);
  body.set("token_type_hint", "access_token");
  body.set("resource", config.resource);

  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  });

  if (config.clientId !== undefined && config.clientSecret !== undefined) {
    headers.set(
      "Authorization",
      `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`, "utf8").toString("base64")}`,
    );
  } else if (config.clientId !== undefined) {
    body.set("client_id", config.clientId);
  }

  let response: Response;

  try {
    response = await fetchImpl(config.introspectionUrl, {
      method: "POST",
      headers,
      body: body.toString(),
    });
  } catch {
    return {
      kind: "server_error",
      message: "OAuth token introspection request failed.",
    };
  }

  if (!response.ok) {
    return {
      kind: "server_error",
      message: "OAuth token introspection endpoint returned an error.",
    };
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    return {
      kind: "server_error",
      message: "OAuth token introspection response was not valid JSON.",
    };
  }

  if (!isRecord(payload)) {
    return {
      kind: "server_error",
      message: "OAuth token introspection response was not an object.",
    };
  }

  return validateIntrospectionPayload(
    payload,
    config,
    options.nowSeconds?.() ?? Math.floor(Date.now() / 1000),
  );
}

function validateIntrospectionPayload(
  payload: Record<string, unknown>,
  config: OAuthTokenValidationSettings,
  nowSeconds: number,
): TokenValidationResult {
  if (payload.active !== true) {
    return {
      kind: "invalid_token",
      message: "OAuth access token is inactive.",
    };
  }

  const issuer = getStringClaim(payload, "iss");

  if (issuer === null || !urlClaimsMatch(issuer, config.issuer)) {
    return {
      kind: "invalid_token",
      message: "OAuth access token issuer is not trusted.",
    };
  }

  const expiration = getNumberClaim(payload, "exp");

  if (expiration === null || expiration <= nowSeconds) {
    return {
      kind: "invalid_token",
      message: "OAuth access token is expired or missing an expiration.",
    };
  }

  const notBefore = getNumberClaim(payload, "nbf");

  if (notBefore !== null && notBefore > nowSeconds) {
    return {
      kind: "invalid_token",
      message: "OAuth access token is not valid yet.",
    };
  }

  const audienceClaims = [
    ...getStringListClaim(payload, "aud"),
    ...getStringListClaim(payload, "resource"),
  ];

  if (!audienceClaims.some((claim) => urlClaimsMatch(claim, config.resource))) {
    return {
      kind: "invalid_token",
      message: "OAuth access token audience does not match this MCP resource.",
    };
  }

  const grantedScopes = new Set([
    ...getWhitespaceListClaim(payload, "scope"),
    ...getStringListClaim(payload, "scopes"),
    ...getStringListClaim(payload, "scp"),
  ]);
  const missingScopes = config.requiredScopes.filter((scope) => !grantedScopes.has(scope));

  if (missingScopes.length > 0) {
    return {
      kind: "insufficient_scope",
      message: "OAuth access token does not include the required MCP scopes.",
      requiredScopes: config.requiredScopes,
    };
  }

  return { kind: "valid" };
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

function parseAbsoluteUrl(value: string | undefined): string | null {
  if (value === undefined || value.trim().length === 0) {
    return null;
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

function normalizeOptionalSecret(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStringClaim(payload: Record<string, unknown>, claimName: string): string | null {
  const value = payload[claimName];

  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  return value.trim();
}

function getNumberClaim(payload: Record<string, unknown>, claimName: string): number | null {
  const value = payload[claimName];

  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getStringListClaim(
  payload: Record<string, unknown>,
  claimName: string,
): readonly string[] {
  const value = payload[claimName];

  if (typeof value === "string" && value.trim().length > 0) {
    return [value.trim()];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function getWhitespaceListClaim(
  payload: Record<string, unknown>,
  claimName: string,
): readonly string[] {
  const value = payload[claimName];

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function urlClaimsMatch(actual: string, expected: string): boolean {
  return normalizeUrlForComparison(actual) === normalizeUrlForComparison(expected);
}

function normalizeUrlForComparison(value: string): string {
  try {
    return new URL(value).href;
  } catch {
    return value;
  }
}

function buildBearerChallenge(
  metadataUrl: string,
  options: {
    readonly error?: string;
    readonly description?: string;
    readonly scopes?: readonly string[];
  } = {},
): string {
  const parameters: string[] = [];

  if (options.error !== undefined) {
    parameters.push(`error="${escapeChallengeValue(options.error)}"`);
  }

  if (options.description !== undefined) {
    parameters.push(`error_description="${escapeChallengeValue(options.description)}"`);
  }

  if (options.scopes !== undefined && options.scopes.length > 0) {
    parameters.push(`scope="${escapeChallengeValue(options.scopes.join(" "))}"`);
  }

  parameters.push(`resource_metadata="${escapeChallengeValue(metadataUrl)}"`);

  return `Bearer ${parameters.join(", ")}`;
}

function escapeChallengeValue(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
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
