import type { Asset, AssetCategory, AssetDetail, AssetStatus } from "@/types/asset";
import { IMAGES } from "./images";
import { categoryLabel } from "@/lib/categories";
import { profiles } from "./assetProfiles";

export const OWNER = {
  seller: { id: "u-seller", name: "Highland Agri Co." },
  rice: { id: "u-s2", name: "Mekong Rice Cooperative" },
  palm: { id: "u-s3", name: "Riau Plantation Ltd." },
  soy: { id: "u-s4", name: "Cerrado Grain Farms" },
  cocoa: { id: "u-s5", name: "Kumasi Cocoa Co-op" },
} as const;

export const COFFEE_ID = "VN-CF-001";
export const COFFEE_SLUG = "vietnam-robusta-coffee";

export const pctFunded = (raised: number, target: number) => (target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0);

/** Fields every listing carries regardless of how it was created. */
function make(a: Omit<Asset, "fundedPct" | "image" | "imageFallback" | "uploads" | "createdAt"> & Partial<Pick<Asset, "uploads" | "createdAt">>): Asset {
  return {
    uploads: [],
    createdAt: "2026-08-01T09:00:00.000Z",
    ...a,
    fundedPct: pctFunded(a.raisedUsd, a.targetUsd),
    image: IMAGES[a.category],
    imageFallback: a.category,
  };
}

/** The featured scenario asset. Its status/raised amount depend on the scenario. */
export function coffeeAsset(status: AssetStatus, raisedUsd = 0, investors = 0, now = "2026-10-13T08:00:00.000Z"): Asset {
  return make({
    id: COFFEE_ID,
    slug: COFFEE_SLUG,
    name: "Vietnam Robusta Coffee",
    category: "coffee",
    location: "Dak Lak, Vietnam",
    province: "Dak Lak",
    country: "Vietnam",
    areaHa: 40,
    targetYield: 8,
    risk: "Medium",
    raisedUsd,
    targetUsd: 350_000,
    assetValueUsd: 500_000,
    termMonths: 6,
    minInvestmentUsd: 1_000,
    investors,
    coords: [12.668, 108.05],
    description:
      "Working capital financing for the upcoming Robusta harvest on a 40-hectare smallholder estate near Buon Ma Thuot. Proceeds fund picking labour, drying and storage ahead of a forward offtake sale to a regional exporter.",
    ownerId: OWNER.seller.id,
    ownerName: OWNER.seller.name,
    status,
    createdAt: now,
    submittedAt: now,
    reviewedAt: status === "published" ? now : undefined,
    reviewNote: status === "published" ? "Documents consistent with registry extract. Approved for listing (simulated review)." : undefined,
    uploads: [
      { name: "Land-Use-Right-Certificate.pdf", sizeKb: 4300 },
      { name: "Boundary-Survey-Map.pdf", sizeKb: 6900 },
      { name: "Offtake-Agreement-Summary.pdf", sizeKb: 2250 },
    ],
  });
}

/** Marketplace listings that exist in every scenario. */
export const baseAssets: Asset[] = [
  make({
    id: "VN-RC-002",
    slug: "vietnamese-rice",
    name: "Vietnamese Rice",
    category: "rice",
    location: "An Giang, Vietnam",
    province: "An Giang",
    country: "Vietnam",
    areaHa: 150,
    targetYield: 7.2,
    risk: "Low",
    raisedUsd: 520_000,
    targetUsd: 800_000,
    assetValueUsd: 1_200_000,
    termMonths: 9,
    minInvestmentUsd: 1_000,
    investors: 64,
    coords: [10.52, 105.13],
    description:
      "Seasonal financing for a double-crop paddy cluster in the Mekong Delta, backed by an export offtake contract for premium fragrant rice.",
    ownerId: OWNER.rice.id,
    ownerName: OWNER.rice.name,
    status: "published",
    createdAt: "2026-07-10T09:00:00.000Z",
  }),
  make({
    id: "ID-PO-003",
    slug: "indonesian-palm-oil",
    name: "Indonesian Palm Oil",
    category: "palmoil",
    location: "Riau, Indonesia",
    province: "Riau",
    country: "Indonesia",
    areaHa: 600,
    targetYield: 9,
    risk: "Medium",
    raisedUsd: 870_000,
    targetUsd: 1_500_000,
    assetValueUsd: 2_400_000,
    termMonths: 12,
    minInvestmentUsd: 1_000,
    investors: 112,
    coords: [0.51, 101.45],
    description: "Replanting and mill upgrade financing for a mature oil palm plantation with an on-site 30 t/h mill and a crude palm oil off-take contract.",
    ownerId: OWNER.palm.id,
    ownerName: OWNER.palm.name,
    status: "published",
    createdAt: "2026-06-22T09:00:00.000Z",
  }),
  make({
    id: "BR-SB-004",
    slug: "brazilian-soybeans",
    name: "Brazilian Soybeans",
    category: "soybean",
    location: "Mato Grosso, Brazil",
    province: "Mato Grosso",
    country: "Brazil",
    areaHa: 900,
    targetYield: 8.5,
    risk: "Medium",
    raisedUsd: 410_000,
    targetUsd: 1_000_000,
    assetValueUsd: 1_800_000,
    termMonths: 8,
    minInvestmentUsd: 1_000,
    investors: 47,
    coords: [-12.55, -55.72],
    description: "Season input and logistics financing for a mechanised soybean and maize rotation farm with a contracted grain trader.",
    ownerId: OWNER.soy.id,
    ownerName: OWNER.soy.name,
    status: "published",
    createdAt: "2026-07-28T09:00:00.000Z",
  }),
  make({
    id: "GH-CC-005",
    slug: "ghana-cocoa",
    name: "Ghana Cocoa",
    category: "cocoa",
    location: "Ashanti Region, Ghana",
    province: "Ashanti",
    country: "Ghana",
    areaHa: 320,
    targetYield: 9.5,
    risk: "Medium",
    raisedUsd: 315_000,
    targetUsd: 600_000,
    assetValueUsd: 900_000,
    termMonths: 12,
    minInvestmentUsd: 1_000,
    investors: 39,
    coords: [6.7, -1.62],
    description: "Pre-harvest financing for a shade-grown cocoa cooperative with farm-level traceability and a European buyer agreement.",
    ownerId: OWNER.cocoa.id,
    ownerName: OWNER.cocoa.name,
    status: "published",
    createdAt: "2026-08-14T09:00:00.000Z",
  }),
  make({
    id: "VN-BP-006",
    slug: "vietnamese-black-pepper",
    name: "Vietnamese Black Pepper",
    category: "pepper",
    location: "Gia Lai, Vietnam",
    province: "Gia Lai",
    country: "Vietnam",
    areaHa: 60,
    targetYield: 7.8,
    risk: "Medium",
    raisedUsd: 268_000,
    targetUsd: 400_000,
    assetValueUsd: 650_000,
    termMonths: 6,
    minInvestmentUsd: 1_000,
    investors: 31,
    coords: [13.98, 108.0],
    description: "Harvest and drying-yard financing for a black pepper farm with premium-grade (550 g/L) output sold under a spice offtake agreement.",
    ownerId: OWNER.seller.id,
    ownerName: OWNER.seller.name,
    status: "published",
    createdAt: "2026-08-30T09:00:00.000Z",
  }),
];

/** Every listing the app knows about statically (used by screens that don't read live state). */
export const knownAssets: Asset[] = [coffeeAsset("published"), ...baseAssets];

export const riskOptions = ["Any risk", "Low", "Medium", "High"] as const;
export const yieldOptions = [
  { value: "any", label: "Any yield" },
  { value: "6", label: "6% and above" },
  { value: "8", label: "8% and above" },
  { value: "10", label: "10% and above" },
] as const;

export const locationOptionsFor = (list: Asset[]) => ["All locations", ...Array.from(new Set(list.map((a) => a.province)))];

/* ------------------------------ Detail builder ------------------------------ */

export function getAssetDetail(asset: Asset): AssetDetail {
  const prof = profiles[asset.category];
  const [lat, lng] = asset.coords;
  const r = Math.min(0.016, 0.004 + Math.sqrt(asset.areaHa) * 0.00035);
  const ring = (scale: number, shift: [number, number] = [0, 0]): [number, number][] =>
    Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const wobble = 1 + 0.18 * Math.sin(i * 2.3 + asset.areaHa);
      return [lat + shift[0] + Math.sin(angle) * r * scale * wobble, lng + shift[1] + Math.cos(angle) * r * scale * wobble * 1.1];
    });

  const scale = asset.areaHa / 1000;
  const years = ["2026", "2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034", "2035"];
  const targetM = asset.targetUsd >= 1e6 ? `$${(asset.targetUsd / 1e6).toFixed(1)}M` : `$${Math.round(asset.targetUsd / 1e3)}K`;

  return {
    slug: asset.slug,
    assetCode: asset.id,
    breadcrumbCategory: categoryLabel(asset.category),
    profile: prof.profile,
    waterLabel: prof.waterLabel,
    town: asset.location,
    assetValueUsd: asset.assetValueUsd,
    termMonths: asset.termMonths,
    minInvestmentUsd: asset.minInvestmentUsd,
    daysRemaining: prof.daysRemaining,
    raisedUsd: asset.raisedUsd,
    raiseTargetUsd: asset.targetUsd,
    investors: asset.investors,
    riskScore: asset.risk === "Low" ? 18 : asset.risk === "Medium" ? 31 : 52,
    boundary: ring(1),
    plantations: [ring(0.55, [r * 0.25, -r * 0.2]), ring(0.4, [-r * 0.3, r * 0.35])],
    water: { center: [lat - r * 0.55, lng + r * 0.1], radiusM: 70 },
    roads: [[[lat - r, lng - r * 1.2], [lat, lng], [lat + r, lng + r * 1.2]]],
    facilities: [
      { name: prof.facilities[0], position: [lat + r * 0.1, lng - r * 0.1] },
      { name: prof.facilities[1], position: [lat - r * 0.2, lng + r * 0.4] },
    ],
    production: years.map((year, i) => ({
      year,
      arabica: Math.round(prof.production.a[i] * Math.max(scale, 0.02)),
      robusta: Math.round(prof.production.b[i] * Math.max(scale, 0.02)),
    })),
    drivers: prof.drivers,
    verification: prof.verification,
    sustainability: prof.sustainability(asset.areaHa),
    riskFactors: prof.riskFactors,
    activity: prof.activity(asset.name, targetM, asset.fundedPct),
    comparables: prof.comparables,
    valuationFactors: prof.valuationFactors,
    documents: prof.documents,
    valuationRange: {
      low: Math.round(asset.assetValueUsd * 0.91),
      base: asset.assetValueUsd,
      high: Math.round(asset.assetValueUsd * 1.09),
    },
  };
}

export const knownAssetBySlug = (slug: string) => knownAssets.find((a) => a.slug === slug);
export const categoryOfSlug = (slug: string): AssetCategory | undefined => knownAssetBySlug(slug)?.category;
