"use client";

import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "./Sparkline";
import { useT } from "@/lib/i18n/react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  change?: string;
  comparison?: string;
  trend?: "up" | "down";
  spark?: number[];
  tone?: "green" | "gold";
  className?: string;
}

export function StatCard({ icon, label, value, change, comparison, trend = "up", spark, tone = "green", className }: StatCardProps) {
  const t = useT();
  const TrendIcon = trend === "up" ? ArrowUpRight : ArrowDownRight;
  return (
    <div className={cn("card flex items-start gap-4 overflow-hidden p-4 sm:p-5", className)}>
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          tone === "green" ? "bg-green-50 text-green-600" : "bg-gold-light/50 text-gold-dark",
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink-muted">{t(label)}</p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className="figure text-2xl font-bold leading-none text-ink sm:text-[28px]">{t(value)}</p>
          {spark && <Sparkline data={spark} className="hidden shrink-0 sm:block xl:hidden min-[1500px]:block" />}
        </div>
        {(change || comparison) && (
          <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-xs">
            {change && (
              <span
                className={cn("inline-flex items-center font-semibold", trend === "up" ? "text-green-600" : "text-danger")}
              >
                <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {t(change)}
              </span>
            )}
            {comparison && <span className="text-ink-muted">{t(comparison)}</span>}
          </p>
        )}
      </div>
    </div>
  );
}
