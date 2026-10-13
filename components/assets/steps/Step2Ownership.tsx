import { Field, inputProps } from "../FormField";
import { ownershipTypes } from "../formModel";
import { UploadZone } from "../UploadZone";
import type { StepProps } from "./StepProps";

export function Step2Ownership({ data, update, errors }: StepProps) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field id="ownerName" label="Owner name" required error={errors.ownerName}>
        <input {...inputProps("ownerName", errors.ownerName)} value={data.ownerName} onChange={(e) => update({ ownerName: e.target.value })} autoComplete="name" />
      </Field>
      <Field id="organization" label="Organization" hint="Leave blank for individual owners.">
        <input {...inputProps("organization")} value={data.organization} onChange={(e) => update({ organization: e.target.value })} autoComplete="organization" />
      </Field>
      <Field id="ownershipType" label="Ownership type" required>
        <select {...inputProps("ownershipType")} value={data.ownershipType} onChange={(e) => update({ ownershipType: e.target.value })}>
          {ownershipTypes.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field id="certificateNumber" label="Land certificate number" required error={errors.certificateNumber}>
        <input
          {...inputProps("certificateNumber", errors.certificateNumber)}
          value={data.certificateNumber}
          onChange={(e) => update({ certificateNumber: e.target.value })}
          placeholder="e.g. CS 01234/DL"
        />
      </Field>
      <Field id="issueDate" label="Issue date" required error={errors.issueDate}>
        <input {...inputProps("issueDate", errors.issueDate)} type="date" max={today} value={data.issueDate} onChange={(e) => update({ issueDate: e.target.value })} />
      </Field>
      <div className="sm:col-span-2">
        <p className="mb-1.5 text-sm font-semibold">Land certificate &amp; supporting documents</p>
        <UploadZone id="ownership-docs" files={data.documents} onChange={(documents) => update({ documents })} />
      </div>
    </div>
  );
}
