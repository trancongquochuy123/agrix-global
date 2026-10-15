"use client";

import { useEffect } from "react";

/**
 * Screens with a fixed bottom action bar call this so the presenter button lifts above it instead of
 * covering the primary CTA. `mobileOnly` applies the offset below the md breakpoint.
 */
export function useReserveBottom(px: number, mobileOnly = false) {
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => root.style.setProperty("--demo-offset", mobileOnly && mq.matches ? "0px" : `${px}px`);
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      root.style.removeProperty("--demo-offset");
    };
  }, [px, mobileOnly]);
}
