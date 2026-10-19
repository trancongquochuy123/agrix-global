"use client";

import Link from "next/link";
import { ArrowRight, ClipboardCheck, Coins, Leaf, Users } from "lucide-react";
import { ChartCard } from "@/components/shared/ChartCard";
import { EmptyState } from "@/components/shared/states";
import { FadeIn } from "@/components/shared/FadeIn";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { ListingStatusBadge } from "@/components/shared/badges";
import { fmtDateTime, usd } from "@/lib/demo/format";
import { useDemo } from "@/lib/demo/hooks";
import { pendingAssets, platformTotals } from "@/lib/demo/selectors";
import { useI18n } from "@/lib/i18n/react";

export function AdminDashboard() {
  const demo = useDemo();
  const { t, lang } = useI18n();
  const totals = platformTotals(demo);
  const pending = pendingAssets(demo);
  const recentTx = demo.transactions.slice(0, 5);

  return (
    <div>
      <PageHeader title="Platform overview" subtitle="Operations control center · simulated data" />
      <FadeIn>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<Users className="h-5 w-5" />} label="Total Users" value={String(totals.users)} />
          <StatCard icon={<Leaf className="h-5 w-5" />} label="Total Assets" value={String(totals.assets)} comparison={t("{n} published", { n: totals.published })} />
          <StatCard icon={<Coins className="h-5 w-5" />} label="Total Investment Volume" value={usd(totals.volume)} comparison={`${t("{n} transactions", { n: totals.transactions })}${totals.variance !== 0 ? ` · ${t("ledger differs from funded total by {amount}", { amount: usd(Math.abs(totals.variance)) })}` : ""}`} />
          <StatCard icon={<ClipboardCheck className="h-5 w-5" />} label="Pending Approvals" value={String(totals.pending)} comparison={totals.pending ? "needs your review" : "queue is clear"} />
        </div>
      </FadeIn>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ChartCard
          title="Approval queue"
          action={
            <Link href="/admin/approvals" className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:underline">
              {t("Open queue")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {pending.length === 0 ? (
            <p className="text-sm text-ink-muted">{t("No listings are waiting for review.")}</p>
          ) : (
            <ul className="divide-y divide-line">
              {pending.map((a) => (
                <li key={a.id}>
                  <Link href={`/admin/approvals/${a.id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-green-50/40">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{t(a.name)}</p>
                      <p className="truncate text-xs text-ink-muted">
                        {a.id} · {t(a.ownerName)}
                      </p>
                    </div>
                    <ListingStatusBadge status={a.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </ChartCard>

        <ChartCard
          title="Latest transactions"
          action={
            <Link href="/admin/transactions" className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:underline">
              {t("Transaction overview")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {recentTx.length === 0 ? (
            <EmptyState title="No transactions" className="border-0 py-6" />
          ) : (
            <ul className="divide-y divide-line">
              {recentTx.map((x) => (
                <li key={x.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{t(x.assetName)}</p>
                    <p className="truncate text-xs text-ink-muted">
                      {t(x.investorName)} · {fmtDateTime(x.createdAt)}
                    </p>
                  </div>
                  <span className="figure font-semibold">{usd(x.amountUsd)}</span>
                </li>
              ))}
            </ul>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Recent activity" className="mt-5" action={<Link href="/admin/activity" className="text-xs font-semibold text-green-600 hover:underline">{t("Full log")}</Link>}>
        <ul className="divide-y divide-line">
          {demo.activity.slice(0, 5).map((e) => (
            <li key={e.id} className="py-2.5 text-sm">
              <span className="font-semibold">{t(e.actor)}</span> {lang === "en" ? e.action.toLowerCase() : t(e.action).toLocaleLowerCase("vi")} · <span className="text-ink-muted">{t(e.target)}</span>
              <span className="block text-xs text-ink-muted">{fmtDateTime(e.at)}</span>
            </li>
          ))}
        </ul>
      </ChartCard>
    </div>
  );
}
