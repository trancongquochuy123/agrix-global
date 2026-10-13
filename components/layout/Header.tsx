"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Check, ChevronDown, Globe, LogOut, Menu, Plus, Settings, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoMark } from "@/components/shared/Logo";
import { currentUser, languages, notifications } from "@/data/user";
import { useRole } from "@/lib/useRole";
import { GlobalSearch } from "./GlobalSearch";

interface HeaderProps {
  onOpenMobileNav: () => void;
}

const pageActions: Record<string, { label: string; href: string }> = {
  "/dashboard": { label: "Register Asset", href: "/assets/register" },
  "/marketplace": { label: "Register Asset", href: "/assets/register" },
};

export function Header({ onOpenMobileNav }: HeaderProps) {
  const pathname = usePathname();
  const [lang, setLang] = useState<string>("EN");
  const [unread, setUnread] = useState(true);
  const action = pageActions[pathname];
  const { label: roleLabel } = useRole();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6 xl:px-8">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
          className="-ml-1.5 rounded-lg p-2 text-ink transition-colors hover:bg-green-50 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/dashboard" aria-label="AGRIX home" className="md:hidden">
          <LogoMark className="h-7 w-7" />
        </Link>

        <div className="hidden min-w-0 flex-1 sm:block">
          <GlobalSearch />
        </div>
        <div className="flex-1 sm:hidden" />

        <div className="flex items-center gap-1.5 sm:gap-2">
          {action && (
            <Button asChild size="sm" className="hidden lg:inline-flex">
              <Link href={action.href}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                {action.label}
              </Link>
            </Button>
          )}

          <DropdownMenu onOpenChange={(o) => o && setUnread(false)}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={unread ? "Notifications (3 unread)" : "Notifications"}
                className="relative rounded-lg p-2.5 text-ink transition-colors hover:bg-green-50"
              >
                <Bell className="h-[18px] w-[18px]" />
                {unread && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-white" />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80">
              <DropdownMenuLabel className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Notifications
              </DropdownMenuLabel>
              {notifications.map((n) => (
                <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5">
                  <span className="text-sm font-medium">{n.title}</span>
                  <span className="text-xs text-ink-muted">{n.time}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Language: ${lang}`}
                className="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-green-50 sm:flex"
              >
                <Globe className="h-4 w-4" aria-hidden="true" />
                {lang}
                <ChevronDown className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44">
              {languages.map((l) => (
                <DropdownMenuItem
                  key={l.code}
                  onSelect={() => {
                    setLang(l.code);
                    toast.success(`Language set to ${l.label}`, {
                      description: l.code === "EN" ? undefined : "Interface copy is English-only in this prototype.",
                    });
                  }}
                >
                  <span className="flex-1">{l.label}</span>
                  {lang === l.code && <Check className="h-4 w-4 text-green-600" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open profile menu"
                className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-2 transition-colors hover:bg-green-50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-800 text-xs font-bold text-white">
                  {currentUser.initials}
                </span>
                <span className="hidden text-left leading-tight lg:block">
                  <span className="block text-sm font-semibold">{currentUser.name}</span>
                  <span className="block text-xs text-ink-muted">{roleLabel}</span>
                </span>
                <ChevronDown className="hidden h-3.5 w-3.5 text-ink-muted lg:block" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel className="px-2.5 py-2">
                <span className="block text-sm font-semibold">{currentUser.name}</span>
                <span className="block text-xs font-normal text-ink-muted">{currentUser.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <UserRound className="h-4 w-4" aria-hidden="true" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4" aria-hidden="true" /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => toast("Signed out of demo session", { description: "No authentication is wired up." })}>
                <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="px-4 pb-3 sm:hidden">
        <GlobalSearch />
      </div>
    </header>
  );
}
