"use client";

import { useT } from "@/lib/i18n/react";

export interface LegendEntry {
  name: string;
  color: string;
}

export function ChartLegend({ items }: { items: LegendEntry[] }) {
  const t = useT();
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
      {items.map((i) => (
        <li key={i.name} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: i.color }} aria-hidden="true" />
          {t(i.name)}
        </li>
      ))}
    </ul>
  );
}
