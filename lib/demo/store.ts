import type { Asset, AssetCategory, UploadedDocMeta } from "@/types/asset";
import { pctFunded } from "@/data/assets";
import { BASELINE, buildState, sessionFor } from "./seed";
import type { ActivityEntry, DemoState, Notice, Role, ScenarioId, Session, Transaction } from "./types";

const KEY = "agrix:demo:v1";

let state: DemoState = BASELINE;
let loaded = false;
const listeners = new Set<() => void>();

function isValid(x: unknown): x is DemoState {
  const s = x as DemoState;
  return !!s && s.v === 1 && Array.isArray(s.assets) && Array.isArray(s.transactions) && Array.isArray(s.users) && Array.isArray(s.notices) && Array.isArray(s.activity);
}

function readStorage(): DemoState | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const stored = readStorage();
  if (stored) state = stored;
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

export function signInAs(role: Role) {
  commit({ ...state, session: sessionFor(role) });
}

export type AuthResult = { ok: true; role: Role } | { ok: false; error: string };

/** Demo sign-in: passwords are never checked; the email must belong to a demo or registered account. */
export function signInWithEmail(email: string): AuthResult {
  const e = email.trim().toLowerCase();
  const user = state.users.find((u) => u.email.toLowerCase() === e);
  if (!user) return { ok: false, error: "No demo account uses this email. Pick one of the demo accounts below." };
  if (user.status === "Suspended") return { ok: false, error: "This demo account is suspended by an admin." };
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
    image: `/images/assets/${input.category}.svg`,
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
  commit({
    ...state,
    assets: state.assets.map((a) => (a.id === assetId ? { ...a, status, reviewedAt: nowIso(), reviewNote } : a)),
    notices: [...next, ...state.notices],
    activity: pushActivity(state, state.session?.name ?? "Admin Operator", verb, asset.name),
  });
  return { ok: true };
}

export function resubmitAsset(assetId: string): { ok: boolean; error?: string } {
  const asset = state.assets.find((a) => a.id === assetId);
  if (!asset || asset.status !== "changes_requested") return { ok: false, error: "Nothing to resubmit." };
  commit({
    ...state,
    assets: state.assets.map((a) => (a.id === assetId ? { ...a, status: "pending_review", submittedAt: nowIso(), reviewNote: undefined } : a)),
    notices: [notice("admin", "Asset resubmitted", `${asset.name} (${asset.id}) was updated and resubmitted.`, `/admin/approvals/${asset.id}`), ...state.notices],
    activity: pushActivity(state, state.session?.name ?? "Seller", "Resubmitted asset for approval", asset.name),
  });
  return { ok: true };
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
  const asset = state.assets.find((a) => a.id === input.assetId);
  if (!asset) return { ok: false, error: "Asset not found." };
  if (asset.status !== "published") return { ok: false, error: "This asset is not open for investment." };

  const amount = Math.round(input.amountUsd);
  const remaining = remainingUsd(asset);
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Enter an investment amount." };
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
  commit({
    ...state,
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
