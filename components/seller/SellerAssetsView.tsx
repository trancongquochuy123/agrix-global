"use client";

import Link from "next/link";
import { useState } from "react";
import { PlusCircle, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/states";
import { FilterBar, FilterChip } from "@/components/shared/FilterBar";
import { PageHeader } from "@/components/shared/PageHeader";
import { useDemo } from "@/lib/demo/hooks";
import { assetsOwnedBy, STATUS_LABEL } from "@/lib/demo/selectors";
import type { AssetStatus } from "@/types/asset";
import { AssetsTable } from "./AssetsTable";
import { useT } from "@/lib/i18n/react";

type Filter = "all" | AssetStatus;
const FILTERS: Filter[] = ["all", "pending_review", "changes_requested", "published", "rejected"];

export function SellerAssetsView() {
  const demo = useDemo();
  const t = useT();
  const [filter, setFilter] = useState<Filter>("all");
  const mine = assetsOwnedBy(demo, demo.session!.userId);
  const rows = filter === "all" ? mine : mine.filter((a) => a.status === filter);

  return (
    <div>
      <PageHeader
        title="My Assets"
        subtitle="Every listing you registered, with its verification status and funding progress."
        actions={
          <Button asChild>
            <Link href="/seller/assets/new">
              <PlusCircle className="h-4 w-4" aria-hidden="true" /> {t("Create New Asset")}
            </Link>
          </Button>
        }
      />
      <FilterBar className="mb-4">
        {FILTERS.map((f) => (
          <FilterChip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === "all" ? `${t("All")} (${mine.length})` : `${t(STATUS_LABEL[f])} (${mine.filter((a) => a.status === f).length})`}
          </FilterChip>
        ))}
      </FilterBar>
      {rows.length === 0 ? (
        <EmptyState
          icon={<Sprout className="h-6 w-6" />}
          title={mine.length === 0 ? "No assets yet" : "No assets with this status"}
          description={mine.length === 0 ? "Create your first listing. It goes to Pending Review until an admin approves it." : "Try another filter."}
          action={
            mine.length === 0 && (
              <Button asChild>
                <Link href="/seller/assets/new">{t("Create New Asset")}</Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="card p-2 sm:p-3">
          <AssetsTable assets={rows} />
        </div>
      )}
    </div>
  );
}
