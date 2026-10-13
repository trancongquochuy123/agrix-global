import type { AssetCategory, RiskLevel } from "./asset";

export type HoldingStatus = "Active" | "Maturing" | "Funding";
export type PortfolioRange = "1M" | "3M" | "6M" | "12M" | "ALL";

export interface Holding {
  id: string;
  slug: string;
  name: string;
  location: string;
  category: AssetCategory;
  investedUsd: number;
  currentValueUsd: number;
  changePct: number;
  yieldPct: number;
  risk: RiskLevel;
  status: HoldingStatus;
  image: string;
  imageFallback: string;
}

export interface PerformancePoint {
  label: string;
  portfolio: number;
  benchmark: number;
}

export interface AllocationSlice {
  name: string;
  pct: number;
  valueUsd: number;
  color: string;
  image: string;
}

export interface CashFlowPoint {
  year: string;
  income: number;
  capital: number;
}

export interface SummaryMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  comparison: string;
  trend: "up" | "down";
}
