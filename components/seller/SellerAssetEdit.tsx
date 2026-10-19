"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, Send } from "lucide-react";
import { toast } from "sonner";
import { Field, InputWithSuffix, MoneyInput, inputProps } from "@/components/assets/FormField";
import { MAX_AREA_HA, MAX_RETURN_PCT, MAX_TERM_MONTHS, MIN_TERM_MONTHS, numbers } from "@/components/assets/formModel";
import { UploadZone } from "@/components/assets/UploadZone";
import { Button } from "@/components/ui/button";
import { ChartCard } from "@/components/shared/ChartCard";
import { EmptyState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/shared/SkeletonLoader";
import { useDemo, useHydrated, useSession } from "@/lib/demo/hooks";
import { assetById } from "@/lib/demo/selectors";
import { resubmitAsset, saveAssetEdits, type AssetEditPatch } from "@/lib/demo/store";
import { MIN_RETURN_PCT, parseNumeric, parseQuantity } from "@/lib/numeric";
import type { Asset } from "@/types/asset";
import { useT } from "@/lib/i18n/react";

type Form = { name: string; description: string; assetValue: string; target: string; term: string; ret: string; area: string; uploads: Asset["uploads"] };
type Errors = Partial<Record<keyof AssetEditPatch, string>>;

const initial = (a: Asset): Form => ({
  name: a.name,
  description: a.description,
  assetValue: String(a.assetValueUsd),
  target: String(a.targetUsd),
  term: String(a.termMonths),
  ret: String(a.targetYield),
  area: String(a.areaHa),
  uploads: a.uploads.map((u) => ({ ...u })),
});

/** Parses and validates the form with the same strict rules as the registration wizard. */
function toPatch(f: Form): { patch?: AssetEditPatch; errors: Errors } {
  const errors: Errors = {};
  if (f.name.trim().length < 3) errors.name = "Enter an asset name (at least 3 characters).";
  if (f.description.trim().length < 20) errors.description = "Describe the financing purpose (at least 20 characters).";
  const value = numbers.estimatedValue(f.assetValue);
  if (!value.ok) errors.assetValueUsd = value.error;
  const target = numbers.financingTarget(f.target);
  if (!target.ok) errors.targetUsd = target.error;
  else if (value.ok && target.value > value.value) errors.targetUsd = "The target cannot exceed the asset value.";
  const term = parseNumeric(f.term, { maxDecimals: 0 });
  if (!term.ok || term.value < MIN_TERM_MONTHS || term.value > MAX_TERM_MONTHS) errors.termMonths = `Enter a whole number of months between ${MIN_TERM_MONTHS} and ${MAX_TERM_MONTHS}.`;
  const ret = parseQuantity(f.ret, 2);
  if (!ret.ok || ret.value < MIN_RETURN_PCT || ret.value > MAX_RETURN_PCT) errors.returnPct = `Enter an illustrative return between ${MIN_RETURN_PCT}% and ${MAX_RETURN_PCT}%.`;
  const area = numbers.totalArea(f.area);
  if (!area.ok) errors.areaHa = area.error;
  if (f.uploads.length === 0) errors.uploads = "Attach at least one supporting document (the land certificate).";
  if (Object.keys(errors).length || !value.ok || !target.ok || !term.ok || !ret.ok || !area.ok) return { errors };
  return {
    errors,
    patch: { name: f.name, description: f.description, assetValueUsd: value.value, targetUsd: target.value, termMonths: term.value, returnPct: ret.value, areaHa: area.value, uploads: f.uploads },
  };
}

export function SellerAssetEdit({ id }: { id: string }) {
  const hydrated = useHydrated();
  const demo = useDemo();
  const session = useSession();
  const router = useRouter();
  const t = useT();
  const asset = hydrated ? assetById(demo, id) : undefined;
  const [form, setForm] = useState<Form | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  if (!hydrated) return <Skeleton className="h-96" />;

  const back = (
    <Button asChild>
      <Link href={asset && asset.ownerId === session?.userId ? `/seller/assets/${asset.id}` : "/seller/assets"}>{asset && asset.ownerId === session?.userId ? t("Back to asset") : t("Back to My Assets")}</Link>
    </Button>
  );
  if (!asset || asset.ownerId !== session?.userId) {
    return <EmptyState title="Asset not found" description="It may belong to another account or the demo data was reset." action={back} />;
  }
  if (asset.status !== "changes_requested") {
    return <EmptyState title="Editing is not available" description="An asset can only be edited while the admin has requested changes." action={back} />;
  }

  const f = form ?? initial(asset);
  const set = (patch: Partial<Form>) => {
    setForm({ ...f, ...patch });
    setErrors({});
  };

  const run = (resubmit: boolean) => {
    if (busy) return;
    const { patch, errors: found } = toPatch(f);
    if (!patch) {
      setErrors(found);
      toast.error(t("Please fix the highlighted fields"));
      return;
    }
    setBusy(true);
    const res = resubmit ? resubmitAsset(asset.id, patch) : saveAssetEdits(asset.id, patch);
    setBusy(false);
    if (!res.ok) {
      if (res.field) setErrors({ [res.field]: res.error });
      toast.error(t(res.error));
      return;
    }
    if (resubmit) {
      toast.success(t("Resubmitted for review"), { description: res.changedFields.length ? t("Updated: {fields}", { fields: res.changedFields.map((x) => t(x)).join(", ") }) : t("No fields were changed") });
      router.push(`/seller/assets/${asset.id}`);
    } else {
      toast.success(res.changedFields.length ? t("Changes saved") : t("Nothing to save"), { description: res.changedFields.map((x) => t(x)).join(", ") || t("No fields were changed") });
    }
  };

  return (
    <div>
      <PageHeader title={t("Edit {name}", { name: t(asset.name) })} subtitle={`${asset.id} · ${t("correct the requested information, then resubmit for review")}`} />
      <div role="status" className="mb-5 rounded-xl border border-[#F1D6B0] bg-[#FDF1E3] p-4 text-sm">
        <strong>{t("Changes requested:")}</strong> {t(asset.reviewNote ?? "")}
      </div>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          run(true);
        }}
        className="space-y-5"
      >
        <ChartCard title="Listing details">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="edit-name" label="Asset name" required error={errors.name} className="sm:col-span-2">
              <input {...inputProps("edit-name", errors.name)} value={f.name} onChange={(e) => set({ name: e.target.value })} autoComplete="off" />
            </Field>
            <Field id="edit-assetValue" label="Estimated asset value" required error={errors.assetValueUsd}>
              <MoneyInput id="edit-assetValue" error={errors.assetValueUsd} value={f.assetValue} onChange={(v) => set({ assetValue: v })} currency="USD" />
            </Field>
            <Field id="edit-target" label="Financing target" required error={errors.targetUsd}>
              <MoneyInput id="edit-target" error={errors.targetUsd} value={f.target} onChange={(v) => set({ target: v })} currency="USD" />
            </Field>
            <Field id="edit-term" label="Financing term" required error={errors.termMonths}>
              <InputWithSuffix suffix="months">
                <input {...inputProps("edit-term", errors.termMonths)} type="text" inputMode="numeric" autoComplete="off" value={f.term} onChange={(e) => set({ term: e.target.value })} />
              </InputWithSuffix>
            </Field>
            <Field id="edit-ret" label="Illustrative annualised return" required error={errors.returnPct}>
              <InputWithSuffix suffix="% p.a.">
                <input {...inputProps("edit-ret", errors.returnPct)} type="text" inputMode="decimal" autoComplete="off" value={f.ret} onChange={(e) => set({ ret: e.target.value })} />
              </InputWithSuffix>
            </Field>
            <Field id="edit-area" label="Total area" required error={errors.areaHa} hint={t("Titled land area in hectares (up to {max}).", { max: MAX_AREA_HA.toLocaleString("en-US") })}>
              <InputWithSuffix suffix="ha">
                <input {...inputProps("edit-area", errors.areaHa)} type="text" inputMode="decimal" autoComplete="off" value={f.area} onChange={(e) => set({ area: e.target.value })} />
              </InputWithSuffix>
            </Field>
            <Field id="edit-description" label="Purpose of financing" required error={errors.description} className="sm:col-span-2">
              <textarea
                id="edit-description"
                rows={4}
                aria-invalid={errors.description ? true : undefined}
                aria-describedby={errors.description ? "edit-description-error" : undefined}
                className={`field h-auto min-h-[104px] py-2.5 ${errors.description ? "field-error" : ""}`}
                value={f.description}
                onChange={(e) => set({ description: e.target.value })}
              />
            </Field>
          </div>
        </ChartCard>

        <ChartCard title="Supporting documents" subtitle="Remove a file and add its replacement, or add more. Simulated uploads: no real files are stored.">
          <UploadZone id="edit-docs" files={f.uploads} onChange={(uploads) => set({ uploads })} />
          {errors.uploads && (
            <p role="alert" className="mt-2 text-xs font-medium text-danger">
              {errors.uploads}
            </p>
          )}
        </ChartCard>

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" disabled={busy} onClick={() => run(false)} data-demo-avoid>
            <Save className="h-4 w-4" aria-hidden="true" /> {t("Save changes")}
          </Button>
          <Button type="submit" disabled={busy} data-demo-avoid>
            <Send className="h-4 w-4" aria-hidden="true" /> {t("Save & resubmit")}
          </Button>
          <Button asChild variant="ghost">
            <Link href={`/seller/assets/${asset.id}`}>{t("Cancel")}</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
