# Prompt Source Infrastructure

Prompt source adapters live here.

Expected future files:

```text
PromptSource.ts
PublicGitHubPromptSource.ts
LoadedPromptFile.ts
```

V1 should expose only a small source boundary:

```ts
interface PromptSource {
  loadAllPrompts(): Promise<LoadedPromptFile[]>;
}
```

Rules:

- public GitHub source is infrastructure only;
- no private/DB source implementation in V1;
- no multi-source merge logic in V1;
- application/core code should depend on `PromptSource`, not GitHub directly.
