"use client";
import { useEffect, useState } from "react";
import PaperList, { type Paper } from "./PaperList";

export default function AllPapers() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/papers?limit=all`);
      if (!res.ok) throw new Error(`加载失败: ${res.status}`);
      const data = (await res.json()) as Paper[];
      setPapers(data);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mt-6">
      <PaperList papers={papers} loading={loading} error={error} onRetry={load} />
    </div>
  );
}


