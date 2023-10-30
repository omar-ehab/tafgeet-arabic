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

## TODOs

- Support more currencies
- Better grammar support
- ~~Add test cases~~
