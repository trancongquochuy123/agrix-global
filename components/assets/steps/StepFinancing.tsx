"use client";

import { Info } from "lucide-react";
import { Field, InputWithSuffix, MoneyInput, inputProps } from "../FormField";
import { money, numbers } from "../formModel";
import type { StepProps } from "./StepProps";
import { useT } from "@/lib/i18n/react";

export function StepFinancing({ data, update, errors }: StepProps) {
  const t = useT();
  const target = numbers.financingTarget(data.financingTarget);
  const value = numbers.estimatedValue(data.estimatedValue);
  const ltv = target.ok && value.ok ? (target.value / value.value) * 100 : null;
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field id="financingTarget" label="Financing target" required error={errors.financingTarget} hint={t("Asset value: {amount}", { amount: money(data.estimatedValue, data.currency) })}>
        <MoneyInput id="financingTarget" error={errors.financingTarget} value={data.financingTarget} onChange={(v) => update({ financingTarget: v })} currency={data.currency} placeholder="e.g. 350,000" />
      </Field>
      <Field id="termMonths" label="Financing term" required error={errors.termMonths}>
        <InputWithSuffix suffix="months">
          <input {...inputProps("termMonths", errors.termMonths)} type="text" inputMode="numeric" autoComplete="off" value={data.termMonths} onChange={(e) => update({ termMonths: e.target.value })} />
        </InputWithSuffix>
      </Field>
      <Field id="expectedReturn" label="Illustrative annualised return" required error={errors.expectedReturn} hint="Shown to investors as illustrative, never as a guarantee.">
        <InputWithSuffix suffix="% p.a.">
          <input {...inputProps("expectedReturn", errors.expectedReturn)} type="text" inputMode="decimal" autoComplete="off" value={data.expectedReturn} onChange={(e) => update({ expectedReturn: e.target.value })} placeholder="8" />
        </InputWithSuffix>
      </Field>
      <div className="flex items-end">
        {ltv !== null && (
          <p className="flex gap-2 rounded-xl bg-green-50 p-3 text-sm">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
            <span>
              {t("You are raising")} <strong>{ltv.toFixed(0)}%</strong> {t("of the asset value.")}
            </span>
          </p>
        )}
      </div>
      <Field id="description" label="Purpose of financing" required error={errors.description} className="sm:col-span-2" hint="Shown on the public listing. Reviewers read this first.">
        <textarea
          id="description"
          rows={4}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={errors.description ? "description-error" : undefined}
          className={`field h-auto min-h-[104px] py-2.5 ${errors.description ? "field-error" : ""}`}
          value={data.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder={t("e.g. Working capital for the upcoming harvest: picking labour, drying and storage ahead of a forward offtake sale.")}
        />
      </Field>
    </div>
  );
}
