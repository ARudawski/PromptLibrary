import type { LoadedPromptFile } from "./LoadedPromptFile.js";
import type { PromptSource } from "./PromptSource.js";

export const DEFAULT_PUBLIC_GITHUB_API_BASE_URL = "https://api.github.com";
export const DEFAULT_PUBLIC_GITHUB_PROMPT_REF = "main";
export const DEFAULT_PUBLIC_GITHUB_PROMPTS_PATH = "prompts";
export const DEFAULT_PUBLIC_GITHUB_USER_AGENT = "project-prompt-library";

export interface PublicGitHubPromptSourceConfig {
  readonly owner: string;
  readonly repo: string;
  readonly ref?: string;
  readonly promptsPath?: string;
}

export interface PublicGitHubPromptSourceOptions extends PublicGitHubPromptSourceConfig {
  readonly apiBaseUrl?: string;
  readonly fetch?: PublicGitHubFetch;
  readonly userAgent?: string;
}

export type PublicGitHubFetch = (
  url: string,
  init?: PublicGitHubFetchInit,
) => Promise<PublicGitHubFetchResponse>;

export interface PublicGitHubFetchInit {
  readonly headers?: Readonly<Record<string, string>>;
}

export interface PublicGitHubFetchResponse {
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  json(): Promise<unknown>;
  text(): Promise<string>;
}

export type PublicGitHubPromptSourceErrorCode =
  | "GITHUB_DIRECTORY_FETCH_FAILED"
  | "GITHUB_DIRECTORY_RESPONSE_INVALID"
  | "GITHUB_FILE_FETCH_FAILED"
  | "GITHUB_FILE_RESPONSE_INVALID";

export interface PublicGitHubPromptSourceErrorOptions {
  readonly code: PublicGitHubPromptSourceErrorCode;
  readonly message: string;
  readonly status?: number;
  readonly sourcePath?: string;
  readonly cause?: unknown;
}

export class PublicGitHubPromptSourceError extends Error {
  public override readonly name = "PublicGitHubPromptSourceError";
  public readonly code: PublicGitHubPromptSourceErrorCode;
  public readonly status?: number;
  public readonly sourcePath?: string;

  public constructor(options: PublicGitHubPromptSourceErrorOptions) {
    super(options.message, options.cause === undefined ? undefined : { cause: options.cause });
    this.code = options.code;

    if (options.status !== undefined) {
      this.status = options.status;
    }

    if (options.sourcePath !== undefined) {
      this.sourcePath = options.sourcePath;
    }
  }
}

interface GitHubContentsFileEntry {
  readonly type: "file";
  readonly name: string;
  readonly path: string;
  readonly download_url: string;
}

export class PublicGitHubPromptSource implements PromptSource {
  readonly #owner: string;
  readonly #repo: string;
  readonly #ref: string;
  readonly #promptsPath: string;
  readonly #apiBaseUrl: string;
  readonly #fetch: PublicGitHubFetch;
  readonly #userAgent: string;

  public constructor(options: PublicGitHubPromptSourceOptions) {
    this.#owner = requireNonEmptyConfigValue("owner", options.owner);
    this.#repo = requireNonEmptyConfigValue("repo", options.repo);
    this.#ref = requireNonEmptyConfigValue("ref", options.ref ?? DEFAULT_PUBLIC_GITHUB_PROMPT_REF);
    this.#promptsPath = normalizePromptsPath(
      options.promptsPath ?? DEFAULT_PUBLIC_GITHUB_PROMPTS_PATH,
    );
    this.#apiBaseUrl = normalizeApiBaseUrl(
      options.apiBaseUrl ?? DEFAULT_PUBLIC_GITHUB_API_BASE_URL,
    );
    this.#fetch = options.fetch ?? defaultPublicGitHubFetch;
    this.#userAgent = requireNonEmptyConfigValue(
      "userAgent",
      options.userAgent ?? DEFAULT_PUBLIC_GITHUB_USER_AGENT,
    );
  }

  public async loadAllPrompts(): Promise<readonly LoadedPromptFile[]> {
    const promptFileEntries = await this.#loadPromptFileEntries();

    return Promise.all(promptFileEntries.map((entry) => this.#loadPromptFile(entry)));
  }

  async #loadPromptFileEntries(): Promise<readonly GitHubContentsFileEntry[]> {
    const response = await fetchOrThrow(
      this.#fetch,
      this.#contentsApiUrl(),
      {
        headers: this.#apiHeaders(),
      },
      {
        code: "GITHUB_DIRECTORY_FETCH_FAILED",
        message: `Failed to load GitHub prompt directory "${this.#promptsPath}".`,
      },
    );

    if (!response.ok) {
      throw new PublicGitHubPromptSourceError({
        code: "GITHUB_DIRECTORY_FETCH_FAILED",
        message: `Failed to load GitHub prompt directory "${this.#promptsPath}".`,
        status: response.status,
      });
    }

    const responseBody = await parseJsonResponse(response, {
      code: "GITHUB_DIRECTORY_RESPONSE_INVALID",
      message: `GitHub prompt directory "${this.#promptsPath}" did not return valid JSON.`,
    });

    if (!Array.isArray(responseBody)) {
      throw new PublicGitHubPromptSourceError({
        code: "GITHUB_DIRECTORY_RESPONSE_INVALID",
        message: `GitHub prompt path "${this.#promptsPath}" is not a directory listing.`,
      });
    }

    return responseBody
      .filter(isGitHubContentsFileEntry)
      .filter((entry) => entry.name.endsWith(".md"));
  }

  async #loadPromptFile(entry: GitHubContentsFileEntry): Promise<LoadedPromptFile> {
    const response = await fetchOrThrow(this.#fetch, entry.download_url, undefined, {
      code: "GITHUB_FILE_FETCH_FAILED",
      message: `Failed to load GitHub prompt file "${entry.path}".`,
      sourcePath: entry.path,
    });

    if (!response.ok) {
      throw new PublicGitHubPromptSourceError({
        code: "GITHUB_FILE_FETCH_FAILED",
        message: `Failed to load GitHub prompt file "${entry.path}".`,
        status: response.status,
        sourcePath: entry.path,
      });
    }

    try {
      return {
        sourcePath: entry.path,
        rawMarkdown: await response.text(),
      };
    } catch (error) {
      throw new PublicGitHubPromptSourceError({
        code: "GITHUB_FILE_RESPONSE_INVALID",
        message: `GitHub prompt file "${entry.path}" did not return readable text.`,
        sourcePath: entry.path,
        cause: error,
      });
    }
  }

  #contentsApiUrl(): string {
    const url = new URL(
      `${this.#apiBaseUrl}/repos/${encodeURIComponent(this.#owner)}/${encodeURIComponent(
        this.#repo,
      )}/contents/${encodePathSegments(this.#promptsPath)}`,
    );
    url.searchParams.set("ref", this.#ref);

    return url.toString();
  }

  #apiHeaders(): Readonly<Record<string, string>> {
    return {
      Accept: "application/vnd.github+json",
      "User-Agent": this.#userAgent,
      "X-GitHub-Api-Version": "2022-11-28",
    };
  }
}

async function defaultPublicGitHubFetch(
  url: string,
  init?: PublicGitHubFetchInit,
): Promise<PublicGitHubFetchResponse> {
  return globalThis.fetch(url, init);
}

async function fetchOrThrow(
  fetch: PublicGitHubFetch,
  url: string,
  init: PublicGitHubFetchInit | undefined,
  errorOptions: Pick<PublicGitHubPromptSourceErrorOptions, "code" | "message" | "sourcePath">,
): Promise<PublicGitHubFetchResponse> {
  try {
    return await fetch(url, init);
  } catch (error) {
    if (error instanceof PublicGitHubPromptSourceError) {
      throw error;
    }

    throw new PublicGitHubPromptSourceError({
      ...errorOptions,
      cause: error,
    });
  }
}

async function parseJsonResponse(
  response: PublicGitHubFetchResponse,
  errorOptions: Pick<PublicGitHubPromptSourceErrorOptions, "code" | "message">,
): Promise<unknown> {
  try {
    return await response.json();
  } catch (error) {
    throw new PublicGitHubPromptSourceError({
      ...errorOptions,
      status: response.status,
      cause: error,
    });
  }
}

function isGitHubContentsFileEntry(value: unknown): value is GitHubContentsFileEntry {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.type === "file" &&
    typeof value.name === "string" &&
    typeof value.path === "string" &&
    typeof value.download_url === "string"
  );
}

function requireNonEmptyConfigValue(name: string, value: string): string {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    throw new TypeError(`PublicGitHubPromptSource ${name} must not be empty.`);
  }

  return trimmedValue;
}

function normalizePromptsPath(promptsPath: string): string {
  const normalizedPath = promptsPath.trim().replace(/^\/+|\/+$/g, "");

  if (normalizedPath.length === 0) {
    throw new TypeError("PublicGitHubPromptSource promptsPath must not be empty.");
  }

  return normalizedPath;
}

function normalizeApiBaseUrl(apiBaseUrl: string): string {
  return requireNonEmptyConfigValue("apiBaseUrl", apiBaseUrl).replace(/\/+$/g, "");
}

function encodePathSegments(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
