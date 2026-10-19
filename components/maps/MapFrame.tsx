"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/react";

/** Frame that gives every map the same rounded, bordered treatment. */
export function MapPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative isolate overflow-hidden rounded-card border border-line bg-[#E8EEE9]", className)}>
      {children}
    </div>
  );
}

export function MapSkeleton({ className }: { className?: string }) {
  const t = useT();
  return (
    <div
      role="status"
      aria-label={t("Loading map")}
      className={cn(
        "flex h-full min-h-[280px] w-full items-center justify-center bg-green-50",
        className,
      )}
    >
      <span className="text-sm text-ink-muted">{t("Loading map…")}</span>
    </div>
  );
}

