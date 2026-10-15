"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { DemoSwitcher } from "@/components/demo/DemoSwitcher";
import { DEMO_MODE } from "@/lib/demo/config";
import { portalOf } from "@/lib/demo/routes";
import { PortalShell } from "./PortalShell";
import { PublicShell } from "./PublicShell";

/** Routes under /investor, /seller and /admin get the role workspace; everything else is the public site. */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const portal = portalOf(pathname);
  return (
    <>
      {portal ? <PortalShell role={portal}>{children}</PortalShell> : <PublicShell>{children}</PublicShell>}
      <Toaster position="top-right" closeButton toastOptions={{ classNames: { toast: "font-sans" } }} />
      {DEMO_MODE && <DemoSwitcher />}
    </>
  );
}
