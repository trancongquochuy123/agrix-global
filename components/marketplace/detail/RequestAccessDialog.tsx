"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const ranges = ["$10,000 – $50,000", "$50,000 – $250,000", "$250,000 – $1,000,000", "$1,000,000+"];

interface FormState {
  fullName: string;
  organization: string;
  email: string;
  range: string;
  message: string;
}

const empty: FormState = { fullName: "", organization: "", email: "", range: "", message: "" };

function validate(f: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (f.fullName.trim().length < 2) errors.fullName = "Enter your full name.";
  if (!f.organization.trim()) errors.organization = "Enter your organization.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) errors.email = "Enter a valid email address.";
  if (!f.range) errors.range = "Select an investment range.";
  return errors;
}

export function RequestAccessDialog({
  open,
  onOpenChange,
  assetName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetName: string;
}) {
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSubmitting(true);
    // Local-only submission: simulate a short network round-trip.
    setTimeout(() => {
      setSubmitting(false);
      onOpenChange(false);
      setForm(empty);
      toast.success("Access request submitted", {
        description: `Our team will contact ${form.email.trim()} about ${assetName} within 1 business day.`,
      });
    }, 600);
  };

  const field = (key: keyof FormState) => ({
    id: `ra-${key}`,
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `ra-${key}-error` : undefined,
    className: cn("field", errors[key] && "field-error"),
  });

  const err = (key: keyof FormState) =>
    errors[key] ? (
      <p id={`ra-${key}-error`} role="alert" className="mt-1 text-xs font-medium text-danger">
        {errors[key]}
      </p>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6">
        <DialogTitle className="text-xl font-bold">Request access</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-ink-muted">
          Start due diligence for {assetName}. We&apos;ll share the full data room once your profile is verified.
        </DialogDescription>
        <form onSubmit={submit} noValidate className="mt-5 space-y-4">
          <div>
            <label htmlFor="ra-fullName" className="mb-1.5 block text-sm font-medium">
              Full name <span aria-hidden="true" className="text-danger">*</span>
            </label>
            <input {...field("fullName")} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} autoComplete="name" />
            {err("fullName")}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ra-organization" className="mb-1.5 block text-sm font-medium">
                Organization <span aria-hidden="true" className="text-danger">*</span>
              </label>
              <input {...field("organization")} value={form.organization} onChange={(e) => set("organization", e.target.value)} autoComplete="organization" />
              {err("organization")}
            </div>
            <div>
              <label htmlFor="ra-email" className="mb-1.5 block text-sm font-medium">
                Email <span aria-hidden="true" className="text-danger">*</span>
              </label>
              <input {...field("email")} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
              {err("email")}
            </div>
          </div>
          <div>
            <label htmlFor="ra-range" className="mb-1.5 block text-sm font-medium">
              Investment range <span aria-hidden="true" className="text-danger">*</span>
            </label>
            <select {...field("range")} value={form.range} onChange={(e) => set("range", e.target.value)}>
              <option value="">Select a range</option>
              {ranges.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {err("range")}
          </div>
          <div>
            <label htmlFor="ra-message" className="mb-1.5 block text-sm font-medium">
              Message <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <textarea
              id="ra-message"
              rows={3}
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              className="field h-auto py-2.5"
              placeholder="Anything we should know about your mandate or timeline?"
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
