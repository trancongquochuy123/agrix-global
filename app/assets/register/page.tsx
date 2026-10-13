import type { Metadata } from "next";
import { RegisterWizard } from "@/components/assets/RegisterWizard";

export const metadata: Metadata = { title: "Register an Asset" };

export default function RegisterAssetPage() {
  return <RegisterWizard />;
}
