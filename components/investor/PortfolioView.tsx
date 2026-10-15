"use client";

import Link from "next/link";
import { Coins, Layers, LineChart, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartCard } from "@/components/shared/ChartCard";
import { EmptyState } from "@/components/shared/states";
import { FadeIn } from "@/components/shared/FadeIn";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { DonutChart } from "@/components/charts/DonutChart";
import { TrendChart } from "@/components/charts/TrendChart";
import { CHART } from "@/components/charts/ChartPrimitives";
import { fmtDate, usd } from "@/lib/demo/format";
import { useDemo } from "@/lib/demo/hooks";
import { performanceSeries, portfolioTotals, positionsOf } from "@/lib/demo/selectors";
import { useNow } from "@/lib/demo/useNow";
import { allocationOf } from "./InvestorDashboard";
import { PositionsTable } from "./PositionsTable";

export function PortfolioView() {
  const demo = useDemo();
  const now = useNow();
  const me = demo.session!;
  const positions = positionsOf(demo, me.userId, now);
  const totals = portfolioTotals(positions);
  const series = performanceSeries(demo, me.userId, now, 6);
  const allocation = allocationOf(positions);
  const upcoming = [...positions].sort((a, b) => (a.maturesAt < b.maturesAt ? -1 : 1)).slice(0, 4);

  return (
    <div>
      <PageHeader title="Portfolio" subtitle="Every position, with illustrative accrual and maturity." />
      <FadeIn>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<Wallet className="h-5 w-5" />} label="Total Invested" value={usd(totals.invested)} />
          <StatCard icon={<LineChart className="h-5 w-5" />} label="Portfolio Value" value={usd(Math.round(totals.value))} change={`+${usd(Math.round(totals.accrued))}`} comparison="accrued, illustrative" />
          <StatCard icon={<Coins className="h-5 w-5" />} label="Estimated Returns" value={usd(Math.round(totals.expected))} comparison="at maturity, illustrative" />
          <StatCard icon={<Layers className="h-5 w-5" />} label="Active Investments" value={String(totals.count)} />
        </div>
      </FadeIn>

      {positions.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="Your portfolio is empty"
          description="Investments you confirm will appear here with their value, accrual and maturity date."
          action={
            <Button asChild>
              <Link href="/investor/marketplace">Explore opportunities</Link>
            </Button>
          }
        />
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <ChartCard className="lg:col-span-3" title="Holdings">
            <PositionsTable positions={positions} now={now} caption="Portfolio holdings" />
          </ChartCard>
          <ChartCard className="lg:col-span-2" title="Performance" subtitle="Month-end value vs. invested (illustrative)" bodyClassName="h-64">
            <TrendChart
              ariaLabel="Portfolio value and amount invested by month"
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
          <div className="flex flex-col gap-5">
            <ChartCard title="Allocation" bodyClassName="flex items-center gap-4">
              <div className="h-32 w-32 shrink-0">
                <DonutChart ariaLabel={`Allocation: ${allocation.map((a) => a.name).join(", ")}`} data={allocation} tooltipFormat={(v) => usd(v)} />
              </div>
              <ul className="min-w-0 flex-1 space-y-1.5 text-sm">
                {allocation.map((a) => (
                  <li key={a.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: a.color }} aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{a.name}</span>
                    <span className="figure font-semibold">{Math.round((a.value / totals.value) * 100)}%</span>
                  </li>
                ))}
              </ul>
            </ChartCard>
            <ChartCard title="Upcoming maturities">
              <ul className="divide-y divide-line">
                {upcoming.map((p) => (
                  <li key={p.asset.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="min-w-0 truncate font-semibold">{p.asset.name}</span>
                    <span className="shrink-0 text-xs text-ink-muted">{fmtDate(p.maturesAt)}</span>
                  </li>
                ))}
              </ul>
            </ChartCard>
          </div>
        </div>
      )}
      <p className="mt-6 text-xs text-ink-muted">Simulated portfolio. Accrual is pro-rated from each asset&apos;s illustrative annualised return and is not guaranteed.</p>
    </div>
  );
}
