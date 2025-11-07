"use client";
import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SearchPaper = {
  paper_id: string;
  title: string;
  author_names: string[];
  year?: number;
};

type CacheKey = string;

export default function Search() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cache = useRef<Map<CacheKey, SearchPaper[]>>(new Map());

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [embeddingsLoading, setEmbeddingsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topPapers, setTopPapers] = useState(5);

  const updateSearchParams = useCallback(
    (next: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([key, value]) => {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const fetchSearchResults = useCallback(
    async (keyword: string, top: number) => {
      const trimmed = keyword.trim();
      if (!trimmed) {
        setResults([]);
        updateSearchParams({ query: "", topPapers: top });
        return;
      }

      const cacheKey = `${trimmed}_${top}`;

      if (cache.current.has(cacheKey)) {
        setResults(cache.current.get(cacheKey) || []);
        updateSearchParams({ query: trimmed, topPapers: top });
        return;
      }

      setLoading(true);
      setEmbeddingsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: String(top),
          title_contains: trimmed,
          abstract_contains: trimmed,
        });
        const res = await fetch(`/api/papers?${params.toString()}`);
        if (!res.ok) throw new Error(`请求失败: ${res.status}`);
        const data: SearchPaper[] = await res.json();
        setResults(data);
        cache.current.set(cacheKey, data);
        updateSearchParams({ query: trimmed, topPapers: top });
      } catch (err) {
        console.error(err);
        setError("搜索时出现问题，请稍后重试");
      } finally {
        setLoading(false);
        setEmbeddingsLoading(false);
      }
    },
    [updateSearchParams]
  );

  useEffect(() => {
    const initialQuery = searchParams.get("query") || "";
    const initialTop = parseInt(searchParams.get("topPapers") || "5", 10) || 5;
    setQuery(initialQuery);
    setTopPapers(initialTop);
    if (initialQuery) {
      fetchSearchResults(initialQuery, initialTop);
    }
  }, [fetchSearchResults, searchParams]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      fetchSearchResults(query, topPapers);
    },
    [fetchSearchResults, query, topPapers]
  );

  const handleReset = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(null);
    setTopPapers(5);
    updateSearchParams({ query: "", topPapers: undefined });
  }, [updateSearchParams]);

  const increaseTopPapers = () => setTopPapers((prev) => prev + 1);
  const decreaseTopPapers = () => setTopPapers((prev) => Math.max(1, prev - 1));

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-semibold mb-4">Search Relevant Papers (Beta)</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className="search-bar border rounded px-3 py-2 flex-1"
          placeholder="Enter your query here; it can be a key word, a sentence, or even a paragraph :)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
          disabled={loading}
        >
          Search
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded border border-zinc-300"
          onClick={handleReset}
        >
          Reset
        </button>
      </form>

      <div className="flex items-center gap-2 mt-3">
        <span>Top Results: {topPapers}</span>
        <button type="button" className="px-2 py-1 border rounded" onClick={increaseTopPapers}>＋</button>
        <button type="button" className="px-2 py-1 border rounded" onClick={decreaseTopPapers}>－</button>
      </div>

      {loading ? <div className="mt-4">检索中...</div> : null}
      {embeddingsLoading && !loading ? (
        <div className="mt-4 text-blue-600">首次搜索需要一点时间，请稍候...</div>
      ) : null}
      {error ? <div className="mt-4 text-red-600">{error}</div> : null}

      <div className="flex flex-col gap-3 mt-4">
        {results.map((paper) => (
          <button
            key={paper.paper_id}
            className="text-left paper-card"
            onClick={() => router.push(`/papers/${encodeURIComponent(paper.paper_id)}`)}
          >
            <p className="paper-title">{paper.title}</p>
            <p className="paper-authors">{paper.author_names?.join(", ")}</p>
            <span className="paper-year">{paper.year}</span>
          </button>
        ))}
      </div>
    </div>
  );
}


