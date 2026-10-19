"use client";

import { VIETNAM_OUTLINE } from "@/data/locations";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/react";

const MIN_LAT = 8;
const MAX_LAT = 23.8;
const MIN_LNG = 101.8;
const MAX_LNG = 110;

/** Small SVG location inset: Vietnam outline plus a labelled pin. No tiles required. */
export function LocationInset({
  position,
  label,
  className,
}: {
  position: [number, number];
  label: string;
  className?: string;
}) {
  const t = useT();
  const w = 120;
  const h = 150;
  const project = ([lat, lng]: [number, number]) => [
    ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * w,
    h - ((lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * h,
  ];
  const d = VIETNAM_OUTLINE.map((p, i) => {
    const [x, y] = project(p);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ") + "Z";
  const [px, py] = project(position);

  return (
    <div
      className={cn(
        "absolute z-[1000] overflow-hidden rounded-lg border border-white/40 bg-forest-950/85 p-1.5 shadow-pop backdrop-blur-sm",
        className,
      )}
      role="img"
      aria-label={t("Location of {place} within Vietnam", { place: label })}
    >
      <svg viewBox={`0 0 ${w} ${h}`} className="h-[96px] w-[78px] sm:h-[120px] sm:w-[96px]">
        <path d={d} fill="#0E513D" stroke="#8FC16B" strokeWidth="1.4" strokeLinejoin="round" />
        <circle cx={px} cy={py} r="9" fill="#A8D84E" opacity="0.25" />
        <circle cx={px} cy={py} r="4.2" fill="#A8D84E" stroke="#fff" strokeWidth="1.5" />
      </svg>
      <p className="mt-0.5 text-center text-[10px] font-semibold uppercase tracking-wide text-white/80">{label}</p>
    </div>
  );
}
