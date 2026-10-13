"use client";

import { ChartCard } from "@/components/shared/ChartCard";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { TrendChart } from "@/components/charts/TrendChart";
import { creditModule, riskModule, valuationModule } from "@/data/analytics";
import { cn } from "@/lib/utils";

export function ValuationPanel() {
  const v = valuationModule;
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
      <ChartCard title="AI Valuation" subtitle={`Dak Lak Coffee Estate · ${v.confidence}% confidence`}>
        <p className="figure text-4xl font-extrabold">${v.base.toFixed(2)}M</p>
        <p className="mt-1 text-sm text-ink-muted">
          Range ${v.low.toFixed(2)}M – ${v.high.toFixed(2)}M
        </p>
        <ul className="mt-5 space-y-2.5 text-sm">
          {v.factors.map((f) => (
            <li key={f.label} className="flex items-center justify-between border-b border-line pb-2 last:border-0">
              <span className="text-ink-muted">{f.label}</span>
              <span className={cn("figure font-semibold", f.impact.startsWith("-") ? "text-danger" : "text-green-700")}>{f.impact}</span>
            </li>
          ))}
        </ul>
      </ChartCard>
      <ChartCard title="Fair value trend" subtitle="$ millions, last 7 months" bodyClassName="h-64">
        <TrendChart
          ariaLabel="Fair value trend over the last seven months"
          data={v.series}
          xKey="month"
          series={[{ key: "value", name: "Fair value", color: "#2F7D3B", area: true }]}
          yFormat={(n) => `$${n}M`}
          tooltipFormat={(n) => `$${n}M`}
          yDomain={["dataMin", "dataMax"]}
        />
      </ChartCard>
    </div>
  );
}

export function RiskPanel() {
  const r = riskModule;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Risk Engine" subtitle={`Composite score ${r.overall} / 100 · Low`}>
        <ul className="space-y-3.5">
          {r.drivers.map((d) => (
            <li key={d.label}>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-medium">{d.label}</span>
                <span className="figure font-semibold">{d.score}</span>
              </div>
              <ProgressBar value={d.score} label={`${d.label} risk`} tone={d.score > 35 ? "warning" : "green"} />
            </li>
          ))}
        </ul>
      </ChartCard>
      <ChartCard title="Stress scenarios" subtitle="Modelled impact on annual revenue">
        <ul className="divide-y divide-line">
          {r.scenarios.map((s) => (
            <li key={s.name} className="flex items-center justify-between py-3.5 text-sm">
              <span>{s.name}</span>
              <span className="figure rounded-full bg-[#FBE5E3] px-2.5 py-1 text-xs font-bold text-[#9B2C25]">{s.impact}</span>
            </li>
          ))}
        </ul>
      </ChartCard>
    </div>
  );
}

export function CreditPanel() {
  const c = creditModule;
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
      <ChartCard title="Credit Engine" subtitle="Indicative credit assessment">
        <p className="figure text-5xl font-extrabold text-forest-800">{c.rating}</p>
        <p className="mt-1 text-sm text-ink-muted">Internal rating · score {c.score} / 100</p>
        <ProgressBar value={c.score} label="Credit score" className="mt-4" />
      </ChartCard>
      <ChartCard title="Financing insights">
        <dl className="grid grid-cols-2 gap-3">
          {c.facilities.map((f) => (
            <div key={f.label} className="rounded-xl bg-green-50/60 p-3">
              <dt className="text-xs text-ink-muted">{f.label}</dt>
              <dd className="figure mt-0.5 text-lg font-bold">{f.value}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-ink-muted">
          {c.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </ChartCard>
    </div>
  );
}
