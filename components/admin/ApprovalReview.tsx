"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, MessageSquareWarning, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AiRiskSummary } from "@/components/ai/AiInsights";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ChartCard } from "@/components/shared/ChartCard";
import { DocumentRow } from "@/components/shared/DocumentRow";
import { EmptyState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/shared/SkeletonLoader";
import { ListingStatusBadge } from "@/components/shared/badges";
import { getAssetDetail } from "@/data/assets";
import { assetDocuments } from "@/lib/demo/docs";
import { fmtDate, usd } from "@/lib/demo/format";
import { useDemo, useHydrated } from "@/lib/demo/hooks";
import { assetById } from "@/lib/demo/selectors";
import { reviewAsset, type ReviewDecision } from "@/lib/demo/store";
import { ReviewHistory } from "@/components/shared/ReviewHistory";
import { useT } from "@/lib/i18n/react";

const COPY: Record<ReviewDecision, { title: string; verb: string; desc: string; done: string; needsNote: boolean }> = {
  approve: { title: "Approve and publish", verb: "Approve", desc: "The listing becomes visible in the Investor Marketplace immediately.", done: "Listing approved and published", needsNote: false },
  reject: { title: "Reject listing", verb: "Reject", desc: "The seller is notified. The listing stays hidden from investors.", done: "Listing rejected", needsNote: true },
  changes: { title: "Request changes", verb: "Send request", desc: "The seller can edit and resubmit the listing.", done: "Changes requested", needsNote: true },
};

export function ApprovalReview({ id }: { id: string }) {
  const hydrated = useHydrated();
  const demo = useDemo();
  const t = useT();
  const [decision, setDecision] = useState<ReviewDecision | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  if (!hydrated) return <Skeleton className="h-96" />;
  const asset = assetById(demo, id);
  if (!asset) {
    return (
      <EmptyState
        title="Listing not found"
        description="The demo data may have been reset."
        action={
          <Button asChild>
            <Link href="/admin/approvals">{t("Back to queue")}</Link>
          </Button>
        }
      />
    );
  }

  const detail = getAssetDetail(asset);
  const docs = assetDocuments(asset);
  const pending = asset.status === "pending_review";
  const copy = decision ? COPY[decision] : null;
  const noteMissing = !!copy?.needsNote && note.trim().length < 5;

  const confirm = () => {
    if (!decision || busy || noteMissing) return;
    setBusy(true);
    const r = reviewAsset(asset.id, decision, note);
    if (r.ok) {
      toast.success(t(COPY[decision].done), { description: `${t(asset.name)} (${asset.id})` });
      setDecision(null);
      setNote("");
    } else toast.error(t(r.error ?? "Action failed"));
    setBusy(false);
  };

  return (
    <div>
      <PageHeader
        title={t(asset.name)}
        subtitle={t("{id} · submitted by {owner}", { id: asset.id, owner: t(asset.ownerName) })}
        actions={<ListingStatusBadge status={asset.status} />}
      />

      {!pending && (
        <div role="status" className="mb-5 rounded-xl border border-line bg-green-50/50 p-4 text-sm">
          {asset.reviewedAt ? t("Decision recorded on {date}.", { date: fmtDate(asset.reviewedAt) }) : t("Decision recorded.")} {t(asset.reviewNote ?? "")}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <AiRiskSummary asset={asset} detail={detail} audience="admin" />
          <ReviewHistory events={asset.reviewHistory} />
          <ChartCard title="Supporting documents" subtitle="Simulated uploads · no real files are stored">
            <div className="space-y-2">
              {docs.map((d) => (
                <DocumentRow key={d.id} doc={d} />
              ))}
            </div>
          </ChartCard>
        </div>
        <div className="space-y-5">
          <ChartCard title="Listing details">
            <dl className="space-y-2 text-sm">
              {[
                ["Location", t(asset.location)],
                ["Asset value", usd(asset.assetValueUsd)],
                ["Financing target", usd(asset.targetUsd)],
                ["Term", t("{n} months", { n: asset.termMonths })],
                ["Illustrative return", `${asset.targetYield}%`],
                ["Minimum", usd(asset.minInvestmentUsd)],
                ["Area", `${asset.areaHa} ha`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-ink-muted">{t(k)}</dt>
                  <dd className="text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-ink-muted">{t(asset.description)}</p>
          </ChartCard>
          {pending && (
            <ChartCard title="Decision">
              <div className="grid gap-2">
                <Button data-demo-avoid onClick={() => setDecision("approve")}>
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {t("Approve")}
                </Button>
                <Button variant="outline" data-demo-avoid onClick={() => setDecision("changes")}>
                  <MessageSquareWarning className="h-4 w-4" aria-hidden="true" /> {t("Request Changes")}
                </Button>
                <Button variant="danger" data-demo-avoid onClick={() => setDecision("reject")}>
                  <XCircle className="h-4 w-4" aria-hidden="true" /> {t("Reject")}
                </Button>
              </div>
              <p className="mt-3 text-xs text-ink-muted">{t("Simulated review. No real verification is performed.")}</p>
            </ChartCard>
          )}
        </div>
      </div>

      <Dialog open={!!decision} onOpenChange={(o) => !o && !busy && setDecision(null)}>
        <DialogContent className="p-6 sm:max-w-md">
          <DialogTitle className="pr-8 text-xl font-bold">{copy ? t(copy.title) : null}</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-ink-muted">{copy ? t(copy.desc) : null}</DialogDescription>
          <label htmlFor="review-note" className="mt-4 block text-sm font-semibold">
            {t("Note to seller")} {copy?.needsNote ? t("(required)") : t("(optional)")}
          </label>
          <textarea id="review-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="field mt-1.5 w-full" placeholder={t("Add context for the seller")} />
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDecision(null)} disabled={busy}>
              {t("Cancel")}
            </Button>
            <Button variant={decision === "reject" ? "danger" : "primary"} onClick={confirm} disabled={busy || noteMissing}>
              {copy ? t(copy.verb) : null}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
