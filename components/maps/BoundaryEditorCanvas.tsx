"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polygon, ScaleControl, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { LatLng } from "@/lib/geo";
import { centroid } from "@/lib/geo";
import { MapControls, SATELLITE_ATTRIBUTION, SATELLITE_URL, STREET_ATTRIBUTION, STREET_URL } from "./MapChrome";
import { useT } from "@/lib/i18n/react";

export type EditorTool = "select" | "draw" | "delete";

interface Props {
  vertices: LatLng[];
  onChange: (next: LatLng[]) => void;
  tool: EditorTool;
  center: LatLng;
  areaLabel: string;
  street: boolean;
  onToggleBase: () => void;
}

const handleIcon = L.divIcon({ className: "", html: '<div class="vertex-handle"></div>', iconSize: [14, 14], iconAnchor: [7, 7] });

function Recenter({ center }: { center: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 0.6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1]]);
  return null;
}

function ClickToDraw({ tool, vertices, onChange }: Pick<Props, "tool" | "vertices" | "onChange">) {
  useMapEvents({
    click(e) {
      if (tool !== "draw") return;
      onChange([...vertices, [e.latlng.lat, e.latlng.lng]]);
    },
  });
  return null;
}

export default function BoundaryEditorCanvas({ vertices, onChange, tool, center, areaLabel, street, onToggleBase }: Props) {
  const t = useT();
  const mid = centroid(vertices);
  return (
    <MapContainer
      center={center}
      zoom={14}
      zoomSnap={0.5}
      scrollWheelZoom={false}
      className="h-full w-full"
      style={{ cursor: tool === "draw" ? "crosshair" : undefined }}
      aria-label={t("Interactive map for drawing the asset boundary")}
    >
      {street ? (
        <TileLayer key="street" url={STREET_URL} attribution={STREET_ATTRIBUTION} />
      ) : (
        <TileLayer key="sat" url={SATELLITE_URL} attribution={SATELLITE_ATTRIBUTION} />
      )}
      <Recenter center={center} />
      <ClickToDraw tool={tool} vertices={vertices} onChange={onChange} />
      {vertices.length >= 3 && (
        <Polygon positions={vertices} pathOptions={{ color: "#A8D84E", weight: 3, fillColor: "#5F9F38", fillOpacity: 0.4 }} />
      )}
      {vertices.map((v, i) => (
        <Marker
          key={`${i}-${vertices.length}`}
          position={v}
          icon={handleIcon}
          draggable={tool !== "delete"}
          title={tool === "delete" ? t("Click to remove this point") : t("Boundary point {n}", { n: i + 1 })}
          eventHandlers={{
            dragend: (e) => {
              const ll = (e.target as L.Marker).getLatLng();
              onChange(vertices.map((p, idx) => (idx === i ? [ll.lat, ll.lng] : p)));
            },
            click: () => {
              if (tool === "delete" && vertices.length > 3) onChange(vertices.filter((_, idx) => idx !== i));
            },
          }}
        />
      ))}
      {vertices.length >= 3 && (
        <Marker
          position={mid}
          interactive={false}
          keyboard={false}
          icon={L.divIcon({
            className: "",
            iconSize: [80, 28],
            iconAnchor: [40, 14],
            html: `<div style="background:#0B241D;color:#fff;border-radius:8px;padding:5px 10px;font:700 13px Inter,sans-serif;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.4)">${areaLabel}</div>`,
          })}
        />
      )}
      <MapControls onToggleLayer={onToggleBase} />
      <ScaleControl position="bottomleft" imperial={false} />
    </MapContainer>
  );
}


