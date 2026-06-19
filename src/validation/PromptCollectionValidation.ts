import type { PromptDefinition } from "../domain/index.js";

export const PROMPT_COLLECTION_ISSUE_CODES = [
  "duplicate_slug",
  "alias_conflicts_with_slug",
  "duplicate_alias",
  "active_not_invokable_command_conflict",
] as const;

export type PromptCollectionIssueCode = (typeof PROMPT_COLLECTION_ISSUE_CODES)[number];

export interface PromptCollectionIssue {
  readonly code: PromptCollectionIssueCode;
  readonly command: string;
  readonly promptIndexes: readonly number[];
  readonly promptSlugs: readonly string[];
  readonly message: string;
}

export type PromptCollectionValidationResult =
  | {
      readonly kind: "success";
      readonly issues: readonly PromptCollectionIssue[];
    }
  | {
      readonly kind: "failure";
      readonly issues: readonly PromptCollectionIssue[];
    };

export interface PromptCollectionAnalysis {
  readonly issues: readonly PromptCollectionIssue[];
  readonly conflictedPromptIndexes: ReadonlySet<number>;
  readonly conflictedCommands: ReadonlyMap<string, readonly PromptCollectionIssue[]>;
}

interface PromptCollectionIssueInput {
  readonly code: PromptCollectionIssueCode;
  readonly command: string;
  readonly promptIndexes: readonly number[];
  readonly prompts: readonly PromptDefinition[];
  readonly message: string;
}

export function validatePromptCollection(
  prompts: readonly PromptDefinition[],
): PromptCollectionValidationResult {
  const analysis = analyzePromptCollection(prompts);

  if (analysis.issues.length > 0) {
    return {
      kind: "failure",
      issues: analysis.issues,
    };
  }

  return {
    kind: "success",
    issues: [],
  };
}

export function analyzePromptCollection(
  prompts: readonly PromptDefinition[],
): PromptCollectionAnalysis {
  const issues: PromptCollectionIssue[] = [];
  const conflictedPromptIndexes = new Set<number>();
  const conflictedCommandIssues = new Map<string, PromptCollectionIssue[]>();

  const addIssue = (input: PromptCollectionIssueInput): void => {
    const promptIndexes = uniqueNumbers(input.promptIndexes);
    const issue: PromptCollectionIssue = {
      code: input.code,
      command: input.command,
      promptIndexes,
      promptSlugs: uniqueStrings(
        promptIndexes.map((promptIndex) => input.prompts[promptIndex]?.metadata.slug ?? ""),
      ).filter((slug) => slug.length > 0),
      message: input.message,
    };

    issues.push(issue);

    for (const promptIndex of promptIndexes) {
      conflictedPromptIndexes.add(promptIndex);
    }

    const commandIssues = conflictedCommandIssues.get(issue.command) ?? [];
    conflictedCommandIssues.set(issue.command, [...commandIssues, issue]);
  };

  const slugOwners = new Map<string, number[]>();
  prompts.forEach((prompt, promptIndex) => {
    const owners = slugOwners.get(prompt.metadata.slug) ?? [];
    slugOwners.set(prompt.metadata.slug, [...owners, promptIndex]);
  });

  for (const [slug, promptIndexes] of slugOwners) {
    if (promptIndexes.length > 1) {
      addIssue({
        code: "duplicate_slug",
        command: slug,
        promptIndexes,
        prompts,
        message: `Duplicate prompt slug: ${slug}.`,
      });
    }
  }

  const activePromptIndexes = prompts
    .map((prompt, promptIndex) => ({ prompt, promptIndex }))
    .filter(({ prompt }) => prompt.metadata.status === "active");
  const notInvokablePromptIndexes = prompts
    .map((prompt, promptIndex) => ({ prompt, promptIndex }))
    .filter(({ prompt }) => prompt.metadata.status !== "active");
  const activeSlugOwners = new Map<string, number[]>();
  const activeAliasOwners = new Map<string, number[]>();
  const repeatedAliasOwners = new Map<string, number[]>();
  const activeCommandOwners = new Map<string, number[]>();
  const notInvokableCommandOwners = new Map<string, number[]>();

  for (const { prompt, promptIndex } of activePromptIndexes) {
    const slugOwnersForPrompt = activeSlugOwners.get(prompt.metadata.slug) ?? [];
    activeSlugOwners.set(prompt.metadata.slug, [...slugOwnersForPrompt, promptIndex]);

    const seenPromptAliases = new Set<string>();

    for (const command of promptCommands(prompt)) {
      const owners = activeCommandOwners.get(command) ?? [];
      activeCommandOwners.set(command, [...owners, promptIndex]);
    }

    for (const alias of prompt.metadata.aliases) {
      if (seenPromptAliases.has(alias)) {
        const repeatedOwners = repeatedAliasOwners.get(alias) ?? [];
        repeatedAliasOwners.set(alias, [...repeatedOwners, promptIndex]);
      }

      seenPromptAliases.add(alias);

      const aliasOwners = activeAliasOwners.get(alias) ?? [];
      activeAliasOwners.set(alias, [...aliasOwners, promptIndex]);
    }
  }

  for (const { prompt, promptIndex } of notInvokablePromptIndexes) {
    for (const command of promptCommands(prompt)) {
      const owners = notInvokableCommandOwners.get(command) ?? [];
      notInvokableCommandOwners.set(command, [...owners, promptIndex]);
    }
  }

  for (const { prompt, promptIndex } of activePromptIndexes) {
    for (const alias of prompt.metadata.aliases) {
      const conflictingSlugIndexes = (activeSlugOwners.get(alias) ?? []).filter(
        (slugOwnerIndex) => slugOwnerIndex !== promptIndex,
      );

      if (conflictingSlugIndexes.length > 0) {
        addIssue({
          code: "alias_conflicts_with_slug",
          command: alias,
          promptIndexes: [promptIndex, ...conflictingSlugIndexes],
          prompts,
          message: `Alias ${alias} conflicts with an active prompt slug.`,
        });
      }
    }
  }

  for (const [alias, promptIndexes] of activeAliasOwners) {
    const uniquePromptIndexes = uniqueNumbers(promptIndexes);

    if (uniquePromptIndexes.length > 1) {
      addIssue({
        code: "duplicate_alias",
        command: alias,
        promptIndexes: uniquePromptIndexes,
        prompts,
        message: `Duplicate active prompt alias: ${alias}.`,
      });
    }
  }

  for (const [alias, promptIndexes] of repeatedAliasOwners) {
    addIssue({
      code: "duplicate_alias",
      command: alias,
      promptIndexes,
      prompts,
      message: `Duplicate active prompt alias on one prompt: ${alias}.`,
    });
  }

  for (const [command, activeIndexes] of activeCommandOwners) {
    const notInvokableIndexes = notInvokableCommandOwners.get(command) ?? [];

    if (notInvokableIndexes.length > 0) {
      addIssue({
        code: "active_not_invokable_command_conflict",
        command,
        promptIndexes: [...activeIndexes, ...notInvokableIndexes],
        prompts,
        message: `Active command ${command} conflicts with a draft or status-less prompt command.`,
      });
    }
  }

  return {
    issues,
    conflictedPromptIndexes,
    conflictedCommands: conflictedCommandIssues,
  };
}

function uniqueNumbers(values: readonly number[]): readonly number[] {
  return [...new Set(values)];
}

function uniqueStrings(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

function promptCommands(prompt: PromptDefinition): readonly string[] {
  return uniqueStrings([prompt.metadata.slug, ...prompt.metadata.aliases]);
}
