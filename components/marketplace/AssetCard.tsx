"use client";

import Link from "next/link";
import { ArrowRight, Heart, MapPin, Mountain, Sprout, BarChart2 } from "lucide-react";
import type { Asset } from "@/types/asset";
import { SafeImage } from "@/components/shared/SafeImage";
import { VerifiedBadge } from "@/components/shared/badges";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { formatHa, formatUsd } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/react";

const riskTone = { Low: "text-green-600", Medium: "text-warning", High: "text-danger" } as const;

export function AssetCard({
  asset,
  basePath = "/marketplace",
  wishlisted,
  onToggleWishlist,
}: {
  asset: Asset;
  basePath?: string;
  wishlisted: boolean;
  onToggleWishlist: (asset: Asset) => void;
}) {
  const t = useT();
  const href = `${basePath}/${asset.slug}`;
  const name = t(asset.name);
  return (
    <article className="card group relative overflow-hidden transition-shadow duration-200 hover:shadow-pop">
      <div className="relative h-40 sm:h-44">
        <SafeImage
          src={asset.image}
          alt={t("{name} cover photograph", { name })}
          category={asset.category}
          className="h-full w-full"
          imgClassName="transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/35 to-transparent" />
        <VerifiedBadge label="AGRIX Reviewed" variant="overlay" className="absolute left-3 top-3" />
        <button
          type="button"
          onClick={() => onToggleWishlist(asset)}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? t("Remove {name} from wishlist", { name }) : t("Add {name} to wishlist", { name })}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-card transition-colors duration-150 hover:bg-white"
        >
          <Heart className={cn("h-[18px] w-[18px] transition-colors", wishlisted && "fill-danger text-danger")} />
        </button>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold leading-snug">
          <Link href={href} className="after:absolute after:inset-0 focus-visible:after:rounded-card">
            {name}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-4 text-sm text-ink-muted">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {t(asset.location)}
          </span>
          <span className="flex items-center gap-1.5">
            <Mountain className="h-3.5 w-3.5" aria-hidden="true" />
            {formatHa(asset.areaHa)}
          </span>
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5">
            <Sprout className="h-5 w-5 text-green-600" aria-hidden="true" />
            <div className="leading-tight">
              <p className="figure text-base font-bold">{asset.targetYield}%</p>
              <p className="text-xs text-ink-muted">{t("Illustrative return")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 border-l border-line pl-3">
            <BarChart2 className={cn("h-5 w-5", riskTone[asset.risk])} aria-hidden="true" />
            <div className="leading-tight">
              <p className="text-base font-bold">{t(asset.risk)}</p>
              <p className="text-xs text-ink-muted">{t("Risk Level")}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-end gap-3">
          <div className="flex-1">
            <ProgressBar value={asset.fundedPct} label={t("{name} funding progress", { name })} />
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="text-ink-muted">{t("{pct}% funded", { pct: asset.fundedPct })}</span>
              <span className="figure font-semibold">
                {formatUsd(asset.raisedUsd)} / {formatUsd(asset.targetUsd)}
              </span>
            </div>
          </div>
          <Link
            href={href}
            aria-label={t("View details for {name}", { name })}
            className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors duration-150 hover:bg-green-600 hover:text-white"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function AssetCardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <div className="h-44 animate-pulse bg-green-100/70" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-green-100/70" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-green-100/70" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-9 animate-pulse rounded bg-green-100/70" />
          <div className="h-9 animate-pulse rounded bg-green-100/70" />
        </div>
        <div className="h-2 animate-pulse rounded-full bg-green-100/70" />
      </div>
    </div>
  );
}
