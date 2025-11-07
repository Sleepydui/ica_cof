declare module "papaparse" {
  export interface ParseResult<T> {
    data: T[];
    errors: unknown[];
    meta: Record<string, unknown>;
  }

  export interface ParseLocalFileConfig<T> {
    header?: boolean;
    skipEmptyLines?: boolean | "greedy";
    transformHeader?: (header: string) => string;
    complete?: (results: ParseResult<T>, file?: unknown) => void;
    error?: (error: Error) => void;
  }

  export interface PapaParseInstance {
    parse<T>(file: unknown, config?: ParseLocalFileConfig<T>): void;
  }

  const Papa: PapaParseInstance;
  export default Papa;

  export { ParseResult, ParseLocalFileConfig };
}

