"use client";

import { Download, FileSpreadsheet, FileText, MapPinned } from "lucide-react";
import { toast } from "sonner";
import type { AssetDocument } from "@/types/asset";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/react";

const iconFor = { PDF: FileText, XLSX: FileSpreadsheet, KML: MapPinned } as const;
const colorFor = { PDF: "bg-[#FBE5E3] text-danger", XLSX: "bg-green-50 text-green-700", KML: "bg-[#E4EEF7] text-[#2F6A9E]" } as const;

export function DocumentRow({ doc, className, assetName }: { doc: AssetDocument; className?: string; assetName?: string }) {
  const t = useT();
  const Icon = iconFor[doc.fileType];
  return (
    <div className={cn("flex min-w-0 items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5", className)}>
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", colorFor[doc.fileType])}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{t(doc.name)}</p>
        <p className="text-xs text-ink-muted">
          {assetName ? `${t(assetName)} · ` : ""}{doc.fileType} · {doc.size}
        </p>
      </div>
      <span className="hidden text-xs text-ink-muted sm:block">{t(doc.date)}</span>
      <button
        type="button"
        data-demo-avoid
        aria-label={t("Download {name}", { name: t(doc.name) })}
        onClick={() => toast.success(t("Download started"), { description: t("{name} ({size}) — demo file", { name: t(doc.name), size: doc.size }) })}
        className="rounded-md p-2 text-ink-muted transition-colors hover:bg-green-50 hover:text-ink"
      >
        <Download className="h-4 w-4" />
      </button>
    </div>
  );
}
