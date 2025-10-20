import React, { useEffect, useState } from "react";

export default function SearchBar({
  onSearch,
}: {
  onSearch: (q: string) => void;
}) {
  const [q, setQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => onSearch(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q, onSearch]);

  return (
    <div>
      <label htmlFor="search" className="hidden">
        Search
      </label>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        name="search"
        id="search"
        placeholder="Search y2k tracks (2000 -2010)"
      />
    </div>
  );
}
