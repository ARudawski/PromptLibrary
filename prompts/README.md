# Prompt Definitions

This directory is the future V1 public command suite location.

Real prompt files are intentionally not added during Slice -1/Slice 0.

After the premise proof passes and later slices are implemented, prompt files will use this format:

```markdown
---
schema_version: "1"
slug: grill-me
title: Grill Me
description: Interview the user one question at a time until intent and constraints are clear.
aliases:
  - grill
lifecycle: interactive_workflow
input_mode: either
status: active
---

Prompt body goes here.
```

Only `active` prompts are invokable. Drafts may exist in GitHub later, but drafts are not exposed through ChatGPT-facing tools.

Initial local MVP prompts planned for Slice 4:

- `handoff.md`
- `grill-me.md`
- `spec-prompt-creator.md`
