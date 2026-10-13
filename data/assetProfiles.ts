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

export const profiles: Record<Exclude<AssetCategory, "coffee">, CategoryProfile> = {
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

  /* ----------------------------------- DURIAN ----------------------------------- */
  durian: {
    profile: "Mature Monthong & Ri6 orchard · Central Highlands",
    termMonths: 60,
    minInvestmentUsd: 15_000,
    daysRemaining: 19,
    waterLabel: "Drip-irrigation reservoir",
    facilities: ["Packing & cold-chain house", "Nursery & grafting unit"],
    drivers: [
      { id: "d1", label: "Export demand (China, cold chain)", description: "Official fresh-fruit protocol in force", impactPct: 24, icon: "globe" },
      { id: "d2", label: "Tree maturity & age profile", description: "78% of trees are in peak bearing years", impactPct: 19, icon: "trees" },
      { id: "d3", label: "Premium cultivar mix", description: "Monthong and Ri6 with farm-gate premium", impactPct: 14, icon: "sprout" },
      { id: "d4", label: "Packing-house traceability", description: "Coded orchards meet export audits", impactPct: 10, icon: "shield" },
    ],
    verification: [
      step("v1", "Land-use rights verified", "Jan 9, 2024"),
      step("v2", "Orchard planting-area code issued", "Jan 22, 2024"),
      step("v3", "Packing-house registration checked", "Feb 5, 2024"),
      step("v4", "Plant-protection compliance", "Feb 19, 2024"),
    ],
    sustainability: (a) => [
      { id: "s1", value: `${fmtNum(a * 0.74)} ha`, label: "Under export-coded, GlobalG.A.P. audited farming", icon: "shield" },
      { id: "s2", value: "62,000", label: "Mature trees with tracked tree-level yield", icon: "trees" },
      { id: "s3", value: "-31%", label: "Water use via drip irrigation vs. flood", icon: "water" },
      { id: "s4", value: "-18%", label: "Chemical inputs under IPM programme", icon: "co2" },
    ],
    riskFactors: [
      risk("r1", "Export market & phytosanitary rules", 41, "Concentrated in one export corridor; cadmium and pesticide residue testing is monitored per batch."),
      risk("r2", "Fruit-drop & disease (Phytophthora)", 37, "Soil drainage works and preventive fungicide programme reduce root-rot exposure."),
      risk("r3", "Climate & flowering timing", 33, "Dry-season irrigation buffers flowering; late-rain events may delay harvest windows."),
      risk("r4", "Harvest & cold-chain execution", 28, "Own packing house with 48-hour farm-to-port target."),
      risk("r5", "Legal & title", 13, "Land-use rights and planting codes verified."),
    ],
    activity: (name, t, f) => [
      { id: "a1", title: "Funding milestone reached", detail: `${f}% of the ${t} target is now committed.`, date: "Oct 10, 2026", kind: "funding" },
      { id: "a2", title: "Pre-season flowering survey", detail: "Flower set on 81% of mature trees; harvest forecast confirmed.", date: "Oct 3, 2026", kind: "verification" },
      { id: "a3", title: "AI valuation refreshed", detail: "Base case raised after export price update.", date: "Sep 25, 2026", kind: "model" },
      { id: "a4", title: "Packing-house audit passed", detail: "Annual export-protocol inspection completed.", date: "Sep 12, 2026", kind: "document" },
      { id: "a5", title: "Plant-protection compliance confirmed", detail: "Provincial authority sign-off.", date: "Feb 19, 2024", kind: "verification" },
    ],
    comparables: [
      { name: "Dak Lak Durian Estate", location: "Dak Lak", valuePerHa: 24_800, yieldPct: 10.4 },
      { name: "Tien Giang Ri6 Orchard", location: "Tien Giang", valuePerHa: 22_600, yieldPct: 9.7 },
      { name: "Kon Tum Durian Estate", location: "Kon Tum", valuePerHa: 19_900, yieldPct: 9.2 },
    ],
    valuationFactors: [
      { label: "Export farm-gate price", impact: "+4.2%" },
      { label: "Tree maturity profile", impact: "+2.1%" },
      { label: "Cold-chain capacity", impact: "+0.9%" },
      { label: "Phytosanitary compliance risk", impact: "-1.6%" },
    ],
    production: { a: [900, 1200, 1500, 1750, 1950, 2100, 2200, 2250, 2300, 2300], b: [400, 650, 900, 1100, 1300, 1450, 1550, 1600, 1650, 1650] },
    documents: [
      doc("du", 1, "Land-Use Right Certificates", "PDF", "4.4 MB", "Jan 9, 2024", "Legal"),
      doc("du", 2, "Orchard Planting-Area Code Registration", "PDF", "1.6 MB", "Jan 22, 2024", "Legal"),
      doc("du", 3, "Orchard Survey & Tree Census Map", "PDF", "8.2 MB", "Jan 30, 2024", "Survey"),
      doc("du", 4, "Packing-House Registration & Audit Report", "PDF", "3.2 MB", "Feb 5, 2024", "Operations"),
      doc("du", 5, "Phytosanitary & Residue Test Results", "PDF", "2.4 MB", "Feb 19, 2024", "Environmental"),
      doc("du", 6, "Export Offtake Term Sheet", "PDF", "2.0 MB", "Mar 3, 2024", "Financial"),
      doc("du", 7, "GlobalG.A.P. Certification", "PDF", "4.8 MB", "Mar 12, 2024", "Environmental"),
      doc("du", 8, "Drip-Irrigation & Soil Drainage Plan", "PDF", "3.0 MB", "Mar 20, 2024", "Environmental"),
      doc("du", 9, "Tree-Level Yield Ledger", "XLSX", "1.8 MB", "Mar 28, 2024", "Operations"),
      doc("du", 10, "Five-Year Operating Budget", "XLSX", "0.8 MB", "Apr 4, 2024", "Financial"),
      doc("du", 11, "Orchard Boundary Coordinates (KML)", "KML", "0.1 MB", "Jan 30, 2024", "Survey"),
      doc("du", 12, "Independent Valuation Report", "PDF", "3.9 MB", "Apr 18, 2024", "Financial"),
    ],
  },

  /* ----------------------------------- CARBON ----------------------------------- */
  carbon: {
    profile: "Mangrove restoration & blue-carbon credits · Mekong Delta coast",
    termMonths: 120,
    minInvestmentUsd: 25_000,
    daysRemaining: 63,
    waterLabel: "Tidal channel",
    facilities: ["Ranger & monitoring station", "Seedling nursery"],
    drivers: [
      { id: "d1", label: "Carbon credit price outlook", description: "Blue-carbon premium over forestry credits", impactPct: 26, icon: "scale" },
      { id: "d2", label: "Sequestration rate (tCO₂e/ha/yr)", description: "Verified 9–12 tCO₂e/ha annually", impactPct: 20, icon: "trees" },
      { id: "d3", label: "Verification standard", description: "Verra VCS / Gold Standard pathway", impactPct: 15, icon: "shield" },
      { id: "d4", label: "Coastal protection co-benefits", description: "Storm-surge buffer for 14 communes", impactPct: 9, icon: "droplets" },
    ],
    verification: [
      step("v1", "Forest-allocation decision verified", "Jan 5, 2024"),
      step("v2", "Project boundary & baseline mapped", "Jan 29, 2024"),
      step("v3", "Community benefit-sharing agreement", "Feb 12, 2024"),
      step("v4", "Registry pre-validation completed", "Mar 4, 2024"),
    ],
    sustainability: (a) => [
      { id: "s1", value: `${fmtNum(a * 10.4 / 1000)}k tCO₂e`, label: "Expected annual sequestration", icon: "co2" },
      { id: "s2", value: `${fmtNum(a * 0.91)} ha`, label: "Mangrove area under permanent protection", icon: "trees" },
      { id: "s3", value: "+38%", label: "Fish & crab biodiversity index vs. baseline", icon: "water" },
      { id: "s4", value: "14", label: "Coastal communes with benefit-sharing", icon: "shield" },
    ],
    riskFactors: [
      risk("r1", "Credit price & registry risk", 36, "Credits partly pre-sold through forward purchase agreements; issuance timing depends on verification cycles."),
      risk("r2", "Permanence & reversal (storm, erosion)", 44, "Buffer pool of 18% withheld; sea-dyke and wave-breaker works reduce loss risk."),
      risk("r3", "Regulatory & carbon-rights clarity", 39, "Vietnam carbon-market rules still developing; legal opinion obtained on credit ownership."),
      risk("r4", "Community & land-use pressure", 23, "Aquaculture conversion monitored by satellite; benefit-sharing aligns incentives."),
      risk("r5", "Legal & title", 14, "Forest-allocation decision verified against provincial records."),
    ],
    activity: (name, t, f) => [
      { id: "a1", title: "Funding milestone reached", detail: `${f}% of the ${t} target is now committed.`, date: "Oct 7, 2026", kind: "funding" },
      { id: "a2", title: "Monitoring report submitted", detail: "Annual biomass plot measurements uploaded to the registry.", date: "Sep 29, 2026", kind: "document" },
      { id: "a3", title: "Credit forward-sale priced", detail: "Tranche 2 pre-sold at a premium to the voluntary-market average.", date: "Sep 18, 2026", kind: "funding" },
      { id: "a4", title: "Satellite canopy verification", detail: "Canopy cover matched the registered baseline.", date: "Sep 5, 2026", kind: "verification" },
      { id: "a5", title: "Registry pre-validation completed", detail: "Project design document accepted.", date: "Mar 4, 2024", kind: "verification" },
    ],
    comparables: [
      { name: "Ben Tre Coastal Carbon", location: "Ben Tre", valuePerHa: 3_900, yieldPct: 6.4 },
      { name: "Binh Dinh Coastal Carbon", location: "Binh Dinh", valuePerHa: 4_200, yieldPct: 6.9 },
      { name: "Quang Ninh Mangrove Carbon", location: "Quang Ninh", valuePerHa: 3_600, yieldPct: 6.1 },
    ],
    valuationFactors: [
      { label: "Blue-carbon credit price index", impact: "+3.8%" },
      { label: "Sequestration rate revision", impact: "+1.7%" },
      { label: "Verification milestone achieved", impact: "+1.2%" },
      { label: "Carbon-market regulatory uncertainty", impact: "-2.0%" },
    ],
    production: { a: [60, 90, 130, 170, 210, 250, 290, 320, 350, 370], b: [140, 150, 160, 170, 175, 180, 185, 190, 190, 195] },
    documents: [
      doc("ca", 1, "Forest-Allocation Decision & Land Records", "PDF", "5.6 MB", "Jan 5, 2024", "Legal"),
      doc("ca", 2, "Project Boundary & Baseline Map", "PDF", "9.1 MB", "Jan 29, 2024", "Survey"),
      doc("ca", 3, "Carbon-Rights Legal Opinion", "PDF", "1.7 MB", "Feb 6, 2024", "Legal"),
      doc("ca", 4, "Community Benefit-Sharing Agreement", "PDF", "2.2 MB", "Feb 12, 2024", "Legal"),
      doc("ca", 5, "Project Design Document (VCS)", "PDF", "7.3 MB", "Mar 4, 2024", "Environmental"),
      doc("ca", 6, "Biomass Plot & Sequestration Study", "PDF", "4.6 MB", "Mar 14, 2024", "Environmental"),
      doc("ca", 7, "Biodiversity & Coastal Protection Assessment", "PDF", "3.4 MB", "Mar 22, 2024", "Environmental"),
      doc("ca", 8, "Credit Forward-Purchase Agreement Summary", "PDF", "2.1 MB", "Apr 8, 2024", "Financial"),
      doc("ca", 9, "Credit Issuance Schedule", "XLSX", "0.5 MB", "Apr 10, 2024", "Financial"),
      doc("ca", 10, "Ten-Year Cost & Revenue Model", "XLSX", "1.0 MB", "Apr 15, 2024", "Financial"),
      doc("ca", 11, "Project Boundary Coordinates (KML)", "KML", "0.3 MB", "Jan 29, 2024", "Survey"),
      doc("ca", 12, "Independent Valuation Report", "PDF", "3.6 MB", "May 2, 2024", "Financial"),
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

  /* ------------------------------------ SOLAR ----------------------------------- */
  solar: {
    profile: "Agri-solar hub: panels above shade-tolerant crops · Ninh Thuan",
    termMonths: 180,
    minInvestmentUsd: 20_000,
    daysRemaining: 34,
    waterLabel: "Water storage pond",
    facilities: ["Substation & inverter yard", "Crop-processing shed"],
    drivers: [
      { id: "d1", label: "Power purchase agreement (PPA)", description: "15-year PPA with utility-grade offtaker", impactPct: 25, icon: "zap" },
      { id: "d2", label: "Solar irradiance & capacity factor", description: "Ninh Thuan: among Vietnam’s highest irradiance", impactPct: 19, icon: "sun" },
      { id: "d3", label: "Dual land-use revenue", description: "Shade-tolerant crops under raised panels", impactPct: 12, icon: "sprout" },
      { id: "d4", label: "Grid connection & curtailment", description: "Dedicated substation, low curtailment", impactPct: 9, icon: "shield" },
    ],
    verification: [
      step("v1", "Land lease & permits verified", "Jan 11, 2024"),
      step("v2", "Site boundary & layout survey", "Jan 26, 2024"),
      step("v3", "Grid connection agreement checked", "Feb 9, 2024"),
      step("v4", "Power-licence compliance", "Feb 23, 2024"),
    ],
    sustainability: (a) => [
      { id: "s1", value: `${fmtNum(a * 0.55)} MWp`, label: "Installed generation capacity", icon: "zap" },
      { id: "s2", value: `${fmtNum(a * 0.55 * 1.6)} GWh`, label: "Expected clean energy per year", icon: "sun" },
      { id: "s3", value: `${fmtNum(a * 0.55 * 1.6 * 0.65)}k tCO₂e`, label: "Emissions avoided annually", icon: "co2" },
      { id: "s4", value: "38%", label: "Land area also producing crops", icon: "wheat" },
    ],
    riskFactors: [
      risk("r1", "Power price & PPA counterparty", 24, "Fixed-tariff PPA with investment-grade offtaker; limited merchant exposure."),
      risk("r2", "Grid curtailment & connection", 38, "Curtailment events monitored; battery-ready inverter design."),
      risk("r3", "Equipment degradation & O&M", 25, "Tier-1 modules with 25-year performance warranty."),
      risk("r4", "Climate & extreme weather", 30, "Wind-rated mounting structures; dust-soiling losses tracked monthly."),
      risk("r5", "Legal & permitting", 17, "Land lease and power licence verified; policy changes monitored."),
    ],
    activity: (name, t, f) => [
      { id: "a1", title: "Funding milestone reached", detail: `${f}% of the ${t} target is now committed.`, date: "Oct 9, 2026", kind: "funding" },
      { id: "a2", title: "Performance ratio report", detail: "PR of 82.4% for Q3, +0.9 pt vs. plan.", date: "Oct 1, 2026", kind: "document" },
      { id: "a3", title: "AI valuation refreshed", detail: "Base case updated for tariff and irradiance data.", date: "Sep 21, 2026", kind: "model" },
      { id: "a4", title: "Thermal drone inspection", detail: "0.3% of strings flagged; repaired within 7 days.", date: "Sep 8, 2026", kind: "verification" },
      { id: "a5", title: "Power-licence compliance confirmed", detail: "Regulator sign-off.", date: "Feb 23, 2024", kind: "verification" },
    ],
    comparables: [
      { name: "Binh Thuan Solar Farm", location: "Binh Thuan", valuePerHa: 41_000, yieldPct: 7.6 },
      { name: "Ninh Phuoc Agri-Solar", location: "Ninh Thuan", valuePerHa: 44_500, yieldPct: 8.0 },
      { name: "Tay Ninh Solar Park", location: "Tay Ninh", valuePerHa: 38_200, yieldPct: 7.2 },
    ],
    valuationFactors: [
      { label: "PPA tariff & indexation", impact: "+2.9%" },
      { label: "Irradiance & output revision", impact: "+1.6%" },
      { label: "Crop revenue under panels", impact: "+0.8%" },
      { label: "Curtailment & grid constraints", impact: "-1.5%" },
    ],
    production: { a: [210, 218, 222, 225, 225, 224, 222, 220, 218, 216], b: [380, 400, 420, 430, 440, 440, 440, 440, 440, 440] },
    documents: [
      doc("so", 1, "Land Lease & Site Permits", "PDF", "4.7 MB", "Jan 11, 2024", "Legal"),
      doc("so", 2, "Site Layout & Boundary Survey", "PDF", "7.9 MB", "Jan 26, 2024", "Survey"),
      doc("so", 3, "Power Purchase Agreement Summary", "PDF", "2.4 MB", "Feb 9, 2024", "Financial"),
      doc("so", 4, "Grid Connection Agreement", "PDF", "2.9 MB", "Feb 12, 2024", "Legal"),
      doc("so", 5, "Electricity Generation Licence", "PDF", "1.1 MB", "Feb 23, 2024", "Legal"),
      doc("so", 6, "Environmental & Social Impact Assessment", "PDF", "5.2 MB", "Mar 6, 2024", "Environmental"),
      doc("so", 7, "Energy Yield Assessment (P50/P90)", "PDF", "3.6 MB", "Mar 18, 2024", "Operations"),
      doc("so", 8, "Equipment Warranty & O&M Contract", "PDF", "3.3 MB", "Mar 27, 2024", "Operations"),
      doc("so", 9, "Agri-Solar Crop Trial Results", "PDF", "2.2 MB", "Apr 5, 2024", "Environmental"),
      doc("so", 10, "Fifteen-Year Financial Model", "XLSX", "1.4 MB", "Apr 12, 2024", "Financial"),
      doc("so", 11, "Site Boundary Coordinates (KML)", "KML", "0.2 MB", "Jan 26, 2024", "Survey"),
      doc("so", 12, "Independent Valuation Report", "PDF", "3.7 MB", "May 14, 2024", "Financial"),
    ],
  },
};
