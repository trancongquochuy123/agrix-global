"use client";

import Link from "next/link";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/react";

export default function NotFound() {
  const t = useT();
  return (
    <EmptyState
      title="Page not found"
      description="The page or asset you're looking for doesn't exist or has been moved."
      action={
        <Button asChild>
          <Link href="/marketplace">{t("Back to marketplace")}</Link>
        </Button>
      }
    />
  );
}
