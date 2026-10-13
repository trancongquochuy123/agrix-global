"use client";

import { ErrorState } from "@/components/shared/states";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState onRetry={reset} />;
}
