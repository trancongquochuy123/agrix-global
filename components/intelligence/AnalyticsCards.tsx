"use client";

import { useState } from "react";
import { ArrowRight, Bell, Cloud, CloudRain, CloudSun, Lightbulb, Sprout, Sun } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AlertItem } from "@/types/intelligence";
import { ChartCard } from "@/components/shared/ChartCard";
import { FilterSelect } from "@/components/shared/FilterBar";
import { SafeImage } from "@/components/shared/SafeImage";
import { TrendChart } from "@/components/charts/TrendChart";
import { modelInsight, recentAlerts, vegetationIndex, weatherForecast } from "@/data/analytics";
import { IMAGES } from "@/data/images";
import { cn } from "@/lib/utils";

const weatherIcon = { sun: Sun, partly: CloudSun, rain: CloudRain } as const;
const weatherTone = { sun: "text-warning", partly: "text-gold-dark", rain: "text-[#3B8FE0]" } as const;
const severityDot = { critical: "bg-danger", warning: "bg-warning", info: "bg-[#3B8FE0]" } as const;

const olderAlerts = [
  { id: "al4", title: "Irrigation pump pressure dip", block: "Block B", ago: "2 days ago", severity: "info" as const },
  { id: "al5", title: "Canopy cover variance detected", block: "Block E", ago: "3 days ago", severity: "info" as const },
];

const severityLabel = { critical: "Critical", warning: "Warning", info: "Info" } as const;
const guidance: Record<AlertItem["severity"], string> = {
  critical: "Dispatch a field team within 24 hours and confirm the reading against the nearest sensor before taking action.",
  warning: "Review the affected block this week. If the reading persists for 3 days, schedule an agronomist inspection.",
  info: "No action required. The model will keep monitoring and escalate automatically if the signal strengthens.",
};

export function AnalyticsCards() {
  const [selected, setSelected] = useState<AlertItem | null>(null);
  const [acked, setAcked] = useState<Set<string>>(new Set());
  const [index, setIndex] = useState("NDVI");
  const [showAll, setShowAll] = useState(false);
  const series = vegetationIndex.map((p) => ({ month: p.month, value: Number((index === "NDVI" ? p.value : p.value * 0.88).toFixed(2)) }));
  const alerts = showAll ? [...recentAlerts, ...olderAlerts] : recentAlerts;

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <ChartCard
        title="Vegetation Index"
        icon={<Sprout className="h-5 w-5" />}
        action={
          <FilterSelect
            label="Vegetation index type"
            value={index}
            onChange={setIndex}
            options={[
              { value: "NDVI", label: "NDVI" },
              { value: "EVI", label: "EVI" },
            ]}
            className="w-24"
          />
        }
        bodyClassName="h-52"
      >
        <TrendChart
          ariaLabel={`${index} vegetation index trend from June to November`}
          data={series}
          xKey="month"
          series={[{ key: "value", name: index, color: "#367C3B", area: true }]}
          yDomain={[0.4, 1]}
          yTicks={[0.4, 0.6, 0.8, 1]}
          tooltipFormat={(v) => v.toFixed(2)}
          xInterval={0}
        />
      </ChartCard>

      <ChartCard title="Weather Forecast" subtitle="Dak Lak, Vietnam" icon={<Cloud className="h-5 w-5" />} action={<span className="text-xs text-ink-muted">Next 7 days</span>}>
        <ul className="grid grid-cols-7 gap-1 text-center">
          {weatherForecast.map((d) => {
            const Icon = weatherIcon[d.condition];
            return (
              <li key={d.day} className="flex flex-col items-center gap-1.5">
                <Icon className={cn("h-6 w-6", weatherTone[d.condition])} aria-label={d.condition === "sun" ? "Sunny" : d.condition === "rain" ? "Rain" : "Partly cloudy"} />
                <span className="text-[11px] text-ink-muted">{d.day}</span>
                <span className="figure text-sm font-bold">{d.high}°</span>
                <span className="figure text-xs text-ink-muted">{d.low}°</span>
              </li>
            );
          })}
        </ul>
      </ChartCard>

      <ChartCard
        title="Recent Alerts"
        icon={<Bell className="h-5 w-5" />}
        action={
          <button type="button" onClick={() => setShowAll((s) => !s)} className="text-xs font-semibold text-green-600 hover:underline">
            {showAll ? "Show less" : "View all"}
          </button>
        }
      >
        <ul className="divide-y divide-line">
          {alerts.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setSelected(a)}
                className="flex w-full items-center gap-3 py-2.5 text-left transition-colors hover:bg-green-50/60"
              >
                <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", severityDot[a.severity])} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-sm font-semibold", acked.has(a.id) && "text-ink-muted line-through")}>{a.title}</span>
                  <span className="text-xs text-ink-muted">
                    {a.block} · {a.ago}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </ChartCard>

      <ChartCard title="Model Insight" icon={<Lightbulb className="h-5 w-5" />}>
        <div className="overflow-hidden rounded-xl bg-green-50">
          <SafeImage src={IMAGES.coffee} alt="Ripening coffee cherries" category="coffee" className="h-24 w-full" />
          <div className="flex items-center gap-3 p-3.5">
            <Sprout className="h-5 w-5 shrink-0 text-green-600" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-ink-muted">{modelInsight.title}</p>
              <p className="font-heading text-lg font-extrabold leading-tight">{modelInsight.window}</p>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-muted">{modelInsight.basis}</p>
      </ChartCard>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="p-6">
          {selected && (
            <>
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", severityDot[selected.severity])} aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{severityLabel[selected.severity]} alert</span>
              </div>
              <DialogTitle className="mt-2 text-xl font-bold">{selected.title}</DialogTitle>
              <DialogDescription className="mt-1 text-sm text-ink-muted">
                {selected.block} · {selected.ago} · Dak Lak Coffee Estate
              </DialogDescription>
              <p className="mt-4 rounded-xl bg-green-50 p-3.5 text-sm">{guidance[selected.severity]}</p>
              <p className="mt-3 text-xs text-ink-muted">Simulated prototype data — no real sensors are connected.</p>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
                <Button
                  disabled={acked.has(selected.id)}
                  onClick={() => {
                    setAcked((p) => new Set(p).add(selected.id));
                    toast.success("Alert acknowledged", { description: selected.title });
                    setSelected(null);
                  }}
                >
                  {acked.has(selected.id) ? "Acknowledged" : "Acknowledge"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
