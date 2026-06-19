export const PROMPT_FIXTURE_CATEGORIES = [
  "prompts-valid",
  "prompts-invalid",
  "prompts-conflicts",
] as const;

export type PromptFixtureCategory = (typeof PROMPT_FIXTURE_CATEGORIES)[number];

export type PromptFixtureIntent = "valid" | "invalid" | "conflict";

export interface PromptFixtureDescriptor {
  readonly category: PromptFixtureCategory;
  readonly fileName: string;
  readonly intent: PromptFixtureIntent;
  readonly relativePath: string;
}

export interface LoadedPromptFixture extends PromptFixtureDescriptor {
  readonly rawMarkdown: string;
}

function fixture(
  category: PromptFixtureCategory,
  fileName: string,
  intent: PromptFixtureIntent,
): PromptFixtureDescriptor {
  return {
    category,
    fileName,
    intent,
    relativePath: `test/fixtures/${category}/${fileName}`,
  };
}

export const PROMPT_FIXTURES = [
  fixture("prompts-valid", "active-basic.md", "valid"),
  fixture("prompts-valid", "active-with-alias.md", "valid"),
  fixture("prompts-valid", "draft-valid.md", "valid"),
  fixture("prompts-invalid", "missing-frontmatter.md", "invalid"),
  fixture("prompts-invalid", "missing-required-field.md", "invalid"),
  fixture("prompts-invalid", "malformed-frontmatter.md", "invalid"),
  fixture("prompts-invalid", "invalid-enum.md", "invalid"),
  fixture("prompts-invalid", "invalid-slug.md", "invalid"),
  fixture("prompts-invalid", "invalid-alias.md", "invalid"),
  fixture("prompts-invalid", "empty-body.md", "invalid"),
  fixture("prompts-conflicts", "duplicate-slug-a.md", "conflict"),
  fixture("prompts-conflicts", "duplicate-slug-b.md", "conflict"),
  fixture("prompts-conflicts", "alias-slug-conflict-a.md", "conflict"),
  fixture("prompts-conflicts", "alias-slug-conflict-b.md", "conflict"),
  fixture("prompts-conflicts", "duplicate-alias-a.md", "conflict"),
  fixture("prompts-conflicts", "duplicate-alias-b.md", "conflict"),
] as const satisfies readonly PromptFixtureDescriptor[];
