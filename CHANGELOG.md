# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
