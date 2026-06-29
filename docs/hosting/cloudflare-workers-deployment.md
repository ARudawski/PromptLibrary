# Cloudflare Workers Deployment Configuration

Status: PL-143 configuration proof; PL-156 OAuth-protected no-Origin access update
Date: 2026-06-29

This document records the minimal no-paid Cloudflare Workers configuration path
for Project Prompt Library. It does not authorize production deployment,
ChatGPT hosted connection verification, private suites, auth/OAuth, a database,
prompt changes, alias changes, or additional tools.

## Provider Path

- Provider: Cloudflare Workers Free.
- Worker entrypoint: `src/mcp/worker.ts`.
- Public MCP path: `/mcp`.
- Health path: `/health`.
- Local stdio path: unchanged, `npm run dev` -> `src/mcp/server.ts`.
- Worker compatibility: `wrangler.jsonc` enables `nodejs_compat` because the
  Worker path still parses the approved Markdown prompt catalog through
  `gray-matter`, which depends on Node-compatible APIs such as `Buffer`.
- Prompt catalog packaging: `npm run build:worker:catalog` generates
  `src/mcp/workerPromptCatalog.generated.ts` from the three approved
  `prompts/*.md` files.

The Worker entrypoint uses the installed MCP SDK
`WebStandardStreamableHTTPServerTransport` in stateless mode and reuses the same
registered V1 tools as the local stdio server.

## Required Configuration

`PPL_ALLOWED_ORIGINS` is required before browser-originated `/mcp` requests are
externally usable. `nodejs_compat` is also required in `wrangler.jsonc` for the
current Worker runtime path, because prompt parsing still uses the
Node-compatible Markdown parser shared with the local runtime.

```text
PPL_ALLOWED_ORIGINS=https://chatgpt.com
```

Use a comma-separated list when more than one exact origin is approved.

The Worker fails closed when this variable is missing for an `Origin` request
or when an incoming request's `Origin` header is not in the allow-list. This
satisfies the PL-142 handoff requirement that any externally reachable no-paid
proof deploy must implement or verify an Origin validation policy.

For OpenAI server-to-server MCP clients that omit `Origin`, configure the
OAuth-protected resource path separately:

```text
PPL_OAUTH_AUTHORIZATION_SERVERS=https://auth.example.com
PPL_OAUTH_RESOURCE=https://promptlibrary.example.com/mcp
PPL_OAUTH_SCOPES=prompt-library.invoke
```

`PPL_OAUTH_AUTHORIZATION_SERVERS` is required for no-Origin `/mcp` access. Use a
comma-separated list only when multiple authorization servers are intentionally
approved. `PPL_OAUTH_RESOURCE` is optional; when omitted, the Worker derives the
resource from the incoming request origin and `/mcp`. `PPL_OAUTH_SCOPES` is
optional and is advertised in protected-resource metadata when present.

Configure the accepted bearer token as a Cloudflare secret, never as a checked
in value:

```bash
wrangler secret put PPL_OAUTH_BEARER_TOKEN
```

No-Origin `/mcp` requests without `Authorization: Bearer <token>` return `401`
with `WWW-Authenticate: Bearer resource_metadata="..."`. The metadata endpoint
is public and returns the configured OAuth resource-server metadata:

```text
/.well-known/oauth-protected-resource
```

This is the narrow PL-156 resource-server gate for OpenAI server-to-server MCP
requests. It does not add user accounts, private prompt suites, database-backed
auth, prompt editing, draft management, cache/admin/debug tools, or additional
ChatGPT-facing tools.

## Commands

```bash
npm run build:worker:catalog
npm run build:worker
npm run deploy:worker
```

`build:worker` runs a Wrangler dry-run build and writes the bundled output under
`dist-worker/` without publishing a Worker. `deploy:worker` performs a real
Cloudflare deployment and must not be run for production without explicit later
human or issue authority.

## Verification Boundary

The hosted Worker path can prove:

- the Worker bundle can be built;
- `/mcp` rejects missing or unapproved Origins;
- `/mcp` can serve the three approved V1 tools through Streamable HTTP when an
  allowed Origin is configured;
- the generated Worker prompt catalog matches the local `prompts/*.md` files;
- local stdio behavior remains available.
- no-Origin OpenAI MCP requests receive an OAuth Bearer challenge and can reach
  the unchanged V1 tool surface only with the configured bearer token.

The hosted Worker path still does not prove:

- a live Cloudflare deployment exists;
- ChatGPT can connect to the hosted endpoint;
- final ChatGPT production Origin values are complete;
- broader remote authentication, user accounts, token introspection, or private
  suite access control are implemented;
- private prompt suites, database behavior, or production observability exist.

## OAuth Smoke Commands

Use placeholder values locally or against the hosted Worker. Do not paste real
secrets into docs, PR bodies, issue comments, or terminal transcripts.

Unauthenticated no-Origin request should return a Bearer challenge:

```bash
curl -i \
  -X POST \
  -H "Content-Type: application/json" \
  --data '{}' \
  https://promptlibrary.example.com/mcp
```

Protected-resource metadata should advertise the configured authorization
server and resource:

```bash
curl -s https://promptlibrary.example.com/.well-known/oauth-protected-resource
```

Authenticated no-Origin MCP smoke should use a redacted token supplied from a
local secret manager or shell variable:

```bash
curl -i \
  -X POST \
  -H "Authorization: Bearer $PPL_OAUTH_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' \
  https://promptlibrary.example.com/mcp
```

Allowed-Origin MCP smoke remains unchanged and should still work without the
bearer token when `Origin` is in `PPL_ALLOWED_ORIGINS`:

```bash
curl -i \
  -X POST \
  -H "Origin: https://chatgpt.com" \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' \
  https://promptlibrary.example.com/mcp
```

Disallowed-Origin requests must still return `origin_not_allowed` even when the
no-Origin OAuth settings are configured.

## Documentation Change Log

Updated:

- `src/mcp/worker.ts`
- `src/mcp/workerPromptCatalog.generated.ts`
- `src/prompt-source/StaticPromptSource.ts`
- `scripts/generate-worker-prompt-catalog.ts`
- `wrangler.jsonc`
- `.gitignore`
- `biome.json`
- `package.json`
- `docs/hosting/cloudflare-workers-deployment.md`

PL-156 updated:

- `src/mcp/worker.ts`
- `test/contract/worker-mcp-endpoint.test.ts`
- `docs/hosting/cloudflare-workers-deployment.md`

Verified unchanged:

- `src/mcp/server.ts` still provides the local stdio entrypoint.
- `prompts/*.md` remain the approved three-prompt local MVP catalog.
- V1 ChatGPT-facing tool names and model-visible payload contracts remain
  unchanged.

Follow-up docs needed:

- PL-144 or a later explicitly authorized hosted-smoke issue should record the
  live Cloudflare URL, actual ChatGPT connection result, final approved Origin
  values, and any deployment rollback evidence.
