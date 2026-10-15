import type { Metadata } from "next";
import { UsersView } from "@/components/admin/UsersView";

export const metadata: Metadata = { title: "User Management" };

export default function Page() {
  return <UsersView />;
}
