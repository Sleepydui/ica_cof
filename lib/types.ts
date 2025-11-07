export type PaperCsvRow = {
  "Paper ID": string;
  "Title": string;
  "Paper Type": string;
  "Abstract": string;
  "Number of Authors": string;
  "Year": string;
  "Session": string;
  "Division/Unit": string;
  "Authors": string; // concatenated authors per CSV
};

export type AuthorCsvRow = {
  "Paper ID": string;
  "Title": string;
  "Number of Authors": string;
  "Author Position": string;
  "Author Name": string;
  "Author Affiliation": string;
  "Year": string;
};

export type SessionCsvRow = {
  "Year": string;
  "Session Type": string;
  "Session Title": string;
  "Division/Unit": string;
  "Chair Name": string;
  "Chair Affiliation": string;
};

export type Paper = {
  id: string;
  title: string;
  paperType?: string;
  abstract?: string;
  numAuthors?: number;
  year?: number;
  session?: string;
  division?: string;
  authors?: string[];
};

export type Author = {
  paperId: string;
  title: string;
  position?: number;
  name: string;
  affiliation?: string;
  year?: number;
};

export type Session = {
  year?: number;
  type?: string;
  title: string;
  division?: string;
  chairName?: string;
  chairAffiliation?: string;
};

export type QueryEntity = "papers" | "paperById" | "authors" | "sessions";

export type QueryParams = {
  entity: QueryEntity;
  id?: string; // for paperById
  q?: string; // text search
  year?: number;
  session?: string;
  division?: string;
  author?: string; // author name contains
  limit: number;
  offset: number;
};


