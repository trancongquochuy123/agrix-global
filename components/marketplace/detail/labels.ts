import type { AssetCategory } from "@/types/asset";

export const plantationLabel: Record<AssetCategory, string> = {
  coffee: "Coffee Plantation",
  rice: "Rice Paddies",
  palmoil: "Oil Palm Blocks",
  soybean: "Soybean Fields",
  cocoa: "Cocoa Plots",
  pepper: "Pepper Plantation",
};

export const productionLabels: Record<AssetCategory, { a: string; b: string; unit: string }> = {
  coffee: { a: "Arabica (high altitude)", b: "Robusta (main crop)", unit: "Green bean equivalent (metric tons)" },
  rice: { a: "Wet season", b: "Dry season", unit: "Paddy rice (metric tons)" },
  palmoil: { a: "Fresh fruit bunches", b: "Crude palm oil", unit: "Metric tons" },
  soybean: { a: "Main crop", b: "Second crop (safrinha)", unit: "Soybeans (metric tons)" },
  cocoa: { a: "Main crop", b: "Mid crop", unit: "Dry cocoa beans (metric tons)" },
  pepper: { a: "Black pepper", b: "White pepper", unit: "Dried pepper (metric tons)" },
};
