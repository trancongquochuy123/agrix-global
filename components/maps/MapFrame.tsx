import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Frame that gives every map the same rounded, bordered treatment. */
export function MapPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative isolate overflow-hidden rounded-card border border-line bg-forest-900", className)}>
      {children}
    </div>
  );
}

export function MapSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading map"
      className={cn(
        "flex h-full min-h-[280px] w-full items-center justify-center bg-gradient-to-br from-forest-800 to-forest-900",
        className,
      )}
    >
      <span className="text-sm text-white/60">Loading map…</span>
    </div>
  );
}

