declare const process: {
  argv: string[];
  exit(code?: number): never;
};

interface ImportMeta {
  url: string;
}
