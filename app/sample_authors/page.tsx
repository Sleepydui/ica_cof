async function fetchSampleAuthors() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/authors?limit=5`, { cache: "no-store" });
  if (!res.ok) throw new Error("failed to load samples");
  return res.json() as Promise<any[]>;
}

export default async function SampleAuthors() {
  const samples = await fetchSampleAuthors();
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">示例作者</h1>
      <ul className="space-y-3">
        {samples.map((author) => (
          <li key={author.author_name} className="border-b border-zinc-200 pb-3">
            <p className="author-name">{author.author_name}</p>
            <p className="author-affiliations">{author.affiliation_history}</p>
            <p className="text-sm text-zinc-600">{author.attend_count} conferences · {author.paper_count} presentations</p>
          </li>
        ))}
      </ul>
    </main>
  );
}


