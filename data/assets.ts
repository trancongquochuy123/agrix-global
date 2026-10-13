import type { Asset, AssetDetail, AssetDocument, AssetCategory } from "@/types/asset";
import { IMAGES } from "./images";
import { categoryLabel } from "@/lib/categories";
import { profiles } from "./assetProfiles";

export const assets: Asset[] = [
  {
    id: "AGRIX-COF-0248",
    slug: "dak-lak-coffee-estate",
    name: "Dak Lak Coffee Estate",
    category: "coffee",
    location: "Dak Lak, Vietnam",
    province: "Dak Lak",
    areaHa: 320,
    targetYield: 8.9,
    risk: "Medium",
    fundedPct: 67,
    raisedUsd: 3_200_000,
    targetUsd: 4_800_000,
    image: IMAGES.coffee,
    imageFallback: "coffee",
    coords: [12.668, 108.05],
    verified: true,
  },
  {
    id: "AGRIX-RIC-0131",
    slug: "mekong-rice-cluster",
    name: "Mekong Rice Cluster",
    category: "rice",
    location: "An Giang, Vietnam",
    province: "An Giang",
    areaHa: 1250,
    targetYield: 7.4,
    risk: "Low",
    fundedPct: 52,
    raisedUsd: 6_500_000,
    targetUsd: 12_500_000,
    image: IMAGES.rice,
    imageFallback: "rice",
    coords: [10.52, 105.13],
    verified: true,
  },
  {
    id: "AGRIX-DUR-0087",
    slug: "lam-dong-durian-orchard",
    name: "Lam Dong Durian Orchard",
    category: "durian",
    location: "Lam Dong, Vietnam",
    province: "Lam Dong",
    areaHa: 480,
    targetYield: 10.2,
    risk: "Medium",
    fundedPct: 73,
    raisedUsd: 5_800_000,
    targetUsd: 8_000_000,
    image: IMAGES.durian,
    imageFallback: "durian",
    coords: [11.94, 108.44],
    verified: true,
  },
  {
    id: "AGRIX-CAR-0042",
    slug: "mangrove-carbon-project",
    name: "Mangrove Carbon Project",
    category: "carbon",
    location: "Ca Mau, Vietnam",
    province: "Ca Mau",
    areaHa: 2800,
    targetYield: 6.8,
    risk: "Low",
    fundedPct: 61,
    raisedUsd: 4_900_000,
    targetUsd: 8_000_000,
    image: IMAGES.mangrove,
    imageFallback: "carbon",
    coords: [9.17, 105.15],
    verified: true,
  },
  {
    id: "AGRIX-PEP-0119",
    slug: "gia-lai-pepper-farm",
    name: "Gia Lai Pepper Farm",
    category: "pepper",
    location: "Gia Lai, Vietnam",
    province: "Gia Lai",
    areaHa: 220,
    targetYield: 8.1,
    risk: "Medium",
    fundedPct: 47,
    raisedUsd: 2_800_000,
    targetUsd: 6_000_000,
    image: IMAGES.pepper,
    imageFallback: "pepper",
    coords: [13.98, 108.0],
    verified: true,
  },
  {
    id: "AGRIX-SOL-0063",
    slug: "solar-agri-hub",
    name: "Solar Agri Hub",
    category: "solar",
    location: "Ninh Thuan, Vietnam",
    province: "Ninh Thuan",
    areaHa: 410,
    targetYield: 7.9,
    risk: "Medium",
    fundedPct: 59,
    raisedUsd: 4_700_000,
    targetUsd: 8_000_000,
    image: IMAGES.solar,
    imageFallback: "solar",
    coords: [11.56, 108.99],
    verified: true,
  },
];

export const assetBySlug = (slug: string) => assets.find((a) => a.slug === slug);

export const locationOptions = ["All locations", ...Array.from(new Set(assets.map((a) => a.province)))];
export const riskOptions = ["Any risk", "Low", "Medium", "High"] as const;
export const yieldOptions = [
  { value: "any", label: "Any yield" },
  { value: "6", label: "6% and above" },
  { value: "8", label: "8% and above" },
  { value: "10", label: "10% and above" },
] as const;

/* ----------------------------- Dak Lak detail ----------------------------- */

const valuationFactorsCoffee = [
  { label: "Regional price index", impact: "+3.1%" },
  { label: "Yield forecast revision", impact: "+1.8%" },
  { label: "Comparable transactions", impact: "+0.9%" },
  { label: "Input cost inflation", impact: "-1.4%" },
];

const dakLakDetail: AssetDetail = {
  slug: "dak-lak-coffee-estate",
  assetCode: "AGRIX-COF-0248",
  breadcrumbCategory: "Coffee",
  profile: "Arabica & Robusta estate · Central Highlands",
  waterLabel: "Irrigation reservoir",
  valuationFactors: valuationFactorsCoffee,
  documents: [],
  town: "Buon Ma Thuot, Vietnam",
  assetValueUsd: 4_800_000,
  termMonths: 48,
  riskScore: 24,
  raisedUsd: 3_200_000,
  raiseTargetUsd: 4_800_000,
  investors: 186,
  daysRemaining: 28,
  minInvestmentUsd: 10_000,
  boundary: [
    [12.678, 108.042],
    [12.68, 108.05],
    [12.677, 108.059],
    [12.67, 108.064],
    [12.662, 108.062],
    [12.657, 108.054],
    [12.658, 108.045],
    [12.664, 108.04],
  ],
  plantations: [
    [[12.677, 108.045], [12.678, 108.052], [12.671, 108.053], [12.669, 108.046]],
    [[12.676, 108.054], [12.6755, 108.06], [12.67, 108.061], [12.67, 108.0545]],
    [[12.666, 108.047], [12.667, 108.06], [12.661, 108.059], [12.66, 108.048]],
  ],
  water: { center: [12.6592, 108.0522], radiusM: 80 },
  roads: [
    [[12.664, 108.04], [12.667, 108.05], [12.67, 108.064]],
    [[12.68, 108.05], [12.669, 108.051], [12.657, 108.054]],
  ],
  facilities: [
    { name: "Processing facility", position: [12.6735, 108.0535] },
    { name: "Storage warehouse", position: [12.6648, 108.0555] },
    { name: "Estate office", position: [12.67, 108.048] },
  ],
  production: [
    { year: "2024", arabica: 1300, robusta: 2300 },
    { year: "2025", arabica: 1900, robusta: 2400 },
    { year: "2026", arabica: 2200, robusta: 2700 },
    { year: "2027", arabica: 2400, robusta: 2900 },
    { year: "2028", arabica: 2700, robusta: 3100 },
    { year: "2029", arabica: 2900, robusta: 3000 },
    { year: "2030", arabica: 3100, robusta: 2900 },
    { year: "2031", arabica: 3100, robusta: 2900 },
    { year: "2032", arabica: 3200, robusta: 2800 },
    { year: "2033", arabica: 3200, robusta: 2800 },
  ],
  drivers: [
    { id: "d1", label: "Premium growing region", description: "High elevation, ideal climate", impactPct: 22, icon: "mountain" },
    { id: "d2", label: "Strong historical yields", description: "5.1 t/ha 10-year average", impactPct: 18, icon: "sprout" },
    { id: "d3", label: "Export market demand", description: "Growing Asia and EU demand", impactPct: 15, icon: "globe" },
    { id: "d4", label: "ESG certification potential", description: "Supports valuation premium", impactPct: 12, icon: "leaf" },
  ],
  verification: [
    { id: "v1", label: "Land title verified", date: "Jan 12, 2024" },
    { id: "v2", label: "Boundary confirmed", date: "Jan 18, 2024" },
    { id: "v3", label: "Ownership structure checked", date: "Jan 24, 2024" },
    { id: "v4", label: "Regulatory compliance", date: "Feb 2, 2024" },
  ],
  sustainability: [
    { id: "s1", value: "2,350 ha", label: "Certified sustainable farming", icon: "sprout" },
    { id: "s2", value: "-42%", label: "Lower emissions vs. regional average", icon: "co2" },
    { id: "s3", value: "1.8M", label: "Trees under conservation", icon: "trees" },
    { id: "s4", value: "28%", label: "Improved water efficiency (5 years)", icon: "water" },
  ],
  riskFactors: [
    { id: "r1", label: "Climate & weather", score: 22, level: "Low", note: "Stable highland rainfall; drought buffer from on-site reservoirs." },
    { id: "r2", label: "Market price volatility", score: 38, level: "Medium", note: "Arabica/Robusta spot exposure partly hedged by forward offtake contracts." },
    { id: "r3", label: "Operational execution", score: 27, level: "Low", note: "Experienced estate operator with 14-year track record." },
    { id: "r4", label: "Legal & title", score: 12, level: "Low", note: "Land-use right certificate verified against provincial registry." },
    { id: "r5", label: "Pest & disease", score: 31, level: "Medium", note: "Coffee berry borer monitoring active; integrated pest management in place." },
  ],
  activity: [
    { id: "a1", title: "Funding milestone reached", detail: "67% of the $4.8M target is now committed.", date: "Oct 9, 2026", kind: "funding" },
    { id: "a2", title: "AI valuation refreshed", detail: "Base case revised to $4.8M (+1.9%) after harvest data update.", date: "Oct 2, 2026", kind: "model" },
    { id: "a3", title: "Quarterly operator report uploaded", detail: "Q3 harvest, cost and certification update.", date: "Sep 28, 2026", kind: "document" },
    { id: "a4", title: "Satellite verification completed", detail: "Boundary and canopy cover matched the registered survey.", date: "Sep 14, 2026", kind: "verification" },
    { id: "a5", title: "Regulatory compliance confirmed", detail: "Provincial agricultural authority sign-off.", date: "Feb 2, 2024", kind: "verification" },
  ],
  comparables: [
    { name: "Dak Nong Arabica Estate", location: "Dak Nong", valuePerHa: 14_200, yieldPct: 8.4 },
    { name: "Buon Ma Thuot Robusta Farm", location: "Dak Lak", valuePerHa: 15_800, yieldPct: 9.1 },
    { name: "Cu M'gar Mixed Estate", location: "Dak Lak", valuePerHa: 13_900, yieldPct: 8.2 },
  ],
  valuationRange: { low: 4_350_000, base: 4_800_000, high: 5_250_000 },
};

export function getAssetDetail(slug: string): AssetDetail | undefined {
  if (slug === dakLakDetail.slug) return { ...dakLakDetail, documents: assetDocuments };
  const asset = assetBySlug(slug);
  if (!asset) return undefined;
  if (asset.category === "coffee") return { ...dakLakDetail, documents: assetDocuments, slug: asset.slug, assetCode: asset.id };
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
  const years = dakLakDetail.production.map((p) => p.year);
  const targetM = `$${(asset.targetUsd / 1e6).toFixed(1)}M`;

  return {
    ...dakLakDetail,
    slug: asset.slug,
    assetCode: asset.id,
    breadcrumbCategory: categoryLabel(asset.category),
    profile: prof.profile,
    waterLabel: prof.waterLabel,
    town: asset.location,
    assetValueUsd: asset.targetUsd,
    termMonths: prof.termMonths,
    minInvestmentUsd: prof.minInvestmentUsd,
    daysRemaining: prof.daysRemaining,
    raisedUsd: asset.raisedUsd,
    raiseTargetUsd: asset.targetUsd,
    investors: Math.round(asset.raisedUsd / (prof.minInvestmentUsd * 2.4)),
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
      arabica: Math.round(prof.production.a[i] * scale),
      robusta: Math.round(prof.production.b[i] * scale),
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
      low: Math.round(asset.targetUsd * 0.91),
      base: asset.targetUsd,
      high: Math.round(asset.targetUsd * 1.09),
    },
  };
}

/* -------------------------------- Documents -------------------------------- */

export const assetDocuments: AssetDocument[] = [
  { id: "doc1", name: "Land Title Certificate", fileType: "PDF", size: "4.2 MB", date: "Jan 12, 2024", category: "Legal" },
  { id: "doc2", name: "Property Survey & Boundary Map", fileType: "PDF", size: "6.8 MB", date: "Jan 18, 2024", category: "Survey" },
  { id: "doc3", name: "Environmental Impact Assessment", fileType: "PDF", size: "3.1 MB", date: "Jan 25, 2024", category: "Environmental" },
  { id: "doc4", name: "Ownership Structure Memorandum", fileType: "PDF", size: "1.4 MB", date: "Jan 24, 2024", category: "Legal" },
  { id: "doc5", name: "Regulatory Compliance Certificate", fileType: "PDF", size: "0.9 MB", date: "Feb 2, 2024", category: "Legal" },
  { id: "doc6", name: "Soil & Water Analysis", fileType: "PDF", size: "2.7 MB", date: "Feb 9, 2024", category: "Environmental" },
  { id: "doc7", name: "Five-Year Operating Budget", fileType: "XLSX", size: "0.6 MB", date: "Feb 14, 2024", category: "Financial" },
  { id: "doc8", name: "Historical Yield Ledger (2014–2023)", fileType: "XLSX", size: "1.1 MB", date: "Feb 14, 2024", category: "Operations" },
  { id: "doc9", name: "Offtake Agreement Summary", fileType: "PDF", size: "2.2 MB", date: "Mar 1, 2024", category: "Financial" },
  { id: "doc10", name: "Boundary Coordinates (KML)", fileType: "KML", size: "0.1 MB", date: "Jan 18, 2024", category: "Survey" },
  { id: "doc11", name: "Sustainability Certification Pack", fileType: "PDF", size: "5.3 MB", date: "Mar 12, 2024", category: "Environmental" },
  { id: "doc12", name: "Independent Valuation Report", fileType: "PDF", size: "3.8 MB", date: "Mar 20, 2024", category: "Financial" },
];

