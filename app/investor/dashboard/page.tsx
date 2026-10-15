import type { Metadata } from "next";
import { InvestorDashboard } from "@/components/investor/InvestorDashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return <InvestorDashboard />;
}
