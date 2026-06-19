# Test Fixtures

Fixture folders:

```text
prompts-valid/
prompts-invalid/
prompts-conflicts/
```

Initial Slice 1 fixture set:

- one valid active prompt;
- one valid active prompt with alias;
- one draft prompt;
- one invalid prompt missing a required field;
- one invalid prompt missing frontmatter delimiters;
- one invalid prompt with malformed frontmatter;
- one invalid prompt with invalid enum metadata;
- one invalid prompt with invalid slug metadata;
- one invalid prompt with invalid alias metadata;
- one invalid prompt with empty body;
- duplicate slug conflict fixtures;
- alias equals another active prompt slug conflict fixtures;
- duplicate alias conflict fixtures.

Unknown-command tests use the valid fixture set plus a missing command string,
not a special prompt file.
