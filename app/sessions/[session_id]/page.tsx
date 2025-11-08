import { Suspense } from "react";
import PaperList, { type Paper } from "@/app/components/PaperList";

async function fetchSessionPapers(sessionId: string): Promise<{ papers: Paper[]; sessionName?: string }> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/papers?session_id=${encodeURIComponent(sessionId)}&limit=1000`, { cache: "no-store" });
  if (!res.ok) throw new Error(`failed to load`);
  const data = (await res.json()) as any[];
  const sessionName = data[0]?.session ?? undefined;
  const papers = data.map((item) => ({
    paper_id: item.paper_id,
    title: item.title,
    abstract: item.abstract,
    author_names: item.author_names || [],
    year: item.year,
    paper_type: item.paper_type,
    session: item.session ?? null,
    division: item.division ?? null,
  }));
  return { papers, sessionName };
}

export default async function SessionDetailPage({ params }: { params: Promise<{ session_id: string }> }) {
  const { session_id } = await params;
  const decoded = decodeURIComponent(session_id);
  const { papers, sessionName } = await fetchSessionPapers(decoded);
  return (
    <main className="p-6">
      <Suspense fallback={<div>加载中...</div>}>
        <PaperList papers={papers} sessionName={sessionName} />
      </Suspense>
    </main>
  );
}


