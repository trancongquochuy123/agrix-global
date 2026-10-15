import type { Metadata } from "next";
import { TransactionsView } from "@/components/shared/TransactionsView";

export const metadata: Metadata = { title: "Transactions" };

export default function Page() {
  return <TransactionsView scope="investor" />;
}
