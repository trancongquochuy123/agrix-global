export type AssetCategory = "coffee" | "rice" | "durian" | "carbon" | "pepper" | "solar";
export type RiskLevel = "Low" | "Medium" | "High";
export type VerificationStatus = "Verified" | "In Review" | "Pending";

export interface Asset {
  id: string;
  slug: string;
  name: string;
  category: AssetCategory;
  location: string;
  province: string;
  areaHa: number;
  targetYield: number;
  risk: RiskLevel;
  fundedPct: number;
  raisedUsd: number;
  targetUsd: number;
  image: string;
  imageFallback: string;
  coords: [number, number];
  verified: boolean;
}

export interface AssetDocument {
  id: string;
  name: string;
  fileType: "PDF" | "XLSX" | "KML";
  size: string;
  date: string;
  category: "Legal" | "Survey" | "Environmental" | "Financial" | "Operations";
}

export interface ValuationDriver {
  id: string;
  label: string;
  description: string;
  impactPct: number;
  icon: "mountain" | "sprout" | "globe" | "leaf" | "droplets" | "shield" | "sun" | "wheat" | "zap" | "trees" | "scale";
}

export interface VerificationStep {
  id: string;
  label: string;
  date: string;
}

export interface SustainabilityMetric {
  id: string;
  value: string;
  label: string;
  icon: "sprout" | "co2" | "trees" | "water" | "sun" | "zap" | "wheat" | "shield";
}

export interface ProductionPoint {
  year: string;
  arabica: number;
  robusta: number;
}

export interface RiskFactor {
  id: string;
  label: string;
  score: number;
  level: RiskLevel;
  note: string;
}

export interface ActivityEvent {
  id: string;
  title: string;
  detail: string;
  date: string;
  kind: "verification" | "funding" | "document" | "model";
}

export interface ValuationComparable {
  name: string;
  location: string;
  valuePerHa: number;
  yieldPct: number;
}

export interface AssetDetail {
  slug: string;
  assetCode: string;
  breadcrumbCategory: string;
  town: string;
  assetValueUsd: number;
  termMonths: number;
  riskScore: number;
  raisedUsd: number;
  raiseTargetUsd: number;
  investors: number;
  daysRemaining: number;
  minInvestmentUsd: number;
  boundary: [number, number][];
  plantations: [number, number][][];
  water: { center: [number, number]; radiusM: number };
  roads: [number, number][][];
  facilities: { name: string; position: [number, number] }[];
  production: ProductionPoint[];
  drivers: ValuationDriver[];
  verification: VerificationStep[];
  sustainability: SustainabilityMetric[];
  riskFactors: RiskFactor[];
  activity: ActivityEvent[];
  comparables: ValuationComparable[];
  valuationRange: { low: number; base: number; high: number };
  /** Asset-specific data room, key documents are the first three entries. */
  documents: AssetDocument[];
  valuationFactors: { label: string; impact: string }[];
  /** Label for the water feature drawn on the map (reservoir, canal, tidal channel…). */
  waterLabel: string;
  /** Short subtitle shown above the overview cards, e.g. "Irrigation-fed double-crop paddy". */
  profile: string;
}
