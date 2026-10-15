"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { fmtDateTime } from "@/lib/demo/format";
import { useDemo } from "@/lib/demo/hooks";

export function ActivityView() {
  const { activity } = useDemo();
  return (
    <div>
      <PageHeader title="Activity log" subtitle="Every simulated action across all workspaces, newest first." />
      <ol className="card divide-y divide-line">
        {activity.map((e) => (
          <li key={e.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3 text-sm">
            <p className="min-w-0">
              <span className="font-semibold">{e.actor}</span> · {e.action} · <span className="text-ink-muted">{e.target}</span>
            </p>
            <time dateTime={e.at} className="text-xs text-ink-muted">
              {fmtDateTime(e.at)}
            </time>
          </li>
        ))}
      </ol>
    </div>
  );
}
