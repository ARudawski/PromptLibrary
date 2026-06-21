import { constants } from "node:fs";
import { access, readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { PromptDefinition } from "../src/domain/index.js";
import { type PromptParseError, parsePromptMarkdown } from "../src/prompt-parser/index.js";
import {
  type PromptCollectionIssue,
  type PromptValidationIssue,
  validatePromptCollection,
  validatePromptDefinition,
} from "../src/validation/index.js";

const DEFAULT_PROMPTS_DIRECTORY = "prompts";

export interface ValidatePromptsOptions {
  readonly rootDirectory?: string;
  readonly promptsDirectory?: string;
}

export interface PromptFileValidationIssue {
  readonly filePath: string;
  readonly issues: readonly PromptFileIssue[];
}

export type PromptFileIssue =
  | {
      readonly kind: "parse";
      readonly error: PromptParseError;
    }
  | {
      readonly kind: "definition";
      readonly issue: PromptValidationIssue;
    };

export interface ValidatedPromptFile {
  readonly filePath: string;
  readonly prompt: PromptDefinition;
}

export interface ValidatePromptsResult {
  readonly ok: boolean;
  readonly promptsDirectory: string;
  readonly files: readonly string[];
  readonly validPrompts: readonly ValidatedPromptFile[];
  readonly invalidFiles: readonly PromptFileValidationIssue[];
  readonly collectionIssues: readonly PromptCollectionIssue[];
  readonly activePrompts: readonly ValidatedPromptFile[];
  readonly draftPrompts: readonly ValidatedPromptFile[];
  readonly statuslessPrompts: readonly ValidatedPromptFile[];
}

interface LoadedPromptFile {
  readonly filePath: string;
  readonly rawMarkdown: string;
}

export async function validateLocalPrompts(
  options: ValidatePromptsOptions = {},
): Promise<ValidatePromptsResult> {
  const rootDirectory = resolve(options.rootDirectory ?? process.cwd());
  const promptsDirectory = resolve(
    rootDirectory,
    options.promptsDirectory ?? DEFAULT_PROMPTS_DIRECTORY,
  );
  const loadedFiles = await loadLocalPromptFiles(promptsDirectory, rootDirectory);
  const validPrompts: ValidatedPromptFile[] = [];
  const invalidFiles: PromptFileValidationIssue[] = [];

  for (const loadedFile of loadedFiles) {
    const parseResult = parsePromptMarkdown(loadedFile.rawMarkdown);

    if (parseResult.kind === "failure") {
      invalidFiles.push({
        filePath: loadedFile.filePath,
        issues: [{ kind: "parse", error: parseResult.error }],
      });
      continue;
    }

    const definitionResult = validatePromptDefinition(parseResult.prompt);

    if (definitionResult.kind === "failure") {
      invalidFiles.push({
        filePath: loadedFile.filePath,
        issues: definitionResult.issues.map((issue) => ({ kind: "definition", issue })),
      });
      continue;
    }

    validPrompts.push({
      filePath: loadedFile.filePath,
      prompt: definitionResult.prompt,
    });
  }

  const collectionResult = validatePromptCollection(validPrompts.map(({ prompt }) => prompt));
  const collectionIssues = collectionResult.issues;
  const activePrompts = validPrompts.filter(({ prompt }) => prompt.metadata.status === "active");
  const draftPrompts = validPrompts.filter(({ prompt }) => prompt.metadata.status === "draft");
  const statuslessPrompts = validPrompts.filter(
    ({ prompt }) => prompt.metadata.status === undefined,
  );

  return {
    ok: invalidFiles.length === 0 && collectionIssues.length === 0,
    promptsDirectory,
    files: loadedFiles.map(({ filePath }) => filePath),
    validPrompts,
    invalidFiles,
    collectionIssues,
    activePrompts,
    draftPrompts,
    statuslessPrompts,
  };
}

export function formatValidationReport(result: ValidatePromptsResult): string {
  const lines: string[] = [
    result.ok ? "validate-prompts: OK" : "validate-prompts: FAILED",
    `prompts_dir: ${result.promptsDirectory}`,
    `files: ${result.files.length}`,
    `valid: ${result.validPrompts.length}`,
    `active: ${result.activePrompts.length}`,
    `drafts: ${result.draftPrompts.length}`,
    `statusless: ${result.statuslessPrompts.length}`,
  ];

  if (result.files.length === 0) {
    lines.push("note: no local prompt Markdown files found.");
  }

  appendPromptList(lines, "draft prompts", result.draftPrompts);
  appendPromptList(lines, "statusless prompts", result.statuslessPrompts);

  if (result.invalidFiles.length > 0) {
    lines.push("invalid files:");

    for (const invalidFile of result.invalidFiles) {
      for (const issue of invalidFile.issues) {
        lines.push(`- ${invalidFile.filePath}: ${formatFileIssue(issue)}`);
      }
    }
  }

  if (result.collectionIssues.length > 0) {
    lines.push("collection issues:");

    for (const issue of result.collectionIssues) {
      lines.push(
        `- ${issue.code} ${issue.command}: ${issue.message} (${issue.promptSlugs.join(", ")})`,
      );
    }
  }

  return `${lines.join("\n")}\n`;
}

async function runCli(): Promise<number> {
  const result = await validateLocalPrompts();
  const report = formatValidationReport(result);

  if (result.ok) {
    process.stdout.write(report);
    return 0;
  }

  process.stderr.write(report);
  return 1;
}

async function loadLocalPromptFiles(
  promptsDirectory: string,
  rootDirectory: string,
): Promise<readonly LoadedPromptFile[]> {
  if (!(await pathExists(promptsDirectory))) {
    return [];
  }

  const directoryEntries = await readdir(promptsDirectory, { withFileTypes: true });
  const markdownFileNames = directoryEntries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  return Promise.all(
    markdownFileNames.map(async (fileName) => {
      const filePath = join(promptsDirectory, fileName);

      return {
        filePath: relative(rootDirectory, filePath),
        rawMarkdown: await readFile(filePath, "utf8"),
      };
    }),
  );
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function appendPromptList(
  lines: string[],
  label: string,
  prompts: readonly ValidatedPromptFile[],
): void {
  if (prompts.length === 0) {
    return;
  }

  lines.push(`${label}:`);

  for (const prompt of prompts) {
    lines.push(
      `- ${prompt.prompt.metadata.slug} (${prompt.filePath}): ${prompt.prompt.metadata.title}`,
    );
  }
}

function formatFileIssue(issue: PromptFileIssue): string {
  if (issue.kind === "parse") {
    return `${issue.error.reason} - ${issue.error.message}`;
  }

  const field = issue.issue.field === undefined ? "" : `${issue.issue.field}: `;
  return `${issue.issue.code} - ${field}${issue.issue.message}`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  runCli()
    .then((exitCode) => {
      process.exitCode = exitCode;
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`validate-prompts: FAILED\n${message}\n`);
      process.exitCode = 1;
    });
}
