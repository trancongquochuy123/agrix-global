import type { AssetCategory } from "@/types/asset";

/**
 * Cover photography per asset category — real photographs from Unsplash (free under the Unsplash License,
 * hot-linking is permitted). Every consumer renders through <SafeImage>, which falls back to a designed
 * placeholder if a photo fails to load. To self-host instead, save the files under /public/images/assets
 * and point the paths below at them.
 *
 * Credits: rice — Nguyen The Hung (Sapa, Vietnam) · palm oil — Malaysia oil palm harvest ·
 * soybean — Hannah Shedrow · coffee — Chalo Garcia (Costa Rica) · cocoa — David Clode ·
 * pepper — Praswin Prakashan (Kerala, India).
 */
const photo = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=75`;

export const IMAGES: Record<AssetCategory | "highlands", string> = {
  coffee: photo("1576758597367-2840b9dc1a2b"),
  rice: photo("1649531437455-c2f42105650f"),
  palmoil: photo("1628713287929-80bdbfb3689d"),
  soybean: photo("1719846923269-6fdf75444cb8"),
  cocoa: photo("1720170723453-dd9de7397bd7"),
  pepper: photo("1706707250965-1a0455b67fec"),
  highlands: photo("1576758597367-2840b9dc1a2b"),
};

/** Local, low-resolution photos from the brand kit used for small decorative thumbnails. */
export const LOCAL_IMAGES = {
  landscape: "/images/hero-landscape.jpg",
  coffee: "/images/category-coffee.jpg",
  rice: "/images/category-rice.jpg",
  carbon: "/images/category-carbon.jpg",
  forest: "/images/category-forest.jpg",
};
