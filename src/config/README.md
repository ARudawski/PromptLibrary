# Configuration

Configuration loading lives here.

Expected future file:

```text
appConfig.ts
```

Current Slice 2.2 source configuration is constructor-level only on
`PublicGitHubPromptSource`:

```text
owner
repo
ref
promptsPath
```

The fixture-backed MCP runtime is not wired to public GitHub source yet, so no
process-level app config loader exists in this slice.

Rules:

- validate configuration at startup;
- do not hardcode secrets;
- V1 public GitHub source should not require a token unless rate/deployment constraints force it;
- if a token is introduced later, use environment variables or managed secret storage and never expose it through ChatGPT-facing responses.
