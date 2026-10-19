"use client";

import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Logo } from "@/components/shared/Logo";
import { NavList } from "./NavList";
import { homeOf } from "@/lib/demo/routes";
import type { Role } from "@/lib/demo/types";
import { SidebarFooter } from "./SidebarFooter";
import { useT } from "@/lib/i18n/react";

export function MobileNavigation({ role, open, onOpenChange }: { role: Role; open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useT();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="drawer" className="flex flex-col bg-white text-ink">
        <DialogTitle className="sr-only">{t("Main navigation")}</DialogTitle>
        <DialogDescription className="sr-only">{t("Navigate between AGRIX sections")}</DialogDescription>
        <div className="flex h-16 shrink-0 items-center px-4">
          <Link href={homeOf(role)} onClick={() => onOpenChange(false)} aria-label={t("AGRIX home")}>
            <Logo tone="dark" />
          </Link>
        </div>
        <div className="px-3 pt-2">
          <NavList role={role} onNavigate={() => onOpenChange(false)} />
        </div>
        <SidebarFooter />
      </DialogContent>
    </Dialog>
  );
}
