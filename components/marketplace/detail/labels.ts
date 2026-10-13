import type { AssetCategory } from "@/types/asset";

export const plantationLabel: Record<AssetCategory, string> = {
  coffee: "Coffee Plantation",
  rice: "Rice Paddies",
  durian: "Durian Orchard",
  carbon: "Mangrove Forest",
  pepper: "Pepper Plantation",
  solar: "Solar Arrays",
};

export const productionLabels: Record<AssetCategory, { a: string; b: string; unit: string }> = {
  coffee: { a: "Arabica (high altitude)", b: "Robusta (main crop)", unit: "Green bean equivalent (metric tons)" },
  rice: { a: "Wet season", b: "Dry season", unit: "Paddy rice (metric tons)" },
  durian: { a: "Monthong", b: "Ri6", unit: "Fresh fruit (metric tons)" },
  carbon: { a: "Verified credits", b: "Pipeline credits", unit: "Carbon credits (tCO₂e, thousands)" },
  pepper: { a: "Black pepper", b: "White pepper", unit: "Dried pepper (metric tons)" },
  solar: { a: "Generation (MWh, hundreds)", b: "Agricultural output (t)", unit: "Combined output index" },
};
