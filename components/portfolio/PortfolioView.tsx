"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ChevronRight, Download, Layers, PieChart, Sprout, TrendingUp, Wallet, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { ChartCard } from "@/components/shared/ChartCard";
import { FadeIn } from "@/components/shared/FadeIn";
import { FilterSelect } from "@/components/shared/FilterBar";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { SafeImage } from "@/components/shared/SafeImage";
import { RiskBadge, StatusBadge } from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { TrendChart } from "@/components/charts/TrendChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { StackedBarChart } from "@/components/charts/StackedBarChart";
import { ChartLegend } from "@/components/charts/ChartLegend";
import { CHART } from "@/components/charts/ChartPrimitives";
import {
  allocation,
  AS_OF_LABEL,
  cashFlow,
  getPerformance,
  holdings,
  holdingAssetOptions,
  holdingStatusOptions,
  portfolioRanges,
  portfolioSummary,
} from "@/data/portfolio";
import type { Holding, PortfolioRange } from "@/types/portfolio";
import { downloadTextFile, formatUsd, toCsv } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { categoryLabel } from "@/lib/categories";

const summaryIcons = [<Sprout key="s" className="h-5 w-5" />, <TrendingUp key="t" className="h-5 w-5" />, <Wallet key="w" className="h-5 w-5" />, <Layers key="l" className="h-5 w-5" />];
const riskRank = { Low: 1, Medium: 2, High: 3 } as const;

export function PortfolioView() {
  const router = useRouter();
  const [range, setRange] = useState<PortfolioRange>("12M");
  const [assetFilter, setAssetFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  const [horizon, setHorizon] = useState("5");

  const performance = useMemo(() => getPerformance(range), [range]);
  const rows = useMemo(
    () =>
      holdings.filter(
        (h) => (assetFilter === "all" || h.category === assetFilter) && (statusFilter === "All Status" || h.status === statusFilter),
      ),
    [assetFilter, statusFilter],
  );
  const flows = cashFlow.slice(0, Number(horizon));
  const first = flows[0];
  const last = flows[flows.length - 1];
  const growth = Math.round(((last.income + last.capital) / (first.income + first.capital) - 1) * 100);

  const [exporting, setExporting] = useState(false);

  const exportReport = () => {
    if (exporting) return;
    setExporting(true);
    const csv = toCsv([
      ["AGRIX Portfolio Report", `As of ${AS_OF_LABEL}`],
      [],
      ["Asset", "Category", "Location", "Invested (USD)", "Current Value (USD)", "Change (%)", "Yield p.a. (%)", "Risk", "Status"],
      ...holdings.map((h) => [h.name, categoryLabel(h.category), h.location, h.investedUsd, h.currentValueUsd, h.changePct, h.yieldPct, h.risk, h.status]),
      [],
      ["Year", "Income yield (USD M)", "Capital return (USD M)"],
      ...cashFlow.map((c) => [c.year, c.income, c.capital]),
    ]);
    // Short delay so the loading state is visible, like a server-generated report would be.
    setTimeout(() => {
      downloadTextFile("agrix-portfolio-report.csv", csv);
      setExporting(false);
      toast.success("Report exported", { description: "agrix-portfolio-report.csv (mock data)" });
    }, 900);
  };

  const columns: Column<Holding>[] = [
    {
      key: "asset",
      header: "Asset",
      sortValue: (h) => h.name,
      render: (h) => (
        <div className="flex items-center gap-3">
          <SafeImage src={h.image} alt="" category={h.category} className="h-11 w-11 shrink-0 rounded-lg" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{h.name}</p>
            <p className="truncate text-xs text-ink-muted">{h.location}</p>
          </div>
        </div>
      ),
    },
    { key: "category", header: "Category", sortValue: (h) => h.category, render: (h) => <span>{categoryLabel(h.category)}</span> },
    { key: "invested", header: "Invested", align: "right", sortValue: (h) => h.investedUsd, render: (h) => <span className="figure">{formatUsd(h.investedUsd, { decimals: 2 })}</span> },
    {
      key: "current",
      header: "Current Value",
      align: "right",
      sortValue: (h) => h.currentValueUsd,
      render: (h) => (
        <div className="leading-tight">
          <p className="figure font-semibold">{formatUsd(h.currentValueUsd, { decimals: 2 })}</p>
          <p className="figure text-xs font-semibold text-green-600">+{h.changePct.toFixed(1)}%</p>
        </div>
      ),
    },
    { key: "yield", header: "Yield (p.a.)", align: "right", sortValue: (h) => h.yieldPct, render: (h) => <span className="figure">{h.yieldPct}%</span> },
    { key: "risk", header: "Risk", sortValue: (h) => riskRank[h.risk], render: (h) => <RiskBadge level={h.risk} /> },
    { key: "status", header: "Status", sortValue: (h) => h.status, render: (h) => <StatusBadge status={h.status} /> },
    { key: "go", header: "", className: "w-8", render: () => <ChevronRight className="h-4 w-4 text-ink-muted" aria-hidden="true" /> },
  ];

  return (
    <div>
      <PageHeader
        title="Portfolio"
        subtitle="Performance across your agricultural real-world assets."
        actions={
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-ink-muted sm:block">As of {AS_OF_LABEL}</span>
            <Button variant="dark" onClick={exportReport} disabled={exporting} aria-busy={exporting}>
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
              {exporting ? "Preparing report…" : "Export Report"}
            </Button>
          </div>
        }
      />

      <section aria-label="Portfolio summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {portfolioSummary.map((m, i) => (
          <FadeIn key={m.id} delay={i * 0.05}>
            <StatCard icon={summaryIcons[i]} tone={m.id === "income" ? "gold" : "green"} label={m.label} value={m.value} change={m.change} comparison={m.comparison} trend={m.trend} />
          </FadeIn>
        ))}
      </section>

      <p className="mt-3 flex items-start gap-2 text-xs text-ink-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          <strong className="font-semibold text-ink">Net Return</strong> = (current value + income received − invested capital − fees) ÷ invested capital, trailing 12 months.{" "}
          <strong className="font-semibold text-ink">Target Yield</strong> = projected annual income ÷ invested capital. Prototype figures are illustrative.
        </span>
      </p>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <FadeIn delay={0.1}>
          <ChartCard
            title="Portfolio Performance"
            className="h-full"
            action={
              <div role="group" aria-label="Time range" className="inline-flex rounded-lg border border-line bg-white p-0.5">
                {portfolioRanges.map((r) => (
                  <button
                    key={r}
                    type="button"
                    aria-pressed={range === r}
                    onClick={() => setRange(r)}
                    className={cn(
                      "h-8 min-w-[2.75rem] rounded-md px-2.5 text-xs font-semibold transition-colors duration-150",
                      range === r ? "bg-green-600 text-white" : "text-ink-muted hover:bg-green-50 hover:text-ink",
                    )}
                  >
                    {r === "ALL" ? "ALL" : r}
                  </button>
                ))}
              </div>
            }
          >
            <div className="mb-2">
              <ChartLegend items={[{ name: "Portfolio", color: CHART.forest }, { name: "Benchmark", color: "#9AA5A0" }]} />
            </div>
            <div className="h-72">
              <TrendChart
                key={range}
                ariaLabel={`Portfolio versus benchmark value over ${range === "ALL" ? "all time" : range}`}
                data={performance}
                xKey="label"
                series={[
                  { key: "portfolio", name: "Portfolio", color: CHART.forest, area: true },
                  { key: "benchmark", name: "Benchmark", color: "#9AA5A0" },
                ]}
                yFormat={(v) => `$${v}M`}
                tooltipFormat={(v) => `$${v.toFixed(2)}M`}
                yDomain={["auto", "auto"]}
              />
            </div>
          </ChartCard>
        </FadeIn>

        <FadeIn delay={0.15}>
          <ChartCard title="Allocation by Asset" icon={<PieChart className="h-5 w-5" />} className="h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="h-48 w-48 shrink-0">
                <DonutChart
                  ariaLabel="Portfolio allocation: coffee 32%, rice 24%, carbon 18%, durian 14%, other 12%"
                  data={allocation.map((a) => ({ name: a.name, value: a.pct, color: a.color }))}
                  tooltipFormat={(v) => `${v}%`}
                  center={
                    <>
                      <span className="figure text-xl font-bold">$12.84M</span>
                      <span className="text-xs text-ink-muted">Total Value</span>
                    </>
                  }
                />
              </div>
              <ul className="w-full space-y-3 text-sm">
                {allocation.map((a) => (
                  <li key={a.name} className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full ring-1 ring-black/5" style={{ background: a.color }} aria-hidden="true" />
                    <span className="flex-1 font-medium">{a.name}</span>
                    <span className="text-right leading-tight">
                      <span className="figure block font-bold">{a.pct}%</span>
                      <span className="figure block text-xs text-ink-muted">{formatUsd(a.valueUsd, { decimals: 2 })}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </ChartCard>
        </FadeIn>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <FadeIn delay={0.2}>
          <ChartCard
            title="My Investments"
            subtitle={`${rows.length} of ${holdings.length} shown · ${holdings.length} largest of 14 active investments`}
            className="h-full"
            action={
              <div className="flex flex-wrap gap-2">
                <FilterSelect label="Filter by asset" value={assetFilter} onChange={setAssetFilter} options={holdingAssetOptions.map((o) => ({ value: o.value, label: o.label }))} className="w-36" />
                <FilterSelect label="Filter by status" value={statusFilter} onChange={setStatusFilter} options={holdingStatusOptions.map((o) => ({ value: o, label: o }))} className="w-36" />
              </div>
            }
          >
            {rows.length === 0 ? (
              <EmptyState
                title="No investments match"
                description="Adjust the asset or status filters to see your holdings."
                className="border-0 shadow-none"
                action={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAssetFilter("all");
                      setStatusFilter("All Status");
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <DataTable
                caption="My investments"
                columns={columns}
                rows={rows}
                rowKey={(h) => h.id}
                rowLabel={(h) => `Open ${h.name}`}
                onRowClick={(h) => router.push(`/marketplace/${h.slug}`)}
                mobileCard={(h) => (
                  <div>
                    <div className="flex items-center gap-3">
                      <SafeImage src={h.image} alt="" category={h.category} className="h-12 w-12 shrink-0 rounded-lg" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{h.name}</p>
                        <p className="truncate text-xs text-ink-muted">
                          {categoryLabel(h.category)} · {h.location}
                        </p>
                      </div>
                      <StatusBadge status={h.status} />
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                      <div>
                        <dt className="text-xs text-ink-muted">Invested</dt>
                        <dd className="figure font-semibold">{formatUsd(h.investedUsd, { decimals: 2 })}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-ink-muted">Current value</dt>
                        <dd className="figure font-semibold">
                          {formatUsd(h.currentValueUsd, { decimals: 2 })} <span className="text-xs text-green-600">+{h.changePct.toFixed(1)}%</span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-ink-muted">Yield (p.a.)</dt>
                        <dd className="figure font-semibold">{h.yieldPct}%</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-ink-muted">Risk</dt>
                        <dd>
                          <RiskBadge level={h.risk} />
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
              />
            )}
          </ChartCard>
        </FadeIn>

        <FadeIn delay={0.25}>
          <ChartCard
            title="Projected Cash Flow"
            className="h-full"
            action={
              <FilterSelect
                label="Projection horizon"
                value={horizon}
                onChange={setHorizon}
                options={[
                  { value: "3", label: "Next 3 Years" },
                  { value: "5", label: "Next 5 Years" },
                ]}
                className="w-40"
              />
            }
          >
            <div className="h-60">
              <StackedBarChart
                ariaLabel="Projected annual cash flow split into income yield and capital return"
                data={flows}
                xKey="year"
                series={[
                  { key: "income", name: "Income (Yield)", color: CHART.forest },
                  { key: "capital", name: "Capital Return", color: CHART.sageLight },
                ]}
                yFormat={(v) => `$${v.toFixed(1)}M`}
                tooltipFormat={(v) => `$${v.toFixed(2)}M`}
              />
            </div>
            <div className="mt-2">
              <ChartLegend items={[{ name: "Income (Yield)", color: CHART.forest }, { name: "Capital Return", color: CHART.sageLight }]} />
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-green-50 p-3.5">
              <Calendar className="h-6 w-6 shrink-0 text-forest-700" aria-hidden="true" />
              <div className="flex-1 leading-tight">
                <p className="figure text-lg font-extrabold">${first.income.toFixed(2)}M</p>
                <p className="text-xs text-ink-muted">Expected income in {first.year}</p>
              </div>
              <span className="h-8 w-px bg-line" aria-hidden="true" />
              <div className="leading-tight">
                <p className="figure text-lg font-extrabold text-green-700">+{growth}%</p>
                <p className="text-xs text-ink-muted">Projected growth by {last.year}</p>
              </div>
            </div>
          </ChartCard>
        </FadeIn>
      </div>
    </div>
  );
}
