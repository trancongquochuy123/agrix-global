"use client";

import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Logo } from "@/components/shared/Logo";
import { NavList } from "./NavList";
import { SidebarFooter } from "./SidebarFooter";

export function MobileNavigation({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="drawer" className="flex flex-col bg-white text-ink">
        <DialogTitle className="sr-only">Main navigation</DialogTitle>
        <DialogDescription className="sr-only">Navigate between AGRIX sections</DialogDescription>
        <div className="flex h-16 shrink-0 items-center px-4">
          <Link href="/dashboard" onClick={() => onOpenChange(false)} aria-label="AGRIX home">
            <Logo tone="dark" />
          </Link>
        </div>
        <div className="px-3 pt-2">
          <NavList onNavigate={() => onOpenChange(false)} />
        </div>
        <SidebarFooter />
      </DialogContent>
    </Dialog>
  );
}
