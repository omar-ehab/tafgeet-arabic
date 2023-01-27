# Tafgeet-JS
An NPM module to convert currency digits into written Arabic words
[https://www.npmjs.com/package/tafgeet-arabic](https://www.npmjs.com/package/tafgeet-arabic)

## How to use:
### Install
`npm install tafgeet-arabic`
### Usage
`import Tafgeet from "tafgeet-arabic";`

`const stringText = new Tafgeet(556563.20, 'SDG').parse();` this will produce: 'فقط خمسمائة وستة وخمسون ألف وخمسمائة وثلاثة وستون جنيه سوداني وعشرون قرش لا غير'.

## Supported currencies: 
- SDG (Sudanese Pound) - *Default*
- SAR (Saudi Riyal)
- QAR (Qatari Riyal)
- AED (Emarati Dirham)
- EGP (Egyptian Pound)
- USD (US Dollar)
- TND (Tunisian Dinar)
- AUD (Australian Dollar)
- TRY (Turkish Lira)

## TODOs: 
- Support more currencies
- Better grammar support
- ~~Add test cases~~
