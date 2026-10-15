import type { Metadata } from "next";
import { RegisterWizard } from "@/components/assets/RegisterWizard";

export const metadata: Metadata = { title: "Create New Asset" };

export default function Page() {
  return <RegisterWizard />;
}
