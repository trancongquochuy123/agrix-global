"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, CloudCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { useReserveBottom } from "@/components/demo/useReserveBottom";
import { DEMO_MODE } from "@/lib/demo/config";
import { submitAsset } from "@/lib/demo/store";
import { scaleToArea } from "@/lib/geo";
import { IMAGES } from "@/data/images";
import { pctFunded } from "@/data/assets";
import type { Asset } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { countryOfProvince, cropToCategory, defaultBoundary, initialData, LAST_STEP, STEPS, validateStep, type RegisterData } from "./formModel";
import { Step1AssetType } from "./steps/Step1AssetType";
import { Step2Ownership } from "./steps/Step2Ownership";
import { Step3Location } from "./steps/Step3Location";
import { Step4Operations } from "./steps/Step4Operations";
import { Step5Review } from "./steps/Step5Review";
import { StepFinancing } from "./steps/StepFinancing";

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

const DEMO_FILL: RegisterData = {
  ...initialData,
  category: "Perennial crops",
  cropType: "Coffee",
  assetName: "Vietnam Robusta Coffee",
  estimatedValue: "500000",
  totalArea: "40",
  ownerName: "Linh Nguyen",
  organization: "Highland Agri Co.",
  ownershipType: "Company",
  certificateNumber: "LURC-DL-2014-0412",
  issueDate: "2014-06-18",
  documents: [
    { name: "Land-Use-Right-Certificate.pdf", sizeKb: 4300 },
    { name: "Boundary-Survey-Map.pdf", sizeKb: 6900 },
    { name: "Offtake-Agreement-Summary.pdf", sizeKb: 2250 },
  ],
  vertices: scaleToArea(defaultBoundary([12.668, 108.05]), 40),
  address: "Buon Ma Thuot City, Dak Lak Province, Vietnam",
  province: "Dak Lak",
  latitude: "12.6680",
  longitude: "108.0500",
  landUse: "Perennial crops",
  satelliteImage: { name: "satellite-2026-09.jpg", sizeKb: 2100 },
  farmPhotos: [
    { name: "farm-1.jpg", sizeKb: 1800 },
    { name: "farm-2.jpg", sizeKb: 1650 },
    { name: "farm-3.jpg", sizeKb: 1720 },
  ],
  operationsCrop: "Coffee",
  annualProduction: "120",
  historicalYield: "3.1",
  irrigation: "Drip irrigation",
  certifications: ["4C"],
  harvestSeason: "Oct – Dec",
  operatingCosts: "180000",
  expectedRevenue: "560000",
  financingTarget: "350000",
  termMonths: "6",
  expectedReturn: "8",
  description:
    "Working capital financing for the upcoming Robusta harvest on a 40-hectare smallholder estate near Buon Ma Thuot. Proceeds fund picking labour, drying and storage ahead of a forward offtake sale to a regional exporter.",
};

/** Maps the form to the marketplace shape, for the live listing preview and for submission. */
function toListing(d: RegisterData) {
  const category = cropToCategory[d.cropType] ?? "coffee";
  const country = countryOfProvince[d.province] ?? "Vietnam";
  const target = Number(d.financingTarget) || 0;
  const lat = Number(d.latitude);
  const lng = Number(d.longitude);
  return {
    category,
    country,
    areaHa: Number(d.totalArea) || 0,
    coords: [Number.isFinite(lat) ? lat : 0, Number.isFinite(lng) ? lng : 0] as [number, number],
    target,
    value: Number(d.estimatedValue) || 0,
    term: Number(d.termMonths) || 0,
    ret: Number(d.expectedReturn) || 0,
    location: `${d.province}, ${country}`,
  };
}

function previewAsset(d: RegisterData): Asset {
  const l = toListing(d);
  return {
    id: "PREVIEW",
    slug: "preview",
    name: d.assetName || "Untitled asset",
    category: l.category,
    location: l.location,
    province: d.province,
    country: l.country,
    areaHa: l.areaHa,
    targetYield: l.ret,
    risk: l.category === "rice" ? "Low" : "Medium",
    fundedPct: pctFunded(0, l.target),
    raisedUsd: 0,
    targetUsd: l.target,
    assetValueUsd: l.value,
    termMonths: l.term,
    minInvestmentUsd: 1000,
    investors: 0,
    image: IMAGES[l.category],
    imageFallback: l.category,
    coords: l.coords,
    description: d.description,
    ownerId: "preview",
    ownerName: d.organization || d.ownerName,
    status: "pending_review",
    createdAt: "",
    uploads: [],
  };
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
  useReserveBottom(72);
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [data, setData] = useState<RegisterData>(initialData);
  const [showErrors, setShowErrors] = useState(false);
  const [compliance, setCompliance] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ ref: string; id: string; name: string } | null>(null);
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
    if (!hydrated.current || submitted || !touched) return;
    setSaving(true);
    const t = setTimeout(() => {
      if (saveDraft({ step, data })) setSavedAt(new Date());
      setSaving(false);
    }, 700);
    return () => clearTimeout(t);
  }, [data, step, submitted, touched]);

  // Warn before leaving with an unsubmitted registration.
  useEffect(() => {
    if (!touched || submitted) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [touched, submitted]);

  const update = useCallback((patch: Partial<RegisterData>) => {
    setTouched(true);
    setData((d) => ({ ...d, ...patch }));
  }, []);
  const errors = useMemo(() => (showErrors && step < LAST_STEP ? validateStep(step, data) : {}), [showErrors, step, data]);
  const preview = useMemo(() => previewAsset(data), [data]);

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const goTo = (i: number) => {
    setTouched(true);
    setShowErrors(false);
    setStep(i);
    scrollTop();
  };

  const next = () => {
    if (step < LAST_STEP) {
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
    if (data.documents.length === 0) {
      toast.error("Attach the land certificate to submit", { description: "Add it in step 2, Ownership." });
      goTo(1);
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      const l = toListing(data);
      const asset = submitAsset({
        name: data.assetName,
        category: l.category,
        location: l.location,
        province: data.province,
        country: l.country,
        areaHa: l.areaHa,
        coords: l.coords,
        assetValueUsd: l.value,
        targetUsd: l.target,
        termMonths: l.term,
        returnPct: l.ret,
        description: data.description.trim(),
        uploads: [...data.documents, ...(data.satelliteImage ? [data.satelliteImage] : []), ...data.farmPhotos],
      });
      setSubmitting(false);
      setSubmitted({ ref: asset.id, id: asset.id, name: asset.name });
      clearDraft();
      toast.success("Asset submitted for approval");
      scrollTop();
    }, 900);
  };

  const reset = () => {
    setData({ ...initialData });
    setStep(0);
    setMaxReached(0);
    setCompliance(false);
    setShowErrors(false);
    setSubmitted(null);
    setSavedAt(null);
    setTouched(false);
  };

  if (submitted) {
    return (
      <div ref={topRef}>
        <PageHeader title="Create New Asset" subtitle="Register your agricultural asset and submit it for approval." />
        <div className="card mx-auto max-w-xl px-6 py-12 text-center" role="status">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold">Submitted for approval</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            <strong className="text-ink">{submitted.name}</strong> is now <strong className="text-ink">Pending Review</strong>. It becomes visible to investors after an admin approves it (simulated review).
          </p>
          <p className="figure mt-4 inline-block rounded-lg bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700">Asset ID {submitted.id}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href={`/seller/assets/${submitted.id}`}>View asset status</Link>
            </Button>
            <Button variant="outline" onClick={reset}>
              Create another asset
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const stepProps = { data, update, errors };

  return (
    <div ref={topRef} className="scroll-mt-20">
      <PageHeader
        title="Create New Asset"
        subtitle="Register your agricultural asset and submit it for approval."
        actions={
          DEMO_MODE && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTouched(true);
                setData(DEMO_FILL);
                toast("Form filled with sample data");
              }}
            >
              Fill sample data
            </Button>
          )
        }
      />
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
        {step === 4 && <StepFinancing {...stepProps} />}
        {step === 5 && (
          <Step5Review
            data={data}
            preview={preview}
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
              {step === LAST_STEP ? (submitting ? "Submitting…" : "Submit for Approval") : "Save & Continue"}
              {step < LAST_STEP && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
