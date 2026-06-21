import type { LoadedPromptFile, PromptSource } from "../../src/prompt-source/index.js";
import { fakeLoadedPromptFile } from "./FakePromptSource.js";

export interface MutableClock {
  (): number;
  setNow(value: number): void;
}

export interface ValidPromptFileOptions {
  readonly aliases?: readonly string[];
  readonly body?: string;
  readonly lifecycle?: "persistent_mode" | "interactive_workflow" | "one_shot";
  readonly inputMode?: "attached_input" | "conversation_context" | "either";
  readonly status?: "active" | "draft";
  readonly title?: string;
}

export class ScriptedPromptSource implements PromptSource {
  readonly #responses: readonly (readonly LoadedPromptFile[] | Error)[];
  #loadCount = 0;

  public constructor(responses: readonly (readonly LoadedPromptFile[] | Error)[]) {
    this.#responses = responses;
  }

  public get loadCount(): number {
    return this.#loadCount;
  }

  public async loadAllPrompts(): Promise<readonly LoadedPromptFile[]> {
    const response = this.#responses[this.#loadCount] ?? this.#responses.at(-1) ?? [];
    this.#loadCount += 1;

    if (response instanceof Error) {
      throw response;
    }

    return response.map(cloneLoadedPromptFile);
  }
}

export function mutableClock(initialNow: number): MutableClock {
  let currentNow = initialNow;
  const clock = (): number => currentNow;
  clock.setNow = (value: number): void => {
    currentNow = value;
  };

  return clock;
}

export function validPromptFile(
  slug: string,
  options: ValidPromptFileOptions = {},
): LoadedPromptFile {
  const aliases = options.aliases ?? [];
  const aliasesYaml =
    aliases.length === 0
      ? "aliases: []\n"
      : `aliases:\n${aliases.map((alias) => `  - ${alias}`).join("\n")}\n`;
  const title = options.title ?? titleizeSlug(slug);
  const body = options.body ?? `Apply the ${title} prompt.\n`;

  return fakeLoadedPromptFile({
    sourcePath: `fake://${slug}.md`,
    rawMarkdown: `---
schema_version: "1"
slug: ${slug}
title: ${title}
description: Test prompt ${slug}.
${aliasesYaml}lifecycle: ${options.lifecycle ?? "one_shot"}
input_mode: ${options.inputMode ?? "attached_input"}
status: ${options.status ?? "active"}
---

${body}`,
  });
}

export function invalidPromptFile(slug: string): LoadedPromptFile {
  return fakeLoadedPromptFile({
    sourcePath: `fake://${slug}.md`,
    rawMarkdown: `---
schema_version: "1"
slug: ${slug}
title: ${titleizeSlug(slug)}
description: Missing aliases keeps this prompt invalid.
lifecycle: one_shot
input_mode: attached_input
status: active
---

This invalid prompt must not invoke.
`,
  });
}

function cloneLoadedPromptFile(promptFile: LoadedPromptFile): LoadedPromptFile {
  return {
    sourcePath: promptFile.sourcePath,
    rawMarkdown: promptFile.rawMarkdown,
  };
}

function titleizeSlug(slug: string): string {
  return slug
    .split("-")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
