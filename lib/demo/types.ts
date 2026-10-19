import type { Asset } from "@/types/asset";

export type Role = "investor" | "seller" | "admin";
export type ScenarioId = "initial" | "pending" | "published" | "invested";

export const ROLES: Role[] = ["investor", "seller", "admin"];
export const ROLE_LABEL: Record<Role, string> = { investor: "Investor", seller: "Seller", admin: "Admin" };

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  org: string;
  status: "Active" | "Suspended";
  /** Simulated onboarding check — never a real KYC result. */
  kyc: "Simulated: approved" | "Simulated: pending";
  joined: string;
}

export interface Session {
  userId: string;
  role: Role;
  name: string;
  email: string;
}

export interface Transaction {
  id: string;
  reference: string;
  /** Idempotency key supplied by the confirm dialog, so repeated clicks cannot double-book. */
  requestId: string;
  assetId: string;
  assetName: string;
  investorId: string;
  investorName: string;
  amountUsd: number;
  createdAt: string;
  status: "Completed";
  /** "opening": seeded aggregate of earlier investments by several investors, so the ledger reconciles with funding totals. */
  kind?: "opening";
  /** Number of individual investments an aggregate entry stands for (defaults to 1). */
  investmentCount?: number;
}

export interface Notice {
  id: string;
  to: Role;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
}

export interface ActivityEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
}

export interface DemoState {
  v: 1;
  scenario: ScenarioId;
  session: Session | null;
  users: DemoUser[];
  assets: Asset[];
  transactions: Transaction[];
  notices: Notice[];
  activity: ActivityEntry[];
}

export const SCENARIOS: { id: ScenarioId; label: string; hint: string }[] = [
  { id: "initial", label: "Initial", hint: "No coffee listing yet" },
  { id: "pending", label: "Pending Approval", hint: "Coffee waiting for admin" },
  { id: "published", label: "Published", hint: "Coffee open to investors" },
  { id: "invested", label: "Investment Completed", hint: "$10,000 invested" },
];
