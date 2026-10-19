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
import { investmentCount } from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/hooks";
import type { Transaction } from "@/lib/demo/types";
import { downloadTextFile, toCsv } from "@/lib/formatters";
import { useT } from "@/lib/i18n/react";

/** Investor view lists only your own transactions; admin view lists everything with the investor column. */
export function TransactionsView({ scope }: { scope: "investor" | "admin" }) {
  const { transactions, session } = useDemo();
  const tr = useT();
  const [query, setQuery] = useState("");
  const admin = scope === "admin";

  const rows = useMemo(() => {
    const mine = admin ? transactions : transactions.filter((t) => t.investorId === session?.userId);
    const q = query.trim().toLowerCase();
    return q ? mine.filter((t) => [t.reference, t.assetName, t.investorName, tr(t.assetName), tr(t.investorName)].some((f) => f.toLowerCase().includes(q))) : mine;
  }, [transactions, session?.userId, admin, query, tr]);

  const total = rows.reduce((n, t) => n + t.amountUsd, 0);
  const count = investmentCount(rows);

  const columns: Column<Transaction>[] = [
    { key: "ref", header: "Reference", render: (t) => <span className="figure font-semibold">{t.reference}</span> },
    { key: "date", header: "Date", sortValue: (t) => t.createdAt, render: (t) => <span className="text-ink-muted">{fmtDateTime(t.createdAt)}</span> },
    { key: "asset", header: "Asset", sortValue: (t) => t.assetName, render: (t) => <span className="font-semibold">{tr(t.assetName)}</span> },
    ...(admin ? [{ key: "inv", header: "Investor", sortValue: (t: Transaction) => t.investorName, render: (t: Transaction) => (t.kind === "opening" ? `${tr(t.investorName)} · ${tr("opening balance")}` : t.investorName) } satisfies Column<Transaction>] : []),
    { key: "amt", header: "Amount", align: "right", sortValue: (t) => t.amountUsd, render: (t) => <span className="figure font-semibold">{usd(t.amountUsd)}</span> },
    { key: "status", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
  ];

  const exportCsv = () => {
    downloadTextFile(
      `agrix-transactions-${scope}.csv`,
      toCsv([["Reference", "Date", "Asset", "Investor", "Amount USD", "Status", "Investments"].map((h) => tr(h)), ...rows.map((t) => [t.reference, t.createdAt, tr(t.assetName), tr(t.investorName), t.amountUsd, tr(t.status), t.investmentCount ?? 1])]),
    );
    toast.success(tr("CSV exported"), { description: tr("{n} simulated transactions", { n: count }) });
  };

  return (
    <div>
      <PageHeader
        title={admin ? "Transaction Overview" : "Transactions"}
        subtitle={admin ? "Simulated investments across the platform." : "Your simulated investment history."}
        actions={
          <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="h-4 w-4" aria-hidden="true" /> {tr("Export CSV")}
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Wallet className="h-5 w-5" />} label={admin ? "Recorded volume" : "Total invested"} value={usd(total)} />
        <StatCard icon={<ArrowLeftRight className="h-5 w-5" />} label="Transactions" value={String(count)} />
        <StatCard icon={<Coins className="h-5 w-5" />} label="Average ticket" value={usd(count ? Math.round(total / count) : 0)} />
      </div>

      <div className="mt-6">
        <label className="relative mb-3 block max-w-sm">
          <span className="sr-only">{tr("Search transactions")}</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tr("Search by reference or asset")} className="field h-11 rounded-xl pl-10" />
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
                    <p className="font-semibold">{tr(t.assetName)}</p>
                    <p className="figure font-bold">{usd(t.amountUsd)}</p>
                  </div>
                  <p className="text-xs text-ink-muted">
                    {t.reference} · {fmtDateTime(t.createdAt)}
                    {admin ? ` · ${tr(t.investorName)}${t.kind === "opening" ? ` · ${tr("opening balance")}` : ""}` : ""}
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
