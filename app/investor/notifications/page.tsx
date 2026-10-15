import type { Metadata } from "next";
import { NotificationsView } from "@/components/shared/NotificationsView";

export const metadata: Metadata = { title: "Notifications" };

export default function Page() {
  return <NotificationsView role="investor" />;
}
