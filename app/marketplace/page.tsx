import type { Metadata } from "next";
import { MarketplaceView } from "@/components/marketplace/MarketplaceView";

export const metadata: Metadata = { title: "Asset Marketplace" };

export default function MarketplacePage() {
  return <MarketplaceView />;
}
