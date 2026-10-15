const opts = { timeZone: "UTC" } as const;

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { ...opts, month: "short", day: "numeric", year: "numeric" });

export const fmtDateTime = (iso: string) =>
  `${new Date(iso).toLocaleDateString("en-US", { ...opts, month: "short", day: "numeric", year: "numeric" })} · ${new Date(iso).toLocaleTimeString("en-US", { ...opts, hour: "2-digit", minute: "2-digit" })} UTC`;

export const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
export const usd2 = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
