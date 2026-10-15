import type { Metadata } from "next";
import { RiskView } from "@/components/admin/RiskView";

export const metadata: Metadata = { title: "Risk Monitoring" };

export default function Page() {
  return <RiskView />;
}
