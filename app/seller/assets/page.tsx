import type { Metadata } from "next";
import { SellerAssetsView } from "@/components/seller/SellerAssetsView";

export const metadata: Metadata = { title: "My Assets" };

export default function Page() {
  return <SellerAssetsView />;
}
