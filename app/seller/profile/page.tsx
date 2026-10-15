import type { Metadata } from "next";
import { ProfileView } from "@/components/shared/ProfileView";

export const metadata: Metadata = { title: "Profile" };

export default function Page() {
  return <ProfileView role="seller" />;
}
