# M6.1 Hosting Compatibility Spike

Status: ready for review
Issue: PL-142
Date: 2026-06-28
Decision: select Cloudflare Workers Free as the first no-paid M6 hosted path to prove; defer hosted deployment if that path cannot satisfy the MCP endpoint without paid hosting

## Summary

Project Prompt Library should not proceed with the previous Render paid web
service recommendation. The human constraint for this PL-142 rework is explicit:
no paid hosting service is authorized for M6.

The selected no-paid path is a minimal Cloudflare Workers Free hosted MCP
endpoint proof/configuration path. This is the best current no-paid option
because Cloudflare documents remote MCP servers on Workers, provides managed
HTTPS URLs, has a Free plan, and fits a small public read-only connector better
than a paid always-on Node service.

This recommendation is deliberately conditional:

- M6.2 should prove the smallest Worker-compatible `/mcp` entrypoint and
  deployment configuration without changing prompt/tool behavior.
- If M6.2 cannot preserve the approved tool surface and prompt-source behavior
  on Cloudflare Workers Free, the project should defer hosted deployment rather
  than fall back to a paid provider.
- The prior Render paid recommendation remains historical evidence only and is
  not accepted as the M6 provider decision.

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
- No runtime/product behavior changes were made in this rework.

## Current Hosted Requirements

Sources consulted on 2026-06-28:

- [OpenAI Apps SDK - Deploy your app](https://developers.openai.com/apps-sdk/deploy)
- [OpenAI Apps SDK - Connect from ChatGPT](https://developers.openai.com/apps-sdk/deploy/connect-chatgpt)
- [OpenAI Apps SDK - Build your MCP server](https://developers.openai.com/apps-sdk/build/mcp-server)
- [MCP specification - Transports, 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports)
- [Cloudflare Agents - Model Context Protocol](https://developers.cloudflare.com/agents/model-context-protocol/)
- [Cloudflare Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Vercel limits](https://vercel.com/docs/limits/overview)
- [Render free instances](https://render.com/docs/free)

Requirements for this project:

- ChatGPT connector setup needs the MCP server reachable over HTTPS and uses a
  public `/mcp` connector URL.
- OpenAI deployment guidance calls for a stable HTTPS endpoint, low-latency
  streaming responses on `/mcp`, dependable TLS, and logs/metrics for debugging.
- The MCP 2025-06-18 transport spec defines stdio and Streamable HTTP as the
  standard transports. Streamable HTTP replaces the older HTTP+SSE transport and
  requires a single MCP endpoint supporting POST and GET.
- Streamable HTTP servers must handle JSON-RPC POST requests and may return
  either JSON or `text/event-stream`. They must validate `Origin` headers and
  should use proper authentication for remote connections.
- OpenAI still documents local tunnels for development, but M6 needs a stable
  hosted HTTPS endpoint rather than the current local stdio-only process.
- The no-paid-hosting constraint rules out selecting a paid always-on service as
  the project decision.

Implication: the current core/tool registration can be reused conceptually, but
M6.2 needs a hosted HTTP transport adapter. Stdio alone is not enough for
ChatGPT connector hosting.

## Option Comparison

| Provider or path | Runtime support | HTTPS / streaming fit | Cost / free-tier limits | Env config | Logs | Deploy complexity | Rollback | Compatibility risk |
|---|---|---|---|---|---|---|---|---|
| Cloudflare Workers Free | Worker/fetch runtime, TypeScript support, documented remote MCP server path through Cloudflare Agents. Not a normal Node process. | Managed `workers.dev` HTTPS and edge request handling are a good fit for a public `/mcp`; streaming must be proven with the MCP SDK web-standard transport or Cloudflare MCP tooling. | Free plan exists, but request/CPU/bundle limits apply. Good fit for a small public read-only connector if prompt files can be bundled or loaded safely. | Wrangler secrets and Worker environment variables are supported; no `PORT` binding because Workers use fetch handlers. | Worker logs are available through Cloudflare tooling, with limits by plan/tooling path. | Medium: requires a Worker-compatible entrypoint and likely prompt-source packaging adjustment, but avoids paid hosting. | Deployments can be rolled back through Cloudflare deployment/version tooling. | Medium. Best no-paid fit, but requires proving the current Node/stdin/filesystem shape can be adapted without behavior drift. |
| Vercel Hobby | Node/function runtime supports TypeScript and serverless functions. | Public HTTPS deployments and streaming support exist, but a long-lived MCP Streamable HTTP endpoint must fit function duration/runtime constraints. | Hobby can be no-paid, but duration, usage, and log retention limits make connector reliability less predictable. | Project environment variables are mature. | Runtime logs are available with plan-limited retention. | Medium: likely reshape entrypoint to Vercel function conventions. | Instant rollback exists, but Hobby rollback is limited. | Medium to high. Plausible no-paid fallback, but serverless duration and streaming behavior need more proof than Cloudflare's explicit MCP docs. |
| Render Free web service | Native Node web service path, similar to the old paid Render recommendation. | Managed HTTPS and ordinary web-service semantics fit `/mcp`. | No-paid free instances spin down after idle time and may be suspended after inactivity. This is not acceptable as the selected connector endpoint. | Dashboard env vars and `PORT` are straightforward. | In-dashboard logs exist. | Low: closest to current Node service shape. | Free rollback/history is limited. | High for actual use. It avoids payment but creates avoidable cold-start/suspension risk for connector creation, metadata refresh, and streaming calls. |
| Defer hosted deployment | Keep local stdio MVP and do not add a hosted provider/config path. | No hosted HTTPS endpoint. | No hosting cost. | No hosted env config. | Local logs only. | Low. | Existing local Git rollback only. | Low product risk but no M6 hosted endpoint progress. Correct fallback if no no-paid path can be proven. |

## Recommendation

Select Cloudflare Workers Free as the first no-paid hosted M6 path to prove.

Rationale:

- It respects the human no-paid-hosting constraint.
- It has official Cloudflare documentation for remote MCP servers on Workers,
  unlike a generic free web-service workaround.
- It provides managed public HTTPS without requiring a paid always-on instance.
- It gives M6.2 a narrow technical question: can the existing read-only tool
  registration and local prompt catalog be exposed through a Worker-compatible
  Streamable HTTP `/mcp` endpoint without changing behavior?
- It keeps the paid Render path out of the selected decision while preserving
  the old PR #82 research as historical provider-comparison evidence.

Do not select Render paid web service for M6. Do not silently substitute Render
Free as "the same decision but cheaper"; its spin-down and inactivity behavior
make it a poor actual ChatGPT connector endpoint.

If Cloudflare Workers Free cannot support the approved connector behavior within
its no-paid limits, stop and recommend deferring hosted deployment. Do not
escalate to paid hosting from a Coding Agent issue.

## ADR Link

The superseding provider/path decision is recorded in
[`../architecture/adr-0001-m6-hosting-provider.md`](../architecture/adr-0001-m6-hosting-provider.md).

## M6.2 Follow-Up Scope

M6.2 should be a Coding Agent issue with this exact scope:

- Add a minimal Cloudflare Workers hosted MCP entrypoint/configuration plan, for
  example a Worker `fetch` handler or equivalent Cloudflare MCP server entry.
- Prefer the installed MCP SDK `WebStandardStreamableHTTPServerTransport` or
  Cloudflare's documented remote MCP server path; use a different transport only
  if direct implementation evidence proves it is safer.
- Expose exactly one `/mcp` endpoint supporting the MCP Streamable HTTP
  requirements needed by ChatGPT.
- Keep `src/mcp/server.ts` and `npm run dev` as the local stdio path unless the
  issue explicitly renames scripts.
- Preserve the three approved tools and all existing model-visible payload
  contracts.
- Prove how the three approved `prompts/*.md` files are available in the Worker
  deployment without adding private storage, DB behavior, auth, or extra prompt
  files.
- Add only the minimal provider config and scripts needed for a no-paid
  Cloudflare Worker build/deploy attempt or a documented blocker.
- Add focused local tests or smoke scripts for the HTTP/Worker transport shape
  if practical without network, plus existing deterministic checks.
- Do not deploy beyond a no-paid proof attempt unless the issue explicitly
  authorizes the exact action and required account state is available.

M6.2 non-goals:

- No paid hosting.
- No production deployment commitment.
- No auth/OAuth.
- No DB or private prompt storage.
- No provider abstraction.
- No production observability stack.
- No prompt, alias, tool schema, or prompt metadata changes.
- No cache/admin/debug tools.
- No semantic routing, prompt editing, workflow/session behavior, or broader
  runtime behavior.

M6.2 handoff evidence should include:

- exact no-paid provider path tested or configured;
- endpoint path and supported methods;
- Worker/runtime compatibility proof or exact blocker;
- prompt-file availability proof;
- checks run;
- confirmation that stdio local walkthrough behavior remains available;
- explicit decision: continue Cloudflare Workers Free, defer hosted deployment,
  or return for human/coordinator decision.

## Known Blockers And Risks

- Hosted compatibility is blocked until an HTTP/Worker transport entrypoint
  exists.
- The current runtime is Node stdio and local filesystem oriented. Cloudflare
  Workers are not a normal always-on Node process, so M6.2 must prove the
  Worker-compatible adapter and prompt-file packaging path before PL-143 can be
  treated as straightforward deployment configuration.
- Remote Streamable HTTP security needs an explicit Origin policy and an
  authentication decision before public/broader access. PL-142 does not
  authorize auth/OAuth implementation; for developer-mode personal use, this is
  a documented M6.2/M6.3 decision point rather than a hidden feature.
- `docs/workflows/current-state-ledger.md` currently still says PL-142 selected
  Render paid web service and that PL-143 is the next lane after that decision.
  This rework changes the provider decision, so a Coordinator/reviewed state
  repair is needed before PL-143 executes from ledger authority.
- PL-143's issue text still says it should follow the provider/path selected by
  M6.1. After this rework is reviewed, PL-143 should be interpreted as
  Cloudflare Workers Free first, with defer-hosting as the fallback if the
  no-paid proof fails.

## Requirement Evidence Map

| Requirement | Evidence | Status |
|---|---|---|
| The no-paid-hosting human constraint is recorded. | `Summary`, `Current Hosted Requirements`, and `Recommendation` record that no paid hosting is authorized. | Proven |
| Prior Render paid recommendation is rejected, superseded, or downgraded. | `Summary`, `Recommendation`, and the ADR state that Render paid is historical evidence only and not accepted as the project decision. | Proven |
| At least two realistic no-paid/free/defer options are evaluated. | `Option Comparison` evaluates Cloudflare Workers Free, Vercel Hobby, Render Free, and defer hosted deployment. | Proven |
| One no-paid path is recommended, or hosted deployment is explicitly deferred. | `Recommendation` selects Cloudflare Workers Free and defines defer hosted deployment as the fallback if that no-paid path fails. | Proven |
| Tradeoffs cover runtime support, HTTPS, cost/free-tier limits, env config, logs, deploy complexity, rollback, and compatibility risk. | `Option Comparison` table includes each required tradeoff column. | Proven |
| M6.2 scope is clear enough for a Coding Agent without guessing and does not assume paid hosting. | `M6.2 Follow-Up Scope` names provider, endpoint, transport candidates, prompt packaging proof, checks, non-goals, and fallback decision. | Proven |
| No runtime/product behavior changes are made. | Changed files are docs only: this spike and the hosting ADR. | Proven |

## Documentation Change Log

Updated:

- `docs/hosting/hosting-compatibility-spike.md`
- `docs/architecture/adr-0001-m6-hosting-provider.md`

Verified unchanged:

- Runtime source and tool behavior.
- Prompt files and aliases.
- Tool schemas and model-visible payloads.
- Local MVP walkthrough.
- Tool reference.

Intentionally not updated:

- `docs/workflows/current-state-ledger.md`; this Coding Agent rework reports
  that it is stale after the provider decision changes, but ledger mutation
  should be reviewed/coordinated before PL-143 execution.

Follow-up docs needed:

- M6.2 should add a short Cloudflare Worker hosted-entrypoint/deployment-plan
  note after a no-paid path is proven or blocked.
- A Coordinator/reviewed state repair should update the ledger and PL-143
  exposure text after this PL-142 rework is reviewed.
