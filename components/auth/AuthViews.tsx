"use client";

import { Suspense, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Building2, CheckCircle2, ShieldCheck, TrendingUp, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDemo, useHydrated } from "@/lib/demo/hooks";
import { homeOf } from "@/lib/demo/routes";
import { registerUser, signInAs, signInWithEmail } from "@/lib/demo/store";
import { DEMO_ACCOUNTS } from "@/lib/demo/seed";
import { ROLE_LABEL, type Role } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

const roleMeta: Record<Role, { icon: LucideIcon; blurb: string }> = {
  investor: { icon: TrendingUp, blurb: "Browse assets, invest and track your portfolio." },
  seller: { icon: Building2, blurb: "Register assets, submit them for review and follow funding." },
  admin: { icon: ShieldCheck, blurb: "Review submissions, monitor risk and oversee transactions." },
};

/** Only follow same-site relative redirects. */
const safeNext = (next: string | null) => (next && next.startsWith("/") && !next.startsWith("//") ? next : null);

function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md py-6 sm:py-10">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        <p className="mt-1.5 text-sm text-ink-muted">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      {footer && <p className="mt-5 text-center text-sm text-ink-muted">{footer}</p>}
    </div>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

const emailOk = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim());

function DemoAccountList({ onPick }: { onPick: (role: Role) => void }) {
  return (
    <div>
      <div className="relative my-6 text-center">
        <span className="absolute inset-x-0 top-1/2 h-px bg-line" aria-hidden="true" />
        <span className="relative bg-white px-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Or enter a demo account</span>
      </div>
      <ul className="space-y-2">
        {(Object.keys(DEMO_ACCOUNTS) as Role[]).map((r) => {
          const Icon = roleMeta[r].icon;
          return (
            <li key={r}>
              <button
                type="button"
                onClick={() => onPick(r)}
                className="flex w-full items-center gap-3 rounded-xl border border-line bg-white px-3.5 py-3 text-left transition-colors hover:border-green-600/50 hover:bg-green-50/50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{ROLE_LABEL[r]}</span>
                  <span className="block truncate text-xs text-ink-muted">{DEMO_ACCOUNTS[r].email}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-ink-muted" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-ink-muted">Demo sign-in only. Passwords are not checked and no real account is created.</p>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const hydrated = useHydrated();
  const { session } = useDemo();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();

  const go = (role: Role) => router.push(next ?? homeOf(role));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!emailOk(email)) return setError("Enter a valid email address.");
    if (!password) return setError("Enter a password (any value works in the demo).");
    const res = signInWithEmail(email);
    if (!res.ok) return setError(res.error);
    toast.success("Signed in (demo)");
    go(res.role);
  };

  return (
    <AuthCard
      title="Log in"
      subtitle="Welcome back to AGRIX."
      footer={
        <>
          New to AGRIX?{" "}
          <Link href={`/auth/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-green-700 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {hydrated && session && (
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            Signed in as <strong>{session.name}</strong> ({ROLE_LABEL[session.role]})
          </span>
          <Link href={homeOf(session.role)} className="font-semibold text-green-700 hover:underline">
            Open
          </Link>
        </div>
      )}
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field id="email" label="Email">
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(undefined);
            }}
            placeholder="you@company.com"
            aria-invalid={!!error}
            className={cn("field", error && "field-error")}
          />
        </Field>
        <Field id="password" label="Password" error={error}>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(undefined);
            }}
            placeholder="••••••••"
            className="field"
          />
        </Field>
        <div className="flex justify-end">
          <Link href="/auth/forgot-password" className="text-sm font-semibold text-green-700 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full">
          Log in
        </Button>
      </form>
      <DemoAccountList
        onPick={(r) => {
          signInAs(r);
          toast.success(`Signed in as ${ROLE_LABEL[r]} (demo)`);
          go(r);
        }}
      />
    </AuthCard>
  );
}

export function LoginView() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [role, setRole] = useState<"investor" | "seller">(next?.startsWith("/seller") ? "seller" : "investor");
  const [form, setForm] = useState({ name: "", email: "", org: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<"name" | "email" | "password" | "form", string>>>({});

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors({});
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found: typeof errors = {};
    if (form.name.trim().length < 2) found.name = "Enter your full name.";
    if (!emailOk(form.email)) found.email = "Enter a valid email address.";
    if (form.password.length < 6) found.password = "Use at least 6 characters (not stored or checked).";
    if (Object.keys(found).length) return setErrors(found);
    const res = registerUser({ name: form.name, email: form.email, role, org: form.org });
    if (!res.ok) return setErrors({ email: res.error });
    toast.success("Demo account created", { description: "Simulated sign-up. No identity check is performed." });
    router.push(next && next.startsWith(`/${role}`) ? next : homeOf(role));
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Choose how you will use AGRIX."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-green-700 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold">I want to</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["investor", "seller"] as const).map((r) => {
              const Icon = roleMeta[r].icon;
              return (
                <label
                  key={r}
                  className={cn(
                    "flex cursor-pointer flex-col gap-1 rounded-xl border p-3 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-green-600",
                    role === r ? "border-green-600 bg-green-50/50" : "border-line hover:bg-green-50/40",
                  )}
                >
                  <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="sr-only" />
                  <span className="flex items-center gap-2 font-semibold">
                    <Icon className="h-4 w-4 text-green-600" aria-hidden="true" />
                    {r === "investor" ? "Invest" : "Sell an asset"}
                  </span>
                  <span className="text-xs text-ink-muted">{roleMeta[r].blurb}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <Field id="name" label="Full name" error={errors.name}>
          <input id="name" autoComplete="name" value={form.name} onChange={set("name")} className={cn("field", errors.name && "field-error")} />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <input id="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} className={cn("field", errors.email && "field-error")} />
        </Field>
        <Field id="org" label={role === "seller" ? "Business name" : "Organisation (optional)"}>
          <input id="org" autoComplete="organization" value={form.org} onChange={set("org")} className="field" />
        </Field>
        <Field id="password" label="Password" error={errors.password}>
          <input id="password" type="password" autoComplete="new-password" value={form.password} onChange={set("password")} className={cn("field", errors.password && "field-error")} />
        </Field>
        <Button type="submit" size="lg" className="w-full">
          Create account
        </Button>
        <p className="text-xs text-ink-muted">Demo sign-up: no verification is performed and nothing leaves your browser.</p>
      </form>
    </AuthCard>
  );
}

export function RegisterView() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

export function ForgotPasswordView() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!emailOk(email)) return setError("Enter a valid email address.");
    setSent(true);
  };

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we will send a reset link."
      footer={
        <Link href="/auth/login" className="font-semibold text-green-700 hover:underline">
          Back to log in
        </Link>
      }
    >
      {sent ? (
        <div role="status" className="rounded-xl bg-green-50 p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold text-green-700">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Reset link sent (simulated)
          </p>
          <p className="mt-1.5 text-ink-muted">
            If <strong className="text-ink">{email}</strong> were a real account, an email would be on its way. No message is sent in this prototype, so use a demo account to continue.
          </p>
          <Button asChild className="mt-4">
            <Link href="/auth/login">Go to log in</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <Field id="email" label="Email" error={error}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(undefined);
              }}
              className={cn("field", error && "field-error")}
            />
          </Field>
          <Button type="submit" size="lg" className="w-full">
            Send reset link
          </Button>
        </form>
      )}
    </AuthCard>
  );
}

export function RoleSelectView() {
  const router = useRouter();
  return (
    <div className="mx-auto w-full max-w-3xl py-6 sm:py-10">
      <h1 className="text-center text-2xl font-extrabold sm:text-3xl">Choose a workspace</h1>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-ink-muted">Enter AGRIX with one of the demo accounts. Each role has its own dashboard and navigation.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {(Object.keys(DEMO_ACCOUNTS) as Role[]).map((r) => {
          const Icon = roleMeta[r].icon;
          return (
            <li key={r}>
              <button
                type="button"
                onClick={() => {
                  signInAs(r);
                  router.push(homeOf(r));
                }}
                className="card flex h-full w-full flex-col items-start gap-3 p-5 text-left transition-colors hover:border-green-600/50 hover:bg-green-50/40"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-lg font-bold">{ROLE_LABEL[r]}</span>
                <span className="text-sm text-ink-muted">{roleMeta[r].blurb}</span>
                <span className="mt-auto text-xs text-ink-muted">{DEMO_ACCOUNTS[r].email}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-center text-xs text-ink-muted">Demo sign-in only. No password is checked.</p>
    </div>
  );
}
