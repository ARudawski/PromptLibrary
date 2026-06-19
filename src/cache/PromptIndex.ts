import type { PromptDefinition } from "../domain/index.js";
import type { PromptCollectionIssue } from "../validation/index.js";
import { analyzePromptCollection } from "../validation/index.js";

export type PromptCommandResolution =
  | {
      readonly kind: "found";
      readonly prompt: PromptDefinition;
    }
  | {
      readonly kind: "conflict";
      readonly command: string;
      readonly issues: readonly PromptCollectionIssue[];
    }
  | {
      readonly kind: "not_invokable";
      readonly command: string;
    }
  | {
      readonly kind: "not_found";
      readonly command: string;
    };

export interface PromptIndex {
  readonly activeCommands: readonly string[];
  readonly issues: readonly PromptCollectionIssue[];
  readonly activeByCommand: ReadonlyMap<string, PromptDefinition>;
  readonly conflictedCommands: ReadonlyMap<string, readonly PromptCollectionIssue[]>;
  readonly notInvokableCommands: ReadonlySet<string>;
}

export function buildPromptIndex(prompts: readonly PromptDefinition[]): PromptIndex {
  const analysis = analyzePromptCollection(prompts);
  const activeByCommand = new Map<string, PromptDefinition>();
  const notInvokableCommands = new Set<string>();
  const conflictedCommands = cloneConflictMap(analysis.conflictedCommands);

  for (const promptIndex of analysis.conflictedPromptIndexes) {
    const prompt = prompts[promptIndex];

    if (prompt === undefined) {
      continue;
    }

    const promptIssues = analysis.issues.filter((issue) =>
      issue.promptIndexes.includes(promptIndex),
    );

    for (const command of promptCommands(prompt)) {
      const existingIssues = conflictedCommands.get(command) ?? [];
      conflictedCommands.set(command, uniqueIssues([...existingIssues, ...promptIssues]));
    }
  }

  prompts.forEach((prompt, promptIndex) => {
    if (analysis.conflictedPromptIndexes.has(promptIndex)) {
      return;
    }

    if (prompt.metadata.status === "active") {
      for (const command of promptCommands(prompt)) {
        activeByCommand.set(command, prompt);
      }

      return;
    }

    for (const command of promptCommands(prompt)) {
      notInvokableCommands.add(command);
    }
  });

  return {
    activeCommands: [...activeByCommand.keys()],
    issues: analysis.issues,
    activeByCommand,
    conflictedCommands,
    notInvokableCommands,
  };
}

export function resolvePromptCommand(index: PromptIndex, command: string): PromptCommandResolution {
  const normalizedCommand = command.trim();
  const conflictIssues = index.conflictedCommands.get(normalizedCommand);

  if (conflictIssues !== undefined && conflictIssues.length > 0) {
    return {
      kind: "conflict",
      command: normalizedCommand,
      issues: conflictIssues,
    };
  }

  const prompt = index.activeByCommand.get(normalizedCommand);

  if (prompt !== undefined) {
    return {
      kind: "found",
      prompt,
    };
  }

  if (index.notInvokableCommands.has(normalizedCommand)) {
    return {
      kind: "not_invokable",
      command: normalizedCommand,
    };
  }

  return {
    kind: "not_found",
    command: normalizedCommand,
  };
}

function promptCommands(prompt: PromptDefinition): readonly string[] {
  return [...new Set([prompt.metadata.slug, ...prompt.metadata.aliases])];
}

function cloneConflictMap(
  source: ReadonlyMap<string, readonly PromptCollectionIssue[]>,
): Map<string, readonly PromptCollectionIssue[]> {
  const clone = new Map<string, readonly PromptCollectionIssue[]>();

  for (const [command, issues] of source) {
    clone.set(command, [...issues]);
  }

  return clone;
}

function uniqueIssues(issues: readonly PromptCollectionIssue[]): readonly PromptCollectionIssue[] {
  const seenKeys = new Set<string>();
  const unique: PromptCollectionIssue[] = [];

  for (const issue of issues) {
    const key = `${issue.code}:${issue.command}:${issue.promptIndexes.join(",")}`;

    if (seenKeys.has(key)) {
      continue;
    }

    seenKeys.add(key);
    unique.push(issue);
  }

  return unique;
}
