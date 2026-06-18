# Configuration

Configuration loading lives here.

Expected future file:

```text
appConfig.ts
```

Rules:

- validate configuration at startup;
- do not hardcode secrets;
- V1 public GitHub source should not require a token unless rate/deployment constraints force it;
- if a token is introduced later, use environment variables or managed secret storage and never expose it through ChatGPT-facing responses.
