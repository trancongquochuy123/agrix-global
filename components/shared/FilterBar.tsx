"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/react";

export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
  const t = useT();
  return (
    <div role="toolbar" aria-label={t("Filters")} className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  );
}

export function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-4 text-sm font-medium transition-colors duration-150",
        active
          ? "border-green-600 bg-green-600 text-white"
          : "border-line bg-white text-ink hover:bg-green-50",
      )}
    >
      {children}
    </button>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

/** Native <select> dressed as a dropdown filter — fully accessible and mobile-friendly. */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  icon,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  icon?: ReactNode;
  className?: string;
}) {
  const t = useT();
  return (
    <label className={cn("relative inline-flex items-center", className)}>
      <span className="sr-only">{t(label)}</span>
      {icon && <span className="pointer-events-none absolute left-3 text-ink-muted">{icon}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-10 w-full cursor-pointer appearance-none rounded-lg border border-line bg-white pr-9 text-sm font-medium text-ink transition-colors duration-150 hover:bg-green-50 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20",
          icon ? "pl-9" : "pl-3",
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {t(o.label)}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-ink-muted" aria-hidden="true" />
    </label>
  );
}
