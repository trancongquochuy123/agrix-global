import type { Metadata } from "next";
import { AssetDetailView } from "@/components/marketplace/detail/AssetDetailView";
import { knownAssetBySlug, knownAssets } from "@/data/assets";

export function generateStaticParams() {
  return knownAssets.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: knownAssetBySlug(slug)?.name ?? "Asset" };
}

/** Listings created in the demo have runtime slugs, so existence is resolved from the shared store on the client. */
export default async function AssetDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AssetDetailView slug={slug} basePath="/marketplace" />;
}
