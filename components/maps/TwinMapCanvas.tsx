"use client";

import { MapContainer, Marker, Polygon, Popup, ScaleControl, TileLayer } from "react-leaflet";
import { sensors } from "@/data/analytics";
import { getAssetDetail } from "@/data/assets";
import type { SensorPoint } from "@/types/intelligence";
import { boundsOf, centroid } from "@/lib/geo";
import { FitOnResize, dotIcon, MapControls, MapLegend, SATELLITE_ATTRIBUTION, SATELLITE_URL } from "./MapChrome";

export const sensorColors: Record<SensorPoint["kind"], string> = {
  soil: "#E8683A",
  weather: "#3B8FE0",
  camera: "#4CAF50",
  water: "#26B5C9",
};

const readings: Record<SensorPoint["kind"], (id: string) => string> = {
  soil: (id) => `Moisture ${id === "s2" ? 34 : id === "s1" ? 29 : 41}% · pH 6.${id === "s3" ? 4 : 1}`,
  weather: () => "26°C · 62% humidity · 8 km/h wind",
  camera: () => "Canopy feed online · last frame 2 min ago",
  water: (id) => (id === "h1" ? "Reservoir level 78%" : "Flow 14 L/s"),
};

function span(points: [number, number][]) {
  const [[a, b], [c, d]] = boundsOf(points);
  return Math.max(c - a, d - b) || 1;
}

export default function TwinMapCanvas({ slug = "dak-lak-coffee-estate" }: { slug?: string }) {
  const detail = getAssetDetail(slug);
  const reference = getAssetDetail("dak-lak-coffee-estate");
  if (!detail || !reference) return null;
  const bounds = boundsOf(detail.boundary);
  const k = span(detail.boundary) / span(reference.boundary);
  const [refLat, refLng] = centroid(reference.boundary);
  const [lat, lng] = centroid(detail.boundary);
  const placed = sensors.map((s) => ({
    ...s,
    position: [lat + (s.position[0] - refLat) * k, lng + (s.position[1] - refLng) * k] as [number, number],
  }));

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [36, 36] }}
      zoomSnap={0.25}
      scrollWheelZoom={false}
      className="h-full w-full"
      aria-label="Satellite map with sensor locations"
    >
      <TileLayer url={SATELLITE_URL} attribution={SATELLITE_ATTRIBUTION} />
      <FitOnResize bounds={bounds} padding={36} />
      <Polygon positions={detail.boundary} pathOptions={{ color: "#FFFFFF", weight: 2.5, fillOpacity: 0.03 }} />
      {placed.map((s) => (
        <Marker key={s.id} position={s.position} icon={dotIcon(sensorColors[s.kind], 24)} title={s.label}>
          <Popup>
            <p className="font-heading text-sm font-bold">{s.label}</p>
            <p className="mt-1 text-xs text-ink-muted">{readings[s.kind](s.id)}</p>
          </Popup>
        </Marker>
      ))}
      <MapControls />
      <ScaleControl position="bottomright" imperial={false} />
      <MapLegend
        className="bottom-3 left-3"
        items={[
          { id: "b", label: "Field boundary", color: "#FFFFFF", shape: "square" },
          { id: "soil", label: "Soil sensor", color: sensorColors.soil },
          { id: "weather", label: "Weather station", color: sensorColors.weather },
          { id: "camera", label: "Camera unit", color: sensorColors.camera },
          { id: "water", label: "Water sensor", color: sensorColors.water },
        ]}
      />
    </MapContainer>
  );
}
