import type { Metadata } from "next";
import { RegisterView } from "@/components/auth/AuthViews";

export const metadata: Metadata = { title: "Register" };

export default function Page() {
  return <RegisterView />;
}
