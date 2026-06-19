import matter from "gray-matter";

export type PromptParseErrorReason = "missing_frontmatter" | "malformed_frontmatter";

export interface PromptParseError {
  readonly reason: PromptParseErrorReason;
  readonly message: string;
  readonly cause?: unknown;
}

export interface ParsedPromptMarkdown {
  readonly metadata: unknown;
  readonly promptBody: string;
}

export type ParsePromptMarkdownResult =
  | {
      readonly kind: "success";
      readonly prompt: ParsedPromptMarkdown;
    }
  | {
      readonly kind: "failure";
      readonly error: PromptParseError;
    };

export function parsePromptMarkdown(rawMarkdown: string): ParsePromptMarkdownResult {
  const normalizedMarkdown = normalizeMarkdownLineEndings(rawMarkdown);

  if (!hasYamlFrontmatterDelimiters(normalizedMarkdown)) {
    return {
      kind: "failure",
      error: {
        reason: "missing_frontmatter",
        message: "Prompt Markdown must start with YAML frontmatter delimiters.",
      },
    };
  }

  try {
    const parsed = matter(normalizedMarkdown);

    return {
      kind: "success",
      prompt: {
        metadata: parsed.data,
        promptBody: normalizePromptBody(parsed.content),
      },
    };
  } catch (cause: unknown) {
    return {
      kind: "failure",
      error: {
        reason: "malformed_frontmatter",
        message: "Prompt YAML frontmatter could not be parsed.",
        cause,
      },
    };
  }
}

export function normalizeMarkdownLineEndings(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

function hasYamlFrontmatterDelimiters(markdown: string): boolean {
  if (!markdown.startsWith("---\n")) {
    return false;
  }

  return markdown.split("\n").slice(1).includes("---");
}

function normalizePromptBody(parsedContent: string): string {
  return normalizeMarkdownLineEndings(parsedContent).replace(/^\n/, "");
}
