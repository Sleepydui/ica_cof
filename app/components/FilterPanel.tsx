"use client";

type Props = {
  isOpen: boolean;
  years: number[];
  selectedYear: string;
  onFilterChange: (value: string) => void;
  onClose: () => void;
};

export default function FilterPanel({ isOpen, years, selectedYear, onFilterChange, onClose }: Props) {
  if (!isOpen) return null;
  return (
    <div className="filter-panel">
      <button className="close-button" onClick={onClose}>
        ×
      </button>
      <h3>Filter by Year</h3>
      <select className="border rounded px-2 py-1 w-full" value={selectedYear} onChange={(e) => onFilterChange(e.target.value)}>
        <option value="">All</option>
        {years.map((year) => (
          <option key={year} value={String(year)}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}


