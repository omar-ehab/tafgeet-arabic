/**
 * Public type definitions for the tafgeet-arabic package.
 * All types here are re-exported from the package root.
 */

/**
 * Lexical forms for an Arabic counted noun: singular (1), dual (2),
 * broken plural (3–9). Example for ألف / ألفين / ألآف.
 */
export interface NumberProperties {
  singular: string;
  binary: string;
  plural: string;
}

/**
 * Arabic forms + decimal precision for a single currency. The main and
 * fractional units each have singular (count 1/2/11+) and plural (3–10)
 * variants per Arabic grammar.
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
 * Union of all built-in currency codes (`'EGP' | 'SAR' | …`). Derived
 * from `Currencies`, so adding a key there auto-extends the union.
 */
export type CurrencyCode = keyof Currencies;

/**
 * What the constructor's currency parameter accepts: a known code (with
 * IDE autocomplete), `''` for no-currency mode, or any other string
 * (forward-compatible; runtime validator still rejects unregistered codes).
 *
 * The `(string & {})` is a deliberate trick that keeps literal-union
 * autocomplete while widening to `string` (microsoft/TypeScript#29729).
 */
export type CurrencyInput = CurrencyCode | '' | (string & {});

/**
 * How to handle decimal digits beyond the currency's natural precision.
 *   - `'truncate'` (default) — drop extra digits; preserves v1.1.x behavior.
 *   - `'round'` — half-up.
 *   - `'floor'` — same as `'truncate'` for non-negative inputs.
 *   - `'ceil'` — any non-zero dropped digit carries a 1.
 *   - `'bankers'` — IEEE 754 half-to-even; reduces accumulator bias.
 */
export type RoundingMode = 'truncate' | 'round' | 'floor' | 'ceil' | 'bankers';

/**
 * Optional third argument to the Tafgeet constructor. `precision`,
 * `feminine`, `accusative`, and `style` are planned for v1.3+.
 */
export interface TafgeetOptions {
  /** See {@link RoundingMode}. Defaults to `'truncate'`. */
  rounding?: RoundingMode;
}
