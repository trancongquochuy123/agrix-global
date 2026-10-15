import type { Metadata } from "next";
import { ApprovalReview } from "@/components/admin/ApprovalReview";

export const metadata: Metadata = { title: "Review Listing" };
export const dynamicParams = true;

export function generateStaticParams() {
  return [{ id: "VN-CF-001" }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApprovalReview id={id} />;
}
