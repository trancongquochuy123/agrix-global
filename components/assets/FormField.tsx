"use client";

import type { ReactNode } from "react";
import { groupDigits, parseWholeUsd } from "@/lib/numeric";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/react";

export function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  const t = useT();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {t(label)}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-danger">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-muted">{t(hint)}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-medium text-danger">
          {t(error)}
        </p>
      )}
    </div>
  );
}

export const inputProps = (id: string, error?: string) => ({
  id,
  "aria-invalid": error ? (true as const) : undefined,
  "aria-describedby": error ? `${id}-error` : undefined,
  className: cn("field", error && "field-error"),
});

export function InputWithSuffix({ suffix, children }: { suffix: string; children: ReactNode }) {
  const t = useT();
  return (
    <div className="relative">
      {children}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted">{t(suffix)}</span>
    </div>
  );
}

/**
 * Whole-dollar text input. It shows exactly what was typed or pasted and adds thousands separators (4,800,000) on blur
 * when the value is a valid number, so the field's validation error describes what the user can see. Nothing is stripped.
 */
export function MoneyInput({
  id,
  error,
  value,
  onChange,
  currency,
  placeholder,
}: {
  id: string;
  error?: string;
  value: string;
  onChange: (raw: string) => void;
  currency: string;
  placeholder?: string;
}) {
  const t = useT();
  return (
    <div className="relative">
      <input
        {...inputProps(id, error)}
        className={cn("field pr-14", error && "field-error")}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        placeholder={placeholder ? t(placeholder) : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          const r = parseWholeUsd(value);
          if (r.ok) onChange(groupDigits(String(r.value)));
        }}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-muted">{currency}</span>
    </div>
  );
}
