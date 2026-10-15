"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MobileNavigation } from "@/components/navigation/MobileNavigation";
import { Sidebar } from "@/components/navigation/Sidebar";
import { Skeleton } from "@/components/shared/SkeletonLoader";
import { useHydrated, useSession } from "@/lib/demo/hooks";
import { homeOf } from "@/lib/demo/routes";
import type { Role } from "@/lib/demo/types";
import { Header } from "./Header";

function ShellSkeleton() {
  return (
    <div role="status" aria-label="Loading workspace" className="min-h-screen md:pl-[72px] xl:pl-60">
      <div className="h-16 border-b border-line" />
      <div className="mx-auto max-w-[1400px] space-y-5 px-4 pt-6 sm:px-6 xl:px-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-card" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-card" />
      </div>
    </div>
  );
}

/**
 * Role workspace chrome. Access is a frontend convenience only: a visitor without a demo session is sent to
 * the login page, and a session for another role is sent to its own workspace.
 */
export function PortalShell({ role, children }: { role: Role; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const session = useSession();
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!session) router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
    else if (session.role !== role) router.replace(homeOf(session.role));
  }, [hydrated, session, role, pathname, router]);

  if (!hydrated || !session || session.role !== role) return <ShellSkeleton />;

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-pop"
      >
        Skip to content
      </a>
      <Sidebar role={role} expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
      <MobileNavigation role={role} open={mobileOpen} onOpenChange={setMobileOpen} />
      <div className="md:pl-[72px] xl:pl-60">
        <Header role={role} onOpenMobileNav={() => setMobileOpen(true)} />
        <main id="main" className="mx-auto max-w-[1400px] px-4 pb-24 pt-5 sm:px-6 sm:pt-6 md:pb-10 xl:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
