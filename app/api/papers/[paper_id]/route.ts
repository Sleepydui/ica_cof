import { NextRequest } from "next/server";
import { aggregatePapers } from "@/lib/aggregate";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ paper_id: string }> }) {
  const { paper_id } = await params;
  const all = await aggregatePapers();
  const hit = all.find((p) => p.paper_id === paper_id);
  if (!hit) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json([hit]);
}


