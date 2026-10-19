/**
 * Strict numeric parsing for user-entered text.
 *
 * Format policy (one rule for every field): a period is the decimal separator and a comma is an optional
 * thousands separator that must group by exactly three digits ("1,000" and "12,345,678" are valid; "1,00" and
 * "1,000,00" are not). Nothing is ever stripped or reinterpreted: input that does not match is rejected with a
 * reason, so "-5000", "1e3", "1,000.50" or "abc" can never turn into a different number.
 */

export type NumericReason = "empty" | "negative" | "scientific" | "fractional" | "malformed" | "too_many_decimals" | "too_large";

export type ParseResult = { ok: true; value: number } | { ok: false; reason: NumericReason };

export interface ParseOptions {
  /** Maximum digits after the decimal point. 0 means whole numbers only. */
  maxDecimals: number;
  /** Coordinates may be negative; money, area and counts may not. */
  allowNegative?: boolean;
}

const GROUPED = /^\d{1,3}(,\d{3})+(\.\d+)?$/;
const PLAIN = /^\d+(\.\d+)?$/;

export function parseNumeric(raw: string, { maxDecimals, allowNegative = false }: ParseOptions): ParseResult {
  const text = raw.trim();
  if (text === "") return { ok: false, reason: "empty" };
  if (/^[+-]?\d*\.?\d*e[+-]?\d+$/i.test(text)) return { ok: false, reason: "scientific" };

  let sign = 1;
  let body = text;
  if (text.startsWith("-")) {
    if (!allowNegative) return { ok: false, reason: /\d/.test(text) ? "negative" : "malformed" };
    sign = -1;
    body = text.slice(1);
  }

  if (!(PLAIN.test(body) || GROUPED.test(body))) return { ok: false, reason: "malformed" };

  const decimals = body.includes(".") ? body.split(".")[1].length : 0;
  if (decimals > maxDecimals) return { ok: false, reason: maxDecimals === 0 ? "fractional" : "too_many_decimals" };

  const value = sign * Number(body.replace(/,/g, ""));
  if (!Number.isFinite(value)) return { ok: false, reason: "malformed" };
  if (Math.abs(value) > Number.MAX_SAFE_INTEGER) return { ok: false, reason: "too_large" };
  return { ok: true, value: value === 0 ? 0 : value };
}

/** Whole US dollars only, no sign, no decimals. */
export const parseWholeUsd = (raw: string) => parseNumeric(raw, { maxDecimals: 0 });

/** Positive-or-zero quantity with up to `maxDecimals` decimals (area, yield, return). */
export const parseQuantity = (raw: string, maxDecimals = 2) => parseNumeric(raw, { maxDecimals });

export const parseCoordinate = (raw: string) => parseNumeric(raw, { maxDecimals: 6, allowNegative: true });

/** Human message for a failed parse. `what` is a noun phrase such as "an investment amount". */
export function describeReason(reason: NumericReason, what: string, wholeUnit = false): string {
  switch (reason) {
    case "empty":
      return `Enter ${what}.`;
    case "negative":
      return `${cap(what)} cannot be negative.`;
    case "scientific":
      return `Scientific notation is not supported. Enter ${what} as a plain number.`;
    case "fractional":
      return `Enter ${what} in whole ${wholeUnit ? "units" : "dollars"}, without decimals.`;
    case "too_many_decimals":
      return `Too many decimal places for ${what}.`;
    case "too_large":
      return `${cap(what)} is too large.`;
    default:
      return `Enter ${what} using digits only (a comma may separate thousands).`;
  }
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Adds thousands separators to a plain digit string; anything else is returned untouched. */
export const groupDigits = (digits: string) => (/^\d+$/.test(digits) ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : digits);

/**
 * Upper bound for a single asset's titled area. The boundary editor measures area with a planar projection that is
 * only valid for small polygons, and the largest seeded listing is 900 ha, so 100,000 ha (1,000 km²) is a generous
 * ceiling for one estate. It exists to reject typos such as 1e9, not to express a business rule: confirm with product.
 */
export const MAX_AREA_HA = 100_000;
export const MIN_TERM_MONTHS = 1;
export const MAX_TERM_MONTHS = 36;
export const MIN_RETURN_PCT = 0.1;
export const MAX_RETURN_PCT = 30;
