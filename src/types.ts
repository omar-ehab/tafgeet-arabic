/**
 * Type definitions for the tafgeet-arabic package.
 *
 * The re-exported public types are `NumberProperties`, `Currency`,
 * `Currencies`, `CurrencyCode`, `CurrencyInput`, `RoundingMode`, and
 * `TafgeetOptions`. `Gender`, `CurrencyEntry`, and `CountedNoun` are internal
 * helpers used by the renderer and the currency data — not part of the public
 * API.
 */

/**
 * Lexical forms for an Arabic scale word: singular (1), dual (2),
 * broken plural (3–10). Example for ألف / ألفان / آلاف. `binary` is the
 * nominative dual (ألفان); the renderer drops the final nūn when the dual
 * is مضاف (immediately followed by its counted noun): ألفا جنيه.
 */
export type NumberProperties = {
  singular: string;
  binary: string;
  plural: string;
};

/** Grammatical gender of a counted noun — drives number agreement (internal). */
export type Gender = 'm' | 'f';

/**
 * Public Arabic forms + decimal precision for a single currency.
 *   - `singular`  — count 1 / 11+ / round 100·1000 (e.g. جنيه مصري)
 *   - `plural`    — counts 3–10 (e.g. جنيهات مصرية)
 *   - `fraction` / `fractions` — the fractional unit, singular / plural
 *   - `decimals`  — fractional precision (2 or 3)
 */
export type Currency = {
  singular: string;
  plural: string;
  fraction: string;
  fractions: string;
  decimals: number;
};

/**
 * Internal currency record. Extends the public {@link Currency} with the dual
 * forms and the intrinsic gender of each unit (the renderer needs these for
 * agreement). Kept off the public API so adding it was not a breaking change
 * to the exported `Currency` shape.
 */
export type CurrencyEntry = Currency & {
  dual: string;
  gender: Gender;
  fractionDual: string;
  fractionGender: Gender;
};

/** The forms + gender the renderer needs to agree a number with its noun (internal). */
export type CountedNoun = {
  singular: string;
  dual: string;
  plural: string;
  gender: Gender;
};

/** Map of supported ISO currency codes to their Arabic Currency definitions. */
export type Currencies = {
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
};

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
 * Optional third argument to the Tafgeet constructor.
 *
 * Gender is intentionally NOT an option — it is intrinsic to each currency
 * (see {@link Currency.gender}) and derived automatically. A diacritized /
 * accusative output mode may be added in the future.
 */
export type TafgeetOptions = {
  /** See {@link RoundingMode}. Defaults to `'truncate'`. */
  rounding?: RoundingMode;
};
