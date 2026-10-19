"use client";

import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Logo, LogoMark } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";
import { homeOf } from "@/lib/demo/routes";
import type { Role } from "@/lib/demo/types";
import { NavList } from "./NavList";
import { useT } from "@/lib/i18n/react";
import { SidebarFooter } from "./SidebarFooter";

/** Fixed on desktop (xl), icon rail on tablet that expands as an overlay, hidden on mobile. */
export function Sidebar({ role, expanded, onToggle }: { role: Role; expanded: boolean; onToggle: () => void }) {
  const t = useT();
  return (
    <>
      {expanded && (
        <button
          type="button"
          aria-label={t("Collapse sidebar")}
          onClick={onToggle}
          className="fixed inset-0 z-30 hidden bg-forest-950/30 md:block xl:hidden"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col overflow-hidden border-r border-line bg-white text-ink transition-[width] duration-200 ease-out md:flex",
          expanded ? "w-60 shadow-pop" : "w-[72px] xl:w-60",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-4">
          <Link href={homeOf(role)} aria-label={t("AGRIX home")} className="flex items-center">
            <span className={cn(expanded ? "hidden" : "block xl:hidden")}>
              <LogoMark />
            </span>
            <span className={cn(expanded ? "block" : "hidden xl:block")}>
              <Logo tone="dark" />
            </span>
          </Link>
          <button
            type="button"
            onClick={onToggle}
            aria-label={expanded ? t("Collapse sidebar") : t("Expand sidebar")}
            className={cn(
              "rounded-md p-1.5 text-ink-muted transition-colors hover:bg-green-50 hover:text-ink xl:hidden",
              !expanded && "hidden",
            )}
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
        {!expanded && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={t("Expand sidebar")}
            className="mx-auto mb-1 rounded-md p-1.5 text-ink-muted transition-colors hover:bg-green-50 hover:text-ink xl:hidden"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}
        <div className="px-3 pt-2">
          <NavList role={role} labelClassName={expanded ? "inline" : "hidden xl:inline"} onNavigate={expanded ? onToggle : undefined} />
        </div>
        <div className={cn("mt-auto", expanded ? "block" : "hidden xl:block")}>
          <SidebarFooter />
        </div>
        <div className={cn("mt-auto pb-3", expanded ? "hidden" : "block xl:hidden")}>
          <SidebarFooter showCard={false} showUserText={false} />
        </div>
      </aside>
    </>
  );
}
