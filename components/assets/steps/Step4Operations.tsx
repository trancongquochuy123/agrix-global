import { Field, InputWithSuffix, MoneyInput, inputProps } from "../FormField";
import { certificationOptions, cropOptions, harvestSeasons, irrigationMethods } from "../formModel";
import type { StepProps } from "./StepProps";

export function Step4Operations({ data, update, errors }: StepProps) {
  const crops = Array.from(new Set([...Object.values(cropOptions).flat()]));
  const toggleCert = (c: string) =>
    update({ certifications: data.certifications.includes(c) ? data.certifications.filter((x) => x !== c) : [...data.certifications, c] });

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field id="operationsCrop" label="Crop type" required error={errors.operationsCrop}>
        <select {...inputProps("operationsCrop", errors.operationsCrop)} value={data.operationsCrop} onChange={(e) => update({ operationsCrop: e.target.value })}>
          {crops.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
      <Field id="irrigation" label="Irrigation method" required error={errors.irrigation}>
        <select {...inputProps("irrigation", errors.irrigation)} value={data.irrigation} onChange={(e) => update({ irrigation: e.target.value })}>
          <option value="">Select a method</option>
          {irrigationMethods.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </Field>
      <Field id="annualProduction" label="Annual production" required error={errors.annualProduction}>
        <InputWithSuffix suffix="t / year">
          <input {...inputProps("annualProduction", errors.annualProduction)} type="number" min="0" inputMode="decimal" value={data.annualProduction} onChange={(e) => update({ annualProduction: e.target.value })} />
        </InputWithSuffix>
      </Field>
      <Field id="historicalYield" label="Historical yield" required error={errors.historicalYield} hint="Five-year average.">
        <InputWithSuffix suffix="t / ha">
          <input {...inputProps("historicalYield", errors.historicalYield)} type="number" min="0" step="0.1" inputMode="decimal" value={data.historicalYield} onChange={(e) => update({ historicalYield: e.target.value })} />
        </InputWithSuffix>
      </Field>
      <Field id="harvestSeason" label="Harvest season" required error={errors.harvestSeason}>
        <select {...inputProps("harvestSeason", errors.harvestSeason)} value={data.harvestSeason} onChange={(e) => update({ harvestSeason: e.target.value })}>
          <option value="">Select a season</option>
          {harvestSeasons.map((h) => (
            <option key={h}>{h}</option>
          ))}
        </select>
      </Field>
      <div />
      <Field id="operatingCosts" label={`Operating costs (${data.currency} / year)`} required error={errors.operatingCosts}>
        <MoneyInput id="operatingCosts" error={errors.operatingCosts} value={data.operatingCosts} onChange={(v) => update({ operatingCosts: v })} currency={data.currency} placeholder="e.g. 1,200,000" />
      </Field>
      <Field id="expectedRevenue" label={`Expected revenue (${data.currency} / year)`} required error={errors.expectedRevenue}>
        <MoneyInput id="expectedRevenue" error={errors.expectedRevenue} value={data.expectedRevenue} onChange={(v) => update({ expectedRevenue: v })} currency={data.currency} placeholder="e.g. 2,400,000" />
      </Field>
      <fieldset className="sm:col-span-2">
        <legend className="mb-2 text-sm font-semibold">Certifications</legend>
        <div className="flex flex-wrap gap-2">
          {certificationOptions.map((c) => {
            const checked = data.certifications.includes(c);
            return (
              <label
                key={c}
                className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition-colors duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-green-600 ${checked ? "border-green-600 bg-green-50 text-green-700" : "border-line bg-white hover:bg-green-50"}`}
              >
                <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleCert(c)} />
                {c}
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
