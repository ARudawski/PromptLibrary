# Cloudflare Workers Deployment Configuration

Status: PL-143 configuration proof
Date: 2026-06-28

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
- Prompt catalog packaging: `npm run build:worker:catalog` generates
  `src/mcp/workerPromptCatalog.generated.ts` from the three approved
  `prompts/*.md` files.

The Worker entrypoint uses the installed MCP SDK
`WebStandardStreamableHTTPServerTransport` in stateless mode and reuses the same
registered V1 tools as the local stdio server.

## Required Configuration

`PPL_ALLOWED_ORIGINS` is required before `/mcp` is externally usable.

```text
PPL_ALLOWED_ORIGINS=https://chatgpt.com
```

Use a comma-separated list when more than one exact origin is approved.

The Worker fails closed when this variable is missing or when an incoming
request's `Origin` header is not in the allow-list. This satisfies the PL-142
handoff requirement that any externally reachable no-paid proof deploy must
implement or verify an Origin validation policy. It is not OAuth, user auth, or
private-suite access control.

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

PL-143 may prove:

- the Worker bundle can be built;
- `/mcp` rejects missing or unapproved Origins;
- `/mcp` can serve the three approved V1 tools through Streamable HTTP when an
  allowed Origin is configured;
- the generated Worker prompt catalog matches the local `prompts/*.md` files;
- local stdio behavior remains available.

PL-143 does not prove:

- a live Cloudflare deployment exists;
- ChatGPT can connect to the hosted endpoint;
- final ChatGPT production Origin values are complete;
- broader remote authentication is implemented;
- private prompt suites, database behavior, or production observability exist.

## Documentation Change Log

Updated:

- `src/mcp/worker.ts`
- `src/mcp/workerPromptCatalog.generated.ts`
- `src/prompt-source/StaticPromptSource.ts`
- `scripts/generate-worker-prompt-catalog.ts`
- `wrangler.jsonc`
- `package.json`
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
