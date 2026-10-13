export function formatUsd(value: number, opts: { compact?: boolean; decimals?: number } = {}): string {
  const { compact = true, decimals = 1 } = opts;
  if (!compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }
  const abs = Math.abs(value);
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(decimals)}B`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(decimals)}M`;
  if (abs >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatPct(value: number, decimals = 1, signed = false): string {
  const sign = signed && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatHa(value: number): string {
  return `${formatNumber(value)} ha`;
}

export function toCsv(rows: (string | number)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const text = String(cell);
          return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
        })
        .join(","),
    )
    .join("\n");
}

export function downloadTextFile(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
