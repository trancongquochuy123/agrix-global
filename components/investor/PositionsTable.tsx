"use client";

import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { SafeImage } from "@/components/shared/SafeImage";
import { StatusBadge } from "@/components/shared/badges";
import { categoryLabel } from "@/lib/categories";
import { fmtDate, usd } from "@/lib/demo/format";
import type { Position } from "@/lib/demo/selectors";
import type { Asset } from "@/types/asset";
import { useT } from "@/lib/i18n/react";

export function AssetCell({ asset }: { asset: Asset }) {
  const t = useT();
  return (
    <div className="flex min-w-0 items-center gap-3">
      <SafeImage src={asset.image} alt="" category={asset.category} className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="min-w-0">
        <p className="truncate font-semibold">{t(asset.name)}</p>
        <p className="truncate text-xs text-ink-muted">
          {t(categoryLabel(asset.category))} · {t(asset.location)}
        </p>
      </div>
    </div>
  );
}

const statusOf = (p: Position, now: number) => (new Date(p.maturesAt).getTime() <= now ? "Completed" : "Active");

export function PositionsTable({ positions, now, caption, basePath = "/investor/marketplace" }: { positions: Position[]; now: number; caption: string; basePath?: string }) {
  const router = useRouter();
  const t = useT();
  const returnPct = (p: Position) => (p.investedUsd ? (p.accruedUsd / p.investedUsd) * 100 : 0);

  const columns: Column<Position>[] = [
    { key: "asset", header: "Asset", sortValue: (p) => p.asset.name, render: (p) => <AssetCell asset={p.asset} /> },
    { key: "invested", header: "Invested", align: "right", sortValue: (p) => p.investedUsd, render: (p) => <span className="figure font-semibold">{usd(p.investedUsd)}</span> },
    { key: "value", header: "Current value", align: "right", sortValue: (p) => p.valueUsd, render: (p) => <span className="figure font-semibold">{usd(Math.round(p.valueUsd))}</span> },
    {
      key: "ret",
      header: "Accrued (illustrative)",
      align: "right",
      sortValue: returnPct,
      render: (p) => <span className="figure font-semibold text-green-700">+{returnPct(p).toFixed(2)}%</span>,
    },
    { key: "mat", header: "Matures", sortValue: (p) => p.maturesAt, render: (p) => <span className="text-ink-muted">{fmtDate(p.maturesAt)}</span> },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={statusOf(p, now)} /> },
  ];

  return (
    <DataTable
      caption={caption}
      columns={columns}
      rows={positions}
      rowKey={(p) => p.asset.id}
      rowLabel={(p) => t("Open {name}", { name: t(p.asset.name) })}
      onRowClick={(p) => router.push(`${basePath}/${p.asset.slug}`)}
      minWidth="min-w-[760px]"
      mobileCard={(p) => (
        <div className="space-y-3">
          <AssetCell asset={p.asset} />
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-ink-muted">{t("Invested")}</p>
              <p className="figure font-semibold">{usd(p.investedUsd)}</p>
            </div>
            <div>
              <p className="text-ink-muted">{t("Value")}</p>
              <p className="figure font-semibold">{usd(Math.round(p.valueUsd))}</p>
            </div>
            <div>
              <p className="text-ink-muted">{t("Matures")}</p>
              <p className="font-semibold">{fmtDate(p.maturesAt)}</p>
            </div>
          </div>
        </div>
      )}
    />
  );
}
