export type ModuleId = "valuation" | "risk" | "credit" | "twin";
export type TwinLayer = "ndvi" | "health" | "elevation" | "moisture";

export interface IntelligenceModule {
  id: ModuleId;
  title: string;
  description: string;
}

export interface SensorPoint {
  id: string;
  kind: "soil" | "weather" | "camera" | "water";
  label: string;
  position: [number, number];
}

export interface WeatherDay {
  day: string;
  high: number;
  low: number;
  condition: "sun" | "partly" | "rain";
}

export interface AlertItem {
  id: string;
  title: string;
  block: string;
  ago: string;
  severity: "critical" | "warning" | "info";
}

export interface RiskIndicator {
  id: string;
  label: string;
  level: "Low" | "Moderate" | "High";
  score: number;
}

export interface MapLocation {
  id: string;
  name: string;
  region: "Central Highlands" | "Mekong Delta" | "Central Coast" | "Northern Vietnam";
  category: "coffee" | "rice" | "durian" | "carbon";
  position: [number, number];
  valueUsd: number;
  areaHa: number;
  status: "Verified" | "In Review";
}

export interface UserProfile {
  name: string;
  initials: string;
  role: string;
  email: string;
}
