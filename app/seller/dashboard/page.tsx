import type { Metadata } from "next";
import { SellerDashboard } from "@/components/seller/SellerDashboard";

export const metadata: Metadata = { title: "Seller Dashboard" };

export default function Page() {
  return <SellerDashboard />;
}
