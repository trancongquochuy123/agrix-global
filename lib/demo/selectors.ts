import type { Asset } from "@/types/asset";
import type { DemoState, Transaction } from "./types";

export const publishedAssets = (s: DemoState): Asset[] => s.assets.filter((a) => a.status === "published");
export const assetById = (s: DemoState, id: string) => s.assets.find((a) => a.id === id);
export const assetBySlugIn = (s: DemoState, slug: string) => s.assets.find((a) => a.slug === slug);
export const assetsOwnedBy = (s: DemoState, ownerId: string) => s.assets.filter((a) => a.ownerId === ownerId);
export const pendingAssets = (s: DemoState) => s.assets.filter((a) => a.status === "pending_review");

const DAY = 86_400_000;
const MONTH_MS = 30.4 * DAY;

export interface Position {
  asset: Asset;
  investedUsd: number;
  /** Illustrative accrual to date, pro-rated over the term and capped at maturity. */
  accruedUsd: number;
  /** Illustrative total return at maturity. */
  expectedUsd: number;
  valueUsd: number;
  firstInvestedAt: string;
  maturesAt: string;
  txs: Transaction[];
}

export function accrual(amount: number, annualPct: number, termMonths: number, fromIso: string, atMs: number) {
  const elapsedMonths = Math.max(0, (atMs - new Date(fromIso).getTime()) / MONTH_MS);
  return amount * (annualPct / 100) * (Math.min(elapsedMonths, termMonths) / 12);
}

export function positionsOf(s: DemoState, investorId: string, atMs: number): Position[] {
  const byAsset = new Map<string, Transaction[]>();
  for (const t of s.transactions) {
    if (t.investorId !== investorId) continue;
    byAsset.set(t.assetId, [...(byAsset.get(t.assetId) ?? []), t]);
  }
  const out: Position[] = [];
  for (const [assetId, txs] of byAsset) {
    const asset = assetById(s, assetId);
    if (!asset) continue;
    const invested = txs.reduce((n, t) => n + t.amountUsd, 0);
    const accrued = txs.reduce((n, t) => n + accrual(t.amountUsd, asset.targetYield, asset.termMonths, t.createdAt, atMs), 0);
    const expected = invested * (asset.targetYield / 100) * (asset.termMonths / 12);
    const first = txs.reduce((a, t) => (t.createdAt < a ? t.createdAt : a), txs[0].createdAt);
    out.push({
      asset,
      investedUsd: invested,
      accruedUsd: accrued,
      expectedUsd: expected,
      valueUsd: invested + accrued,
      firstInvestedAt: first,
      maturesAt: new Date(new Date(first).getTime() + asset.termMonths * MONTH_MS).toISOString(),
      txs,
    });
  }
  return out.sort((a, b) => (a.firstInvestedAt < b.firstInvestedAt ? 1 : -1));
}

export function portfolioTotals(positions: Position[]) {
  const invested = positions.reduce((n, p) => n + p.investedUsd, 0);
  const value = positions.reduce((n, p) => n + p.valueUsd, 0);
  const expected = positions.reduce((n, p) => n + p.expectedUsd, 0);
  return { invested, value, expected, accrued: value - invested, count: positions.length };
}

/** Month-end portfolio values for the last `months` months, derived from the investor's own transactions. */
export function performanceSeries(s: DemoState, investorId: string, atMs: number, months = 6) {
  const txs = s.transactions.filter((t) => t.investorId === investorId);
  const end = new Date(atMs);
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - (months - 1 - i) + 1, 0, 23, 59, 59));
    const at = Math.min(d.getTime(), atMs);
    let invested = 0;
    let value = 0;
    for (const t of txs) {
      if (new Date(t.createdAt).getTime() > at) continue;
      const a = assetById(s, t.assetId);
      if (!a) continue;
      invested += t.amountUsd;
      value += t.amountUsd + accrual(t.amountUsd, a.targetYield, a.termMonths, t.createdAt, at);
    }
    return {
      label: d.toLocaleDateString("en-US", { timeZone: "UTC", month: "short" }),
      value: Math.round(value),
      invested: Math.round(invested),
    };
  });
}

/** Sum of recorded ledger amounts for one asset. */
export const ledgerTotalFor = (s: Pick<DemoState, "transactions">, assetId: string) =>
  s.transactions.filter((t) => t.assetId === assetId).reduce((n, t) => n + t.amountUsd, 0);

/** Number of individual investments in a set of ledger rows (an opening-balance row stands for several). */
export const investmentCount = (txs: Transaction[]) => txs.reduce((n, t) => n + (t.investmentCount ?? 1), 0);

/**
 * Platform metrics. `volume` and `transactions` come from the transaction ledger; `fundedUsd` is the sum of the
 * published assets' raised amounts. They must agree, and `variance` exposes any gap instead of hiding it.
 */
export function platformTotals(s: DemoState) {
  const published = new Set(s.assets.filter((a) => a.status === "published").map((a) => a.id));
  const ledger = s.transactions.filter((t) => published.has(t.assetId));
  const volume = ledger.reduce((n, t) => n + t.amountUsd, 0);
  const fundedUsd = s.assets.filter((a) => a.status === "published").reduce((n, a) => n + a.raisedUsd, 0);
  return {
    fundedUsd,
    variance: fundedUsd - volume,
    users: s.users.length,
    assets: s.assets.length,
    published: s.assets.filter((a) => a.status === "published").length,
    pending: pendingAssets(s).length,
    volume,
    transactions: investmentCount(ledger),
  };
}

export const STATUS_LABEL = {
  pending_review: "Pending Review",
  changes_requested: "Changes Requested",
  rejected: "Rejected",
  published: "Published",
} as const;
