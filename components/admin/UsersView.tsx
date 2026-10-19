"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/PageHeader";
import { fmtDate } from "@/lib/demo/format";
import { useDemo } from "@/lib/demo/hooks";
import { toggleUserStatus } from "@/lib/demo/store";
import { ROLE_LABEL, type DemoUser } from "@/lib/demo/types";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/react";

const pill = (active: boolean) => cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", active ? "bg-green-50 text-green-700 ring-green-200" : "bg-[#FBE5E3] text-danger ring-[#F0C7C2]");

export function UsersView() {
  const { users } = useDemo();
  const t = useT();
  const [q, setQ] = useState("");
  const rows = users.filter((u) => [u.name, u.email, u.org, u.role, t(u.org), t(ROLE_LABEL[u.role])].some((f) => f.toLowerCase().includes(q.trim().toLowerCase())));

  const toggle = (u: DemoUser) => {
    toggleUserStatus(u.id);
    toast.success(u.status === "Active" ? t("User suspended") : t("User reactivated"), { description: u.name });
  };
  const action = (u: DemoUser) =>
    u.role === "admin" ? (
      <span className="text-xs text-ink-muted">—</span>
    ) : (
      <Button size="sm" variant="outline" data-demo-avoid onClick={() => toggle(u)} aria-label={t(u.status === "Active" ? "Suspend {name}" : "Reactivate {name}", { name: u.name })}>
        {u.status === "Active" ? t("Suspend") : t("Reactivate")}
      </Button>
    );

  const columns: Column<DemoUser>[] = [
    {
      key: "name",
      header: "User",
      sortValue: (u) => u.name,
      render: (u) => (
        <div className="min-w-0">
          <p className="truncate font-semibold">{u.name}</p>
          <p className="truncate text-xs text-ink-muted">{u.email}</p>
        </div>
      ),
    },
    { key: "role", header: "Role", sortValue: (u) => u.role, render: (u) => t(ROLE_LABEL[u.role]) },
    { key: "org", header: "Organisation", render: (u) => <span className="text-ink-muted">{t(u.org)}</span> },
    { key: "kyc", header: "Onboarding check", render: (u) => <span className="text-xs text-ink-muted">{t(u.kyc)}</span> },
    { key: "joined", header: "Joined", sortValue: (u) => u.joined, render: (u) => <span className="text-ink-muted">{fmtDate(u.joined)}</span> },
    { key: "status", header: "Status", render: (u) => <span className={pill(u.status === "Active")}>{t(u.status)}</span> },
    { key: "act", header: "", align: "right", render: action },
  ];

  return (
    <div>
      <PageHeader title="User management" subtitle="Simulated accounts. Suspending a user only changes demo data." />
      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search users")} aria-label={t("Search users")} className="field w-full pl-9" />
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No users match" description="Try a different search." />
      ) : (
        <div className="card p-2 sm:p-3">
          <DataTable
            caption="Users"
            columns={columns}
            rows={rows}
            rowKey={(u) => u.id}
            minWidth="min-w-[860px]"
            mobileCard={(u) => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{u.name}</p>
                    <p className="truncate text-xs text-ink-muted">
                      {t(ROLE_LABEL[u.role])} · {u.email}
                    </p>
                  </div>
                  <span className={pill(u.status === "Active")}>{t(u.status)}</span>
                </div>
                {action(u)}
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}
