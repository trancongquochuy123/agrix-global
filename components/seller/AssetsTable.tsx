"use client";

import { useRouter } from "next/navigation";
import { AssetCell } from "@/components/investor/PositionsTable";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { ListingStatusBadge } from "@/components/shared/badges";
import { usd } from "@/lib/demo/format";
import type { Asset } from "@/types/asset";
import { useT } from "@/lib/i18n/react";

export function AssetsTable({ assets }: { assets: Asset[] }) {
  const router = useRouter();
  const t = useT();
  const columns: Column<Asset>[] = [
    { key: "asset", header: "Asset", sortValue: (a) => a.name, render: (a) => <AssetCell asset={a} /> },
    { key: "id", header: "ID", render: (a) => <span className="figure text-xs text-ink-muted">{a.id}</span> },
    { key: "value", header: "Asset value", align: "right", sortValue: (a) => a.assetValueUsd, render: (a) => <span className="figure font-semibold">{usd(a.assetValueUsd)}</span> },
    { key: "status", header: "Status", sortValue: (a) => a.status, render: (a) => <ListingStatusBadge status={a.status} /> },
    {
      key: "funding",
      header: "Funding",
      sortValue: (a) => a.fundedPct,
      className: "min-w-[150px]",
      render: (a) =>
        a.status === "published" ? (
          <div>
            <ProgressBar value={a.fundedPct} label={t("{name} funding progress", { name: t(a.name) })} className="h-1.5" />
            <p className="figure mt-1 text-xs text-ink-muted">
              {usd(a.raisedUsd)} · {a.fundedPct}%
            </p>
          </div>
        ) : (
          <span className="text-xs text-ink-muted">{t("Not open yet")}</span>
        ),
    },
  ];
  return (
    <DataTable
      caption="Your assets"
      columns={columns}
      rows={assets}
      rowKey={(a) => a.id}
      rowLabel={(a) => t("Open {name}", { name: t(a.name) })}
      onRowClick={(a) => router.push(`/seller/assets/${a.id}`)}
      minWidth="min-w-[720px]"
      mobileCard={(a) => (
        <div className="space-y-3">
          <AssetCell asset={a} />
          <div className="flex items-center justify-between gap-3 text-xs">
            <ListingStatusBadge status={a.status} />
            <span className="figure text-ink-muted">{a.status === "published" ? t("{pct}% funded", { pct: a.fundedPct }) : t("Not open yet")}</span>
          </div>
        </div>
      )}
    />
  );
}
