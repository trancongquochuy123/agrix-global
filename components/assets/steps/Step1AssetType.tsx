"use client";

import { Field, InputWithSuffix, MoneyInput, inputProps } from "../FormField";
import { categoryOptions, cropOptions, currencies } from "../formModel";
import type { StepProps } from "./StepProps";
import { useT } from "@/lib/i18n/react";

export function Step1AssetType({ data, update, errors }: StepProps) {
  const t = useT();
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field id="category" label="Asset category" required>
        <select
          {...inputProps("category")}
          value={data.category}
          onChange={(e) => update({ category: e.target.value, cropType: cropOptions[e.target.value][0], operationsCrop: cropOptions[e.target.value][0] })}
        >
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {t(c)}
            </option>
          ))}
        </select>
      </Field>
      <Field id="cropType" label="Crop or project type" required error={errors.cropType}>
        <select
          {...inputProps("cropType", errors.cropType)}
          value={data.cropType}
          onChange={(e) => update({ cropType: e.target.value, operationsCrop: e.target.value })}
        >
          {cropOptions[data.category].map((c) => (
            <option key={c} value={c}>
              {t(c)}
            </option>
          ))}
        </select>
      </Field>
      <Field id="assetName" label="Asset name" required error={errors.assetName} className="sm:col-span-2">
        <input
          {...inputProps("assetName", errors.assetName)}
          value={data.assetName}
          onChange={(e) => update({ assetName: e.target.value })}
          placeholder={t("e.g. Highland Coffee Estate")}
          autoComplete="off"
        />
      </Field>
      <Field id="estimatedValue" label="Estimated asset value" required error={errors.estimatedValue}>
        <MoneyInput id="estimatedValue" error={errors.estimatedValue} value={data.estimatedValue} onChange={(v) => update({ estimatedValue: v })} currency={data.currency} placeholder="e.g. 4,800,000" />
      </Field>
      <Field id="currency" label="Currency" required>
        <select {...inputProps("currency")} value={data.currency} onChange={(e) => update({ currency: e.target.value })}>
          {currencies.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
      <Field id="totalArea" label="Total area" required error={errors.totalArea} hint="Titled land area in hectares.">
        <InputWithSuffix suffix="ha">
          <input
            {...inputProps("totalArea", errors.totalArea)}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={data.totalArea}
            onChange={(e) => update({ totalArea: e.target.value })}
            placeholder="125.6"
          />
        </InputWithSuffix>
      </Field>
    </div>
  );
}
