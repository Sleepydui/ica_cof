"use client";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Author = {
  author_name: string;
  affiliation_history?: string;
  affiliations?: string[];
  attend_count: number;
  paper_count: number;
  years_attended?: number[];
};

type Props = {
  authors: Author[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export default function AuthorList({ authors, loading, error, onRetry }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filteredAuthors, setFilteredAuthors] = useState<Author[]>([]);
  const [displayedAuthors, setDisplayedAuthors] = useState<Author[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState(50);

  const years = useMemo(() => {
    const set = new Set<number>();
    authors.forEach((author) => {
      (author.years_attended || []).forEach((y) => set.add(y));
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [authors]);

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

  const filterAuthors = useCallback(
    (term: string, year: string) => {
      const filtered = authors.filter((author) => {
        const matchesYear = !year || (author.years_attended || []).includes(Number(year));
        if (!matchesYear) return false;
        if (!term) return true;
        const lower = term.toLowerCase();
        return (
          author.author_name.toLowerCase().includes(lower) ||
          (author.affiliations || []).some((aff) => aff.toLowerCase().includes(lower)) ||
          (author.affiliation_history || "").toLowerCase().includes(lower)
        );
      });
      setFilteredAuthors(filtered);
      setDisplayedAuthors(filtered.slice(0, visibleCount));
    },
    [authors, visibleCount]
  );

  useEffect(() => {
    const initialTerm = searchParams.get("search_term") || "";
    const initialYear = searchParams.get("filtered_year") || "";
    setSearchTerm(initialTerm);
    setSelectedYear(initialYear);
    filterAuthors(initialTerm, initialYear);
  }, [filterAuthors, searchParams]);

  useEffect(() => {
    setDisplayedAuthors((prev) => filteredAuthors.slice(0, Math.max(visibleCount, prev.length)));
  }, [filteredAuthors, visibleCount]);

  useEffect(() => {
    setFilteredAuthors(authors);
    setDisplayedAuthors(authors.slice(0, 50));
  }, [authors]);

  const handleFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const year = event.target.value;
    setSelectedYear(year);
    updateParams({ filtered_year: year || undefined, search_term: searchTerm || undefined });
    filterAuthors(searchTerm, year);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    updateParams({ filtered_year: selectedYear || undefined, search_term: term || undefined });
    filterAuthors(term, selectedYear);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedYear("");
    setVisibleCount(50);
    updateParams({ filtered_year: undefined, search_term: undefined });
    setFilteredAuthors(authors);
    setDisplayedAuthors(authors.slice(0, 50));
  };

  const handleAuthorClick = (authorName: string) => {
    router.push(`/authors/${encodeURIComponent(authorName)}`);
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
      <h2 className="text-2xl font-semibold mb-2">Search Authors</h2>
      <p className="text-sm text-zinc-600 mb-4">{filteredAuthors.length} authors</p>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
        <div className="sm:col-span-8">
          <input
            className="border rounded w-full px-3 py-2"
            placeholder="Search (Author, Affiliation)"
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
        {displayedAuthors.map((author) => (
          <div
            key={author.author_name}
            className="border-b border-zinc-200 pb-3 cursor-pointer"
            onClick={() => handleAuthorClick(author.author_name)}
          >
            <p className="author-name">{author.author_name}</p>
            <p className="author-affiliations">{author.affiliation_history || ""}</p>
            <p className="text-sm text-zinc-600">
              {author.attend_count} conferences attended, {author.paper_count} presentations given.
            </p>
          </div>
        ))}
        {!loading && !displayedAuthors.length ? <div>无结果</div> : null}
      </div>
    </div>
  );
}


