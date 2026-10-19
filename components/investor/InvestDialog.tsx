"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { fmtDate, usd } from "@/lib/demo/format";
import { invest, remainingUsd } from "@/lib/demo/store";
import { describeReason, groupDigits, parseWholeUsd } from "@/lib/numeric";
import type { Transaction } from "@/lib/demo/types";
import type { Asset } from "@/types/asset";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/react";

const EXAMPLE_USD = 10_000;
const MONTH_MS = 30.4 * 86_400_000;

type Step = "amount" | "review" | "done";

export function InvestDialog({ asset, open, onOpenChange }: { asset: Asset; open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useT();
  const remaining = remainingUsd(asset);
  const min = Math.min(asset.minInvestmentUsd, remaining);
  const [step, setStep] = useState<Step>("amount");
  const [raw, setRaw] = useState("");
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [tx, setTx] = useState<Transaction>();
  const requestId = useRef("");

  // Fresh form (and a fresh idempotency key) every time the dialog opens.
  useEffect(() => {
    if (!open) return;
    requestId.current = `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    setStep("amount");
    setRaw(groupDigits(String(Math.min(EXAMPLE_USD, remaining) || "")));
    setAck(false);
    setBusy(false);
    setError(undefined);
    setTx(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // The text is parsed, never sanitised: the amount reviewed and submitted is exactly what was typed and validated.
  const parsed = useMemo(() => parseWholeUsd(raw), [raw]);
  const amount = parsed.ok ? parsed.value : 0;
  const validation = useMemo(() => {
    if (!parsed.ok) return describeReason(parsed.reason, "an investment amount");
    if (amount <= 0) return "Enter an investment amount.";
    if (amount < min) return `Minimum investment is ${usd(min)}.`;
    if (amount > remaining) return `Only ${usd(remaining)} remains to be funded.`;
    return undefined;
  }, [parsed, amount, min, remaining]);

  const expected = amount * (asset.targetYield / 100) * (asset.termMonths / 12);
  const maturity = new Date(Date.now() + asset.termMonths * MONTH_MS).toISOString();
  const sharePct = asset.targetUsd > 0 ? (amount / asset.targetUsd) * 100 : 0;

  const confirm = () => {
    if (busy || step !== "review") return;
    setBusy(true);
    setTimeout(() => {
      const res = invest({ assetId: asset.id, amountUsd: amount, requestId: requestId.current });
      setBusy(false);
      if (!res.ok) {
        setError(res.error);
        setStep("amount");
        return;
      }
      setTx(res.tx);
      setStep("done");
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="p-0 sm:max-w-md">
        <div className="p-5 sm:p-6">
          <DialogTitle className="pr-8 text-xl font-bold">{step === "done" ? t("Investment confirmed") : t("Invest in {name}", { name: t(asset.name) })}</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-ink-muted">
            {step === "done" ? t("Simulated transaction. No real money moved.") : t("{id} · {n}-month term · simulation only", { id: asset.id, n: asset.termMonths })}
          </DialogDescription>

          {step === "amount" && (
            <form
              className="mt-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (validation) return setError(validation);
                setError(undefined);
                setStep("review");
              }}
            >
              <div>
                <label htmlFor="invest-amount" className="mb-1.5 block text-sm font-semibold">
                  {t("Investment amount (USD)")}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">$</span>
                  <input
                    id="invest-amount"
                    inputMode="numeric"
                    autoComplete="off"
                    value={raw}
                    onChange={(e) => {
                      // Keep exactly what was typed or pasted; separators are added on blur, only for a valid number.
                      setRaw(e.target.value);
                      setError(undefined);
                    }}
                    onBlur={() => {
                      const r = parseWholeUsd(raw);
                      if (r.ok) setRaw(groupDigits(String(r.value)));
                    }}
                    aria-invalid={!!(error || (raw && validation))}
                    aria-describedby="invest-hint"
                    className={cn("field figure h-12 pl-7 text-lg font-semibold", (error || (raw && validation)) && "field-error")}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[1_000, 5_000, EXAMPLE_USD].filter((v) => v <= remaining).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        setRaw(groupDigits(String(v)));
                        setError(undefined);
                      }}
                      className="rounded-full border border-line px-3 py-1 text-xs font-medium transition-colors hover:bg-green-50"
                    >
                      {usd(v)}
                    </button>
                  ))}
                </div>
                <p id="invest-hint" role={error || (raw && validation) ? "alert" : undefined} className={cn("mt-2 text-xs", error || (raw && validation) ? "text-danger" : "text-ink-muted")}>
                  {error ? t(error) : raw && validation ? t(validation) : t("Minimum {min} · {remaining} remaining to reach the {target} target.", { min: usd(min), remaining: usd(remaining), target: usd(asset.targetUsd) })}
                </p>
              </div>

              <div className="rounded-xl bg-green-50/60 p-4 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">{t("Illustrative outcome")}</p>
                <dl className="mt-2 space-y-1.5">
                  <Row k={t("Return at {pct}% annualised", { pct: asset.targetYield })} v={usd(Math.round(expected))} />
                  <Row k="Total at maturity" v={usd(Math.round(amount + expected))} />
                  <Row k="Share of financing target" v={`${sharePct.toFixed(1)}%`} />
                </dl>
                <p className="mt-3 flex gap-1.5 text-xs text-ink-muted">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {t("Returns are illustrative, not guaranteed. Demo calculation only.")}
                </p>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={!!validation}>
                {t("Review investment")}
              </Button>
            </form>
          )}

          {step === "review" && (
            <div className="mt-5 space-y-4">
              <dl className="space-y-2 rounded-xl border border-line p-4 text-sm">
                <Row k="Asset" v={t(asset.name)} />
                <Row k="Amount" v={usd(amount)} strong />
                <Row k="Term" v={t("{n} months", { n: asset.termMonths })} />
                <Row k="Illustrative maturity" v={fmtDate(maturity)} />
                <Row k="Illustrative return" v={usd(Math.round(expected))} />
              </dl>
              <label className="flex cursor-pointer items-start gap-2.5 text-sm">
                <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5 h-4 w-4 accent-green-600" />
                <span>{t("I understand this is a simulated investment. No real payment is made and returns are not guaranteed.")}</span>
              </label>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" disabled={busy} onClick={() => setStep("amount")}>
                  {t("Back")}
                </Button>
                <Button className="flex-[2]" disabled={!ack || busy} onClick={confirm}>
                  {busy ? t("Confirming…") : t("Confirm {amount}", { amount: usd(amount) })}
                </Button>
              </div>
            </div>
          )}

          {step === "done" && tx && (
            <div className="mt-5 space-y-4" role="status">
              <div className="flex flex-col items-center rounded-xl bg-green-50 px-4 py-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" aria-hidden="true" />
                <p className="figure mt-3 text-3xl font-extrabold">{usd(tx.amountUsd)}</p>
                <p className="mt-1 text-sm text-ink-muted">{t("invested in {name}", { name: t(tx.assetName) })}</p>
                <p className="figure mt-3 rounded-lg bg-white px-3 py-1 text-xs font-semibold text-green-700">{t("Reference {ref}", { ref: tx.reference })}</p>
              </div>
              <p className="flex gap-1.5 text-xs text-ink-muted">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {t("Simulated confirmation: no money was transferred. Your portfolio and the seller's funding progress were updated in this demo.")}
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                  {t("Close")}
                </Button>
                <Button asChild className="flex-[2]">
                  <Link href="/investor/portfolio">{t("View portfolio")}</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  const t = useT();
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-muted">{t(k)}</dt>
      <dd className={cn("figure text-right", strong ? "text-base font-extrabold" : "font-semibold")}>{v}</dd>
    </div>
  );
}
