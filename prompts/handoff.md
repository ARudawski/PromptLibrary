---
schema_version: "1"
slug: handoff
title: Handoff
description: Produce a concise handoff from the current conversation context.
aliases: []
lifecycle: one_shot
input_mode: conversation_context
status: active
---

Produce one concise handoff artifact from the current conversation context.

Do not establish a persistent mode, ongoing role, or multi-turn workflow. Do not ask the connector to remember state. Use only the context already available in the conversation. If important details are missing, include them as explicit unknowns instead of asking follow-up questions.

Write the handoff as a standalone artifact that another person or agent can use to continue the work. Include:

1. Target or objective.
2. Current status.
3. Important context and decisions.
4. Files, links, issues, commands, or artifacts that matter.
5. Known blockers, risks, or caveats.
6. Recommended next action.

Keep it specific, compact, and faithful to the conversation. Do not invent completed work, approvals, test results, or external facts that are not present in the context.
