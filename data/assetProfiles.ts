import type {
  ActivityEvent,
  AssetCategory,
  AssetDocument,
  RiskFactor,
  SustainabilityMetric,
  ValuationComparable,
  ValuationDriver,
  VerificationStep,
} from "@/types/asset";

/** Everything on the detail page that depends on *what* the asset is, not where it is. */
export interface CategoryProfile {
  profile: string;
  termMonths: number;
  minInvestmentUsd: number;
  daysRemaining: number;
  waterLabel: string;
  facilities: [string, string];
  drivers: ValuationDriver[];
  verification: VerificationStep[];
  sustainability: (area: number) => SustainabilityMetric[];
  riskFactors: RiskFactor[];
  activity: (name: string, targetM: string, fundedPct: number) => ActivityEvent[];
  comparables: ValuationComparable[];
  valuationFactors: { label: string; impact: string }[];
  /** Production curve: [seriesA, seriesB] per year, per hectare-normalised tonnes at 1,000 ha. */
  production: { a: number[]; b: number[] };
  documents: AssetDocument[];
}

const doc = (
  prefix: string,
  n: number,
  name: string,
  fileType: AssetDocument["fileType"],
  size: string,
  date: string,
  category: AssetDocument["category"],
): AssetDocument => ({ id: `${prefix}${n}`, name, fileType, size, date, category });

const step = (id: string, label: string, date: string): VerificationStep => ({ id, label, date });

const risk = (id: string, label: string, score: number, note: string): RiskFactor => ({
  id,
  label,
  score,
  level: score < 33 ? "Low" : score < 60 ? "Medium" : "High",
  note,
});

const fmtNum = (n: number) => Math.round(n).toLocaleString("en-US");

export const profiles: Record<AssetCategory, CategoryProfile> = {
  /* ------------------------------------ RICE ------------------------------------ */
  rice: {
    profile: "Irrigated double-crop paddy · Mekong Delta",
    termMonths: 36,
    minInvestmentUsd: 5_000,
    daysRemaining: 41,
    waterLabel: "Main irrigation canal",
    facilities: ["Drying & milling plant", "Paddy storage silo"],
    drivers: [
      { id: "d1", label: "Irrigation & water access", description: "Gravity-fed canals, 2 pump stations", impactPct: 21, icon: "droplets" },
      { id: "d2", label: "Seasonal yield stability", description: "6.8 t/ha across 3 crops / 2 years", impactPct: 17, icon: "wheat" },
      { id: "d3", label: "Export offtake contract", description: "3-year ST25 premium rice contract", impactPct: 16, icon: "globe" },
      { id: "d4", label: "Soil quality & fertility", description: "Alluvial soil, organic matter 3.4%", impactPct: 11, icon: "sprout" },
    ],
    verification: [
      step("v1", "Land-use right certificates verified", "Feb 6, 2024"),
      step("v2", "Paddy boundary survey confirmed", "Feb 15, 2024"),
      step("v3", "Cooperative ownership checked", "Feb 27, 2024"),
      step("v4", "Irrigation permit & water rights", "Mar 8, 2024"),
    ],
    sustainability: (a) => [
      { id: "s1", value: `${fmtNum(a * 0.82)} ha`, label: "VietGAP / GlobalG.A.P. certified paddy", icon: "wheat" },
      { id: "s2", value: "-30%", label: "Methane reduction via alternate wetting & drying", icon: "co2" },
      { id: "s3", value: "-24%", label: "Irrigation water use vs. regional average", icon: "water" },
      { id: "s4", value: "1,100", label: "Smallholder farmers in the cooperative", icon: "shield" },
    ],
    riskFactors: [
      risk("r1", "Flood & salinity intrusion", 34, "Dyke-protected fields; salinity gates reduce dry-season intrusion risk."),
      risk("r2", "Irrigation & water access", 18, "Two independent pump stations and canal access rights registered through 2038."),
      risk("r3", "Rice price volatility", 29, "Export price indexed; 60% of volume sold under a fixed-floor offtake contract."),
      risk("r4", "Pest & disease", 26, "Brown planthopper monitoring with integrated pest management in place."),
      risk("r5", "Legal & title", 11, "Land-use rights verified against provincial registry."),
    ],
    activity: (name, t, f) => [
      { id: "a1", title: "Funding milestone reached", detail: `${f}% of the ${t} target is now committed.`, date: "Oct 8, 2026", kind: "funding" },
      { id: "a2", title: "Winter–Spring harvest report", detail: "Average paddy yield 7.1 t/ha, +4% vs. forecast.", date: "Sep 30, 2026", kind: "document" },
      { id: "a3", title: "AI valuation refreshed", detail: "Base case revised after export price index update.", date: "Sep 22, 2026", kind: "model" },
      { id: "a4", title: "Satellite flood-risk scan", detail: "No standing water outside planned irrigation windows.", date: "Sep 10, 2026", kind: "verification" },
      { id: "a5", title: "Irrigation permit renewed", detail: "Water-rights permit extended to 2038.", date: "Mar 8, 2024", kind: "verification" },
    ],
    comparables: [
      { name: "Dong Thap Rice Estate", location: "Dong Thap", valuePerHa: 9_800, yieldPct: 7.0 },
      { name: "Can Tho Rice Co-op", location: "Can Tho", valuePerHa: 10_400, yieldPct: 7.6 },
      { name: "Kien Giang Paddy Block", location: "Kien Giang", valuePerHa: 9_200, yieldPct: 6.8 },
    ],
    valuationFactors: [
      { label: "Export rice price index", impact: "+2.6%" },
      { label: "Seasonal yield revision", impact: "+1.4%" },
      { label: "Irrigation infrastructure upgrade", impact: "+0.8%" },
      { label: "Fertiliser cost inflation", impact: "-1.1%" },
    ],
    production: { a: [4400, 4500, 4600, 4650, 4700, 4750, 4750, 4800, 4800, 4850], b: [3100, 3200, 3250, 3300, 3350, 3350, 3400, 3400, 3450, 3450] },
    documents: [
      doc("rc", 1, "Land-Use Right Certificates (Cooperative)", "PDF", "5.1 MB", "Feb 6, 2024", "Legal"),
      doc("rc", 2, "Paddy Parcel Survey & Boundary Map", "PDF", "7.4 MB", "Feb 15, 2024", "Survey"),
      doc("rc", 3, "Irrigation Permit & Water-Rights Agreement", "PDF", "2.3 MB", "Mar 8, 2024", "Legal"),
      doc("rc", 4, "Flood & Salinity Risk Assessment", "PDF", "4.0 MB", "Mar 14, 2024", "Environmental"),
      doc("rc", 5, "Soil Fertility & Water Quality Analysis", "PDF", "2.6 MB", "Mar 18, 2024", "Environmental"),
      doc("rc", 6, "Export Offtake Contract (ST25 Premium)", "PDF", "2.8 MB", "Apr 2, 2024", "Financial"),
      doc("rc", 7, "VietGAP / GlobalG.A.P. Certification Pack", "PDF", "5.7 MB", "Apr 11, 2024", "Environmental"),
      doc("rc", 8, "Methane Reduction (AWD) Monitoring Protocol", "PDF", "1.9 MB", "Apr 19, 2024", "Environmental"),
      doc("rc", 9, "Seasonal Yield Ledger (2016–2025)", "XLSX", "1.3 MB", "May 2, 2024", "Operations"),
      doc("rc", 10, "Three-Year Operating Budget", "XLSX", "0.7 MB", "May 6, 2024", "Financial"),
      doc("rc", 11, "Paddy Boundary Coordinates (KML)", "KML", "0.2 MB", "Feb 15, 2024", "Survey"),
      doc("rc", 12, "Independent Valuation Report", "PDF", "3.5 MB", "May 20, 2024", "Financial"),
    ],
  },

  /* ----------------------------------- COFFEE ----------------------------------- */
  coffee: {
    profile: "Robusta smallholder estate · Central Highlands",
    termMonths: 6,
    minInvestmentUsd: 1_000,
    daysRemaining: 45,
    waterLabel: "Irrigation reservoir",
    facilities: ["Wet-processing & drying yard", "Storage warehouse"],
    drivers: [
      { id: "d1", label: "Premium growing region", description: "Basalt soils, Buon Ma Thuot origin", impactPct: 22, icon: "mountain" },
      { id: "d2", label: "Strong historical yields", description: "3.1 t/ha green bean 5-year average", impactPct: 18, icon: "sprout" },
      { id: "d3", label: "Export market demand", description: "Robusta demand from EU and Asia roasters", impactPct: 15, icon: "globe" },
      { id: "d4", label: "Certification potential", description: "4C and Rainforest Alliance pathway", impactPct: 12, icon: "leaf" },
    ],
    verification: [
      step("v1", "Land-use certificate submitted", "Sep 12, 2026"),
      step("v2", "Boundary survey uploaded", "Sep 14, 2026"),
      step("v3", "Ownership structure submitted", "Sep 16, 2026"),
      step("v4", "Offtake agreement uploaded", "Sep 20, 2026"),
    ],
    sustainability: (a) => [
      { id: "s1", value: `${fmtNum(a * 0.85)} ha`, label: "Under 4C-aligned farming practices", icon: "sprout" },
      { id: "s2", value: "-18%", label: "Fertiliser use vs. regional average", icon: "co2" },
      { id: "s3", value: "12,400", label: "Shade trees planted across the estate", icon: "trees" },
      { id: "s4", value: "26%", label: "Improved water efficiency (drip upgrade)", icon: "water" },
    ],
    riskFactors: [
      risk("r1", "Climate & weather", 28, "Highland rainfall is stable; on-site reservoir buffers dry-season stress."),
      risk("r2", "Robusta price volatility", 39, "Spot-price exposure partly covered by a forward offtake agreement."),
      risk("r3", "Operational execution", 27, "Family operator with a 12-year harvest record."),
      risk("r4", "Legal & title", 14, "Land-use right certificate on file; registry check pending."),
      risk("r5", "Pest & disease", 31, "Berry borer monitoring and integrated pest management in place."),
    ],
    activity: (name, t, f) => [
      { id: "a1", title: "Funding progress", detail: `${f}% of the ${t} target is now committed.`, date: "Oct 13, 2026", kind: "funding" },
      { id: "a2", title: "Demo AI valuation generated", detail: "Base case set from comparable Dak Lak transactions.", date: "Oct 12, 2026", kind: "model" },
      { id: "a3", title: "Data room documents uploaded", detail: "Title, survey and offtake summary added by the seller.", date: "Oct 11, 2026", kind: "document" },
      { id: "a4", title: "Asset submitted for review", detail: `${name} entered the approval queue.`, date: "Oct 11, 2026", kind: "verification" },
    ],
    comparables: [
      { name: "Dak Nong Robusta Estate", location: "Dak Nong", valuePerHa: 12_600, yieldPct: 7.8 },
      { name: "Buon Ma Thuot Robusta Farm", location: "Dak Lak", valuePerHa: 13_800, yieldPct: 8.2 },
      { name: "Cu M'gar Mixed Estate", location: "Dak Lak", valuePerHa: 12_100, yieldPct: 7.6 },
    ],
    valuationFactors: [
      { label: "Regional Robusta price index", impact: "+3.1%" },
      { label: "Yield forecast revision", impact: "+1.8%" },
      { label: "Comparable transactions", impact: "+0.9%" },
      { label: "Input cost inflation", impact: "-1.4%" },
    ],
    production: { a: [900, 950, 1000, 1050, 1080, 1100, 1100, 1100, 1100, 1100], b: [2300, 2400, 2500, 2600, 2650, 2700, 2700, 2650, 2650, 2650] },
    documents: [
      doc("cf", 1, "Land Use Right Certificate", "PDF", "4.2 MB", "Sep 12, 2026", "Legal"),
      doc("cf", 2, "Property Survey & Boundary Map", "PDF", "6.8 MB", "Sep 14, 2026", "Survey"),
      doc("cf", 3, "Environmental Impact Assessment", "PDF", "3.1 MB", "Sep 15, 2026", "Environmental"),
      doc("cf", 4, "Ownership Structure Memorandum", "PDF", "1.4 MB", "Sep 16, 2026", "Legal"),
      doc("cf", 5, "Soil & Water Analysis", "PDF", "2.7 MB", "Sep 17, 2026", "Environmental"),
      doc("cf", 6, "Six-Month Operating Budget", "XLSX", "0.6 MB", "Sep 18, 2026", "Financial"),
      doc("cf", 7, "Historical Yield Ledger (2019–2025)", "XLSX", "1.1 MB", "Sep 18, 2026", "Operations"),
      doc("cf", 8, "Offtake Agreement Summary", "PDF", "2.2 MB", "Sep 20, 2026", "Financial"),
      doc("cf", 9, "Boundary Coordinates (KML)", "KML", "0.1 MB", "Sep 14, 2026", "Survey"),
      doc("cf", 10, "4C Certification Application", "PDF", "5.3 MB", "Sep 22, 2026", "Environmental"),
      doc("cf", 11, "Crop Insurance Quote", "PDF", "0.8 MB", "Sep 24, 2026", "Financial"),
      doc("cf", 12, "Independent Valuation Report (Demo)", "PDF", "3.8 MB", "Sep 28, 2026", "Financial"),
    ],
  },

  /* ----------------------------------- PALM OIL ----------------------------------- */
  palmoil: {
    profile: "Mature oil palm plantation · Riau, Sumatra",
    termMonths: 12,
    minInvestmentUsd: 1_000,
    daysRemaining: 33,
    waterLabel: "Drainage canal",
    facilities: ["Palm oil mill (30 t/h)", "Fruit bunch collection point"],
    drivers: [
      { id: "d1", label: "Crude palm oil price outlook", description: "Benchmark CPO futures trending stable", impactPct: 24, icon: "scale" },
      { id: "d2", label: "Tree age profile", description: "82% of palms in prime bearing years", impactPct: 19, icon: "trees" },
      { id: "d3", label: "On-site mill access", description: "Fruit processed within 24 hours of harvest", impactPct: 16, icon: "zap" },
      { id: "d4", label: "Sustainability certification", description: "RSPO certification in progress", impactPct: 11, icon: "leaf" },
    ],
    verification: [
      step("v1", "Plantation licence (HGU) on file", "Jun 4, 2026"),
      step("v2", "Concession boundary mapped", "Jun 18, 2026"),
      step("v3", "Mill off-take contract checked", "Jul 2, 2026"),
      step("v4", "Approved by platform review (simulated)", "Jul 21, 2026"),
    ],
    sustainability: (a) => [
      { id: "s1", value: `${fmtNum(a * 0.6)} ha`, label: "Within RSPO certification scope", icon: "shield" },
      { id: "s2", value: "No-burn", label: "Land clearing policy enforced", icon: "co2" },
      { id: "s3", value: "4.2 t/ha", label: "Average crude palm oil yield", icon: "wheat" },
      { id: "s4", value: "-12%", label: "Mill effluent methane via capture", icon: "water" },
    ],
    riskFactors: [
      risk("r1", "Commodity price volatility", 46, "CPO prices swing with energy markets and export policy."),
      risk("r2", "Regulatory & export policy", 52, "Export levies and biodiesel mandates may change returns."),
      risk("r3", "ESG & deforestation scrutiny", 44, "Buyer due diligence on traceability is strict; RSPO audit pending."),
      risk("r4", "Climate & El Niño exposure", 33, "Dry spells reduce yields with a 6–12 month lag."),
      risk("r5", "Legal & land tenure", 29, "Concession tenure verified; community overlap survey outstanding."),
    ],
    activity: (name, t, f) => [
      { id: "a1", title: "Funding progress", detail: `${f}% of the ${t} target is now committed.`, date: "Oct 11, 2026", kind: "funding" },
      { id: "a2", title: "Demo AI valuation refreshed", detail: "Base case updated after CPO price move.", date: "Oct 5, 2026", kind: "model" },
      { id: "a3", title: "Mill throughput report", detail: "Q3 oil extraction rate 21.8%.", date: "Sep 29, 2026", kind: "document" },
      { id: "a4", title: "Traceability audit scheduled", detail: `${name} RSPO surveillance audit booked.`, date: "Sep 18, 2026", kind: "verification" },
    ],
    comparables: [
      { name: "Riau Smallholder Block", location: "Riau", valuePerHa: 6_200, yieldPct: 8.4 },
      { name: "Jambi Plantation Estate", location: "Jambi", valuePerHa: 5_900, yieldPct: 8.1 },
      { name: "North Sumatra Estate", location: "North Sumatra", valuePerHa: 6_800, yieldPct: 8.8 },
    ],
    valuationFactors: [
      { label: "Crude palm oil price index", impact: "+2.9%" },
      { label: "Yield per hectare revision", impact: "+1.2%" },
      { label: "Mill capacity utilisation", impact: "+0.7%" },
      { label: "Export levy changes", impact: "-1.9%" },
    ],
    production: { a: [8800, 9000, 9100, 9200, 9200, 9100, 9000, 8900, 8800, 8700], b: [1900, 1950, 1980, 2000, 2000, 1980, 1950, 1930, 1900, 1880] },
    documents: [
      doc("po", 1, "Plantation Licence (HGU) Certificate", "PDF", "3.7 MB", "Jun 4, 2026", "Legal"),
      doc("po", 2, "Concession Boundary & Block Map", "PDF", "8.4 MB", "Jun 18, 2026", "Survey"),
      doc("po", 3, "Mill Off-Take Agreement Summary", "PDF", "2.4 MB", "Jul 2, 2026", "Financial"),
      doc("po", 4, "RSPO Certification Roadmap", "PDF", "4.5 MB", "Jul 9, 2026", "Environmental"),
      doc("po", 5, "Environmental & Social Impact Assessment", "PDF", "6.1 MB", "Jul 12, 2026", "Environmental"),
      doc("po", 6, "Palm Age & Replanting Schedule", "XLSX", "0.9 MB", "Jul 15, 2026", "Operations"),
      doc("po", 7, "Fruit Bunch Yield Ledger (2019–2025)", "XLSX", "1.5 MB", "Jul 15, 2026", "Operations"),
      doc("po", 8, "Twelve-Month Operating Budget", "XLSX", "0.7 MB", "Jul 18, 2026", "Financial"),
      doc("po", 9, "Concession Coordinates (KML)", "KML", "0.3 MB", "Jun 18, 2026", "Survey"),
      doc("po", 10, "Independent Valuation Report (Demo)", "PDF", "3.9 MB", "Jul 20, 2026", "Financial"),
    ],
  },

  /* ----------------------------------- SOYBEANS ----------------------------------- */
  soybean: {
    profile: "Mechanised soybean & maize rotation · Mato Grosso",
    termMonths: 8,
    minInvestmentUsd: 1_000,
    daysRemaining: 26,
    waterLabel: "Rain-fed catchment pond",
    facilities: ["Grain silo (12,000 t)", "Machinery depot"],
    drivers: [
      { id: "d1", label: "Soybean futures outlook", description: "CBOT soybean curve and basis in Mato Grosso", impactPct: 23, icon: "scale" },
      { id: "d2", label: "Mechanised scale", description: "Large contiguous fields, low cost per ton", impactPct: 18, icon: "zap" },
      { id: "d3", label: "Crop rotation", description: "Soy followed by safrinha maize", impactPct: 14, icon: "sprout" },
      { id: "d4", label: "Export logistics", description: "Truck-to-port route via Santarém corridor", impactPct: 10, icon: "globe" },
    ],
    verification: [
      step("v1", "Farm registry (CAR) on file", "Mar 6, 2026"),
      step("v2", "Field boundaries mapped", "Mar 20, 2026"),
      step("v3", "Grain trader contract checked", "Apr 3, 2026"),
      step("v4", "Approved by platform review (simulated)", "Apr 24, 2026"),
    ],
    sustainability: (a) => [
      { id: "s1", value: `${fmtNum(a * 0.9)} ha`, label: "Zero-deforestation compliant fields", icon: "shield" },
      { id: "s2", value: "No-till", label: "Soil-conserving planting on 100% of area", icon: "sprout" },
      { id: "s3", value: "3.4 t/ha", label: "Five-year average soybean yield", icon: "wheat" },
      { id: "s4", value: "-9%", label: "Fertiliser use through precision application", icon: "co2" },
    ],
    riskFactors: [
      risk("r1", "Commodity & FX volatility", 45, "Soybean price and BRL/USD moves both affect margin."),
      risk("r2", "Weather & rainfall timing", 38, "Rain-fed system; late rains delay planting windows."),
      risk("r3", "Logistics & freight", 34, "Road conditions in the wet season can delay delivery."),
      risk("r4", "Input cost inflation", 31, "Fertiliser and agrochemical prices partly hedged."),
      risk("r5", "Legal & land registry", 17, "CAR registry and title reviewed."),
    ],
    activity: (name, t, f) => [
      { id: "a1", title: "Funding progress", detail: `${f}% of the ${t} target is now committed.`, date: "Oct 9, 2026", kind: "funding" },
      { id: "a2", title: "Demo AI forecast updated", detail: "Yield outlook revised after rainfall data.", date: "Oct 4, 2026", kind: "model" },
      { id: "a3", title: "Planting progress report", detail: "94% of area sown, on schedule.", date: "Sep 30, 2026", kind: "document" },
      { id: "a4", title: "Satellite stand check", detail: `${name} NDVI matches registered fields.`, date: "Sep 20, 2026", kind: "verification" },
    ],
    comparables: [
      { name: "Sorriso Soy Farm", location: "Mato Grosso", valuePerHa: 2_300, yieldPct: 8.0 },
      { name: "Lucas do Rio Verde Estate", location: "Mato Grosso", valuePerHa: 2_450, yieldPct: 8.3 },
      { name: "Sapezal Grain Farm", location: "Mato Grosso", valuePerHa: 2_150, yieldPct: 7.7 },
    ],
    valuationFactors: [
      { label: "Soybean futures curve", impact: "+2.2%" },
      { label: "Yield outlook revision", impact: "+1.0%" },
      { label: "Freight cost change", impact: "-0.8%" },
      { label: "BRL/USD movement", impact: "-1.2%" },
    ],
    production: { a: [3200, 3300, 3350, 3400, 3420, 3440, 3460, 3480, 3500, 3500], b: [2600, 2650, 2700, 2720, 2750, 2760, 2780, 2800, 2800, 2820] },
    documents: [
      doc("sb", 1, "Rural Environmental Registry (CAR) Extract", "PDF", "2.8 MB", "Mar 6, 2026", "Legal"),
      doc("sb", 2, "Field Boundary & Soil Map", "PDF", "7.2 MB", "Mar 20, 2026", "Survey"),
      doc("sb", 3, "Grain Trader Sales Contract Summary", "PDF", "2.1 MB", "Apr 3, 2026", "Financial"),
      doc("sb", 4, "Zero-Deforestation Compliance Statement", "PDF", "1.9 MB", "Apr 8, 2026", "Environmental"),
      doc("sb", 5, "Soil Fertility Analysis", "PDF", "2.5 MB", "Apr 10, 2026", "Environmental"),
      doc("sb", 6, "Machinery & Silo Asset Register", "XLSX", "0.8 MB", "Apr 12, 2026", "Operations"),
      doc("sb", 7, "Yield Ledger (2019–2025)", "XLSX", "1.2 MB", "Apr 12, 2026", "Operations"),
      doc("sb", 8, "Season Operating Budget", "XLSX", "0.7 MB", "Apr 15, 2026", "Financial"),
      doc("sb", 9, "Field Coordinates (KML)", "KML", "0.4 MB", "Mar 20, 2026", "Survey"),
      doc("sb", 10, "Independent Valuation Report (Demo)", "PDF", "3.6 MB", "Apr 20, 2026", "Financial"),
    ],
  },

  /* ----------------------------------- COCOA ----------------------------------- */
  cocoa: {
    profile: "Shade-grown cocoa cooperative · Ashanti Region",
    termMonths: 12,
    minInvestmentUsd: 1_000,
    daysRemaining: 38,
    waterLabel: "Stream & irrigation pond",
    facilities: ["Fermentation & drying centre", "Cooperative warehouse"],
    drivers: [
      { id: "d1", label: "Cocoa price environment", description: "Prices elevated after multi-season supply deficit", impactPct: 25, icon: "scale" },
      { id: "d2", label: "Cooperative structure", description: "Aggregated beans from 420 member farms", impactPct: 17, icon: "shield" },
      { id: "d3", label: "Bean quality & fermentation", description: "Consistent grade-1 fermentation protocol", impactPct: 14, icon: "sprout" },
      { id: "d4", label: "Traceability premium", description: "Farm-level traceability sought by EU buyers", impactPct: 11, icon: "globe" },
    ],
    verification: [
      step("v1", "Cooperative registration on file", "May 8, 2026"),
      step("v2", "Member farm map uploaded", "May 22, 2026"),
      step("v3", "Buyer agreement checked", "Jun 5, 2026"),
      step("v4", "Approved by platform review (simulated)", "Jun 26, 2026"),
    ],
    sustainability: (a) => [
      { id: "s1", value: `${fmtNum(a * 0.7)} ha`, label: "Shade-grown agroforestry cocoa", icon: "trees" },
      { id: "s2", value: "420", label: "Member farms with farm-level traceability", icon: "shield" },
      { id: "s3", value: "No child labour", label: "Cooperative monitoring policy (self-reported)", icon: "sprout" },
      { id: "s4", value: "-14%", label: "Emissions vs. full-sun cocoa", icon: "co2" },
    ],
    riskFactors: [
      risk("r1", "Price volatility", 49, "Cocoa prices are historically volatile; forward cover is limited."),
      risk("r2", "Disease (swollen shoot, black pod)", 46, "Disease incidence monitored; replanting programme under way."),
      risk("r3", "Regulatory & marketing board", 41, "Farm-gate pricing and forward sales are state-influenced."),
      risk("r4", "Climate & rainfall", 36, "Irregular rainfall affects flowering and pod set."),
      risk("r5", "Legal & land tenure", 30, "Customary tenure documented by traditional authorities."),
    ],
    activity: (name, t, f) => [
      { id: "a1", title: "Funding progress", detail: `${f}% of the ${t} target is now committed.`, date: "Oct 10, 2026", kind: "funding" },
      { id: "a2", title: "Demo AI price scenario updated", detail: "Base case revised after futures move.", date: "Oct 3, 2026", kind: "model" },
      { id: "a3", title: "Mid-crop fermentation report", detail: "Grade-1 share at 88% of lots.", date: "Sep 26, 2026", kind: "document" },
      { id: "a4", title: "Member farm audit round", detail: `${name} traceability sampling completed.`, date: "Sep 12, 2026", kind: "verification" },
    ],
    comparables: [
      { name: "Ashanti Cocoa Co-op", location: "Ashanti", valuePerHa: 3_900, yieldPct: 9.0 },
      { name: "Western North Estate", location: "Western North", valuePerHa: 4_200, yieldPct: 9.4 },
      { name: "Eastern Region Smallholders", location: "Eastern", valuePerHa: 3_600, yieldPct: 8.7 },
    ],
    valuationFactors: [
      { label: "Cocoa futures level", impact: "+3.3%" },
      { label: "Fermentation quality premium", impact: "+0.9%" },
      { label: "Disease pressure", impact: "-1.7%" },
      { label: "Local currency movement", impact: "-0.8%" },
    ],
    production: { a: [520, 540, 560, 570, 580, 590, 590, 590, 590, 590], b: [180, 190, 200, 205, 210, 215, 215, 215, 215, 215] },
    documents: [
      doc("cc", 1, "Cooperative Registration Certificate", "PDF", "1.8 MB", "May 8, 2026", "Legal"),
      doc("cc", 2, "Member Farm Map & Census", "PDF", "6.4 MB", "May 22, 2026", "Survey"),
      doc("cc", 3, "Buyer Purchase Agreement Summary", "PDF", "2.3 MB", "Jun 5, 2026", "Financial"),
      doc("cc", 4, "Traceability Programme Description", "PDF", "2.0 MB", "Jun 9, 2026", "Environmental"),
      doc("cc", 5, "Disease Survey (Swollen Shoot)", "PDF", "3.1 MB", "Jun 12, 2026", "Environmental"),
      doc("cc", 6, "Bean Quality Test Results", "PDF", "1.5 MB", "Jun 14, 2026", "Operations"),
      doc("cc", 7, "Harvest Ledger (2019–2025)", "XLSX", "1.0 MB", "Jun 15, 2026", "Operations"),
      doc("cc", 8, "Twelve-Month Budget", "XLSX", "0.6 MB", "Jun 18, 2026", "Financial"),
      doc("cc", 9, "Farm Boundary Coordinates (KML)", "KML", "0.3 MB", "May 22, 2026", "Survey"),
      doc("cc", 10, "Independent Valuation Report (Demo)", "PDF", "3.3 MB", "Jun 22, 2026", "Financial"),
    ],
  },

  /* ----------------------------------- PEPPER ----------------------------------- */
  pepper: {
    profile: "Black pepper on living & concrete supports · Gia Lai",
    termMonths: 42,
    minInvestmentUsd: 7_500,
    daysRemaining: 52,
    waterLabel: "Irrigation pond",
    facilities: ["Drying yard & sorting line", "Spice warehouse"],
    drivers: [
      { id: "d1", label: "Pepper spot price & demand", description: "Global spice demand, Vietnam ~35% of supply", impactPct: 20, icon: "globe" },
      { id: "d2", label: "Vine age & productivity", description: "Average vine age 6 years, near peak yield", impactPct: 18, icon: "sprout" },
      { id: "d3", label: "Quality grade (550 g/L)", description: "Premium grade fetches a price premium", impactPct: 13, icon: "shield" },
      { id: "d4", label: "Drip irrigation coverage", description: "Dry-season water security", impactPct: 10, icon: "droplets" },
    ],
    verification: [
      step("v1", "Land-use rights verified", "Jan 16, 2024"),
      step("v2", "Plantation boundary survey", "Jan 31, 2024"),
      step("v3", "Cooperative ownership checked", "Feb 14, 2024"),
      step("v4", "Spice food-safety compliance", "Feb 28, 2024"),
    ],
    sustainability: (a) => [
      { id: "s1", value: `${fmtNum(a * 0.7)} ha`, label: "Under sustainable-pepper (SPC) practices", icon: "sprout" },
      { id: "s2", value: "-27%", label: "Chemical fertiliser use vs. regional average", icon: "co2" },
      { id: "s3", value: "23%", label: "Water saved with drip irrigation", icon: "water" },
      { id: "s4", value: "340", label: "Family growers in the outgrower programme", icon: "shield" },
    ],
    riskFactors: [
      risk("r1", "Pepper price volatility", 47, "Spot-price sensitive; partial forward sales cover ~40% of expected harvest."),
      risk("r2", "Disease (quick wilt, yellowing)", 43, "Phytophthora and nematode control programme; replanting reserve of 6% of vines."),
      risk("r3", "Climate & dry-season stress", 31, "Drip irrigation and mulching reduce drought exposure."),
      risk("r4", "Harvest & drying execution", 27, "Own drying yard and sorting line reduce post-harvest loss."),
      risk("r5", "Legal & title", 15, "Land-use rights verified against provincial registry."),
    ],
    activity: (name, t, f) => [
      { id: "a1", title: "Funding milestone reached", detail: `${f}% of the ${t} target is now committed.`, date: "Oct 6, 2026", kind: "funding" },
      { id: "a2", title: "Harvest quality report", detail: "Average density 548 g/L; 91% passed export grade.", date: "Sep 27, 2026", kind: "document" },
      { id: "a3", title: "AI valuation refreshed", detail: "Base case revised after spot-price update.", date: "Sep 17, 2026", kind: "model" },
      { id: "a4", title: "Disease scouting round completed", detail: "Wilt incidence below 2.1% of vines.", date: "Sep 4, 2026", kind: "verification" },
      { id: "a5", title: "Food-safety compliance confirmed", detail: "Residue-testing sign-off.", date: "Feb 28, 2024", kind: "verification" },
    ],
    comparables: [
      { name: "Dak Nong Pepper Farm", location: "Dak Nong", valuePerHa: 17_400, yieldPct: 8.4 },
      { name: "Dong Nai Pepper Estate", location: "Dong Nai", valuePerHa: 16_100, yieldPct: 7.9 },
      { name: "Chu Se Pepper Co-op", location: "Gia Lai", valuePerHa: 15_300, yieldPct: 7.6 },
    ],
    valuationFactors: [
      { label: "Pepper spot-price index", impact: "+3.4%" },
      { label: "Vine-age productivity", impact: "+1.5%" },
      { label: "Quality-grade premium", impact: "+0.7%" },
      { label: "Disease & replanting costs", impact: "-1.8%" },
    ],
    production: { a: [380, 420, 460, 490, 510, 520, 520, 510, 500, 490], b: [90, 100, 115, 125, 130, 135, 135, 130, 130, 125] },
    documents: [
      doc("pe", 1, "Land-Use Right Certificates", "PDF", "3.9 MB", "Jan 16, 2024", "Legal"),
      doc("pe", 2, "Plantation Survey & Block Map", "PDF", "5.8 MB", "Jan 31, 2024", "Survey"),
      doc("pe", 3, "Cooperative Ownership Memorandum", "PDF", "1.3 MB", "Feb 14, 2024", "Legal"),
      doc("pe", 4, "Food-Safety & Residue Test Results", "PDF", "2.5 MB", "Feb 28, 2024", "Environmental"),
      doc("pe", 5, "Soil & Disease (Wilt) Survey", "PDF", "3.0 MB", "Mar 11, 2024", "Environmental"),
      doc("pe", 6, "Spice Offtake Agreement Summary", "PDF", "2.0 MB", "Mar 25, 2024", "Financial"),
      doc("pe", 7, "Sustainable Pepper Platform (SPC) Certificate", "PDF", "2.9 MB", "Apr 3, 2024", "Environmental"),
      doc("pe", 8, "Vine Age & Replanting Ledger", "XLSX", "1.0 MB", "Apr 9, 2024", "Operations"),
      doc("pe", 9, "Harvest Yield Ledger (2018–2025)", "XLSX", "0.9 MB", "Apr 16, 2024", "Operations"),
      doc("pe", 10, "Four-Year Operating Budget", "XLSX", "0.6 MB", "Apr 22, 2024", "Financial"),
      doc("pe", 11, "Plantation Boundary Coordinates (KML)", "KML", "0.1 MB", "Jan 31, 2024", "Survey"),
      doc("pe", 12, "Independent Valuation Report", "PDF", "3.2 MB", "May 8, 2024", "Financial"),
    ],
  },

};
