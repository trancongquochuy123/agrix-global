import type { Metadata } from "next";
import { ApprovalQueue } from "@/components/admin/ApprovalQueue";

export const metadata: Metadata = { title: "Approval Queue" };

export default function Page() {
  return <ApprovalQueue />;
}
