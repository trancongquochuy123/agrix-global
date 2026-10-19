// Browser regression tests for the targeted fixes (P1–P5). Run against a build made with NEXT_PUBLIC_DEMO_MODE=true:
//   BASE=http://localhost:3100 node tests/e2e/fixes.mjs
// Requires Playwright (not a project dependency): `npm i --no-save playwright && npx playwright install chromium`.
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE || "http://localhost:3100";
const KEY = "agrix:demo:v1";
const results = [];
const br = await chromium.launch();

async function t(id, title, fn) {
  const ctx = await br.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => (page._errs ||= []).push(String(e)));
  let ok = false;
  let actual = "";
  try {
    actual = (await fn(page, ctx)) || "ok";
    ok = true;
  } catch (e) {
    actual = String(e.message).split("\n").slice(0, 3).join(" | ");
  }
  if (ok && page._errs?.length) {
    ok = false;
    actual = `page errors: ${page._errs.join(" ; ").slice(0, 200)}`;
  }
  results.push({ id, title, status: ok ? "PASS" : "FAIL", actual });
  console.log(`[${ok ? "PASS" : "FAIL"}] ${id} ${title}${ok ? "" : " :: " + actual}`);
  await ctx.close();
}

const eq = (a, b, m) => {
  if (a !== b) throw new Error(`${m}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
};
const ok = (c, m) => {
  if (!c) throw new Error(m);
};
const body = (p) => p.locator("body").innerText();
const store = (p) => p.evaluate((k) => JSON.parse(localStorage.getItem(k) || "null"), KEY);
const num = (s) => Number(String(s).replace(/[^0-9.-]/g, ""));

async function loginAs(p, role) {
  await p.goto(`${BASE}/auth/login`);
  await p.getByRole("button", { name: new RegExp(`${role}@agrix.demo`) }).click();
  await p.waitForURL(new RegExp(`/${role}/dashboard`), { timeout: 8000 });
}
async function demo(p, item, kind = "menuitemradio") {
  await p.keyboard.press("Escape").catch(() => {});
  await p.getByRole("button", { name: "Open demo controls" }).click();
  await p.getByRole(kind, { name: item }).click();
  await p.waitForTimeout(500);
}
const switchRole = (p, label) => demo(p, label);
const scenario = (p, label) => demo(p, label);
const reset = (p) => demo(p, /Reset Demo Data/, "menuitem");
const statValue = async (p, label) => {
  const t = await body(p);
  const m = t.match(new RegExp(`${label}\\s*\\n+\\s*\\$?([\\d,]+)`));
  return m ? num(m[1]) : NaN;
};

/* ================================== P1 ================================== */
await t("P1.1", "Admin suspends the investor; Demo Switcher refuses to switch to Investor", async (p) => {
  await loginAs(p, "admin");
  await p.goto(`${BASE}/admin/users`);
  await p.getByRole("button", { name: /Suspend Tran Duc Minh/ }).first().click();
  await p.waitForTimeout(400);
  await switchRole(p, "Investor");
  await p.waitForTimeout(400);
  const t1 = await body(p);
  ok(/suspended/i.test(t1), "no suspended message shown");
  ok(/\/admin\//.test(p.url()), `navigated away: ${p.url()}`);
  eq((await store(p)).session.role, "admin", "session role");
});

await t("P1.2", "Suspended investor cannot sign in from the login demo list or by email", async (p) => {
  await loginAs(p, "admin");
  await p.goto(`${BASE}/admin/users`);
  await p.getByRole("button", { name: /Suspend Tran Duc Minh/ }).first().click();
  await p.waitForTimeout(300);
  await p.goto(`${BASE}/auth/login`);
  await p.getByRole("button", { name: /investor@agrix.demo/ }).click();
  await p.waitForTimeout(500);
  ok(/\/auth\/login/.test(p.url()), `left login: ${p.url()}`);
  ok(/suspended/i.test(await body(p)), "no suspended message (demo list)");
  eq((await store(p)).session.role, "admin", "session unchanged after demo-list attempt");
  await p.locator("#email").fill("investor@agrix.demo");
  await p.locator("#password").fill("whatever");
  await p.getByRole("button", { name: /^Log in$/ }).click();
  await p.waitForTimeout(500);
  ok(/\/auth\/login/.test(p.url()), "email login navigated away");
  eq((await store(p)).session.role, "admin", "session unchanged after email attempt");
});

await t("P1.3", "Role chooser (/auth/role) refuses a suspended account", async (p) => {
  await loginAs(p, "admin");
  await p.goto(`${BASE}/admin/users`);
  await p.getByRole("button", { name: /Suspend Linh Nguyen/ }).first().click();
  await p.goto(`${BASE}/auth/role`);
  await p.getByRole("button", { name: /Seller/ }).first().click();
  await p.waitForTimeout(500);
  ok(/\/auth\/role/.test(p.url()), `left role chooser: ${p.url()}`);
  ok(/suspended/i.test(await body(p)), "no suspended message");
});

await t("P1.4", "Reactivating restores access", async (p) => {
  await loginAs(p, "admin");
  await p.goto(`${BASE}/admin/users`);
  await p.getByRole("button", { name: /Suspend Tran Duc Minh/ }).first().click();
  await p.getByRole("button", { name: /Reactivate Tran Duc Minh/ }).first().click();
  await switchRole(p, "Investor");
  await p.waitForURL(/\/investor\/dashboard/, { timeout: 5000 });
});

await t("P1.5", "A persisted session of a suspended user is invalidated on load and guarded routes redirect", async (p) => {
  await loginAs(p, "investor");
  const s = await store(p);
  s.users = s.users.map((u) => (u.id === "u-investor" ? { ...u, status: "Suspended" } : u));
  await p.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [KEY, s]);
  await p.goto(`${BASE}/investor/dashboard`);
  await p.waitForURL(/\/auth\/login/, { timeout: 8000 });
  eq((await store(p)).session, null, "stored session cleared");
});

await t("P1.6", "Invest button is unavailable when the investor's session is suspended mid-session", async (p) => {
  await scenarioSetup(p, "Published");
  await switchRole(p, "Investor");
  await p.goto(`${BASE}/investor/marketplace/vietnam-robusta-coffee`);
  await p.getByRole("button", { name: /Invest Now/ }).first().waitFor();
  // A second tab (the admin workspace shares the one demo session, so emulate the admin action in storage).
  const s = await store(p);
  s.users = s.users.map((u) => (u.id === "u-investor" ? { ...u, status: "Suspended" } : u));
  s.session = null;
  await p.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [KEY, s]);
  await p.reload();
  eq(await p.getByRole("button", { name: /Invest Now/ }).count(), 0, "Invest Now still rendered for a suspended/no session");
  const tx = (await store(p)).transactions.filter((x) => x.assetId === "VN-CF-001");
  eq(tx.length, 0, "no transaction booked");
});

async function scenarioSetup(p, label) {
  await loginAs(p, "admin");
  await scenario(p, label);
}

/* ================================== P2 ================================== */
const SEEDED = [
  ["Vietnamese Rice", 520_000, 64],
  ["Indonesian Palm Oil", 870_000, 112],
  ["Brazilian Soybeans", 410_000, 47],
  ["Ghana Cocoa", 315_000, 39],
  ["Vietnamese Black Pepper", 268_000, 31],
];
await t("P2.1", "Admin overview, Transactions page and CSV all show the same reconciled seed volume and count", async (p, ctx) => {
  await loginAs(p, "admin");
  await p.goto(`${BASE}/admin/dashboard`);
  await p.waitForTimeout(500);
  eq(await statValue(p, "Total Investment Volume"), 2_383_000, "overview volume");
  const ov = await body(p);
  const cnt = num(ov.match(/Total Investment Volume[\s\S]{0,60}?(\d+) transactions/)[1]);
  eq(cnt, 293, "overview transaction count");
  ok(!/ledger differs/i.test(ov), "overview reports a variance");
  await p.goto(`${BASE}/admin/transactions`);
  await p.waitForTimeout(500);
  eq(await statValue(p, "Recorded volume"), 2_383_000, "transactions volume");
  eq(await statValue(p, "Transactions"), 293, "transactions count");
  const [dl] = await Promise.all([p.waitForEvent("download"), p.getByRole("button", { name: /Export CSV/ }).click()]);
  const csv = fs.readFileSync(await dl.path(), "utf8").trim().split("\n");
  const header = csv[0].split(",");
  const amt = header.indexOf("Amount USD");
  const invs = header.indexOf("Investments");
  const rows = csv.slice(1).map((l) => l.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map((c) => c.replace(/,$/, "").replace(/^"|"$/g, "")));
  eq(rows.reduce((n, r) => n + Number(r[amt]), 0), 2_383_000, "CSV amount sum");
  eq(rows.reduce((n, r) => n + Number(r[invs]), 0), 293, "CSV investments sum");
});

await t("P2.2", "Per seeded asset: ledger volume equals the funding shown on the marketplace", async (p) => {
  await loginAs(p, "admin");
  const mp = await (async () => {
    await p.goto(`${BASE}/marketplace`);
    await p.waitForTimeout(500);
    return body(p);
  })();
  for (const [name, raised] of SEEDED) {
    ok(new RegExp(`\\$${raised / 1000}(\\.0)?K`).test(mp), `${name}: marketplace does not show $${raised / 1000}K`);
    await p.goto(`${BASE}/admin/transactions`);
    await p.getByPlaceholder("Search by reference or asset").fill(name);
    await p.waitForTimeout(250);
    eq(await statValue(p, "Recorded volume"), raised, `${name} ledger volume`);
    eq((await store(p)).assets.find((a) => a.name === name).raisedUsd, raised, `${name} raisedUsd`);
  }
});

await t("P2.3", "After a $10,000 investment volume, count and per-asset figures move together; stable through refresh, role switch, reset", async (p) => {
  await loginAs(p, "admin");
  await scenario(p, "Published");
  const read = async () => {
    await p.goto(`${BASE}/admin/dashboard`);
    await p.waitForTimeout(400);
    const v = await statValue(p, "Total Investment Volume");
    const c = num((await body(p)).match(/Total Investment Volume[\s\S]{0,60}?(\d+) transactions/)[1]);
    return [v, c];
  };
  const [v0, c0] = await read();
  eq(v0, 2_383_000, "published scenario volume");
  await switchRole(p, "Investor");
  await p.goto(`${BASE}/investor/marketplace/vietnam-robusta-coffee`);
  await p.getByRole("button", { name: /Invest Now/ }).first().click();
  await p.locator("#invest-amount").fill("10000");
  await p.getByRole("button", { name: /Review investment/ }).click();
  await p.getByRole("checkbox").check();
  await p.getByRole("button", { name: /Confirm \$10,000/ }).dblclick();
  await p.getByText("Investment confirmed").first().waitFor();
  await switchRole(p, "Admin");
  let [v1, c1] = await read();
  eq(v1 - v0, 10_000, "volume delta");
  eq(c1 - c0, 1, "count delta");
  await switchRole(p, "Seller");
  await p.goto(`${BASE}/seller/assets/VN-CF-001`);
  await p.waitForTimeout(500);
  const sd = await body(p);
  ok(/\$10,000\s*\n+\s*of \$350,000/.test(sd), "seller funding not $10,000 of $350,000");
  await p.reload();
  await switchRole(p, "Admin");
  [v1, c1] = await read();
  eq(v1 - v0, 10_000, "volume delta after refresh/switch");
  await reset(p);
  const [v2, c2] = await read();
  eq(v2, 2_383_000, "volume after reset");
  eq(c2, 293, "count after reset");
});

/* ================================== P3 ================================== */
await t("P3.1", "Invest dialog: audited inputs are rejected visibly, valid boundaries accepted", async (p) => {
  await scenarioSetup(p, "Published");
  await switchRole(p, "Investor");
  await p.goto(`${BASE}/investor/marketplace/vietnam-robusta-coffee`);
  await p.getByRole("button", { name: /Invest Now/ }).first().click();
  const input = p.locator("#invest-amount");
  const review = p.getByRole("button", { name: /Review investment/ });
  const hint = p.locator("#invest-hint");
  const cases = [
    ["1000", true, null, "1000"],
    ["10000", true, null, "10000"],
    ["350000", true, null, "350000"],
    ["10,000", true, null, "10,000"],
    ["1000.50", false, /whole dollars/i, "1000.50"],
    ["1,000.50", false, /whole dollars/i, "1,000.50"],
    ["1000.9", false, /whole dollars/i, "1000.9"],
    ["-5000", false, /negative/i, "-5000"],
    ["0", false, /./, "0"],
    ["", false, null, ""],
    ["abc", false, /digits only/i, "abc"],
    ["1e3", false, /scientific/i, "1e3"],
    ["999", false, /Minimum investment is \$1,000/, "999"],
    ["350001", false, /Only \$350,000 remains/, "350001"],
  ];
  for (const [raw, valid, msg, shown] of cases) {
    await input.fill(raw);
    eq(await input.inputValue(), shown, `displayed value for "${raw}"`);
    eq(await review.isEnabled(), valid, `Review enabled for "${raw}"`);
    if (msg) ok(msg.test(await hint.innerText()), `message for "${raw}": ${await hint.innerText()}`);
  }
  // Real keystrokes (no auto-reformatting that corrupts the next digit), separators added on blur.
  await input.fill("");
  await input.pressSequentially("350000");
  eq(await input.inputValue(), "350000", "typed value");
  ok(await review.isEnabled(), "typed 350000 not accepted");
  await input.blur();
  eq(await input.inputValue(), "350,000", "grouped on blur");
  eq((await store(p)).transactions.filter((x) => x.assetId === "VN-CF-001").length, 0, "no transaction from rejected inputs");
});

await t("P3.2", "Invest dialog: the reviewed and booked amount is exactly what was typed", async (p) => {
  await scenarioSetup(p, "Published");
  await switchRole(p, "Investor");
  await p.goto(`${BASE}/investor/marketplace/vietnam-robusta-coffee`);
  await p.getByRole("button", { name: /Invest Now/ }).first().click();
  await p.locator("#invest-amount").fill("12,000");
  await p.getByRole("button", { name: /Review investment/ }).click();
  ok(/\$12,000/.test(await p.locator("[role=dialog]").innerText()), "review step amount");
  await p.getByRole("checkbox").check();
  await p.getByRole("button", { name: /Confirm \$12,000/ }).click();
  await p.getByText("Investment confirmed").first().waitFor();
  const tx = (await store(p)).transactions.filter((x) => x.assetId === "VN-CF-001");
  eq(tx.length, 1, "one transaction");
  eq(tx[0].amountUsd, 12_000, "booked amount");
});

await t("P3.3", "Wizard: -500 value and 1e9 ha area block progression, stay visible with field errors", async (p) => {
  await loginAs(p, "seller");
  await p.goto(`${BASE}/seller/assets/new`);
  await p.getByRole("button", { name: /Fill sample data/ }).click();
  const next = p.getByRole("button", { name: /Save & Continue/ });
  const stepNow = () => p.locator("[role=progressbar]").first().getAttribute("aria-valuenow");
  const s0 = await stepNow();
  for (const [sel, val, re] of [
    ["#estimatedValue", "-500", /negative/i],
    ["#estimatedValue", "1e3", /scientific/i],
    ["#estimatedValue", "500.5", /whole dollars/i],
    ["#totalArea", "1e9", /scientific/i],
    ["#totalArea", "1000000000", /cannot exceed/i],
    ["#totalArea", "-5", /negative/i],
    ["#totalArea", "abc", /digits only/i],
  ]) {
    await p.locator("#estimatedValue").fill("500000");
    await p.locator("#totalArea").fill("40");
    await p.locator(sel).fill(val);
    await next.click();
    await p.waitForTimeout(250);
    eq(await stepNow(), s0, `advanced with ${sel}=${val}`);
    eq(await p.locator(sel).inputValue(), val === "-500" || val === "500.5" ? val : val, `value kept for ${val}`);
    ok(re.test(await p.locator(`${sel}-error`).innerText()), `error for ${val}: ${await p.locator(`${sel}-error`).innerText().catch(() => "none")}`);
  }
  await p.locator("#estimatedValue").fill("500,000");
  await p.locator("#totalArea").fill("40.5");
  await next.click();
  await p.waitForTimeout(300);
  ok((await stepNow()) !== s0, "valid values did not advance");
});

await t("P3.4", "Wizard: financing step rejects bad target, term and return", async (p) => {
  await loginAs(p, "seller");
  await p.goto(`${BASE}/seller/assets/new`);
  await p.getByRole("button", { name: /Fill sample data/ }).click();
  const next = p.getByRole("button", { name: /Save & Continue/ });
  for (let i = 0; i < 4; i++) {
    await next.click();
    await p.waitForTimeout(250);
  }
  const stepNow = () => p.locator("[role=progressbar]").first().getAttribute("aria-valuenow");
  const s0 = await stepNow();
  for (const [sel, val] of [["#financingTarget", "-1"], ["#financingTarget", "600000"], ["#termMonths", "0"], ["#termMonths", "37"], ["#termMonths", "6.5"], ["#expectedReturn", "31"], ["#expectedReturn", "8e0"]]) {
    await p.locator("#financingTarget").fill("350000");
    await p.locator("#termMonths").fill("6");
    await p.locator("#expectedReturn").fill("8");
    await p.locator(sel).fill(val);
    await next.click();
    await p.waitForTimeout(250);
    eq(await stepNow(), s0, `advanced with ${sel}=${val}`);
    ok(await p.locator(`${sel}-error`).isVisible(), `no error for ${sel}=${val}`);
  }
});

/* ================================== P4 ================================== */
const WIDTHS = [360, 390, 600, 640, 700, 767, 768, 800, 900, 1023, 1024, 1100, 1279, 1280, 1366, 1440];
await t("P4.1", "Wizard has no page-level horizontal overflow and all six steps stay reachable at 360–1440px", async (p) => {
  await loginAs(p, "seller");
  const bad = [];
  for (const w of WIDTHS) {
    await p.setViewportSize({ width: w, height: 900 });
    await p.goto(`${BASE}/seller/assets/new`);
    await p.waitForTimeout(350);
    const m = await p.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const stepper = document.querySelector('[aria-label="Registration progress"]');
      const steps = stepper ? [...stepper.querySelectorAll("button")] : [];
      const out = steps.filter((b) => { const r = b.getBoundingClientRect(); return r.left < -0.5 || r.right > vw + 0.5; }).length;
      return { sw: document.documentElement.scrollWidth, vw, steps: steps.length, clipped: out, mobileProgress: !!document.querySelector("[role=progressbar]") };
    });
    if (m.sw > m.vw + 1) bad.push(`${w}px: scrollWidth ${m.sw}`);
    if (m.steps > 0 && (m.steps !== 6 || m.clipped)) bad.push(`${w}px: stepper buttons=${m.steps} clipped=${m.clipped}`);
    if (!m.mobileProgress) bad.push(`${w}px: no progress indicator`);
  }
  if (bad.length) throw new Error(bad.join("; "));
  return `no overflow at ${WIDTHS.join(",")}`;
});

await t("P4.2", "Wizard last step (review) and footer fit at 390/768/1366 with sample data", async (p) => {
  await loginAs(p, "seller");
  const bad = [];
  for (const w of [390, 768, 1366]) {
    await p.setViewportSize({ width: w, height: 900 });
    await p.goto(`${BASE}/seller/assets/new`);
    await p.getByRole("button", { name: /Fill sample data/ }).click();
    for (let i = 0; i < 5; i++) {
      await p.getByRole("button", { name: /Save & Continue/ }).click();
      await p.waitForTimeout(200);
      const m = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, vw: document.documentElement.clientWidth }));
      if (m.sw > m.vw + 1) bad.push(`${w}px step ${i + 2}: scrollWidth ${m.sw}`);
    }
  }
  if (bad.length) throw new Error(bad.join("; "));
});

/** Returns overlaps between the Demo control and visible primary actions. */
async function overlaps(p, extraSelector = "") {
  return p.evaluate((extra) => {
    const demo = document.querySelector('button[aria-label="Open demo controls"]');
    if (!demo) return ["no demo control"];
    const d = demo.getBoundingClientRect();
    const hits = [];
    const re = extra ? new RegExp(extra) : null;
    const nodes = [...document.querySelectorAll("[data-demo-avoid]"), ...(re ? [...document.querySelectorAll("button")].filter((b) => re.test((b.textContent || "").trim())) : [])];
    for (const n of nodes) {
      const r = n.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || r.bottom < 0 || r.top > innerHeight) continue;
      const w = Math.min(d.right, r.right) - Math.max(d.left, r.left);
      const h = Math.min(d.bottom, r.bottom) - Math.max(d.top, r.top);
      if (w > 0 && h > 0) hits.push(`${(n.textContent || n.getAttribute("aria-label") || "").trim().slice(0, 24)} ${Math.round(w)}x${Math.round(h)}`);
    }
    return hits;
  }, extraSelector);
}
async function sweep(p, extra) {
  const hits = [];
  const total = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= total; y += 90) {
    await p.evaluate((yy) => window.scrollTo(0, yy), y);
    await p.waitForTimeout(90);
    hits.push(...(await overlaps(p, extra)).map((h) => `y=${y}: ${h}`));
  }
  return hits;
}

await t("P4.3", "Demo control never covers Invest Now on the public asset page (390/768/1366, whole scroll range)", async (p) => {
  await scenarioSetup(p, "Published");
  await switchRole(p, "Investor");
  const bad = [];
  for (const w of [390, 768, 1024, 1366]) {
    await p.setViewportSize({ width: w, height: w < 700 ? 844 : 1024 });
    await p.goto(`${BASE}/marketplace/vietnam-robusta-coffee`);
    await p.waitForTimeout(600);
    bad.push(...(await sweep(p, "Invest Now")).filter((h) => /Invest Now/i.test(h)).map((h) => `${w}px ${h}`));
  }
  if (bad.length) throw new Error(bad.slice(0, 5).join("; "));
});

await t("P4.4", "Demo control never covers Suspend/Reactivate, wizard actions or approval actions", async (p) => {
  await loginAs(p, "admin");
  const bad = [];
  for (const w of [390, 768, 1366]) {
    await p.setViewportSize({ width: w, height: w < 700 ? 844 : 900 });
    await p.goto(`${BASE}/admin/users`);
    await p.waitForTimeout(500);
    bad.push(...(await sweep(p)).map((h) => `users ${w}px ${h}`));
  }
  await scenario(p, "Pending Approval");
  for (const w of [390, 768, 1366]) {
    await p.setViewportSize({ width: w, height: 900 });
    await p.goto(`${BASE}/admin/approvals/VN-CF-001`);
    await p.waitForTimeout(500);
    bad.push(...(await sweep(p)).map((h) => `approval ${w}px ${h}`));
  }
  await switchRole(p, "Seller");
  for (const w of [390, 768, 1366]) {
    await p.setViewportSize({ width: w, height: 900 });
    await p.goto(`${BASE}/seller/assets/new`);
    await p.waitForTimeout(500);
    bad.push(...(await sweep(p, "^(Save & Continue|Back|Submit for Approval)$")).map((h) => `wizard ${w}px ${h}`));
  }
  if (bad.length) throw new Error(bad.slice(0, 6).join("; "));
});

await t("P4.5", "Demo control stays compact and its menu still opens and works after it moves", async (p) => {
  await scenarioSetup(p, "Published");
  await p.setViewportSize({ width: 768, height: 1024 });
  await p.goto(`${BASE}/marketplace/vietnam-robusta-coffee`);
  await p.waitForTimeout(500);
  const box = await p.getByRole("button", { name: "Open demo controls" }).boundingBox();
  ok(box.width < 90 && box.height <= 36, `control not compact: ${box.width}x${box.height}`);
  await switchRole(p, "Investor");
  await p.waitForURL(/investor\/dashboard/);
});

/* ================================== P5 ================================== */
async function sellerSubmitsAndAdminRequestsChanges(p) {
  await loginAs(p, "seller");
  await p.goto(`${BASE}/seller/assets/new`);
  await p.getByRole("button", { name: /Fill sample data/ }).click();
  for (let i = 0; i < 5; i++) {
    await p.getByRole("button", { name: /Save & Continue/ }).click();
    await p.waitForTimeout(200);
  }
  await p.locator("input[type=checkbox]").first().check();
  await p.getByRole("button", { name: /Submit for Approval/ }).click();
  await p.getByText(/Submitted for approval/i).first().waitFor();
  await switchRole(p, "Admin");
  await p.goto(`${BASE}/admin/approvals/VN-CF-001`);
  await p.getByRole("button", { name: /Request Changes/ }).click();
  await p.locator("#review-note").fill("Please lower the financing target to $300,000 and replace the survey map.");
  await p.getByRole("button", { name: /Send request/ }).click();
  await p.getByText("Changes requested").first().waitFor();
  await switchRole(p, "Seller");
}

await t("P5.1", "Request Changes → seller edits fields and replaces a document → resubmits → admin approves → investable", async (p) => {
  await sellerSubmitsAndAdminRequestsChanges(p);
  await p.goto(`${BASE}/seller/assets/VN-CF-001`);
  ok(/Please lower the financing target/.test(await body(p)), "request not shown to seller");
  await p.getByRole("link", { name: /Edit details/ }).click();
  await p.waitForURL(/\/seller\/assets\/VN-CF-001\/edit/);
  eq(await p.locator("#edit-name").inputValue(), "Vietnam Robusta Coffee", "name prefilled");
  eq(num(await p.locator("#edit-target").inputValue()), 350_000, "target prefilled");

  // invalid edit first: nothing saved, value kept, error next to the field
  await p.locator("#edit-target").fill("600000");
  await p.getByRole("button", { name: /Save & resubmit/ }).click();
  ok(/cannot exceed/i.test(await p.locator("#edit-target-error").innerText()), "target > value not flagged");
  eq(num(await p.locator("#edit-target").inputValue()), 600_000, "invalid value kept visible");
  eq((await store(p)).assets.find((a) => a.id === "VN-CF-001").status, "changes_requested", "status changed by invalid edit");

  await p.locator("#edit-target").fill("300,000");
  await p.getByRole("button", { name: /Remove Boundary-Survey-Map.pdf/ }).click();
  await p.locator("#edit-docs").setInputFiles({ name: "Boundary-Survey-Map-v2.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 test") });
  await p.getByRole("button", { name: /Save & resubmit/ }).click();
  await p.waitForURL(/\/seller\/assets\/VN-CF-001$/);
  const a = (await store(p)).assets.find((x) => x.id === "VN-CF-001");
  eq(a.status, "pending_review", "status");
  eq(a.targetUsd, 300_000, "target saved");
  ok(a.uploads.some((u) => u.name === "Boundary-Survey-Map-v2.pdf"), "new document missing");
  ok(!a.uploads.some((u) => u.name === "Boundary-Survey-Map.pdf"), "old document still attached");
  ok(a.uploads.some((u) => u.name === "Land-Use-Right-Certificate.pdf"), "unchanged document lost");
  eq(a.name, "Vietnam Robusta Coffee", "unchanged name preserved");
  eq(a.reviewHistory.map((e) => e.kind).join(","), "changes_requested,resubmitted", "history");
  ok(/Review history/.test(await body(p)), "history card missing for seller");

  // not investable while pending
  await switchRole(p, "Investor");
  await p.goto(`${BASE}/investor/marketplace/vietnam-robusta-coffee`);
  await p.waitForTimeout(500);
  eq(await p.getByRole("button", { name: /Invest Now/ }).count(), 0, "pending asset is investable");

  // admin sees the corrected data and history, approves
  await switchRole(p, "Admin");
  await p.goto(`${BASE}/admin/approvals/VN-CF-001`);
  const adminView = await body(p);
  ok(/\$300,000/.test(adminView), "admin does not see corrected target");
  ok(/Review history/.test(adminView) && /Changed: .*Financing target/.test(adminView), "admin does not see change summary");
  await p.getByRole("button", { name: /^Approve/ }).first().click();
  await p.locator("[role=dialog]").getByRole("button", { name: /^Approve/ }).click();
  await p.waitForTimeout(500);
  eq((await store(p)).assets.find((x) => x.id === "VN-CF-001").status, "published", "approved");
  await switchRole(p, "Investor");
  await p.goto(`${BASE}/investor/marketplace/vietnam-robusta-coffee`);
  await p.getByRole("button", { name: /Invest Now/ }).first().click();
  await p.locator("#invest-amount").fill("1000");
  await p.getByRole("button", { name: /Review investment/ }).click();
  await p.getByRole("checkbox").check();
  await p.getByRole("button", { name: /Confirm \$1,000/ }).click();
  await p.getByText("Investment confirmed").first().waitFor();
});

await t("P5.2", "Edit route guards: other statuses, other sellers, other roles, signed out", async (p) => {
  await sellerSubmitsAndAdminRequestsChanges(p);
  const edit = `${BASE}/seller/assets/VN-CF-001/edit`;
  // changes_requested + owner → form
  await p.goto(edit);
  await p.locator("#edit-name").waitFor();
  // another seller
  const s = await store(p);
  s.users.push({ id: "u-s9", name: "Other Seller", email: "other@example.com", role: "seller", org: "Other Co.", status: "Active", kyc: "Simulated: pending", joined: new Date().toISOString() });
  s.session = { userId: "u-s9", role: "seller", name: "Other Seller", email: "other@example.com" };
  await p.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [KEY, s]);
  await p.goto(edit);
  await p.getByText("Asset not found").waitFor();
  eq(await p.locator("#edit-name").count(), 0, "another seller sees the edit form");
  // investor and admin are redirected to their own workspace
  await switchRoleStorage(p, "investor");
  await p.goto(edit);
  await p.waitForURL(/\/investor\/dashboard/);
  await switchRoleStorage(p, "admin");
  await p.goto(edit);
  await p.waitForURL(/\/admin\/dashboard/);
  // signed out
  await p.evaluate(([k]) => { const v = JSON.parse(localStorage.getItem(k)); v.session = null; localStorage.setItem(k, JSON.stringify(v)); }, [KEY]);
  await p.goto(edit);
  await p.waitForURL(/\/auth\/login/);
  // pending_review, published
  await switchRoleStorage(p, "seller");
  await p.evaluate(([k]) => { const v = JSON.parse(localStorage.getItem(k)); v.assets = v.assets.map((a) => (a.id === "VN-CF-001" ? { ...a, status: "pending_review" } : a)); localStorage.setItem(k, JSON.stringify(v)); }, [KEY]);
  await p.goto(edit);
  await p.getByText("Editing is not available").waitFor();
  await p.evaluate(([k]) => { const v = JSON.parse(localStorage.getItem(k)); v.assets = v.assets.map((a) => (a.id === "VN-CF-001" ? { ...a, status: "published" } : a)); localStorage.setItem(k, JSON.stringify(v)); }, [KEY]);
  await p.goto(edit);
  await p.getByText("Editing is not available").waitFor();
  await p.evaluate(([k]) => { const v = JSON.parse(localStorage.getItem(k)); v.assets = v.assets.map((a) => (a.id === "VN-CF-001" ? { ...a, status: "rejected" } : a)); localStorage.setItem(k, JSON.stringify(v)); }, [KEY]);
  await p.goto(edit);
  await p.getByText("Editing is not available").waitFor();
  // unknown asset
  await p.goto(`${BASE}/seller/assets/XX-ZZ-999/edit`);
  await p.getByText("Asset not found").waitFor();
});
async function switchRoleStorage(p, role) {
  const names = { investor: ["u-investor", "Tran Duc Minh", "investor@agrix.demo"], seller: ["u-seller", "Linh Nguyen", "seller@agrix.demo"], admin: ["u-admin", "Admin Operator", "admin@agrix.demo"] };
  await p.evaluate(([k, r, n]) => { const v = JSON.parse(localStorage.getItem(k)); v.session = { userId: n[0], role: r, name: n[1], email: n[2] }; localStorage.setItem(k, JSON.stringify(v)); }, [KEY, role, names[role]]);
}

await t("P5.3", "Rejected asset stays hidden, non-investable and not editable via the UI", async (p) => {
  await loginAs(p, "admin");
  await scenario(p, "Pending Approval");
  await p.goto(`${BASE}/admin/approvals/VN-CF-001`);
  await p.getByRole("button", { name: /^Reject/ }).first().click();
  await p.locator("#review-note").fill("Documents do not match the registry.");
  await p.locator("[role=dialog]").getByRole("button", { name: /^Reject/ }).click();
  await p.waitForTimeout(500);
  await switchRole(p, "Seller");
  await p.goto(`${BASE}/seller/assets/VN-CF-001`);
  await p.waitForTimeout(400);
  eq(await p.getByRole("link", { name: /Edit details/ }).count(), 0, "edit link on rejected asset");
  eq(await p.getByRole("button", { name: /Resubmit/ }).count(), 0, "resubmit on rejected asset");
  await p.goto(`${BASE}/seller/assets/VN-CF-001/edit`);
  await p.getByText("Editing is not available").waitFor();
  await switchRole(p, "Investor");
  await p.goto(`${BASE}/investor/marketplace`);
  await p.waitForTimeout(400);
  ok(!/Robusta/.test(await body(p)), "rejected asset listed");
  await p.goto(`${BASE}/investor/marketplace/vietnam-robusta-coffee`);
  await p.waitForTimeout(400);
  eq(await p.getByRole("button", { name: /Invest Now/ }).count(), 0, "rejected asset investable");
});

await t("P5.4", "Legacy one-click Resubmit (no edits) still works and records 'without changes'", async (p) => {
  await sellerSubmitsAndAdminRequestsChanges(p);
  await p.goto(`${BASE}/seller/assets/VN-CF-001`);
  await p.getByRole("button", { name: /Resubmit for review/ }).click();
  await p.waitForTimeout(500);
  const a = (await store(p)).assets.find((x) => x.id === "VN-CF-001");
  eq(a.status, "pending_review", "status");
  eq(a.reviewHistory.at(-1).note, "Resubmitted without changes.", "history note");
});

await br.close();
const pass = results.filter((r) => r.status === "PASS").length;
console.log(`\n${pass}/${results.length} passed, ${results.length - pass} failed`);
fs.writeFileSync(process.env.OUT || "fixes-results.json", JSON.stringify(results, null, 1));
process.exit(pass === results.length ? 0 : 1);
