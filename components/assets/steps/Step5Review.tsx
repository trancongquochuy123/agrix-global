"use client";

import { AlertTriangle, CheckCircle2, Pencil } from "lucide-react";
import { AssetCard } from "@/components/marketplace/AssetCard";
import type { Asset } from "@/types/asset";
import { drawnAreaHa, money, type RegisterData } from "../formModel";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/react";

function Section({ title, onEdit, rows }: { title: string; onEdit: () => void; rows: [string, string][] }) {
  const t = useT();
  return (
    <section className="rounded-xl border border-line">
      <header className="flex items-center justify-between border-b border-line bg-green-50/50 px-4 py-2.5">
        <h3 className="text-sm font-bold">{t(title)}</h3>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-green-700 transition-colors hover:bg-green-100">
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> {t("Edit")}<span className="sr-only"> {t(title)}</span>
        </button>
      </header>
      <dl className="grid gap-x-6 gap-y-3 p-4 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-ink-muted">{t(k)}</dt>
            <dd className="mt-0.5 break-words text-sm font-semibold">{v ? t(v) : "—"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function Step5Review({
  data,
  preview,
  goTo,
  compliance,
  onCompliance,
  complianceError,
}: {
  data: RegisterData;
  preview: Asset;
  goTo: (step: number) => void;
  compliance: boolean;
  onCompliance: (v: boolean) => void;
  complianceError?: string;
}) {
  const t = useT();
  const missing = [
    data.documents.length === 0 && t("Land certificate file"),
    !data.satelliteImage && t("Recent satellite image"),
    data.farmPhotos.length < 3 && `${t("Farm photos")} (${data.farmPhotos.length}/3)`,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-4">
      <section aria-label={t("Listing preview")} className="rounded-xl border border-line p-4">
        <h3 className="text-sm font-bold">{t("Listing preview")}</h3>
        <p className="mb-3 text-xs text-ink-muted">{t("This is how investors will see your card once an admin approves it.")}</p>
        <div className="pointer-events-none max-w-sm" inert>
          <AssetCard asset={preview} wishlisted={false} onToggleWishlist={() => {}} />
        </div>
      </section>
      <Section
        title="1. Asset Type"
        onEdit={() => goTo(0)}
        rows={[
          ["Category", data.category],
          ["Crop or project type", data.cropType],
          ["Asset name", data.assetName],
          ["Estimated value", money(data.estimatedValue, data.currency)],
          ["Total area", data.totalArea ? `${data.totalArea} ha` : ""],
        ]}
      />
      <Section
        title="2. Ownership"
        onEdit={() => goTo(1)}
        rows={[
          ["Owner", data.ownerName],
          ["Organization", data.organization],
          ["Ownership type", data.ownershipType],
          ["Land certificate no.", data.certificateNumber],
          ["Issue date", data.issueDate],
          ["Documents", data.documents.length ? data.documents.map((d) => d.name).join(", ") : t("None uploaded")],
        ]}
      />
      <Section
        title="3. Location"
        onEdit={() => goTo(2)}
        rows={[
          ["Address", data.address],
          ["Province/City", data.province],
          ["Coordinates", `${data.latitude}, ${data.longitude}`],
          ["Boundary area", t("{area} ha ({n} points)", { area: drawnAreaHa(data).toFixed(1), n: data.vertices.length })],
          ["Land use", data.landUse],
        ]}
      />
      <Section
        title="4. Operations"
        onEdit={() => goTo(3)}
        rows={[
          ["Crop", data.operationsCrop],
          ["Annual production", data.annualProduction ? `${data.annualProduction} ${t("t / year")}` : ""],
          ["Historical yield", data.historicalYield ? `${data.historicalYield} t / ha` : ""],
          ["Irrigation", data.irrigation],
          ["Harvest season", data.harvestSeason],
          ["Certifications", data.certifications.join(", ") || t("None")],
          ["Operating costs", money(data.operatingCosts, data.currency)],
          ["Expected revenue", money(data.expectedRevenue, data.currency)],
        ]}
      />

      <Section
        title="5. Financing"
        onEdit={() => goTo(4)}
        rows={[
          ["Financing target", money(data.financingTarget, data.currency)],
          ["Term", data.termMonths ? t("{n} months", { n: data.termMonths }) : ""],
          ["Illustrative return", data.expectedReturn ? `${data.expectedReturn}${t("% p.a.")}` : ""],
          ["Purpose", data.description],
        ]}
      />

      <div className={cn("flex gap-3 rounded-xl border p-4 text-sm", missing.length ? "border-[#F1DCB4] bg-[#FBEFD9]/60" : "border-green-100 bg-green-50")}>
        {missing.length ? (
          <>
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
            <div>
              <p className="font-semibold">{t("Still needed before verification can finish")}</p>
              <p className="mt-0.5 text-ink-muted">{missing.join(" · ")}. {t("Missing items may delay the admin review.")}</p>
            </div>
          </>
        ) : (
          <>
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" aria-hidden="true" />
            <p className="font-semibold">{t("All required documents are attached.")}</p>
          </>
        )}
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white p-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-green-600">
          <input
            type="checkbox"
            checked={compliance}
            onChange={(e) => onCompliance(e.target.checked)}
            aria-describedby={complianceError ? "compliance-error" : undefined}
            aria-invalid={complianceError ? true : undefined}
            className="mt-0.5 h-4 w-4 accent-green-600"
          />
          <span className="text-sm">
            {t("I confirm that the information provided is accurate, that I am legally entitled to register this asset, and that I consent to AGRIX verifying it against public records and satellite data.")}
          </span>
        </label>
        {complianceError && (
          <p id="compliance-error" role="alert" className="mt-1.5 text-xs font-medium text-danger">
            {t(complianceError)}
          </p>
        )}
      </div>
    </div>
  );
}
