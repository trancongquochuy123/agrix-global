"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, ChevronRight, Info, MapPin, ShieldCheck, Database, BarChart3, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPanel } from "@/components/maps/MapFrame";
import { AssetDetailMap } from "@/components/maps";
import { SafeImage } from "@/components/shared/SafeImage";
import { VerifiedBadge } from "@/components/shared/badges";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { FadeIn } from "@/components/shared/FadeIn";
import { getAssetDetail } from "@/data/assets";
import { AiInsightsTab } from "@/components/ai/AiInsights";
import { InvestDialog } from "@/components/investor/InvestDialog";
import { useReserveBottom } from "@/components/demo/useReserveBottom";
import { EmptyState } from "@/components/shared/states";
import { Skeleton } from "@/components/shared/SkeletonLoader";
import { useDemo, useHydrated } from "@/lib/demo/hooks";
import { remainingUsd } from "@/lib/demo/store";
import { STATUS_LABEL } from "@/lib/demo/selectors";
import { formatUsd } from "@/lib/formatters";
import { ActivityTab, DocumentsTab, OverviewTab, RiskTab, ValuationTab } from "./DetailTabs";
import { plantationLabel } from "./labels";

function formatTerm(months: number) {
  return months >= 60 && months % 12 === 0 ? `${months / 12} years` : `${months} months`;
}

export function AssetDetailView({ slug, basePath = "/marketplace" }: { slug: string; basePath?: string }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const { assets, session } = useDemo();
  const asset = assets.find((a) => a.slug === slug);
  const detail = useMemo(() => (asset ? getAssetDetail(asset) : undefined), [asset]);
  const [tab, setTab] = useState("overview");
  const [dialogOpen, setDialogOpen] = useState(false);
  useReserveBottom(76, true);

  if (!hydrated) {
    return (
      <div role="status" aria-label="Loading asset" className="space-y-5">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-20 w-full max-w-3xl" />
        <Skeleton className="h-[360px] w-full rounded-card" />
      </div>
    );
  }

  const isOwner = !!asset && session?.userId === asset.ownerId;
  const canView = !!asset && (asset.status === "published" || isOwner || session?.role === "admin");
  if (!asset || !detail || !canView) {
    return (
      <EmptyState
        title={asset ? "This asset is not open for investment" : "Asset not found"}
        description={asset ? "It is awaiting review or has not been published yet." : "The asset you are looking for does not exist in this demo dataset."}
        action={
          <Button asChild>
            <Link href={basePath}>Back to marketplace</Link>
          </Button>
        }
      />
    );
  }

  const pct = Math.round((detail.raisedUsd / detail.raiseTargetUsd) * 100);
  const riskTone = detail.riskScore < 33 ? "text-green-600" : detail.riskScore < 60 ? "text-warning" : "text-danger";

  const headlineStats = [
    { icon: <Database className="h-6 w-6" />, label: "Asset Value", value: formatUsd(detail.assetValueUsd) },
    { icon: <BarChart3 className="h-6 w-6" />, label: "Illustrative return", value: `${asset.targetYield}%` },
    { icon: <CalendarClock className="h-6 w-6" />, label: "Term", value: formatTerm(detail.termMonths) },
    { icon: <ShieldCheck className="h-6 w-6" />, label: "Risk Score", value: `${detail.riskScore}`, suffix: " / 100", tone: riskTone },
  ];

  const remaining = remainingUsd(asset);
  const published = asset.status === "published";
  const fullyFunded = remaining <= 0;
  const investorAllowed = session?.role === "investor";

  const onInvest = () => {
    if (!session) {
      router.push(`/auth/login?next=${encodeURIComponent(`/investor/marketplace/${asset.slug}`)}`);
      return;
    }
    setDialogOpen(true);
  };

  const cta = (where: "desktop" | "mobile") => {
    const size = "lg" as const;
    if (!published) {
      return (
        <div className="rounded-xl bg-[#FBEFD9] p-3 text-sm text-[#8A5A0B]">
          <p className="font-semibold">{STATUS_LABEL[asset.status]}</p>
          <p className="mt-0.5 text-xs">Not visible to investors until an admin approves this listing.</p>
        </div>
      );
    }
    if (fullyFunded) return <Button size={size} className="w-full" disabled>Fully funded</Button>;
    if (session && !investorAllowed) {
      return (
        <p className="flex gap-2 rounded-xl bg-green-50 p-3 text-xs text-ink-muted">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Signed in as {session.role}. Switch to an investor account to invest.
        </p>
      );
    }
    return (
      <>
        <Button size={size} className="w-full" onClick={onInvest}>
          Invest Now <ArrowRight className="h-4 w-4" />
        </Button>
        {where === "desktop" && !session && <p className="mt-3 text-center text-xs text-ink-muted">You will be asked to log in with a demo account.</p>}
      </>
    );
  };

  const investPanel = (
    <div className="card flex h-full flex-col p-5">
      <p className="figure text-3xl font-extrabold leading-none">
        {formatUsd(detail.raisedUsd)} <span className="text-lg font-bold">raised of {formatUsd(detail.raiseTargetUsd)}</span>
      </p>
      <div className="mt-4 flex items-center gap-3">
        <ProgressBar value={pct} label="Funding progress" className="h-2.5 flex-1" />
        <span className="figure text-sm font-bold text-green-600">{pct}%</span>
      </div>
      <div className="mt-3 flex justify-between text-sm text-ink-muted">
        <span>{detail.investors} investors</span>
        <span>{formatUsd(remaining)} remaining</span>
      </div>
      <hr className="my-5 border-line" />
      <p className="text-sm text-ink-muted">Minimum investment</p>
      <p className="figure mt-1 text-3xl font-extrabold">{formatUsd(detail.minInvestmentUsd, { compact: false })}</p>
      <div className="hidden md:block">{cta("desktop")}</div>
      <p className="mt-auto pt-5 text-[11px] leading-snug text-ink-muted/80">
        Simulated listing. Returns are illustrative, not guaranteed, and this is not an offer to invest.
      </p>
    </div>
  );

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
        <Link href={basePath} className="hover:text-ink hover:underline">Marketplace</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <Link href={`${basePath}?category=${asset.category}`} className="hover:text-ink hover:underline">{detail.breadcrumbCategory}</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span aria-current="page" className="font-medium text-ink">{asset.name}</span>
      </nav>

      <FadeIn>
        <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <SafeImage src={asset.image} alt={`${asset.name} cover`} category={asset.category} className="h-[72px] w-[100px] shrink-0 rounded-xl sm:h-[84px] sm:w-[110px]" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[26px] font-extrabold leading-tight sm:text-4xl">{asset.name}</h1>
                {published ? <VerifiedBadge label="AGRIX Reviewed" /> : <span className="rounded-full bg-[#FBEFD9] px-3 py-1.5 text-xs font-semibold text-[#8A5A0B]">{STATUS_LABEL[asset.status]}</span>}
              </div>
              <p className="mt-1 text-sm font-medium text-green-700">{detail.profile}</p>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" aria-hidden="true" /> {detail.town}
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" aria-hidden="true" /> {detail.assetCode}
                </span>
              </p>
            </div>
          </div>
          <dl className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 xl:flex xl:gap-0 xl:divide-x xl:divide-line">
            {headlineStats.map((s) => (
              <div key={s.label} className="flex items-center gap-3 whitespace-nowrap xl:px-5 xl:first:pl-0 xl:last:pr-0">
                <span className="text-green-600" aria-hidden="true">{s.icon}</span>
                <div className="leading-tight">
                  <dt className="text-xs text-ink-muted">{s.label}</dt>
                  <dd className={`figure text-xl font-extrabold sm:text-2xl ${s.tone ?? ""}`}>
                    {s.value}
                    {s.suffix && <span className="text-sm font-semibold text-ink-muted">{s.suffix}</span>}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </header>
      </FadeIn>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <MapPanel className="h-[320px] sm:h-[420px]">
          <AssetDetailMap detail={detail} plantationLabel={plantationLabel[asset.category]} locationLabel={asset.province} />
        </MapPanel>
        {investPanel}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList aria-label="Asset detail sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai">AI Insights</TabsTrigger>
          <TabsTrigger value="valuation">AI Valuation</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab detail={detail} asset={asset} onViewAllDocs={() => setTab("documents")} />
        </TabsContent>
        <TabsContent value="ai">
          <AiInsightsTab asset={asset} detail={detail} />
        </TabsContent>
        <TabsContent value="valuation">
          <ValuationTab detail={detail} />
        </TabsContent>
        <TabsContent value="risk">
          <RiskTab detail={detail} />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsTab documents={detail.documents} />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityTab detail={detail} />
        </TabsContent>
      </Tabs>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 p-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <div className="leading-tight">
            <p className="figure text-base font-extrabold">{pct}% funded</p>
            <p className="text-xs text-ink-muted">Min. {formatUsd(detail.minInvestmentUsd, { compact: false })}</p>
          </div>
          <div className="ml-auto flex-1">{cta("mobile")}</div>
        </div>
      </div>

      <InvestDialog asset={asset} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
