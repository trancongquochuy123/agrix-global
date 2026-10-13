import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-danger">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-medium text-danger">
          {error}
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
  return (
    <div className="relative">
      {children}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted">{suffix}</span>
    </div>
  );
}

const group = (n: string) => n.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** Text input that shows thousands separators (4,800,000) while the form keeps the raw digits. */
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
  const [int, dec] = value.split(".");
  const display = value === "" ? "" : `${group(int)}${dec !== undefined ? `.${dec}` : ""}`;
  return (
    <div className="relative">
      <input
        {...inputProps(id, error)}
        className={cn("field pr-14", error && "field-error")}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={display}
        placeholder={placeholder}
        onChange={(e) => {
          const cleaned = e.target.value.replace(/[^\d.]/g, "");
          const [i, ...rest] = cleaned.split(".");
          onChange(rest.length ? `${i}.${rest.join("").slice(0, 2)}` : i);
        }}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-muted">{currency}</span>
    </div>
  );
}
