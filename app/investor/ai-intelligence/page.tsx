import type { Metadata } from "next";
import { IntelligenceView } from "@/components/intelligence/IntelligenceView";

export const metadata: Metadata = { title: "AI Intelligence" };

export default function Page() {
  return <IntelligenceView />;
}
