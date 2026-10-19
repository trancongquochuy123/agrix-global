import type { Metadata } from "next";
import { SellerAssetEdit } from "@/components/seller/SellerAssetEdit";

export const metadata: Metadata = { title: "Edit asset" };
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ id: "VN-CF-001" }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SellerAssetEdit id={id} />;
}
