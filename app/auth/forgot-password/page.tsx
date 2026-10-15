import type { Metadata } from "next";
import { ForgotPasswordView } from "@/components/auth/AuthViews";

export const metadata: Metadata = { title: "Forgot Password" };

export default function Page() {
  return <ForgotPasswordView />;
}
