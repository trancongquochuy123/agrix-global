"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, Database, Layers, PieChart, ShieldCheck, Sprout, Gauge } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { ChartCard } from "@/components/shared/ChartCard";
import { FadeIn } from "@/components/shared/FadeIn";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { SafeImage } from "@/components/shared/SafeImage";
import { StatusBadge } from "@/components/shared/badges";
import { TrendChart } from "@/components/charts/TrendChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { assetValueGrowth, dashboardAllocation, dashboardStats, recentAssets } from "@/data/analytics";
import { assetBySlug } from "@/data/assets";
import { formatUsd } from "@/lib/formatters";
import { AssetMapCard } from "./AssetMapCard";
import { RiskMonitor } from "./RiskMonitor";
import { categoryLabel } from "@/lib/categories";

const statIcons = {
  layers: <Layers className="h-5 w-5" />,
  sprout: <Sprout className="h-5 w-5" />,
  database: <Database className="h-5 w-5" />,
  bar: <BarChart3 className="h-5 w-5" />,
};

type RecentAsset = (typeof recentAssets)[number];

export function DashboardView() {
  const router = useRouter();

  const columns: Column<RecentAsset>[] = [
    {
      key: "name",
      header: "Asset Name",
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-3">
          <SafeImage
            src={assetBySlug(r.slug)?.image}
            alt=""
            category={r.type}
            className="h-10 w-10 shrink-0 rounded-lg"
          />
          <div className="min-w-0">
            <p className="truncate font-semibold">{r.name}</p>
            <p className="truncate text-xs text-ink-muted">{r.location}</p>
          </div>
        </div>
      ),
    },
    { key: "type", header: "Type", sortValue: (r) => r.type, render: (r) => <span className="text-ink-muted">{categoryLabel(r.type)}</span> },
    {
      key: "value",
      header: "Value",
      sortValue: (r) => r.valueUsd,
      render: (r) => <span className="figure font-semibold">{formatUsd(r.valueUsd)}</span>,
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Overview" subtitle="Verified agricultural assets. Real-world impact." />

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((s, i) => (
          <FadeIn key={s.id} delay={i * 0.05}>
            <StatCard
              icon={statIcons[s.icon]}
              label={s.label}
              value={s.value}
              change={s.change}
              comparison={s.comparison}
              trend={s.trend}
              spark={s.spark}
            />
          </FadeIn>
        ))}
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <FadeIn delay={0.1}>
          <AssetMapCard />
        </FadeIn>
        <FadeIn delay={0.15}>
          <RiskMonitor />
        </FadeIn>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_1.5fr]">
        <FadeIn delay={0.2}>
          <ChartCard
            title="Asset Value Growth"
            icon={<BarChart3 className="h-5 w-5" />}
            className="h-full"
            action={
              <Link href="/portfolio" className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:underline">
                View Details <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
            bodyClassName="h-56"
          >
            <TrendChart
              ariaLabel="Verified asset value growth from 2021 to 2024, reaching $128.4 million"
              data={assetValueGrowth}
              xKey="label"
              series={[{ key: "value", name: "Asset value", color: "#367C3B", area: true }]}
              yFormat={(v) => `${v}M`}
              tooltipFormat={(v) => `$${v}M`}
              yTicks={[0, 40, 80, 120, 160]}
              yDomain={[0, 160]}
              highlightLast
              xInterval={2}
            />
          </ChartCard>
        </FadeIn>

        <FadeIn delay={0.25}>
          <ChartCard
            title="Asset Allocation"
            icon={<PieChart className="h-5 w-5" />}
            className="h-full"
            action={
              <Link href="/portfolio" className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:underline">
                View Details <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <div className="flex flex-col items-center gap-4">
              <div className="h-44 w-44 shrink-0">
                <DonutChart
                  ariaLabel="Asset allocation: coffee 42%, rice 28%, durian 18%, carbon 12%"
                  data={dashboardAllocation.map((d) => ({ name: d.name, value: d.pct, color: d.color }))}
                  tooltipFormat={(v) => `${v}%`}
                  center={
                    <>
                      <span className="figure text-lg font-bold">$128.4M</span>
                      <span className="text-[11px] text-ink-muted">Total Value</span>
                    </>
                  }
                />
              </div>
              <ul className="w-full space-y-2.5 text-sm">
                {dashboardAllocation.map((d) => (
                  <li key={d.name} className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} aria-hidden="true" />
                    <span className="flex-1">{d.name}</span>
                    <span className="figure w-10 text-right font-semibold">{d.pct}%</span>
                    <span className="figure w-16 text-right text-ink-muted">{formatUsd(d.valueUsd)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ChartCard>
        </FadeIn>

        <FadeIn delay={0.3} className="lg:col-span-2 xl:col-span-1">
          <ChartCard
            title="Recent Assets"
            icon={<Gauge className="h-5 w-5" />}
            className="h-full"
            action={
              <Link href="/marketplace" className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:underline">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <DataTable
              caption="Recently added verified assets"
              minWidth="min-w-[400px]"
              columns={columns}
              rows={recentAssets}
              rowKey={(r) => r.id}
              rowLabel={(r) => `Open ${r.name}`}
              onRowClick={(r) => router.push(`/marketplace/${r.slug}`)}
              mobileCard={(r) => (
                <div className="flex items-center gap-3">
                  <SafeImage src={assetBySlug(r.slug)?.image} alt="" category={r.type} className="h-12 w-12 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{r.name}</p>
                    <p className="truncate text-xs text-ink-muted">{r.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="figure text-sm font-semibold">{formatUsd(r.valueUsd)}</p>
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              )}
            />
          </ChartCard>
        </FadeIn>
      </div>

      <p className="mt-6 flex items-center gap-2 text-xs text-ink-muted">
        <ShieldCheck className="h-4 w-4 text-green-600" aria-hidden="true" />
        Real Assets. Real Intelligence. Global Capital.
      </p>
    </div>
  );
}
