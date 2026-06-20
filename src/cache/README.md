# Runtime Cache and Index

Runtime cache/index code lives here.

Current files:

```text
PromptCache.ts
PromptIndex.ts
```

Possible future files:

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
- ALJ-41 replaces the original stale rebuild failure behavior with
  last-known-good preservation described below;
- ALJ-45 allows partial valid cache builds when at least one active command
  remains after indexing;
- invalid or unparsable prompt files follow the existing parser/validator path
  and are skipped before indexing when at least one usable prompt remains.

## Current ALJ-41 behavior

`PromptCache` now also preserves last-known-good cache state across stale
refresh attempts.

Implemented behavior:

- stale cache access attempts a synchronous refresh for this slice;
- successful valid refresh replaces the cached index and returns fresh state;
- source failure during stale refresh returns the stale last-known-good index;
- stale refresh that produces no usable prompts returns the stale
  last-known-good index;
- stale refresh that produces unsafe collection conflicts returns the stale
  last-known-good index;
- stale success results expose only cache freshness and the existing `PromptIndex`
  to core callers, not source/cache diagnostics.

## Current ALJ-45 behavior

`PromptCache` accepts partial valid source results when the parser,
per-prompt validator, and index can produce at least one active command.

Implemented behavior:

- invalid or unparsable prompt files are skipped and are not indexed;
- stale refreshes with unrelated invalid or unparsable prompt files replace the
  cached index when at least one active command remains and no unsafe collection
  conflicts are present;
- stale refreshes with unsafe collection conflicts preserve last-known-good
  cache state instead of replacing a safer cache;
- accepted indexes use `PromptIndex` conflict records so affected command strings
  fail closed instead of resolving by file order;
- cold source/build failure returns a typed `PROMPT_CACHE_UNAVAILABLE` failure
  with reason `no_cache`;
- cold builds with no parseable and valid prompt definitions, or with no active
  commands after indexing, return the same typed `no_cache` failure;
- failed stale refreshes and stale refreshes with no usable prompts continue to
  preserve last-known-good cache state.

Not implemented in ALJ-45:

- ChatGPT-facing cache refresh, cache diagnostics, or admin tools;
- real prompt files;
- inspect/list tool behavior.

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
- stale-while-revalidate and last-known-good behavior live in `PromptCache`;
- partial-valid and cold-failure behavior live in `PromptCache` and
  `PromptIndex`;
- no ChatGPT-facing cache refresh tool.
