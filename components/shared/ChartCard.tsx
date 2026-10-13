import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function ChartCard({ title, subtitle, icon, action, children, className, bodyClassName }: ChartCardProps) {
  return (
    <section className={cn("card flex min-w-0 flex-col p-4 sm:p-5", className)}>
      <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-green-600">{icon}</span>}
          <div>
            <h2 className="whitespace-nowrap text-base font-bold leading-tight text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>}
          </div>
        </div>
        {action}
      </header>
      <div className={cn("min-h-0 flex-1", bodyClassName)}>{children}</div>
    </section>
  );
}
