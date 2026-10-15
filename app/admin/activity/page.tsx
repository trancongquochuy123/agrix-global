import type { Metadata } from "next";
import { ActivityView } from "@/components/admin/ActivityView";

export const metadata: Metadata = { title: "Activity Log" };

export default function Page() {
  return <ActivityView />;
}
