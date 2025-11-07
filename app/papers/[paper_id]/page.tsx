import { notFound } from "next/navigation";
import PaperDetail, { type PaperDetailData } from "@/app/components/PaperDetail";

async function fetchPaper(id: string): Promise<PaperDetailData | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/papers/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`failed: ${res.status}`);
  const data = (await res.json()) as any[];
  const paper = data[0];
  if (!paper) return null;
  return {
    paper_id: paper.paper_id,
    title: paper.title,
    paper_type: paper.paper_type,
    abstract: paper.abstract,
    number_of_authors: paper.number_of_authors,
    year: paper.year,
    division: paper.division ?? null,
    session: paper.session ?? null,
    authorships: paper.authorships || [],
    author_names: paper.author_names || [],
  };
}

export default async function PaperDetailPage({ params }: { params: Promise<{ paper_id: string }> }) {
  const { paper_id } = await params;
  const paper = await fetchPaper(paper_id);
  if (!paper) {
    notFound();
  }
  return (
    <main className="p-6">
      <PaperDetail paper={paper} />
    </main>
  );
}


