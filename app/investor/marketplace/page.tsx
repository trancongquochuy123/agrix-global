import type { Metadata } from "next";
import { MarketplaceView } from "@/components/marketplace/MarketplaceView";

export const metadata: Metadata = { title: "Explore Opportunities" };

export default function Page() {
  return <MarketplaceView basePath="/investor/marketplace" subtitle="Explore agricultural financing opportunities approved on AGRIX." />;
}
