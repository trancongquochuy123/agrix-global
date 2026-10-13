"use client";

import dynamic from "next/dynamic";
import { MapSkeleton } from "./MapFrame";

/** Leaflet touches `window`, so every map is loaded client-side only. */
const loading = () => <MapSkeleton />;

export const AssetsMap = dynamic(() => import("./AssetsMapCanvas"), { ssr: false, loading });
export const AssetDetailMap = dynamic(() => import("./AssetDetailMapCanvas"), { ssr: false, loading });
export const BoundaryEditor = dynamic(() => import("./BoundaryEditorCanvas"), { ssr: false, loading });
export const TwinMap = dynamic(() => import("./TwinMapCanvas"), { ssr: false, loading });
export const ListingsMap = dynamic(() => import("./ListingsMapCanvas"), { ssr: false, loading });
