import type { Asset } from "@/types/asset";
import { baseAssets, coffeeAsset } from "@/data/assets";
import type { ActivityEntry, DemoState, DemoUser, Notice, ScenarioId, Session, Transaction } from "./types";

/** Fixed demo clock for seeded records, so server and client render identical text. */
export const ANCHOR = Date.UTC(2026, 9, 13, 8, 0, 0);
const iso = (daysAgo: number, hour = 8) => new Date(ANCHOR - daysAgo * 86_400_000 + (hour - 8) * 3_600_000).toISOString();

export const DEMO_ACCOUNTS = {
  investor: { id: "u-investor", name: "Tran Duc Minh", email: "investor@agrix.demo", org: "Individual investor" },
  seller: { id: "u-seller", name: "Linh Nguyen", email: "seller@agrix.demo", org: "Highland Agri Co." },
  admin: { id: "u-admin", name: "Admin Operator", email: "admin@agrix.demo", org: "AGRIX Operations" },
} as const;

export const sessionFor = (role: keyof typeof DEMO_ACCOUNTS): Session => ({
  userId: DEMO_ACCOUNTS[role].id,
  role,
  name: DEMO_ACCOUNTS[role].name,
  email: DEMO_ACCOUNTS[role].email,
});

const users: DemoUser[] = [
  { ...DEMO_ACCOUNTS.investor, role: "investor", status: "Active", kyc: "Simulated: approved", joined: iso(150) },
  { ...DEMO_ACCOUNTS.seller, role: "seller", status: "Active", kyc: "Simulated: approved", joined: iso(120) },
  { ...DEMO_ACCOUNTS.admin, role: "admin", status: "Active", kyc: "Simulated: approved", joined: iso(300) },
  { id: "u-i2", name: "Sofia Alvarez", email: "sofia.alvarez@example.com", role: "investor", org: "Family office", status: "Active", kyc: "Simulated: approved", joined: iso(98) },
  { id: "u-i3", name: "Daniel Park", email: "daniel.park@example.com", role: "investor", org: "Individual investor", status: "Active", kyc: "Simulated: approved", joined: iso(77) },
  { id: "u-i4", name: "Amara Okafor", email: "amara.okafor@example.com", role: "investor", org: "Impact fund", status: "Active", kyc: "Simulated: approved", joined: iso(54) },
  { id: "u-i5", name: "Hiroshi Tanaka", email: "hiroshi.tanaka@example.com", role: "investor", org: "Individual investor", status: "Active", kyc: "Simulated: pending", joined: iso(11) },
  { id: "u-s2", name: "Pham Van Hai", email: "hai@mekong-rice.example", role: "seller", org: "Mekong Rice Cooperative", status: "Active", kyc: "Simulated: approved", joined: iso(140) },
  { id: "u-s3", name: "Rizky Pratama", email: "rizky@riau-plantation.example", role: "seller", org: "Riau Plantation Ltd.", status: "Active", kyc: "Simulated: approved", joined: iso(133) },
  { id: "u-s4", name: "Lucas Oliveira", email: "lucas@cerrado-grain.example", role: "seller", org: "Cerrado Grain Farms", status: "Active", kyc: "Simulated: approved", joined: iso(110) },
  { id: "u-s5", name: "Kwame Mensah", email: "kwame@kumasi-cocoa.example", role: "seller", org: "Kumasi Cocoa Co-op", status: "Active", kyc: "Simulated: approved", joined: iso(92) },
];

const inv = (id: string, name: string) => ({ investorId: id, investorName: name });
const tx = (n: number, assetId: string, assetName: string, who: [string, string], amountUsd: number, daysAgo: number): Transaction => ({
  id: `tx-seed-${n}`,
  reference: `TX-${(90000 + n * 137).toString(36).toUpperCase()}`,
  requestId: `seed-${n}`,
  assetId,
  assetName,
  ...inv(who[0], who[1]),
  amountUsd,
  createdAt: iso(daysAgo),
  status: "Completed",
});

const ME: [string, string] = ["u-investor", "Tran Duc Minh"];
const baseTransactions: Transaction[] = [
  tx(1, "VN-RC-002", "Vietnamese Rice", ME, 15_000, 124),
  tx(2, "ID-PO-003", "Indonesian Palm Oil", ME, 12_500, 97),
  tx(3, "BR-SB-004", "Brazilian Soybeans", ME, 10_000, 55),
  tx(4, "VN-RC-002", "Vietnamese Rice", ["u-i2", "Sofia Alvarez"], 25_000, 31),
  tx(5, "ID-PO-003", "Indonesian Palm Oil", ["u-i3", "Daniel Park"], 8_000, 24),
  tx(6, "GH-CC-005", "Ghana Cocoa", ["u-i4", "Amara Okafor"], 40_000, 19),
  tx(7, "VN-BP-006", "Vietnamese Black Pepper", ["u-i2", "Sofia Alvarez"], 18_000, 12),
  tx(8, "BR-SB-004", "Brazilian Soybeans", ["u-i3", "Daniel Park"], 5_000, 6),
  tx(9, "GH-CC-005", "Ghana Cocoa", ["u-i2", "Sofia Alvarez"], 12_000, 3),
];

/**
 * Earlier investments by investors not listed individually. One labelled aggregate per asset closes the gap between
 * the named transactions above and the funding already raised, so ledger totals equal each asset's raised amount.
 */
const openingBalances: Transaction[] = baseAssets
  .filter((a) => a.raisedUsd > 0)
  .map((a) => {
    const named = baseTransactions.filter((t) => t.assetId === a.id);
    const namedInvestors = new Set(named.map((t) => t.investorId)).size;
    const count = Math.max(1, a.investors - namedInvestors);
    return {
      id: `tx-open-${a.id}`,
      reference: `TX-OPEN-${a.id.split("-")[1]}`,
      requestId: `seed-open-${a.id}`,
      assetId: a.id,
      assetName: a.name,
      investorId: `pool-${a.id}`,
      investorName: `Other investors (${count})`,
      amountUsd: a.raisedUsd - named.reduce((n, t) => n + t.amountUsd, 0),
      createdAt: iso(130),
      status: "Completed" as const,
      kind: "opening" as const,
      investmentCount: count,
    };
  });

const notice = (id: string, to: Notice["to"], title: string, body: string, daysAgo: number, read = false, href?: string): Notice => ({
  id,
  to,
  title,
  body,
  createdAt: iso(daysAgo, 9),
  read,
  href,
});

const baseNotices: Notice[] = [
  notice("n-i1", "investor", "Ghana Cocoa reached 52% funded", "Funding on a listing you follow passed the halfway mark.", 3, false, "/investor/marketplace/ghana-cocoa"),
  notice("n-i2", "investor", "Quarterly statement is ready", "Your Q3 demo statement can be downloaded from Documents.", 9, true, "/investor/documents"),
  notice("n-s1", "seller", "Vietnamese Black Pepper is 67% funded", "Investors have committed $268K of the $400K target.", 4, false, "/seller/assets"),
  notice("n-s2", "seller", "Complete your business profile", "A full profile helps reviewers approve new listings faster.", 20, true, "/seller/profile"),
  notice("n-a1", "admin", "Weekly risk digest generated", "2 listings have elevated market-price risk flags.", 2, false, "/admin/risk"),
  notice("n-a2", "admin", "New user pending simulated KYC", "Hiroshi Tanaka registered as an investor.", 11, true, "/admin/users"),
];

const act = (n: number, daysAgo: number, actor: string, action: string, target: string): ActivityEntry => ({
  id: `act-seed-${n}`,
  at: iso(daysAgo, 10),
  actor,
  action,
  target,
});

const baseActivity: ActivityEntry[] = [
  act(1, 40, "Admin Operator", "Approved listing", "Vietnamese Rice"),
  act(2, 33, "Admin Operator", "Approved listing", "Brazilian Soybeans"),
  act(3, 26, "Admin Operator", "Approved listing", "Ghana Cocoa"),
  act(4, 18, "Admin Operator", "Approved listing", "Vietnamese Black Pepper"),
  act(5, 11, "System", "Registered user (simulated KYC pending)", "Hiroshi Tanaka"),
  act(6, 2, "System", "Weekly risk digest generated", "Platform"),
];

const D = (n: number, hour = 8) => iso(n, hour);

export function buildState(id: ScenarioId, session: Session | null): DemoState {
  let assets: Asset[] = [...baseAssets];
  let transactions = [...baseTransactions, ...openingBalances];
  let notices = [...baseNotices];
  let activity = [...baseActivity];

  if (id === "pending") {
    assets = [coffeeAsset("pending_review", 0, 0, D(0)), ...assets];
    notices = [
      notice("n-p-a", "admin", "New asset awaiting review", "Vietnam Robusta Coffee (VN-CF-001) was submitted by Highland Agri Co.", 0, false, "/admin/approvals/VN-CF-001"),
      notice("n-p-s", "seller", "VN-CF-001 submitted for review", "Status: Pending Review. We will notify you after the admin decision.", 0, false, "/seller/assets/VN-CF-001"),
      ...notices,
    ];
    activity = [act(10, 0, "Linh Nguyen", "Submitted asset for approval", "Vietnam Robusta Coffee"), ...activity];
  }

  if (id === "published" || id === "invested") {
    const raised = id === "invested" ? 10_000 : 0;
    assets = [coffeeAsset("published", raised, id === "invested" ? 1 : 0, D(0)), ...assets];
    notices = [
      notice("n-pub-i", "investor", "New opportunity: Vietnam Robusta Coffee", "6-month financing, illustrative 8% annualised return.", 0, false, "/investor/marketplace/vietnam-robusta-coffee"),
      notice("n-pub-s", "seller", "Vietnam Robusta Coffee is published", "Approved by admin (simulated review). Investors can now fund it.", 0, false, "/seller/assets/VN-CF-001"),
      ...notices,
    ];
    activity = [
      act(12, 0, "Admin Operator", "Approved listing", "Vietnam Robusta Coffee"),
      act(11, 1, "Linh Nguyen", "Submitted asset for approval", "Vietnam Robusta Coffee"),
      ...activity,
    ];
  }

  if (id === "invested") {
    transactions = [
      {
        id: "tx-scn-1",
        reference: "TX-DEMO01",
        requestId: "scenario-invested",
        assetId: "VN-CF-001",
        assetName: "Vietnam Robusta Coffee",
        investorId: "u-investor",
        investorName: "Tran Duc Minh",
        amountUsd: 10_000,
        createdAt: D(0, 11),
        status: "Completed",
      },
      ...transactions,
    ];
    notices = [
      notice("n-inv-i", "investor", "Investment confirmed: $10,000", "Simulated investment in Vietnam Robusta Coffee. No real funds moved.", 0, false, "/investor/portfolio"),
      notice("n-inv-s", "seller", "New investment: $10,000", "Vietnam Robusta Coffee funding is now 3% of target.", 0, false, "/seller/assets/VN-CF-001"),
      notice("n-inv-a", "admin", "Investment recorded: $10,000", "Tran Duc Minh → Vietnam Robusta Coffee.", 0, false, "/admin/transactions"),
      ...notices,
    ];
    activity = [act(13, 0, "Tran Duc Minh", "Completed simulated investment of $10,000", "Vietnam Robusta Coffee"), ...activity];
  }

  return { v: 1, scenario: id, session, users: users.map((u) => ({ ...u })), assets, transactions, notices, activity };
}

export const BASELINE: DemoState = buildState("initial", null);
