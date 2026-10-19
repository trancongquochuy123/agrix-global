"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
import { useT } from "@/lib/i18n/react";

const labelCls = "px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted";

/**
 * Presenter utility: a small, closed-by-default control in the bottom-right corner. It is mounted only when
 * NEXT_PUBLIC_DEMO_MODE=true (see AppShell) and renders nothing else on the page.
 */
export function DemoSwitcher() {
  const router = useRouter();
  const t = useT();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const { session, scenario } = useDemo();
  const boxRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<"right" | "left">("right");
  const [lift, setLift] = useState(0);
  const liftRef = useRef(0);

  // Primary actions are tagged data-demo-avoid. When the control would sit on top of one, it moves to the opposite
  // corner (unless that corner is covered too). Re-evaluated on scroll, resize and route change; never while open.
  useEffect(() => {
    if (!hydrated || open) return;
    let raf = 0;
    const evaluate = () => {
      raf = 0;
      const el = boxRef.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      if (box.width === 0) return;
      const vw = document.documentElement.clientWidth;
      const gutter = vw >= 640 ? 16 : 12;
      const leftGutter = vw >= 1280 ? 252 : vw >= 768 ? 84 : gutter;
      // Measure without the current lift so the decision does not depend on where the control happens to be.
      const baseTop = box.top + liftRef.current;
      const baseBottom = box.bottom + liftRef.current;
      const at = (left: number, up = 0) => ({ left, right: left + box.width, top: baseTop - up, bottom: baseBottom - up });
      const spots = { right: at(vw - gutter - box.width), left: at(leftGutter) };
      const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-demo-avoid]")).map((n) => n.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0);
      const hits = (s: { left: number; right: number; top: number; bottom: number }) => targets.filter((r) => r.left < s.right + 4 && r.right > s.left - 4 && r.top < s.bottom + 4 && r.bottom > s.top - 4);
      let nextSide: "right" | "left" = "right";
      let up = 0;
      if (hits(spots.right).length) {
        if (!hits(spots.left).length) nextSide = "left";
        else {
          // Both corners are covered by a wide action: stay put and lift just above it.
          for (let i = 0; i < 4; i++) {
            const h = hits(at(spots.right.left, up));
            if (!h.length) break;
            up = baseBottom - (Math.min(...h.map((r) => r.top)) - 8);
          }
          if (baseTop - up < 8 || hits(at(spots.right.left, up)).length) up = 0;
        }
      }
      liftRef.current = up;
      setSide(nextSide);
      setLift(up);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(evaluate);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mo.disconnect();
    };
  }, [hydrated, open, pathname]);

  if (!hydrated) return null;

  const switchRole = (role: Role) => {
    if (session?.role === role) {
      router.push(homeOf(role));
      return;
    }
    const res = signInAs(role);
    if (!res.ok) {
      toast.error(t(res.error), { description: t("{role} workspace is unavailable. An admin can reactivate it under Users.", { role: t(ROLE_LABEL[role]) }) });
      return;
    }
    router.push(homeOf(role));
    toast(t("Switched to {role}", { role: t(ROLE_LABEL[role]) }), { description: t("Demo data is unchanged.") });
  };

  return (
    <div
      ref={boxRef}
      data-demo-side={side}
      className={side === "right" ? "fixed right-3 z-40 sm:right-4" : "fixed left-3 z-40 sm:left-4 md:left-[84px] xl:left-[252px]"}
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem + var(--demo-offset, 0px))", transform: lift ? `translateY(-${Math.round(lift)}px)` : undefined }}
    >
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={t("Open demo controls")}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-white/95 px-3 text-xs font-medium text-ink-muted shadow-card transition-colors hover:bg-green-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            {t("Demo")}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" sideOffset={8} collisionPadding={12} className="w-60 max-w-[calc(100vw-1.5rem)]">
          <DropdownMenuLabel className={labelCls}>{t("Switch Workspace")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={session?.role ?? ""} onValueChange={(v) => switchRole(v as Role)}>
            {ROLES.map((r) => (
              <DropdownMenuRadioItem key={r} value={r}>
                {t(ROLE_LABEL[r])}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className={labelCls}>{t("Demo Scenario")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={scenario}
            onValueChange={(v) => {
              const next = SCENARIOS.find((s) => s.id === v);
              loadScenario(v as ScenarioId);
              toast(t("Scenario loaded: {name}", { name: t(next?.label ?? "") }), { description: next?.hint ? t(next.hint) : undefined });
            }}
          >
            {SCENARIOS.map((s) => (
              <DropdownMenuRadioItem key={s.id} value={s.id} title={t(s.hint)}>
                {t(s.label)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              resetDemo();
              toast.success(t("Demo data reset"), { description: t("Restored the original baseline.") });
            }}
          >
            <RotateCcw className="h-4 w-4 text-ink-muted" aria-hidden="true" />
            {t("Reset Demo Data")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
