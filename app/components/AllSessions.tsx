"use client";
import { useEffect, useState } from "react";
import SessionList from "./SessionList";

type Session = Parameters<typeof SessionList>[0]["sessions"][number];

export default function AllSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/sessions?limit=all`);
      if (!res.ok) throw new Error(`加载失败: ${res.status}`);
      const data = (await res.json()) as Session[];
      setSessions(data);
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
      <SessionList sessions={sessions} loading={loading} error={error} onRetry={load} />
    </div>
  );
}


