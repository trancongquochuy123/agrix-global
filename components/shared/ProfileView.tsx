"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Repeat, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { fmtDate } from "@/lib/demo/format";
import { useDemo } from "@/lib/demo/hooks";
import { signOut, updateProfile } from "@/lib/demo/store";
import { ROLE_LABEL, type Role } from "@/lib/demo/types";

const businessFacts = [
  ["Registration no.", "VN-0412-883-DEMO"],
  ["Operating since", "2014"],
  ["Headquarters", "Buon Ma Thuot, Dak Lak, Vietnam"],
  ["Primary crops", "Robusta coffee, black pepper"],
] as const;

/** One profile screen for all roles. Sellers also see their (sample) business details. */
export function ProfileView({ role }: { role: Role }) {
  const router = useRouter();
  const { users, session } = useDemo();
  const user = users.find((u) => u.id === session?.userId);
  const [name, setName] = useState(user?.name ?? "");
  const [org, setOrg] = useState(user?.org ?? "");
  const [error, setError] = useState<string>();
  if (!user) return null;

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Enter your name.");
    updateProfile(user.id, { name: name.trim(), org: org.trim() || user.org });
    toast.success("Profile saved");
  };

  return (
    <div>
      <PageHeader title={role === "seller" ? "Business Profile" : "Profile"} subtitle="Your account details in this demo workspace." />
      <div className="grid gap-5 lg:grid-cols-3">
        <form onSubmit={save} noValidate className="card space-y-4 p-5 lg:col-span-2">
          <h2 className="text-base font-bold">{role === "seller" ? "Business details" : "Account details"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-name" className="mb-1.5 block text-sm font-semibold">
                Full name
              </label>
              <input
                id="pf-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(undefined);
                }}
                className="field"
                aria-invalid={!!error}
              />
              {error && (
                <p role="alert" className="mt-1 text-xs text-danger">
                  {error}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="pf-org" className="mb-1.5 block text-sm font-semibold">
                {role === "seller" ? "Business name" : "Organisation"}
              </label>
              <input id="pf-org" value={org} onChange={(e) => setOrg(e.target.value)} className="field" />
            </div>
            <div>
              <label htmlFor="pf-email" className="mb-1.5 block text-sm font-semibold">
                Email
              </label>
              <input id="pf-email" value={user.email} disabled className="field" />
            </div>
            <div>
              <label htmlFor="pf-role" className="mb-1.5 block text-sm font-semibold">
                Role
              </label>
              <input id="pf-role" value={ROLE_LABEL[role]} disabled className="field" />
            </div>
          </div>
          {role === "seller" && (
            <dl className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
              {businessFacts.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-ink-muted">{k}</dt>
                  <dd className="text-sm font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <Button type="submit">Save changes</Button>
        </form>

        <div className="space-y-5">
          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <ShieldCheck className="h-4 w-4 text-green-600" aria-hidden="true" /> Verification
            </h2>
            <p className="mt-2 text-sm font-semibold">{user.kyc}</p>
            <p className="mt-1 text-xs text-ink-muted">Onboarding checks are simulated in this prototype. No identity documents are collected.</p>
            <p className="mt-3 text-xs text-ink-muted">Member since {fmtDate(user.joined)}</p>
          </section>
          <section className="card space-y-2 p-5">
            <h2 className="text-base font-bold">Session</h2>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/auth/login">
                <Repeat className="h-4 w-4" aria-hidden="true" /> Switch demo account
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                signOut();
                router.push("/");
                toast("Signed out", { description: "Demo session ended." });
              }}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
