"use client";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export type PaperDetailData = {
  paper_id: string;
  title: string;
  paper_type?: string;
  abstract?: string;
  number_of_authors?: number;
  year?: number;
  division?: string | null;
  session?: string | null;
  authorships: {
    position?: number;
    author_name?: string;
    author_affiliation?: string;
  }[];
  author_names: string[];
};

export default function PaperDetail({ paper }: { paper: PaperDetailData }) {
  const router = useRouter();

  const citation = useMemo(() => {
    const conferenceNumber = paper.year ? paper.year - 1950 : undefined;
    const formattedAuthors = paper.author_names.join(" and ");
    return `@article{ica-${paper.paper_id},\n  title={${paper.title}},\n  author={${formattedAuthors}},\n  journal={${conferenceNumber ? `${conferenceNumber}th` : ""} Annual Conference of the International Communication Association (ICA)},\n  year={${paper.year ?? ""}},\n  publisher={ICA}\n}`;
  }, [paper]);

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(citation).catch(() => {
      alert("复制失败，请手动复制。");
    });
  };

  return (
    <div className="space-y-6">
      <button
        className="px-3 py-1 border rounded"
        onClick={() => router.back()}
      >
        返回
      </button>

      <section className="bg-white shadow-sm border border-zinc-200 rounded-lg p-6 space-y-4">
        <h1 className="text-3xl font-semibold">{paper.title}</h1>

        <div>
          <h2 className="text-lg font-medium mb-2">Authors</h2>
          <ul className="space-y-1">
            {paper.authorships.map((author, idx) => (
              <li key={`${author.author_name}-${idx}`} className="text-sm text-zinc-700">
                {author.author_name}
                {author.author_affiliation ? ` (${author.author_affiliation})` : ""}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1 text-sm text-zinc-600">
          <p><strong>Year:</strong> {paper.year ?? "N/A"}</p>
          <p><strong>Division:</strong> {paper.division || "N/A"}</p>
          <p><strong>Session:</strong> {paper.session || "N/A"}</p>
          <p><strong>Paper Type:</strong> {paper.paper_type || "N/A"}</p>
        </div>

        {paper.abstract ? (
          <p className="text-base leading-relaxed whitespace-pre-wrap">{paper.abstract}</p>
        ) : null}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Citation</h2>
        <div className="flex gap-2 items-start">
          <pre className="bg-zinc-100 p-4 rounded text-sm overflow-auto flex-1">{citation}</pre>
          <button className="px-3 py-2 border rounded" onClick={handleCopyCitation}>
            复制
          </button>
        </div>
      </section>
    </div>
  );
}


