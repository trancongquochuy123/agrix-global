import { CheckCircle2, ShieldCheck } from "lucide-react";
import type { RiskLevel } from "@/types/asset";
import { cn } from "@/lib/utils";

const riskStyles: Record<string, string> = {
  Low: "bg-green-50 text-green-700 ring-green-100",
  Medium: "bg-[#FBEFD9] text-[#8A5A0B] ring-[#F1DCB4]",
  Moderate: "bg-[#FBEFD9] text-[#8A5A0B] ring-[#F1DCB4]",
  High: "bg-[#FBE5E3] text-[#9B2C25] ring-[#F3C9C5]",
};

export function RiskBadge({ level, className }: { level: RiskLevel | "Moderate"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        riskStyles[level],
        className,
      )}
    >
      {level}
    </span>
  );
}

const statusStyles: Record<string, { cls: string; dot: string }> = {
  Active: { cls: "text-green-700", dot: "bg-green-600" },
  Verified: { cls: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-100", dot: "bg-green-600" },
  "In Review": { cls: "bg-[#FBEFD9] text-[#8A5A0B] ring-1 ring-inset ring-[#F1DCB4]", dot: "bg-warning" },
  Pending: { cls: "bg-[#FBEFD9] text-[#8A5A0B] ring-1 ring-inset ring-[#F1DCB4]", dot: "bg-warning" },
  Completed: { cls: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-100", dot: "bg-green-600" },
  Maturing: { cls: "text-[#8A5A0B]", dot: "bg-warning" },
  Funding: { cls: "text-forest-700", dot: "bg-forest-700" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = statusStyles[status] ?? statusStyles.Pending;
  const pill = s.cls.includes("ring-1");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold",
        pill && "rounded-full px-2.5 py-0.5",
        s.cls,
        className,
      )}
    >
      {!pill && <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} aria-hidden="true" />}
      {status}
    </span>
  );
}

export function VerifiedBadge({
  label = "AI Verified",
  variant = "inline",
  className,
}: {
  label?: string;
  variant?: "inline" | "overlay";
  className?: string;
}) {
  const Icon = variant === "overlay" ? CheckCircle2 : ShieldCheck;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full text-xs font-semibold",
        variant === "overlay"
          ? "bg-forest-900/85 px-2.5 py-1 text-white backdrop-blur-sm"
          : "bg-green-100 px-3 py-1.5 text-green-700",
        className,
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", variant === "overlay" ? "text-lime-indicator" : "text-green-600")} aria-hidden="true" />
      {label}
    </span>
  );
}

const listingStyles: Record<string, string> = {
  published: "bg-green-50 text-green-700 ring-green-100",
  pending_review: "bg-[#FBEFD9] text-[#8A5A0B] ring-[#F1DCB4]",
  changes_requested: "bg-[#FDF1E3] text-[#9A5B12] ring-[#F1D6B0]",
  rejected: "bg-[#FBE5E3] text-[#9B2C25] ring-[#F3C9C5]",
};

const listingLabel: Record<string, string> = {
  published: "Published",
  pending_review: "Pending Review",
  changes_requested: "Changes Requested",
  rejected: "Rejected",
};

/** Lifecycle status of a seller listing. */
export function ListingStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", listingStyles[status] ?? listingStyles.pending_review, className)}>
      {listingLabel[status] ?? status}
    </span>
  );
}
