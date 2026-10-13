"use client";

import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/navigation/Sidebar";
import { MobileNavigation } from "@/components/navigation/MobileNavigation";
import { Header } from "./Header";

export function AppShell({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-pop"
      >
        Skip to content
      </a>
      <Sidebar expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
      <MobileNavigation open={mobileOpen} onOpenChange={setMobileOpen} />
      <div className="md:pl-[72px] xl:pl-60">
        <Header onOpenMobileNav={() => setMobileOpen(true)} />
        <main id="main" className="mx-auto max-w-[1400px] px-4 pb-24 pt-5 sm:px-6 sm:pt-6 md:pb-10 xl:px-8">
          {children}
        </main>
      </div>
      <Toaster position="top-right" closeButton toastOptions={{ classNames: { toast: "font-sans" } }} />
    </div>
  );
}
