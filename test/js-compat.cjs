// Plain-CommonJS smoke test.
//
// This file is deliberately NOT TypeScript. Its purpose is to verify
// that the published package works for vanilla JS consumers — exactly
// as a user would `require()` it from a Node.js project with no TS.
//
// Run with: node test/js-compat.cjs
// (Not part of the mocha test suite; runs against dist/ directly.)

const assert = require('node:assert/strict');
const { Tafgeet } = require('../dist/src/index.js');

// --- Smoke: basic require + parse works ----------------------------------
assert.equal(typeof Tafgeet, 'function', 'Tafgeet should be a constructor function');

// --- Smoke: integer amounts ------------------------------------------------
assert.equal(
  new Tafgeet('1').parse(),
  'واحد جنيه مصري فقط لا غير',
  '1 EGP',
);
assert.equal(
  new Tafgeet('1234567').parse(),
  'مليون ومائتين وأربعة وثلاثون ألف وخمسمائة وسبعة وستون جنيه مصري فقط لا غير',
  '1,234,567 EGP',
);

// --- Smoke: fractional amounts (issue #11 regression) --------------------
assert.equal(
  new Tafgeet('1.05').parse(),
  'واحد جنيه مصري وخمسة قروش فقط لا غير',
  '1.05 EGP — fraction in 3-10 should be plural',
);

// --- Smoke: explicit currency --------------------------------------------
assert.equal(
  new Tafgeet('1.001', 'KWD').parse(),
  'واحد دينار كويتي وواحد فلس فقط لا غير',
  '1.001 KWD (3-decimal currency)',
);

// --- Smoke: issue #7/#8 fix is in published build ------------------------
assert.equal(
  new Tafgeet('1100000', 'SAR').parse(),
  'مليون ومائة ألف ريال سعودي فقط لا غير',
  '1,100,000 SAR — connector preserved (issues #7/#8)',
);

// --- Smoke: numeric input (not just string) ------------------------------
assert.equal(
  new Tafgeet(44).parse(),
  'أربعة وأربعون جنيه مصري فقط لا غير',
  '44 EGP (number input)',
);

// --- Smoke: input validation throws cleanly for JS callers ---------------
assert.throws(() => new Tafgeet(null), TypeError, 'null amount throws TypeError');
assert.throws(() => new Tafgeet(undefined), TypeError, 'undefined amount throws TypeError');
assert.throws(() => new Tafgeet('abc'), TypeError, 'non-numeric string throws TypeError');
assert.throws(() => new Tafgeet(-5), RangeError, 'negative amount throws RangeError');
assert.throws(() => new Tafgeet(NaN), RangeError, 'NaN throws RangeError');
assert.throws(() => new Tafgeet(1, 'XYZ'), Error, 'unknown currency throws Error');

// --- Smoke: read() helper is publicly accessible -------------------------
const t = new Tafgeet('1');
assert.equal(t.read(42), 'ٱثنين وأربعون', 'read() helper renders 0-999');

console.log('✓ JS compatibility smoke test: ALL PASSED');
console.log('  Exercised: require() / parse() / validation / read() / number input');
console.log('  Currencies: EGP, SAR, KWD');
