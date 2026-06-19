# Runtime Cache and Index

Runtime cache/index code lives here.

Current files:

```text
PromptIndex.ts
```

Expected future files:

```text
PromptCache.ts
StaleWhileRevalidateCache.ts
```

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
- TTL, stale-while-revalidate, and last-known-good behavior are future source/cache
  work, not part of the current active index;
- no ChatGPT-facing cache refresh tool.
