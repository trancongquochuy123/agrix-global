"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { DemoSwitcher } from "@/components/demo/DemoSwitcher";
import { I18nSync } from "@/components/i18n/I18nSync";
import { DEMO_MODE } from "@/lib/demo/config";
import { portalOf } from "@/lib/demo/routes";
import { PortalShell } from "./PortalShell";
import { PublicShell } from "./PublicShell";
import { useT } from "@/lib/i18n/react";

/** Routes under /investor, /seller and /admin get the role workspace; everything else is the public site. */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const portal = portalOf(pathname);
  const t = useT();
  return (
    <>
      {portal ? <PortalShell role={portal}>{children}</PortalShell> : <PublicShell>{children}</PublicShell>}
      <I18nSync />
      <Toaster position="top-right" closeButton containerAriaLabel={t("Notifications")} toastOptions={{ classNames: { toast: "font-sans" } }} />
      {DEMO_MODE && <DemoSwitcher />}
    </>
  );
}
