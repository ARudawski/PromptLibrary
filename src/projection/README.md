# Projection

Projection code converts validated prompt definitions into runtime output shapes.

Expected future files:

```text
toInvocationPayload.ts
toPromptInspection.ts
toPromptSummary.ts
```

Rules:

- normal invocation projection may contain only `title`, `lifecycle`, `input_mode`, and `prompt_body`;
- inspection projection may include full active-prompt metadata and body;
- list projection must not include prompt bodies;
- projection code must not fetch, validate, log, or mutate cache.
