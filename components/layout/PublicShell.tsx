"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/shared/Logo";
import { useHydrated, useSession } from "@/lib/demo/hooks";
import { homeOf } from "@/lib/demo/routes";
import { cn } from "@/lib/utils";

const links = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/how-it-works", label: "How It Works" },
];

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const session = useSession();
  const signedIn = hydrated && !!session;
  const isAuth = pathname.startsWith("/auth");

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-pop"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6 xl:px-8">
          <Link href="/" aria-label="AGRIX home" className="flex shrink-0 items-center">
            <Logo tone="dark" />
          </Link>
          <nav aria-label="Public" className="ml-4 hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn("rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-green-50", active ? "text-green-700" : "text-ink")}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {signedIn ? (
              <Button asChild size="sm">
                <Link href={homeOf(session!.role)}>Go to dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/register">Get started</Link>
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" aria-label="Open menu" className="rounded-lg p-2 text-ink transition-colors hover:bg-green-50 md:hidden">
                  <Menu className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                {links.map((l) => (
                  <DropdownMenuItem key={l.href} asChild>
                    <Link href={l.href}>{l.label}</Link>
                  </DropdownMenuItem>
                ))}
                {!signedIn && (
                  <DropdownMenuItem asChild>
                    <Link href="/auth/login">Log in</Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-24 pt-5 sm:px-6 sm:pt-6 xl:px-8">
        {children}
      </main>
      {!isAuth && (
        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 xl:px-8">
            <p>© 2026 AGRIX. Real Assets. Real Intelligence. Global Capital.</p>
            <p className="max-w-md text-xs sm:text-right">Product prototype: listings, returns, AI scores and transactions are simulated and not an offer to invest.</p>
          </div>
        </footer>
      )}
    </div>
  );
}
