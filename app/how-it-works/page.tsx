import type { Metadata } from "next";
import Link from "next/link";
import { BrainCircuit, ClipboardCheck, FileUp, LineChart, Search, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "How It Works" };

const STEPS = [
  { icon: FileUp, role: "Seller", title: "Register an asset", text: "Describe the farm, add the financing terms and attach supporting documents. Uploads are simulated in this demo." },
  { icon: ClipboardCheck, role: "Admin", title: "Review and approve", text: "An AgriX reviewer checks the documents next to a demo AI risk summary, then approves, rejects or asks for changes." },
  { icon: Search, role: "Investor", title: "Discover opportunities", text: "Only approved listings appear in the marketplace, each with a data room, map and demo AI analysis." },
  { icon: Wallet, role: "Investor", title: "Invest", text: "Enter an amount, review the terms and confirm a simulated investment. No money moves." },
  { icon: LineChart, role: "Everyone", title: "Track progress", text: "Portfolio, funding progress and platform transactions update from the same shared demo data." },
  { icon: BrainCircuit, role: "AI", title: "Demo analysis", text: "Valuation, risk score, price trend and forecasts are predefined examples that show how AI insights could look." },
];

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-extrabold text-ink sm:text-5xl">How AgriX works</h1>
      <p className="mt-3 max-w-2xl text-ink-muted sm:text-lg">
        From a farm listing to a funded asset, in six steps. This is an interactive prototype: every figure, review and transaction is simulated.
      </p>
      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <s.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {i + 1} · {s.role}
              </span>
            </div>
            <h2 className="mt-3 text-lg font-bold">{s.title}</h2>
            <p className="mt-1 text-sm text-ink-muted">{s.text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/marketplace">Explore the marketplace</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/auth/login">Log in with a demo account</Link>
        </Button>
      </div>
    </div>
  );
}
