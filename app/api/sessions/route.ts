import { NextRequest } from "next/server";
import { aggregateSessions, filterSessions, paginate } from "@/lib/aggregate";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const p = url.searchParams;
  const limitParam = p.get("limit");
  const page = p.get("page") ? Number(p.get("page")) : 1;
  const limit = limitParam && limitParam !== "all" ? Number(limitParam) : 50;
  const all = await aggregateSessions();
  const filtered = filterSessions(all, Object.fromEntries(p.entries()));
  if (limitParam === "all") {
    return Response.json(filtered);
  }
  const data = paginate(filtered, { page, limit });
  return Response.json(data.items);
}


