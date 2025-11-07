"use client";

export default function FilterButton({ toggleFilterPanel }: { toggleFilterPanel: () => void }) {
  return (
    <button className="filter-button" onClick={toggleFilterPanel} aria-label="Toggle Filters">
      ☰
    </button>
  );
}


