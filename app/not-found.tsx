import Link from "next/link";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      description="The page or asset you're looking for doesn't exist or has been moved."
      action={
        <Button asChild>
          <Link href="/marketplace">Back to marketplace</Link>
        </Button>
      }
    />
  );
}
