import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/manrope";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: { default: "AGRIX — Real Assets. Real Intelligence. Global Capital.", template: "%s · AGRIX" },
  description:
    "AI-powered platform for verified agricultural real-world assets: discover, register, monitor and invest with institutional-grade transparency.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B241D",
};

/**
 * Runs before first paint: applies the stored language to <html lang> and, when it is not the English the page was
 * pre-rendered in, hides the page until React has switched the text (I18nSync removes the guard; a timeout is the
 * safety net if scripts fail). Uses the same storage key as public/landing.html.
 */
const LANG_BOOT = `(function(){try{var d=document.documentElement,l=null;try{l=localStorage.getItem('agrix:lang')}catch(e){}if(l!=='vi'&&l!=='en'){l=(navigator.language||'').toLowerCase().indexOf('vi')===0?'vi':'en'}d.lang=l;if(l!=='en'){d.setAttribute('data-i18n-pending','');setTimeout(function(){d.removeAttribute('data-i18n-pending')},2500)}}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LANG_BOOT }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
