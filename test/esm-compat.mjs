// Plain-ESM smoke test.
//
// Mirrors test/js-compat.cjs but for the ESM build. Verifies that
// `import { Tafgeet } from 'tafgeet-arabic'` works as a real ESM
// consumer would experience it — exact same assertions, different
// module system.
//
// Run with: node test/esm-compat.mjs
// (Not part of the mocha test suite; runs against dist/index.mjs directly.)

import assert from 'node:assert/strict';
// Resolves via the package's `exports` map → `./dist/index.mjs`
import { Tafgeet } from '../dist/index.mjs';

// --- Smoke: basic import works -------------------------------------------
assert.equal(typeof Tafgeet, 'function', 'Tafgeet should be a constructor function');

// --- Smoke: integer amounts ------------------------------------------------
assert.equal(new Tafgeet('1').parse(), 'جنيه مصري واحد فقط لا غير', '1 EGP');
assert.equal(
  new Tafgeet('1234567').parse(),
  'مليون ومائتان وأربعة وثلاثون ألف وخمسمائة وسبعة وستون جنيه مصري فقط لا غير',
  '1,234,567 EGP',
);

// --- Smoke: fractional amounts -------------------------------------------
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

// --- Smoke: numeric input ------------------------------------------------
assert.equal(new Tafgeet(44).parse(), 'أربعة وأربعون جنيه مصري فقط لا غير', '44 EGP (number input)');

// --- Smoke: a v1.3 currency is reachable through the published build ------
assert.equal(new Tafgeet('1.50', 'EUR').parse(), 'يورو واحد وخمسون سنت فقط لا غير', '1.50 EUR (v1.3 currency)');

// --- Smoke: input validation throws cleanly ------------------------------
assert.throws(() => new Tafgeet(null), TypeError, 'null amount throws TypeError');
assert.throws(() => new Tafgeet(undefined), TypeError, 'undefined amount throws TypeError');
assert.throws(() => new Tafgeet('abc'), TypeError, 'non-numeric string throws TypeError');
assert.throws(() => new Tafgeet(-5), RangeError, 'negative amount throws RangeError');
assert.throws(() => new Tafgeet(NaN), RangeError, 'NaN throws RangeError');
assert.throws(() => new Tafgeet(1, 'XYZ'), Error, 'unknown currency throws Error');

// --- Smoke: read() helper ------------------------------------------------
const t = new Tafgeet('1');
assert.equal(t.read(42), 'اثنان وأربعون', 'read() helper renders 0-999');

console.log('✓ ESM compatibility smoke test: ALL PASSED');
console.log("  Loaded via: import { Tafgeet } from '../dist/index.mjs'");
console.log('  Exercised: parse() / validation / read() / number input');
console.log('  Currencies: EGP, SAR, KWD, EUR');
