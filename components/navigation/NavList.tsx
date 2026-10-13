"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { isActive, navItems } from "./nav-items";

interface NavListProps {
  /** Show text labels (always on drawer/xl; on tablet only when expanded). */
  labelClassName?: string;
  onNavigate?: () => void;
  iconOnlyTooltip?: boolean;
}

export function NavList({ labelClassName = "inline", onNavigate }: NavListProps) {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = isActive(item, pathname);
        const Icon = item.icon;
        const classes = cn(
          "group relative flex h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-colors duration-150",
          active ? "bg-forest-700 text-white" : "text-white/75 hover:bg-white/10 hover:text-white",
        );
        const content = (
          <>
            {active && (
              <span aria-hidden="true" className="absolute left-0 top-2.5 h-6 w-[3px] rounded-r-full bg-lime-indicator" />
            )}
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            <span className={labelClassName}>{item.label}</span>
          </>
        );
        if (!item.href) {
          return (
            <button
              key={item.label}
              type="button"
              title={item.label}
              className={cn(classes, "w-full text-left")}
              onClick={() => {
                toast.info(`${item.label} isn't part of this prototype`, {
                  description: "The six core screens are fully interactive.",
                });
                onNavigate?.();
              }}
            >
              {content}
            </button>
          );
        }
        return (
          <Link
            key={item.label}
            href={item.href}
            title={item.label}
            aria-current={active ? "page" : undefined}
            className={classes}
            onClick={onNavigate}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
