import { Currencies } from './interfaces/currency';

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

export const columns: string[] = ['trillions', 'billions', 'millions', 'thousands'];
