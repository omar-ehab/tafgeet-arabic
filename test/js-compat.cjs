// Plain-CommonJS smoke test.
//
// This file is deliberately NOT TypeScript. Its purpose is to verify
// that the published package works for vanilla JS consumers — exactly
// as a user would `require()` it from a Node.js project with no TS.
//
// Run with: node test/js-compat.cjs
// (Not part of the mocha test suite; runs against dist/ directly.)

const assert = require('node:assert/strict');
// Resolves via the package's `exports` map → `./dist/index.cjs`
const { Tafgeet } = require('../dist/index.cjs');

// --- Smoke: basic require + parse works ----------------------------------
assert.equal(typeof Tafgeet, 'function', 'Tafgeet should be a constructor function');

// --- Smoke: integer amounts ------------------------------------------------
assert.equal(new Tafgeet('1').parse(), 'جنيه مصري واحد فقط لا غير', '1 EGP');
assert.equal(
  new Tafgeet('1234567').parse(),
  'مليون ومائتان وأربعة وثلاثون ألف وخمسمائة وسبعة وستون جنيه مصري فقط لا غير',
  '1,234,567 EGP',
);

// --- Smoke: fractional amounts (issue #11 regression) --------------------
assert.equal(
  new Tafgeet('1.05').parse(),
  'جنيه مصري واحد وخمسة قروش فقط لا غير',
  '1.05 EGP — fraction in 3-10 should be plural',
);

// --- Smoke: explicit currency --------------------------------------------
assert.equal(
  new Tafgeet('1.001', 'KWD').parse(),
  'دينار كويتي واحد وفلس واحد فقط لا غير',
  '1.001 KWD (3-decimal currency)',
);

// --- Smoke: issue #7/#8 fix is in published build ------------------------
assert.equal(
  new Tafgeet('1100000', 'SAR').parse(),
  'مليون ومائة ألف ريال سعودي فقط لا غير',
  '1,100,000 SAR — connector preserved (issues #7/#8)',
);

// --- Smoke: numeric input (not just string) ------------------------------
assert.equal(new Tafgeet(44).parse(), 'أربعة وأربعون جنيه مصري فقط لا غير', '44 EGP (number input)');

// --- Smoke: a v1.3 currency is reachable through the published build ------
assert.equal(new Tafgeet('1.50', 'EUR').parse(), 'يورو واحد وخمسون سنت فقط لا غير', '1.50 EUR (v1.3 currency)');

// --- Smoke: input validation throws cleanly for JS callers ---------------
assert.throws(() => new Tafgeet(null), TypeError, 'null amount throws TypeError');
assert.throws(() => new Tafgeet(undefined), TypeError, 'undefined amount throws TypeError');
assert.throws(() => new Tafgeet('abc'), TypeError, 'non-numeric string throws TypeError');
assert.throws(() => new Tafgeet(-5), RangeError, 'negative amount throws RangeError');
assert.throws(() => new Tafgeet(NaN), RangeError, 'NaN throws RangeError');
assert.throws(() => new Tafgeet(1, 'XYZ'), Error, 'unknown currency throws Error');

// --- Smoke: read() helper is publicly accessible -------------------------
const t = new Tafgeet('1');
assert.equal(t.read(42), 'اثنان وأربعون', 'read() helper renders 0-999');

console.log('✓ JS (CJS) compatibility smoke test: ALL PASSED');
console.log("  Loaded via: require('../dist/index.cjs')");
console.log('  Exercised: parse() / validation / read() / number input');
console.log('  Currencies: EGP, SAR, KWD, EUR');
