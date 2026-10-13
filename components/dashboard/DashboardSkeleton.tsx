import { Skeleton } from "@/components/shared/SkeletonLoader";

/** Mirrors the dashboard grid 1:1 so nothing jumps when real content streams in. */
export function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading overview">
      <Skeleton className="mb-2 h-9 w-48" />
      <Skeleton className="mb-6 h-4 w-72" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[132px] rounded-card" />
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Skeleton className="h-[560px] rounded-card sm:h-[640px]" />
        <Skeleton className="hidden h-[640px] rounded-card xl:block" />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_1.5fr]">
        <Skeleton className="h-[340px] rounded-card" />
        <Skeleton className="h-[340px] rounded-card" />
        <Skeleton className="h-[340px] rounded-card lg:col-span-2 xl:col-span-1" />
      </div>
    </div>
  );
}
