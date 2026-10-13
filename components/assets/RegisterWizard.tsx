"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, CloudCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { initialData, STEPS, validateStep, type RegisterData } from "./formModel";
import { Step1AssetType } from "./steps/Step1AssetType";
import { Step2Ownership } from "./steps/Step2Ownership";
import { Step3Location } from "./steps/Step3Location";
import { Step4Operations } from "./steps/Step4Operations";
import { Step5Review } from "./steps/Step5Review";

const DRAFT_KEY = "agrix:register-draft:v1";

interface Draft {
  step: number;
  data: RegisterData;
}

function loadDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

function saveDraft(draft: Draft) {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* storage unavailable */
  }
}

function Stepper({ step, maxReached, onGo }: { step: number; maxReached: number; onGo: (i: number) => void }) {
  return (
    <>
      <ol className="hidden items-center sm:flex" aria-label="Registration progress">
        {STEPS.map((label, i) => {
          const done = i < step;
          const current = i === step;
          const reachable = i <= maxReached && !current;
          return (
            <li key={label} className={cn("flex items-center", i < STEPS.length - 1 && "flex-1")}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onGo(i)}
                aria-current={current ? "step" : undefined}
                className="group flex items-center gap-2.5 disabled:cursor-default"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-150",
                    done || current ? "bg-green-600 text-white" : "bg-line text-ink-muted",
                  )}
                >
                  {done ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
                </span>
                <span className={cn("whitespace-nowrap text-sm", current ? "font-bold text-ink" : "font-medium text-ink-muted", reachable && "group-hover:text-ink")}>
                  {i + 1}. {label}
                </span>
              </button>
              {i < STEPS.length - 1 && <span aria-hidden="true" className={cn("mx-3 h-px flex-1 transition-colors", i < step ? "bg-green-600" : "bg-line")} />}
            </li>
          );
        })}
      </ol>
      <div className="sm:hidden">
        <p className="text-sm font-semibold">
          Step {step + 1} of {STEPS.length} · <span className="text-green-700">{STEPS[step]}</span>
        </p>
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={step + 1}
          aria-label="Registration progress"
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"
        >
          <div className="h-full rounded-full bg-green-600 transition-[width] duration-200" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>
    </>
  );
}

export function RegisterWizard() {
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [data, setData] = useState<RegisterData>(initialData);
  const [showErrors, setShowErrors] = useState(false);
  const [compliance, setCompliance] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);
  const hydrated = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Restore draft once on mount.
  useEffect(() => {
    const draft = loadDraft();
    if (draft?.data) {
      setData({ ...initialData, ...draft.data });
      setStep(Math.min(Math.max(draft.step ?? 0, 0), STEPS.length - 1));
      setMaxReached(Math.min(Math.max(draft.step ?? 0, 0), STEPS.length - 1));
      toast("Draft restored", { description: "We picked up where you left off." });
    }
    hydrated.current = true;
  }, []);

  // Debounced autosave — only once the user has actually changed something.
  useEffect(() => {
    if (!hydrated.current || submittedRef || !touched) return;
    setSaving(true);
    const t = setTimeout(() => {
      if (saveDraft({ step, data })) setSavedAt(new Date());
      setSaving(false);
    }, 700);
    return () => clearTimeout(t);
  }, [data, step, submittedRef, touched]);

  // Warn before leaving with an unsubmitted registration.
  useEffect(() => {
    if (!touched || submittedRef) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [touched, submittedRef]);

  const update = useCallback((patch: Partial<RegisterData>) => {
    setTouched(true);
    setData((d) => ({ ...d, ...patch }));
  }, []);
  const errors = useMemo(() => (showErrors && step < 4 ? validateStep(step, data) : {}), [showErrors, step, data]);

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const goTo = (i: number) => {
    setTouched(true);
    setShowErrors(false);
    setStep(i);
    scrollTop();
  };

  const next = () => {
    if (step < 4) {
      const found = validateStep(step, data);
      if (Object.keys(found).length) {
        setShowErrors(true);
        toast.error("Please fix the highlighted fields to continue");
        return;
      }
      setShowErrors(false);
      setTouched(true);
      setStep(step + 1);
      setMaxReached((m) => Math.max(m, step + 1));
      scrollTop();
      return;
    }
    if (!compliance) {
      setShowErrors(true);
      toast.error("Confirm the compliance statement to submit");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmittedRef(`REG-${Date.now().toString(36).toUpperCase().slice(-6)}`);
      clearDraft();
      toast.success("Asset submitted for verification");
      scrollTop();
    }, 900);
  };

  const reset = () => {
    setData({ ...initialData });
    setStep(0);
    setMaxReached(0);
    setCompliance(false);
    setShowErrors(false);
    setSubmittedRef(null);
    setSavedAt(null);
    setTouched(false);
  };

  if (submittedRef) {
    return (
      <div ref={topRef}>
        <PageHeader title="Register an Asset" subtitle="Create a verified digital profile for your agricultural asset." />
        <div className="card mx-auto max-w-xl px-6 py-12 text-center" role="status">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold">Submitted for verification</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            <strong className="text-ink">{data.assetName}</strong> is now in the AGRIX verification queue. Satellite and registry checks usually complete within 3–5 business days.
          </p>
          <p className="figure mt-4 inline-block rounded-lg bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700">Reference {submittedRef}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={reset}>Register another asset</Button>
            <Button variant="outline" asChild>
              <Link href="/marketplace">Browse marketplace</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const stepProps = { data, update, errors };

  return (
    <div ref={topRef} className="scroll-mt-20">
      <PageHeader title="Register an Asset" subtitle="Create a verified digital profile for your agricultural asset." />
      <div className="mb-5">
        <Stepper step={step} maxReached={maxReached} onGo={goTo} />
      </div>

      <section className="card p-4 sm:p-6" aria-labelledby="step-title">
        <h2 id="step-title" className="mb-5 text-xl font-bold">
          {step === 2 ? <span className="sr-only">Step 3: Location</span> : `${step + 1}. ${STEPS[step]}`}
        </h2>
        {step === 0 && <Step1AssetType {...stepProps} />}
        {step === 1 && <Step2Ownership {...stepProps} />}
        {step === 2 && <Step3Location {...stepProps} />}
        {step === 3 && <Step4Operations {...stepProps} />}
        {step === 4 && (
          <Step5Review
            data={data}
            goTo={goTo}
            compliance={compliance}
            onCompliance={setCompliance}
            complianceError={showErrors && !compliance ? "Please confirm this statement to continue." : undefined}
          />
        )}
      </section>

      <div className="h-16" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur md:left-[72px] xl:left-60">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6 xl:px-8">
          <p className="hidden items-center gap-2 text-xs text-ink-muted sm:flex" aria-live="polite">
            {touched && saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Saving draft…
              </>
            ) : (
              <>
                <CloudCheck className="h-4 w-4" aria-hidden="true" />
                {savedAt ? `Auto-saved at ${savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Draft saves automatically as you type"}
              </>
            )}
          </p>
          <div className="ml-auto flex w-full gap-3 sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none sm:px-8" disabled={step === 0 || submitting} onClick={() => goTo(step - 1)}>
              Back
            </Button>
            <Button className="flex-[2] sm:flex-none" disabled={submitting} onClick={next}>
              {step === 4 ? (submitting ? "Submitting…" : "Submit for Verification") : "Save & Continue"}
              {step < 4 && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
