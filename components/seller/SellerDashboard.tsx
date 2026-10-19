"use client";

import Link from "next/link";
import { ArrowRight, Banknote, Clock, Leaf, PlusCircle, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartCard } from "@/components/shared/ChartCard";
import { EmptyState } from "@/components/shared/states";
import { FadeIn } from "@/components/shared/FadeIn";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { StatCard } from "@/components/shared/StatCard";
import { fmtDate, usd } from "@/lib/demo/format";
import { useDemo } from "@/lib/demo/hooks";
import { assetsOwnedBy } from "@/lib/demo/selectors";
import { AssetsTable } from "./AssetsTable";
import { useT } from "@/lib/i18n/react";

export function SellerDashboard() {
  const demo = useDemo();
  const t = useT();
  const me = demo.session!;
  const mine = assetsOwnedBy(demo, me.userId);
  const totalValue = mine.reduce((n, a) => n + a.assetValueUsd, 0);
  const raised = mine.reduce((n, a) => n + a.raisedUsd, 0);
  const pending = mine.filter((a) => a.status === "pending_review").length;
  const attention = mine.find((a) => a.status === "changes_requested");
  const incoming = demo.transactions.filter((t) => mine.some((a) => a.id === t.assetId)).slice(0, 5);
  const first = me.name.split(" ")[0];

  return (
    <div>
      <PageHeader
        title={t("Hello, {name}", { name: first })}
        subtitle="Manage your agricultural assets and follow their funding."
        actions={
          <Button asChild>
            <Link href="/seller/assets/new">
              <PlusCircle className="h-4 w-4" aria-hidden="true" /> {t("Create New Asset")}
            </Link>
          </Button>
        }
      />

      <FadeIn>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<Leaf className="h-5 w-5" />} label="Total Registered Assets" value={String(mine.length)} comparison={t("{n} published", { n: mine.filter((a) => a.status === "published").length })} />
          <StatCard icon={<Sprout className="h-5 w-5" />} label="Total Asset Value" value={usd(totalValue)} />
          <StatCard icon={<Banknote className="h-5 w-5" />} label="Funding Raised" value={usd(raised)} comparison="from simulated investments" />
          <StatCard icon={<Clock className="h-5 w-5" />} label="Pending Approvals" value={String(pending)} comparison={pending ? "awaiting admin review" : "nothing waiting"} />
        </div>
      </FadeIn>

      {attention && (
        <div role="status" className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#F1D6B0] bg-[#FDF1E3] p-4 text-sm">
          <p className="min-w-0 flex-1">
            <strong>{t(attention.name)}</strong> {t("needs changes:")} {t(attention.reviewNote ?? "")}
          </p>
          <Button asChild size="sm">
            <Link href={`/seller/assets/${attention.id}`}>{t("Review feedback")}</Link>
          </Button>
        </div>
      )}

      {mine.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="You have not registered an asset yet"
          description="Create your first asset, attach supporting documents and submit it for approval. Once approved, investors can fund it."
          action={
            <Button asChild>
              <Link href="/seller/assets/new">{t("Create New Asset")}</Link>
            </Button>
          }
        />
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <ChartCard
            className="lg:col-span-2"
            title="My assets"
            action={
              <Link href="/seller/assets" className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:underline">
                {t("View all")} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <AssetsTable assets={mine.slice(0, 5)} />
          </ChartCard>

          <div className="flex flex-col gap-5">
            <ChartCard title="Funding progress">
              <ul className="space-y-4">
                {mine
                  .filter((a) => a.status === "published")
                  .map((a) => (
                    <li key={a.id}>
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <Link href={`/seller/assets/${a.id}`} className="min-w-0 truncate font-semibold hover:underline">
                          {t(a.name)}
                        </Link>
                        <span className="figure shrink-0 text-xs font-semibold text-green-700">{a.fundedPct}%</span>
                      </div>
                      <ProgressBar value={a.fundedPct} label={t("{name} funding progress", { name: t(a.name) })} className="mt-1.5 h-1.5" />
                      <p className="mt-1 text-xs text-ink-muted">
                        {t("{raised} of {target}", { raised: usd(a.raisedUsd), target: usd(a.targetUsd) })}
                      </p>
                    </li>
                  ))}
                {mine.every((a) => a.status !== "published") && <li className="text-sm text-ink-muted">{t("Funding starts once an asset is published.")}</li>}
              </ul>
            </ChartCard>
            <ChartCard title="Recent investments">
              {incoming.length === 0 ? (
                <p className="text-sm text-ink-muted">{t("No investments in your assets yet.")}</p>
              ) : (
                <ul className="divide-y divide-line">
                  {incoming.map((tx) => (
                    <li key={tx.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{t(tx.assetName)}</p>
                        <p className="text-xs text-ink-muted">{fmtDate(tx.createdAt)}</p>
                      </div>
                      <span className="figure font-semibold">{usd(tx.amountUsd)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </ChartCard>
          </div>
        </div>
      )}
      <p className="mt-6 text-xs text-ink-muted">{t("Approval and funding amounts are simulated. No real funds are raised.")}</p>
    </div>
  );
}

