import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AssetDetailView } from "@/components/marketplace/detail/AssetDetailView";
import { assetBySlug, assets } from "@/data/assets";

export function generateStaticParams() {
  return assets.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const asset = assetBySlug(slug);
  return { title: asset ? asset.name : "Asset not found" };
}

export default async function AssetDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!assetBySlug(slug)) notFound();
  return <AssetDetailView slug={slug} />;
}
