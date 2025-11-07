import PaperList, { type Paper } from "@/app/components/PaperList";

async function fetchAuthorPapers(author: string): Promise<Paper[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/papers?has_author=${encodeURIComponent(author)}&limit=1000`, { cache: "no-store" });
  if (!res.ok) throw new Error(`failed to load`);
  const data = (await res.json()) as any[];
  return data.map((item) => ({
    paper_id: item.paper_id,
    title: item.title,
    abstract: item.abstract,
    author_names: item.author_names || [],
    year: item.year,
    paper_type: item.paper_type,
    session: item.session ?? null,
    division: item.division ?? null,
  }));
}

export default async function AuthorDetailPage({ params }: { params: Promise<{ author: string }> }) {
  const { author } = await params;
  const decoded = decodeURIComponent(author);
  const papers = await fetchAuthorPapers(decoded);
  return (
    <main className="p-6">
      <PaperList papers={papers} authorName={decoded} />
    </main>
  );
}


