# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] – 2026-05-29

A native-speaker Arabic-grammar pass. The default output is now grammatically
correct Modern Standard Arabic (فصحى), undiacritized (no tashkīl), with full
gender agreement and correct counted-noun forms.

**This release deliberately changes output for many inputs.** Per the project's
established stance, fixing grammatically wrong Arabic is not treated as a
breaking change — but if you pinned exact output strings in your own tests,
they will need updating. The public API is unchanged: no new methods, no new
options. Gender is derived from each built-in currency, never configured.

### Changed (output)

- **Gender agreement (العدد والمعدود).** The number now agrees with the noun it
  counts. For 3–10 it takes the opposite gender; feminine currencies and
  fractional units get the correct forms:
  - `ثلاث ليرات تركية` (was `ثلاثة ليرات…`) — feminine `ليرة`.
  - `ثلاث هللات` / `خمس بيسات` — feminine fraction units `هللة` / `بيسة`.
  - feminine teens too: `إحدى عشرة ليرة`, `ثلاث عشرة ليرة`.
- **1 and 2 use the classical forms.**
  - `1 → noun + واحد/واحدة`: `جنيه مصري واحد`, `ليرة تركية واحدة` (was `واحد جنيه مصري`).
  - `2 → the dual noun`: `جنيهان مصريان`, `ليرتان تركيتان` (was `ٱثنين جنيه مصري`).
- **Noun form now follows the governing number**, fixing compound amounts:
  - `103 → مائة وثلاثة جنيهات` (plural), `1,000,003 → مليون وثلاثة جنيهات`.
  - fraction `0.205 → …ومائتان وخمسة فلوس` (plural).
- **Broken plural for 10 of a scale word**: `10,000 → عشرة آلاف` (was `عشرة ألف`),
  `10,000,000 → عشرة ملايين`.
- **Duals are nominative and drop the nūn when مضاف** to the counted noun:
  `200 → مائتا جنيه`, `2,000 → ألفا جنيه`, `2,000,000 → مليونا جنيه`. Standalone
  (no-currency) duals keep the nūn: `مائتان`, `ألفان`, `اثنان`.

### Fixed (spelling)

- `ٱثنين` → `اثنان` (was written with a waṣla alif).
- `أثني عشر` → `اثنا عشر`.
- `ألآف` → `آلاف`.
- `درهم أماراتي` → `درهم إماراتي` (AED).
- `ترليون` → `تريليون`.

### Internal

- Number dictionaries gained feminine variants (`ONES_F`, `TEENS_F`); the
  gender + dual forms each currency needs live on an internal `CurrencyEntry`
  type, so the **public `Currency` type and the rest of the exported API are
  unchanged** (no type-level breaking change).
- Snapshot matrix expanded to exercise the masculine/feminine split
  exhaustively (added a feminine currency sweep + feminine-fraction cases);
  ~726 snapshot entries. New `test/grammar.spec.ts` pins the canonical forms.
- Extracted the pure number→words engine into `src/render.ts`; the `Tafgeet`
  class now owns only input parsing/validation and the public API.
- Removed the stale `tslint.json` (unused since the v1.1 move to ESLint 9).

### Compatibility note for callers

Output changes only reflect grammatical correctness — every change moves from
wrong (or less correct) Arabic to correct Arabic. If you have tests asserting
the old strings (e.g. `واحد جنيه مصري`, `عشرة ألف`, `ٱثنين`), update them.

## [1.3.0] – 2026-05-29

A coverage release. 14 new bundled currencies bring the total to 24 —
covering nearly all Arabic-speaking countries plus major international
currencies for cross-border invoicing.

No new APIs, no new options, no breaking changes. Every input that
worked in v1.2 produces byte-identical output here — verified by the
existing 262 snapshot assertions, all unchanged.

### Added

- **10 new Arab-region currencies:**
  - `BHD` — Bahraini Dinar (3 decimals)
  - `OMR` — Omani Rial (3 decimals)
  - `JOD` — Jordanian Dinar (3 decimals)
  - `IQD` — Iraqi Dinar (3 decimals)
  - `LYD` — Libyan Dinar (3 decimals)
  - `LBP` — Lebanese Pound (2 decimals)
  - `MAD` — Moroccan Dirham (2 decimals)
  - `DZD` — Algerian Dinar (2 decimals)
  - `SYP` — Syrian Pound (2 decimals)
  - `YER` — Yemeni Rial (2 decimals)
- **4 new major international currencies** (for cross-border invoicing):
  - `EUR` — Euro (2 decimals)
  - `GBP` — British Pound Sterling (2 decimals)
  - `CHF` — Swiss Franc (2 decimals)
  - `CAD` — Canadian Dollar (2 decimals)

The Arabic strings for the new currencies were researched from standard
sources; a native-speaker review of all 24 currency names is planned for
v1.4. Corrections welcome via issues/PRs.

### Changed

- Snapshot test matrix expanded to cover the new currencies (578 entries
  total, up from 262 — only additions, no existing row changed).
- `SUPPORTED_CURRENCIES` is now sorted alphabetically (was insertion
  order). The runtime contents are otherwise unchanged for the original
  10 codes.

## [1.2.1] – 2026-05-28

A patch release of correctness, hardening, and safety fixes. Eight distinct
bugs found across two audit passes. **No new APIs, no new options, no
breaking changes for any input that was previously correctly handled.**
Some previously-silent-failure inputs now throw clear typed errors instead.

### Fixed

- **Short fractions now correctly pad to currency precision** (real
  interpretation bug, was wrongly justified as "back-compat"):
  - `'1.5' EGP` before: `…وخمسة قروش` (5 piasters)
    → after: `…وخمسون قرش` (50 piasters)
  - `'1.20' TND` before: `…وعشرون مليم` (20 millimes)
    → after: `…ومائتين مليم` (200 millimes)
  - `'1.5' KWD` before: `…وخمسة فلوس` (5 fils)
    → after: `…وخمسمائة فلس` (500 fils)
  - Matches universal decimal interpretation — `.5` means half of the unit,
    not 5 of the smallest atomic unit.
- **Rounding can now carry from `<1` into `1`.** `new Tafgeet('0.999',
  'EGP', { rounding: 'round' })` used to throw `AmountOutOfRangeError`
  because integer-range validation ran BEFORE rounding had a chance to
  carry. Now correctly renders `'واحد جنيه مصري فقط لا غير'`. Validation
  was split into format-check (early) and integer-range-check (after
  rounding).
- **CRITICAL: number inputs that stringify in scientific notation no longer
  silently corrupt.** Pre-1.2.1, `Number.MAX_VALUE` (≈1.79×10³⁰⁸)
  rendered as `'1.79 EGP'`. Any number ≥ 1e21 or < 1e-6 (which JS
  stringifies as `'1e+21'`, etc.) silently slipped past the format
  regex because the regex was only applied to string inputs. Now throws
  `AmountOutOfRangeError` with a helpful "pass as string" hint.
  Affected magnitudes:
  - `1e+21` and larger numbers
  - `1e-7` and smaller numbers
  - `Number.MAX_VALUE`, `Number.MIN_VALUE`
- **No-currency mode rejects fractional input.** `new Tafgeet('1.50',
  '').parse()` previously silently dropped the `.50` and returned
  `'واحد فقط لا غير'`. Now throws `InvalidAmountError` with a message
  suggesting either an integer amount or a currency code. Lenient on
  all-zero fractions (`'1.0'`, `'1.00'`) for spreadsheet compatibility.
- **Currency argument is now trimmed** for consistency with the amount.
  `new Tafgeet('1', ' EGP ')` used to throw `UnsupportedCurrencyError`;
  now works. Whitespace-only currency trims to `''` (no-currency mode).
- **Options validation is now strict.** Pre-1.2.1, garbage in the third
  constructor argument was silently ignored or crashed with raw
  `TypeError`s:
  - `{ rounding: 'XYZ' }` silently truncated → now throws with valid mode list
  - `'string'`, `42`, `null`, arrays as options → silent/crash → now throws
  - `{ Rounding: 'round' }` (capital R typo) silently used default → now throws
  - `{ precision: 2 }` (option that doesn't exist yet) silently ignored → now throws
- **`read()` validates its input.** Previously `read(-1)`, `read(1.5)`,
  `read(1000)`, `read(NaN)`, `read('abc')` all silently returned `''`.
  Now throws `InvalidAmountError` (wrong type / non-integer) or
  `AmountOutOfRangeError` (outside 0..999). `read(0)` continues to
  return `''` as documented.
- **`parse()` re-validates internal state** (defense in depth against
  reflection-based mutation of `private` fields). Previously,
  `instance.digit = 0; instance.parse()` returned `' جنيه مصري فقط لا غير'`
  (broken). Same applied for currency mutation. Both now throw typed errors.

### Internal

- 90 new regression tests across all 8 fixes. Total test count:
  **555 passing** (was 465 at v1.2.0). Snapshot file unchanged.
- Each fix shipped as its own PR with focused diff and dedicated tests.

### Compatibility note for callers

The fixes change output behavior only for inputs that were previously
producing **wrong** output or **silently failing** — never for inputs
that were correctly handled. If you have existing tests that asserted
on outputs for `'1.5'`-style short fractions or numbers like
`Number.MAX_VALUE`, those tests were pinning bugs and need updating.

## [1.2.0] – 2026-05-28

A packaging, types, and ergonomics release. **No breaking API changes.**
Every input that worked in v1.1.0 produces byte-identical output here —
verified by 262 snapshot assertions covering the full currency × magnitude
matrix.

### Added

- **Dual ESM + CJS build via `tsup`.** Consumers using `import` get the
  `.mjs` entry; consumers using `require` get the `.cjs` entry. Bundlers
  (Vite, esbuild, webpack, Next.js, Rollup) auto-resolve via the
  `exports` map. `sideEffects: false` enables aggressive tree-shaking.
  Both entries verified via the new CJS + ESM smoke tests.
- **`CurrencyCode` union type** — `'EGP' | 'SAR' | … | 'TRY'`, derived
  from `keyof Currencies` so it stays in sync automatically:
  ```ts
  import type { CurrencyCode } from 'tafgeet-arabic';
  function quote(amount: number, code: CurrencyCode) { ... }
  ```
  IDE autocompletes all 10 codes; typos caught at compile time.
- **`CurrencyInput` type** — what the constructor's second argument
  accepts: `CurrencyCode | '' | (string & {})`. The `(string & {})`
  intersection preserves autocomplete while still permitting arbitrary
  strings (for codes coming from APIs the type system can't know
  about). Runtime validator still rejects unregistered codes.
- **`SUPPORTED_CURRENCIES`** — frozen runtime array of the 10 built-in
  codes. Useful for iteration / pre-validation:
  ```ts
  if (SUPPORTED_CURRENCIES.includes(userInput as CurrencyCode)) { ... }
  ```
- **Arabic-Indic + thousands-separator input.** The constructor now
  accepts:
  - Arabic-Indic digits — `'١٢٣٤.٥٦'` (U+0660..U+0669)
  - Eastern Arabic-Indic — `'۱۲۳۴.۵۶'` (U+06F0..U+06F9, Farsi/Urdu)
  - Arabic decimal separator — `'1234٫56'` (U+066B)
  - Arabic thousands separator — `'1٬234'` (U+066C)
  - Comma thousands separator — `'1,234.56'` (English)
  - Underscore separator — `'1_234_567'` (JS numeric literal style)
  - Whitespace separators — `'1 234 567'` (plus NBSP, narrow NBSP,
    thin space — for pasted-from-word-processor input)
  - Any combination of the above.
- **Custom error classes with discriminated codes:**
  - `InvalidAmountError extends TypeError` (code `'INVALID_AMOUNT'`)
  - `AmountOutOfRangeError extends RangeError` (code `'AMOUNT_OUT_OF_RANGE'`)
  - `UnsupportedCurrencyError extends Error` (code `'UNSUPPORTED_CURRENCY'`)
  - `isTafgeetError(e): e is …` type-guard for catching any error from
    this package.
  - `TafgeetErrorCode` discriminated union of the codes.

  Every class extends its corresponding built-in, so every existing
  `instanceof TypeError` / `instanceof RangeError` pattern keeps working.
- **`rounding` constructor option** — third argument selects how
  over-precision decimals are handled:
  ```ts
  new Tafgeet('1.995', 'EGP', { rounding: 'round' }).parse();
  // → 'ٱثنين جنيه مصري فقط لا غير'   (rounds 1.995 → 2)
  ```
  Modes: `'truncate'` *(default — preserves v1.1 behavior)*, `'round'`,
  `'floor'`, `'ceil'`, `'bankers'` (IEEE 754 half-to-even).
  Rounding can carry into the integer part; all arithmetic is
  integer-only on string slices, no floating-point hazards.
- **`RoundingMode` and `TafgeetOptions` exported types** — structured
  for future expansion (`precision`, `feminine`, `accusative`, `style`
  planned for v1.3+ alongside the currency registry).

### Changed

- **Snapshot tests** added — 262 entries covering the full (currency ×
  magnitude) matrix. Any future PR that changes a parse() output must
  visibly modify `test/snapshots/parse.snap.json`. Foundation for safely
  adding grammar/style options later.
- **`validateInput`** now returns the canonical normalized string
  instead of returning void; the constructor consumes the return value
  rather than re-`.toString().split('.')`-ing the original input.
- **README** rewritten with the v1.2 API surface (types, errors, rounding).
- **Internal cleanup pass** — removed redundant import-example comments,
  stale historical tangents, the single-call `length()` private method,
  and outdated JSDoc `@throws` annotations.

### Removed

- Nothing public. Two minor internal tidies:
  - The single-call `length()` private method (inlined).
  - A 13-line redundant import-example comment block at the top of
    `src/index.ts`.

### Test count

| Release | Tests |
|---|---|
| v1.1.0 | 107 |
| v1.2.0 | **465** (107 original + 262 snapshot + 96 new across CurrencyCode, flexible input, error classes, rounding) |

### Deferred to v1.3

- `precision` option (needs the currency registry to be meaningful).
- Currency registry (`registerCurrency` / `getCurrency`).
- Grammar options (`feminine`, `accusative`, `legal`, style modes).
  These need native-speaker review before shipping; tracked as a
  separate workstream.

## [1.1.0] – 2026-05-27

A correctness, performance, and developer-experience release.

**No breaking API changes.** Output strings change only for inputs that
previously produced grammatically wrong Arabic or literal `"undefined"`.
The class signature, methods, and behavior for all currently-correct
inputs are byte-identical to v1.0.11.

### Added

- **KWD (Kuwaiti Dinar)** currency support, 3-decimal precision (1 KWD = 1000 fils).
  Originally proposed by [@thenbe](https://github.com/omar-ehab/tafgeet-arabic/pull/3); re-implemented on top of the
  fraction-plural fix below so no tests need `it.skip`.
- **Input validation** with clear, typed errors:
  - `TypeError` for `null`, `undefined`, wrong type, non-numeric strings,
    empty strings, scientific notation, non-string currency.
  - `RangeError` for `NaN`, `±Infinity`, negative amounts, zero (integer
    part < 1), and >15-digit integers.
  - `Error` for unknown currency codes (the error lists all supported codes).
  Pre-1.1.0 these inputs either crashed with cryptic `TypeError`s or
  silently produced strings containing the literal word `"undefined"`.
- **Public type exports** — TypeScript consumers can now import the
  types directly:
  ```ts
  import { Tafgeet, Currency, Currencies, NumberProperties } from 'tafgeet-arabic';
  ```
  Previously these types were unreachable without deep-importing
  internal paths.
- **TypeScript declaration files (`.d.ts`) shipping in the published
  package.** Previously enabled in tsconfig but the flag was commented
  out — TS consumers got no types. Now `dist/src/index.d.ts` is shipped.
- **`engines` field** declares `node >= 18.18.0` (the floor for the
  underlying mocha/eslint stack; the package runtime itself works on
  any Node ≥ 12 in practice).
- **JS-compat smoke test** (`npm run test:js-compat`) that exercises the
  built package from plain CommonJS — proving it works for vanilla JS
  consumers, not just TypeScript.

### Changed

- **3.5–4.7× faster** across all input sizes. Per-call constructor cost
  dropped from ~4 µs to ~1 µs on typical amounts. Wins come from:
  - Number-word dictionaries moved to module-level frozen constants
    (was: 14 object literals allocated per `new Tafgeet()` call).
  - String-digit indexing (`Array.from(d.toString())[i]`) replaced with
    arithmetic (`Math.floor(d / 10)`, `d % 10`).
  - `parse()` rewritten with a clean 3-digit grouping algorithm.

  | Case | Before | After |
  | --- | --- | --- |
  | Small (3 digits) | 503k ops/s | **2,348k ops/s** |
  | Medium (7 digits) | 248k ops/s | **932k ops/s** |
  | Large (13 digits) | 170k ops/s | **636k ops/s** |
  | Fractional | 222k ops/s | **830k ops/s** |
  | KWD 3-decimal | 212k ops/s | **748k ops/s** |
- **52% smaller unpacked install size** (44 kB → 21 kB). Test files were
  being compiled into `dist/test/` and shipped to every consumer (23 kB
  of test code per install) because the `tsconfig` exclude listed
  `./tests/` instead of `./test/`. Fixed.
- **Cross-platform `npm test`.** The test script used Unix `env`,
  breaking on Windows. The override was actually redundant with the
  existing tsconfig — removing it makes the script work on PowerShell,
  cmd, and bash without needing `cross-env`.
- **CI matrix expanded** from `ubuntu-latest` × Node 20 to
  `[ubuntu-latest, windows-latest]` × `[20, 22]`, with `lint`,
  `format:check`, and `test:js-compat` added to the pipeline.

### Fixed

- **Issue [#7](https://github.com/omar-ehab/tafgeet-arabic/issues/7) /
  Issue [#8](https://github.com/omar-ehab/tafgeet-arabic/issues/8)** — the
  "و" connector between million-prefixed amounts and the following group
  was missing or wrong:
  - `new Tafgeet('1100000', 'SAR').parse()`
    - Before: `مليونمائة ألف ريال سعودي فقط لا غير`
    - After:  `مليون ومائة ألف ريال سعودي فقط لا غير` ✓
  - `new Tafgeet('2250000', 'QAR').parse()`
    - Before: `مليونين مائتين وخمسون ألف ريال قطري فقط لا غير`
    - After:  `مليونين ومائتين وخمسون ألف ريال قطري فقط لا غير` ✓

  Root causes: (1) the trailing-zero connector-cleanup loop indexed the
  `concats[]` array by serialized-group index rather than column index;
  (2) a hardcoded `'مليونين'` literal special case appended a stray
  trailing space.

- **Fraction word singular/plural** — Arabic uses the broken-plural form
  for counts 3–10. The package gated this rule on the **integer part**
  of the amount instead of the **fraction value**, so fractions in the
  3–10 range got the singular form:
  - `new Tafgeet('1.05').parse()`
    - Before: `واحد جنيه مصري وخمسة قرش فقط لا غير`
    - After:  `واحد جنيه مصري وخمسة قروش فقط لا غير` ✓
  - `new Tafgeet('1.005', 'TND').parse()`
    - Before: `واحد دينار تونسي وخمسة مليم فقط لا غير`
    - After:  `واحد دينار تونسي وخمسة مليمات فقط لا غير` ✓

### Security

- **All `npm audit` vulnerabilities resolved** (was: 11 vulnerabilities;
  is: 0). The bulk came from `tslint`'s transitive deps (removed in
  the ESLint migration); the remaining mocha-transitive CVEs are
  pinned to patched versions via `package.json` `overrides`.

### Internal / Tooling

These don't affect consumers but improve maintainability and DX:

- **TypeScript upgraded 4.9 → 5.9.**
- **All devDependencies bumped to current majors:** `mocha` 10 → 11,
  `chai` 4 → 6, `prettier` 2 → 3, `ts-node` to latest, `@types/*`
  to match.
- **`tsconfig` strictness tightened** — every `strict`-family flag
  explicit, plus `noUnusedLocals`, `noUnusedParameters`,
  `noImplicitReturns`, `noFallthroughCasesInSwitch`,
  `noImplicitOverride`, **`noUncheckedIndexedAccess`**.
- **`tslint` → ESLint 9 (flat config)** with `typescript-eslint`
  strict + recommended rule sets. `tslint` had been deprecated since
  2019 and accounted for most of the security vulnerabilities.
- **File structure** consolidated — `src/interfaces/currency.ts` and
  `src/interfaces/NumberProperties.ts` merged into a single
  `src/types.ts`. `interfaces/` directory removed.
- **`bower.json` removed** (Bower deprecated 2017).
- **`.gitattributes`** added — forces LF line endings, prevents Windows
  contributors from accidentally committing CRLF.

### Removed

- **Eight `private` instance fields** on the `Tafgeet` class
  (`this.ones`, `this.teens`, `this.tens`, `this.hundreds`,
  `this.thousands`, `this.millions`, `this.billions`, `this.trillions`).
  These were always declared `private`, never documented as part of the
  API, and never exported. Consumers needing direct access to the
  dictionaries should import the constants from `tafgeet-arabic/dist/src/constants`
  (or wait for a future minor that re-exports them publicly).

### Credits

- [@kishoreaoe](https://github.com/kishoreaoe) — reported issue #7 (millions wording for QAR).
- [@Ahmed-Elashmony](https://github.com/Ahmed-Elashmony) — reported issue #8 with a clean numeric reproducer.
- [@thenbe](https://github.com/thenbe) — proposed KWD support in PR #3, surfaced the
  underlying fraction-plural bug that was fixed in this release.

## [1.0.11] – 2023-01-25

Last release before the v1.1.0 series. See git history for prior changes.
