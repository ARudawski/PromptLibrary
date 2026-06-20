# Runtime Cache and Index

Runtime cache/index code lives here.

Current files:

```text
PromptCache.ts
PromptIndex.ts
```

Expected future files:

```text
StaleWhileRevalidateCache.ts
```

## Current ALJ-37 behavior

`PromptCache` is a derived in-memory cache built from a `PromptSource` through
the existing parser, per-prompt validator, and `PromptIndex` path.

Implemented behavior:

- default TTL is five minutes;
- callers may provide a fakeable clock for deterministic tests;
- fresh cache hits return the current `PromptIndex` without reloading source;
- stale cache state is detectable;
- stale cache access attempts a synchronous rebuild;
- initial source/build failure returns a typed `PROMPT_CACHE_UNAVAILABLE`
  failure with reason `no_cache`;
- an initial source load that produces no parseable and valid prompt
  definitions returns the same typed `no_cache` failure instead of caching an
  empty index;
- stale rebuild failure returns a typed `PROMPT_CACHE_UNAVAILABLE` failure with
  reason `cache_build_failed` and does not serve the stale index;
- invalid or unparsable prompt files follow the existing parser/validator path
  and are skipped before indexing when at least one usable prompt remains.

Not implemented in ALJ-37:

- stale-while-revalidate;
- last-known-good preservation;
- partial-valid/cold-failure policy beyond the existing parser/validator/index
  path;
- ChatGPT-facing cache refresh, cache diagnostics, or admin tools;
- real prompt files.

## Current ALJ-17 behavior

`PromptIndex` is a derived in-memory lookup built from already parsed and
validated `PromptDefinition` values. It is not canonical storage.

Implemented behavior:

- active prompts are indexed by slug and alias;
- draft and status-less prompts are excluded from the active index;
- draft and status-less prompt commands resolve as not invokable;
- duplicate slugs, duplicate active aliases, and active alias-vs-active slug
  conflicts are recorded as conflicted commands;
- active command collisions with draft or status-less prompt commands are
  recorded as conflicted commands;
- conflicted prompts are not indexed by slug or alias;
- conflict resolution never uses file order, priority, or best-guess matching.

Rules:

- cache is derived and disposable;
- GitHub remains canonical for public prompts;
- no database in V1;
- TTL basics live in `PromptCache`;
- stale-while-revalidate and last-known-good behavior are future source/cache
  work, not part of the current cache implementation;
- no ChatGPT-facing cache refresh tool.
