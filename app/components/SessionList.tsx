"use client";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Session = {
  session: string;
  session_type?: string;
  chair_name?: string;
  chair_affiliation?: string;
  division?: string;
  years?: number[];
  paper_count?: number;
  session_id: string;
};

type Props = {
  sessions: Session[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export default function SessionList({ sessions, loading, error, onRetry }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [displayedSessions, setDisplayedSessions] = useState<Session[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(50);

  const years = useMemo(() => {
    const set = new Set<number>();
    sessions.forEach((session) => {
      (session.years || []).forEach((y) => set.add(y));
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [sessions]);

  const updateParams = useCallback(
    (next: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([key, value]) => {
        if (!value) params.delete(key);
        else params.set(key, value);
      });
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const filterSessions = useCallback(
    (term: string, year: string) => {
      const lower = term.toLowerCase();
      const filtered = sessions.filter((session) => {
        const matchesYear = !year || (session.years || []).includes(Number(year));
        if (!matchesYear) return false;
        if (!term) return true;
        return (
          session.session.toLowerCase().includes(lower) ||
          (session.chair_name || "").toLowerCase().includes(lower) ||
          (session.division || "").toLowerCase().includes(lower)
        );
      });
      setFilteredSessions(filtered);
      setDisplayedSessions(filtered.slice(0, visibleCount));
    },
    [sessions, visibleCount]
  );

  useEffect(() => {
    const initialTerm = searchParams.get("search_term") || "";
    const initialYear = searchParams.get("filtered_year") || "";
    setSearchTerm(initialTerm);
    setSelectedYear(initialYear);
    filterSessions(initialTerm, initialYear);
  }, [filterSessions, searchParams]);

  useEffect(() => {
    setDisplayedSessions((prev) => filteredSessions.slice(0, Math.max(visibleCount, prev.length)));
  }, [filteredSessions, visibleCount]);

  useEffect(() => {
    setFilteredSessions(sessions);
    setDisplayedSessions(sessions.slice(0, 50));
  }, [sessions]);

  const handleFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const year = event.target.value;
    setSelectedYear(year);
    updateParams({ filtered_year: year || undefined, search_term: searchTerm || undefined });
    filterSessions(searchTerm, year);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    updateParams({ filtered_year: selectedYear || undefined, search_term: term || undefined });
    filterSessions(term, selectedYear);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedYear("");
    setVisibleCount(50);
    updateParams({ filtered_year: undefined, search_term: undefined });
    setFilteredSessions(sessions);
    setDisplayedSessions(sessions.slice(0, 50));
  };

  const handleSessionClick = (sessionId: string) => {
    router.push(`/sessions/${encodeURIComponent(sessionId)}`);
  };

  const loadMore = useCallback(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
      setVisibleCount((prev) => prev + 50);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", loadMore);
    return () => window.removeEventListener("scroll", loadMore);
  }, [loadMore]);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-2">Search Sessions</h2>
      <p className="text-sm text-zinc-600 mb-4">{filteredSessions.length} sessions</p>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
        <div className="sm:col-span-8">
          <input
            className="border rounded w-full px-3 py-2"
            placeholder="Search (Session Title, Chair Name, Division)"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="sm:col-span-2">
          <select
            className="border rounded w-full px-3 py-2"
            value={selectedYear}
            onChange={handleFilterChange}
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <button className="w-full border rounded px-3 py-2" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      {loading ? <div>加载中...</div> : null}
      {error ? (
        <div className="text-red-600">
          {error}
          {onRetry ? (
            <button className="ml-2 underline" onClick={onRetry}>重试</button>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        {displayedSessions.map((session) => (
          <div
            key={session.session_id}
            className="border-b border-zinc-200 pb-3 cursor-pointer"
            onClick={() => handleSessionClick(session.session_id)}
          >
            <p className="session-title">{session.session}</p>
            <p className="session-details">{session.division}</p>
            {session.chair_name && session.chair_affiliation ? (
              <p className="session-chair">
                Chaired by {session.chair_name} from {session.chair_affiliation}
              </p>
            ) : null}
            <p className="text-xs text-zinc-500">
              {session.paper_count ?? 0} {session.paper_count === 1 ? "paper" : "papers"} | Years: {(session.years || []).join(", ")}
            </p>
          </div>
        ))}
        {!loading && !displayedSessions.length ? <div>无结果</div> : null}
      </div>
    </div>
  );
}


