"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChartCard } from "@/components/shared/ChartCard";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/badges";
import { StatCard } from "@/components/shared/StatCard";
import { ArrowLeftRight, Coins, Wallet } from "lucide-react";
import { fmtDateTime, usd } from "@/lib/demo/format";
import { useDemo } from "@/lib/demo/hooks";
import type { Transaction } from "@/lib/demo/types";
import { downloadTextFile, toCsv } from "@/lib/formatters";

/** Investor view lists only your own transactions; admin view lists everything with the investor column. */
export function TransactionsView({ scope }: { scope: "investor" | "admin" }) {
  const { transactions, session } = useDemo();
  const [query, setQuery] = useState("");
  const admin = scope === "admin";

  const rows = useMemo(() => {
    const mine = admin ? transactions : transactions.filter((t) => t.investorId === session?.userId);
    const q = query.trim().toLowerCase();
    return q ? mine.filter((t) => [t.reference, t.assetName, t.investorName].some((f) => f.toLowerCase().includes(q))) : mine;
  }, [transactions, session?.userId, admin, query]);

  const total = rows.reduce((n, t) => n + t.amountUsd, 0);

  const columns: Column<Transaction>[] = [
    { key: "ref", header: "Reference", render: (t) => <span className="figure font-semibold">{t.reference}</span> },
    { key: "date", header: "Date", sortValue: (t) => t.createdAt, render: (t) => <span className="text-ink-muted">{fmtDateTime(t.createdAt)}</span> },
    { key: "asset", header: "Asset", sortValue: (t) => t.assetName, render: (t) => <span className="font-semibold">{t.assetName}</span> },
    ...(admin ? [{ key: "inv", header: "Investor", sortValue: (t: Transaction) => t.investorName, render: (t: Transaction) => t.investorName } satisfies Column<Transaction>] : []),
    { key: "amt", header: "Amount", align: "right", sortValue: (t) => t.amountUsd, render: (t) => <span className="figure font-semibold">{usd(t.amountUsd)}</span> },
    { key: "status", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
  ];

  const exportCsv = () => {
    downloadTextFile(
      `agrix-transactions-${scope}.csv`,
      toCsv([["Reference", "Date", "Asset", "Investor", "Amount USD", "Status"], ...rows.map((t) => [t.reference, t.createdAt, t.assetName, t.investorName, t.amountUsd, t.status])]),
    );
    toast.success("CSV exported", { description: `${rows.length} simulated transactions` });
  };

  return (
    <div>
      <PageHeader
        title={admin ? "Transaction Overview" : "Transactions"}
        subtitle={admin ? "Simulated investments across the platform." : "Your simulated investment history."}
        actions={
          <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Wallet className="h-5 w-5" />} label={admin ? "Recorded volume" : "Total invested"} value={usd(total)} />
        <StatCard icon={<ArrowLeftRight className="h-5 w-5" />} label="Transactions" value={String(rows.length)} />
        <StatCard icon={<Coins className="h-5 w-5" />} label="Average ticket" value={usd(rows.length ? Math.round(total / rows.length) : 0)} />
      </div>

      <div className="mt-6">
        <label className="relative mb-3 block max-w-sm">
          <span className="sr-only">Search transactions</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by reference or asset" className="field h-11 rounded-xl pl-10" />
        </label>
        {rows.length === 0 ? (
          <EmptyState title="No transactions yet" description={query ? "No transactions match your search." : "Simulated investments will be listed here as soon as they are confirmed."} />
        ) : (
          <ChartCard title="History" subtitle="Simulated records. No real funds moved.">
            <DataTable
              caption="Transactions"
              columns={columns}
              rows={rows}
              rowKey={(t) => t.id}
              initialSort={{ key: "date", dir: "desc" }}
              minWidth="min-w-[720px]"
              mobileCard={(t) => (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{t.assetName}</p>
                    <p className="figure font-bold">{usd(t.amountUsd)}</p>
                  </div>
                  <p className="text-xs text-ink-muted">
                    {t.reference} · {fmtDateTime(t.createdAt)}
                    {admin ? ` · ${t.investorName}` : ""}
                  </p>
                </div>
              )}
            />
          </ChartCard>
        )}
      </div>
    </div>
  );
}
