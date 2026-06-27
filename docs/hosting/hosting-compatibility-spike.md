# M6.1 Hosting Compatibility Spike

Status: ready for review
Issue: PL-142
Date: 2026-06-27
Decision: select Render paid web service as the first M6 hosted path

## Summary

Project Prompt Library should proceed to M6.2 with a minimal Node HTTP server
adapter for MCP Streamable HTTP, targeting a Render paid web service. The
current runtime remains compatible at the core/tool layer, but it is not
hostable as-is because `src/mcp/server.ts` only starts a stdio transport.

The recommended path is deliberately small:

- keep the existing `createLocalPromptLibraryServer()` and registered tools;
- add a separate hosted HTTP entrypoint in M6.2;
- use the MCP SDK `StreamableHTTPServerTransport`;
- expose one public HTTPS `/mcp` endpoint;
- keep the local stdio entrypoint for local development and deterministic tests;
- do not deploy, add auth, add private prompt storage, add a database, or change
  prompt/tool behavior in M6.2.

## Current Runtime Shape

Inspected files:

- `src/mcp/server.ts`
- `package.json`
- `docs/local-mvp-walkthrough.md`
- `docs/tool-reference.md`
- `docs/architecture/project-prompt-library-architecture-plan.md`
- `docs/roadmap/project-prompt-library-roadmap.md`
- `docs/workflows/current-state-ledger.md`

Current facts:

- `package.json` requires Node `>=22.0.0` and starts local development with
  `npm run dev`, which runs `tsx src/mcp/server.ts`.
- `src/mcp/server.ts` constructs a `McpServer`, registers exactly
  `invoke_prompt_library_command`, `inspect_prompt_library_command`, and
  `list_prompt_library_commands`, then connects it to `StdioServerTransport`.
- The installed MCP SDK exposes `StreamableHTTPServerTransport`,
  `WebStandardStreamableHTTPServerTransport`, and deprecated
  `SSEServerTransport` in addition to `StdioServerTransport`.
- The local MVP walkthrough explicitly documents the server as a local stdio MCP
  server and states that hosted deployment is not implemented.
- No runtime/product behavior changes were made in this spike.

## Current Hosted Requirements

Sources consulted on 2026-06-27:

- [OpenAI Apps SDK - Deploy your app](https://developers.openai.com/apps-sdk/deploy)
- [OpenAI Apps SDK - Connect from ChatGPT](https://developers.openai.com/apps-sdk/deploy/connect-chatgpt)
- [OpenAI Apps SDK - Build your MCP server](https://developers.openai.com/apps-sdk/build/mcp-server)
- [MCP specification - Transports, 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports)

Requirements for this project:

- ChatGPT connector setup needs the MCP server reachable over HTTPS and uses a
  public `/mcp` connector URL.
- OpenAI deployment guidance calls for a stable HTTPS endpoint, low-latency
  streaming responses on `/mcp`, dependable TLS, and logs/metrics for debugging.
- The MCP 2025-06-18 transport spec defines stdio and Streamable HTTP as the
  standard transports. Streamable HTTP replaces the older HTTP+SSE transport and
  requires a single MCP endpoint supporting POST and GET.
- Streamable HTTP servers must handle JSON-RPC POST requests and may return
  either JSON or `text/event-stream`. They must also validate `Origin` headers
  and should use proper authentication for remote connections.
- OpenAI still documents local tunnels for development, but M6 needs a stable
  hosted HTTPS endpoint rather than the current local stdio-only process.

Implication: the current core/tool registration can be reused, but M6.2 needs a
hosted HTTP transport adapter. Stdio alone is not enough for ChatGPT connector
hosting.

## Provider Comparison

| Provider path | Runtime support | HTTPS / streaming fit | Cost / free tier | Env config | Logs | Deploy complexity | Rollback | Compatibility risk |
|---|---|---|---|---|---|---|---|---|
| Render paid web service | Native Node web service, plus Docker if needed. Requires binding to `0.0.0.0` and `PORT`. | Public `onrender.com` URL, custom domains, managed TLS, HTTP/2, and ordinary long-running web service semantics fit `/mcp`. | Free web services exist, but free instances spin down after 15 minutes idle and should not be used for production. Paid instance avoids cold wake-up risk. | Dashboard env vars/secrets during service creation; `PORT` is provided. | In-dashboard logs and log streams are documented. | Low: connect GitHub repo, set build/start commands, configure env, deploy service. | Instant rollbacks are listed for web services; free tier rollback is limited to the two most recent prior deploys. | Low to medium. Best fit for a small always-on Node HTTP server and Streamable HTTP. |
| Vercel Node.js server/function | Node.js runtime supports Node HTTP servers and TypeScript. | OpenAI docs call Vercel a strong fit for ChatGPT Apps hosting and Vercel supports streaming functions; previews are useful for review. Function duration/runtime model must be checked for MCP long-lived streams. | Hobby plan can be free, but limits and function duration make the first hosted MCP service riskier without extra proof. | Project env vars and framework conventions are mature. | Runtime logs are available on all plans, but retention is plan-limited. | Medium: likely reshape entrypoint to Vercel server/function conventions. | Instant Rollback exists; Hobby rollback is limited to the immediately previous deployment. | Medium. Good ecosystem fit, but serverless/function constraints make it less boring for the first `/mcp` endpoint. |
| Fly.io Machines app | Good Node support, Docker-first deployment, persistent process model. | Public services support shared IPv4/IPv6 and HTTP/TLS routing; persistent Machines fit streaming. | Not primarily a simple free web-service path; cost management is explicit and operational. | Secrets and `fly.toml` provide config. | `fly logs` and releases are available from CLI. | Medium to high: requires Fly CLI, app config, Docker/buildpack decisions, regions, and Machines operations. | Releases are tracked; rollback/redeploy is CLI-oriented. | Medium. Technically strong, but more operational surface than this project needs for the first personal-use hosted endpoint. |

## Recommendation

Select Render paid web service for the first hosted M6 path.

Rationale:

- It best matches the current repo shape: one Node process exposing one HTTP
  endpoint and no separate frontend.
- It keeps deployment understandable for a small personal-use connector.
- It provides managed TLS, public URLs, logs, deploys, and rollback without
  forcing framework-specific routing.
- It avoids Vercel function-duration questions for the first Streamable HTTP
  adapter.
- It avoids Fly.io's larger operational surface until the project needs regions,
  Machines-level control, or Docker-first operations.

Do not use Render Free for the actual ChatGPT connector endpoint. The spin-down
behavior creates avoidable compatibility risk for developer-mode connector
creation, metadata refresh, and streaming tool calls.

## ADR Link

The provider/path decision is recorded in
[`../architecture/adr-0001-m6-hosting-provider.md`](../architecture/adr-0001-m6-hosting-provider.md).

## M6.2 Follow-Up Scope

M6.2 should be a Coding Agent issue with this exact scope:

- Add a hosted HTTP MCP entrypoint, for example `src/mcp/httpServer.ts`.
- Use `StreamableHTTPServerTransport` from the installed MCP SDK unless direct
  implementation evidence proves a safer transport.
- Expose exactly one `/mcp` endpoint supporting the MCP Streamable HTTP
  requirements needed by ChatGPT.
- Keep `src/mcp/server.ts` and `npm run dev` as the local stdio path unless the
  issue explicitly renames scripts.
- Add minimal Node HTTP server code that binds to `process.env.PORT` and
  `0.0.0.0` for hosted services.
- Add a minimal health endpoint only if required by provider configuration; it
  must not expose prompt/cache/admin/debug data.
- Add focused local tests or smoke scripts for the HTTP transport shape if
  practical without network, plus existing deterministic checks.
- Add Render deployment notes or a small config plan, but do not deploy.
- Preserve the three approved tools and all existing model-visible payload
  contracts.

M6.2 non-goals:

- No actual deployment.
- No auth/OAuth.
- No DB or private prompt storage.
- No provider abstraction.
- No production observability stack.
- No prompt, alias, tool schema, or prompt metadata changes.
- No cache/admin/debug tools.
- No semantic routing, prompt editing, workflow/session behavior, or broader
  runtime behavior.

M6.2 handoff evidence should include:

- local transport entrypoint evidence;
- exact endpoint path and supported methods;
- checks run;
- confirmation that stdio local walkthrough behavior remains available;
- documentation of any manual steps still deferred to M6.3.

## Known Blockers And Risks

- Hosted compatibility is blocked until an HTTP transport entrypoint exists.
- Remote Streamable HTTP security needs an explicit Origin policy and an
  authentication decision before public/broader access. PL-142 does not
  authorize auth/OAuth implementation; for developer-mode personal use, this is
  a documented M6.2/M6.3 decision point rather than a hidden feature.
- The current local prompt source reads `prompts/*.md` from the deployed
  filesystem. M6.2 should verify that Render deploy artifacts include the three
  prompt files and that the working directory matches the local source
  expectation.
- `docs/workflows/current-state-ledger.md` still contains stale workflow-lane
  prose naming PL-128 / M5.Gate state-documentation closeout, while later ledger
  evidence and live PL-142 evidence authorize M6.1 planning. This spike reports
  the drift and does not update the ledger.

## Requirement Evidence Map

| Requirement | Evidence | Status |
|---|---|---|
| Hosted endpoint/runtime requirements are documented. | `Current Hosted Requirements` documents OpenAI HTTPS `/mcp`, streaming, logging/metrics, and MCP Streamable HTTP requirements. | Proven |
| At least two realistic provider paths are compared. | `Provider Comparison` compares Render, Vercel, and Fly.io. | Proven |
| One provider/path is recommended, or deployment is explicitly deferred. | `Recommendation` selects Render paid web service. | Proven |
| Tradeoffs cover runtime support, HTTPS, cost/free tier, env config, logs, deploy complexity, rollback, and compatibility risk. | `Provider Comparison` table includes each required tradeoff column. | Proven |
| M6.2 scope is clear enough for a Coding Agent without guessing. | `M6.2 Follow-Up Scope` names files, transport, endpoint, checks, non-goals, and evidence. | Proven |
| No runtime/product behavior changes are made. | Changed files are docs only: this spike and the hosting ADR. | Proven |

## Documentation Change Log

Updated:

- `docs/hosting/hosting-compatibility-spike.md`
- `docs/architecture/adr-0001-m6-hosting-provider.md`

Verified unchanged:

- Runtime source and tool behavior.
- Prompt files and aliases.
- Tool schemas and model-visible payloads.

Intentionally not updated:

- `docs/workflows/current-state-ledger.md`; PL-142 is a coding spike and only
  reports the stale PL-128 workflow-lane prose.
- `docs/local-mvp-walkthrough.md`; it remains correct for the local stdio MVP.
- `docs/tool-reference.md`; the tool surface remains unchanged.

Follow-up docs needed:

- M6.2 should add a short hosted local-run/deployment-plan note for the new HTTP
  entrypoint.
- M6.3 should add hosted smoke evidence and release/rollback checklist updates
  after deployment configuration exists.
