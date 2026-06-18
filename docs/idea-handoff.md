# Project Prompt Library — Idea Handoff Summary

Status: repository reference summary

## Idea

Create a skill-adjacent prompt library for ChatGPT that lets the user invoke reusable, exact, externally stored prompt workflows from inside a normal ChatGPT conversation using commands such as:

```text
@pl grill-me

[rough idea/input]
```

The goal is not to build a note app, text expander, custom GPT collection, or full workflow engine.

The goal is to create a reliable way to say:

> Use this exact saved prompt/spec now, against the message or conversation I am currently working in.

## Core problem

Complex reusable prompt workflows are too long and important to rely on memory, vague recollection, copy/paste, or local notes.

ChatGPT memory is not acceptable as canonical source because exact wording cannot be reliably inspected, edited, versioned, diffed, or guaranteed.

## Desired behavior

The user writes a short command inside ChatGPT. ChatGPT should retrieve the exact stored prompt and apply it to the current input or conversation.

This is closer to a prompt invocation layer than a normal prompt library:

- prompt is stored externally;
- user invokes it inside ChatGPT;
- ChatGPT receives the exact stored prompt;
- ChatGPT applies it to the current conversation/input.

## V1 boundaries

Included:

- explicit command-based prompt invocation;
- externally stored canonical prompt definitions;
- public command suite;
- GitHub as likely canonical source after Slice 2;
- exact lookup by slug/command;
- basic metadata such as title, slug, description, aliases, lifecycle, input mode, and status.

Excluded:

- local text expander;
- note app;
- memory-based source of truth;
- custom GPT as main solution;
- automatic prompt selection;
- bare-command recognition in V1;
- prompt marketplace;
- complex UI;
- workflow/session state management;
- external agent orchestration;
- prompt composition engine;
- personal uploads/private suites in V1.

## Future considerations

Future versions may support private/personal prompt suites, likely DB-backed and encrypted. This is a future architectural pressure, not a V1 implementation task.
