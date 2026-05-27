/**
 * Public type definitions for the tafgeet-arabic package.
 *
 * Available via the top-level package import:
 *
 *   import { Tafgeet, Currency, Currencies, NumberProperties } from 'tafgeet-arabic';
 */

/**
 * The lexical forms a counted Arabic noun needs:
 *   - singular: count of 1                       (e.g. ألف)
 *   - binary:   dual form for count of 2         (e.g. ألفين)
 *   - plural:   broken plural for count of 3-9   (e.g. ألآف)
 */
export interface NumberProperties {
  singular: string;
  binary: string;
  plural: string;
}

/**
 * Arabic forms + decimal precision for a single currency.
 *
 *   - singular:  count of 1, 2, 11+ of the main unit         (جنيه مصري)
 *   - plural:    count of 3-10 of the main unit              (جنيهات مصرية)
 *   - fraction:  count of 1, 2, 11+ of the fractional unit   (قرش)
 *   - fractions: count of 3-10 of the fractional unit        (قروش)
 *   - decimals:  how many decimal digits the currency uses (2 or 3)
 */
export interface Currency {
  singular: string;
  plural: string;
  fraction: string;
  fractions: string;
  decimals: number;
}

/**
 * Map of supported ISO currency codes to their Arabic Currency definitions.
 */
export interface Currencies {
  SDG: Currency;
  SAR: Currency;
  QAR: Currency;
  AED: Currency;
  EGP: Currency;
  KWD: Currency;
  USD: Currency;
  AUD: Currency;
  TND: Currency;
  TRY: Currency;
}
