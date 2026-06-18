# Runtime Cache and Index

Runtime cache/index code lives here.

Expected future files:

```text
PromptCache.ts
PromptIndex.ts
StaleWhileRevalidateCache.ts
```

Rules:

- cache is derived and disposable;
- GitHub remains canonical for public prompts;
- no database in V1;
- 5-minute TTL;
- stale-while-revalidate;
- failed refresh must not destroy last-known-good cache;
- no ChatGPT-facing cache refresh tool.
