"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { AssetCell } from "@/components/investor/PositionsTable";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/states";
import { FilterBar, FilterChip } from "@/components/shared/FilterBar";
import { PageHeader } from "@/components/shared/PageHeader";
import { ListingStatusBadge } from "@/components/shared/badges";
import { fmtDate, usd } from "@/lib/demo/format";
import { useDemo } from "@/lib/demo/hooks";
import type { Asset } from "@/types/asset";
import { useT } from "@/lib/i18n/react";

export function ApprovalQueue() {
  const demo = useDemo();
  const router = useRouter();
  const t = useT();
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const all = demo.assets.filter((a) => a.createdAt);
  const rows = tab === "pending" ? all.filter((a) => a.status === "pending_review") : all;

  const columns: Column<Asset>[] = [
    { key: "asset", header: "Asset", sortValue: (a) => a.name, render: (a) => <AssetCell asset={a} /> },
    { key: "seller", header: "Seller", sortValue: (a) => a.ownerName, render: (a) => <span className="text-ink-muted">{t(a.ownerName)}</span> },
    { key: "value", header: "Asset value", align: "right", sortValue: (a) => a.assetValueUsd, render: (a) => <span className="figure font-semibold">{usd(a.assetValueUsd)}</span> },
    { key: "sub", header: "Submitted", sortValue: (a) => a.submittedAt ?? a.createdAt, render: (a) => <span className="text-ink-muted">{fmtDate(a.submittedAt ?? a.createdAt)}</span> },
    { key: "status", header: "Status", sortValue: (a) => a.status, render: (a) => <ListingStatusBadge status={a.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Approval queue" subtitle="Review submitted listings, check documents and the AI risk summary, then decide." />
      <FilterBar className="mb-4">
        <FilterChip active={tab === "pending"} onClick={() => setTab("pending")}>
          {t("Pending")} ({all.filter((a) => a.status === "pending_review").length})
        </FilterChip>
        <FilterChip active={tab === "all"} onClick={() => setTab("all")}>
          {t("All listings")} ({all.length})
        </FilterChip>
      </FilterBar>
      {rows.length === 0 ? (
        <EmptyState icon={<ClipboardCheck className="h-6 w-6" />} title="Queue is clear" description="New seller submissions will appear here for review." />
      ) : (
        <div className="card p-2 sm:p-3">
          <DataTable
            caption="Asset approval queue"
            columns={columns}
            rows={rows}
            rowKey={(a) => a.id}
            rowLabel={(a) => t("Review {name}", { name: t(a.name) })}
            onRowClick={(a) => router.push(`/admin/approvals/${a.id}`)}
            minWidth="min-w-[760px]"
            mobileCard={(a) => (
              <div className="space-y-3">
                <AssetCell asset={a} />
                <div className="flex items-center justify-between text-xs">
                  <ListingStatusBadge status={a.status} />
                  <span className="text-ink-muted">{t(a.ownerName)}</span>
                </div>
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}
