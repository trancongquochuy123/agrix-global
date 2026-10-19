const test = require("node:test");
const assert = require("node:assert/strict");
const out = globalThis.__UNIT_OUT__;
const store = require(`${out}/lib/demo/store.js`);
const { buildState } = require(`${out}/lib/demo/seed.js`);

const snap = () => store.demoStore.getSnapshot();
const asset = (id) => snap().assets.find((a) => a.id === id);

test("P1: a suspended account cannot be switched to, logged into, or invest", () => {
  store.loadScenario("published");
  store.signInAs("admin");
  store.toggleUserStatus("u-investor");
  assert.equal(snap().users.find((u) => u.id === "u-investor").status, "Suspended");

  const sw = store.signInAs("investor");
  assert.equal(sw.ok, false);
  assert.equal(sw.error, store.SUSPENDED_MESSAGE);
  assert.equal(snap().session.role, "admin", "failed switch must not change the session");

  const login = store.signInWithEmail("investor@agrix.demo");
  assert.equal(login.ok, false);
  assert.equal(snap().session.role, "admin");

  store.toggleUserStatus("u-investor");
  assert.equal(store.signInAs("investor").ok, true);
});

test("P1: suspending the signed-in user ends their session and blocks investing", () => {
  store.loadScenario("published");
  store.signInAs("investor");
  store.toggleUserStatus("u-investor");
  assert.equal(snap().session, null);
  const r = store.invest({ assetId: "VN-CF-001", amountUsd: 1_000, requestId: "p1-a" });
  assert.equal(r.ok, false);
  assert.equal(asset("VN-CF-001").raisedUsd, 0);
});

test("P1: persisted sessions of suspended users are dropped on load", () => {
  const s = buildState("published", { userId: "u-investor", role: "investor", name: "Tran Duc Minh", email: "investor@agrix.demo" });
  s.users = s.users.map((u) => (u.id === "u-investor" ? { ...u, status: "Suspended" } : u));
  assert.equal(store.normalizeState(s).session, null);
  const ok = buildState("published", { userId: "u-seller", role: "seller", name: "Linh Nguyen", email: "seller@agrix.demo" });
  assert.equal(store.normalizeState(ok).session.role, "seller");
});

test("P1: suspending a seller or investor never affects other roles' sessions", () => {
  store.loadScenario("initial");
  store.signInAs("admin");
  store.toggleUserStatus("u-seller");
  assert.equal(snap().session.role, "admin");
  assert.equal(store.signInAs("seller").ok, false);
  store.toggleUserStatus("u-seller");
});

test("P3: invest accepts only whole dollars within the min/max rules", () => {
  store.loadScenario("published");
  store.signInAs("investor");
  const go = (amountUsd, requestId) => store.invest({ assetId: "VN-CF-001", amountUsd, requestId });
  assert.equal(go(1000.5, "p3-a").ok, false);
  assert.match(go(1000.5, "p3-a").error, /whole dollars/i);
  assert.equal(go(-5000, "p3-b").ok, false);
  assert.equal(go(0, "p3-c").ok, false);
  assert.equal(go(NaN, "p3-d").ok, false);
  assert.equal(go(Infinity, "p3-e").ok, false);
  assert.equal(go(999, "p3-f").ok, false);
  assert.match(go(999, "p3-f").error, /Minimum investment is \$1,000/);
  assert.equal(go(350_001, "p3-g").ok, false);
  assert.match(go(350_001, "p3-g").error, /Only \$350,000 remains/);
  assert.equal(asset("VN-CF-001").raisedUsd, 0, "rejected attempts must not change funding");
  assert.equal(go(1000, "p3-h").ok, true, "exact minimum");
  assert.equal(asset("VN-CF-001").raisedUsd, 1000);
  assert.equal(go(349_000, "p3-i").ok, true, "exact remaining");
  assert.equal(asset("VN-CF-001").fundedPct, 100);
  assert.equal(go(1000, "p3-j").ok, false);
  assert.match(go(1000, "p3-j").error, /fully funded/i);
});

test("P3: only published assets accept investment (pending and rejected stay closed)", () => {
  store.loadScenario("pending");
  store.signInAs("investor");
  assert.equal(store.invest({ assetId: "VN-CF-001", amountUsd: 1000, requestId: "p3-k" }).ok, false);
  store.signInAs("admin");
  store.reviewAsset("VN-CF-001", "reject", "Not suitable");
  store.signInAs("investor");
  assert.equal(store.invest({ assetId: "VN-CF-001", amountUsd: 1000, requestId: "p3-l" }).ok, false);
  assert.equal(asset("VN-CF-001").status, "rejected");
});

/* ---------------------------------- P5 ---------------------------------- */

const input = {
  name: "Dak Lak Test Estate",
  category: "coffee",
  location: "Ea Kar",
  province: "Dak Lak",
  country: "Vietnam",
  areaHa: 40,
  coords: [12.7, 108.2],
  assetValueUsd: 500_000,
  targetUsd: 350_000,
  termMonths: 6,
  returnPct: 8,
  description: "Working capital for the upcoming harvest season.",
  uploads: [{ name: "Land-Use-Right-Certificate.pdf", sizeKb: 4300 }, { name: "Boundary-Survey-Map.pdf", sizeKb: 6900 }],
};
const patchFrom = (a, over = {}) => ({
  name: a.name, description: a.description, assetValueUsd: a.assetValueUsd, targetUsd: a.targetUsd,
  termMonths: a.termMonths, returnPct: a.targetYield, areaHa: a.areaHa, uploads: a.uploads, ...over,
});

function pendingAsset() {
  store.loadScenario("initial");
  store.signInAs("seller");
  return store.submitAsset(input);
}
function sendBack(id, note = "Please correct the financing target and replace the survey map.") {
  store.signInAs("admin");
  assert.equal(store.reviewAsset(id, "changes", note).ok, true);
  store.signInAs("seller");
}

test("P5: Request Changes → edit fields → replace a document → resubmit → admin approves", () => {
  const created = pendingAsset();
  sendBack(created.id);
  let a = asset(created.id);
  assert.equal(a.status, "changes_requested");

  const edit = patchFrom(a, {
    targetUsd: 300_000,
    description: "Corrected: working capital for picking labour and drying.",
    uploads: [a.uploads[0], { name: "Boundary-Survey-Map-v2.pdf", sizeKb: 7000 }],
  });
  const saved = store.saveAssetEdits(created.id, edit);
  assert.equal(saved.ok, true);
  assert.deepEqual(saved.changedFields.sort(), ["Documents", "Financing target", "Purpose of financing"]);
  a = asset(created.id);
  assert.equal(a.status, "changes_requested", "saving does not resubmit");
  assert.equal(a.targetUsd, 300_000);
  assert.equal(a.name, "Dak Lak Test Estate", "unchanged fields preserved");
  assert.equal(a.areaHa, 40);
  assert.equal(a.uploads[0].name, "Land-Use-Right-Certificate.pdf", "unchanged document reference preserved");
  assert.equal(a.uploads[1].name, "Boundary-Survey-Map-v2.pdf", "document replaced");

  const re = store.resubmitAsset(created.id, patchFrom(a, { areaHa: 42.5 }));
  assert.equal(re.ok, true);
  assert.ok(re.changedFields.includes("Area") && re.changedFields.includes("Documents"));
  a = asset(created.id);
  assert.equal(a.status, "pending_review", "back in the queue, not published");
  assert.equal(a.areaHa, 42.5);
  assert.equal(a.reviewNote, undefined);
  assert.deepEqual(a.reviewHistory.map((e) => e.kind), ["changes_requested", "edited", "resubmitted"]);
  assert.ok(snap().notices.some((n) => n.to === "admin" && n.title === "Asset resubmitted" && n.body.includes("Updated:")));
  assert.ok(snap().activity.some((e) => e.action === "Resubmitted asset for approval"));

  // Pending is not investable.
  store.signInAs("investor");
  assert.equal(store.invest({ assetId: created.id, amountUsd: 1000, requestId: "p5-a" }).ok, false);

  store.signInAs("admin");
  assert.equal(store.reviewAsset(created.id, "approve", "").ok, true);
  a = asset(created.id);
  assert.equal(a.status, "published");
  assert.deepEqual(a.reviewHistory.map((e) => e.kind), ["changes_requested", "edited", "resubmitted", "approved"]);
  store.signInAs("investor");
  assert.equal(store.invest({ assetId: created.id, amountUsd: 2000, requestId: "p5-b" }).ok, true);
});

test("P5: resubmitting without edits still works and is recorded as unchanged", () => {
  const created = pendingAsset();
  sendBack(created.id);
  const r = store.resubmitAsset(created.id);
  assert.equal(r.ok, true);
  assert.deepEqual(r.changedFields, []);
  const a = asset(created.id);
  assert.equal(a.status, "pending_review");
  assert.equal(a.reviewHistory.at(-1).note, "Resubmitted without changes.");
});

test("P5: invalid edits are rejected and change nothing", () => {
  const created = pendingAsset();
  sendBack(created.id);
  const a = asset(created.id);
  const before = JSON.stringify(a);
  const bad = [
    [{ targetUsd: 600_000 }, "targetUsd"],
    [{ targetUsd: -1 }, "targetUsd"],
    [{ targetUsd: 1000.5 }, "targetUsd"],
    [{ assetValueUsd: 0 }, "assetValueUsd"],
    [{ areaHa: 1e9 }, "areaHa"],
    [{ areaHa: -3 }, "areaHa"],
    [{ areaHa: NaN }, "areaHa"],
    [{ termMonths: 0 }, "termMonths"],
    [{ termMonths: 40 }, "termMonths"],
    [{ returnPct: 31 }, "returnPct"],
    [{ name: "ab" }, "name"],
    [{ description: "too short" }, "description"],
    [{ uploads: [] }, "uploads"],
  ];
  for (const [over, field] of bad) {
    for (const fn of [store.saveAssetEdits, store.resubmitAsset]) {
      const r = fn(created.id, patchFrom(a, over));
      assert.equal(r.ok, false, JSON.stringify(over));
      assert.equal(r.field, field, JSON.stringify(over));
    }
  }
  assert.equal(JSON.stringify(asset(created.id)), before);
  assert.equal(asset(created.id).status, "changes_requested");
});

test("P5: only the owning seller can edit, and only in changes_requested", () => {
  const created = pendingAsset();
  const a = asset(created.id);
  // pending_review: not editable
  assert.equal(store.saveAssetEdits(created.id, patchFrom(a, { name: "Renamed estate" })).ok, false);
  assert.equal(store.resubmitAsset(created.id).ok, false);

  sendBack(created.id);

  // another seller
  assert.equal(store.registerUser({ name: "Other Seller", email: "other.seller@example.com", role: "seller", org: "Other Co." }).ok, true);
  assert.equal(store.saveAssetEdits(created.id, patchFrom(a, { name: "Hijacked" })).ok, false);
  assert.equal(store.resubmitAsset(created.id).ok, false);
  // investor and admin
  store.signInAs("investor");
  assert.equal(store.saveAssetEdits(created.id, patchFrom(a, { name: "Hijacked" })).ok, false);
  store.signInAs("admin");
  assert.equal(store.saveAssetEdits(created.id, patchFrom(a, { name: "Hijacked" })).ok, false);
  // signed out
  store.signOut();
  assert.equal(store.resubmitAsset(created.id).ok, false);
  assert.equal(asset(created.id).name, "Dak Lak Test Estate");
  assert.equal(asset(created.id).status, "changes_requested");

  // owner can; then once resubmitted it is locked again
  store.signInAs("seller");
  assert.equal(store.saveAssetEdits(created.id, patchFrom(a, { name: "Renamed estate" })).ok, true);
  assert.equal(store.resubmitAsset(created.id).ok, true);
  assert.equal(store.saveAssetEdits(created.id, patchFrom(a, { name: "Late edit" })).ok, false);
  assert.equal(asset(created.id).name, "Renamed estate");
});

test("P5: rejected and published assets are not editable and rejected stays hidden", () => {
  const created = pendingAsset();
  store.signInAs("admin");
  store.reviewAsset(created.id, "reject", "Documents do not match.");
  store.signInAs("seller");
  const a = asset(created.id);
  assert.equal(a.status, "rejected");
  assert.equal(store.saveAssetEdits(created.id, patchFrom(a, { name: "Try again" })).ok, false);
  assert.equal(store.resubmitAsset(created.id).ok, false);
  assert.equal(asset(created.id).status, "rejected");

  store.loadScenario("published");
  store.signInAs("seller");
  const p = asset("VN-CF-001");
  assert.equal(store.saveAssetEdits("VN-CF-001", patchFrom(p, { name: "Edited live" })).ok, false);
});

test("P5: a suspended seller cannot edit", () => {
  const created = pendingAsset();
  sendBack(created.id);
  store.signInAs("admin");
  store.toggleUserStatus("u-seller");
  store.signInAs("seller"); // refused
  assert.equal(store.resubmitAsset(created.id).ok, false);
  store.toggleUserStatus("u-seller");
});
