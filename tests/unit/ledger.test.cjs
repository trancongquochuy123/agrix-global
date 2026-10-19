const test = require("node:test");
const assert = require("node:assert/strict");
const out = globalThis.__UNIT_OUT__;
const { buildState, BASELINE } = require(`${out}/lib/demo/seed.js`);
const { platformTotals, ledgerTotalFor, investmentCount, positionsOf } = require(`${out}/lib/demo/selectors.js`);
const store = require(`${out}/lib/demo/store.js`);

const SCENARIOS = ["initial", "pending", "published", "invested"];
const published = (s) => s.assets.filter((a) => a.status === "published");

test("every seeded published asset: ledger total equals raised amount, and investments equal investor count", () => {
  for (const id of SCENARIOS) {
    const s = buildState(id, null);
    for (const a of published(s)) {
      assert.equal(ledgerTotalFor(s, a.id), a.raisedUsd, `${id}/${a.id} ledger vs raised`);
      const txs = s.transactions.filter((t) => t.assetId === a.id);
      assert.equal(investmentCount(txs), a.investors, `${id}/${a.id} investments vs investors`);
    }
  }
});

test("platform totals reconcile in every scenario (no variance, no hidden gap)", () => {
  for (const id of SCENARIOS) {
    const t = platformTotals(buildState(id, null));
    assert.equal(t.variance, 0, id);
    assert.equal(t.volume, t.fundedUsd, id);
  }
  const t = platformTotals(BASELINE);
  assert.equal(t.volume, 2_383_000);
  assert.equal(t.transactions, 64 + 112 + 47 + 39 + 31);
});

test("named seed transactions and the demo investor's portfolio are unchanged", () => {
  const s = buildState("initial", null);
  const named = s.transactions.filter((t) => t.kind !== "opening");
  assert.equal(named.length, 9);
  assert.equal(named.reduce((n, t) => n + t.amountUsd, 0), 145_500);
  const mine = positionsOf(s, "u-investor", Date.UTC(2026, 9, 13));
  assert.equal(mine.reduce((n, p) => n + p.investedUsd, 0), 37_500);
  const invested = positionsOf(buildState("invested", null), "u-investor", Date.UTC(2026, 9, 13));
  assert.equal(invested.reduce((n, p) => n + p.investedUsd, 0), 47_500);
});

test("opening-balance rows are labelled aggregates, not fake individual investors", () => {
  const open = BASELINE.transactions.filter((t) => t.kind === "opening");
  assert.equal(open.length, 5);
  for (const t of open) {
    assert.match(t.investorName, /^Other investors \(\d+\)$/);
    assert.ok(t.investmentCount > 1);
    assert.ok(!BASELINE.users.some((u) => u.id === t.investorId));
  }
});

test("a new investment moves volume, funded total, transactions and the asset by the same amount", () => {
  store.loadScenario("published");
  store.signInAs("investor");
  const before = platformTotals(store.demoStore.getSnapshot());
  const res = store.invest({ assetId: "VN-CF-001", amountUsd: 10_000, requestId: "t-1" });
  assert.equal(res.ok, true);
  const s = store.demoStore.getSnapshot();
  const after = platformTotals(s);
  assert.equal(after.volume - before.volume, 10_000);
  assert.equal(after.fundedUsd - before.fundedUsd, 10_000);
  assert.equal(after.transactions - before.transactions, 1);
  assert.equal(after.variance, 0);
  assert.equal(ledgerTotalFor(s, "VN-CF-001"), s.assets.find((a) => a.id === "VN-CF-001").raisedUsd);
  // Repeating the same request does not book again.
  assert.equal(store.invest({ assetId: "VN-CF-001", amountUsd: 10_000, requestId: "t-1" }).ok, true);
  assert.equal(platformTotals(store.demoStore.getSnapshot()).volume, after.volume);
});

test("reset restores a reconciled baseline after investments", () => {
  store.loadScenario("published");
  store.signInAs("investor");
  store.invest({ assetId: "VN-CF-001", amountUsd: 5_000, requestId: "t-2" });
  store.resetDemo();
  const t = platformTotals(store.demoStore.getSnapshot());
  assert.equal(t.variance, 0);
  assert.equal(t.volume, 2_383_000);
});

test("legacy persisted state (ledger without opening rows) is repaired only when the gap is exact", () => {
  const legacy = buildState("initial", null);
  legacy.transactions = legacy.transactions.filter((t) => t.kind !== "opening");
  assert.notEqual(platformTotals(legacy).variance, 0);
  const fixed = store.normalizeState(legacy);
  assert.equal(platformTotals(fixed).variance, 0);

  // A legacy asset whose raised amount no longer matches (e.g. edited) is left alone, not papered over.
  const odd = buildState("initial", null);
  odd.transactions = odd.transactions.filter((t) => t.kind !== "opening");
  odd.assets = odd.assets.map((a) => (a.id === "VN-RC-002" ? { ...a, raisedUsd: a.raisedUsd + 1 } : a));
  const out2 = store.normalizeState(odd);
  assert.equal(out2.transactions.some((t) => t.assetId === "VN-RC-002" && t.kind === "opening"), false);
  assert.equal(platformTotals(out2).variance, 480_000 + 1, "the unexplained gap stays visible");
});
