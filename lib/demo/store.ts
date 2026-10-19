import type { Asset, AssetCategory, ReviewEvent, UploadedDocMeta } from "@/types/asset";
import { MAX_AREA_HA, MAX_RETURN_PCT, MAX_TERM_MONTHS, MIN_RETURN_PCT, MIN_TERM_MONTHS } from "@/lib/numeric";
import { pctFunded } from "@/data/assets";
import { IMAGES } from "@/data/images";
import { BASELINE, buildState, sessionFor } from "./seed";
import { ledgerTotalFor } from "./selectors";
import type { ActivityEntry, DemoState, Notice, Role, ScenarioId, Session, Transaction } from "./types";

const KEY = "agrix:demo:v1";
const LEGACY_COVER = /^\/images\/assets\/[a-z]+\.svg$/;

let state: DemoState = BASELINE;
let loaded = false;
const listeners = new Set<() => void>();

function isValid(x: unknown): x is DemoState {
  const s = x as DemoState;
  return !!s && s.v === 1 && Array.isArray(s.assets) && Array.isArray(s.transactions) && Array.isArray(s.users) && Array.isArray(s.notices) && Array.isArray(s.activity);
}

/**
 * Brings older persisted data in line with the current rules: a session of a suspended user is dropped, and the
 * seeded opening-balance ledger entries added after v1 shipped are restored when (and only when) they close an
 * exact gap between an asset's raised amount and its ledger.
 */
export function normalizeState(s: DemoState): DemoState {
  let next = s;
  if (isSuspended(s, s.session?.userId)) next = { ...next, session: null };
  // Covers used to be bundled illustrations (/images/assets/*.svg); persisted data is moved to the real photos.
  if (next.assets.some((a) => LEGACY_COVER.test(a.image))) {
    next = { ...next, assets: next.assets.map((a) => (LEGACY_COVER.test(a.image) ? { ...a, image: IMAGES[a.category] } : a)) };
  }
  const missing = BASELINE.transactions.filter(
    (t) =>
      t.kind === "opening" &&
      !next.transactions.some((x) => x.id === t.id) &&
      next.assets.some((a) => a.id === t.assetId && a.status === "published" && a.raisedUsd - ledgerTotalFor(next, a.id) === t.amountUsd),
  );
  if (missing.length) next = { ...next, transactions: [...next.transactions, ...missing] };
  return next;
}

function readStorage(): DemoState | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValid(parsed) ? normalizeState(parsed) : null;
  } catch {
    return null;
  }
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const stored = readStorage();
  if (stored) {
    state = stored;
    // Persist repairs (e.g. a dropped suspended session) so other tabs and later loads see the corrected state.
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw && raw !== JSON.stringify(stored) && JSON.stringify(JSON.parse(raw)) !== JSON.stringify(stored)) window.localStorage.setItem(KEY, JSON.stringify(stored));
    } catch {
      /* ignore */
    }
  }
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    const next = readStorage();
    state = next ?? BASELINE;
    emit();
  });
}

function emit() {
  listeners.forEach((l) => l());
}

function commit(next: DemoState) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: keep working in memory */
  }
  emit();
}

export const demoStore = {
  subscribe(listener: () => void) {
    load();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): DemoState {
    load();
    return state;
  },
  getServerSnapshot(): DemoState {
    return BASELINE;
  },
};

const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const nowIso = () => new Date().toISOString();

const pushActivity = (s: DemoState, actor: string, action: string, target: string): ActivityEntry[] => [
  { id: uid("act"), at: nowIso(), actor, action, target },
  ...s.activity,
];
const notice = (to: Role, title: string, body: string, href?: string): Notice => ({ id: uid("n"), to, title, body, createdAt: nowIso(), read: false, href });

/* --------------------------------- Session --------------------------------- */

export type AuthResult = { ok: true; role: Role } | { ok: false; error: string };

export const SUSPENDED_MESSAGE = "This demo account is suspended by an admin.";

/** True when the user exists and an admin has suspended it. */
export const isSuspended = (s: DemoState, userId: string | undefined) => !!userId && s.users.some((u) => u.id === userId && u.status === "Suspended");

/** Switches to the canonical demo account of a role; refuses when that account is suspended. */
export function signInAs(role: Role): AuthResult {
  const session = sessionFor(role);
  if (isSuspended(state, session.userId)) return { ok: false, error: SUSPENDED_MESSAGE };
  commit({ ...state, session });
  return { ok: true, role };
}

/** Demo sign-in: passwords are never checked; the email must belong to a demo or registered account. */
export function signInWithEmail(email: string): AuthResult {
  const e = email.trim().toLowerCase();
  const user = state.users.find((u) => u.email.toLowerCase() === e);
  if (!user) return { ok: false, error: "No demo account uses this email. Pick one of the demo accounts below." };
  if (user.status === "Suspended") return { ok: false, error: SUSPENDED_MESSAGE };
  const session: Session = { userId: user.id, role: user.role, name: user.name, email: user.email };
  commit({ ...state, session });
  return { ok: true, role: user.role };
}

export function registerUser(input: { name: string; email: string; role: Exclude<Role, "admin">; org: string }): AuthResult {
  const email = input.email.trim().toLowerCase();
  if (state.users.some((u) => u.email.toLowerCase() === email)) return { ok: false, error: "That email is already registered in this demo." };
  const id = uid("u");
  const user = { id, name: input.name.trim(), email, role: input.role, org: input.org.trim() || "Individual", status: "Active" as const, kyc: "Simulated: pending" as const, joined: nowIso() };
  commit({
    ...state,
    users: [...state.users, user],
    session: { userId: id, role: input.role, name: user.name, email },
    activity: pushActivity(state, "System", "Registered user (simulated)", user.name),
    notices: [notice("admin", "New user registered", `${user.name} signed up as ${input.role}.`, "/admin/users"), ...state.notices],
  });
  return { ok: true, role: input.role };
}

export function signOut() {
  commit({ ...state, session: null });
}

export function updateProfile(userId: string, patch: { name?: string; org?: string }) {
  const users = state.users.map((u) => (u.id === userId ? { ...u, ...patch } : u));
  const session = state.session && state.session.userId === userId ? { ...state.session, name: patch.name ?? state.session.name } : state.session;
  commit({ ...state, users, session });
}

/* --------------------------------- Assets ---------------------------------- */

const COUNTRY_CODE: Record<string, string> = { Vietnam: "VN", Indonesia: "ID", Brazil: "BR", Ghana: "GH" };
const CATEGORY_CODE: Record<AssetCategory, string> = { coffee: "CF", rice: "RC", palmoil: "PO", soybean: "SB", cocoa: "CC", pepper: "BP" };

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "asset";

export interface SubmitAssetInput {
  name: string;
  category: AssetCategory;
  location: string;
  province: string;
  country: string;
  areaHa: number;
  coords: [number, number];
  assetValueUsd: number;
  targetUsd: number;
  termMonths: number;
  returnPct: number;
  description: string;
  uploads: UploadedDocMeta[];
}

export function submitAsset(input: SubmitAssetInput): Asset {
  const owner = state.session;
  const ownerId = owner?.userId ?? "u-seller";
  const ownerUser = state.users.find((u) => u.id === ownerId);
  const ownerName = ownerUser?.org ?? owner?.name ?? "Seller";

  const prefix = `${COUNTRY_CODE[input.country] ?? input.country.slice(0, 2).toUpperCase()}-${CATEGORY_CODE[input.category]}`;
  let n = 1;
  while (state.assets.some((a) => a.id === `${prefix}-${String(n).padStart(3, "0")}`)) n++;
  const id = `${prefix}-${String(n).padStart(3, "0")}`;

  const baseSlug = slugify(input.name);
  let slug = baseSlug;
  let k = 2;
  while (state.assets.some((a) => a.slug === slug)) slug = `${baseSlug}-${k++}`;

  const at = nowIso();
  const asset: Asset = {
    id,
    slug,
    name: input.name.trim(),
    category: input.category,
    location: input.location,
    province: input.province,
    country: input.country,
    areaHa: input.areaHa,
    targetYield: input.returnPct,
    risk: input.category === "rice" ? "Low" : "Medium",
    raisedUsd: 0,
    targetUsd: input.targetUsd,
    fundedPct: 0,
    assetValueUsd: input.assetValueUsd,
    termMonths: input.termMonths,
    minInvestmentUsd: 1_000,
    investors: 0,
    image: IMAGES[input.category],
    imageFallback: input.category,
    coords: input.coords,
    description: input.description,
    ownerId,
    ownerName,
    status: "pending_review",
    createdAt: at,
    submittedAt: at,
    uploads: input.uploads,
  };

  commit({
    ...state,
    assets: [asset, ...state.assets],
    notices: [
      notice("admin", "New asset awaiting review", `${asset.name} (${asset.id}) was submitted by ${ownerName}.`, `/admin/approvals/${asset.id}`),
      notice("seller", `${asset.id} submitted for review`, "Status: Pending Review. You will be notified after the admin decision.", `/seller/assets/${asset.id}`),
      ...state.notices,
    ],
    activity: pushActivity(state, owner?.name ?? "Seller", "Submitted asset for approval", asset.name),
  });
  return asset;
}

export type ReviewDecision = "approve" | "reject" | "changes";

export function reviewAsset(assetId: string, decision: ReviewDecision, note: string): { ok: boolean; error?: string } {
  const asset = state.assets.find((a) => a.id === assetId);
  if (!asset) return { ok: false, error: "Asset not found." };
  if (asset.status !== "pending_review") return { ok: false, error: "This asset is not waiting for review." };
  const status = decision === "approve" ? "published" : decision === "reject" ? "rejected" : "changes_requested";
  const defaultNote =
    decision === "approve"
      ? "Documents consistent with the registry extract. Approved for listing (simulated review)."
      : decision === "reject"
        ? "Rejected in the simulated review."
        : "Please update the requested information and resubmit.";
  const reviewNote = note.trim() || defaultNote;
  const verb = decision === "approve" ? "Approved listing" : decision === "reject" ? "Rejected listing" : "Requested changes on listing";
  const sellerTitle =
    decision === "approve" ? `${asset.name} is published` : decision === "reject" ? `${asset.name} was rejected` : `Changes requested for ${asset.name}`;
  const next: Notice[] = [
    notice("seller", sellerTitle, reviewNote, `/seller/assets/${asset.id}`),
    ...(decision === "approve" ? [notice("investor", `New opportunity: ${asset.name}`, `${asset.termMonths}-month financing, illustrative ${asset.targetYield}% annualised return.`, `/investor/marketplace/${asset.slug}`)] : []),
  ];
  const event: ReviewEvent = {
    id: uid("rev"),
    at: nowIso(),
    actor: state.session?.name ?? "Admin Operator",
    kind: decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "changes_requested",
    note: reviewNote,
  };
  commit({
    ...state,
    assets: state.assets.map((a) => (a.id === assetId ? { ...a, status, reviewedAt: event.at, reviewNote, reviewHistory: [...(a.reviewHistory ?? []), event] } : a)),
    notices: [...next, ...state.notices],
    activity: pushActivity(state, state.session?.name ?? "Admin Operator", verb, asset.name),
  });
  return { ok: true };
}

/** Seller-editable fields of a listing that an admin sent back for changes. */
export interface AssetEditPatch {
  name: string;
  description: string;
  assetValueUsd: number;
  targetUsd: number;
  termMonths: number;
  returnPct: number;
  areaHa: number;
  uploads: UploadedDocMeta[];
}

export type AssetEditResult = { ok: true; changedFields: string[] } | { ok: false; error: string; field?: keyof AssetEditPatch };

const isWhole = (n: unknown): n is number => typeof n === "number" && Number.isSafeInteger(n);

/** Server-side style validation of an edit; the form validates the same rules before calling. */
export function validateAssetEdit(p: AssetEditPatch): { error: string; field: keyof AssetEditPatch } | null {
  if (typeof p.name !== "string" || p.name.trim().length < 3) return { field: "name", error: "Enter an asset name (at least 3 characters)." };
  if (typeof p.description !== "string" || p.description.trim().length < 20) return { field: "description", error: "Describe the financing purpose (at least 20 characters)." };
  if (!isWhole(p.assetValueUsd) || p.assetValueUsd <= 0) return { field: "assetValueUsd", error: "Enter an asset value in whole dollars, greater than 0." };
  if (!isWhole(p.targetUsd) || p.targetUsd <= 0) return { field: "targetUsd", error: "Enter a financing target in whole dollars, greater than 0." };
  if (p.targetUsd > p.assetValueUsd) return { field: "targetUsd", error: "The target cannot exceed the asset value." };
  if (!isWhole(p.termMonths) || p.termMonths < MIN_TERM_MONTHS || p.termMonths > MAX_TERM_MONTHS) return { field: "termMonths", error: `Enter a whole number of months between ${MIN_TERM_MONTHS} and ${MAX_TERM_MONTHS}.` };
  if (!Number.isFinite(p.returnPct) || p.returnPct < MIN_RETURN_PCT || p.returnPct > MAX_RETURN_PCT) return { field: "returnPct", error: `Enter an illustrative return between ${MIN_RETURN_PCT}% and ${MAX_RETURN_PCT}%.` };
  if (!Number.isFinite(p.areaHa) || p.areaHa <= 0 || p.areaHa > MAX_AREA_HA) return { field: "areaHa", error: `Enter an area between 0 and ${MAX_AREA_HA.toLocaleString("en-US")} ha.` };
  if (!Array.isArray(p.uploads) || p.uploads.length === 0) return { field: "uploads", error: "Attach at least one supporting document (the land certificate)." };
  return null;
}

const sameDocs = (a: UploadedDocMeta[], b: UploadedDocMeta[]) => a.length === b.length && a.every((d, i) => d.name === b[i].name && d.sizeKb === b[i].sizeKb);

function changedFieldsOf(a: Asset, p: AssetEditPatch): string[] {
  const out: string[] = [];
  if (a.name !== p.name.trim()) out.push("Asset name");
  if (a.description !== p.description.trim()) out.push("Purpose of financing");
  if (a.assetValueUsd !== p.assetValueUsd) out.push("Asset value");
  if (a.targetUsd !== p.targetUsd) out.push("Financing target");
  if (a.termMonths !== p.termMonths) out.push("Financing term");
  if (a.targetYield !== p.returnPct) out.push("Illustrative return");
  if (a.areaHa !== p.areaHa) out.push("Area");
  if (!sameDocs(a.uploads, p.uploads)) out.push("Documents");
  return out;
}

/** Only the owning seller may edit, and only while the asset is in `changes_requested`. */
function editableAsset(assetId: string): { asset: Asset } | { error: string } {
  const asset = state.assets.find((a) => a.id === assetId);
  if (!asset) return { error: "Asset not found." };
  const session = state.session;
  if (!session || session.role !== "seller" || session.userId !== asset.ownerId) return { error: "Only the seller who owns this asset can edit it." };
  if (isSuspended(state, session.userId)) return { error: SUSPENDED_MESSAGE };
  if (asset.status !== "changes_requested") return { error: "This asset can only be edited while changes are requested." };
  return { asset };
}

function applyEdit(asset: Asset, p: AssetEditPatch): Asset {
  return {
    ...asset,
    name: p.name.trim(),
    description: p.description.trim(),
    assetValueUsd: p.assetValueUsd,
    targetUsd: p.targetUsd,
    termMonths: p.termMonths,
    targetYield: p.returnPct,
    areaHa: p.areaHa,
    uploads: p.uploads.map((u) => ({ name: u.name, sizeKb: u.sizeKb })),
    fundedPct: pctFunded(asset.raisedUsd, p.targetUsd),
  };
}

/** Saves corrections without changing the status, so the seller can come back before resubmitting. */
export function saveAssetEdits(assetId: string, patch: AssetEditPatch): AssetEditResult {
  const found = editableAsset(assetId);
  if ("error" in found) return { ok: false, error: found.error };
  const invalid = validateAssetEdit(patch);
  if (invalid) return { ok: false, ...invalid };
  const { asset } = found;
  const changedFields = changedFieldsOf(asset, patch);
  if (changedFields.length === 0) return { ok: true, changedFields };
  const actor = state.session?.name ?? "Seller";
  const event: ReviewEvent = { id: uid("rev"), at: nowIso(), actor, kind: "edited", changedFields };
  commit({
    ...state,
    assets: state.assets.map((a) => (a.id === assetId ? { ...applyEdit(a, patch), reviewHistory: [...(a.reviewHistory ?? []), event] } : a)),
    activity: pushActivity(state, actor, `Updated asset details (${changedFields.join(", ")})`, patch.name.trim()),
  });
  return { ok: true, changedFields };
}

/**
 * Sends a `changes_requested` asset back to the admin queue. With a patch, the corrections are validated and saved in
 * the same commit that changes the status. The asset is never published by resubmitting.
 */
export function resubmitAsset(assetId: string, patch?: AssetEditPatch): AssetEditResult {
  const found = editableAsset(assetId);
  if ("error" in found) return { ok: false, error: found.error === "This asset can only be edited while changes are requested." ? "Nothing to resubmit." : found.error };
  const { asset } = found;
  if (patch) {
    const invalid = validateAssetEdit(patch);
    if (invalid) return { ok: false, ...invalid };
  }
  const base = patch ? applyEdit(asset, patch) : asset;
  const here = patch ? changedFieldsOf(asset, patch) : [];
  // Everything edited since the last change request, including earlier "Save changes" steps.
  const history = asset.reviewHistory ?? [];
  const lastRequest = history.map((e) => e.kind).lastIndexOf("changes_requested");
  const earlier = history.slice(lastRequest + 1).flatMap((e) => (e.kind === "edited" ? (e.changedFields ?? []) : []));
  const changedFields = Array.from(new Set([...earlier, ...here]));
  const actor = state.session?.name ?? "Seller";
  const at = nowIso();
  const event: ReviewEvent = {
    id: uid("rev"),
    at,
    actor,
    kind: "resubmitted",
    note: changedFields.length ? undefined : "Resubmitted without changes.",
    changedFields,
  };
  const summary = changedFields.length ? ` Updated: ${changedFields.join(", ")}.` : " No fields were changed.";
  commit({
    ...state,
    assets: state.assets.map((a) =>
      a.id === assetId ? { ...base, status: "pending_review", submittedAt: at, reviewNote: undefined, reviewHistory: [...history, event] } : a,
    ),
    notices: [notice("admin", "Asset resubmitted", `${base.name} (${asset.id}) was updated and resubmitted.${summary}`, `/admin/approvals/${asset.id}`), ...state.notices],
    activity: pushActivity(state, actor, "Resubmitted asset for approval", base.name),
  });
  return { ok: true, changedFields };
}

/* -------------------------------- Investing -------------------------------- */

export type InvestResult = { ok: true; tx: Transaction } | { ok: false; error: string };

export const remainingUsd = (a: Pick<Asset, "targetUsd" | "raisedUsd">) => Math.max(0, a.targetUsd - a.raisedUsd);

/** Simulated investment. Validates status, minimum and remaining target; `requestId` makes repeated calls idempotent. */
export function invest(input: { assetId: string; amountUsd: number; requestId: string }): InvestResult {
  const existing = state.transactions.find((t) => t.requestId === input.requestId);
  if (existing) return { ok: true, tx: existing };

  const session = state.session;
  if (!session || session.role !== "investor") return { ok: false, error: "Sign in as an investor to invest." };
  if (isSuspended(state, session.userId)) return { ok: false, error: SUSPENDED_MESSAGE };
  const asset = state.assets.find((a) => a.id === input.assetId);
  if (!asset) return { ok: false, error: "Asset not found." };
  if (asset.status !== "published") return { ok: false, error: "This asset is not open for investment." };

  const amount = input.amountUsd;
  const remaining = remainingUsd(asset);
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Enter an investment amount." };
  if (!Number.isSafeInteger(amount)) return { ok: false, error: "Enter the investment amount in whole dollars, without decimals." };
  if (remaining <= 0) return { ok: false, error: "This asset is fully funded." };
  if (amount > remaining) return { ok: false, error: `Only $${remaining.toLocaleString("en-US")} remains to be funded.` };
  if (amount < Math.min(asset.minInvestmentUsd, remaining)) return { ok: false, error: `Minimum investment is $${asset.minInvestmentUsd.toLocaleString("en-US")}.` };

  const tx: Transaction = {
    id: uid("tx"),
    reference: `TX-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    requestId: input.requestId,
    assetId: asset.id,
    assetName: asset.name,
    investorId: session.userId,
    investorName: session.name,
    amountUsd: amount,
    createdAt: nowIso(),
    status: "Completed",
  };
  const alreadyBacker = state.transactions.some((t) => t.assetId === asset.id && t.investorId === session.userId);
  const raised = asset.raisedUsd + amount;
  const money = `$${amount.toLocaleString("en-US")}`;
  commit({
    ...state,
    transactions: [tx, ...state.transactions],
    assets: state.assets.map((a) =>
      a.id === asset.id ? { ...a, raisedUsd: raised, fundedPct: pctFunded(raised, a.targetUsd), investors: a.investors + (alreadyBacker ? 0 : 1) } : a,
    ),
    notices: [
      notice("investor", `Investment confirmed: ${money}`, `Simulated investment in ${asset.name}. No real funds moved.`, "/investor/portfolio"),
      notice("seller", `New investment: ${money}`, `${asset.name} is now ${pctFunded(raised, asset.targetUsd)}% funded.`, `/seller/assets/${asset.id}`),
      notice("admin", `Investment recorded: ${money}`, `${session.name} → ${asset.name}.`, "/admin/transactions"),
      ...state.notices,
    ],
    activity: pushActivity(state, session.name, `Completed simulated investment of ${money}`, asset.name),
  });
  return { ok: true, tx };
}

/* ------------------------------ Admin & inbox ------------------------------ */

export function toggleUserStatus(userId: string) {
  const user = state.users.find((u) => u.id === userId);
  if (!user || user.role === "admin") return;
  const status = user.status === "Active" ? "Suspended" : "Active";
  // Suspending the signed-in user ends that session immediately.
  const session = status === "Suspended" && state.session?.userId === userId ? null : state.session;
  commit({
    ...state,
    session,
    users: state.users.map((u) => (u.id === userId ? { ...u, status } : u)),
    activity: pushActivity(state, state.session?.name ?? "Admin Operator", status === "Suspended" ? "Suspended user" : "Reactivated user", user.name),
  });
}

export function markNoticesRead(role: Role) {
  if (!state.notices.some((n) => n.to === role && !n.read)) return;
  commit({ ...state, notices: state.notices.map((n) => (n.to === role ? { ...n, read: true } : n)) });
}

/* --------------------------- Scenarios and reset --------------------------- */

/** Loads a preset dataset. The signed-in session is kept so the presenter stays in the same workspace. */
export function loadScenario(id: ScenarioId) {
  commit(buildState(id, state.session));
}

/** Restores the original baseline (Initial scenario) and clears any mutable demo state. */
export function resetDemo() {
  try {
    window.localStorage.removeItem("agrix:register-draft:v1");
  } catch {
    /* ignore */
  }
  commit(buildState("initial", state.session));
}
