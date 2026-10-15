"use client";

import { useMemo } from "react";
import { BrainCircuit, CheckCircle2, Lightbulb, TrendingDown, TrendingUp } from "lucide-react";
import type { Asset, AssetCategory, AssetDetail } from "@/types/asset";
import { ChartCard } from "@/components/shared/ChartCard";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { RiskBadge } from "@/components/shared/badges";
import { TrendChart } from "@/components/charts/TrendChart";
import { CHART } from "@/components/charts/ChartPrimitives";
import { seeded } from "@/lib/utils";
import { cn } from "@/lib/utils";

/** Small inline label used inside every AI component: results are canned, never verified. */
export function DemoAnalysisChip({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700 ring-1 ring-inset ring-green-100", className)}>
      <BrainCircuit className="h-3 w-3" aria-hidden="true" />
      Demo analysis
    </span>
  );
}

interface Commodity {
  name: string;
  unit: string;
  base: number;
  drift: number;
  insights: string[];
}

const COMMODITY: Record<AssetCategory, Commodity> = {
  coffee: {
    name: "Robusta (ICE London)",
    unit: "USD / t",
    base: 4300,
    drift: 0.012,
    insights: [
      "Vietnam harvest outlook is stable, with export demand firm into Q1.",
      "Forward curve is mildly backwardated, which favours selling near-term crop.",
      "Freight rates to EU ports eased month over month.",
    ],
  },
  rice: {
    name: "Fragrant rice export price",
    unit: "USD / t",
    base: 640,
    drift: 0.006,
    insights: [
      "Importer stock rebuilding supports prices through the dry-season crop.",
      "Delta salinity risk is below the five-year average this season.",
      "Government floor-price policy limits downside.",
    ],
  },
  palmoil: {
    name: "Crude palm oil (BMD)",
    unit: "USD / t",
    base: 990,
    drift: 0.004,
    insights: [
      "Biodiesel mandates in Indonesia provide demand support.",
      "El Niño risk could trim output with a 6–12 month lag.",
      "Export levy changes remain the largest policy uncertainty.",
    ],
  },
  soybean: {
    name: "Soybeans (Paranaguá FOB)",
    unit: "USD / t",
    base: 465,
    drift: 0.003,
    insights: [
      "Record planted area is offset by firm Chinese import demand.",
      "BRL weakness raises local-currency margins for exporters.",
      "Freight bottlenecks on the northern corridor are easing.",
    ],
  },
  cocoa: {
    name: "Cocoa (ICE New York)",
    unit: "USD / t",
    base: 7600,
    drift: 0.01,
    insights: [
      "Supply deficits in West Africa keep prices elevated but volatile.",
      "Grinding demand has softened, a risk to the upper end of the range.",
      "Farm-gate price reviews may compress cooperative margins.",
    ],
  },
  pepper: {
    name: "Black pepper (Vietnam FAQ 500)",
    unit: "USD / t",
    base: 6400,
    drift: 0.007,
    insights: [
      "Lower plantings in Vietnam tighten supply over the next season.",
      "Premium-density lots (550 g/L) carry a visible price premium.",
      "Buyer inventories are low, which supports spot demand.",
    ],
  },
};

const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];

/** Deterministic mock series: 12 months of history followed by a 6-month forecast. */
export function priceSeries(category: AssetCategory) {
  const c = COMMODITY[category];
  const rand = seeded(category.length * 977 + c.base);
  let p = c.base * 0.9;
  const rows = MONTHS.map((label, i) => {
    const actual = i < 12;
    p *= 1 + c.drift + (rand() - 0.5) * 0.05;
    return { label, price: actual ? Math.round(p) : null, forecast: i >= 11 ? Math.round(p) : null, i };
  });
  return rows;
}

function scenarios(category: AssetCategory) {
  const s = priceSeries(category);
  const last = s[11].price ?? 0;
  const end = s[17].forecast ?? last;
  const base = ((end - last) / last) * 100;
  return [
    { id: "bear", label: "Downside", change: base - 9, prob: 20 },
    { id: "base", label: "Base case", change: base, prob: 55 },
    { id: "bull", label: "Upside", change: base + 8, prob: 25 },
  ];
}

const recommendationFor = (risk: number) =>
  risk < 33
    ? { label: "Suitable for a core allocation", tone: "text-green-700", text: "Risk indicators are low relative to peers. Consider sizing as a core holding." }
    : risk < 60
      ? { label: "Suitable as a diversifier", tone: "text-warning", text: "Moderate commodity and operational risk. Size positions so one harvest cannot dominate the portfolio." }
      : { label: "Review carefully before investing", tone: "text-danger", text: "Elevated risk signals. Read the full data room and consider a smaller allocation." };

/** Risk score, factor breakdown, due-diligence summary and recommendation. Shared by the investor detail page and the admin review. */
export function AiRiskSummary({ asset, detail, audience = "investor" }: { asset: Asset; detail: AssetDetail; audience?: "investor" | "admin" }) {
  const rec = recommendationFor(detail.riskScore);
  const tone = detail.riskScore < 33 ? "text-green-600" : detail.riskScore < 60 ? "text-warning" : "text-danger";
  const checks = [
    `${detail.documents.length} data-room documents reviewed by the demo model`,
    `Valuation base case ${asset.assetValueUsd.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}`,
    `${asset.areaHa} ha boundary consistent with the stated location`,
  ];
  return (
    <ChartCard
      title="AI Risk Summary"
      subtitle={audience === "admin" ? "Pre-approval screening · simulated model output" : "Due diligence summary · simulated model output"}
      icon={<BrainCircuit className="h-5 w-5" />}
      action={<DemoAnalysisChip />}
    >
      <div className="grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
        <div className="flex flex-col items-center justify-center rounded-xl bg-green-50/50 px-4 py-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Risk score</p>
          <p className={cn("figure mt-1 text-5xl font-extrabold leading-none", tone)}>{detail.riskScore}</p>
          <p className="mt-1 text-xs text-ink-muted">out of 100 · lower is safer</p>
          <RiskBadge level={asset.risk} className="mt-3" />
        </div>
        <ul className="space-y-3">
          {detail.riskFactors.map((f) => (
            <li key={f.id}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">{f.label}</span>
                <span className="figure text-xs font-semibold text-ink-muted">{f.score}</span>
              </div>
              <ProgressBar value={f.score} label={`${f.label} risk score`} tone={f.score < 33 ? "green" : f.score < 60 ? "warning" : "warning"} className="mt-1 h-1.5" />
              <p className="mt-1 text-xs text-ink-muted">{f.note}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-5 grid gap-4 border-t border-line pt-4 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-bold">Due diligence summary</h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {checks.map((c) => (
              <li key={c} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-line p-3.5">
          <h3 className="flex items-center gap-1.5 text-sm font-bold">
            <Lightbulb className="h-4 w-4 text-gold-dark" aria-hidden="true" />
            AI recommendation
          </h3>
          <p className={cn("mt-1.5 text-sm font-semibold", rec.tone)}>{rec.label}</p>
          <p className="mt-1 text-xs text-ink-muted">{rec.text}</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-ink-muted">Demo analysis built from predefined data. Not independent verification and not investment advice.</p>
    </ChartCard>
  );
}

export function AiInsightsTab({ asset, detail }: { asset: Asset; detail: AssetDetail }) {
  const c = COMMODITY[asset.category];
  const data = useMemo(() => priceSeries(asset.category), [asset.category]);
  const scen = useMemo(() => scenarios(asset.category), [asset.category]);
  const last = data[11].price ?? 0;

  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <ChartCard
        className="lg:col-span-7"
        title="Price Trend & Commodity Forecast"
        subtitle={`${c.name} · ${c.unit} · 12-month history + 6-month forecast`}
        icon={<TrendingUp className="h-5 w-5" />}
        action={<DemoAnalysisChip />}
        bodyClassName="h-72"
      >
        <TrendChart
          ariaLabel={`${c.name} price history and forecast (demo)`}
          data={data}
          xKey="label"
          series={[
            { key: "price", name: "Price", color: CHART.forest, area: true },
            { key: "forecast", name: "Forecast", color: CHART.sage, dashed: true },
          ]}
          yFormat={(v) => `$${Math.round(v).toLocaleString("en-US")}`}
          tooltipFormat={(v) => `$${Math.round(v).toLocaleString("en-US")}`}
          yDomain={["auto", "auto"]}
        />
      </ChartCard>

      <ChartCard className="lg:col-span-5" title="Forecast Scenarios" subtitle="Change from the latest price over six months" icon={<TrendingDown className="h-5 w-5" />} action={<DemoAnalysisChip />}>
        <ul className="space-y-3">
          {scen.map((s) => (
            <li key={s.id} className="rounded-xl border border-line p-3.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold">{s.label}</span>
                <span className={cn("figure text-lg font-extrabold", s.change >= 0 ? "text-green-600" : "text-danger")}>
                  {s.change >= 0 ? "+" : ""}
                  {s.change.toFixed(1)}%
                </span>
              </div>
              <ProgressBar value={s.prob} label={`${s.label} scenario weight`} className="mt-2 h-1.5" tone={s.id === "bear" ? "warning" : "green"} />
              <p className="mt-1 text-xs text-ink-muted">{s.prob}% model weight · from ${last.toLocaleString("en-US")}</p>
            </li>
          ))}
        </ul>
      </ChartCard>

      <ChartCard className="lg:col-span-12" title="Market Insights" subtitle={`${asset.name} · ${asset.country}`} icon={<Lightbulb className="h-5 w-5" />} action={<DemoAnalysisChip />}>
        <ul className="grid gap-3 md:grid-cols-3">
          {c.insights.map((t) => (
            <li key={t} className="rounded-xl bg-green-50/50 p-3.5 text-sm">
              {t}
            </li>
          ))}
        </ul>
      </ChartCard>

      <div className="lg:col-span-12">
        <AiRiskSummary asset={asset} detail={detail} />
      </div>
    </div>
  );
}
