import type { AssetCategory } from "@/types/asset";

export interface CategoryMeta {
  id: AssetCategory;
  /** Short label used on chips, tables and badges. */
  label: string;
  /** Longer descriptive label used on the map legend. */
  longLabel: string;
  color: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "coffee", label: "Coffee", longLabel: "Coffee Estate", color: "#8A5A3C" },
  { id: "rice", label: "Rice", longLabel: "Rice Project", color: "#C4A35A" },
  { id: "palmoil", label: "Palm Oil", longLabel: "Palm Oil Plantation", color: "#C2581C" },
  { id: "soybean", label: "Soybeans", longLabel: "Soybean Farm", color: "#7FAE3C" },
  { id: "cocoa", label: "Cocoa", longLabel: "Cocoa Farm", color: "#6B3F2A" },
  { id: "pepper", label: "Pepper", longLabel: "Pepper Farm", color: "#4B5D3A" },
];

export const ALL = "all" as const;
export type CategoryFilter = typeof ALL | AssetCategory;

const byId = new Map(CATEGORIES.map((c) => [c.id, c]));

export const categoryLabel = (id: string) => byId.get(id as AssetCategory)?.label ?? id;
export const categoryColor = (id: string) => byId.get(id as AssetCategory)?.color ?? "#6B7A74";
export const isCategory = (v: string | null | undefined): v is AssetCategory => !!v && byId.has(v as AssetCategory);

/** Chips shown in the marketplace / dashboard filter rows. */
export const categoryChips: { id: CategoryFilter; label: string }[] = [
  { id: ALL, label: "All Assets" },
  ...CATEGORIES.map((c) => ({ id: c.id as CategoryFilter, label: c.label })),
];
