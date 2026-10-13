import { Cpu, Gauge, ShieldCheck, Sprout, TrendingUp } from "lucide-react";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { dashboardRisk } from "@/data/analytics";
import { LOCAL_IMAGES } from "@/data/images";
import { cn } from "@/lib/utils";

const signals = [
  { text: "Dry-spell watch lifted · Central Highlands", ago: "2h", dot: "bg-green-600" },
  { text: "Robusta spot price +3.1% week on week", ago: "6h", dot: "bg-green-600" },
  { text: "Pump pressure dip · Dak Lak Block B", ago: "1d", dot: "bg-warning" },
];

const icons = { climate: Sprout, market: TrendingUp, ops: Cpu } as const;

export function RiskMonitor() {
  return (
    <section className="card flex h-full min-w-0 flex-col p-4 sm:p-5" aria-labelledby="risk-monitor-title">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Gauge className="h-5 w-5 text-green-600" aria-hidden="true" />
          <div>
            <h2 id="risk-monitor-title" className="text-base font-bold leading-tight">
              AI Risk Monitor
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">Real-time analysis of climate, market and operational risks</p>
          </div>
        </div>
      </header>

      <div className="flex items-center gap-4 rounded-xl bg-green-50 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-green-600 shadow-card">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs text-ink-muted">Overall Risk</p>
          <p className="font-heading text-2xl font-extrabold leading-none text-green-700">Low</p>
        </div>
        <p className="ml-auto max-w-[9.5rem] text-right text-xs text-ink-muted">
          Assets are performing within expected parameters with manageable risk levels.
        </p>
      </div>

      <ul className="mt-4 divide-y divide-line">
        {dashboardRisk.map((r) => {
          const Icon = icons[r.id as keyof typeof icons];
          const moderate = r.level === "Moderate";
          return (
            <li key={r.id} className="flex items-center gap-3 py-3">
              <Icon className="h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
              <span className="w-32 shrink-0 text-sm font-medium">{r.label}</span>
              <ProgressBar value={r.score} label={`${r.label}: ${r.level}`} tone={moderate ? "warning" : "green"} className="flex-1" />
              <span className={cn("w-[4.5rem] text-right text-xs font-semibold", moderate ? "text-[#8A5A0B]" : "text-green-700")}>
                {r.level}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mb-4 mt-4 rounded-xl border border-line p-3.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Latest signals</p>
        <ul className="mt-2 space-y-2 text-sm">
          {signals.map((s) => (
            <li key={s.text} className="flex items-start gap-2.5">
              <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", s.dot)} aria-hidden="true" />
              <span className="flex-1">{s.text}</span>
              <span className="shrink-0 text-xs text-ink-muted">{s.ago}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="relative mt-auto overflow-hidden rounded-xl p-4 pt-16 text-white"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(7,29,23,0.1), rgba(7,29,23,0.9)), url(${LOCAL_IMAGES.landscape})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <p className="font-heading text-sm font-bold">Healthier Land. Stronger Communities.</p>
        <span className="mt-1.5 block h-0.5 w-8 rounded bg-gold" aria-hidden="true" />
        <p className="mt-1.5 text-xs text-white/75">Turning agricultural assets into lasting value.</p>
      </div>
    </section>
  );
}
