import { NextRequest } from "next/server";
import { loadDatasets, searchIncludes } from "@/lib/csv";
import type { QueryParams } from "@/lib/types";

function parseParams(req: NextRequest): QueryParams {
  const url = new URL(req.url);
  const p = url.searchParams;
  const entity = (p.get("entity") || "papers") as QueryParams["entity"];
  const id = p.get("id") ?? undefined;
  const q = p.get("q") ?? undefined;
  const year = p.get("year") ? Number(p.get("year")) : undefined;
  const session = p.get("session") ?? undefined;
  const division = p.get("division") ?? undefined;
  const author = p.get("author") ?? undefined;
  const limit = p.get("limit") ? Math.max(1, Math.min(100, Number(p.get("limit")))) : 20;
  const offset = p.get("offset") ? Math.max(0, Number(p.get("offset"))) : 0;
  return { entity, id, q, year, session, division, author, limit, offset };
}

export async function GET(req: NextRequest) {
  try {
    const params = parseParams(req);
    const { papers, authors, sessions } = await loadDatasets();

    if (params.entity === "paperById") {
      if (!params.id) return Response.json({ error: "id required" }, { status: 400 });
      const paper = papers.find((p) => p.id === params.id);
      if (!paper) return Response.json({ error: "not found" }, { status: 404 });
      const paperAuthors = authors.filter((a) => a.paperId === paper.id).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      return Response.json({ paper, authors: paperAuthors });
    }

    if (params.entity === "authors") {
      let list = authors;
      if (params.q) list = list.filter((a) => searchIncludes(a.name, params.q) || searchIncludes(a.affiliation, params.q) || searchIncludes(a.title, params.q));
      if (params.year) list = list.filter((a) => a.year === params.year);
      const total = list.length;
      const slice = list.slice(params.offset, params.offset + params.limit);
      return Response.json({ total, items: slice });
    }

    if (params.entity === "sessions") {
      let list = sessions;
      if (params.q) list = list.filter((s) => searchIncludes(s.title, params.q) || searchIncludes(s.type, params.q) || searchIncludes(s.division, params.q));
      if (params.year) list = list.filter((s) => s.year === params.year);
      if (params.division) list = list.filter((s) => searchIncludes(s.division, params.division));
      const total = list.length;
      const slice = list.slice(params.offset, params.offset + params.limit);
      return Response.json({ total, items: slice });
    }

    // default: papers
    let list = papers;
    if (params.q) list = list.filter((p) => searchIncludes(p.title, params.q) || searchIncludes(p.abstract, params.q) || (p.authors || []).some((n) => searchIncludes(n, params.q)));
    if (params.year) list = list.filter((p) => p.year === params.year);
    if (params.session) list = list.filter((p) => searchIncludes(p.session, params.session));
    if (params.division) list = list.filter((p) => searchIncludes(p.division, params.division));
    if (params.author) list = list.filter((p) => (p.authors || []).some((n) => searchIncludes(n, params.author)));
    const total = list.length;
    const slice = list.slice(params.offset, params.offset + params.limit);
    return Response.json({ total, items: slice });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}


