"use client";

import { useMemo, useId } from "react";
import type { TwinLayer } from "@/types/intelligence";
import { useT } from "@/lib/i18n/react";

const COLS = 30;
const ROWS = 20;
const W = 600;
const H = 400;
const CW = W / COLS;
const CH = H / ROWS;

/** Organic field outline used to clip the heat-map. */
const OUTLINE = "M70,150 L150,70 L260,45 L360,30 L470,60 L545,125 L530,215 L500,300 L410,350 L300,335 L205,355 L120,300 L75,225 Z";

/** Canopy factor for each timeline stop (Jul → Nov): vegetation ramps up, peaks in Oct, eases at harvest. */
const SEASON: Record<TwinLayer, number[]> = {
  ndvi: [0.52, 0.64, 0.76, 0.84, 0.74],
  health: [0.6, 0.7, 0.8, 0.88, 0.82],
  moisture: [0.7, 0.62, 0.5, 0.42, 0.55],
  elevation: [1, 1, 1, 1, 1],
};

type Stop = [number, string];
const PALETTES: Record<TwinLayer, Stop[]> = {
  ndvi: [[0, "#C94A42"], [0.25, "#F08A32"], [0.5, "#F2D544"], [0.75, "#7BC043"], [1, "#16783A"]],
  health: [[0, "#B83A33"], [0.4, "#E6B84A"], [0.7, "#6FB04A"], [1, "#0E513D"]],
  elevation: [[0, "#2D6A4F"], [0.4, "#8FB36A"], [0.7, "#D9C27A"], [1, "#9A6A3A"]],
  moisture: [[0, "#E8D8AE"], [0.4, "#9CC9C0"], [0.7, "#4A9BC9"], [1, "#1F5FA8"]],
};

export const layerMeta: Record<TwinLayer, { label: string; high: string; low: string }> = {
  ndvi: { label: "NDVI (Vegetation Index)", high: "High (0.9)", low: "Low (0.1)" },
  health: { label: "Crop Health", high: "Healthy", low: "Stressed" },
  elevation: { label: "Elevation", high: "720 m", low: "640 m" },
  moisture: { label: "Soil Moisture", high: "Saturated", low: "Dry" },
};

function lerpColor(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(",")})`;
}

export function colorAt(layer: TwinLayer, t: number) {
  const stops = PALETTES[layer];
  const x = Math.max(0, Math.min(1, t));
  for (let i = 1; i < stops.length; i++) {
    if (x <= stops[i][0]) {
      const [t0, c0] = stops[i - 1];
      const [t1, c1] = stops[i];
      return lerpColor(c0, c1, (x - t0) / (t1 - t0 || 1));
    }
  }
  return stops[stops.length - 1][1];
}

export function gradientCss(layer: TwinLayer) {
  const stops = [...PALETTES[layer]].reverse().map(([p, c]) => `${c} ${Math.round((1 - p) * 100)}%`);
  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}

/** Smooth deterministic field: layered sinusoids with a few localised stress patches. */
function field(x: number, y: number, layer: TwinLayer) {
  const seed = layer === "health" ? 1.7 : layer === "moisture" ? 3.1 : layer === "elevation" ? 5.3 : 0;
  const base =
    0.5 +
    0.22 * Math.sin(x * 5.2 + seed) * Math.cos(y * 4.1 - seed) +
    0.16 * Math.sin(x * 11 + y * 7 + seed * 2) +
    0.08 * Math.cos(x * 19 - y * 13);
  const patches = [
    { cx: 0.62, cy: 0.62, r: 0.13, d: 0.45 },
    { cx: 0.3, cy: 0.42, r: 0.09, d: 0.3 },
    { cx: 0.78, cy: 0.38, r: 0.08, d: 0.25 },
  ];
  const dip = layer === "elevation" ? 0 : patches.reduce((sum, p) => sum + p.d * Math.exp(-(((x - p.cx) ** 2 + (y - p.cy) ** 2) / (2 * (p.r / 1.6) ** 2))), 0);
  if (layer === "elevation") return Math.max(0, Math.min(1, 0.15 + 0.7 * (1 - y) * 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(x * 4.5 + y * 2.5))));
  return Math.max(0, Math.min(1, base - dip));
}

export function NdviMap({ layer, step }: { layer: TwinLayer; step: number }) {
  const t = useT();
  const id = useId();
  const season = SEASON[layer][Math.max(0, Math.min(4, step))];

  const cells = useMemo(() => {
    const out: { x: number; y: number; v: number }[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const nx = (c + 0.5) / COLS;
        const ny = (r + 0.5) / ROWS;
        out.push({ x: c * CW, y: r * CH, v: field(nx, ny, layer) });
      }
    }
    return out;
  }, [layer]);

  return (
    <svg
      viewBox="-89 -109 778 583"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      role="img"
      aria-label={t("{layer} heat-map for {month} 2026", { layer: t(layerMeta[layer].label), month: t(["July", "August", "September", "October", "November"][step]) })}
    >
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={OUTLINE} />
        </clipPath>
        <filter id={`${id}-soft`}>
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
      </defs>
      <rect x="-400" y="-400" width="1600" height="1400" fill="#0B241D" />
      <path d={OUTLINE} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
      <g clipPath={`url(#${id}-clip)`}>
        <g filter={`url(#${id}-soft)`}>
          {cells.map((c, i) => {
            const v = layer === "elevation" ? c.v : Math.max(0, Math.min(1, c.v * (0.55 + season * 0.6)));
            return <rect key={i} x={c.x - 1} y={c.y - 1} width={CW + 2} height={CH + 2} fill={colorAt(layer, v)} style={{ transition: "fill 260ms ease" }} />;
          })}
        </g>
        {/* Field rows */}
        <g stroke="rgba(0,0,0,0.12)" strokeWidth="1">
          {Array.from({ length: 28 }, (_, i) => (
            <line key={i} x1={40 + i * 20} y1="0" x2={i * 20 - 60} y2={H} />
          ))}
        </g>
      </g>
      <path d={OUTLINE} fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}
