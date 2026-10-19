const test = require("node:test");
const assert = require("node:assert/strict");
const out = globalThis.__UNIT_OUT__;
const { translate } = require(`${out}/lib/i18n/core.js`);
const { VI } = require(`${out}/lib/i18n/vi.js`);
const store = require(`${out}/lib/demo/store.js`);

const vi = (s, vars) => translate("vi", s, vars);

test("English is returned unchanged, with placeholders filled", () => {
  assert.equal(translate("en", "Log in"), "Log in");
  assert.equal(translate("en", "{n} months", { n: 6 }), "6 months");
});

test("exact keys and templates translate to Vietnamese", () => {
  assert.equal(vi("Log in"), "Đăng nhập");
  assert.equal(vi("{n} months", { n: 6 }), "6 tháng");
  assert.equal(vi("Welcome back, {name}", { name: "Minh" }), "Chào mừng trở lại, Minh");
});

test("unknown text falls back to the original", () => {
  assert.equal(vi("Kwame Mensah"), "Kwame Mensah");
  assert.equal(vi(""), "");
});

test("stored English messages are recognised as patterns, with captured names translated", () => {
  assert.equal(vi("Vietnamese Rice is published"), "Lúa gạo Việt Nam đã được đăng");
  assert.equal(vi("Only $350,000 remains to be funded."), "Chỉ còn $350,000 cần huy động.");
  assert.equal(vi("Updated asset details (Asset name, Area)"), "Cập nhật thông tin tài sản (Tên tài sản, Diện tích)");
  assert.equal(vi("Lam Dong, Vietnam"), "Lâm Đồng, Việt Nam");
});

test("English dates from seed data follow Vietnamese formatting", () => {
  assert.equal(vi("Feb 6, 2024"), "6 thg 2, 2024");
  assert.equal(vi("Jul 2026"), "Th7 2026");
});

test("every store error and validation message has a Vietnamese rendering", () => {
  const msgs = [
    store.SUSPENDED_MESSAGE,
    "No demo account uses this email. Pick one of the demo accounts below.",
    "Enter a whole number of months between 1 and 36.",
    "Enter an illustrative return between 0.1% and 30%.",
    "Minimum investment is $1,000.",
    "Scientific notation is not supported. Enter an investment amount as a plain number.",
    "An investment amount cannot be negative.",
  ];
  for (const m of msgs) assert.notEqual(vi(m), m, m);
});

test("dictionary values keep every placeholder of their key", () => {
  for (const [k, v] of Object.entries(VI)) {
    const names = (s) => (s.match(/\{\w+\}/g) || []).sort().join(",");
    assert.equal(names(v), names(k), k);
  }
});
