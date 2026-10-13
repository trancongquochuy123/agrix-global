"use client";

import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/data/user";
import { ROLE_LABEL, useRole, type RolePref } from "@/lib/useRole";
import { cn } from "@/lib/utils";

const KEY = "agrix:settings:v1";

interface Prefs {
  name: string;
  email: string;
  notifFunding: boolean;
  notifValuation: boolean;
  notifReports: boolean;
}

const defaults: Prefs = { name: currentUser.name, email: currentUser.email, notifFunding: true, notifValuation: true, notifReports: false };

function Card({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3.5 last:border-0">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-ink-muted">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-green-600" : "bg-line")}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
      </button>
    </div>
  );
}

export function SettingsView() {
  const [prefs, setPrefs] = useState<Prefs>(defaults);
  const [saved, setSaved] = useState<Prefs>(defaults);
  const { pref, role, setPref } = useRole();

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = { ...defaults, ...(JSON.parse(raw) as Partial<Prefs>) };
        setPrefs(parsed);
        setSaved(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const dirty = JSON.stringify(prefs) !== JSON.stringify(saved);
  const nameValid = prefs.name.trim().length >= 2;
  const emailValid = /^\S+@\S+\.\S+$/.test(prefs.email);

  const save = () => {
    if (!nameValid || !emailValid) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(prefs));
    } catch {
      toast.error("Couldn't save settings", { description: "Browser storage is unavailable." });
      return;
    }
    setSaved(prefs);
    toast.success("Settings saved");
  };

  const roleOptions: { id: RolePref; title: string; hint: string }[] = [
    { id: "auto", title: "Automatic", hint: `Follows the screen — currently ${ROLE_LABEL[role]}` },
    { id: "investor", title: "Investor", hint: "Discover assets, request access, track a portfolio" },
    { id: "owner", title: "Asset Owner", hint: "Register assets and manage verification" },
  ];

  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" subtitle="Manage your profile, role and notifications." />
      <div className="space-y-5">
        <Card title="Profile" description="Shown on investor requests and asset registrations.">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Full name</span>
              <input className="field h-11" value={prefs.name} onChange={(e) => setPrefs({ ...prefs, name: e.target.value })} aria-invalid={!nameValid} />
              {!nameValid && <span className="mt-1 block text-xs text-danger">Enter your name.</span>}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Email</span>
              <input type="email" className="field h-11" value={prefs.email} onChange={(e) => setPrefs({ ...prefs, email: e.target.value })} aria-invalid={!emailValid} />
              {!emailValid && <span className="mt-1 block text-xs text-danger">Enter a valid email address.</span>}
            </label>
          </div>
        </Card>

        <Card title="Role" description="Switch between investor and asset-owner views. Saved on this device.">
          <div role="radiogroup" aria-label="Role" className="grid gap-3 sm:grid-cols-3">
            {roleOptions.map((o) => (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={pref === o.id}
                onClick={() => {
                  setPref(o.id);
                  toast.success(`Role: ${o.title}`);
                }}
                className={cn("rounded-xl border p-4 text-left transition-colors", pref === o.id ? "border-green-600 bg-green-50" : "border-line bg-white hover:bg-green-50/50")}
              >
                <p className="text-sm font-bold">{o.title}</p>
                <p className="mt-1 text-xs text-ink-muted">{o.hint}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card title="Notifications">
          <Toggle checked={prefs.notifFunding} onChange={(v) => setPrefs({ ...prefs, notifFunding: v })} label="Funding milestones" hint="When a followed asset reaches a funding milestone." />
          <Toggle checked={prefs.notifValuation} onChange={(v) => setPrefs({ ...prefs, notifValuation: v })} label="AI valuation updates" hint="When a new valuation is published." />
          <Toggle checked={prefs.notifReports} onChange={(v) => setPrefs({ ...prefs, notifReports: v })} label="Quarterly reports" hint="When a new investor report is ready." />
        </Card>

        <div className="flex items-center justify-end gap-3">
          {dirty && <span className="text-sm text-ink-muted">Unsaved changes</span>}
          <Button variant="outline" disabled={!dirty} onClick={() => setPrefs(saved)}>
            Discard
          </Button>
          <Button disabled={!dirty || !nameValid || !emailValid} onClick={save}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
