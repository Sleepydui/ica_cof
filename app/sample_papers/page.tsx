async function fetchSample() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/papers?limit=5`, { cache: "no-store" });
  if (!res.ok) throw new Error("failed to load samples");
  return res.json() as Promise<any[]>;
}

export default async function SamplePapers() {
  const samples = await fetchSample();
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">示例论文</h1>
      <ul className="paper-list">
        {samples.map((paper) => (
          <li key={paper.paper_id} className="paper-card">
            <a className="paper-title" href={`/papers/${encodeURIComponent(paper.paper_id)}`}>{paper.title}</a>
            <p className="paper-authors">{(paper.author_names || []).join(", ")}</p>
            <span className="paper-year">{paper.year}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}


