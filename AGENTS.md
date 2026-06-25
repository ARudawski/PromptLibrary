# Project Prompt Library — Agent Instructions

These are repository-level instructions for Codex and other agents working on Project Prompt Library.

## Source-of-truth order

When sources disagree, use this order:

1. explicit current user instruction;
2. `docs/workflows/current-state-ledger.md` for current phase, active gate, next allowed slice, queue-selection state, and current caveats;
3. `AGENTS.md` for repository-wide guardrails, product boundaries, architecture constraints, and agent behavior rules;
4. approved architecture plan / ADRs;
5. approved roadmap;
6. role-specific spec in `docs/agents/`;
7. Codex standards and QA strategy;
8. Linear issue acceptance criteria and comments;
9. GitHub PRs/issues;
10. existing code and tests.

If the conflict matters, stop and report it instead of silently improvising. Do not let stale phase text in a long-form file override the current-state ledger for phase/gate facts.

## Required reading

Before changing code or deciding a gate, read:

1. `README.md`
2. `docs/workflows/current-state-ledger.md`
3. `docs/agents/README.md`
4. the relevant role-specific agent spec:
   - Coding Agent: `docs/agents/coding-agent.md`
   - Review Agent: `docs/agents/review-agent.md`
   - QA Agent: `docs/agents/qa-agent.md`
   - Coordinator Agent: `docs/agents/coordinator-agent.md`
5. `docs/architecture/README.md`
6. `docs/roadmap/README.md`
7. `docs/standards/README.md`
8. `docs/qa/test-strategy.md` when tests, QA, or runtime viability are relevant
9. the target Linear issue, comments, blockers, attachments, linked PRs, and predecessor reports

For product-code work, also read the relevant full architecture, roadmap, standards, source, and test docs named by the issue.

## Reading efficiency rule

Start every role run with the compact current-state and role contract reads above. Expand into full architecture, roadmap, standards, QA, source, and test documents only when the target issue, diff, or suspected conflict makes them relevant.

Do not reread broad historical documents just to look diligent. Token burn is not evidence. When a compact README or ledger explicitly points to the current section, use that pointer first and then read the named full document section only as needed.

Never use this efficiency rule to skip a source required by the issue or to avoid checking a real architecture conflict.

## Current Phase And Live State

Detailed current phase, active lane, next lane, queue exposure, and current
caveats live only in `docs/workflows/current-state-ledger.md`. This file may
summarize durable product and architecture boundaries, but it must not repeat
moving current-lane facts except as a pointer to the ledger.

At role start, read the ledger before deciding whether a product lane,
workflow lane, or gate is executable. If this file, README, docs indexes,
architecture/roadmap/standards/QA entry docs, or older roadmap text disagree
with the ledger about current state, use the ledger and report the drift.

## Non-negotiable product boundary

Project Prompt Library is a retrieval-focused ChatGPT Apps / MCP connector.

The connector may:

- resolve commands and aliases;
- retrieve prompt definitions;
- validate prompt files;
- return model-visible prompt bodies for invocation;
- list and inspect active invokable prompts when their approved slice arrives.

The connector must not:

- execute workflows externally;
- manage conversation state;
- compose prompts;
- perform semantic routing;
- choose prompts without explicit command intent;
- become a prompt editor;
- manage drafts in ChatGPT;
- expose cache/admin controls through ChatGPT;
- implement private prompt suites in V1.

## Approved V1 ChatGPT-facing tools

Only these runtime tools are approved for V1:

```text
invoke_prompt_library_command
inspect_prompt_library_command
list_prompt_library_commands
```

Do not add:

```text
refresh_prompt_library_cache
create_prompt
update_prompt
delete_prompt
list_drafts
inspect_draft
admin/debug/cache tools
```

## Current source/cache boundary

The public GitHub source adapter and cache are approved M2 infrastructure. The three-command local MVP prompt set is approved M4 behavior. Later slices still decide broader hosted, trial, and private-suite behavior.

Current allowed behavior is limited by the active Linear issue and current-state ledger.

Approved source/cache/validation behavior includes:

- stale-while-revalidate behavior or the approved synchronous equivalent;
- last-known-good cache preservation;
- partial-valid cache behavior when at least one safe active command remains;
- cold no-cache failure when no usable active cache can be built;
- replacement of cache state only after a successful valid refresh;
- local `validate-prompts` validation of `prompts/*.md`;
- source/cache contract and golden coverage;
- fake-source/fake-clock tests for source/cache behavior;
- concise docs for implemented source/cache behavior.

Still forbidden unless the current-state ledger and an explicit approved issue
or coordinator path allow it:

- ChatGPT-facing cache refresh, diagnostics, or admin tools;
- additional real prompt files beyond the approved `handoff`, `grill-me`, and `spec-prompt-creator` MVP set;
- prompt changes, alias changes, tool metadata changes, and runtime changes outside an explicit approved issue;
- private GitHub source, token/OAuth/auth, DB, or private-suite behavior;
- hosted deployment;
- later product work outside an explicit approved coordinator path.

## Architecture standards

Use TypeScript/Node.

Use a thin MCP adapter over framework-independent core modules.

Expected dependency direction:

```text
mcp adapter
  -> application use cases
    -> domain
    -> cache/index
    -> prompt source
    -> parser/validator/projection
```

Rules:

- MCP adapter must not contain GitHub logic.
- MCP adapter must not parse Markdown.
- MCP adapter must not resolve aliases directly.
- Use cases must not import MCP SDK types.
- Domain must not import infrastructure.
- Source adapters are infrastructure only.

## Invocation payload hygiene

Normal invocation may expose only:

```text
title
lifecycle
input_mode
prompt_body
```

Normal invocation must not expose:

```text
slug
aliases
description
status
hash
source_path
repo_commit
indexed_at
validation diagnostics
cache diagnostics
debug_marker
prompt_version
created_at
updated_at
```

For ChatGPT to apply a prompt, `prompt_body` must be model-visible in `structuredContent` or `content`. Do not hide invocation prompt bodies only in `_meta`.

## Testing expectations

Use deterministic core tests for product behavior.

Required categories as slices mature:

- unit tests;
- MCP/tool contract tests;
- fixture-based golden tests;
- no-network core tests;
- fake-source/fake-clock tests for source/cache behavior.

Core tests must not hit GitHub, ChatGPT, a tunnel, or a hosted MCP endpoint unless the issue explicitly asks for live/platform smoke evidence.

Known caveats must remain visible until resolved:

- `test:golden` includes Slice 2.7 source/cache golden coverage, Slice 3.5 read-only API golden coverage, Slice 4.2 handoff golden coverage, Slice 4.3 grill-me golden coverage, Slice 4.4 spec-prompt-creator golden coverage, and Slice 4.5 coherent local MVP catalog coverage; later slices still need meaningful golden coverage when applicable.
- `validate-prompts` is a real local validator and now validates the three approved active local MVP prompts: `handoff`, `grill-me`, and `spec-prompt-creator`.
- npm audit findings must be reported when observed.

## Agent report checklist

Every agent report must include role-appropriate evidence. At minimum:

- target issue/PR/slice;
- scope completed or reviewed;
- files changed or inspected;
- docs changed or docs status;
- checks run/reviewed and exact results;
- architecture boundaries preserved or violated;
- known issues and caveats;
- intentionally not implemented by design;
- recommended next action.

If checks cannot be run or evidence is unavailable, say so plainly and explain why.

## Workflow control

- Coding issues move to `In Review`, not `Done`, when implementation is complete.
- Review evidence normally lives on the coding issue and PR.
- Separate Code Reviewer issues are optional/special-case, not mandatory by default.
- QA issues are separate when an independent gate matters.
- Coordinator gates synthesize coding, review, QA, PR, CI, docs, and roadmap evidence.
- Queue selection may use `Todo` first, then the top unblocked matching Backlog item in the current allowed lane. See `docs/agents/README.md`.

## Change-control rule

Do not weaken these instructions to make a task easier.

If a task conflicts with these instructions, stop and call out the architecture or workflow conflict.
