"use client";
import { useEffect, useState } from "react";
import AuthorList from "./AuthorList";

type Author = Parameters<typeof AuthorList>[0]["authors"][number];

export default function AllAuthors() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/authors?limit=all`);
      if (!res.ok) throw new Error(`加载失败: ${res.status}`);
      const data = (await res.json()) as Author[];
      setAuthors(data);
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
      <AuthorList authors={authors} loading={loading} error={error} onRetry={load} />
    </div>
  );
}


