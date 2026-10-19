"use client";

import { useCallback, useState } from "react";
import { AlertTriangle, BrainCircuit, ChevronRight, Droplets, FileText, Layers, ShieldCheck, Sprout, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterSelect } from "@/components/shared/FilterBar";
import { FadeIn } from "@/components/shared/FadeIn";
import { intelligenceModules, twinAssets } from "@/data/analytics";
import type { ModuleId } from "@/types/intelligence";
import { cn } from "@/lib/utils";
import { AnalyticsCards } from "./AnalyticsCards";
import { LiveBadge } from "./LiveBadge";
import { CreditPanel, RiskPanel, ValuationPanel } from "./ModulePanels";
import { TwinWorkspace } from "./TwinWorkspace";
import { StatCard } from "@/components/shared/StatCard";
import { useT } from "@/lib/i18n/react";

const moduleIcons = { valuation: BarChart3, risk: ShieldCheck, credit: FileText, twin: Layers } as const;

export function IntelligenceView() {
  const t = useT();
  const [module, setModule] = useState<ModuleId>("twin");
  const [slug, setSlug] = useState(twinAssets[0].slug);
  const [health, setHealth] = useState(92);
  const [alertCount, setAlertCount] = useState(3);
  const asset = twinAssets.find((a) => a.slug === slug) ?? twinAssets[0];

  // Simulated live feed: small random-walk updates each refresh.
  const onRefresh = useCallback(() => {
    setHealth((h) => Math.max(88, Math.min(96, h + (Math.random() > 0.5 ? 1 : -1))));
    setAlertCount((c) => (Math.random() > 0.8 ? Math.min(5, c + 1) : c));
  }, []);

  return (
    <div>
      <PageHeader
        title="AI Intelligence"
        subtitle="Continuous intelligence across every verified asset."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect
              label="Select asset"
              value={slug}
              onChange={(v) => {
                setSlug(v);
                toast(t("Digital twin switched"), { description: t(twinAssets.find((a) => a.slug === v)?.name ?? "") });
              }}
              options={twinAssets.map((a) => ({ value: a.slug, label: `${t(a.name)} · ${t(a.place)}` }))}
              className="min-w-[17rem]"
            />
            <LiveBadge onRefresh={onRefresh} />
          </div>
        }
      />

      <div role="radiogroup" aria-label={t("Intelligence modules")} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {intelligenceModules.map((m) => {
          const Icon = moduleIcons[m.id];
          const active = module === m.id;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setModule(m.id)}
              className={cn(
                "card flex items-center gap-3.5 p-4 text-left transition-all duration-150 hover:shadow-pop",
                active && "border-green-600/60 bg-green-50 ring-1 ring-green-600/30",
              )}
            >
              <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", active ? "bg-white text-green-600" : "bg-green-50 text-green-600")}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block text-base font-bold">{t(m.title)}</span>
                <span className="mt-0.5 block text-xs text-ink-muted">{t(m.description)}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <FadeIn className="mt-4" key={module}>
        {module === "twin" && <TwinWorkspace slug={slug} name={t(asset.name)} detail={t(asset.detail)} />}
        {module === "valuation" && <ValuationPanel />}
        {module === "risk" && <RiskPanel />}
        {module === "credit" && <CreditPanel />}
      </FadeIn>

      <section aria-label={t("Key metrics")} className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Sprout className="h-5 w-5" />} label="Crop Health" value={`${health}%`} change="+4%" comparison="vs. previous month" />
        <StatCard icon={<BrainCircuit className="h-5 w-5" />} label="Yield Forecast" value="+6.4%" change="+0.8%" comparison="vs. seasonal average" />
        <StatCard icon={<Droplets className="h-5 w-5" />} label="Water Stress" value="Low" comparison="— Stable" />
        <div className="card flex items-start gap-4 p-4 sm:p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FBE5E3] text-danger">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-ink-muted">{t("Anomaly Alerts")}</p>
            <p className="figure mt-1 text-2xl font-bold leading-none sm:text-[28px]">{alertCount}</p>
            <p className="mt-2 text-xs">
              <span className="font-semibold text-danger">▲ +2</span> <span className="text-ink-muted">{t("requires review")}</span>
            </p>
          </div>
        </div>
      </section>

      <AnalyticsCards />
    </div>
  );
}
