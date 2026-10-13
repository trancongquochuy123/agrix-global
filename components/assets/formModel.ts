import { polygonAreaHa, scaleToArea, type LatLng } from "@/lib/geo";

export const STEPS = ["Asset Type", "Ownership", "Location", "Operations", "Review"] as const;

export const categoryOptions = ["Perennial crops", "Annual crops", "Carbon & forestry", "Agri-energy"] as const;

export const cropOptions: Record<string, string[]> = {
  "Perennial crops": ["Coffee", "Durian", "Black pepper", "Cashew", "Rubber"],
  "Annual crops": ["Rice", "Maize", "Cassava", "Vegetables"],
  "Carbon & forestry": ["Mangrove restoration", "Reforestation", "Agroforestry"],
  "Agri-energy": ["Agrivoltaics", "Biogas"],
};

export const currencies = ["USD", "VND", "KRW", "EUR"] as const;
export const ownershipTypes = ["Individual", "Company", "Cooperative", "Long-term land lease"] as const;
export const landUseTypes = ["Perennial crops", "Annual crops", "Forestry", "Aquaculture", "Mixed use"] as const;
export const irrigationMethods = ["Drip irrigation", "Sprinkler", "Flood / paddy", "Rain-fed"] as const;
export const certificationOptions = ["VietGAP", "GlobalG.A.P.", "Rainforest Alliance", "Organic", "4C"] as const;
export const harvestSeasons = ["Jan – Mar", "Apr – Jun", "Jul – Sep", "Oct – Dec", "Year-round"] as const;
export const provinces = ["Dak Lak", "Dak Nong", "Lam Dong", "Gia Lai", "An Giang", "Ca Mau", "Ninh Thuan", "Can Tho", "Ben Tre"] as const;

export const knownPlaces: { match: string; province: string; address: string; coords: LatLng }[] = [
  { match: "dak lak", province: "Dak Lak", address: "Ea Kar District, Dak Lak Province, Vietnam", coords: [12.7704, 108.2417] },
  { match: "buon ma thuot", province: "Dak Lak", address: "Buon Ma Thuot City, Dak Lak Province, Vietnam", coords: [12.668, 108.05] },
  { match: "dak nong", province: "Dak Nong", address: "Dak Mil District, Dak Nong Province, Vietnam", coords: [12.45, 107.6] },
  { match: "lam dong", province: "Lam Dong", address: "Di Linh District, Lam Dong Province, Vietnam", coords: [11.58, 108.07] },
  { match: "gia lai", province: "Gia Lai", address: "Chu Se District, Gia Lai Province, Vietnam", coords: [13.98, 108.0] },
  { match: "an giang", province: "An Giang", address: "Thoai Son District, An Giang Province, Vietnam", coords: [10.52, 105.13] },
  { match: "ca mau", province: "Ca Mau", address: "Nam Can District, Ca Mau Province, Vietnam", coords: [9.17, 105.15] },
  { match: "ninh thuan", province: "Ninh Thuan", address: "Thuan Nam District, Ninh Thuan Province, Vietnam", coords: [11.56, 108.99] },
];

export interface UploadedFile {
  name: string;
  sizeKb: number;
}

export interface RegisterData {
  // Step 1
  category: string;
  cropType: string;
  assetName: string;
  estimatedValue: string;
  totalArea: string;
  currency: string;
  // Step 2
  ownerName: string;
  organization: string;
  ownershipType: string;
  certificateNumber: string;
  issueDate: string;
  documents: UploadedFile[];
  // Step 3
  vertices: LatLng[];
  address: string;
  province: string;
  latitude: string;
  longitude: string;
  landUse: string;
  satelliteImage: UploadedFile | null;
  farmPhotos: UploadedFile[];
  // Step 4
  operationsCrop: string;
  annualProduction: string;
  historicalYield: string;
  irrigation: string;
  certifications: string[];
  harvestSeason: string;
  operatingCosts: string;
  expectedRevenue: string;
}

const BASE_CENTER: LatLng = [12.7704, 108.2417];
const RADII = [1.0, 0.86, 1.12, 0.92, 1.06, 0.8, 1.0, 0.9, 1.14, 0.86];

/** Default boundary: an irregular 10-point polygon scaled to exactly 125.6 ha. */
export function defaultBoundary(center: LatLng = BASE_CENTER): LatLng[] {
  const raw: LatLng[] = RADII.map((r, i) => {
    const a = (i / RADII.length) * Math.PI * 2 + 0.3;
    return [center[0] + Math.sin(a) * 0.01 * r, center[1] + Math.cos(a) * 0.0103 * r];
  });
  return scaleToArea(raw, 125.6);
}

export const initialData: RegisterData = {
  category: "Perennial crops",
  cropType: "Coffee",
  assetName: "",
  estimatedValue: "",
  totalArea: "",
  currency: "USD",
  ownerName: "",
  organization: "",
  ownershipType: "Individual",
  certificateNumber: "",
  issueDate: "",
  documents: [],
  vertices: defaultBoundary(),
  address: "Ea Kar District, Dak Lak Province, Vietnam",
  province: "Dak Lak",
  latitude: BASE_CENTER[0].toFixed(4),
  longitude: BASE_CENTER[1].toFixed(4),
  landUse: "Perennial crops",
  satelliteImage: null,
  farmPhotos: [],
  operationsCrop: "Coffee",
  annualProduction: "",
  historicalYield: "",
  irrigation: "",
  certifications: [],
  harvestSeason: "",
  operatingCosts: "",
  expectedRevenue: "",
};

export const drawnAreaHa = (d: RegisterData) => polygonAreaHa(d.vertices);

export type Errors = Partial<Record<string, string>>;

const positive = (v: string) => v.trim() !== "" && Number.isFinite(Number(v)) && Number(v) > 0;

export function validateStep(step: number, d: RegisterData): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (d.assetName.trim().length < 3) e.assetName = "Enter an asset name (at least 3 characters).";
    if (!d.cropType) e.cropType = "Select a crop or project type.";
    if (!positive(d.estimatedValue)) e.estimatedValue = "Enter an estimated value greater than 0.";
    if (!positive(d.totalArea)) e.totalArea = "Enter the total area in hectares.";
  }
  if (step === 1) {
    if (d.ownerName.trim().length < 2) e.ownerName = "Enter the registered owner's name.";
    if (!/^[A-Za-z0-9\-/ ]{5,}$/.test(d.certificateNumber.trim())) e.certificateNumber = "Enter a valid certificate number (5+ characters).";
    if (!d.issueDate) e.issueDate = "Select the certificate issue date.";
    else if (new Date(d.issueDate) > new Date()) e.issueDate = "Issue date cannot be in the future.";
  }
  if (step === 2) {
    if (d.vertices.length < 3) e.boundary = "Draw a boundary with at least 3 points.";
    if (d.address.trim().length < 5) e.address = "Enter the asset address.";
    if (!d.province) e.province = "Select a province or city.";
    const lat = Number(d.latitude);
    const lng = Number(d.longitude);
    if (!Number.isFinite(lat) || lat < 8 || lat > 24) e.latitude = "Latitude must be within Vietnam (8–24).";
    if (!Number.isFinite(lng) || lng < 102 || lng > 110.5) e.longitude = "Longitude must be within Vietnam (102–110.5).";
  }
  if (step === 3) {
    if (!d.operationsCrop) e.operationsCrop = "Select the primary crop.";
    if (!positive(d.annualProduction)) e.annualProduction = "Enter annual production greater than 0.";
    if (!positive(d.historicalYield)) e.historicalYield = "Enter the historical yield.";
    if (!d.irrigation) e.irrigation = "Select an irrigation method.";
    if (!d.harvestSeason) e.harvestSeason = "Select a harvest season.";
    if (!positive(d.operatingCosts)) e.operatingCosts = "Enter annual operating costs.";
    if (!positive(d.expectedRevenue)) e.expectedRevenue = "Enter expected annual revenue.";
  }
  return e;
}

export const money = (v: string, currency: string) =>
  v.trim() === "" || !Number.isFinite(Number(v))
    ? "—"
    : new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(v));
