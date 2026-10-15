import type { Metadata } from "next";
import { SellerAssetDetail } from "@/components/seller/SellerAssetDetail";

export const metadata: Metadata = { title: "Asset" };
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ id: "VN-CF-001" }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SellerAssetDetail id={id} />;
}
