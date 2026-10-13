"use client";

import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { Asset } from "@/types/asset";
import { formatHa } from "@/lib/formatters";
import { FitOnResize, dotIcon, MapControls, SATELLITE_ATTRIBUTION, SATELLITE_URL } from "./MapChrome";

const BOUNDS: [[number, number], [number, number]] = [
  [8.2, 102.0],
  [23.6, 110.2],
];

export default function ListingsMapCanvas({ assets }: { assets: Asset[] }) {
  return (
    <MapContainer bounds={BOUNDS} boundsOptions={{ padding: [6, 6] }} zoomSnap={0.25} scrollWheelZoom={false} className="h-full w-full" aria-label="Map of marketplace assets">
      <TileLayer url={SATELLITE_URL} attribution={SATELLITE_ATTRIBUTION} />
      <FitOnResize bounds={BOUNDS} padding={6} />
      {assets.map((a) => (
        <Marker key={a.id} position={a.coords} icon={dotIcon("#5F9F38", 28)} title={a.name}>
          <Popup>
            <div className="min-w-[180px]">
              <p className="font-heading text-sm font-bold">{a.name}</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {a.location} · {formatHa(a.areaHa)}
              </p>
              <p className="figure mt-1.5 text-xs">
                Target yield <strong>{a.targetYield}%</strong> · {a.risk} risk
              </p>
              <Link href={`/marketplace/${a.slug}`} className="mt-2 inline-block text-xs font-semibold text-green-600 underline">
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
