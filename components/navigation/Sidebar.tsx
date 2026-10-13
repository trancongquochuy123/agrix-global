"use client";

import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Logo, LogoMark } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";
import { NavList } from "./NavList";
import { SidebarFooter } from "./SidebarFooter";

/** Fixed on desktop (xl), icon rail on tablet that expands as an overlay, hidden on mobile. */
export function Sidebar({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  return (
    <>
      {expanded && (
        <button
          type="button"
          aria-label="Collapse sidebar"
          onClick={onToggle}
          className="fixed inset-0 z-30 hidden bg-forest-950/40 md:block xl:hidden"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col overflow-hidden bg-forest-900 text-white transition-[width] duration-200 ease-out md:flex",
          expanded ? "w-60 shadow-pop" : "w-[72px] xl:w-60",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" aria-label="AGRIX home" className="flex items-center">
            <span className={cn(expanded ? "hidden" : "block xl:hidden")}>
              <LogoMark />
            </span>
            <span className={cn(expanded ? "block" : "hidden xl:block")}>
              <Logo />
            </span>
          </Link>
          <button
            type="button"
            onClick={onToggle}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            className={cn(
              "rounded-md p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white xl:hidden",
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
            aria-label="Expand sidebar"
            className="mx-auto mb-1 rounded-md p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white xl:hidden"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}
        <div className="px-3 pt-2">
          <NavList labelClassName={expanded ? "inline" : "hidden xl:inline"} onNavigate={expanded ? onToggle : undefined} />
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
