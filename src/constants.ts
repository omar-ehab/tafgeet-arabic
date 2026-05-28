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
  // v1.3 additions — Arab region. Insertion order is intentional: the
  // UnsupportedCurrencyError message lists Object.keys(currencies), so new
  // codes must append after the original 10 to keep existing assertions valid.
  BHD: {
    singular: 'دينار بحريني',
    plural: 'دنانير بحرينية',
    fraction: 'فلس',
    fractions: 'فلوس',
    decimals: 3,
  },
  OMR: {
    singular: 'ريال عماني',
    plural: 'ريالات عمانية',
    fraction: 'بيسة',
    fractions: 'بيسات',
    decimals: 3,
  },
  JOD: {
    singular: 'دينار أردني',
    plural: 'دنانير أردنية',
    fraction: 'فلس',
    fractions: 'فلوس',
    decimals: 3,
  },
  IQD: {
    singular: 'دينار عراقي',
    plural: 'دنانير عراقية',
    fraction: 'فلس',
    fractions: 'فلوس',
    decimals: 3,
  },
  LYD: {
    singular: 'دينار ليبي',
    plural: 'دنانير ليبية',
    fraction: 'درهم',
    fractions: 'دراهم',
    decimals: 3,
  },
  LBP: {
    singular: 'ليرة لبنانية',
    plural: 'ليرات لبنانية',
    fraction: 'قرش',
    fractions: 'قروش',
    decimals: 2,
  },
  MAD: {
    singular: 'درهم مغربي',
    plural: 'دراهم مغربية',
    fraction: 'سنتيم',
    fractions: 'سنتيمات',
    decimals: 2,
  },
  DZD: {
    singular: 'دينار جزائري',
    plural: 'دنانير جزائرية',
    fraction: 'سنتيم',
    fractions: 'سنتيمات',
    decimals: 2,
  },
  SYP: {
    singular: 'ليرة سورية',
    plural: 'ليرات سورية',
    fraction: 'قرش',
    fractions: 'قروش',
    decimals: 2,
  },
  YER: {
    singular: 'ريال يمني',
    plural: 'ريالات يمنية',
    fraction: 'فلس',
    fractions: 'فلوس',
    decimals: 2,
  },
  // v1.3 additions — major international (for cross-border invoicing).
  EUR: {
    singular: 'يورو',
    plural: 'يوروهات',
    fraction: 'سنت',
    fractions: 'سنتات',
    decimals: 2,
  },
  GBP: {
    singular: 'جنيه إسترليني',
    plural: 'جنيهات إسترلينية',
    fraction: 'بنس',
    fractions: 'بنسات',
    decimals: 2,
  },
  CHF: {
    singular: 'فرنك سويسري',
    plural: 'فرنكات سويسرية',
    fraction: 'سنتيم',
    fractions: 'سنتيمات',
    decimals: 2,
  },
  CAD: {
    singular: 'دولار كندي',
    plural: 'دولارات كندية',
    fraction: 'سنت',
    fractions: 'سنتات',
    decimals: 2,
  },
};

export const columns: readonly string[] = ['trillions', 'billions', 'millions', 'thousands'];

/**
 * Runtime list of built-in currency codes — frozen, iterable, includes()-able.
 * Keep in sync with the `Currencies` interface and `currencies` map.
 */
export const SUPPORTED_CURRENCIES: readonly CurrencyCode[] = Object.freeze([
  'AED',
  'AUD',
  'BHD',
  'CAD',
  'CHF',
  'DZD',
  'EGP',
  'EUR',
  'GBP',
  'IQD',
  'JOD',
  'KWD',
  'LBP',
  'LYD',
  'MAD',
  'OMR',
  'QAR',
  'SAR',
  'SDG',
  'SYP',
  'TND',
  'TRY',
  'USD',
  'YER',
]);

// -- Number-word dictionaries -------------------------------------------------
// Indexed by digit value (e.g. `ONES[5]`). Frozen + module-level so every
// Tafgeet instance shares the same reference instead of re-allocating.

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

// Column name -> NumberProperties, used by parse() to pick the suffix word.
export const COLUMN_PROPERTIES: Readonly<Record<string, Readonly<NumberProperties>>> = Object.freeze({
  trillions: TRILLIONS,
  billions: BILLIONS,
  millions: MILLIONS,
  thousands: THOUSANDS,
});
