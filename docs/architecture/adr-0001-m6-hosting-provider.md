# ADR 0001: Select Render Paid Web Service For M6 Hosting Path

Status: accepted for review
Date: 2026-06-27
Issue: PL-142

## Context

M6 begins hosted deployment planning after M5 accepted that hosting is worth
planning. The current Project Prompt Library runtime is a local Node stdio MCP
server. ChatGPT connector setup needs a stable public HTTPS `/mcp` endpoint,
and current MCP transport guidance points to Streamable HTTP for remote
client-server communication.

The project still must preserve the V1 boundary:

- exactly three ChatGPT-facing tools;
- no prompt editing, workflow execution, semantic routing, private suites,
  auth/OAuth, database, or cache/admin/debug tools;
- no hosted deployment implementation in PL-142.

## Decision

Use a Render paid web service as the first hosted M6 provider path.

M6.2 should add a minimal hosted HTTP MCP entrypoint that reuses the existing
tool registration and local prompt loading core, exposes `/mcp` with
`StreamableHTTPServerTransport`, and binds to `process.env.PORT` on `0.0.0.0`.

Keep the existing stdio entrypoint for local development and deterministic
walkthroughs.

## Alternatives Considered

Render free web service:

- rejected for the actual connector endpoint because idle spin-down creates
  avoidable cold-start risk for ChatGPT connector creation, metadata refresh,
  and streaming calls;
- still acceptable only for throwaway provider familiarization.

Vercel Node.js server/function:

- viable and specifically named by OpenAI as a strong ChatGPT Apps hosting fit;
- deferred because function-duration and framework-entrypoint choices are a
  sharper first-adapter risk than a plain long-running Node web service.

Fly.io Machines:

- technically strong for persistent Node services and streaming;
- deferred because it introduces Docker/Machines/region operations before this
  small personal-use connector needs that control.

## Consequences

Positive:

- Smallest provider path for one Node HTTP process.
- Managed TLS, public URL, logs, deploys, and rollback are provider-native.
- Keeps M6.2 focused on transport adaptation rather than deployment operations.

Negative:

- Requires a paid instance for the recommended path.
- Still requires an HTTP transport implementation before any hosted smoke.
- Remote security policy remains explicit follow-up work; PL-142 does not
  authorize auth/OAuth.

## M6.2 Boundary

M6.2 may:

- add the HTTP MCP entrypoint and minimal local tests or smoke scripts;
- add Render deployment notes or a config plan;
- preserve the local stdio server.

M6.2 must not:

- deploy anything;
- add auth/OAuth, DB, private prompts, provider abstraction, production
  observability, prompt/tool schema changes, cache/admin/debug tools, semantic
  routing, prompt editing, or workflow/session behavior.
