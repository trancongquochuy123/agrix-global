"use client";

import type { ReactNode } from "react";
import { useT } from "@/lib/i18n/react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  const t = useT();
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
      <div className="min-w-0">
        <h1 className="text-[28px] font-extrabold leading-tight text-ink sm:text-4xl">{t(title)}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-muted sm:text-base">{t(subtitle)}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
