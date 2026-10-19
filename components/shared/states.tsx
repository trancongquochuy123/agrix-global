"use client";

import type { ReactNode } from "react";
import { AlertTriangle, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/react";

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  const t = useT();
  return (
    <div className={cn("card flex flex-col items-center px-6 py-14 text-center", className)}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
        {icon ?? <SearchX className="h-6 w-6" />}
      </div>
      <h3 className="text-lg font-bold">{t(title)}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{t(description)}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  const t = useT();
  return (
    <div role="alert" className={cn("card flex flex-col items-center px-6 py-14 text-center", className)}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FBE5E3] text-danger">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold">{t(title)}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{t(description)}</p>
      {onRetry && (
        <Button className="mt-5" variant="outline" onClick={onRetry}>
          {t("Try again")}
        </Button>
      )}
    </div>
  );
}
