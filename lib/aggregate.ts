import { loadDatasets, searchIncludes } from "./csv";

export type Authorship = {
  position?: number;
  author_name?: string;
  author_affiliation?: string;
};

export type SessionInfo = {
  session: string;
  session_type?: string;
  chair_name?: string;
  chair_affiliation?: string;
  division?: string;
  years: number[];
  paper_count?: number;
  session_id?: string;
};

export type PaperAgg = {
  paper_id: string;
  title: string;
  paper_type?: string;
  abstract?: string;
  number_of_authors?: number;
  year?: number;
  session?: string | null;
  division?: string | null;
  authorships?: Authorship[] | null;
  author_names?: string[] | null;
  session_info?: SessionInfo | null;
};

export type AuthorAgg = {
  author_name: string;
  attend_count: number;
  paper_count: number;
  paper_ids?: string[];
  affiliations?: string[];
  affiliation_history?: string;
  years_attended?: number[];
};

export type SessionAgg = {
  session: string;
  session_type?: string;
  chair_name?: string;
  chair_affiliation?: string;
  division?: string;
  years?: number[];
  paper_count?: number;
  session_id: string;
};

function makeSessionId(title: string, division?: string) {
  return Buffer.from(`${title}::${division || ""}`.toLowerCase()).toString("hex");
}

export async function aggregatePapers(): Promise<PaperAgg[]> {
  const { papers, authors, sessions } = await loadDatasets();

  const sessionIndex = new Map<string, SessionInfo>();
  for (const s of sessions) {
    if (!s.title) continue;
    const key = s.title;
    const id = makeSessionId(s.title, s.division);
    const existed = sessionIndex.get(key);
    if (!existed) {
      sessionIndex.set(key, {
        session: s.title,
        session_type: s.type,
        chair_name: s.chairName,
        chair_affiliation: s.chairAffiliation,
        division: s.division,
        years: s.year ? [s.year] : [],
        paper_count: 0,
        session_id: id,
      });
    } else {
      if (s.year && !existed.years.includes(s.year)) existed.years.push(s.year);
      if (s.type) existed.session_type = existed.session_type || s.type;
      if (s.chairName) existed.chair_name = existed.chair_name || s.chairName;
      if (s.chairAffiliation) existed.chair_affiliation = existed.chair_affiliation || s.chairAffiliation;
      if (s.division) existed.division = existed.division || s.division;
    }
  }

  const byPaperAuthors = new Map<string, Authorship[]>();
  for (const a of authors) {
    const list = byPaperAuthors.get(a.paperId) || [];
    list.push({ position: a.position, author_name: a.name, author_affiliation: a.affiliation });
    byPaperAuthors.set(a.paperId, list);
  }

  const result: PaperAgg[] = papers.map((p) => {
    const as = (byPaperAuthors.get(p.id) || []).sort((x, y) => (x.position ?? 0) - (y.position ?? 0));
    const names = as.map((x) => x.author_name!).filter(Boolean);
    const sinfo = p.session ? sessionIndex.get(p.session) : undefined;
    if (sinfo) sinfo.paper_count = (sinfo.paper_count || 0) + 1;
    return {
      paper_id: p.id,
      title: p.title,
      paper_type: p.paperType,
      abstract: p.abstract,
      number_of_authors: p.numAuthors,
      year: p.year,
      session: p.session || null,
      division: p.division || null,
      authorships: as.length ? as : null,
      author_names: names.length ? names : null,
      session_info: sinfo || null,
    };
  });

  return result;
}

export async function aggregateAuthors(): Promise<AuthorAgg[]> {
  const papers = await aggregatePapers();
  const map = new Map<string, AuthorAgg>();
  for (const p of papers) {
    const year = p.year;
    for (const a of p.authorships || []) {
      if (!a.author_name) continue;
      const key = a.author_name;
      const it = map.get(key) || {
        author_name: key,
        attend_count: 0,
        paper_count: 0,
        paper_ids: [],
        affiliations: [],
        years_attended: [],
      };
      it.paper_count += 1;
      if (p.paper_id) it.paper_ids!.push(p.paper_id);
      if (a.author_affiliation) it.affiliations!.push(a.author_affiliation);
      if (typeof year === "number" && !it.years_attended!.includes(year)) it.years_attended!.push(year);
      map.set(key, it);
    }
  }
  // attend_count: 用 years_attended 的不同年份数估算
  for (const v of map.values()) {
    v.affiliations = Array.from(new Set(v.affiliations));
    v.affiliation_history = v.affiliations.join(" -> ") || undefined;
    v.attend_count = (v.years_attended || []).length;
  }
  return Array.from(map.values());
}

export async function aggregateSessions(): Promise<SessionAgg[]> {
  const papers = await aggregatePapers();
  const map = new Map<string, SessionAgg>();
  for (const p of papers) {
    if (!p.session) continue;
    const key = p.session;
    const id = p.session_info?.session_id || makeSessionId(p.session, p.division || undefined);
    const it = map.get(key) || {
      session: key,
      session_type: p.session_info?.session_type,
      chair_name: p.session_info?.chair_name,
      chair_affiliation: p.session_info?.chair_affiliation,
      division: p.division || undefined,
      years: [],
      paper_count: 0,
      session_id: id,
    };
    if (typeof p.year === "number" && !it.years!.includes(p.year)) it.years!.push(p.year);
    it.paper_count = (it.paper_count || 0) + 1;
    map.set(key, it);
  }
  return Array.from(map.values());
}

export type PageParams = { page?: number; limit?: number };

export function paginate<T>(items: T[], { page = 1, limit = 100 }: PageParams) {
  const p = Math.max(1, page);
  const l = Math.max(1, Math.min(1000, limit));
  const start = (p - 1) * l;
  const slice = items.slice(start, start + l);
  return { total: items.length, page: p, limit: l, items: slice };
}

export function filterPapers(list: PaperAgg[], params: Record<string, string | string[] | undefined>) {
  let out = list;
  const getS = (k: string) => (typeof params[k] === "string" ? (params[k] as string) : undefined);
  const getN = (k: string) => (params[k] ? Number(params[k]) : undefined);

  const paper_id = getS("paper_id");
  const title_contains = getS("title_contains");
  const paper_type = getS("paper_type");
  const abstract_contains = getS("abstract_contains");
  const number_of_authors = getN("number_of_authors");
  const session_contains = getS("session_contains");
  const year = getN("year");
  const session = getS("session");
  const division = getS("division");
  const has_author = getS("has_author");
  const first_author = getS("first_author");
  const last_author = getS("last_author");
  const session_id = getS("session_id");

  if (paper_id) out = out.filter((p) => p.paper_id === paper_id);
  if (title_contains) out = out.filter((p) => searchIncludes(p.title, title_contains));
  if (paper_type) out = out.filter((p) => p.paper_type === paper_type);
  if (abstract_contains) out = out.filter((p) => searchIncludes(p.abstract || "", abstract_contains));
  if (typeof number_of_authors === "number") out = out.filter((p) => p.number_of_authors === number_of_authors);
  if (session_contains) out = out.filter((p) => searchIncludes(p.session || "", session_contains));
  if (typeof year === "number") out = out.filter((p) => p.year === year);
  if (session) out = out.filter((p) => (p.session || "") === session);
  if (division) out = out.filter((p) => (p.division || "") === division);
  if (has_author) out = out.filter((p) => (p.author_names || []).some((n) => searchIncludes(n, has_author)));
  if (first_author) out = out.filter((p) => (p.authorships?.[0]?.author_name || "").toLowerCase() === first_author.toLowerCase());
  if (last_author) out = out.filter((p) => (p.authorships?.[p.authorships.length - 1]?.author_name || "").toLowerCase() === last_author.toLowerCase());
  if (session_id) out = out.filter((p) => p.session_info?.session_id === session_id);

  return out;
}

export function filterAuthors(list: AuthorAgg[], params: Record<string, string | string[] | undefined>) {
  let out = list;
  const getS = (k: string) => (typeof params[k] === "string" ? (params[k] as string) : undefined);
  const getN = (k: string) => (params[k] ? Number(params[k]) : undefined);
  const author_name = getS("author_name");
  const min_attend_count = getN("min_attend_count");
  const min_paper_count = getN("min_paper_count");
  const affiliation_contains = getS("affiliation_contains");
  const year_attended = getN("year_attended");

  if (author_name) out = out.filter((a) => a.author_name.toLowerCase() === author_name.toLowerCase());
  if (typeof min_attend_count === "number") out = out.filter((a) => a.attend_count >= min_attend_count);
  if (typeof min_paper_count === "number") out = out.filter((a) => a.paper_count >= min_paper_count);
  if (affiliation_contains) out = out.filter((a) => (a.affiliations || []).some((af) => searchIncludes(af, affiliation_contains)));
  if (typeof year_attended === "number") out = out.filter((a) => (a.years_attended || []).includes(year_attended));

  return out;
}

export function filterSessions(list: SessionAgg[], params: Record<string, string | string[] | undefined>) {
  let out = list;
  const getS = (k: string) => (typeof params[k] === "string" ? (params[k] as string) : undefined);
  const getN = (k: string) => (params[k] ? Number(params[k]) : undefined);
  const session = getS("session");
  const session_type = getS("session_type");
  const chair_name = getS("chair_name");
  const chair_affiliation = getS("chair_affiliation");
  const division = getS("division");
  const year = getN("year");
  const paper_count = getN("paper_count");

  if (session) out = out.filter((s) => s.session.toLowerCase() === session.toLowerCase());
  if (session_type) out = out.filter((s) => (s.session_type || "").toLowerCase() === session_type.toLowerCase());
  if (chair_name) out = out.filter((s) => searchIncludes(s.chair_name || "", chair_name));
  if (chair_affiliation) out = out.filter((s) => searchIncludes(s.chair_affiliation || "", chair_affiliation));
  if (division) out = out.filter((s) => (s.division || "").toLowerCase() === division.toLowerCase());
  if (typeof year === "number") out = out.filter((s) => (s.years || []).includes(year));
  if (typeof paper_count === "number") out = out.filter((s) => (s.paper_count || 0) === paper_count);

  return out;
}


