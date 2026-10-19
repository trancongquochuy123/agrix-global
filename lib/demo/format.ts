import { localeOf } from "@/lib/i18n/core";

const opts = { timeZone: "UTC" } as const;

/** Dates follow the selected interface language ("Oct 13, 2026" / "13 thg 10, 2026"). */
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(localeOf(), { ...opts, month: "short", day: "numeric", year: "numeric" });

export const fmtDateTime = (iso: string) =>
  `${new Date(iso).toLocaleDateString(localeOf(), { ...opts, month: "short", day: "numeric", year: "numeric" })} · ${new Date(iso).toLocaleTimeString(localeOf(), { ...opts, hour: "2-digit", minute: "2-digit" })} UTC`;

/* Money keeps one notation in both languages ($1,000), matching the number format the forms accept. */
export const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
export const usd2 = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
