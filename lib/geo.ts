export type LatLng = [number, number];

export function centroid(points: LatLng[]): LatLng {
  const n = points.length || 1;
  const [lat, lng] = points.reduce<LatLng>((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
  return [lat / n, lng / n];
}

/** Planar area (hectares) of a small polygon using a local equirectangular projection. */
export function polygonAreaHa(points: LatLng[]): number {
  if (points.length < 3) return 0;
  const [lat0, lng0] = centroid(points);
  const kx = 111_320 * Math.cos((lat0 * Math.PI) / 180);
  const ky = 110_540;
  const xy = points.map(([lat, lng]) => [(lng - lng0) * kx, (lat - lat0) * ky] as const);
  let sum = 0;
  for (let i = 0; i < xy.length; i++) {
    const [x1, y1] = xy[i];
    const [x2, y2] = xy[(i + 1) % xy.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2 / 10_000;
}

export function translate(points: LatLng[], dLat: number, dLng: number): LatLng[] {
  return points.map(([lat, lng]) => [lat + dLat, lng + dLng]);
}

/** Scales a polygon about its centroid so that its area matches `targetHa`. */
export function scaleToArea(points: LatLng[], targetHa: number): LatLng[] {
  const area = polygonAreaHa(points);
  if (!area) return points;
  const k = Math.sqrt(targetHa / area);
  const [cLat, cLng] = centroid(points);
  return points.map(([lat, lng]) => [cLat + (lat - cLat) * k, cLng + (lng - cLng) * k]);
}

export function boundsOf(points: LatLng[]): [LatLng, LatLng] {
  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
}
