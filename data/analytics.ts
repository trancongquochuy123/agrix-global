import type { AlertItem, IntelligenceModule, RiskIndicator, SensorPoint, WeatherDay } from "@/types/intelligence";
import type { SummaryMetric } from "@/types/portfolio";

/* ------------------------------ Dashboard ------------------------------ */

export interface DashboardStat extends SummaryMetric {
  icon: "layers" | "sprout" | "database" | "bar";
  spark: number[];
}

export const dashboardStats: DashboardStat[] = [
  { id: "value", label: "Verified Asset Value", value: "$128.4M", change: "+12.6%", comparison: "vs. last quarter", trend: "up", icon: "layers", spark: [32, 35, 34, 40, 44, 47, 52, 58] },
  { id: "assets", label: "Active Assets", value: "248", change: "+18", comparison: "new this quarter", trend: "up", icon: "sprout", spark: [200, 205, 212, 220, 226, 232, 240, 248] },
  { id: "capital", label: "Capital Deployed", value: "$42.8M", change: "+14.3%", comparison: "vs. last quarter", trend: "up", icon: "database", spark: [24, 27, 29, 31, 34, 37, 40, 42.8] },
  { id: "yield", label: "Portfolio Yield", value: "8.7%", change: "+1.2%", comparison: "vs. last quarter", trend: "up", icon: "bar", spark: [7.2, 7.4, 7.3, 7.9, 8.1, 8.3, 8.4, 8.7] },
];

export const assetValueGrowth = [
  { label: "2021", value: 34 },
  { label: "Q2 2021", value: 39 },
  { label: "Q4 2021", value: 46 },
  { label: "2022", value: 54 },
  { label: "Q2 2022", value: 60 },
  { label: "Q4 2022", value: 72 },
  { label: "2023", value: 80 },
  { label: "Q2 2023", value: 88 },
  { label: "Q4 2023", value: 99 },
  { label: "2024", value: 108 },
  { label: "Q2 2024", value: 119 },
  { label: "Q4 2024", value: 128.4 },
];

export const dashboardAllocation = [
  { name: "Coffee", pct: 42, valueUsd: 53.9e6, color: "#5B3A29" },
  { name: "Rice", pct: 28, valueUsd: 36.0e6, color: "#D9B550" },
  { name: "Durian", pct: 18, valueUsd: 23.1e6, color: "#2F7D3B" },
  { name: "Carbon", pct: 12, valueUsd: 15.4e6, color: "#8FC16B" },
];

export const recentAssets = [
  { id: "ra1", slug: "dak-lak-coffee-estate", name: "Highland Coffee Estate", location: "Lam Dong, Central Highlands", type: "coffee", valueUsd: 12.5e6, status: "Verified" as const },
  { id: "ra2", slug: "mekong-rice-cluster", name: "Mekong Rice Cluster", location: "An Giang, Mekong Delta", type: "rice", valueUsd: 8.7e6, status: "Verified" as const },
  { id: "ra3", slug: "lam-dong-durian-orchard", name: "Durian Orchard", location: "Dak Lak, Central Highlands", type: "durian", valueUsd: 10.2e6, status: "Verified" as const },
  { id: "ra4", slug: "mangrove-carbon-project", name: "Mangrove Carbon Project", location: "Ca Mau, Mekong Delta", type: "carbon", valueUsd: 15.4e6, status: "In Review" as const },
];

export const dashboardRisk: RiskIndicator[] = [
  { id: "climate", label: "Climate Risk", level: "Low", score: 24 },
  { id: "market", label: "Market Risk", level: "Low", score: 38 },
  { id: "ops", label: "Operations Risk", level: "Moderate", score: 52 },
];

/* --------------------------- AI Intelligence --------------------------- */

export const intelligenceModules: IntelligenceModule[] = [
  { id: "valuation", title: "AI Valuation", description: "Asset value, yield and revenue modelling" },
  { id: "risk", title: "Risk Engine", description: "Climate, operational and market risk" },
  { id: "credit", title: "Credit Engine", description: "Credit assessment and financing insights" },
  { id: "twin", title: "Digital Twin", description: "Geospatial analytics and crop intelligence" },
];

export const twinAssets = [
  { slug: "dak-lak-coffee-estate", name: "Dak Lak Coffee Estate", place: "Buon Ma Thuot, Vietnam", detail: "320 hectares · Arabica & Robusta" },
  { slug: "lam-dong-durian-orchard", name: "Lam Dong Durian Orchard", place: "Lam Dong, Vietnam", detail: "480 hectares · Monthong" },
  { slug: "gia-lai-pepper-farm", name: "Gia Lai Pepper Farm", place: "Gia Lai, Vietnam", detail: "220 hectares · Black pepper" },
];

export const twinTimeline = ["Jul 2026", "Aug 2026", "Sep 2026", "Oct 2026", "Nov 2026"];

export const sensors: SensorPoint[] = [
  { id: "s1", kind: "soil", label: "Soil sensor A1", position: [12.6735, 108.0475] },
  { id: "s2", kind: "soil", label: "Soil sensor B2", position: [12.6685, 108.0575] },
  { id: "s3", kind: "soil", label: "Soil sensor C3", position: [12.6625, 108.0505] },
  { id: "w1", kind: "weather", label: "Weather station", position: [12.6705, 108.0515] },
  { id: "c1", kind: "camera", label: "Camera unit N", position: [12.6775, 108.0555] },
  { id: "c2", kind: "camera", label: "Camera unit S", position: [12.6605, 108.0455] },
  { id: "h1", kind: "water", label: "Water sensor (reservoir)", position: [12.6592, 108.0522] },
  { id: "h2", kind: "water", label: "Water sensor (canal)", position: [12.6665, 108.0415] },
];

export const vegetationIndex = [
  { month: "Jun", value: 0.5 },
  { month: "Jul", value: 0.56 },
  { month: "Aug", value: 0.65 },
  { month: "Sep", value: 0.78 },
  { month: "Oct", value: 0.82 },
  { month: "Nov", value: 0.85 },
];

export const weatherForecast: WeatherDay[] = [
  { day: "Wed", high: 26, low: 15, condition: "sun" },
  { day: "Thu", high: 27, low: 16, condition: "sun" },
  { day: "Fri", high: 26, low: 16, condition: "partly" },
  { day: "Sat", high: 25, low: 15, condition: "rain" },
  { day: "Sun", high: 24, low: 14, condition: "rain" },
  { day: "Mon", high: 25, low: 15, condition: "partly" },
  { day: "Tue", high: 26, low: 15, condition: "sun" },
];

export const recentAlerts: AlertItem[] = [
  { id: "al1", title: "Unusual leaf temperature detected", block: "Block C", ago: "2 hours ago", severity: "critical" },
  { id: "al2", title: "Soil moisture below threshold", block: "Block A", ago: "6 hours ago", severity: "warning" },
  { id: "al3", title: "Pest risk increase detected", block: "Block D", ago: "1 day ago", severity: "warning" },
];

export const modelInsight = {
  title: "Expected harvest window",
  window: "18–26 November",
  basis: "Based on current crop development, weather patterns and historical yield data.",
};

export const valuationModule = {
  base: 4.8,
  low: 4.35,
  high: 5.25,
  confidence: 91,
  series: [
    { month: "Apr", value: 4.52 },
    { month: "May", value: 4.55 },
    { month: "Jun", value: 4.61 },
    { month: "Jul", value: 4.66 },
    { month: "Aug", value: 4.7 },
    { month: "Sep", value: 4.74 },
    { month: "Oct", value: 4.8 },
  ],
  factors: [
    { label: "Regional price index", impact: "+3.1%" },
    { label: "Yield forecast revision", impact: "+1.8%" },
    { label: "Comparable transactions", impact: "+0.9%" },
    { label: "Input cost inflation", impact: "-1.4%" },
  ],
};

export const riskModule = {
  overall: 31,
  drivers: [
    { label: "Climate & weather", score: 22 },
    { label: "Market price", score: 38 },
    { label: "Operations", score: 27 },
    { label: "Pest & disease", score: 31 },
    { label: "Legal & title", score: 12 },
  ],
  scenarios: [
    { name: "Drought (1-in-10 year)", impact: "-6.2% revenue" },
    { name: "Coffee price -20%", impact: "-9.8% revenue" },
    { name: "Input costs +15%", impact: "-3.4% margin" },
  ],
};

export const creditModule = {
  rating: "A−",
  score: 78,
  facilities: [
    { label: "Indicative borrowing capacity", value: "$2.4M" },
    { label: "Debt service coverage", value: "2.3x" },
    { label: "Loan-to-value (LTV) ceiling", value: "55%" },
    { label: "Indicative pricing", value: "SOFR + 4.1%" },
  ],
  notes: [
    "Offtake contracts cover 62% of forecast production.",
    "Collateral verified via land-use right and satellite boundary match.",
    "Working-capital line recommended ahead of the November harvest.",
  ],
};
