"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Circle, ExternalLink, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChartCard } from "@/components/shared/ChartCard";
import { DocumentRow } from "@/components/shared/DocumentRow";
import { EmptyState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Skeleton } from "@/components/shared/SkeletonLoader";
import { ListingStatusBadge } from "@/components/shared/badges";
import { assetDocuments } from "@/lib/demo/docs";
import { fmtDate, fmtDateTime, usd } from "@/lib/demo/format";
import { useDemo, useHydrated } from "@/lib/demo/hooks";
import { assetById } from "@/lib/demo/selectors";
import { remainingUsd, resubmitAsset } from "@/lib/demo/store";
import { ReviewHistory } from "@/components/shared/ReviewHistory";
import { useT } from "@/lib/i18n/react";

export function SellerAssetDetail({ id }: { id: string }) {
  const hydrated = useHydrated();
  const demo = useDemo();
  const t = useT();
  const [busy, setBusy] = useState(false);
  if (!hydrated) return <Skeleton className="h-96" />;

  const asset = assetById(demo, id);
  if (!asset || asset.ownerId !== demo.session?.userId) {
    return (
      <EmptyState
        title="Asset not found"
        description="It may belong to another account or the demo data was reset."
        action={
          <Button asChild>
            <Link href="/seller/assets">{t("Back to My Assets")}</Link>
          </Button>
        }
      />
    );
  }

  const txs = demo.transactions.filter((t) => t.assetId === asset.id);
  const docs = assetDocuments(asset);
  const published = asset.status === "published";
  const steps = [
    { label: "Submitted", done: true, at: asset.submittedAt ?? asset.createdAt },
    { label: "Admin review", done: asset.status !== "pending_review", at: asset.reviewedAt },
    { label: "Published", done: published, at: published ? asset.reviewedAt : undefined },
    { label: "Funding open", done: published && asset.raisedUsd > 0, at: undefined },
  ];

  const resubmit = () => {
    if (busy) return;
    setBusy(true);
    const r = resubmitAsset(asset.id);
    if (r.ok) toast.success(t("Resubmitted for review"));
    else toast.error(t(r.error ?? "Could not resubmit"));
    setBusy(false);
  };

  return (
    <div>
      <PageHeader
        title={t(asset.name)}
        subtitle={`${asset.id} · ${t(asset.location)}`}
        actions={
          published ? (
            <Button asChild variant="outline">
              <Link href={`/marketplace/${asset.slug}`}>
                <ExternalLink className="h-4 w-4" aria-hidden="true" /> {t("View public listing")}
              </Link>
            </Button>
          ) : undefined
        }
      />

      {asset.status === "changes_requested" && (
        <div role="status" className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#F1D6B0] bg-[#FDF1E3] p-4 text-sm">
          <p className="min-w-0 flex-1">
            <strong>{t("Changes requested:")}</strong> {t(asset.reviewNote ?? "")}
          </p>
          <Button size="sm" variant="outline" asChild data-demo-avoid>
            <Link href={`/seller/assets/${asset.id}/edit`}>{t("Edit details")}</Link>
          </Button>
          <Button size="sm" onClick={resubmit} disabled={busy} data-demo-avoid>
            <Send className="h-4 w-4" aria-hidden="true" /> {t("Resubmit for review")}
          </Button>
        </div>
      )}
      {asset.status === "rejected" && (
        <div role="status" className="mb-5 rounded-xl border border-[#F0C7C2] bg-[#FBE5E3] p-4 text-sm">
          <strong>{t("Rejected:")}</strong> {t(asset.reviewNote ?? "")}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <ChartCard title="Verification status" action={<ListingStatusBadge status={asset.status} />}>
            <ol className="grid gap-3 sm:grid-cols-4">
              {steps.map((s) => (
                <li key={s.label} className="flex items-start gap-2 text-sm">
                  {s.done ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden="true" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-line" aria-hidden="true" />}
                  <div>
                    <p className="font-semibold">{t(s.label)}</p>
                    <p className="text-xs text-ink-muted">{s.at ? fmtDate(s.at) : s.done ? t("Done") : t("Waiting")}</p>
                  </div>
                </li>
              ))}
            </ol>
            {asset.reviewNote && asset.status !== "changes_requested" && asset.status !== "rejected" && (
              <p className="mt-4 rounded-lg bg-green-50/60 p-3 text-xs text-ink-muted">{t("Reviewer note (simulated):")} {t(asset.reviewNote)}</p>
            )}
          </ChartCard>

          <ChartCard title="Funding progress">
            {published ? (
              <>
                <div className="flex items-end justify-between gap-3">
                  <p className="figure text-2xl font-extrabold">{usd(asset.raisedUsd)}</p>
                  <p className="text-sm text-ink-muted">{t("of {amount} target", { amount: usd(asset.targetUsd) })}</p>
                </div>
                <ProgressBar value={asset.fundedPct} label="Funding progress" className="mt-3" />
                <p className="figure mt-2 text-xs text-ink-muted">
                  {t("{pct}% funded", { pct: asset.fundedPct })} · {t(asset.investors === 1 ? "{n} investor" : "{n} investors", { n: asset.investors })} · {t("{amount} remaining", { amount: usd(remainingUsd(asset)) })}
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-muted">{t("Funding opens once an admin approves this listing.")}</p>
            )}
          </ChartCard>

          <ReviewHistory events={asset.reviewHistory} />

          <ChartCard title="Investments received">
            {txs.length === 0 ? (
              <p className="text-sm text-ink-muted">{t("No simulated investments yet.")}</p>
            ) : (
              <ul className="divide-y divide-line">
                {txs.map((tx) => (
                  <li key={tx.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{t(tx.investorName)}{tx.kind === "opening" ? ` · ${t("opening balance")}` : ""}</p>
                      <p className="text-xs text-ink-muted">
                        {tx.reference} · {fmtDateTime(tx.createdAt)}
                      </p>
                    </div>
                    <span className="figure font-semibold">{usd(tx.amountUsd)}</span>
                  </li>
                ))}
              </ul>
            )}
          </ChartCard>
        </div>

        <div className="space-y-5">
          <ChartCard title="Asset summary">
            <dl className="space-y-2 text-sm">
              {[
                ["Asset value", usd(asset.assetValueUsd)],
                ["Financing target", usd(asset.targetUsd)],
                ["Term", t("{n} months", { n: asset.termMonths })],
                ["Illustrative return", t("{pct}% annualised", { pct: asset.targetYield })],
                ["Minimum investment", usd(asset.minInvestmentUsd)],
                ["Area", `${asset.areaHa} ha`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-ink-muted">{t(k)}</dt>
                  <dd className="figure font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </ChartCard>
          <ChartCard title="Documents">
            <div className="space-y-2">
              {docs.map((d) => (
                <DocumentRow key={d.id} doc={d} />
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
