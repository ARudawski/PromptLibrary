# Source and Cache Behavior

Status: Slice 2.7 source/cache contract documentation
Scope: M2 public source, cache, and validation behavior

This document summarizes the source/cache behavior currently frozen by deterministic tests. It is about backend retrieval infrastructure only; it does not authorize inspect/list tools, real prompt files, hosted deployment, private suites, auth, database behavior, or ChatGPT-facing cache controls.

## Public Source

The V1 public source seam is `PromptSource.loadAllPrompts()`, which returns raw Markdown prompt files as `LoadedPromptFile` values. `PublicGitHubPromptSource` is the V1 infrastructure adapter for a public GitHub `prompts/*.md` directory.

Source adapters load raw files only. Parser, prompt validation, collection validation, cache replacement decisions, and invocation payload projection stay in core modules outside the adapter.

Deterministic unit, contract, and golden tests must use fake sources or injected fetch stubs. They must not hit GitHub, ChatGPT, tunnels, hosted MCP endpoints, or the network.

## Cache Rules

`PromptCache` is derived, disposable runtime state. GitHub remains canonical for public prompts.

Current behavior:

- The default TTL is five minutes.
- Fresh cache hits return the current index without reloading the source.
- Stale cache access attempts a synchronous refresh in the current implementation.
- A successful valid refresh replaces the cache and returns fresh state.
- Source failures during stale refresh preserve and serve the stale last-known-good cache.
- Refreshes with no usable prompts, no active commands, or unsafe collection conflicts preserve last-known-good cache.
- Invalid or unparsable prompt files are skipped when at least one safe active command remains.
- Cold source/build failure returns `PROMPT_CACHE_UNAVAILABLE` with reason `no_cache`.
- Cold builds with no parseable valid prompts, or no active commands after indexing, also fail `no_cache`.

Conflicts are fail-closed. Conflicted prompt commands must not be resolved by file order, priority, or best guess. Accepted indexes may preserve unaffected active commands while conflicted command strings resolve as conflicts.

## Invocation Payload Hygiene

Normal invocation may expose only:

```text
title
lifecycle
input_mode
prompt_body
```

Normal invocation must not expose source paths, repository commits, cache timestamps, cache diagnostics, validation diagnostics, conflicts, debug markers, aliases, status, or other operational metadata.

## validate-prompts

`npm run validate-prompts` is a local developer and CI gate. It reads local `prompts/*.md`, reuses the parser, prompt definition validation, and collection validation rules, reports drafts separately, and exits non-zero for invalid active prompts or unsafe slug/alias conflicts.

The deterministic CI gate includes:

```text
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run validate-prompts
```

`validate-prompts` is not a ChatGPT-facing tool, not a GitHub fetch, not a prompt editor, and not an autofix workflow.

## Non-goals

Not implemented here:

- `inspect_prompt_library_command`
- `list_prompt_library_commands`
- `refresh_prompt_library_cache`
- cache diagnostics or admin tools in ChatGPT
- real MVP prompt files
- hosted deployment or live ChatGPT smoke
- private prompt suites, auth, OAuth, user accounts, or database storage
- prompt editing, draft management, semantic routing, prompt composition, or workflow/session state

Use [`workflows/current-state-ledger.md`](./workflows/current-state-ledger.md) for the current operating state, next lane, and workflow caveats.
