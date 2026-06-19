# Projection

Projection code converts validated prompt definitions into runtime output shapes.

Current files:

```text
toInvocationPayload.ts
```

Expected future files:

```text
toPromptInspection.ts
toPromptSummary.ts
```

## Current ALJ-17 behavior

`toInvocationPayload` returns exactly:

```text
title
lifecycle
input_mode
prompt_body
```

The projection intentionally excludes prompt metadata that must not appear in a
normal invocation payload, including slug, aliases, description, status, source
paths, hashes, timestamps, diagnostics, debug markers, and versions.

Rules:

- normal invocation projection may contain only `title`, `lifecycle`, `input_mode`, and `prompt_body`;
- inspection projection may include full active-prompt metadata and body;
- list projection must not include prompt bodies;
- projection code must not fetch, validate, log, or mutate cache.
