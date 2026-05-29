import { CurrencyCode, Currencies, NumberProperties } from './types';

export const currencies: Currencies = {
  SDG: {
    singular: 'جنيه سوداني',
    dual: 'جنيهان سودانيان',
    plural: 'جنيهات سودانية',
    gender: 'm',
    fraction: 'قرش',
    fractionDual: 'قرشان',
    fractions: 'قروش',
    fractionGender: 'm',
    decimals: 2,
  },
  SAR: {
    singular: 'ريال سعودي',
    dual: 'ريالان سعوديان',
    plural: 'ريالات سعودية',
    gender: 'm',
    fraction: 'هللة',
    fractionDual: 'هللتان',
    fractions: 'هللات',
    fractionGender: 'f',
    decimals: 2,
  },
  QAR: {
    singular: 'ريال قطري',
    dual: 'ريالان قطريان',
    plural: 'ريالات قطرية',
    gender: 'm',
    fraction: 'درهم',
    fractionDual: 'درهمان',
    fractions: 'دراهم',
    fractionGender: 'm',
    decimals: 2,
  },
  AED: {
    singular: 'درهم إماراتي',
    dual: 'درهمان إماراتيان',
    plural: 'دراهم إماراتية',
    gender: 'm',
    fraction: 'فلس',
    fractionDual: 'فلسان',
    fractions: 'فلوس',
    fractionGender: 'm',
    decimals: 2,
  },
  EGP: {
    singular: 'جنيه مصري',
    dual: 'جنيهان مصريان',
    plural: 'جنيهات مصرية',
    gender: 'm',
    fraction: 'قرش',
    fractionDual: 'قرشان',
    fractions: 'قروش',
    fractionGender: 'm',
    decimals: 2,
  },
  KWD: {
    singular: 'دينار كويتي',
    dual: 'ديناران كويتيان',
    plural: 'دنانير كويتية',
    gender: 'm',
    fraction: 'فلس',
    fractionDual: 'فلسان',
    fractions: 'فلوس',
    fractionGender: 'm',
    decimals: 3,
  },
  USD: {
    singular: 'دولار أمريكي',
    dual: 'دولاران أمريكيان',
    plural: 'دولارات أمريكية',
    gender: 'm',
    fraction: 'سنت',
    fractionDual: 'سنتان',
    fractions: 'سنتات',
    fractionGender: 'm',
    decimals: 2,
  },
  AUD: {
    singular: 'دولار أسترالي',
    dual: 'دولاران أستراليان',
    plural: 'دولارات أسترالية',
    gender: 'm',
    fraction: 'سنت',
    fractionDual: 'سنتان',
    fractions: 'سنتات',
    fractionGender: 'm',
    decimals: 2,
  },
  TND: {
    singular: 'دينار تونسي',
    dual: 'ديناران تونسيان',
    plural: 'دنانير تونسية',
    gender: 'm',
    fraction: 'مليم',
    fractionDual: 'مليمان',
    fractions: 'مليمات',
    fractionGender: 'm',
    decimals: 3,
  },
  TRY: {
    singular: 'ليرة تركية',
    dual: 'ليرتان تركيتان',
    plural: 'ليرات تركية',
    gender: 'f',
    fraction: 'قرش',
    fractionDual: 'قرشان',
    fractions: 'قروش',
    fractionGender: 'm',
    decimals: 2,
  },
  // v1.3 additions — Arab region. Insertion order is intentional: the
  // UnsupportedCurrencyError message lists Object.keys(currencies), so new
  // codes must append after the original 10 to keep existing assertions valid.
  BHD: {
    singular: 'دينار بحريني',
    dual: 'ديناران بحرينيان',
    plural: 'دنانير بحرينية',
    gender: 'm',
    fraction: 'فلس',
    fractionDual: 'فلسان',
    fractions: 'فلوس',
    fractionGender: 'm',
    decimals: 3,
  },
  OMR: {
    singular: 'ريال عماني',
    dual: 'ريالان عمانيان',
    plural: 'ريالات عمانية',
    gender: 'm',
    fraction: 'بيسة',
    fractionDual: 'بيستان',
    fractions: 'بيسات',
    fractionGender: 'f',
    decimals: 3,
  },
  JOD: {
    singular: 'دينار أردني',
    dual: 'ديناران أردنيان',
    plural: 'دنانير أردنية',
    gender: 'm',
    fraction: 'فلس',
    fractionDual: 'فلسان',
    fractions: 'فلوس',
    fractionGender: 'm',
    decimals: 3,
  },
  IQD: {
    singular: 'دينار عراقي',
    dual: 'ديناران عراقيان',
    plural: 'دنانير عراقية',
    gender: 'm',
    fraction: 'فلس',
    fractionDual: 'فلسان',
    fractions: 'فلوس',
    fractionGender: 'm',
    decimals: 3,
  },
  LYD: {
    singular: 'دينار ليبي',
    dual: 'ديناران ليبيان',
    plural: 'دنانير ليبية',
    gender: 'm',
    fraction: 'درهم',
    fractionDual: 'درهمان',
    fractions: 'دراهم',
    fractionGender: 'm',
    decimals: 3,
  },
  LBP: {
    singular: 'ليرة لبنانية',
    dual: 'ليرتان لبنانيتان',
    plural: 'ليرات لبنانية',
    gender: 'f',
    fraction: 'قرش',
    fractionDual: 'قرشان',
    fractions: 'قروش',
    fractionGender: 'm',
    decimals: 2,
  },
  MAD: {
    singular: 'درهم مغربي',
    dual: 'درهمان مغربيان',
    plural: 'دراهم مغربية',
    gender: 'm',
    fraction: 'سنتيم',
    fractionDual: 'سنتيمان',
    fractions: 'سنتيمات',
    fractionGender: 'm',
    decimals: 2,
  },
  DZD: {
    singular: 'دينار جزائري',
    dual: 'ديناران جزائريان',
    plural: 'دنانير جزائرية',
    gender: 'm',
    fraction: 'سنتيم',
    fractionDual: 'سنتيمان',
    fractions: 'سنتيمات',
    fractionGender: 'm',
    decimals: 2,
  },
  SYP: {
    singular: 'ليرة سورية',
    dual: 'ليرتان سوريتان',
    plural: 'ليرات سورية',
    gender: 'f',
    fraction: 'قرش',
    fractionDual: 'قرشان',
    fractions: 'قروش',
    fractionGender: 'm',
    decimals: 2,
  },
  YER: {
    singular: 'ريال يمني',
    dual: 'ريالان يمنيان',
    plural: 'ريالات يمنية',
    gender: 'm',
    fraction: 'فلس',
    fractionDual: 'فلسان',
    fractions: 'فلوس',
    fractionGender: 'm',
    decimals: 2,
  },
  // v1.3 additions — major international (for cross-border invoicing).
  // EUR: يورو is an indeclinable foreign noun — singular/plural/idafa all يورو
  // (e.g. ثلاثة يورو); only the dual يوروان inflects.
  EUR: {
    singular: 'يورو',
    dual: 'يوروان',
    plural: 'يورو',
    gender: 'm',
    fraction: 'سنت',
    fractionDual: 'سنتان',
    fractions: 'سنتات',
    fractionGender: 'm',
    decimals: 2,
  },
  GBP: {
    singular: 'جنيه إسترليني',
    dual: 'جنيهان إسترلينيان',
    plural: 'جنيهات إسترلينية',
    gender: 'm',
    fraction: 'بنس',
    fractionDual: 'بنسان',
    fractions: 'بنسات',
    fractionGender: 'm',
    decimals: 2,
  },
  CHF: {
    singular: 'فرنك سويسري',
    dual: 'فرنكان سويسريان',
    plural: 'فرنكات سويسرية',
    gender: 'm',
    fraction: 'سنتيم',
    fractionDual: 'سنتيمان',
    fractions: 'سنتيمات',
    fractionGender: 'm',
    decimals: 2,
  },
  CAD: {
    singular: 'دولار كندي',
    dual: 'دولاران كنديان',
    plural: 'دولارات كندية',
    gender: 'm',
    fraction: 'سنت',
    fractionDual: 'سنتان',
    fractions: 'سنتات',
    fractionGender: 'm',
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

// Masculine 1–9 (used with masculine nouns and as scale multipliers). Per the
// gender-opposition rule, these "with-ة" forms count masculine nouns (ثلاثة جنيهات).
export const ONES: Readonly<Record<number, string>> = Object.freeze({
  1: 'واحد',
  2: 'اثنان',
  3: 'ثلاثة',
  4: 'أربعة',
  5: 'خمسة',
  6: 'ستة',
  7: 'سبعة',
  8: 'ثمانية',
  9: 'تسعة',
});

// Feminine 1–9 (used with feminine nouns: ليرة, هللة, بيسة). 1/2 are the
// compound forms (إحدى/اثنتان, as in إحدى وعشرون); the standalone-1 adjective
// واحدة is appended directly by the renderer.
export const ONES_F: Readonly<Record<number, string>> = Object.freeze({
  1: 'إحدى',
  2: 'اثنتان',
  3: 'ثلاث',
  4: 'أربع',
  5: 'خمس',
  6: 'ست',
  7: 'سبع',
  8: 'ثماني',
  9: 'تسع',
});

export const TEENS: Readonly<Record<number, string>> = Object.freeze({
  11: 'أحد عشر',
  12: 'اثنا عشر',
  13: 'ثلاثة عشر',
  14: 'أربعة عشر',
  15: 'خمسة عشر',
  16: 'ستة عشر',
  17: 'سبعة عشر',
  18: 'ثمانية عشر',
  19: 'تسعة عشر',
});

// Feminine 11–19 (both the unit and the عشرة part inflect for gender).
export const TEENS_F: Readonly<Record<number, string>> = Object.freeze({
  11: 'إحدى عشرة',
  12: 'اثنتا عشرة',
  13: 'ثلاث عشرة',
  14: 'أربع عشرة',
  15: 'خمس عشرة',
  16: 'ست عشرة',
  17: 'سبع عشرة',
  18: 'ثماني عشرة',
  19: 'تسع عشرة',
});

// 20–90 are gender-invariable. 10 is gendered (عشرة masc / عشر fem) and is
// handled by the renderer, not stored here.
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

// 200 is the nominative dual مائتان; the renderer drops the nūn to مائتا when
// it is مضاف (exactly 200 immediately before its counted noun). The 3–9×مائة
// forms already use the correct feminine unit (ثلاثمائة), so they are invariable.
export const HUNDREDS: Readonly<Record<number, string>> = Object.freeze({
  100: 'مائة',
  200: 'مائتان',
  300: 'ثلاثمائة',
  400: 'أربعمائة',
  500: 'خمسمائة',
  600: 'ستمائة',
  700: 'سبعمائة',
  800: 'ثمانمائة',
  900: 'تسعمائة',
});

// Scale words are masculine. `binary` is the nominative dual (ألفان); the
// renderer drops the nūn (ألفا) when the dual is مضاف to a following noun.
export const THOUSANDS: Readonly<NumberProperties> = Object.freeze({
  singular: 'ألف',
  binary: 'ألفان',
  plural: 'آلاف',
});

export const MILLIONS: Readonly<NumberProperties> = Object.freeze({
  singular: 'مليون',
  binary: 'مليونان',
  plural: 'ملايين',
});

export const BILLIONS: Readonly<NumberProperties> = Object.freeze({
  singular: 'مليار',
  binary: 'ملياران',
  plural: 'مليارات',
});

export const TRILLIONS: Readonly<NumberProperties> = Object.freeze({
  singular: 'تريليون',
  binary: 'تريليونان',
  plural: 'تريليونات',
});

// Column name -> NumberProperties, used by parse() to pick the suffix word.
export const COLUMN_PROPERTIES: Readonly<Record<string, Readonly<NumberProperties>>> = Object.freeze({
  trillions: TRILLIONS,
  billions: BILLIONS,
  millions: MILLIONS,
  thousands: THOUSANDS,
});
