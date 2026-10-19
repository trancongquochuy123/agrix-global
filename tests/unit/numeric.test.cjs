const test = require("node:test");
const assert = require("node:assert/strict");
const out = globalThis.__UNIT_OUT__;
const { parseWholeUsd, parseQuantity, parseCoordinate, MAX_AREA_HA } = require(`${out}/lib/numeric.js`);
const { numbers, validateStep, initialData } = require(`${out}/components/assets/formModel.js`);

const bad = (r, reason) => {
  assert.equal(r.ok, false, JSON.stringify(r));
  if (reason) assert.equal(r.reason, reason);
};

test("investment amounts: valid whole dollars", () => {
  for (const [raw, v] of [["1000", 1000], ["10000", 10000], ["10,000", 10000], ["12,345,678", 12345678], [" 1000 ", 1000], ["350000", 350000]]) {
    assert.deepEqual(parseWholeUsd(raw), { ok: true, value: v }, raw);
  }
});

test("investment amounts: the audited inputs are rejected, never reinterpreted", () => {
  bad(parseWholeUsd("1,000.50"), "fractional"); // used to become $100,050
  bad(parseWholeUsd("1000.9"), "fractional"); // used to become $10,009
  bad(parseWholeUsd("1000.50"), "fractional");
  bad(parseWholeUsd("-5000"), "negative"); // used to become $5,000
  bad(parseWholeUsd("1e3"), "scientific"); // used to become 13
  bad(parseWholeUsd("1E3"), "scientific");
  bad(parseWholeUsd("abc"), "malformed");
  bad(parseWholeUsd("10k"), "malformed");
  bad(parseWholeUsd(""), "empty");
  bad(parseWholeUsd("   "), "empty");
  bad(parseWholeUsd("1,00"), "malformed");
  bad(parseWholeUsd("1,0000"), "malformed");
  bad(parseWholeUsd("1 000"), "malformed");
  bad(parseWholeUsd("$1000"), "malformed");
  bad(parseWholeUsd("+1000"), "malformed");
  bad(parseWholeUsd("0x10"), "malformed");
  bad(parseWholeUsd("Infinity"), "malformed");
  bad(parseWholeUsd("NaN"), "malformed");
  bad(parseWholeUsd("-"), "malformed");
  bad(parseWholeUsd("9".repeat(30)), "too_large");
});

test("zero parses (callers enforce the minimum) but a negative zero never leaks", () => {
  assert.deepEqual(parseWholeUsd("0"), { ok: true, value: 0 });
  bad(parseWholeUsd("-0"), "negative");
});

test("quantities keep valid decimals and enforce precision", () => {
  assert.deepEqual(parseQuantity("125.6"), { ok: true, value: 125.6 });
  assert.deepEqual(parseQuantity("0.25"), { ok: true, value: 0.25 });
  bad(parseQuantity("1.234"), "too_many_decimals");
  bad(parseQuantity("-1"), "negative");
  bad(parseQuantity("1e9"), "scientific");
  bad(parseQuantity(".5"), "malformed");
});

test("coordinates may be negative but not malformed", () => {
  assert.deepEqual(parseCoordinate("-12.5504"), { ok: true, value: -12.5504 });
  assert.deepEqual(parseCoordinate("108.2417"), { ok: true, value: 108.2417 });
  bad(parseCoordinate(""), "empty");
  bad(parseCoordinate("1e1"), "scientific");
  bad(parseCoordinate("12,5"), "malformed");
});

test("wizard fields: area, value and target", () => {
  assert.equal(numbers.totalArea("40").ok, true);
  assert.equal(numbers.totalArea(String(MAX_AREA_HA)).ok, true);
  assert.equal(numbers.totalArea(String(MAX_AREA_HA + 1)).ok, false);
  assert.equal(numbers.totalArea("1e9").ok, false);
  assert.equal(numbers.totalArea("1000000000").ok, false);
  assert.equal(numbers.totalArea("0").ok, false);
  assert.equal(numbers.totalArea("-5").ok, false);
  assert.equal(numbers.estimatedValue("-500").ok, false); // used to become 500
  assert.match(numbers.estimatedValue("-500").error, /negative/i);
  assert.equal(numbers.estimatedValue("500,000").ok, true);
  assert.equal(numbers.estimatedValue("500000.5").ok, false);
  assert.equal(numbers.financingTarget("0").ok, false);
});

const valid = {
  ...initialData,
  assetName: "Vietnam Robusta Coffee",
  estimatedValue: "500,000",
  totalArea: "40",
  ownerName: "Linh Nguyen",
  certificateNumber: "LURC-DL-2014-0412",
  issueDate: "2014-06-18",
  annualProduction: "120",
  historicalYield: "3.1",
  irrigation: "Drip irrigation",
  harvestSeason: "Oct – Dec",
  operatingCosts: "180000",
  expectedRevenue: "560000",
  financingTarget: "350000",
  termMonths: "6",
  expectedReturn: "8",
  description: "Working capital for the upcoming Robusta harvest.",
};

test("validateStep: valid data passes every numeric step", () => {
  for (const s of [0, 1, 2, 3, 4]) assert.deepEqual(validateStep(s, valid), {}, `step ${s}`);
});

test("validateStep blocks progression on each invalid numeric field", () => {
  assert.ok(validateStep(0, { ...valid, estimatedValue: "-500" }).estimatedValue);
  assert.ok(validateStep(0, { ...valid, totalArea: "1e9" }).totalArea);
  assert.ok(validateStep(0, { ...valid, totalArea: "abc" }).totalArea);
  assert.ok(validateStep(2, { ...valid, latitude: "" }).latitude);
  assert.ok(validateStep(2, { ...valid, latitude: "91" }).latitude);
  assert.ok(validateStep(2, { ...valid, longitude: "1e2" }).longitude);
  assert.ok(validateStep(3, { ...valid, annualProduction: "-1" }).annualProduction);
  assert.ok(validateStep(3, { ...valid, historicalYield: "0" }).historicalYield);
  assert.ok(validateStep(3, { ...valid, operatingCosts: "1e5" }).operatingCosts);
  assert.ok(validateStep(4, { ...valid, financingTarget: "600000" }).financingTarget); // above asset value
  assert.ok(validateStep(4, { ...valid, financingTarget: "-1" }).financingTarget);
  assert.ok(validateStep(4, { ...valid, termMonths: "0" }).termMonths);
  assert.ok(validateStep(4, { ...valid, termMonths: "37" }).termMonths);
  assert.ok(validateStep(4, { ...valid, termMonths: "6.5" }).termMonths);
  assert.ok(validateStep(4, { ...valid, expectedReturn: "31" }).expectedReturn);
  assert.ok(validateStep(4, { ...valid, expectedReturn: "0" }).expectedReturn);
  assert.ok(validateStep(4, { ...valid, expectedReturn: "8e0" }).expectedReturn);
});
