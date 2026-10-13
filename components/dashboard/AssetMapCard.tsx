"use client";

import { useState } from "react";
import { Leaf } from "lucide-react";
import { MapPanel } from "@/components/maps/MapFrame";
import { AssetsMap } from "@/components/maps";
import { FilterChip } from "@/components/shared/FilterBar";
import { mapLocations } from "@/data/locations";
import { categoryChips } from "@/lib/categories";
import { EmptyState } from "@/components/shared/states";

export function AssetMapCard() {
  const [category, setCategory] = useState<string>("all");
  const count = category === "all" ? mapLocations.length : mapLocations.filter((m) => m.category === category).length;

  return (
    <section className="card flex h-full min-w-0 flex-col p-4 sm:p-5" aria-labelledby="asset-map-title">
      <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Leaf className="h-5 w-5 text-green-600" aria-hidden="true" />
          <div>
            <h2 id="asset-map-title" className="text-base font-bold leading-tight">
              Asset Map
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">Verified agricultural assets across Vietnam</p>
          </div>
        </div>
        <div className="-mx-1 flex w-full min-w-0 sm:w-auto sm:max-w-full gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" role="group" aria-label="Filter map by asset type">
          {categoryChips.filter((c) => c.id === "all" || mapLocations.some((m) => m.category === c.id)).map((c) => (
            <FilterChip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
              {c.label}
            </FilterChip>
          ))}
        </div>
      </header>
      <MapPanel className="min-h-[360px] flex-1 sm:min-h-[460px]">
        {count === 0 ? (
          <EmptyState title="No assets for this filter" className="m-6 border-0" />
        ) : (
          <AssetsMap category={category} />
        )}
      </MapPanel>
      <p className="mt-2 text-xs text-ink-muted" aria-live="polite">
        Showing {count} verified {count === 1 ? "location" : "locations"} · Select a marker for details
      </p>
    </section>
  );
}
