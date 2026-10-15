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

const pill = (active: boolean) => cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", active ? "bg-green-50 text-green-700 ring-green-200" : "bg-[#FBE5E3] text-danger ring-[#F0C7C2]");

export function UsersView() {
  const { users } = useDemo();
  const [q, setQ] = useState("");
  const rows = users.filter((u) => [u.name, u.email, u.org, u.role].some((f) => f.toLowerCase().includes(q.trim().toLowerCase())));

  const toggle = (u: DemoUser) => {
    toggleUserStatus(u.id);
    toast.success(u.status === "Active" ? "User suspended" : "User reactivated", { description: u.name });
  };
  const action = (u: DemoUser) =>
    u.role === "admin" ? (
      <span className="text-xs text-ink-muted">—</span>
    ) : (
      <Button size="sm" variant="outline" onClick={() => toggle(u)} aria-label={`${u.status === "Active" ? "Suspend" : "Reactivate"} ${u.name}`}>
        {u.status === "Active" ? "Suspend" : "Reactivate"}
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
    { key: "role", header: "Role", sortValue: (u) => u.role, render: (u) => ROLE_LABEL[u.role] },
    { key: "org", header: "Organisation", render: (u) => <span className="text-ink-muted">{u.org}</span> },
    { key: "kyc", header: "Onboarding check", render: (u) => <span className="text-xs text-ink-muted">{u.kyc}</span> },
    { key: "joined", header: "Joined", sortValue: (u) => u.joined, render: (u) => <span className="text-ink-muted">{fmtDate(u.joined)}</span> },
    { key: "status", header: "Status", render: (u) => <span className={pill(u.status === "Active")}>{u.status}</span> },
    { key: "act", header: "", align: "right", render: action },
  ];

  return (
    <div>
      <PageHeader title="User management" subtitle="Simulated accounts. Suspending a user only changes demo data." />
      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users" aria-label="Search users" className="field w-full pl-9" />
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
                      {ROLE_LABEL[u.role]} · {u.email}
                    </p>
                  </div>
                  <span className={pill(u.status === "Active")}>{u.status}</span>
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
