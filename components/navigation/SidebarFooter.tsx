"use client";

import { useSession } from "@/lib/demo/hooks";
import { ROLE_LABEL } from "@/lib/demo/types";
import { LOCAL_IMAGES } from "@/data/images";
import { cn } from "@/lib/utils";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function SidebarFooter({ showCard = true, showUserText = true }: { showCard?: boolean; showUserText?: boolean }) {
  const session = useSession();
  return (
    <div className="mt-auto space-y-3 p-3">
      {showCard && (
        <div
          className="relative overflow-hidden rounded-xl p-4 pt-14 text-white"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(7,29,23,0.15), rgba(7,29,23,0.92)), url(${LOCAL_IMAGES.landscape})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <p className="font-heading text-[15px] font-bold leading-tight">Real Assets. Real Impact.</p>
          <p className="mt-1 text-xs text-white/75">Sustainable agriculture for a stronger tomorrow.</p>
        </div>
      )}
      {session && (
        <div className="flex items-center gap-3 rounded-xl px-1.5 py-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-green-50 text-xs font-bold text-green-700">
            {initials(session.name)}
          </div>
          <div className={cn("min-w-0 leading-tight", !showUserText && "hidden")}>
            <p className="truncate text-sm font-semibold text-ink">{session.name}</p>
            <p className="text-xs text-ink-muted">{ROLE_LABEL[session.role]}</p>
          </div>
        </div>
      )}
    </div>
  );
}
