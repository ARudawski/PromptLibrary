# ADR 0001: Select Cloudflare Workers Free As The No-Paid M6 Hosting Path To Prove

Status: accepted for review
Date: 2026-06-28
Issue: PL-142
Supersedes: 2026-06-27 Render paid web service recommendation from PR #82

## Context

M6 begins hosted deployment planning after M5 accepted that hosting is worth
planning. The current Project Prompt Library runtime is a local Node stdio MCP
server. ChatGPT connector setup needs a stable public HTTPS `/mcp` endpoint,
and current MCP transport guidance points to Streamable HTTP for remote
client-server communication.

PL-142 previously selected a Render paid web service. That provider research
may remain historical evidence, but the cost-bearing recommendation is not
accepted as the project decision. The current human constraint is explicit:

- no paid hosting service is authorized;
- do not recommend or implement a paid hosting path as the selected M6 provider;
- if no acceptable no-paid path is viable, defer hosted deployment instead of
  escalating to paid hosting.

The project still must preserve the V1 boundary:

- exactly three ChatGPT-facing tools;
- no prompt editing, workflow execution, semantic routing, private suites,
  auth/OAuth, database, or cache/admin/debug tools;
- no hosted deployment implementation in PL-142.

## Decision

Use Cloudflare Workers Free as the first no-paid hosted M6 provider path to
prove.

M6.2 should add or document the smallest Cloudflare Worker-compatible hosted MCP
entrypoint/configuration path that reuses the existing tool registration and
approved prompt catalog behavior, exposes `/mcp` with Streamable HTTP semantics,
and preserves the local stdio server.

If Cloudflare Workers Free cannot support the approved connector behavior within
its no-paid limits, hosted deployment should be deferred. A Coding Agent must
not select a paid fallback provider.

## Alternatives Considered

Render paid web service:

- superseded by this ADR because it violates the no-paid-hosting constraint;
- remains useful historical evidence for the shape of an always-on Node web
  service, but is not the selected M6 provider.

Render Free web service:

- no-paid and close to the current Node process shape;
- rejected for the actual connector endpoint because idle spin-down and
  inactivity/suspension behavior create avoidable reliability risk for ChatGPT
  connector creation, metadata refresh, and streaming calls.

Vercel Hobby:

- viable no-paid candidate with public HTTPS deployment, TypeScript/Node
  support, and good platform ergonomics;
- deferred because function duration/runtime constraints and MCP streaming
  behavior need more proof for this first hosted connector path.

Cloudflare Workers Free:

- selected as the first path to prove because Cloudflare documents remote MCP
  servers on Workers, provides managed HTTPS, and has a no-paid Free plan;
- requires a Worker/fetch-shaped adapter and prompt-file packaging proof because
  the current runtime is Node stdio plus local filesystem loading.

Defer hosted deployment:

- selected as the fallback if Cloudflare Workers Free cannot preserve the
  approved connector behavior without paid hosting;
- keeps the local stdio MVP as the usable baseline.

## Consequences

Positive:

- Respects the human no-paid-hosting constraint.
- Avoids treating cost approval as an agent decision.
- Gives M6.2 a precise compatibility proof: Worker-compatible Streamable HTTP
  `/mcp`, prompt catalog availability, and unchanged tool contracts.
- Keeps the local stdio MVP as the stable baseline.

Negative:

- Cloudflare Workers are not a normal long-running Node process, so M6.2 may
  require a different HTTP entrypoint shape than the old Render plan.
- The current local prompt-file source may need a no-paid-safe packaging path for
  the three approved prompts.
- Origin validation is required before any externally reachable proof deploy.
  Broader remote authentication remains explicit later M6 work; PL-142 does not
  authorize auth/OAuth.
- The current state ledger is updated by this PR/issue through the narrow Review
  Agent State Checkpoint amendment path so PL-143 does not route from stale
  Render-paid evidence.

## M6.2 Boundary

M6.2 may:

- add a Cloudflare Worker-compatible HTTP MCP entrypoint or configuration proof;
- use the MCP SDK web-standard Streamable HTTP transport or Cloudflare's
  documented remote MCP server path when evidence supports it;
- implement or verify an Origin-validation policy before any externally
  reachable proof deploy, or stop with a documented blocker;
- add minimal local tests or smoke scripts;
- add no-paid Cloudflare deployment/configuration notes;
- prove prompt catalog packaging for the existing three approved prompts;
- preserve the local stdio server.

M6.2 must not:

- use or recommend paid hosting as the selected path;
- deploy a production endpoint without explicit authorization;
- add auth/OAuth, DB, private prompts, provider abstraction, production
  observability, prompt/tool schema changes, cache/admin/debug tools, semantic
  routing, prompt editing, or workflow/session behavior.
