"use client";

import type { ReactNode } from "react";

export const CHART = {
  forest: "#0E513D",
  forestDeep: "#063B2E",
  green: "#2F7D3B",
  sage: "#8FC16B",
  sageLight: "#BFD9A8",
  gold: "#C4A35A",
  grid: "#E6ECE8",
  axis: "#66736D",
};

export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: CHART.axis, fontSize: 11 },
} as const;

interface TooltipRow {
  name?: string | number;
  value?: string | number;
  color?: string;
}

/** Shared tooltip card used by every chart. */
export function ChartTooltip({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: TooltipRow[];
  label?: string | number;
  format?: (value: number, name: string) => ReactNode;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-pop">
      {label !== undefined && <p className="mb-1 font-semibold text-ink">{label}</p>}
      {payload.map((p) => (
        <p key={String(p.name)} className="flex items-center gap-2 text-ink-muted">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} aria-hidden="true" />
          <span>{p.name}</span>
          <span className="figure ml-auto pl-3 font-semibold text-ink">
            {format ? format(Number(p.value), String(p.name)) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}
