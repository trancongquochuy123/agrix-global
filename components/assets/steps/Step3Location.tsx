"use client";

import { useRef, useState, type FormEvent } from "react";
import { Camera, CheckCircle2, FileText, Image as ImageIcon, Lock, MapPin, MousePointer2, RotateCcw, Search, Spline, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { BoundaryEditor } from "@/components/maps";
import type { EditorTool } from "@/components/maps/BoundaryEditorCanvas";
import { MapPanel } from "@/components/maps/MapFrame";
import { centroid, polygonAreaHa, translate, type LatLng } from "@/lib/geo";
import { cn } from "@/lib/utils";
import { Field, InputWithSuffix, inputProps } from "../FormField";
import { defaultBoundary, knownPlaces, landUseTypes, provinces, type UploadedFile } from "../formModel";
import type { StepProps } from "./StepProps";

const tools: { id: EditorTool; label: string; icon: typeof MousePointer2 }[] = [
  { id: "select", label: "Select and move points", icon: MousePointer2 },
  { id: "draw", label: "Add boundary points", icon: Spline },
  { id: "delete", label: "Remove boundary points", icon: Trash2 },
];

function toUploaded(list: FileList | null): UploadedFile[] {
  return list ? Array.from(list).map((f) => ({ name: f.name, sizeKb: Math.max(1, Math.round(f.size / 1024)) })) : [];
}

function QuickUpload({
  id,
  label,
  accept,
  multiple,
  onFiles,
}: {
  id: string;
  label: string;
  accept: string;
  multiple?: boolean;
  onFiles: (files: UploadedFile[]) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        aria-label={label}
        onChange={(e) => {
          onFiles(toUploaded(e.target.files));
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="rounded-md border border-line bg-white px-2.5 py-1 text-xs font-semibold text-green-700 transition-colors hover:bg-green-50"
      >
        Upload
      </button>
    </>
  );
}

export function Step3Location({ data, update, errors }: StepProps) {
  const [tool, setTool] = useState<EditorTool>("select");
  const [street, setStreet] = useState(false);
  const [query, setQuery] = useState("Dak Lak, Vietnam");
  const [center, setCenter] = useState<LatLng>(() => centroid(data.vertices));
  const area = polygonAreaHa(data.vertices);
  const declared = Number(data.totalArea);
  const mismatch = declared > 0 && area > 0 && Math.abs(declared - area) / declared > 0.2;

  const setVertices = (next: LatLng[]) => {
    const [lat, lng] = centroid(next);
    update({ vertices: next, latitude: lat.toFixed(4), longitude: lng.toFixed(4) });
  };

  const search = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    const place = knownPlaces.find((p) => q.includes(p.match));
    if (!place) {
      toast.error("Location not found", { description: "Try a province such as Dak Lak, Lam Dong, Gia Lai or An Giang." });
      return;
    }
    const [cLat, cLng] = centroid(data.vertices);
    const moved = translate(data.vertices, place.coords[0] - cLat, place.coords[1] - cLng);
    update({
      vertices: moved,
      province: place.province,
      address: place.address,
      latitude: place.coords[0].toFixed(4),
      longitude: place.coords[1].toFixed(4),
    });
    setCenter(place.coords);
    toast.success(`Map centred on ${place.province}`);
  };

  const onCoord = (key: "latitude" | "longitude", value: string) => {
    const n = Number(value);
    const patch: Partial<typeof data> = { [key]: value };
    if (value.trim() !== "" && Number.isFinite(n)) {
      const [cLat, cLng] = centroid(data.vertices);
      const valid = key === "latitude" ? n >= 8 && n <= 24 : n >= 102 && n <= 110.5;
      if (valid) {
        const moved = key === "latitude" ? translate(data.vertices, n - cLat, 0) : translate(data.vertices, 0, n - cLng);
        patch.vertices = moved;
        setCenter(centroid(moved));
      }
    }
    update(patch);
  };

  const hasBoundary = data.vertices.length >= 3;
  const checklist = [
    {
      id: "boundary",
      title: "Boundary coordinates",
      desc: "Draw the exact boundary of your asset on the map",
      icon: MapPin,
      done: hasBoundary,
      action: null,
    },
    {
      id: "cert",
      title: "Land certificate",
      desc: "Upload a copy of the land use right certificate or equivalent document",
      icon: FileText,
      done: data.documents.length > 0,
      action: (
        <QuickUpload id="qu-cert" label="Upload land certificate" accept=".pdf,.jpg,.jpeg,.png" onFiles={(f) => update({ documents: [...data.documents, ...f] })} />
      ),
    },
    {
      id: "sat",
      title: "Recent satellite image",
      desc: "Provide a clear satellite image (within 6 months)",
      icon: ImageIcon,
      done: !!data.satelliteImage,
      action: (
        <QuickUpload id="qu-sat" label="Upload satellite image" accept=".jpg,.jpeg,.png,.tif,.tiff" onFiles={(f) => update({ satelliteImage: f[0] ?? null })} />
      ),
    },
    {
      id: "photos",
      title: "Farm photos",
      desc: `Upload at least 3 photos showing the asset and surrounding area${data.farmPhotos.length ? ` (${data.farmPhotos.length}/3)` : ""}`,
      icon: Camera,
      done: data.farmPhotos.length >= 3,
      action: (
        <QuickUpload id="qu-photos" label="Upload farm photos" accept=".jpg,.jpeg,.png" multiple onFiles={(f) => update({ farmPhotos: [...data.farmPhotos, ...f] })} />
      ),
    },
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">
        <div className="mb-3 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <MapPin className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-bold leading-tight">Asset Location</h3>
            <p className="text-sm text-ink-muted">Define the location and boundary of your agricultural asset</p>
          </div>
        </div>

        <MapPanel className="h-[340px] sm:h-[400px]">
          <BoundaryEditor
            vertices={data.vertices}
            onChange={setVertices}
            tool={tool}
            center={center}
            areaLabel={`${area.toFixed(1)} ha`}
            street={street}
            onToggleBase={() => setStreet((s) => !s)}
          />
          <form onSubmit={search} role="search" className="absolute left-3 top-3 z-[1000] w-[min(16rem,calc(100%-6rem))]">
            <label className="relative block">
              <span className="sr-only">Search location</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-8 text-sm shadow-card focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                placeholder="Search location"
              />
              {query && (
                <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-muted hover:text-ink">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </label>
          </form>
          <div className="absolute left-3 top-16 z-[1000] flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-card" role="toolbar" aria-label="Boundary tools" aria-orientation="vertical">
            {tools.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                title={label}
                aria-label={label}
                aria-pressed={tool === id}
                onClick={() => setTool(id)}
                className={cn("flex h-10 w-10 items-center justify-center transition-colors", tool === id ? "bg-forest-800 text-white" : "text-ink hover:bg-green-50")}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
            <button
              type="button"
              title="Reset boundary"
              aria-label="Reset boundary"
              onClick={() => {
                setVertices(defaultBoundary(centroid(data.vertices)));
                toast("Boundary reset to the default 125.6 ha polygon");
              }}
              className="flex h-10 w-10 items-center justify-center border-t border-line text-ink transition-colors hover:bg-green-50"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </MapPanel>
        <p className="mt-2 text-xs text-ink-muted" aria-live="polite">
          {tool === "draw" ? "Click the map to add boundary points." : tool === "delete" ? "Click a point to remove it (minimum 3)." : "Drag points to reshape the boundary."}
        </p>
        {errors.boundary && (
          <p role="alert" className="mt-1 text-sm font-medium text-danger">
            {errors.boundary}
          </p>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field id="address" label="Address" required error={errors.address}>
            <input {...inputProps("address", errors.address)} value={data.address} onChange={(e) => update({ address: e.target.value })} autoComplete="street-address" />
          </Field>
          <Field id="province" label="Province/City" required error={errors.province}>
            <select {...inputProps("province", errors.province)} value={data.province} onChange={(e) => update({ province: e.target.value })}>
              <option value="">Select a province</option>
              {provinces.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field id="latitude" label="Latitude" required error={errors.latitude}>
            <input {...inputProps("latitude", errors.latitude)} inputMode="decimal" value={data.latitude} onChange={(e) => onCoord("latitude", e.target.value)} />
          </Field>
          <Field id="longitude" label="Longitude" required error={errors.longitude}>
            <input {...inputProps("longitude", errors.longitude)} inputMode="decimal" value={data.longitude} onChange={(e) => onCoord("longitude", e.target.value)} />
          </Field>
          <Field id="area" label="Area (hectares)" required hint={mismatch ? `Differs from declared ${declared} ha` : undefined}>
            <InputWithSuffix suffix="ha">
              <input id="area" readOnly value={area.toFixed(1)} className="field bg-green-50/60 pr-9" aria-describedby="area-hint" />
            </InputWithSuffix>
          </Field>
          <Field id="landUse" label="Land use type" required>
            <select {...inputProps("landUse")} value={data.landUse} onChange={(e) => update({ landUse: e.target.value })}>
              {landUseTypes.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <aside aria-labelledby="data-required" className="h-fit rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 id="data-required" className="text-lg font-bold leading-tight">Data Required</h3>
            <p className="mt-1 text-xs text-ink-muted">Please prepare the following documents and information to verify your asset. All data will be reviewed for compliance.</p>
          </div>
        </div>
        <ul className="mt-4 space-y-2.5">
          {checklist.map((c) => (
            <li key={c.id} className="flex items-start gap-3 rounded-xl border border-line p-3">
              <div className="mt-0.5 shrink-0 text-green-600">
                {c.done ? <CheckCircle2 className="h-6 w-6" aria-hidden="true" /> : <c.icon className="h-6 w-6" aria-hidden="true" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight">{c.title}</p>
                <p className="mt-0.5 text-xs text-ink-muted">{c.desc}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                    c.done ? "bg-green-100 text-green-700" : "bg-[#FBEFD9] text-[#8A5A0B]",
                  )}
                >
                  {c.done ? "Completed" : "Pending"}
                </span>
                {!c.done && c.action}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex items-start gap-2.5 border-t border-line pt-4 text-xs text-ink-muted">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            <strong className="block text-ink">Secure Upload</strong>
            Files are only recorded by name in this prototype and never leave your browser.
          </span>
        </p>
      </aside>
    </div>
  );
}
