"use client";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type Paper = {
  paper_id: string;
  title: string;
  abstract?: string;
  author_names: string[];
  year?: number;
  paper_type?: string;
  session?: string | null;
  division?: string | null;
};

type Props = {
  papers: Paper[];
  authorName?: string;
  sessionName?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export default function PaperList({ papers, authorName, sessionName, loading, error, onRetry }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filteredPapers, setFilteredPapers] = useState<Paper[]>([]);
  const [displayedPapers, setDisplayedPapers] = useState<Paper[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(50);

  const updateParams = useCallback(
    (next: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([key, value]) => {
        if (!value) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const availableYears = useMemo(() => {
    const set = new Set<number>();
    papers.forEach((p) => {
      if (typeof p.year === "number") set.add(p.year);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [papers]);

  const filterPapers = useCallback(
    (term: string, year: string) => {
      const filtered = papers.filter((paper) => {
        const matchesYear = !year || paper.year === Number(year);
        if (!matchesYear) return false;
        if (!term) return true;
        const lower = term.toLowerCase();
        const title = paper.title || "";
        const authors = paper.author_names || [];
        const abstract = paper.abstract || "";
        return (
          title.toLowerCase().includes(lower) ||
          authors.some((author) => (author || "").toLowerCase().includes(lower)) ||
          abstract.toLowerCase().includes(lower)
        );
      });
      setFilteredPapers(filtered);
      setDisplayedPapers(filtered.slice(0, visibleCount));
      setYears(availableYears);
    },
    [availableYears, papers, visibleCount]
  );

  useEffect(() => {
    const initialTerm = searchParams.get("search_term") || "";
    const initialYear = searchParams.get("filtered_year") || "";
    setSearchTerm(initialTerm);
    setSelectedYear(initialYear);
    filterPapers(initialTerm, initialYear);
  }, [filterPapers, searchParams]);

  useEffect(() => {
    setDisplayedPapers((prev) => filteredPapers.slice(0, Math.max(visibleCount, prev.length)));
  }, [filteredPapers, visibleCount]);

  const handleFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const year = event.target.value;
    setSelectedYear(year);
    updateParams({ filtered_year: year || undefined, search_term: searchTerm || undefined });
    filterPapers(searchTerm, year);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    updateParams({ filtered_year: selectedYear || undefined, search_term: term || undefined });
    filterPapers(term, selectedYear);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedYear("");
    setVisibleCount(50);
    updateParams({ filtered_year: undefined, search_term: undefined });
    setFilteredPapers(papers);
    setDisplayedPapers(papers.slice(0, 50));
  };

  const handlePaperClick = (paperId: string) => {
    router.push(`/papers/${encodeURIComponent(paperId)}`);
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

  useEffect(() => {
    setFilteredPapers(papers);
    setDisplayedPapers(papers.slice(0, 50));
    setYears(availableYears);
  }, [availableYears, papers]);

  return (
    <div className="w-full">
      {authorName ? (
        <h2 className="text-2xl font-semibold mb-2">Search Papers by {authorName}</h2>
      ) : sessionName ? (
        <h2 className="text-2xl font-semibold mb-2">Search Papers in {sessionName}</h2>
      ) : (
        <h2 className="text-2xl font-semibold mb-2">Search Papers</h2>
      )}

      <p className="text-sm text-zinc-600 mb-4">
        {filteredPapers.length} papers in {selectedYear ? `1 year (${selectedYear})` : `${years.length} year(s)`}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
        <div className="sm:col-span-8">
          <input
            className="border rounded w-full px-3 py-2"
            placeholder="Search (Title, Author, Abstract)"
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
            <button className="ml-2 underline" onClick={onRetry}>
              重试
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="paper-list">
        {displayedPapers.map((paper) => (
          <div
            key={paper.paper_id}
            className="paper-card"
            onClick={() => handlePaperClick(paper.paper_id)}
          >
            <p className="paper-title">{paper.title}</p>
            <p className="paper-authors">{paper.author_names.join(", ")}</p>
            <span className="paper-year">{paper.year}</span>
          </div>
        ))}
        {!loading && !displayedPapers.length ? <div>无结果</div> : null}
      </div>
    </div>
  );
}


