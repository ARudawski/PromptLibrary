# Project Prompt Library — Agent Instructions

These are repository-level instructions for Codex and other coding agents.

## Required reading before implementation

Before changing code, read:

1. `README.md`
2. `docs/architecture/README.md`
3. `docs/roadmap/README.md`
4. `docs/standards/README.md`
5. `docs/slice-0-proof.md`

When the full architecture/roadmap/standards documents are added, they become mandatory reading too.

## Current phase

The project is in Slice 2.3: runtime cache with TTL.

Slice 0 was accepted with caveats through recorded Linear gate evidence. The premise was:

> ChatGPT can route `@pl proof` into the local MCP connector, receive a hardcoded model-visible prompt, and apply that prompt as behavior.

Treat [`docs/slices/slice-1-invocation-walking-skeleton.md`](docs/slices/slice-1-invocation-walking-skeleton.md), [`docs/invocation-contract.md`](docs/invocation-contract.md), and [`docs/prompt-schema.md`](docs/prompt-schema.md) as the approved Slice 1 baseline. Slice 2.1 approved the PromptSource boundary and fake test seam. Slice 2.2 approved the public GitHub prompt source adapter behind that boundary. Slice 2.3 is approved only for runtime cache TTL basics. Do not proceed to stale-while-revalidate, last-known-good behavior, partial-valid/cold-failure policy, inspect/list tools, real prompts, or hosted behavior without an explicit coordinator or architecture decision.

## Non-negotiable boundaries

This project is a retrieval-focused ChatGPT Apps / MCP connector.

The connector may:

- resolve commands and aliases;
- retrieve prompt definitions;
- validate prompt files;
- return model-visible prompt bodies for invocation;
- list and inspect active invokable prompts.

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

## Slice 0 history

Slice 0 was intentionally disposable.

Allowed:

- local TypeScript/Node MCP server;
- one hardcoded proof command;
- hardcoded proof prompt;
- local tunnel/developer setup documentation;
- manual validation checklist.

Forbidden in Slice 0:

- GitHub prompt source;
- Markdown parser;
- YAML frontmatter;
- schema validation;
- runtime cache;
- real prompts;
- inspect/list tools;
- hosted deployment;
- private-suite/auth/database design.

## Slice 1 rules

Allowed in Slice 1 only as approved by the current issue:

- local fixture prompt source;
- Markdown/frontmatter parsing;
- prompt definition and collection validation;
- derived active command index;
- invocation projection and use case;
- `invoke_prompt_library_command` MCP adapter;
- deterministic unit, contract, and golden tests.

Forbidden in Slice 1:

- public GitHub prompt source;
- runtime TTL cache, stale refresh, or last-known-good behavior;
- real prompt files;
- `inspect_prompt_library_command`;
- `list_prompt_library_commands`;
- prompt editing, draft management, admin/debug/cache tools;
- hosted deployment;
- private-suite/auth/database design.

## Slice 2.1 rules

Allowed in Slice 2.1 only as approved by the current issue:

- formal `PromptSource` interface;
- minimal `LoadedPromptFile` raw loaded-file shape;
- fake PromptSource test helper for deterministic tests;
- adaptation of local fixture loading to the PromptSource boundary;
- tests and docs for that source seam.

Forbidden in Slice 2.1:

- `PublicGitHubPromptSource`;
- live GitHub or network source reads;
- runtime TTL cache, stale-while-revalidate, or last-known-good behavior;
- real prompt files under `prompts/`;
- `inspect_prompt_library_command`;
- `list_prompt_library_commands`;
- prompt editing, draft management, admin/debug/cache tools;
- hosted deployment;
- private-suite/auth/database design.

## Slice 2.2 rules

Allowed in Slice 2.2 only as approved by the current issue:

- `PublicGitHubPromptSource`;
- public GitHub directory loading for configured `prompts/*.md`;
- typed/structured prompt-source failures;
- mocked/fake unit tests for source success and failure behavior;
- docs for source adapter configuration and behavior.

Forbidden in Slice 2.2:

- runtime TTL cache, stale-while-revalidate, or last-known-good behavior;
- real prompt files under `prompts/`;
- `inspect_prompt_library_command`;
- `list_prompt_library_commands`;
- ChatGPT-facing source/cache diagnostics or refresh tools;
- private GitHub source, token/OAuth/auth, DB, or private-suite behavior;
- hosted deployment.

## Slice 2.3 rules

Allowed in Slice 2.3 only as approved by the current issue:

- `PromptCache` or approved equivalent;
- five-minute TTL by default;
- configurable/fakeable clock;
- fresh/stale cache state;
- cache build from `PromptSource` through parser, validation, and index code;
- typed cache-aware failures when no usable cache can be built;
- fake-source/fake-clock unit tests;
- concise docs for implemented cache behavior.

Forbidden in Slice 2.3:

- stale-while-revalidate behavior;
- last-known-good preservation;
- partial-valid/cold-failure policy beyond the existing parser/validator/index path;
- ChatGPT-facing cache refresh, cache diagnostics, or admin tools;
- real prompt files under `prompts/`;
- `inspect_prompt_library_command`;
- `list_prompt_library_commands`;
- private GitHub source, token/OAuth/auth, DB, or private-suite behavior;
- hosted deployment.

## Architecture standards

Use TypeScript/Node.

Use a thin MCP adapter over framework-independent core modules.

Expected eventual dependency direction:

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

Use TDD for deterministic core behavior after Slice 0.

Required later test categories:

- unit tests;
- MCP/tool contract tests;
- fixture-based golden tests;
- no-network core tests.

Core tests must not hit GitHub, ChatGPT, a tunnel, or a hosted MCP endpoint.

## Agent report checklist

Every coding-agent report must include:

- scope completed;
- changed files;
- tests added/updated;
- commands run;
- results;
- architecture boundaries preserved;
- known issues;
- intentionally not implemented by design.

If checks cannot be run, say so plainly and explain why.

## Change-control rule

Do not weaken these instructions to make a task easier.

If a task conflicts with these instructions, stop and call out the architecture conflict.
