"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { DemoAnalysisChip } from "@/components/ai/AiInsights";
import { AssetCell } from "@/components/investor/PositionsTable";
import { ChartCard } from "@/components/shared/ChartCard";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { RiskBadge } from "@/components/shared/badges";
import { getAssetDetail } from "@/data/assets";
import { usd } from "@/lib/demo/format";
import { useDemo } from "@/lib/demo/hooks";
import type { Asset } from "@/types/asset";

interface Row {
  asset: Asset;
  score: number;
  topFactor: string;
}

export function RiskView() {
  const router = useRouter();
  const { assets } = useDemoAssets();
  const rows: Row[] = assets
    .map((asset) => {
      const d = getAssetDetail(asset);
      const top = [...d.riskFactors].sort((a, b) => b.score - a.score)[0];
      return { asset, score: d.riskScore, topFactor: top ? top.label : "—" };
    })
    .sort((a, b) => b.score - a.score);
  const elevated = rows.filter((r) => r.score >= 40);
  const avg = rows.length ? Math.round(rows.reduce((n, r) => n + r.score, 0) / rows.length) : 0;

  const columns: Column<Row>[] = [
    { key: "asset", header: "Asset", sortValue: (r) => r.asset.name, render: (r) => <AssetCell asset={r.asset} /> },
    { key: "score", header: "AI risk score", align: "right", sortValue: (r) => r.score, render: (r) => <span className="figure font-semibold">{r.score}</span> },
    { key: "risk", header: "Level", render: (r) => <RiskBadge level={r.asset.risk} /> },
    { key: "factor", header: "Top factor", render: (r) => <span className="text-ink-muted">{r.topFactor}</span> },
    { key: "exp", header: "Exposure", align: "right", sortValue: (r) => r.asset.raisedUsd, render: (r) => <span className="figure">{usd(r.asset.raisedUsd)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Risk monitoring" subtitle="Portfolio-level view of simulated AI risk scores." actions={<DemoAnalysisChip />} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<ShieldCheck className="h-5 w-5" />} label="Average risk score" value={String(avg)} comparison="lower is safer" />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Elevated-risk assets" value={String(elevated.length)} comparison="score 40 or higher" />
        <StatCard icon={<ShieldCheck className="h-5 w-5" />} label="Assets monitored" value={String(rows.length)} />
      </div>
      <ChartCard title="Assets by risk" className="mt-5">
        <DataTable
          caption="Risk monitoring"
          columns={columns}
          rows={rows}
          rowKey={(r) => r.asset.id}
          rowLabel={(r) => `Open ${r.asset.name}`}
          onRowClick={(r) => router.push(r.asset.status === "pending_review" ? `/admin/approvals/${r.asset.id}` : `/marketplace/${r.asset.slug}`)}
          minWidth="min-w-[680px]"
          mobileCard={(r) => (
            <div className="space-y-2">
              <AssetCell asset={r.asset} />
              <div className="flex items-center justify-between text-xs">
                <RiskBadge level={r.asset.risk} />
                <span className="figure text-ink-muted">Score {r.score}</span>
              </div>
            </div>
          )}
        />
      </ChartCard>
      <p className="mt-4 text-xs text-ink-muted">Demo analysis built from predefined data. Not independent verification.</p>
    </div>
  );
}

function useDemoAssets() {
  const s = useDemo();
  return { assets: s.assets.filter((a) => a.status !== "rejected") };
}
