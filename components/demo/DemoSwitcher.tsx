"use client";

import { useRouter } from "next/navigation";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDemo, useHydrated } from "@/lib/demo/hooks";
import { homeOf } from "@/lib/demo/routes";
import { loadScenario, resetDemo, signInAs } from "@/lib/demo/store";
import { ROLE_LABEL, ROLES, SCENARIOS, type Role, type ScenarioId } from "@/lib/demo/types";

const labelCls = "px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted";

/**
 * Presenter utility: a small, closed-by-default control in the bottom-right corner. It is mounted only when
 * NEXT_PUBLIC_DEMO_MODE=true (see AppShell) and renders nothing else on the page.
 */
export function DemoSwitcher() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { session, scenario } = useDemo();
  if (!hydrated) return null;

  const switchRole = (role: Role) => {
    if (session?.role === role) {
      router.push(homeOf(role));
      return;
    }
    signInAs(role);
    router.push(homeOf(role));
    toast(`Switched to ${ROLE_LABEL[role]}`, { description: "Demo data is unchanged." });
  };

  return (
    <div
      className="fixed right-3 z-40 sm:right-4"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem + var(--demo-offset, 0px))" }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Open demo controls"
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-white/95 px-3 text-xs font-medium text-ink-muted shadow-card transition-colors hover:bg-green-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            Demo
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" sideOffset={8} collisionPadding={12} className="w-60 max-w-[calc(100vw-1.5rem)]">
          <DropdownMenuLabel className={labelCls}>Switch Workspace</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={session?.role ?? ""} onValueChange={(v) => switchRole(v as Role)}>
            {ROLES.map((r) => (
              <DropdownMenuRadioItem key={r} value={r}>
                {ROLE_LABEL[r]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className={labelCls}>Demo Scenario</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={scenario}
            onValueChange={(v) => {
              const next = SCENARIOS.find((s) => s.id === v);
              loadScenario(v as ScenarioId);
              toast(`Scenario loaded: ${next?.label}`, { description: next?.hint });
            }}
          >
            {SCENARIOS.map((s) => (
              <DropdownMenuRadioItem key={s.id} value={s.id} title={s.hint}>
                {s.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              resetDemo();
              toast.success("Demo data reset", { description: "Restored the original baseline." });
            }}
          >
            <RotateCcw className="h-4 w-4 text-ink-muted" aria-hidden="true" />
            Reset Demo Data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
