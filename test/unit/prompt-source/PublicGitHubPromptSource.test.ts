import { describe, expect, it } from "vitest";
import {
  type PublicGitHubFetch,
  type PublicGitHubFetchInit,
  type PublicGitHubFetchResponse,
  PublicGitHubPromptSource,
  PublicGitHubPromptSourceError,
} from "../../../src/prompt-source/index.js";

describe("PublicGitHubPromptSource", () => {
  it("loads all Markdown files from the configured public GitHub prompt path", async () => {
    const calls: FetchCall[] = [];
    const fetch = createFetchStub(calls, {
      "https://api.github.com/repos/ARudawski/PromptLibrary/contents/prompts?ref=main":
        jsonResponse([
          {
            type: "file",
            name: "handoff.md",
            path: "prompts/handoff.md",
            download_url: "https://raw.example.test/handoff.md",
          },
          {
            type: "file",
            name: "README.md",
            path: "prompts/README.md",
            download_url: "https://raw.example.test/README.md",
          },
          {
            type: "file",
            name: "notes.txt",
            path: "prompts/notes.txt",
            download_url: "https://raw.example.test/notes.txt",
          },
          {
            type: "dir",
            name: "nested",
            path: "prompts/nested",
          },
        ]),
      "https://raw.example.test/handoff.md": textResponse("handoff markdown"),
      "https://raw.example.test/README.md": textResponse("readme markdown"),
    });
    const source = new PublicGitHubPromptSource({
      owner: "ARudawski",
      repo: "PromptLibrary",
      ref: "main",
      promptsPath: "prompts",
      fetch,
    });

    await expect(source.loadAllPrompts()).resolves.toEqual([
      {
        sourcePath: "prompts/handoff.md",
        rawMarkdown: "handoff markdown",
      },
      {
        sourcePath: "prompts/README.md",
        rawMarkdown: "readme markdown",
      },
    ]);

    expect(calls).toEqual([
      {
        url: "https://api.github.com/repos/ARudawski/PromptLibrary/contents/prompts?ref=main",
        init: {
          headers: {
            Accept: "application/vnd.github+json",
            "User-Agent": "project-prompt-library",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        },
      },
      {
        url: "https://raw.example.test/handoff.md",
      },
      {
        url: "https://raw.example.test/README.md",
      },
    ]);
  });

  it("maps GitHub directory request failures to typed source errors", async () => {
    const source = new PublicGitHubPromptSource({
      owner: "ARudawski",
      repo: "PromptLibrary",
      fetch: createFetchStub([], {
        "https://api.github.com/repos/ARudawski/PromptLibrary/contents/prompts?ref=main":
          jsonResponse(
            {
              message: "Not Found",
            },
            404,
          ),
      }),
    });

    await expect(source.loadAllPrompts()).rejects.toMatchObject({
      name: "PublicGitHubPromptSourceError",
      code: "GITHUB_DIRECTORY_FETCH_FAILED",
      status: 404,
    });
  });

  it("maps rejected GitHub directory fetches to typed source errors", async () => {
    const source = new PublicGitHubPromptSource({
      owner: "ARudawski",
      repo: "PromptLibrary",
      fetch: async () => {
        throw new Error("offline");
      },
    });

    await expect(source.loadAllPrompts()).rejects.toMatchObject({
      name: "PublicGitHubPromptSourceError",
      code: "GITHUB_DIRECTORY_FETCH_FAILED",
    });
  });

  it("maps GitHub file request failures to typed source errors with source path", async () => {
    const source = new PublicGitHubPromptSource({
      owner: "ARudawski",
      repo: "PromptLibrary",
      fetch: createFetchStub([], {
        "https://api.github.com/repos/ARudawski/PromptLibrary/contents/prompts?ref=main":
          jsonResponse([
            {
              type: "file",
              name: "broken.md",
              path: "prompts/broken.md",
              download_url: "https://raw.example.test/broken.md",
            },
          ]),
        "https://raw.example.test/broken.md": textResponse("server unavailable", 503),
      }),
    });

    await expect(source.loadAllPrompts()).rejects.toMatchObject({
      name: "PublicGitHubPromptSourceError",
      code: "GITHUB_FILE_FETCH_FAILED",
      status: 503,
      sourcePath: "prompts/broken.md",
    });
  });

  it("maps non-directory GitHub contents responses to typed source errors", async () => {
    const source = new PublicGitHubPromptSource({
      owner: "ARudawski",
      repo: "PromptLibrary",
      fetch: createFetchStub([], {
        "https://api.github.com/repos/ARudawski/PromptLibrary/contents/prompts?ref=main":
          jsonResponse({
            type: "file",
            path: "prompts",
          }),
      }),
    });

    await expect(source.loadAllPrompts()).rejects.toBeInstanceOf(PublicGitHubPromptSourceError);
    await expect(source.loadAllPrompts()).rejects.toMatchObject({
      code: "GITHUB_DIRECTORY_RESPONSE_INVALID",
    });
  });
});

interface FetchCall {
  readonly url: string;
  readonly init?: PublicGitHubFetchInit;
}

function createFetchStub(
  calls: FetchCall[],
  responsesByUrl: Readonly<Record<string, PublicGitHubFetchResponse>>,
): PublicGitHubFetch {
  return async (url, init) => {
    calls.push(init === undefined ? { url } : { url, init });

    const response = responsesByUrl[url];

    if (response === undefined) {
      throw new Error(`Unexpected fetch URL: ${url}`);
    }

    return response;
  };
}

function jsonResponse(body: unknown, status = 200): PublicGitHubFetchResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: statusTextFor(status),
    async json(): Promise<unknown> {
      return body;
    },
    async text(): Promise<string> {
      return JSON.stringify(body);
    },
  };
}

function textResponse(body: string, status = 200): PublicGitHubFetchResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: statusTextFor(status),
    async json(): Promise<unknown> {
      throw new Error("Text response has no JSON body.");
    },
    async text(): Promise<string> {
      return body;
    },
  };
}

function statusTextFor(status: number): string {
  return status >= 200 && status < 300 ? "OK" : "Request failed";
}
