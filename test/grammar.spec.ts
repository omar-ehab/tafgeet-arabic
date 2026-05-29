import { assert } from 'chai';

import { Tafgeet } from '../src';

/**
 * v1.4 Arabic-grammar ground truth. These are the human-verified canonical
 * outputs that pin the gender-agreement and noun-form rules. The snapshot
 * suite defends breadth; this file is the readable anchor for *why* each
 * output is shaped the way it is.
 *
 * Rules exercised:
 *   - gender agreement (3–10 opposition; feminine number words + teens)
 *   - 1 → noun + واحد/واحدة; 2 → the dual noun (no separate number word)
 *   - noun form chosen by the *governing* number (fixes 103, 205, 1,000,003)
 *   - nominative duals (اثنان, مائتان, ألفان) and the إضافة nūn-drop
 *     (مائتا/ألفا/مليونا) before a counted noun
 *   - the spelling fixes (اثنان، اثنا عشر، آلاف، إماراتي)
 */
const cases: Array<[string, string, string]> = [
  // Masculine currency (EGP — جنيه m, قرش m)
  ['1', 'EGP', 'جنيه مصري واحد فقط لا غير'],
  ['2', 'EGP', 'جنيهان مصريان فقط لا غير'],
  ['3', 'EGP', 'ثلاثة جنيهات مصرية فقط لا غير'],
  ['10', 'EGP', 'عشرة جنيهات مصرية فقط لا غير'],
  ['11', 'EGP', 'أحد عشر جنيه مصري فقط لا غير'],
  ['12', 'EGP', 'اثنا عشر جنيه مصري فقط لا غير'],
  ['21', 'EGP', 'واحد وعشرون جنيه مصري فقط لا غير'],
  ['100', 'EGP', 'مائة جنيه مصري فقط لا غير'],
  ['200', 'EGP', 'مائتا جنيه مصري فقط لا غير'],
  ['103', 'EGP', 'مائة وثلاثة جنيهات مصرية فقط لا غير'],
  ['1000', 'EGP', 'ألف جنيه مصري فقط لا غير'],
  ['2000', 'EGP', 'ألفا جنيه مصري فقط لا غير'],
  ['10000', 'EGP', 'عشرة آلاف جنيه مصري فقط لا غير'],
  ['1000003', 'EGP', 'مليون وثلاثة جنيهات مصرية فقط لا غير'],

  // Feminine currency (TRY — ليرة f). The number takes the masculine-looking
  // (no-ة) form for 3–10, and واحدة / the feminine teens elsewhere.
  ['1', 'TRY', 'ليرة تركية واحدة فقط لا غير'],
  ['2', 'TRY', 'ليرتان تركيتان فقط لا غير'],
  ['3', 'TRY', 'ثلاث ليرات تركية فقط لا غير'],
  ['10', 'TRY', 'عشر ليرات تركية فقط لا غير'],
  ['11', 'TRY', 'إحدى عشرة ليرة تركية فقط لا غير'],
  ['13', 'TRY', 'ثلاث عشرة ليرة تركية فقط لا غير'],
  ['21', 'TRY', 'إحدى وعشرون ليرة تركية فقط لا غير'],
  ['23', 'TRY', 'ثلاث وعشرون ليرة تركية فقط لا غير'],

  // Feminine fraction unit (SAR — ريال m / هللة f).
  ['1.01', 'SAR', 'ريال سعودي واحد وهللة واحدة فقط لا غير'],
  ['1.02', 'SAR', 'ريال سعودي واحد وهللتان فقط لا غير'],
  ['1.03', 'SAR', 'ريال سعودي واحد وثلاث هللات فقط لا غير'],
  ['1.20', 'SAR', 'ريال سعودي واحد وعشرون هللة فقط لا غير'],
  // Last-component plural rule for the fraction (205 → خمس بيسات, fem).
  ['1.205', 'OMR', 'ريال عماني واحد ومائتان وخمس بيسات فقط لا غير'],

  // No-currency mode: masculine, not مضاف, so duals keep their nūn.
  ['2', '', 'اثنان فقط لا غير'],
  ['12', '', 'اثنا عشر فقط لا غير'],
  ['200', '', 'مائتان فقط لا غير'],
  ['2000', '', 'ألفان فقط لا غير'],

  // AED spelling fix: إماراتي (was أماراتي).
  ['1', 'AED', 'درهم إماراتي واحد فقط لا غير'],
];

describe('Arabic grammar (v1.4 ground truth)', () => {
  for (const [amount, currency, expected] of cases) {
    const label = `${currency || '<no currency>'} ${amount}`;
    it(label, () => {
      assert.equal(new Tafgeet(amount, currency).parse(), expected);
    });
  }
});
