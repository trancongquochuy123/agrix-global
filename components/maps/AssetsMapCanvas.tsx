"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { MapLocation } from "@/types/intelligence";
import { mapLocations, categoryColors, regionSummaries } from "@/data/locations";
import { CATEGORIES, categoryLabel } from "@/lib/categories";
import { formatHa, formatUsd } from "@/lib/formatters";
import { FitOnResize, dotIcon, labelIcon, MapControls, MapLegend, SATELLITE_ATTRIBUTION, SATELLITE_URL } from "./MapChrome";

const BOUNDS: [[number, number], [number, number]] = [
  [8.2, 102.0],
  [23.6, 110.2],
];

const mapCategories = new Set<string>(mapLocations.map((m) => m.category));


const CLUSTER_PX = 44;

/** Groups nearby markers at the current zoom so dense regions (Central Highlands) stay readable. */
function ClusteredMarkers({ items }: { items: MapLocation[] }) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  const groups = useMemo(() => {
    const out: { items: MapLocation[]; x: number; y: number }[] = [];
    for (const m of items) {
      const p = map.project(m.position, zoom);
      const hit = out.find((g) => Math.hypot(g.x - p.x, g.y - p.y) < CLUSTER_PX);
      if (hit) {
        hit.items.push(m);
        hit.x = (hit.x * (hit.items.length - 1) + p.x) / hit.items.length;
        hit.y = (hit.y * (hit.items.length - 1) + p.y) / hit.items.length;
      } else out.push({ items: [m], x: p.x, y: p.y });
    }
    return out;
  }, [items, map, zoom]);

  return (
    <>
      {groups.map((g) => {
        if (g.items.length === 1) {
          const m = g.items[0];
          return (
            <Marker key={m.id} position={m.position} icon={dotIcon(categoryColors[m.category], 26)} title={m.name}>
              <Popup>
            <div className="min-w-[180px]">
              <p className="font-heading text-sm font-bold text-ink">{m.name}</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {categoryLabel(m.category)} · {m.region}
              </p>
              <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-ink-muted">Value</dt>
                  <dd className="figure font-semibold text-ink">{formatUsd(m.valueUsd)}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Area</dt>
                  <dd className="figure font-semibold text-ink">{formatHa(m.areaHa)}</dd>
                </div>
              </dl>
              <p className="mt-2 text-xs font-semibold text-green-700">{m.status}</p>
              <Link href="/marketplace" className="mt-2 inline-block text-xs font-semibold text-green-600 underline">
                Browse marketplace
              </Link>
            </div>
          </Popup>
            </Marker>
          );
        }
        const center = map.unproject(L.point(g.x, g.y), zoom);
        return (
          <Marker
            key={`c-${g.items.map((i) => i.id).join("-")}`}
            position={center}
            icon={dotIcon("#0E513D", 36, String(g.items.length))}
            title={`${g.items.length} assets — select to zoom in`}
            eventHandlers={{
              click: () => map.flyToBounds(L.latLngBounds(g.items.map((i) => i.position)), { padding: [60, 60], maxZoom: zoom + 3 }),
            }}
          />
        );
      })}
    </>
  );
}

export default function AssetsMapCanvas({ category }: { category: string }) {
  const visible = category === "all" ? mapLocations : mapLocations.filter((m) => m.category === category);

  return (
    <MapContainer
      bounds={BOUNDS}
      boundsOptions={{ padding: [6, 6] }}
      zoomSnap={0.25}
      scrollWheelZoom={false}
      className="h-full w-full"
      aria-label="Map of verified agricultural assets across Vietnam"
    >
      <TileLayer url={SATELLITE_URL} attribution={SATELLITE_ATTRIBUTION} />
      <FitOnResize bounds={BOUNDS} padding={6} />
      {category === "all" &&
        regionSummaries.map((r) => (
          <Marker
            key={r.region}
            position={r.position}
            interactive={false}
            keyboard={false}
            icon={labelIcon(
              `<span style="font-size:12px;font-weight:700">${r.region}</span><br/>${r.mix}<br/>${r.assets} assets`,
              150,
            )}
          />
        ))}
      <ClusteredMarkers items={visible} />
      <MapControls className="top-3" />
      <MapLegend
        className="bottom-3 right-3"
        items={[
          ...CATEGORIES.filter((c) => mapCategories.has(c.id)).map((c) => ({ id: c.id, label: c.longLabel, color: c.color })),
        ]}
      />
    </MapContainer>
  );
}
