"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterSelect } from "@/components/shared/FilterBar";
import { DocumentRow } from "@/components/shared/DocumentRow";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { assets, getAssetDetail } from "@/data/assets";
import type { AssetDocument } from "@/types/asset";

type Row = AssetDocument & { assetSlug: string; assetName: string };

/** Every data-room document across all listed assets, flattened for browsing. */
const allDocuments: Row[] = assets.flatMap((a) =>
  (getAssetDetail(a.slug)?.documents ?? []).map((d) => ({ ...d, id: `${a.slug}:${d.id}`, assetSlug: a.slug, assetName: a.name })),
);
const docCategories = Array.from(new Set(allDocuments.map((d) => d.category)));

export function DocumentsView() {
  const [query, setQuery] = useState("");
  const [asset, setAsset] = useState("all");
  const [category, setCategory] = useState("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allDocuments.filter(
      (d) =>
        (asset === "all" || d.assetSlug === asset) &&
        (category === "all" || d.category === category) &&
        (!q || d.name.toLowerCase().includes(q) || d.assetName.toLowerCase().includes(q)),
    );
  }, [query, asset, category]);

  const reset = () => {
    setQuery("");
    setAsset("all");
    setCategory("all");
  };

  return (
    <div>
      <PageHeader title="Documents" subtitle="Data-room files for every verified asset you can access." />

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative block w-full min-w-0 flex-1 sm:min-w-[220px] md:max-w-sm">
          <span className="sr-only">Search documents</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search documents" className="field h-11 rounded-xl pl-10" />
        </label>
        <FilterSelect
          label="Filter by asset"
          value={asset}
          onChange={setAsset}
          options={[{ value: "all", label: "All assets" }, ...assets.map((a) => ({ value: a.slug, label: a.name }))]}
          className="w-full sm:w-56"
        />
        <FilterSelect
          label="Filter by category"
          value={category}
          onChange={setCategory}
          options={[{ value: "all", label: "All categories" }, ...docCategories.map((c) => ({ value: c, label: c }))]}
          className="w-full sm:w-44"
        />
      </div>

      <p className="mt-4 text-sm text-ink-muted" aria-live="polite">
        <span className="font-semibold text-ink">{rows.length}</span> {rows.length === 1 ? "document" : "documents"}
        {rows.length !== allDocuments.length && (
          <button type="button" onClick={reset} className="ml-3 font-semibold text-green-600 hover:underline">
            Clear all filters
          </button>
        )}
      </p>

      <div className="mt-3">
        {rows.length === 0 ? (
          <EmptyState title="No documents match your filters" description="Clear filters to see every document in your data rooms." action={<Button onClick={reset}>Clear filters</Button>} />
        ) : (
          <div className="grid min-w-0 gap-2.5 lg:grid-cols-2">
            {rows.map((d) => (
              <DocumentRow key={d.id} doc={d} assetName={d.assetName} />
            ))}
          </div>
        )}
      </div>
      <p className="mt-6 text-xs text-ink-muted">Prototype data only. Downloads are simulated.</p>
    </div>
  );
}
