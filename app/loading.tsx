import { Skeleton } from "@/components/shared/SkeletonLoader";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading page" className="space-y-5">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-card" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-card" />
    </div>
  );
}
