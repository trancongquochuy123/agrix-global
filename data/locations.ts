import { CATEGORIES } from "@/lib/categories";
import type { MapLocation } from "@/types/intelligence";

export const VIETNAM_CENTER: [number, number] = [14.6, 107.2];

/** Simplified Vietnam outline as [lat, lng] used for the location inset map. */
export const VIETNAM_OUTLINE: [number, number][] = [
  [22.4, 102.1], [22.5, 103.0], [22.8, 104.0], [23.3, 105.3], [22.9, 106.7], [21.6, 107.9],
  [20.8, 107.0], [20.7, 106.7], [19.7, 105.9], [18.8, 105.7], [17.8, 106.4], [16.9, 107.1],
  [16.1, 108.2], [15.2, 108.9], [13.7, 109.3], [12.7, 109.2], [11.8, 109.4], [11.2, 108.9],
  [10.5, 107.8], [10.4, 107.0], [9.8, 106.7], [9.4, 106.0], [8.7, 105.2], [8.6, 104.8],
  [9.5, 105.0], [10.2, 105.1], [10.4, 104.4], [11.0, 105.0], [11.8, 106.0], [12.2, 106.9],
  [13.0, 107.5], [14.5, 107.5], [15.3, 106.5], [16.0, 105.8], [17.5, 105.0], [18.8, 104.2],
  [19.8, 104.6], [20.6, 103.8], [21.2, 103.0],
];

export const mapLocations: MapLocation[] = [
  // Central Highlands
  { id: "m1", name: "Highland Coffee Estate", region: "Central Highlands", category: "coffee", position: [11.94, 108.44], valueUsd: 12_500_000, areaHa: 640, status: "Verified" },
  { id: "m2", name: "Dak Lak Coffee Estate", region: "Central Highlands", category: "coffee", position: [12.668, 108.05], valueUsd: 4_800_000, areaHa: 320, status: "Verified" },
  { id: "m3", name: "Dak Nong Arabica Estate", region: "Central Highlands", category: "coffee", position: [12.0, 107.69], valueUsd: 6_200_000, areaHa: 410, status: "Verified" },
  { id: "m4", name: "Lam Dong Pepper Orchard", region: "Central Highlands", category: "pepper", position: [11.6, 108.1], valueUsd: 10_200_000, areaHa: 480, status: "Verified" },
  { id: "m5", name: "Gia Lai Coffee Terraces", region: "Central Highlands", category: "coffee", position: [13.98, 108.0], valueUsd: 3_900_000, areaHa: 220, status: "In Review" },
  { id: "m6", name: "Kon Tum Pepper Estate", region: "Central Highlands", category: "pepper", position: [14.35, 108.0], valueUsd: 5_100_000, areaHa: 260, status: "Verified" },
  { id: "m7", name: "Dak Mil Coffee Cooperative", region: "Central Highlands", category: "coffee", position: [12.45, 107.6], valueUsd: 2_700_000, areaHa: 150, status: "Verified" },
  // Mekong Delta
  { id: "m8", name: "Mekong Rice Cluster", region: "Mekong Delta", category: "rice", position: [10.52, 105.13], valueUsd: 8_700_000, areaHa: 1250, status: "Verified" },
  { id: "m9", name: "Mekong Cocoa Project", region: "Mekong Delta", category: "cocoa", position: [9.17, 105.15], valueUsd: 15_400_000, areaHa: 2800, status: "Verified" },
  { id: "m10", name: "Can Tho Rice Co-op", region: "Mekong Delta", category: "rice", position: [10.03, 105.78], valueUsd: 5_300_000, areaHa: 780, status: "Verified" },
  { id: "m11", name: "Ben Tre Coastal Cocoa", region: "Mekong Delta", category: "cocoa", position: [9.95, 106.4], valueUsd: 7_900_000, areaHa: 1400, status: "In Review" },
  { id: "m12", name: "Dong Thap Rice Estate", region: "Mekong Delta", category: "rice", position: [10.45, 105.63], valueUsd: 4_600_000, areaHa: 690, status: "Verified" },
  // Central Coast
  { id: "m13", name: "Quang Nam Pepper Grove", region: "Central Coast", category: "pepper", position: [15.57, 108.47], valueUsd: 3_300_000, areaHa: 190, status: "Verified" },
  { id: "m14", name: "Quang Ngai Rice Terraces", region: "Central Coast", category: "rice", position: [15.12, 108.8], valueUsd: 4_100_000, areaHa: 520, status: "Verified" },
  { id: "m15", name: "Binh Dinh Coastal Cocoa", region: "Central Coast", category: "cocoa", position: [13.78, 109.22], valueUsd: 6_800_000, areaHa: 960, status: "Verified" },
  { id: "m16", name: "Phu Yen Coffee Slopes", region: "Central Coast", category: "coffee", position: [13.1, 109.1], valueUsd: 2_900_000, areaHa: 170, status: "In Review" },
  // Northern Vietnam
  { id: "m17", name: "Son La Arabica Highlands", region: "Northern Vietnam", category: "coffee", position: [21.33, 103.9], valueUsd: 3_700_000, areaHa: 280, status: "Verified" },
  { id: "m18", name: "Thai Binh Rice Delta", region: "Northern Vietnam", category: "rice", position: [20.45, 106.34], valueUsd: 5_900_000, areaHa: 900, status: "Verified" },
  { id: "m19", name: "Quang Ninh Cocoa Estate", region: "Northern Vietnam", category: "cocoa", position: [21.0, 107.3], valueUsd: 6_100_000, areaHa: 1100, status: "Verified" },
];

export const regionSummaries = [
  { region: "Central Highlands", mix: "Coffee • Pepper", assets: 124, position: [12.4, 111.7] as [number, number] },
  { region: "Mekong Delta", mix: "Rice • Cocoa", assets: 87, position: [9.0, 108.4] as [number, number] },
  { region: "Central Coast", mix: "Mixed Crops", assets: 37, position: [15.8, 111.9] as [number, number] },
];

export const categoryColors: Record<string, string> = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.color]));
