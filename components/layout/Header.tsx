"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check, ChevronDown, Globe, LogOut, Menu, Plus, Repeat, UserRound } from "lucide-react";
import { useState } from "react";
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
import { languages } from "@/data/user";
import { useDemo } from "@/lib/demo/hooks";
import { homeOf } from "@/lib/demo/routes";
import { markNoticesRead, signOut } from "@/lib/demo/store";
import { fmtDate } from "@/lib/demo/format";
import { ROLE_LABEL, type Role } from "@/lib/demo/types";
import { GlobalSearch } from "./GlobalSearch";

interface HeaderProps {
  role: Role;
  onOpenMobileNav: () => void;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function Header({ role, onOpenMobileNav }: HeaderProps) {
  const router = useRouter();
  const [lang, setLang] = useState<string>("EN");
  const { session, notices } = useDemo();
  const mine = notices.filter((n) => n.to === role);
  const unread = mine.filter((n) => !n.read).length;
  const name = session?.name ?? ROLE_LABEL[role];

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
        <Link href={homeOf(role)} aria-label="AGRIX home" className="md:hidden">
          <LogoMark className="h-7 w-7" />
        </Link>

        <div className="hidden min-w-0 flex-1 sm:block">
          <GlobalSearch role={role} />
        </div>
        <div className="flex-1 sm:hidden" />

        <div className="flex items-center gap-1.5 sm:gap-2">
          {role === "seller" && (
            <Button asChild size="sm" className="hidden lg:inline-flex">
              <Link href="/seller/assets/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create New Asset
              </Link>
            </Button>
          )}

          <DropdownMenu onOpenChange={(o) => !o && markNoticesRead(role)}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={unread ? `Notifications (${unread} unread)` : "Notifications"}
                className="relative rounded-lg p-2.5 text-ink transition-colors hover:bg-green-50"
              >
                <Bell className="h-[18px] w-[18px]" />
                {unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-white" />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 max-w-[calc(100vw-2rem)]">
              <DropdownMenuLabel className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">Notifications</DropdownMenuLabel>
              {mine.length === 0 && <p className="px-2.5 py-3 text-sm text-ink-muted">You&apos;re all caught up.</p>}
              {mine.slice(0, 4).map((n) => (
                <DropdownMenuItem key={n.id} asChild>
                  <Link href={n.href ?? `/${role}/notifications`} className="flex-col items-start gap-0.5">
                    <span className="flex w-full items-center gap-2 text-sm font-medium">
                      {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-600" aria-hidden="true" />}
                      <span className="min-w-0 flex-1 truncate">{n.title}</span>
                    </span>
                    <span className="text-xs text-ink-muted">{fmtDate(n.createdAt)}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
              {role !== "admin" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/${role}/notifications`} className="justify-center font-semibold text-green-700">
                      View all notifications
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
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
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-800 text-xs font-bold text-white">{initials(name)}</span>
                <span className="hidden text-left leading-tight lg:block">
                  <span className="block text-sm font-semibold">{name}</span>
                  <span className="block text-xs text-ink-muted">{ROLE_LABEL[role]}</span>
                </span>
                <ChevronDown className="hidden h-3.5 w-3.5 text-ink-muted lg:block" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60">
              <DropdownMenuLabel className="px-2.5 py-2">
                <span className="block text-sm font-semibold">{name}</span>
                <span className="block break-all text-xs font-normal text-ink-muted">{session?.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${role}/profile`}>
                  <UserRound className="h-4 w-4" aria-hidden="true" /> {role === "seller" ? "Business profile" : "Profile"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/auth/login">
                  <Repeat className="h-4 w-4" aria-hidden="true" /> Switch demo account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  signOut();
                  router.push("/");
                  toast("Signed out", { description: "Demo session ended." });
                }}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="px-4 pb-3 sm:hidden">
        <GlobalSearch role={role} />
      </div>
    </header>
  );
}
