import type { Metadata } from "next";
import { RoleSelectView } from "@/components/auth/AuthViews";

export const metadata: Metadata = { title: "Role" };

export default function Page() {
  return <RoleSelectView />;
}
