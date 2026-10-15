"use client";

import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { Asset } from "@/types/asset";
import { formatHa } from "@/lib/formatters";
import { categoryColor } from "@/lib/categories";
import { FitOnResize, dotIcon, MapControls, SATELLITE_ATTRIBUTION, SATELLITE_URL } from "./MapChrome";

const FALLBACK: [[number, number], [number, number]] = [
  [-20, -70],
  [30, 120],
];

/** Fits whichever listings are visible, so global assets and Vietnam-only filters both frame well. */
function boundsOf(assets: Asset[]): [[number, number], [number, number]] {
  if (assets.length === 0) return FALLBACK;
  const lats = assets.map((a) => a.coords[0]);
  const lngs = assets.map((a) => a.coords[1]);
  const pad = assets.length === 1 ? 2 : 1;
  return [
    [Math.min(...lats) - pad, Math.min(...lngs) - pad],
    [Math.max(...lats) + pad, Math.max(...lngs) + pad],
  ];
}

export default function ListingsMapCanvas({ assets, basePath = "/marketplace" }: { assets: Asset[]; basePath?: string }) {
  const BOUNDS = boundsOf(assets);
  return (
    <MapContainer key={assets.map((a) => a.id).join("|")} bounds={BOUNDS} boundsOptions={{ padding: [6, 6] }} zoomSnap={0.25} scrollWheelZoom={false} className="h-full w-full" aria-label="Map of marketplace assets">
      <TileLayer url={SATELLITE_URL} attribution={SATELLITE_ATTRIBUTION} />
      <FitOnResize bounds={BOUNDS} padding={6} />
      {assets.map((a) => (
        <Marker key={a.id} position={a.coords} icon={dotIcon(categoryColor(a.category), 28)} title={a.name}>
          <Popup>
            <div className="min-w-[180px]">
              <p className="font-heading text-sm font-bold">{a.name}</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {a.location} · {formatHa(a.areaHa)}
              </p>
              <p className="figure mt-1.5 text-xs">
                Target yield <strong>{a.targetYield}%</strong> · {a.risk} risk
              </p>
              <Link href={`${basePath}/${a.slug}`} className="mt-2 inline-block text-xs font-semibold text-green-600 underline">
                View details
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
      <MapControls />
    </MapContainer>
  );
}
