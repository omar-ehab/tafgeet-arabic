# Tafgeet-Arabic
An NPM module to convert currency digits into written Arabic words
[https://www.npmjs.com/package/tafgeet-arabic](https://www.npmjs.com/package/tafgeet-arabic)

## How to use:
### Install
`npm install tafgeet-arabic`
### Usage
ES5<br/>
`const { Tafgeet } = require("tafgeet-arabic");`<br/>
ES6<br>
`import { Tafgeet } from "tafgeet-arabic";`

`const stringText = new Tafgeet(55000051000.2, 'EGP').parse();` this will produce: 'خمسة وخمسون مليار وواحد وخمسون ألف جنيه مصري وٱثنين قرش فقط لا غير'.

## Supported currencies: 
- SDG (Sudanese Pound)
- SAR (Saudi Riyal)
- QAR (Qatari Riyal)
- AED (Emarati Dirham)
- EGP (Egyptian Pound) - *Default*
- USD (US Dollar)
- TND (Tunisian Dinar)
- AUD (Australian Dollar)
- TRY (Turkish Lira)

## TODOs: 
- Support more currencies
- Better grammar support
- ~~Add test cases~~
