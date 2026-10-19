"use client";

import { useEffect, useState } from "react";
import { Leaf, Pause, Play } from "lucide-react";
import { MapPanel } from "@/components/maps/MapFrame";
import { TwinMap } from "@/components/maps";
import { gradientCss, layerMeta, NdviMap } from "@/components/maps/NdviMap";
import { FilterSelect } from "@/components/shared/FilterBar";
import { twinTimeline } from "@/data/analytics";
import type { TwinLayer } from "@/types/intelligence";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/react";

const layerTabs: { id: TwinLayer; label: string }[] = [
  { id: "ndvi", label: "NDVI" },
  { id: "health", label: "Crop Health" },
  { id: "elevation", label: "Elevation" },
  { id: "moisture", label: "Moisture" },
];

export function TwinWorkspace({ slug, name, detail }: { slug: string; name: string; detail: string }) {
  const t = useT();
  const [layer, setLayer] = useState<TwinLayer>("ndvi");
  const [step, setStep] = useState(3);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= twinTimeline.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 900);
    return () => clearInterval(id);
  }, [playing]);

  const togglePlay = () => {
    if (!playing && step >= twinTimeline.length - 1) setStep(0);
    setPlaying((p) => !p);
  };

  const meta = layerMeta[layer];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <MapPanel className="h-[360px] sm:h-[420px]">
        <TwinMap key={slug} slug={slug} />
        <div className="pointer-events-none absolute left-3 top-3 z-[1000] flex items-center gap-2.5 rounded-lg bg-forest-950/80 px-3 py-2 text-white backdrop-blur-sm">
          <Leaf className="h-5 w-5 text-lime-indicator" aria-hidden="true" />
          <div className="leading-tight">
            <p className="text-sm font-bold">{name}</p>
            <p className="text-xs text-white/70">{detail}</p>
          </div>
        </div>
      </MapPanel>

      <MapPanel className="h-[420px] sm:h-[420px]">
        <NdviMap layer={layer} step={step} />
        <div aria-live="polite" className="absolute left-3 top-[68px] z-10 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-forest-900 shadow-card sm:top-16">
          {t(twinTimeline[step])}
        </div>
        <p className="absolute bottom-[88px] left-3 z-10 rounded bg-forest-950/70 px-2 py-0.5 text-[10px] font-medium text-white/85 backdrop-blur-sm">
          {t("Simulated prototype data")}
        </p>
        <div className="absolute inset-x-3 top-3 z-10 flex flex-wrap items-start justify-between gap-2">
          <FilterSelect
            label="Visualisation layer"
            value={layer}
            onChange={(v) => setLayer(v as TwinLayer)}
            options={layerTabs.map((tab) => ({ value: tab.id, label: layerMeta[tab.id].label }))}
            className="w-52"
          />
          <div role="group" aria-label={t("Layer mode")} className="inline-flex rounded-lg bg-white p-0.5 shadow-card">
            {layerTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                aria-pressed={layer === tab.id}
                onClick={() => setLayer(tab.id)}
                className={cn(
                  "h-9 rounded-md px-2.5 text-xs font-semibold transition-colors duration-150 sm:px-3 sm:text-sm",
                  layer === tab.id ? "bg-green-50 text-green-700 shadow-sm ring-1 ring-green-100" : "text-ink-muted hover:text-ink",
                )}
              >
                {t(tab.label)}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute right-3 top-1/2 z-10 hidden -translate-y-[40%] rounded-lg bg-forest-950/80 p-2.5 text-[11px] text-white backdrop-blur-sm sm:block" aria-hidden="true">
          <p className="mb-1.5 font-semibold">{t(meta.high)}</p>
          <div className="mx-auto h-28 w-3 rounded" style={{ background: gradientCss(layer) }} />
          <p className="mt-1.5 font-semibold">{t(meta.low)}</p>
        </div>

        <div className="absolute inset-x-3 bottom-3 z-10 flex items-center gap-3 rounded-xl bg-forest-950/80 px-3.5 py-3 text-white backdrop-blur-sm">
          <div className="min-w-0 flex-1">
            <input
              type="range"
              min={0}
              max={twinTimeline.length - 1}
              step={1}
              value={step}
              onChange={(e) => {
                setPlaying(false);
                setStep(Number(e.target.value));
              }}
              aria-label={t("Timeline month")}
              aria-valuetext={t(twinTimeline[step])}
              className="h-1.5 w-full cursor-pointer accent-lime-indicator"
            />
            <div className="mt-1.5 flex justify-between text-[11px] text-white/70">
              {twinTimeline.map((m, i) => (
                <span key={m} className={cn(i === step && "font-bold text-white")}>
                  {t(m).split(" ")[0]}
                  <span className="hidden sm:inline"> {t(m).split(" ")[1]}</span>
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? t("Pause timeline") : t("Play timeline")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-forest-900 transition-transform duration-150 hover:scale-105"
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
          </button>
        </div>
      </MapPanel>
    </div>
  );
}
