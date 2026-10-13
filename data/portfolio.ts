import type { AllocationSlice, CashFlowPoint, Holding, PerformancePoint, PortfolioRange, SummaryMetric } from "@/types/portfolio";
import { seeded } from "@/lib/utils";
import { IMAGES } from "./images";

/** Fixed anchor so chart labels are identical on server and client. */
export const AS_OF = new Date(Date.UTC(2026, 9, 13));
export const AS_OF_LABEL = "Oct 13, 2026";

export const portfolioSummary: SummaryMetric[] = [
  { id: "value", label: "Total Portfolio Value", value: "$12.84M", change: "+8.6%", comparison: "vs. last year", trend: "up" },
  { id: "return", label: "Net Return", value: "8.6%", change: "+2.3%", comparison: "vs. benchmark", trend: "up" },
  { id: "income", label: "Annual Income", value: "$1.02M", change: "+12.4%", comparison: "vs. last year", trend: "up" },
  { id: "active", label: "Active Investments", value: "14", change: "+2", comparison: "new this year", trend: "up" },
];

export const holdings: Holding[] = [
  { id: "h1", slug: "dak-lak-coffee-estate", name: "Dak Lak Coffee Estate", location: "Dak Lak, Vietnam", category: "coffee", investedUsd: 3_200_000, currentValueUsd: 4_110_000, changePct: 28.4, yieldPct: 9.2, risk: "Medium", status: "Active", image: IMAGES.coffee, imageFallback: "coffee" },
  { id: "h2", slug: "mekong-rice-cluster", name: "Mekong Rice Cluster", location: "An Giang, Vietnam", category: "rice", investedUsd: 2_800_000, currentValueUsd: 3_080_000, changePct: 10.0, yieldPct: 7.6, risk: "Low", status: "Active", image: IMAGES.rice, imageFallback: "rice" },
  { id: "h3", slug: "mangrove-carbon-project", name: "Mangrove Carbon Project", location: "Ca Mau, Vietnam", category: "carbon", investedUsd: 2_000_000, currentValueUsd: 2_310_000, changePct: 15.5, yieldPct: 8.1, risk: "Low", status: "Active", image: IMAGES.mangrove, imageFallback: "carbon" },
  { id: "h4", slug: "lam-dong-durian-orchard", name: "Lam Dong Durian Orchard", location: "Lam Dong, Vietnam", category: "durian", investedUsd: 1_500_000, currentValueUsd: 1_800_000, changePct: 20.1, yieldPct: 6.9, risk: "Medium", status: "Active", image: IMAGES.durian, imageFallback: "durian" },
];

export const allocation: AllocationSlice[] = [
  { name: "Coffee", pct: 32, valueUsd: 4_110_000, color: "#0E513D", image: IMAGES.coffee },
  { name: "Rice", pct: 24, valueUsd: 3_080_000, color: "#5F9F38", image: IMAGES.rice },
  { name: "Carbon", pct: 18, valueUsd: 2_310_000, color: "#2F7D3B", image: IMAGES.mangrove },
  { name: "Durian", pct: 14, valueUsd: 1_800_000, color: "#C4A35A", image: IMAGES.durian },
  { name: "Other", pct: 12, valueUsd: 1_540_000, color: "#DDE8D8", image: IMAGES.pepper },
];

export const cashFlow: CashFlowPoint[] = [
  { year: "2027", income: 1.02, capital: 0.3 },
  { year: "2028", income: 1.1, capital: 0.34 },
  { year: "2029", income: 1.19, capital: 0.38 },
  { year: "2030", income: 1.3, capital: 0.42 },
  { year: "2031", income: 1.4, capital: 0.47 },
];

export const holdingStatusOptions = ["All Status", "Active", "Maturing", "Funding"] as const;
export const holdingAssetOptions = [
  { value: "all", label: "All Assets" },
  { value: "coffee", label: "Coffee" },
  { value: "rice", label: "Rice" },
  { value: "carbon", label: "Carbon" },
  { value: "durian", label: "Durian" },
] as const;
export const portfolioRanges: PortfolioRange[] = ["1M", "3M", "6M", "12M", "ALL"];

/* ------------------------ Performance series by range ------------------------ */

const RANGE_CONFIG: Record<PortfolioRange, { points: number; stepDays: number; start: number; seed: number; label: "day" | "month" }> = {
  "1M": { points: 30, stepDays: 1, start: 12.31, seed: 11, label: "day" },
  "3M": { points: 13, stepDays: 7, start: 11.82, seed: 23, label: "day" },
  "6M": { points: 26, stepDays: 7, start: 11.2, seed: 37, label: "month" },
  "12M": { points: 12, stepDays: 30, start: 7.2, seed: 5, label: "month" },
  ALL: { points: 24, stepDays: 30, start: 3.1, seed: 91, label: "month" },
};

const END_VALUE = 12.84;

function labelFor(date: Date, kind: "day" | "month"): string {
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    ...(kind === "day" ? { day: "numeric" } : { year: "2-digit" }),
  });
}

export function getPerformance(range: PortfolioRange): PerformancePoint[] {
  const cfg = RANGE_CONFIG[range];
  const rand = seeded(cfg.seed);
  const growthPerPoint = (END_VALUE - cfg.start) / (cfg.points - 1);
  const noise = Math.max(0.04, (END_VALUE - cfg.start) * 0.035);

  let portfolio = cfg.start;
  let benchmark = cfg.start * 0.99;
  const benchGrowth = growthPerPoint * 0.72;

  return Array.from({ length: cfg.points }, (_, i) => {
    const offsetDays = (cfg.points - 1 - i) * cfg.stepDays;
    const date = new Date(AS_OF.getTime() - offsetDays * 86_400_000);
    if (i > 0) {
      portfolio += growthPerPoint + (rand() - 0.5) * noise * 2;
      benchmark += benchGrowth + (rand() - 0.5) * noise;
    }
    const isLast = i === cfg.points - 1;
    return {
      label: labelFor(date, cfg.label),
      portfolio: Number((isLast ? END_VALUE : portfolio).toFixed(2)),
      benchmark: Number((isLast ? benchmark * 0.99 : benchmark).toFixed(2)),
    };
  });
}
