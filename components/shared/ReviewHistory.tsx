"use client";

import { ChartCard } from "@/components/shared/ChartCard";
import { fmtDateTime } from "@/lib/demo/format";
import type { ReviewEvent } from "@/types/asset";
import { useT } from "@/lib/i18n/react";

const LABEL: Record<ReviewEvent["kind"], string> = {
  approved: "Approved",
  rejected: "Rejected",
  changes_requested: "Changes requested",
  edited: "Seller saved changes",
  resubmitted: "Resubmitted for review",
};

/** Chronological record of admin decisions and seller corrections for one listing. */
export function ReviewHistory({ events }: { events: ReviewEvent[] | undefined }) {
  const t = useT();
  if (!events || events.length === 0) return null;
  return (
    <ChartCard title="Review history">
      <ol className="space-y-3 text-sm" aria-label={t("Review history")}>
        {events.map((e) => (
          <li key={e.id}>
            <p className="font-semibold">
              {t(LABEL[e.kind])} <span className="font-normal text-ink-muted">· {e.actor}</span>
            </p>
            <p className="text-xs text-ink-muted">{fmtDateTime(e.at)}</p>
            {e.note && <p className="mt-1 text-xs">{t(e.note)}</p>}
            {e.changedFields && e.changedFields.length > 0 && <p className="mt-1 text-xs">{t("Changed:")} {e.changedFields.map((f) => t(f)).join(", ")}</p>}
          </li>
        ))}
      </ol>
    </ChartCard>
  );
}
