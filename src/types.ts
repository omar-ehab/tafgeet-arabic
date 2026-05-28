/**
 * Public type definitions for the tafgeet-arabic package.
 * All types here are re-exported from the package root.
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

/**
 * Union of all built-in currency code strings. Use this in your own
 * type signatures to enforce a known code at compile time:
 *
 *   function quote(amount: number, code: CurrencyCode) { ... }
 *
 * Derived from `Currencies` via `keyof`, so adding a currency to
 * the `Currencies` interface automatically extends `CurrencyCode`.
 */
export type CurrencyCode = keyof Currencies;

/**
 * The Tafgeet constructor's currency parameter accepts:
 *   - a known CurrencyCode      — IDE autocompletes all valid codes
 *   - `''` (empty string)       — no-currency mode (number only)
 *   - any other string          — accepted for forward compatibility,
 *                                 but the runtime validator will reject
 *                                 anything not registered in `currencies`
 *
 * The `(string & {})` intersection is a deliberate TypeScript trick that
 * preserves autocomplete for the literal union while still permitting
 * arbitrary string inputs (see microsoft/TypeScript#29729).
 */
export type CurrencyInput = CurrencyCode | '' | (string & {});

/**
 * How to handle decimal digits beyond the currency's natural precision.
 *
 *   'truncate' (default) — drop extra digits (equivalent to `floor` for
 *                          non-negative amounts). Preserves the v1.1.x
 *                          default behavior exactly.
 *   'round'              — round half up (the "schoolbook" rule).
 *                          1.235 -> 1.24 for 2-decimal currencies.
 *   'floor'              — round toward 0. Same as `truncate` for the
 *                          non-negative inputs this library accepts.
 *   'ceil'               — round toward +∞. Any non-zero dropped digit
 *                          carries a 1.
 *   'bankers'            — IEEE 754 "round half to even". Reduces
 *                          cumulative bias in long sequences of additions;
 *                          common in financial accounting.
 */
export type RoundingMode = 'truncate' | 'round' | 'floor' | 'ceil' | 'bankers';

/**
 * Optional third argument to the Tafgeet constructor.
 *
 * Reserved for future expansion. The current v1.2 release ships only
 * `rounding`; `precision` and other linguistic options (`feminine`,
 * `accusative`, `style`) are planned for v1.3+.
 */
export interface TafgeetOptions {
  /** See {@link RoundingMode}. Defaults to `'truncate'`. */
  rounding?: RoundingMode;
}
