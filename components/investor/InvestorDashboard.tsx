"use client";

import Link from "next/link";
import { ArrowRight, Coins, Layers, LineChart, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartCard } from "@/components/shared/ChartCard";
import { EmptyState } from "@/components/shared/states";
import { FadeIn } from "@/components/shared/FadeIn";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { SafeImage } from "@/components/shared/SafeImage";
import { StatCard } from "@/components/shared/StatCard";
import { DonutChart } from "@/components/charts/DonutChart";
import { TrendChart } from "@/components/charts/TrendChart";
import { CHART } from "@/components/charts/ChartPrimitives";
import { categoryColor, categoryLabel } from "@/lib/categories";
import { fmtDate, usd } from "@/lib/demo/format";
import { useDemo } from "@/lib/demo/hooks";
import { performanceSeries, portfolioTotals, positionsOf, publishedAssets } from "@/lib/demo/selectors";
import { remainingUsd } from "@/lib/demo/store";
import { useNow } from "@/lib/demo/useNow";
import { PositionsTable } from "./PositionsTable";

export function allocationOf(positions: ReturnType<typeof positionsOf>) {
  const by = new Map<string, number>();
  for (const p of positions) by.set(p.asset.category, (by.get(p.asset.category) ?? 0) + p.valueUsd);
  return [...by.entries()].map(([cat, value]) => ({ name: categoryLabel(cat), value: Math.round(value), color: categoryColor(cat) })).sort((a, b) => b.value - a.value);
}

export function InvestorDashboard() {
  const demo = useDemo();
  const now = useNow();
  const me = demo.session!;
  const positions = positionsOf(demo, me.userId, now);
  const totals = portfolioTotals(positions);
  const series = performanceSeries(demo, me.userId, now);
  const allocation = allocationOf(positions);
  const opportunities = publishedAssets(demo)
    .filter((a) => !positions.some((p) => p.asset.id === a.id) && remainingUsd(a) > 0)
    .slice(0, 3);
  const recent = demo.transactions.filter((t) => t.investorId === me.userId).slice(0, 4);
  const first = me.name.split(" ").slice(-1)[0];

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${first}`}
        subtitle="Your portfolio at a glance."
        actions={
          <Button asChild>
            <Link href="/investor/marketplace">Explore opportunities</Link>
          </Button>
        }
      />

      <FadeIn>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<Wallet className="h-5 w-5" />} label="Total Invested" value={usd(totals.invested)} comparison={`${totals.count} positions`} />
          <StatCard icon={<LineChart className="h-5 w-5" />} label="Portfolio Value" value={usd(Math.round(totals.value))} change={`+${usd(Math.round(totals.accrued))}`} comparison="accrued, illustrative" />
          <StatCard icon={<Coins className="h-5 w-5" />} label="Estimated Returns" value={usd(Math.round(totals.expected))} comparison="at maturity, illustrative" />
          <StatCard icon={<Layers className="h-5 w-5" />} label="Active Investments" value={String(totals.count)} comparison="across commodities" />
        </div>
      </FadeIn>

      {positions.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="You have no investments yet"
          description="Browse approved opportunities and place a simulated investment to see your portfolio come to life."
          action={
            <Button asChild>
              <Link href="/investor/marketplace">Explore opportunities</Link>
            </Button>
          }
        />
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <ChartCard className="lg:col-span-2" title="Portfolio performance" subtitle="Value vs. amount invested · last 6 months (illustrative)" icon={<TrendingUp className="h-5 w-5" />} bodyClassName="h-64">
            <TrendChart
              ariaLabel="Portfolio value and amount invested over six months"
              data={series}
              xKey="label"
              series={[
                { key: "value", name: "Portfolio value", color: CHART.forest, area: true },
                { key: "invested", name: "Invested", color: CHART.sage, dashed: true },
              ]}
              yFormat={(v) => `$${Math.round(v / 1000)}K`}
              tooltipFormat={(v) => usd(v)}
              yDomain={[0, "auto"]}
            />
          </ChartCard>
          <ChartCard title="Allocation" subtitle="By commodity" bodyClassName="flex flex-col items-center gap-4">
            <div className="h-44 w-44 shrink-0">
              <DonutChart
                ariaLabel={`Allocation: ${allocation.map((a) => a.name).join(", ")}`}
                data={allocation}
                tooltipFormat={(v) => usd(v)}
                center={
                  <>
                    <span className="figure text-lg font-bold">{usd(Math.round(totals.value))}</span>
                    <span className="text-[11px] text-ink-muted">Total value</span>
                  </>
                }
              />
            </div>
            <ul className="w-full space-y-2 text-sm">
              {allocation.map((a) => (
                <li key={a.name} className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: a.color }} aria-hidden="true" />
                  <span className="flex-1">{a.name}</span>
                  <span className="figure font-semibold">{Math.round((a.value / totals.value) * 100)}%</span>
                </li>
              ))}
            </ul>
          </ChartCard>

          <ChartCard
            className="lg:col-span-3"
            title="Active investments"
            action={
              <Link href="/investor/portfolio" className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:underline">
                View portfolio <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <PositionsTable positions={positions.slice(0, 5)} now={now} caption="Active investments" />
          </ChartCard>
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-labelledby="opps">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="opps" className="text-lg font-bold">
              Opportunities for you
            </h2>
            <Link href="/investor/marketplace" className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {opportunities.length === 0 ? (
            <EmptyState title="No open opportunities" description="Every listing is funded or you already hold a position in it." />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-3">
              {opportunities.map((a) => (
                <li key={a.id} className="card group relative overflow-hidden transition-shadow hover:shadow-pop">
                  <SafeImage src={a.image} alt="" category={a.category} className="h-28 w-full" />
                  <div className="p-3.5">
                    <h3 className="truncate font-bold">
                      <Link href={`/investor/marketplace/${a.slug}`} className="after:absolute after:inset-0">
                        {a.name}
                      </Link>
                    </h3>
                    <p className="truncate text-xs text-ink-muted">{a.location}</p>
                    <p className="figure mt-2 text-sm">
                      <strong>{a.targetYield}%</strong> <span className="text-xs text-ink-muted">illustrative · {a.termMonths} mo</span>
                    </p>
                    <ProgressBar value={a.fundedPct} label={`${a.name} funding progress`} className="mt-2 h-1.5" />
                    <p className="mt-1 text-xs text-ink-muted">{a.fundedPct}% funded</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <ChartCard
          title="Recent transactions"
          action={
            <Link href="/investor/transactions" className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {recent.length === 0 ? (
            <p className="text-sm text-ink-muted">No transactions yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{t.assetName}</p>
                    <p className="text-xs text-ink-muted">{fmtDate(t.createdAt)}</p>
                  </div>
                  <span className="figure font-semibold">{usd(t.amountUsd)}</span>
                </li>
              ))}
            </ul>
          )}
        </ChartCard>
      </div>
      <p className="mt-6 text-xs text-ink-muted">Values and returns are simulated and illustrative. They are not guaranteed.</p>
    </div>
  );
}
