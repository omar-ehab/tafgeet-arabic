# Tafgeet-Arabic

An [NPM module](https://www.npmjs.com/package/tafgeet-arabic) to convert currency digits into written Arabic words.

## How to use

### Install

```sh
npm install tafgeet-arabic
```

### Usage

```typescript
const { Tafgeet } = require("tafgeet-arabic"); // ES5
import { Tafgeet } from "tafgeet-arabic";      // ES6

const stringText = new Tafgeet(55000051000.2, 'EGP').parse();
// خمسة وخمسون مليار وواحد وخمسون ألف جنيه مصري وٱثنين قرش فقط لا غير
```

## Supported currencies

- SDG (Sudanese Pound)
- SAR (Saudi Riyal)
- QAR (Qatari Riyal)
- AED (Emarati Dirham)
- EGP (Egyptian Pound) - *Default*
- KWD (Kuwaiti Dinar)
- USD (US Dollar)
- TND (Tunisian Dinar)
- AUD (Australian Dollar)
- TRY (Turkish Lira)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release notes. Highlights of **v1.1.0**:

- **3.5–4.7× faster** across all input sizes
- **52% smaller** install size (test files no longer published)
- **Bug fixes** for issues [#7](https://github.com/omar-ehab/tafgeet-arabic/issues/7), [#8](https://github.com/omar-ehab/tafgeet-arabic/issues/8), and the fraction singular/plural rule
- **KWD (Kuwaiti Dinar)** currency added
- **Input validation** — bad input throws typed errors instead of silent garbage
- **TypeScript types** ship in the package and are re-exported from the entry point

## Requirements

- Node.js **≥ 18.18.0**

## TODOs

- Support more currencies
- Better grammar support (native-speaker review of dictionaries; classical inflection)
- ~~Add test cases~~
