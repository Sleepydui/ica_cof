import fs from "fs";
import path from "path";
import Papa from "papaparse";
import type { ParseLocalFileConfig, ParseResult } from "papaparse";
import type {
  Author,
  AuthorCsvRow,
  Paper,
  PaperCsvRow,
  Session,
  SessionCsvRow,
} from "./types";

type DatasetCache = {
  papers?: Paper[];
  authors?: Author[];
  sessions?: Session[];
  loaded: boolean;
};

const cache: DatasetCache = { loaded: false };

function projectRoot() {
  // lib/ is one level under project; app runs from process.cwd()
  return process.cwd();
}

function dataPath(filename: string) {
  return path.join(projectRoot(), "data", filename);
}

function parseCsvFile<T extends object>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filePath, { encoding: "utf8" });
    const config: ParseLocalFileConfig<T> = {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (res: ParseResult<T>) => resolve((res.data as T[]) || []),
      error: (err) => reject(err),
    };
    Papa.parse<T>(fileStream as unknown as ParseLocalFileConfig<T>["file"], config);
  });
}

function toIntSafe(value?: string): number | undefined {
  if (!value) return undefined;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? undefined : n;
}

function normalizePaper(row: PaperCsvRow): Paper {
  const authors = row["Authors"]
    ? row["Authors"].split(/;|\||,/).map((s) => s.trim()).filter(Boolean)
    : undefined;
  return {
    id: row["Paper ID"],
    title: row["Title"],
    paperType: row["Paper Type"],
    abstract: row["Abstract"],
    numAuthors: toIntSafe(row["Number of Authors"]),
    year: toIntSafe(row["Year"]),
    session: row["Session"],
    division: row["Division/Unit"],
    authors,
  };
}

function normalizeAuthor(row: AuthorCsvRow): Author {
  return {
    paperId: row["Paper ID"],
    title: row["Title"],
    position: toIntSafe(row["Author Position"]),
    name: row["Author Name"],
    affiliation: row["Author Affiliation"],
    year: toIntSafe(row["Year"]),
  };
}

function normalizeSession(row: SessionCsvRow): Session {
  return {
    year: toIntSafe(row["Year"]),
    type: row["Session Type"],
    title: row["Session Title"],
    division: row["Division/Unit"],
    chairName: row["Chair Name"],
    chairAffiliation: row["Chair Affiliation"],
  };
}

export async function loadDatasets(): Promise<{
  papers: Paper[];
  authors: Author[];
  sessions: Session[];
}> {
  if (cache.loaded && cache.papers && cache.authors && cache.sessions) {
    return { papers: cache.papers, authors: cache.authors, sessions: cache.sessions };
  }

  const [paperRows, authorRows, sessionRows] = await Promise.all([
    parseCsvFile<PaperCsvRow>(dataPath("papers.csv")),
    parseCsvFile<AuthorCsvRow>(dataPath("authors.csv")),
    parseCsvFile<SessionCsvRow>(dataPath("sessions.csv")),
  ]);

  cache.papers = paperRows.map(normalizePaper);
  cache.authors = authorRows.map(normalizeAuthor);
  cache.sessions = sessionRows.map(normalizeSession);
  cache.loaded = true;

  return { papers: cache.papers, authors: cache.authors, sessions: cache.sessions };
}

export function searchIncludes(haystack?: string, needle?: string): boolean {
  if (!haystack || !needle) return false;
  return haystack.toLowerCase().includes(needle.toLowerCase());
}


