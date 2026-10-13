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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
