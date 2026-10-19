"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDemo } from "@/lib/demo/hooks";
import { useT } from "@/lib/i18n/react";
import type { Role } from "@/lib/demo/types";
import { isActive, navByRole, WORKSPACE_LABEL } from "./nav-items";

interface NavListProps {
  role: Role;
  /** Show text labels (always on drawer/xl; on tablet only when expanded). */
  labelClassName?: string;
  onNavigate?: () => void;
}

export function NavList({ role, labelClassName = "inline", onNavigate }: NavListProps) {
  const pathname = usePathname();
  const t = useT();
  const { notices, assets } = useDemo();
  const counts = {
    unread: notices.filter((n) => n.to === role && !n.read).length,
    pending: assets.filter((a) => a.status === "pending_review").length,
  };

  return (
    <nav aria-label={t("Primary")} className="flex flex-col gap-1">
      <p className={cn("px-3.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted", labelClassName)}>{t(WORKSPACE_LABEL[role])}</p>
      {navByRole[role].map((item) => {
        const active = isActive(item, pathname);
        const Icon = item.icon;
        const count = item.badge ? counts[item.badge] : 0;
        return (
          <Link
            key={item.label}
            href={item.href}
            title={t(item.label)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex h-11 items-center gap-3 rounded-lg border px-3.5 text-sm font-medium transition-colors duration-150",
              active
                ? "border-green-600 bg-white font-semibold text-green-700"
                : "border-transparent text-ink hover:border-green-600/40 hover:bg-green-50/40",
            )}
            onClick={onNavigate}
          >
            <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-green-600" : "text-ink-muted group-hover:text-green-600")} aria-hidden="true" />
            <span className={cn(labelClassName, "min-w-0 flex-1 truncate")}>{t(item.label)}</span>
            {count > 0 && (
              <span
                aria-label={item.badge === "pending" ? t("{n} pending", { n: count }) : t("{n} unread", { n: count })}
                className={cn("figure rounded-full bg-green-600 px-1.5 text-[11px] font-bold leading-5 text-white", labelClassName === "hidden xl:inline" && "absolute right-1.5 top-1.5 px-1 text-[10px] leading-4 xl:static xl:px-1.5 xl:text-[11px] xl:leading-5")}
              >
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
