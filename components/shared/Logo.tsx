import { cn } from "@/lib/utils";

/** The AGRIX "X + leaf" mark — cropped from the official logo (public/images/logo.png). */
export function LogoMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/images/logo-mark.png" alt="" aria-hidden="true" width={256} height={256} className={cn("h-8 w-8 object-contain", className)} />
  );
}

/**
 * The single official AGRIX logo. `tone="light"` is for dark backgrounds (same artwork, wordmark in white);
 * `tone="dark"` uses the original full-colour file.
 */
export function Logo({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={tone === "light" ? "/images/logo-light.png" : "/images/logo.png"}
      alt="AGRIX"
      width={800}
      height={194}
      className={cn("h-8 w-auto", className)}
    />
  );
}
