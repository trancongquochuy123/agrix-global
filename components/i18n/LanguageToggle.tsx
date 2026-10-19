"use client";

import { LANGS, type Lang } from "@/lib/i18n/core";
import { useI18n } from "@/lib/i18n/react";
import { cn } from "@/lib/utils";

const LABEL: Record<Lang, string> = { vi: "VI", en: "EN" };
const NAME: Record<Lang, string> = { vi: "Tiếng Việt", en: "English" };

/** Segmented VI | EN switch. Switching is instant and remembered across pages and reloads. */
export function LanguageToggle({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t("Language")}
      className={cn(
        "inline-flex shrink-0 items-center rounded-lg border p-0.5 text-xs font-semibold",
        tone === "light" ? "border-line bg-white" : "border-white/25 bg-white/5",
        className,
      )}
    >
      {LANGS.map((l, i) => {
        const active = l === lang;
        return (
          <span key={l} className="flex items-center">
            {i > 0 && <span aria-hidden="true" className={cn("mx-0.5 h-3.5 w-px", tone === "light" ? "bg-line" : "bg-white/25")} />}
            <button
              type="button"
              lang={l}
              aria-pressed={active}
              aria-label={NAME[l]}
              title={NAME[l]}
              onClick={() => setLang(l)}
              className={cn(
                "min-w-[2.25rem] rounded-md px-2 py-1.5 leading-none tracking-wide transition-colors duration-150",
                tone === "light"
                  ? active
                    ? "bg-green-600 text-white"
                    : "text-ink-muted hover:bg-green-50 hover:text-ink"
                  : active
                    ? "bg-white text-forest-900"
                    : "text-white/75 hover:bg-white/10 hover:text-white",
              )}
            >
              {LABEL[l]}
            </button>
          </span>
        );
      })}
    </div>
  );
}
