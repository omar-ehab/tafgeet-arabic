import { CurrencyCode, Currencies, NumberProperties } from './types';

export const currencies: Currencies = {
  SDG: {
    singular: 'جنيه سوداني',
    plural: 'جنيهات سودانية',
    fraction: 'قرش',
    fractions: 'قروش',
    decimals: 2,
  },
  SAR: {
    singular: 'ريال سعودي',
    plural: 'ريالات سعودية',
    fraction: 'هللة',
    fractions: 'هللات',
    decimals: 2,
  },
  QAR: {
    singular: 'ريال قطري',
    plural: 'ريالات قطرية',
    fraction: 'درهم',
    fractions: 'دراهم',
    decimals: 2,
  },
  AED: {
    singular: 'درهم أماراتي',
    plural: 'دراهم أماراتية',
    fraction: 'فلس',
    fractions: 'فلوس',
    decimals: 2,
  },
  EGP: {
    singular: 'جنيه مصري',
    plural: 'جنيهات مصرية',
    fraction: 'قرش',
    fractions: 'قروش',
    decimals: 2,
  },
  KWD: {
    singular: 'دينار كويتي',
    plural: 'دنانير كويتية',
    fraction: 'فلس',
    fractions: 'فلوس',
    decimals: 3,
  },
  USD: {
    singular: 'دولار أمريكي',
    plural: 'دولارات أمريكية',
    fraction: 'سنت',
    fractions: 'سنتات',
    decimals: 2,
  },
  AUD: {
    singular: 'دولار أسترالي',
    plural: 'دولارات أسترالية',
    fraction: 'سنت',
    fractions: 'سنتات',
    decimals: 2,
  },
  TND: {
    singular: 'دينار تونسي',
    plural: 'دنانير تونسية',
    fraction: 'مليم',
    fractions: 'مليمات',
    decimals: 3,
  },
  TRY: {
    singular: 'ليرة تركية',
    plural: 'ليرات تركية',
    fraction: 'قرش',
    fractions: 'قروش',
    decimals: 2,
  },
};

export const columns: readonly string[] = ['trillions', 'billions', 'millions', 'thousands'];

/**
 * Runtime-accessible list of built-in currency codes. Useful for
 * iterating supported currencies or validating user input without
 * a try/catch around the constructor.
 *
 *   if (SUPPORTED_CURRENCIES.includes(userInput as CurrencyCode)) { ... }
 *
 * Kept in sync with the `Currencies` interface; if you ever bundle
 * a new currency, add it here AND to `Currencies` AND to `currencies`.
 */
export const SUPPORTED_CURRENCIES: readonly CurrencyCode[] = Object.freeze([
  'SDG',
  'SAR',
  'QAR',
  'AED',
  'EGP',
  'KWD',
  'USD',
  'AUD',
  'TND',
  'TRY',
]);

// -- Number-word dictionaries -------------------------------------------------
// Indexed by the digit value (1-9 for ones, etc.) so callers can do
// `ONES[d]` instead of building a `_<n>` key by string concatenation.
// All dictionaries are frozen at module load so they're shared across every
// Tafgeet instance rather than allocated per-constructor call.

export const ONES: Readonly<Record<number, string>> = Object.freeze({
  1: 'واحد',
  2: 'ٱثنين',
  3: 'ثلاثة',
  4: 'أربعة',
  5: 'خمسة',
  6: 'ستة',
  7: 'سبعة',
  8: 'ثمانية',
  9: 'تسعة',
});

export const TEENS: Readonly<Record<number, string>> = Object.freeze({
  11: 'أحد عشر',
  12: 'أثني عشر',
  13: 'ثلاثة عشر',
  14: 'أربعة عشر',
  15: 'خمسة عشر',
  16: 'ستة عشر',
  17: 'سبعة عشر',
  18: 'ثمانية عشر',
  19: 'تسعة عشر',
});

export const TENS: Readonly<Record<number, string>> = Object.freeze({
  10: 'عشرة',
  20: 'عشرون',
  30: 'ثلاثون',
  40: 'أربعون',
  50: 'خمسون',
  60: 'ستون',
  70: 'سبعون',
  80: 'ثمانون',
  90: 'تسعون',
});

export const HUNDREDS: Readonly<Record<number, string>> = Object.freeze({
  100: 'مائة',
  200: 'مائتين',
  300: 'ثلاثمائة',
  400: 'أربعمائة',
  500: 'خمسمائة',
  600: 'ستمائة',
  700: 'سبعمائة',
  800: 'ثمانمائة',
  900: 'تسعمائة',
});

export const THOUSANDS: Readonly<NumberProperties> = Object.freeze({
  singular: 'ألف',
  binary: 'ألفين',
  plural: 'ألآف',
});

export const MILLIONS: Readonly<NumberProperties> = Object.freeze({
  singular: 'مليون',
  binary: 'مليونين',
  plural: 'ملايين',
});

export const BILLIONS: Readonly<NumberProperties> = Object.freeze({
  singular: 'مليار',
  binary: 'مليارين',
  plural: 'مليارات',
});

export const TRILLIONS: Readonly<NumberProperties> = Object.freeze({
  singular: 'ترليون',
  binary: 'ترليونين',
  plural: 'ترليونات',
});

// Maps column name -> the NumberProperties for that column.
// Used by the parse() loop to look up the correct suffix per group.
export const COLUMN_PROPERTIES: Readonly<Record<string, Readonly<NumberProperties>>> = Object.freeze({
  trillions: TRILLIONS,
  billions: BILLIONS,
  millions: MILLIONS,
  thousands: THOUSANDS,
});
