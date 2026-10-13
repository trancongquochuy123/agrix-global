import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  label,
  className,
  tone = "green",
}: {
  value: number;
  label: string;
  className?: string;
  tone?: "green" | "warning" | "light";
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-green-100", className)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500 ease-out",
          tone === "green" && "bg-green-600",
          tone === "warning" && "bg-warning",
          tone === "light" && "bg-green-500",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
