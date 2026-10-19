"use client";

import { useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import type { UploadedFile } from "./formModel";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/react";

const MAX_MB = 10;

export function UploadZone({
  id,
  files,
  onChange,
  accept = ".pdf,.jpg,.jpeg,.png",
  multiple = true,
  label = "Drag & drop files here, or click to browse",
  hint = `PDF, JPG or PNG up to ${MAX_MB} MB`,
}: {
  id: string;
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  hint?: string;
}) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const ingest = (list: FileList | null) => {
    if (!list) return;
    const allowed = accept.split(",").map((a) => a.trim().toLowerCase());
    const next: UploadedFile[] = [];
    for (const f of Array.from(list)) {
      const ext = `.${f.name.split(".").pop()?.toLowerCase() ?? ""}`;
      if (!allowed.includes(ext)) {
        toast.error(t("{name} was skipped", { name: f.name }), { description: t("Unsupported file type. Allowed: {types}", { types: accept }) });
        continue;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        toast.error(t("{name} was skipped", { name: f.name }), { description: t("Files must be smaller than {n} MB.", { n: MAX_MB }) });
        continue;
      }
      next.push({ name: f.name, sizeKb: Math.max(1, Math.round(f.size / 1024)) });
    }
    if (next.length) onChange(multiple ? [...files, ...next] : next.slice(0, 1));
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          ingest(e.dataTransfer.files);
        }}
        className={cn(
          "relative flex flex-col items-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors duration-150",
          dragging ? "border-green-600 bg-green-50" : "border-line bg-white hover:bg-green-50/60",
        )}
      >
        <UploadCloud className="h-8 w-8 text-green-600" aria-hidden="true" />
        <label htmlFor={id} className="mt-2 cursor-pointer text-sm font-semibold after:absolute after:inset-0">
          {t(label)}
        </label>
        <p className="mt-1 text-xs text-ink-muted">{t(hint)}</p>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => ingest(e.target.files)}
        />
      </div>
      {files.length > 0 && (
        <ul className="mt-3 space-y-2" aria-label={t("Uploaded files")}>
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-lg border border-line bg-white px-3 py-2 text-sm">
              <FileText className="h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate font-medium">{f.name}</span>
              <span className="text-xs text-ink-muted">{f.sizeKb >= 1024 ? `${(f.sizeKb / 1024).toFixed(1)} MB` : `${f.sizeKb} KB`}</span>
              <button
                type="button"
                aria-label={t("Remove {name}", { name: f.name })}
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                className="rounded p-1 text-ink-muted transition-colors hover:bg-green-50 hover:text-danger"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
