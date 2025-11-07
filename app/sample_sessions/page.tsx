async function fetchSampleSessions() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/sessions?limit=5`, { cache: "no-store" });
  if (!res.ok) throw new Error("failed to load samples");
  return res.json() as Promise<any[]>;
}

export default async function SampleSessions() {
  const samples = await fetchSampleSessions();
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">示例分会场</h1>
      <ul className="space-y-3">
        {samples.map((session) => (
          <li key={session.session_id} className="border-b border-zinc-200 pb-3">
            <p className="session-title">{session.session}</p>
            <p className="session-details">{session.division}</p>
            {session.chair_name && session.chair_affiliation ? (
              <p className="session-chair">Chaired by {session.chair_name} from {session.chair_affiliation}</p>
            ) : null}
            <p className="text-xs text-zinc-500">{session.paper_count ?? 0} papers · Years: {(session.years || []).join(", ")}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}


