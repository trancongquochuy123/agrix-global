"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, Map as MapIcon, MapPin, Search, SlidersHorizontal, Sprout, BarChart2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterBar, FilterChip, FilterSelect } from "@/components/shared/FilterBar";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { MapPanel } from "@/components/maps/MapFrame";
import { ListingsMap } from "@/components/maps";
import { locationOptionsFor, riskOptions, yieldOptions } from "@/data/assets";
import { useDemo } from "@/lib/demo/hooks";
import { demoStore } from "@/lib/demo/store";
import { publishedAssets } from "@/lib/demo/selectors";
import { ALL, categoryChips, categoryLabel, isCategory, type CategoryFilter } from "@/lib/categories";
import type { Asset } from "@/types/asset";
import { cn } from "@/lib/utils";
import { AssetCard, AssetCardSkeleton } from "./AssetCard";

const PAGE_SIZE = 6;
const WISHLIST_KEY = "agrix:wishlist:v1";

/** Reads filter state from the URL, ignoring anything that is not a known option. */
function readParams(search: string, locationOptions: string[]) {
  const p = new URLSearchParams(search);
  const cat = p.get("category");
  const loc = p.get("location");
  const risk = p.get("risk");
  const yld = p.get("yield");
  return {
    query: p.get("q") ?? "",
    category: (isCategory(cat) ? cat : ALL) as CategoryFilter,
    location: loc && locationOptions.includes(loc) ? loc : "All locations",
    risk: risk && (riskOptions as readonly string[]).includes(risk) ? risk : "Any risk",
    minYield: yld && yieldOptions.some((y) => y.value === yld) ? yld : "any",
    view: p.get("view") === "map" ? ("map" as const) : ("grid" as const),
  };
}

export function MarketplaceView({ basePath = "/marketplace", subtitle = "Discover agricultural opportunities." }: { basePath?: string; subtitle?: string }) {
  const demo = useDemo();
  const assets = useMemo(() => publishedAssets(demo), [demo]);
  const locationOptions = useMemo(() => locationOptionsFor(assets), [assets]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>(ALL);
  const [location, setLocation] = useState("All locations");
  const [risk, setRisk] = useState<string>("Any risk");
  const [minYield, setMinYield] = useState("any");
  const [view, setView] = useState<"grid" | "map">("grid");
  const [page, setPage] = useState(1);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const skipLoading = useRef(true);

  // Hydrate filters from the URL and the wishlist from localStorage after mount (SSR-safe).
  useEffect(() => {
    const init = readParams(window.location.search, locationOptionsFor(publishedAssets(demoStore.getSnapshot())));
    setQuery(init.query);
    setCategory(init.category);
    setLocation(init.location);
    setRisk(init.risk);
    setMinYield(init.minYield);
    setView(init.view);
    try {
      const raw = window.localStorage.getItem(WISHLIST_KEY);
      if (raw) setWishlist(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* storage unavailable — wishlist stays in memory */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify([...wishlist]));
    } catch {
      /* ignore */
    }
  }, [wishlist, ready]);

  // Keep the URL shareable: /marketplace?category=coffee&risk=Medium&yield=8
  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams();
    if (query.trim()) p.set("q", query.trim());
    if (category !== ALL) p.set("category", category);
    if (location !== "All locations") p.set("location", location);
    if (risk !== "Any risk") p.set("risk", risk);
    if (minYield !== "any") p.set("yield", minYield);
    if (view === "map") p.set("view", "map");
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [ready, query, category, location, risk, minYield, view]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter((a) => {
      if (q && ![a.name, a.location, a.category, categoryLabel(a.category)].some((f) => f.toLowerCase().includes(q))) return false;
      if (category !== ALL && a.category !== category) return false;
      if (location !== "All locations" && a.province !== location) return false;
      if (risk !== "Any risk" && a.risk !== risk) return false;
      if (minYield !== "any" && a.targetYield < Number(minYield)) return false;
      return true;
    });
  }, [assets, query, category, location, risk, minYield]);

  // Brief skeleton on filter changes to mimic a data fetch.
  useEffect(() => {
    setPage(1);
    if (!ready) return;
    if (skipLoading.current) {
      skipLoading.current = false;
      return;
    }
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 220);
    return () => {
      clearTimeout(t);
      setLoading(false);
    };
  }, [ready, query, category, location, risk, minYield]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const from = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, filtered.length);
  const activeFilterCount = [location !== "All locations", risk !== "Any risk", minYield !== "any"].filter(Boolean).length;
  const anyFilter = activeFilterCount > 0 || category !== ALL || query.trim() !== "";

  const reset = () => {
    setQuery("");
    setCategory(ALL);
    setLocation("All locations");
    setRisk("Any risk");
    setMinYield("any");
  };

  const toggleWishlist = (asset: Asset) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(asset.id)) {
        next.delete(asset.id);
        toast("Removed from wishlist", { description: asset.name });
      } else {
        next.add(asset.id);
        toast.success("Added to wishlist", { description: asset.name });
      }
      return next;
    });
  };

  const locationSelect = (
    <FilterSelect
      label="Location"
      value={location}
      onChange={setLocation}
      icon={<MapPin className="h-4 w-4" />}
      options={locationOptions.map((l) => ({ value: l, label: l === "All locations" ? "Vietnam" : l }))}
      className="w-full md:w-auto"
    />
  );
  const riskSelect = (
    <FilterSelect
      label="Risk level"
      value={risk}
      onChange={setRisk}
      icon={<BarChart2 className="h-4 w-4" />}
      options={riskOptions.map((r) => ({ value: r, label: r === "Any risk" ? "Risk Level" : `${r} risk` }))}
      className="w-full md:w-auto"
    />
  );
  const yieldSelect = (
    <FilterSelect
      label="Target yield"
      value={minYield}
      onChange={setMinYield}
      icon={<Sprout className="h-4 w-4" />}
      options={yieldOptions.map((y) => ({ value: y.value, label: y.value === "any" ? "Target Yield" : y.label }))}
      className="w-full md:w-auto"
    />
  );

  const viewToggle = (
    <div className="inline-flex rounded-lg border border-line bg-white p-0.5" role="group" aria-label="View mode">
      {(
        [
          { id: "grid", label: "Grid", icon: LayoutGrid },
          { id: "map", label: "Map", icon: MapIcon },
        ] as const
      ).map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={view === id}
          onClick={() => setView(id)}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors duration-150",
            view === id ? "bg-green-600 text-white" : "text-ink hover:bg-green-50",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <PageHeader title="Asset Marketplace" subtitle={subtitle} />

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="relative block flex-1 md:max-w-md">
            <span className="sr-only">Search assets</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search assets"
              className="field h-11 rounded-xl pl-10"
            />
          </label>
          <Button variant="outline" className="h-11 md:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters{activeFilterCount > 0 && <span className="rounded-full bg-green-600 px-1.5 text-xs text-white">{activeFilterCount}</span>}
          </Button>
          <div className="ml-auto">{viewToggle}</div>
        </div>

        <FilterBar>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0 md:pb-0" role="group" aria-label="Asset category">
            {categoryChips.map((c) => (
              <FilterChip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                {c.label}
              </FilterChip>
            ))}
          </div>
          <span className="mx-1 hidden h-6 w-px bg-line md:block" aria-hidden="true" />
          <div className="hidden items-center gap-2 md:flex">
            {locationSelect}
            {riskSelect}
            {yieldSelect}
          </div>
        </FilterBar>
        <div className="flex min-h-[28px] flex-wrap items-center gap-3 text-sm" aria-live="polite">
          <p className="text-ink-muted" data-testid="result-count">
            <span className="font-semibold text-ink">{filtered.length}</span> {filtered.length === 1 ? "asset" : "assets"} found
          </p>
          {anyFilter && (
            <button type="button" onClick={reset} className="font-semibold text-green-600 underline-offset-2 hover:underline">
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="mt-5">
        {loading ? (
          <div role="status" aria-label="Loading assets" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <AssetCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No assets match your selected filters"
            description="Clear filters or explore all opportunities."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={reset}>Clear filters</Button>
                <Button variant="outline" onClick={reset}>Explore all opportunities</Button>
              </div>
            }
          />
        ) : view === "map" ? (
          <MapPanel className="h-[480px] sm:h-[600px]">
            <ListingsMap assets={filtered} basePath={basePath} />
          </MapPanel>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {pageItems.map((a) => (
              <AssetCard key={a.id} asset={a} basePath={basePath} wishlisted={wishlist.has(a.id)} onToggleWishlist={toggleWishlist} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && view === "grid" && totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-muted" aria-live="polite">
            Showing {from} – {to} of {filtered.length} assets
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                aria-current={p === page ? "page" : undefined}
                onClick={() => setPage(p)}
                className={cn(
                  "h-10 w-10 rounded-full text-sm font-semibold transition-colors duration-150",
                  p === page ? "bg-green-600 text-white" : "text-ink hover:bg-green-50",
                )}
              >
                {p}
              </button>
            ))}
            <Button variant="outline" size="icon" aria-label="Next page" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </nav>
      )}

      {/* Mobile filter sheet */}
      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent variant="sheet" className="p-5">
          <DialogTitle className="text-lg font-bold">Filters</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-ink-muted">Refine verified agricultural opportunities.</DialogDescription>
          <div className="mt-5 space-y-3">
            {locationSelect}
            {riskSelect}
            {yieldSelect}
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={reset}>
              Reset
            </Button>
            <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
              Show {filtered.length} {filtered.length === 1 ? "asset" : "assets"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
