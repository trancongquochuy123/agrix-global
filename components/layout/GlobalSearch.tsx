"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import { assets } from "@/data/assets";
import { categoryLabel } from "@/lib/categories";

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return assets
      .filter((a) => [a.name, a.location, a.category, categoryLabel(a.category)].some((f) => f.toLowerCase().includes(q)))
      .slice(0, 5);
  }, [query]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (slug: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/marketplace/${slug}`);
  };

  return (
    <div ref={wrapRef} className="relative w-full max-w-md">
      <label className="relative block">
        <span className="sr-only">Search assets, locations or keywords</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
        <input
          type="search"
          value={query}
          placeholder="Search assets, locations, or keywords…"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" && results[0]) go(results[0].slug);
          }}
          className="h-10 w-full rounded-xl border border-line bg-white pl-10 pr-3 text-sm placeholder:text-ink-muted/80 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
        />
      </label>
      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-pop" role="listbox" aria-label="Search results">
          {results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-ink-muted">No assets match “{query}”.</p>
          ) : (
            results.map((a) => (
              <button
                key={a.id}
                type="button"
                role="option"
                aria-selected="false"
                onClick={() => go(a.slug)}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-green-50"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{a.name}</span>
                  <span className="flex items-center gap-1 text-xs text-ink-muted">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {a.location}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">{categoryLabel(a.category)}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
