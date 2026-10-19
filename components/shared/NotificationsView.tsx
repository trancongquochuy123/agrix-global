"use client";

import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/PageHeader";
import { fmtDate } from "@/lib/demo/format";
import { useDemo } from "@/lib/demo/hooks";
import { markNoticesRead } from "@/lib/demo/store";
import type { Role } from "@/lib/demo/types";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/react";

export function NotificationsView({ role }: { role: Role }) {
  const { notices } = useDemo();
  const t = useT();
  const mine = notices.filter((n) => n.to === role);
  const unread = mine.filter((n) => !n.read).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={unread ? t("{n} unread", { n: unread }) : t("You're all caught up.")}
        actions={
          <Button variant="outline" disabled={unread === 0} onClick={() => markNoticesRead(role)}>
            <CheckCheck className="h-4 w-4" aria-hidden="true" /> {t("Mark all as read")}
          </Button>
        }
      />
      {mine.length === 0 ? (
        <EmptyState icon={<Bell className="h-6 w-6" />} title="No notifications" description="Updates about listings, approvals and investments will appear here." />
      ) : (
        <ul className="card divide-y divide-line">
          {mine.map((n) => {
            const body = (
              <div className="flex items-start gap-3 px-4 py-3.5">
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-line" : "bg-green-600")} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm", n.read ? "font-medium" : "font-bold")}>{t(n.title)}</p>
                  <p className="mt-0.5 text-sm text-ink-muted">{t(n.body)}</p>
                </div>
                <span className="shrink-0 text-xs text-ink-muted">{fmtDate(n.createdAt)}</span>
              </div>
            );
            return (
              <li key={n.id}>
                {n.href ? (
                  <Link href={n.href} className="block transition-colors hover:bg-green-50/60">
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
