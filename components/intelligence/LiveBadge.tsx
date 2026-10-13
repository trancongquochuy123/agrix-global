"use client";

import { useEffect, useRef, useState } from "react";

const REFRESH_MS = 25_000;

/** Simulated "live data" pill: counts up in minutes and refreshes periodically. */
export function LiveBadge({ onRefresh }: { onRefresh: () => void }) {
  const lastUpdate = useRef<number>(0);
  const [label, setLabel] = useState("Updated 8 min ago");

  useEffect(() => {
    lastUpdate.current = Date.now() - 8 * 60_000;
    const format = () => {
      const mins = Math.floor((Date.now() - lastUpdate.current) / 60_000);
      setLabel(mins < 1 ? "Updated just now" : `Updated ${mins} min ago`);
    };
    const tick = setInterval(format, 5_000);
    const refresh = setInterval(() => {
      lastUpdate.current = Date.now();
      format();
      onRefresh();
    }, REFRESH_MS);
    return () => {
      clearInterval(tick);
      clearInterval(refresh);
    };
  }, [onRefresh]);

  return (
    <div role="status" className="inline-flex h-10 items-center gap-2 rounded-lg border border-green-100 bg-green-50 px-3.5 text-sm font-medium text-green-700">
      <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-600" />
      </span>
      Live data · {label}
    </div>
  );
}
