"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterSelect } from "@/components/shared/FilterBar";
import { DocumentRow } from "@/components/shared/DocumentRow";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { assetDocuments } from "@/lib/demo/docs";
import { fmtDate } from "@/lib/demo/format";
import { useDemo } from "@/lib/demo/hooks";
import type { AssetDocument } from "@/types/asset";
import Link from "next/link";

type Row = AssetDocument & { assetKey: string; assetName: string };

/**
 * Investors browse the data room of every open listing plus confirmations for their own investments;
 * sellers see the files attached to their own assets.
 */
export function DocumentsView({ scope }: { scope: "investor" | "seller" }) {
  const demo = useDemo();
  const me = demo.session!;
  const [query, setQuery] = useState("");
  const [asset, setAsset] = useState("all");
  const [category, setCategory] = useState("all");

  const all: Row[] = useMemo(() => {
    if (scope === "seller") {
      return demo.assets
        .filter((a) => a.ownerId === me.userId)
        .flatMap((a) => assetDocuments(a).map((d) => ({ ...d, id: `${a.id}:${d.id}`, assetKey: a.id, assetName: a.name })));
    }
    const rooms = demo.assets
      .filter((a) => a.status === "published")
      .flatMap((a) => assetDocuments(a).map((d) => ({ ...d, id: `${a.id}:${d.id}`, assetKey: a.id, assetName: a.name })));
    const confirmations: Row[] = demo.transactions
      .filter((t) => t.investorId === me.userId)
      .map((t) => ({
        id: `conf:${t.id}`,
        name: `Investment Confirmation ${t.reference}`,
        fileType: "PDF" as const,
        size: "0.2 MB",
        date: fmtDate(t.createdAt),
        category: "Financial" as const,
        assetKey: t.assetId,
        assetName: t.assetName,
      }));
    return [...confirmations, ...rooms];
  }, [demo.assets, demo.transactions, me.userId, scope]);

  const assetOptions = useMemo(() => {
    const seen = new Map<string, string>();
    all.forEach((r) => seen.set(r.assetKey, r.assetName));
    return [...seen.entries()].map(([value, label]) => ({ value, label }));
  }, [all]);
  const docCategories = useMemo(() => Array.from(new Set(all.map((d) => d.category))), [all]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (d) =>
        (asset === "all" || d.assetKey === asset) &&
        (category === "all" || d.category === category) &&
        (!q || d.name.toLowerCase().includes(q) || d.assetName.toLowerCase().includes(q)),
    );
  }, [all, query, asset, category]);

  const reset = () => {
    setQuery("");
    setAsset("all");
    setCategory("all");
  };

  return (
    <div>
      <PageHeader title="Documents" subtitle={scope === "seller" ? "Files attached to your assets." : "Data-room files and confirmations for assets you can access."} />

      {all.length === 0 ? (
        <EmptyState
          title="No documents yet"
          description={scope === "seller" ? "Documents you upload while creating an asset will appear here." : "Open listings and your investment confirmations will appear here."}
          action={
            <Button asChild>
              <Link href={scope === "seller" ? "/seller/assets/new" : "/investor/marketplace"}>{scope === "seller" ? "Create New Asset" : "Explore opportunities"}</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative block w-full min-w-0 flex-1 sm:min-w-[220px] md:max-w-sm">
              <span className="sr-only">Search documents</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search documents" className="field h-11 rounded-xl pl-10" />
            </label>
            <FilterSelect label="Filter by asset" value={asset} onChange={setAsset} options={[{ value: "all", label: "All assets" }, ...assetOptions]} className="w-full sm:w-56" />
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
            {rows.length !== all.length && (
              <button type="button" onClick={reset} className="ml-3 font-semibold text-green-600 hover:underline">
                Clear all filters
              </button>
            )}
          </p>

          <div className="mt-3">
            {rows.length === 0 ? (
              <EmptyState title="No documents match your filters" description="Clear filters to see every document." action={<Button onClick={reset}>Clear filters</Button>} />
            ) : (
              <div className="grid min-w-0 gap-2.5 lg:grid-cols-2">
                {rows.map((d) => (
                  <DocumentRow key={d.id} doc={d} assetName={d.assetName} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
      <p className="mt-6 text-xs text-ink-muted">Sample documents. Downloads are simulated.</p>
    </div>
  );
}
