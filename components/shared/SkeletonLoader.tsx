"use client";

import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/react";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative overflow-hidden rounded-md bg-green-100/70", className)}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

export function SkeletonLoader({ lines = 3, className }: { lines?: number; className?: string }) {
  const t = useT();
  return (
    <div role="status" aria-label={t("Loading")} className={cn("space-y-2.5", className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}
