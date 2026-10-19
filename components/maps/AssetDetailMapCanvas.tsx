"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { Circle, MapContainer, Marker, Polygon, Polyline, ScaleControl, TileLayer, Tooltip } from "react-leaflet";
import type { AssetDetail } from "@/types/asset";
import { boundsOf } from "@/lib/geo";
import {
  FitOnResize,
  dotIcon,
  MapControls,
  MapLegend,
  NorthArrow,
  SATELLITE_ATTRIBUTION,
  SATELLITE_URL,
  STREET_ATTRIBUTION,
  STREET_URL,
  type LegendItem,
} from "./MapChrome";
import { LocationInset } from "./LocationInset";
import { useT } from "@/lib/i18n/react";

const LAYERS = [
  { id: "boundary", label: "Property Boundary", color: "#FFFFFF", shape: "square" as const },
  { id: "plantation", label: "Coffee Plantation", color: "#5F9F38", shape: "dot" as const },
  { id: "water", label: "Water Bodies", color: "#4A90D9", shape: "dot" as const },
  { id: "roads", label: "Access Roads", color: "#FFFFFF", shape: "line" as const },
  { id: "facilities", label: "Facilities", color: "#9AA5A0", shape: "dot" as const },
];

export default function AssetDetailMapCanvas({ detail, plantationLabel, locationLabel }: { detail: AssetDetail; plantationLabel: string; locationLabel: string }) {
  const t = useT();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [street, setStreet] = useState(false);
  const [tiles, setTiles] = useState<"loading" | "ready">("loading");
  const [fellBack, setFellBack] = useState(false);
  const errors = useRef(0);
  // Esri has no sub-metre imagery for some rural areas: cap native zoom and let Leaflet upscale.
  const useStreet = street || fellBack;
  const tileHandlers = useMemo(
    () => ({
      loading: () => setTiles("loading"),
      load: () => {
        errors.current = 0;
        setTiles("ready");
      },
      tileerror: () => {
        errors.current += 1;
        // Several failed tiles in a row → satellite provider is unreachable (blocked, offline, rate limited).
        if (errors.current >= 4) setFellBack(true);
      },
    }),
    [],
  );
  const toggleBase = useCallback(() => {
    errors.current = 0;
    setTiles("loading");
    if (fellBack) {
      setFellBack(false);
      setStreet(false);
    } else setStreet((s) => !s);
  }, [fellBack]);
  const bounds = useMemo(() => boundsOf(detail.boundary), [detail.boundary]);
  const show = (id: string) => !hidden.has(id);
  const legend: LegendItem[] = LAYERS.map((l) => ({
    ...l,
    label: l.id === "plantation" ? plantationLabel : l.id === "water" ? t(detail.waterLabel) : t(l.label),
    checked: show(l.id),
  }));
  const center: [number, number] = [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2];

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [28, 28] }}
      maxZoom={18}
      zoomSnap={0.25}
      scrollWheelZoom={false}
      className="h-full w-full"
      aria-label={t("Satellite map of {place}", { place: t(detail.town) })}
    >
      {useStreet ? (
        <TileLayer key="street" url={STREET_URL} attribution={STREET_ATTRIBUTION} maxZoom={19} eventHandlers={tileHandlers} />
      ) : (
        <TileLayer
          key="sat"
          url={SATELLITE_URL}
          attribution={SATELLITE_ATTRIBUTION}
          maxNativeZoom={16}
          maxZoom={18}
          keepBuffer={4}
          eventHandlers={tileHandlers}
        />
      )}
      {show("plantation") &&
        detail.plantations.map((p, i) => (
          <Polygon
            key={i}
            positions={p}
            pathOptions={{ color: "#8FC16B", weight: 1.5, fillColor: "#5F9F38", fillOpacity: 0.38 }}
          >
            <Tooltip sticky>{plantationLabel} · {t("Block {id}", { id: String.fromCharCode(65 + i) })}</Tooltip>
          </Polygon>
        ))}
      {show("water") && (
        <Circle
          center={detail.water.center}
          radius={detail.water.radiusM}
          pathOptions={{ color: "#9CC9F2", weight: 1.5, fillColor: "#4A90D9", fillOpacity: 0.7 }}
        >
          <Tooltip sticky>{t(detail.waterLabel)}</Tooltip>
        </Circle>
      )}
      {show("roads") &&
        detail.roads.map((r, i) => (
          <Polyline key={i} positions={r} pathOptions={{ color: "#FFFFFF", weight: 2.5, opacity: 0.9, dashArray: "2 6" }} />
        ))}
      {show("boundary") && (
        <Polygon positions={detail.boundary} pathOptions={{ color: "#FFFFFF", weight: 3, fillOpacity: 0.02 }}>
          <Tooltip sticky>{t("Property boundary")}</Tooltip>
        </Polygon>
      )}
      {show("facilities") &&
        detail.facilities.map((f) => (
          <Marker key={f.name} position={f.position} icon={dotIcon("#6B7A74", 20)} title={t(f.name)}>
            <Tooltip direction="top" offset={[0, -10]}>
              {t(f.name)}
            </Tooltip>
          </Marker>
        ))}
      <FitOnResize bounds={bounds} padding={28} />
      <MapControls onToggleLayer={toggleBase} fullscreen />
      <ScaleControl position="bottomleft" imperial={false} />
      <NorthArrow className="left-3 top-3" />
      <MapLegend
        className="bottom-9 left-3"
        items={legend}
        onToggle={(id) =>
          setHidden((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          })
        }
      />
      <LocationInset position={center} label={locationLabel} className="bottom-3 right-3" />
      <div className="pointer-events-none absolute left-1/2 top-3 z-[1000] flex -translate-x-1/2 flex-col items-center gap-2">
        {tiles === "loading" && (
          <div role="status" className="flex items-center gap-2 rounded-full bg-forest-950/85 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            {useStreet ? t("Loading street map…") : t("Loading satellite imagery…")}
          </div>
        )}
        {fellBack && (
          <div role="status" className="flex items-center gap-2 rounded-full bg-warning/95 px-3 py-1.5 text-xs font-semibold text-forest-950">
            <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
            {t("Satellite imagery unavailable — showing street map")}
          </div>
        )}
      </div>
    </MapContainer>
  );
}
