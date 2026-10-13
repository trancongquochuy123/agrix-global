"use client";

import { useMemo, useState } from "react";
import { Check, FileCheck2, Globe, Leaf, Mountain, Droplets, Sprout, TreePine, Cloud, Wind, ShieldCheck, Sun, Wheat, Zap, Scale, Trees } from "lucide-react";
import type { Asset, AssetDetail, AssetDocument } from "@/types/asset";
import { ChartCard } from "@/components/shared/ChartCard";
import { DocumentRow } from "@/components/shared/DocumentRow";
import { FilterSelect } from "@/components/shared/FilterBar";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { RiskBadge } from "@/components/shared/badges";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { TrendChart } from "@/components/charts/TrendChart";
import { StackedBarChart } from "@/components/charts/StackedBarChart";
import { ChartLegend } from "@/components/charts/ChartLegend";
import { CHART } from "@/components/charts/ChartPrimitives";
import { valuationModule } from "@/data/analytics";
import { formatNumber, formatUsd } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { productionLabels } from "./labels";

const driverIcons = { mountain: Mountain, sprout: Sprout, globe: Globe, leaf: Leaf, droplets: Droplets, shield: ShieldCheck, sun: Sun, wheat: Wheat, zap: Zap, trees: Trees, scale: Scale } as const;
const sustainIcons = { sprout: Sprout, co2: Cloud, trees: TreePine, water: Droplets, sun: Sun, zap: Zap, wheat: Wheat, shield: ShieldCheck } as const;

export function OverviewTab({ detail, asset, onViewAllDocs }: { detail: AssetDetail; asset: Asset; onViewAllDocs: () => void }) {
  const [years, setYears] = useState("10");
  const labels = productionLabels[asset.category];
  const data = detail.production.slice(0, Number(years));
  const keyDocs = detail.documents.slice(0, 3);

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <ChartCard
        className="lg:col-span-5"
        title="Production Forecast"
        subtitle={labels.unit}
        icon={<Sprout className="h-5 w-5" />}
        action={
          <FilterSelect
            label="Forecast horizon"
            value={years}
            onChange={setYears}
            options={[
              { value: "5", label: "5 years" },
              { value: "10", label: "10 years" },
            ]}
            className="w-32"
          />
        }
        bodyClassName="flex h-64 flex-col gap-2"
      >
        <div className="min-h-0 flex-1">
          <StackedBarChart
            ariaLabel={`Ten-year production forecast: ${labels.a} and ${labels.b}`}
            data={data}
            xKey="year"
            series={[
              { key: "arabica", name: labels.a, color: CHART.forest },
              { key: "robusta", name: labels.b, color: CHART.sage },
            ]}
            yFormat={(v) => formatNumber(v)}
            tooltipFormat={(v) => formatNumber(v)}
          />
        </div>
        <ChartLegend items={[{ name: labels.a, color: CHART.forest }, { name: labels.b, color: CHART.sage }]} />
      </ChartCard>

      <ChartCard className="lg:col-span-4" title="Valuation Drivers" icon={<FileCheck2 className="h-5 w-5" />}>
        <ul className="space-y-2.5">
          {detail.drivers.map((d) => {
            const Icon = driverIcons[d.icon];
            return (
              <li key={d.id} className="flex items-center gap-3 rounded-xl bg-green-50/60 px-3 py-2.5">
                <Icon className="h-5 w-5 shrink-0 text-forest-700" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight">{d.label}</p>
                  <p className="text-xs text-ink-muted">{d.description}</p>
                </div>
                <span className="figure rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">+{d.impactPct}%</span>
              </li>
            );
          })}
        </ul>
      </ChartCard>

      <div className="flex flex-col gap-5 lg:col-span-3">
        <ChartCard
          title="Ownership Verification"
          icon={<FileCheck2 className="h-5 w-5" />}
          action={<span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">Verified</span>}
        >
          <ol className="space-y-3">
            {detail.verification.map((v, i) => (
              <li key={v.id} className="relative flex gap-3">
                {i < detail.verification.length - 1 && (
                  <span aria-hidden="true" className="absolute left-[11px] top-6 h-[calc(100%-4px)] w-px bg-green-600/40" />
                )}
                <span className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">{v.label}</p>
                  <p className="text-xs text-ink-muted">{v.date}</p>
                </div>
              </li>
            ))}
          </ol>
        </ChartCard>
      </div>

      <ChartCard className="lg:col-span-9" title="Sustainability Metrics" icon={<Leaf className="h-5 w-5" />}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {detail.sustainability.map((m) => {
            const Icon = sustainIcons[m.icon];
            return (
              <div key={m.id} className="flex items-center gap-3 rounded-xl border border-line p-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="leading-tight">
                  <p className="figure text-xl font-bold">{m.value}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{m.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </ChartCard>

      <ChartCard
        className="lg:col-span-3"
        title="Key Documents"
        icon={<FileCheck2 className="h-5 w-5" />}
        action={
          <button type="button" onClick={onViewAllDocs} className="text-xs font-semibold text-green-600 hover:underline">
            View all ({detail.documents.length}) →
          </button>
        }
      >
        <div className="space-y-2">
          {keyDocs.map((d) => (
            <DocumentRow key={d.id} doc={d} />
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

export function ValuationTab({ detail }: { detail: AssetDetail }) {
  const { low, base, high } = detail.valuationRange;
  const scale = base / (valuationModule.base * 1e6);
  const series = valuationModule.series.map((p) => ({ month: p.month, value: Number((p.value * scale).toFixed(2)) }));
  const pos = ((base - low) / (high - low)) * 100;

  const cols: Column<AssetDetail["comparables"][number]>[] = [
    { key: "name", header: "Comparable", render: (r) => <span className="font-semibold">{r.name}</span> },
    { key: "loc", header: "Location", render: (r) => <span className="text-ink-muted">{r.location}</span> },
    { key: "vph", header: "Value / ha", align: "right", sortValue: (r) => r.valuePerHa, render: (r) => <span className="figure">{formatUsd(r.valuePerHa, { compact: false })}</span> },
    { key: "yield", header: "Yield", align: "right", sortValue: (r) => r.yieldPct, render: (r) => <span className="figure">{r.yieldPct}%</span> },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <ChartCard title="AI Valuation Range" subtitle="91% model confidence · refreshed Oct 2, 2026">
        <p className="figure text-4xl font-extrabold">{formatUsd(base, { decimals: 2 })}</p>
        <p className="mt-1 text-sm text-ink-muted">Base-case fair value</p>
        <div className="mt-6">
          <div className="relative h-2 rounded-full bg-green-100">
            <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-gradient-to-r from-sage/40 to-green-600/70" style={{ background: "linear-gradient(90deg,#BFD9A8,#367C3B)" }} />
            <span className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-forest-800 shadow-card" style={{ left: `${pos}%` }} aria-hidden="true" />
          </div>
          <div className="figure mt-2 flex justify-between text-xs text-ink-muted">
            <span>Low {formatUsd(low, { decimals: 2 })}</span>
            <span>High {formatUsd(high, { decimals: 2 })}</span>
          </div>
        </div>
        <ul className="mt-6 space-y-2.5 text-sm">
          {detail.valuationFactors.map((f) => (
            <li key={f.label} className="flex items-center justify-between border-b border-line pb-2 last:border-0">
              <span className="text-ink-muted">{f.label}</span>
              <span className={cn("figure font-semibold", f.impact.startsWith("-") ? "text-danger" : "text-green-700")}>{f.impact}</span>
            </li>
          ))}
        </ul>
      </ChartCard>

      <div className="flex flex-col gap-5">
        <ChartCard title="Valuation trend" subtitle="Fair value, $ millions — last 7 months" bodyClassName="h-52">
          <TrendChart
            ariaLabel="Seven-month valuation trend"
            data={series}
            xKey="month"
            series={[{ key: "value", name: "Fair value", color: "#367C3B", area: true }]}
            yFormat={(v) => `$${v}M`}
            tooltipFormat={(v) => `$${v}M`}
            yDomain={["dataMin", "dataMax"]}
          />
        </ChartCard>
        <ChartCard title="Comparable transactions">
          <DataTable caption="Comparable transactions" columns={cols} rows={detail.comparables} rowKey={(r) => r.name} />
        </ChartCard>
      </div>
    </div>
  );
}

export function RiskTab({ detail }: { detail: AssetDetail }) {
  const level = detail.riskScore < 33 ? "Low" : detail.riskScore < 60 ? "Medium" : "High";
  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <ChartCard title="Composite Risk Score" subtitle="Lower is better">
        <div className="flex flex-col items-center py-4">
          <p className="figure text-6xl font-extrabold">
            {detail.riskScore}
            <span className="text-2xl font-semibold text-ink-muted"> / 100</span>
          </p>
          <RiskBadge level={level} className="mt-3" />
          <p className="mt-4 text-center text-sm text-ink-muted">
            Weighted across climate, market, operations, legal and biological factors, re-scored daily by the AGRIX Risk Engine.
          </p>
        </div>
      </ChartCard>
      <ChartCard title="Risk factors">
        <ul className="divide-y divide-line">
          {detail.riskFactors.map((r) => (
            <li key={r.id} className="py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{r.label}</p>
                <div className="flex items-center gap-3">
                  <span className="figure text-sm font-semibold">{r.score}</span>
                  <RiskBadge level={r.level} />
                </div>
              </div>
              <ProgressBar value={r.score} label={`${r.label} risk score`} tone={r.level === "Low" ? "green" : "warning"} className="mt-2" />
              <p className="mt-2 text-xs text-ink-muted">{r.note}</p>
            </li>
          ))}
        </ul>
      </ChartCard>
    </div>
  );
}

export function DocumentsTab({ documents }: { documents: AssetDocument[] }) {
  const [category, setCategory] = useState("all");
  const categories = useMemo(() => ["all", ...Array.from(new Set(documents.map((d) => d.category)))], [documents]);
  const docs = category === "all" ? documents : documents.filter((d) => d.category === category);
  return (
    <ChartCard
      title="Data room"
      subtitle={`${docs.length} of ${documents.length} documents`}
      action={
        <FilterSelect
          label="Document category"
          value={category}
          onChange={setCategory}
          options={categories.map((c) => ({ value: c, label: c === "all" ? "All categories" : c }))}
          className="w-44"
        />
      }
    >
      <div className="grid gap-2.5 md:grid-cols-2">
        {docs.map((d) => (
          <DocumentRow key={d.id} doc={d} />
        ))}
      </div>
    </ChartCard>
  );
}

const activityDot = {
  verification: "bg-green-600",
  funding: "bg-gold",
  document: "bg-forest-700",
  model: "bg-[#3B8FE0]",
} as const;

export function ActivityTab({ detail }: { detail: AssetDetail }) {
  return (
    <ChartCard title="Recent activity">
      <ol className="relative space-y-6 pl-6 before:absolute before:bottom-1 before:left-[7px] before:top-1 before:w-px before:bg-line">
        {detail.activity.map((a) => (
          <li key={a.id} className="relative">
            <span className={cn("absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white", activityDot[a.kind])} aria-hidden="true" />
            <p className="text-sm font-semibold">{a.title}</p>
            <p className="mt-0.5 text-sm text-ink-muted">{a.detail}</p>
            <p className="mt-1 text-xs text-ink-muted/80">{a.date}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 flex items-center gap-2 text-xs text-ink-muted">
        <Wind className="h-3.5 w-3.5" aria-hidden="true" /> Activity is simulated for this prototype.
      </p>
    </ChartCard>
  );
}
