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
- 📦 ~6 kB gzipped, ships TypeScript `.d.ts` files
- 🛡 Strict input validation with typed `TypeError` / `RangeError`
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
import { Tafgeet, Currency, Currencies, NumberProperties } from 'tafgeet-arabic';

const cur: Currency = {
  singular: 'دينار',
  plural: 'دنانير',
  fraction: 'فلس',
  fractions: 'فلوس',
  decimals: 3,
};
```

## API

### `new Tafgeet(amount, currency?)`

Creates a new `Tafgeet` instance. The constructor validates the input
eagerly and throws if anything is malformed.

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `amount` | `string \| number` | — | Integer part must be **≥ 1** and **≤ 15 digits**. Pass a string to avoid float precision loss. |
| `currency` | `string` | `'EGP'` | ISO-style code from the [supported currencies](#supported-currencies), or `''` for no-currency mode. |

### `.parse(): string`

Renders the full amount as Arabic words, including the currency suffix
and the closing `فقط لا غير`.

```ts
new Tafgeet('123.45', 'EGP').parse();
// → 'مائة وثلاثة وعشرون جنيه مصري وخمسة وأربعون قرش فقط لا غير'
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

| Class | When |
|---|---|
| `TypeError` | `amount` is `null`, `undefined`, the wrong type, a non-numeric string, empty string, or scientific notation. Also thrown when `currency` is not a string. |
| `RangeError` | `amount` is `NaN`, `Infinity`, negative, zero (integer part < 1), or has more than 15 integer digits. |
| `Error` | `currency` is not one of the supported codes. |

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

See [CHANGELOG.md](./CHANGELOG.md). Highlights of **v1.1.0**:

- **3.5–4.7× faster** across all input sizes
- **52% smaller** install (test files no longer shipped)
- Fixes for issues [#7](https://github.com/omar-ehab/tafgeet-arabic/issues/7), [#8](https://github.com/omar-ehab/tafgeet-arabic/issues/8), and the fraction singular/plural rule
- **KWD (Kuwaiti Dinar)** added
- **Input validation** with typed errors
- TypeScript types now ship and are re-exported from the package root

## Roadmap

- More currencies (BHD, OMR, JOD, IQD, LBP, MAD, DZD, …)
- Native-speaker grammar review of dictionaries (dual form for 2, classical inflection for 11–99)
- Optional functional API: `tafgeet(amount, currency?)` alongside the class

## Contributing

PRs and issues welcome. To set up locally:

```sh
git clone https://github.com/omar-ehab/tafgeet-arabic
cd tafgeet-arabic
npm install
npm test               # 107 mocha tests
npm run lint           # ESLint
npm run test:js-compat # plain-JS smoke test against built dist/
```

## License

[MIT](./LICENSE) © Omar Ehab
