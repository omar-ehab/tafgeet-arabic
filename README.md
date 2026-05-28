# tafgeet-arabic

> Convert numeric currency amounts into written Arabic words — for invoices, receipts, contracts, and legal documents.

[![npm version](https://img.shields.io/npm/v/tafgeet-arabic.svg)](https://www.npmjs.com/package/tafgeet-arabic)
[![CI](https://github.com/omar-ehab/tafgeet-arabic/actions/workflows/main.yml/badge.svg)](https://github.com/omar-ehab/tafgeet-arabic/actions/workflows/main.yml)
[![license](https://img.shields.io/npm/l/tafgeet-arabic.svg)](./LICENSE)
[![npm downloads](https://img.shields.io/npm/dm/tafgeet-arabic.svg)](https://www.npmjs.com/package/tafgeet-arabic)

```ts
new Tafgeet('1234.56', 'EGP').parse();
// → ألف ومائتين وأربعة وثلاثون جنيه مصري وستة وخمسون قرش فقط لا غير
```

- ⚡ ~900,000 ops/sec — pure JS, zero runtime dependencies
- 📦 Dual **ESM + CJS** build, ships TypeScript `.d.ts` files, `sideEffects: false`
- 🛡 Typed error classes (`InvalidAmountError`, `AmountOutOfRangeError`, …) with discriminated `code` fields
- 🔢 Accepts Latin, Arabic-Indic (`١٢٣`), Eastern Arabic-Indic (`۱۲۳`), commas, spaces, underscores
- ➗ Configurable rounding (`'round'`, `'floor'`, `'ceil'`, `'bankers'`, `'truncate'`)
- 🌍 10 currencies: EGP, SAR, QAR, AED, KWD, USD, AUD, SDG, TND, TRY

## Requirements

- Node.js **≥ 18.18.0**

## Install

```sh
npm install tafgeet-arabic
```

## Usage

### Quick start

```ts
// ES Module / TypeScript
import { Tafgeet } from 'tafgeet-arabic';

// CommonJS
const { Tafgeet } = require('tafgeet-arabic');

new Tafgeet('1234.56').parse();
// → 'ألف ومائتين وأربعة وثلاثون جنيه مصري وستة وخمسون قرش فقط لا غير'
```

> **Tip:** prefer passing the amount as a **string** (`'1234.56'`) over a JS number.
> JavaScript's `Number` loses precision above 2<sup>53</sup> and can mis-render trailing
> decimals (`1.1 + 0.2` is `1.3000000000000003`, not `1.3`). The package accepts
> both, but strings round-trip cleanly.

### Multiple currencies

```ts
new Tafgeet('500', 'SAR').parse();
// → 'خمسمائة ريال سعودي فقط لا غير'

new Tafgeet('1.005', 'KWD').parse();  // Kuwaiti Dinar uses 3 decimals
// → 'واحد دينار كويتي وخمسة فلوس فقط لا غير'

new Tafgeet('1234567', 'USD').parse();
// → 'مليون ومائتين وأربعة وثلاثون ألف وخمسمائة وسبعة وستون دولار أمريكي فقط لا غير'
```

### No-currency mode

Pass an empty string to render the number alone, without a currency suffix:

```ts
new Tafgeet('7564654', '').parse();
// → 'سبعة ملايين وخمسمائة وأربعة وستون ألف وستمائة وأربعة وخمسون فقط لا غير'
```

### Flexible input formats

Beyond plain Latin (`'1234.56'`), the constructor accepts amounts in many forms — useful for input from Arabic forms, CSVs, copy-pasted spreadsheets, etc.:

```ts
new Tafgeet('١٢٣٤.٥٦').parse();          // Arabic-Indic digits
new Tafgeet('۱۲۳۴.۵۶').parse();          // Eastern Arabic-Indic (Farsi/Urdu)
new Tafgeet('1,234.56').parse();         // ASCII comma
new Tafgeet('1_234_567').parse();        // JS underscore separator
new Tafgeet('1 234 567').parse();        // space (regular / NBSP / narrow NBSP)
new Tafgeet('١٬٥٠٠٫٢٥', 'EGP').parse(); // fully Arabic with Arabic separators
// All produce the same output as the plain-Latin equivalent.
```

### Rounding

By default decimals beyond the currency's precision are **truncated** (preserving v1.1 behavior byte-for-byte). Opt in to other modes via the third constructor argument:

```ts
new Tafgeet('1.995', 'EGP', { rounding: 'round' }).parse();
// → 'ٱثنين جنيه مصري فقط لا غير'   (1.995 rounded to 2.00)

new Tafgeet('1.001', 'EGP', { rounding: 'ceil' }).parse();
// → 'واحد جنيه مصري وواحد قرش فقط لا غير'

new Tafgeet('1.225', 'EGP', { rounding: 'bankers' }).parse();
// → 'واحد جنيه مصري وٱثنين وعشرون قرش فقط لا غير'  (half-to-even)
```

Available modes: `'truncate'` (default), `'round'` (half-up), `'floor'`, `'ceil'`, `'bankers'` (IEEE 754 half-to-even — recommended for accounting).

### Error handling

Invalid input throws a typed error rather than producing garbage output:

```ts
try {
  new Tafgeet(-100, 'EGP');
} catch (err) {
  // err instanceof RangeError
  // err.message === 'Tafgeet: amount must be non-negative, got -100'
}

try {
  new Tafgeet(1, 'XYZ');
} catch (err) {
  // err instanceof Error
  // err.message === 'Tafgeet: unknown currency "XYZ". Supported: SDG, SAR, QAR, AED, EGP, KWD, USD, AUD, TND, TRY'
}
```

See [API → Errors](#errors) for the full list.

### TypeScript

All public types are re-exported from the package entry point:

```ts
import {
  Tafgeet,
  SUPPORTED_CURRENCIES,
  isTafgeetError,
  InvalidAmountError,
  AmountOutOfRangeError,
  UnsupportedCurrencyError,
} from 'tafgeet-arabic';
import type {
  Currency,
  Currencies,
  CurrencyCode,
  CurrencyInput,
  NumberProperties,
  RoundingMode,
  TafgeetOptions,
  TafgeetErrorCode,
} from 'tafgeet-arabic';
```

## API

### `new Tafgeet(amount, currency?, options?)`

Creates a new `Tafgeet` instance. The constructor validates the input
eagerly and throws a typed error if anything is malformed.

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `amount` | `string \| number` | — | Integer part must be **≥ 1** and **≤ 15 digits**. Pass a string to avoid float precision loss. Arabic-Indic digits and thousands separators are accepted. |
| `currency` | `CurrencyInput` | `'EGP'` | A `CurrencyCode`, an empty string for no-currency mode, or any string (runtime validated). |
| `options` | `TafgeetOptions` | `{}` | See [Options](#options) below. |

### Options

```ts
interface TafgeetOptions {
  rounding?: 'truncate' | 'round' | 'floor' | 'ceil' | 'bankers';
}
```

| Option | Default | Behavior |
|---|---|---|
| `rounding` | `'truncate'` | How to handle decimals beyond the currency's natural precision. `'truncate'` preserves v1.1 behavior exactly. `'round'` is half-up. `'bankers'` is IEEE 754 half-to-even (recommended for accounting). Rounding can carry into the integer part (`1.995 EGP` with `'round'` → `2 EGP`). |

### `.parse(): string`

Renders the full amount as Arabic words, including the currency suffix
and the closing `فقط لا غير`.

```ts
new Tafgeet('123.45', 'EGP').parse();
// → 'مائة وثلاثة وعشرون جنيه مصري وخمسة وأربعون قرش فقط لا غير'

new Tafgeet('1.995', 'EGP', { rounding: 'round' }).parse();
// → 'ٱثنين جنيه مصري فقط لا غير'  (rounded up)
```

### `.read(d: number): string`

Renders a number in `0–999` as Arabic words, with **no** column suffix and
**no** currency. Useful for custom formatting.

```ts
const t = new Tafgeet('1');   // any instance
t.read(42);  // → 'ٱثنين وأربعون'
t.read(100); // → 'مائة'
t.read(999); // → 'تسعمائة وتسعة وتسعون'
```

### Errors

Each error class extends the appropriate built-in, so existing
`instanceof TypeError` / `RangeError` checks keep working. The
`code` field allows structured handling:

| Class | Extends | `code` | When |
|---|---|---|---|
| `InvalidAmountError` | `TypeError` | `'INVALID_AMOUNT'` | `amount` is `null`, `undefined`, wrong type, non-numeric string, empty string, or scientific notation. Also thrown when `currency` is not a string. |
| `AmountOutOfRangeError` | `RangeError` | `'AMOUNT_OUT_OF_RANGE'` | `amount` is `NaN`, `Infinity`, negative, zero (integer part < 1), or has more than 15 integer digits. |
| `UnsupportedCurrencyError` | `Error` | `'UNSUPPORTED_CURRENCY'` | `currency` is a string but not one of the codes in `SUPPORTED_CURRENCIES`. |

```ts
import { isTafgeetError } from 'tafgeet-arabic';

try {
  new Tafgeet(input, currency).parse();
} catch (e) {
  if (isTafgeetError(e)) {
    switch (e.code) {
      case 'INVALID_AMOUNT':       reportToUser('Bad number');   break;
      case 'AMOUNT_OUT_OF_RANGE':  reportToUser('Out of range'); break;
      case 'UNSUPPORTED_CURRENCY': reportToUser('Bad currency'); break;
    }
  } else {
    throw e;
  }
}
```

## Supported currencies

| Code | Currency | Decimals |
|---|---|---|
| `EGP` *(default)* | Egyptian Pound — جنيه مصري | 2 |
| `SAR` | Saudi Riyal — ريال سعودي | 2 |
| `QAR` | Qatari Riyal — ريال قطري | 2 |
| `AED` | Emarati Dirham — درهم أماراتي | 2 |
| `KWD` | Kuwaiti Dinar — دينار كويتي | 3 |
| `USD` | US Dollar — دولار أمريكي | 2 |
| `AUD` | Australian Dollar — دولار أسترالي | 2 |
| `SDG` | Sudanese Pound — جنيه سوداني | 2 |
| `TND` | Tunisian Dinar — دينار تونسي | 3 |
| `TRY` | Turkish Lira — ليرة تركية | 2 |

Missing a currency? [Open an issue](https://github.com/omar-ehab/tafgeet-arabic/issues/new) or send a PR.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md). Highlights of **v1.2.0**:

- **Dual ESM + CJS build** with proper `exports` map and `sideEffects: false`
- **`CurrencyCode` union type** + **`SUPPORTED_CURRENCIES`** runtime array
- **Arabic-Indic digits & thousands separators** accepted (`'١٬٥٠٠٫٢٥'`, `'1,500.25'`, `'1_500'`, …)
- **Custom error classes** with discriminated `code` fields (still `instanceof TypeError` etc.)
- **`rounding` option** — `'truncate'` *(default, preserves v1.1 behavior)*, `'round'`, `'floor'`, `'ceil'`, `'bankers'`
- **262 snapshot tests** locking in every existing output against future regression

Earlier: **v1.1.0** — 3.5–4.7× faster, 52% smaller install, fixes for issues [#7](https://github.com/omar-ehab/tafgeet-arabic/issues/7) / [#8](https://github.com/omar-ehab/tafgeet-arabic/issues/8) / fraction-plural, KWD added, input validation.

## Roadmap

- **v1.3:** currency registry (`registerCurrency`), `precision` option, more currencies (BHD, OMR, JOD, IQD, LBP, MAD, DZD, …)
- **v1.4:** grammar options (`feminine`, `accusative`, `style: 'simple' | 'formal' | 'banking'`) — pending native-speaker review of the dictionaries
- Optional: functional API `tafgeet(amount, currency?)` alongside the class

## Contributing

PRs and issues welcome. To set up locally:

```sh
git clone https://github.com/omar-ehab/tafgeet-arabic
cd tafgeet-arabic
npm install
npm test               # 465 tests (107 unit + 262 snapshot + 96 feature)
npm run lint           # ESLint
npm run test:js-compat # CJS + ESM smoke tests against built dist/
```

## License

[MIT](./LICENSE) © Omar Ehab
