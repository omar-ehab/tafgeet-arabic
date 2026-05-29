/**
 * Public type definitions for the tafgeet-arabic package.
 * All types here are re-exported from the package root.
 */

/**
 * Lexical forms for an Arabic scale word: singular (1), dual (2),
 * broken plural (3–9). Example for ألف / ألفان / آلاف. `binary` is the
 * nominative dual (ألفان); the renderer drops the final nūn when the dual
 * is مضاف (immediately followed by its counted noun): ألفا جنيه.
 */
export interface NumberProperties {
  singular: string;
  binary: string;
  plural: string;
}

/** Grammatical gender of a counted noun — drives number agreement. */
export type Gender = 'm' | 'f';

/**
 * Arabic forms + decimal precision for a single currency.
 *
 * Both the main unit and the fractional unit carry the four counted-noun
 * forms Arabic grammar needs plus their intrinsic gender:
 *   - `singular`  — count 1 / 11+ / round 100·1000 (e.g. جنيه)
 *   - `dual`      — count 2, the dual noun incl. its adjective (e.g. جنيهان مصريان)
 *   - `plural`    — counts 3–10 (e.g. جنيهات مصرية)
 *   - `gender`    — fixed gender of the unit; the number 3–10 takes the
 *                   opposite form, 1/2 agree. `جنيه` is `'m'`, `ليرة` is `'f'`.
 */
export interface Currency {
  singular: string;
  dual: string;
  plural: string;
  gender: Gender;
  fraction: string;
  fractionDual: string;
  fractions: string;
  fractionGender: Gender;
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
  BHD: Currency;
  OMR: Currency;
  JOD: Currency;
  IQD: Currency;
  LYD: Currency;
  LBP: Currency;
  MAD: Currency;
  DZD: Currency;
  SYP: Currency;
  YER: Currency;
  EUR: Currency;
  GBP: Currency;
  CHF: Currency;
  CAD: Currency;
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
