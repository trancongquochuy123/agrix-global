"use client";

import { useEffect, useRef, type ReactNode } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import { Maximize2, Minus, Plus, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export const SATELLITE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
export const SATELLITE_ATTRIBUTION = "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics";
export const STREET_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const STREET_ATTRIBUTION = "© OpenStreetMap contributors";

function useStopPropagation<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (ref.current) {
      L.DomEvent.disableClickPropagation(ref.current);
      L.DomEvent.disableScrollPropagation(ref.current);
    }
  }, []);
  return ref;
}

const controlBtn =
  "flex h-9 w-9 items-center justify-center text-ink transition-colors hover:bg-green-50 focus-visible:bg-green-50";

/** Custom zoom (and optional layer / fullscreen) controls, rendered inside <MapContainer>. */
export function MapControls({
  onToggleLayer,
  fullscreen,
  className,
}: {
  onToggleLayer?: () => void;
  fullscreen?: boolean;
  className?: string;
}) {
  const map = useMap();
  const ref = useStopPropagation<HTMLDivElement>();

  const toggleFullscreen = () => {
    const el = map.getContainer().parentElement;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  };

  return (
    <div ref={ref} className={cn("absolute right-3 top-3 z-[1000] flex flex-col gap-2", className)}>
      <div className="overflow-hidden rounded-lg border border-line bg-white shadow-card">
        <button type="button" aria-label="Zoom in" className={controlBtn} onClick={() => map.zoomIn()}>
          <Plus className="h-4 w-4" />
        </button>
        <div className="h-px bg-line" />
        <button type="button" aria-label="Zoom out" className={controlBtn} onClick={() => map.zoomOut()}>
          <Minus className="h-4 w-4" />
        </button>
      </div>
      {onToggleLayer && (
        <button
          type="button"
          aria-label="Switch base map"
          className={cn(controlBtn, "rounded-lg border border-line bg-white shadow-card")}
          onClick={onToggleLayer}
        >
          <Layers className="h-4 w-4" />
        </button>
      )}
      {fullscreen && (
        <button
          type="button"
          aria-label="Toggle fullscreen"
          className={cn(controlBtn, "rounded-lg border border-line bg-white shadow-card")}
          onClick={toggleFullscreen}
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export interface LegendItem {
  id: string;
  label: string;
  color: string;
  shape?: "dot" | "square" | "line";
  checked?: boolean;
}

export function MapLegend({
  items,
  onToggle,
  className,
}: {
  items: LegendItem[];
  onToggle?: (id: string) => void;
  className?: string;
}) {
  const ref = useStopPropagation<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn("absolute z-[1000] rounded-lg bg-forest-950/80 px-3 py-2.5 text-xs text-white backdrop-blur-sm", className)}
    >
      <ul className="space-y-1.5">
        {items.map((item) => {
          const checked = item.checked ?? true;
          const swatch = (
            <span
              aria-hidden="true"
              className={cn(
                "inline-block shrink-0",
                item.shape === "square" && "h-3 w-3 rounded-[3px] border-2 bg-transparent",
                item.shape === "line" && "h-0.5 w-4 rounded",
                (!item.shape || item.shape === "dot") && "h-2.5 w-2.5 rounded-full",
              )}
              style={
                item.shape === "square"
                  ? { borderColor: item.color, opacity: checked ? 1 : 0.35 }
                  : { background: item.color, opacity: checked ? 1 : 0.35 }
              }
            />
          );
          return (
            <li key={item.id}>
              {onToggle ? (
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => onToggle(item.id)}
                  className="flex w-full items-center gap-2 text-left transition-opacity hover:opacity-100"
                  style={{ opacity: checked ? 1 : 0.6 }}
                >
                  {swatch}
                  {item.label}
                </button>
              ) : (
                <span className="flex items-center gap-2">
                  {swatch}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function NorthArrow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute z-[1000] flex h-10 w-8 flex-col items-center justify-center rounded-lg bg-forest-950/80 text-[10px] font-bold text-white backdrop-blur-sm",
        className,
      )}
    >
      N
      <svg viewBox="0 0 10 12" className="h-3 w-2.5 fill-white">
        <path d="M5 0 10 12 5 9 0 12Z" />
      </svg>
    </div>
  );
}

export function dotIcon(color: string, size = 28, inner?: string) {
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;color:#fff;font:700 ${Math.round(size * 0.42)}px Inter,sans-serif">${inner ?? ""}<span style="${inner ? "display:none" : `width:${size * 0.28}px;height:${size * 0.28}px;border-radius:9999px;background:#fff;opacity:.9`}"></span></div>`,
  });
}

export function labelIcon(html: string, width = 150) {
  return L.divIcon({
    className: "",
    iconSize: [width, 40],
    iconAnchor: [width / 2, 20],
    html: `<div style="width:${width}px;text-align:center;pointer-events:none;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.85);font:600 11px/1.25 Inter,sans-serif">${html}</div>`,
  });
}

/** Re-fits the map to `bounds` whenever its container is (re)sized. */
export function FitOnResize({ bounds, padding = 8 }: { bounds: LatLngBoundsExpression; padding?: number }) {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const fit = () => {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [padding, padding], animate: false });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
}
