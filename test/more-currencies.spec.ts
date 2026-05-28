import { assert } from 'chai';

import { Tafgeet } from '../src';

/**
 * One representative assertion per currency added in v1.3. The snapshot
 * matrix carries the bulk of the regression coverage; these cases exist to
 * catch typos in the Arabic currency-name strings (singular/plural unit and
 * fraction names) at a glance. Inputs use full-precision fractions so the
 * expected value is unambiguous under the v1.2.1 fraction-padding rules.
 */
describe('New currencies in v1.3', () => {
  describe('Arab region (3-decimal)', () => {
    it('BHD — Bahraini Dinar', () => {
      assert.equal(new Tafgeet('1.234', 'BHD').parse(), 'واحد دينار بحريني ومائتين وأربعة وثلاثون فلس فقط لا غير');
    });
    it('OMR — Omani Rial', () => {
      assert.equal(new Tafgeet('2.500', 'OMR').parse(), 'ٱثنين ريال عماني وخمسمائة بيسة فقط لا غير');
    });
    it('JOD — Jordanian Dinar', () => {
      assert.equal(new Tafgeet('3.005', 'JOD').parse(), 'ثلاثة دنانير أردنية وخمسة فلوس فقط لا غير');
    });
    it('IQD — Iraqi Dinar', () => {
      assert.equal(new Tafgeet('1.250', 'IQD').parse(), 'واحد دينار عراقي ومائتين وخمسون فلس فقط لا غير');
    });
    it('LYD — Libyan Dinar', () => {
      assert.equal(new Tafgeet('10.100', 'LYD').parse(), 'عشرة دنانير ليبية ومائة درهم فقط لا غير');
    });
  });

  describe('Arab region (2-decimal)', () => {
    it('LBP — Lebanese Pound', () => {
      assert.equal(new Tafgeet('1.50', 'LBP').parse(), 'واحد ليرة لبنانية وخمسون قرش فقط لا غير');
    });
    it('MAD — Moroccan Dirham', () => {
      assert.equal(new Tafgeet('3.20', 'MAD').parse(), 'ثلاثة دراهم مغربية وعشرون سنتيم فقط لا غير');
    });
    it('DZD — Algerian Dinar', () => {
      assert.equal(new Tafgeet('2.05', 'DZD').parse(), 'ٱثنين دينار جزائري وخمسة سنتيمات فقط لا غير');
    });
    it('SYP — Syrian Pound', () => {
      assert.equal(new Tafgeet('1.99', 'SYP').parse(), 'واحد ليرة سورية وتسعة وتسعون قرش فقط لا غير');
    });
    it('YER — Yemeni Rial', () => {
      assert.equal(new Tafgeet('5.75', 'YER').parse(), 'خمسة ريالات يمنية وخمسة وسبعون فلس فقط لا غير');
    });
  });

  describe('Major international (2-decimal)', () => {
    it('EUR — Euro', () => {
      assert.equal(new Tafgeet('1.50', 'EUR').parse(), 'واحد يورو وخمسون سنت فقط لا غير');
    });
    it('GBP — British Pound Sterling', () => {
      assert.equal(new Tafgeet('2.20', 'GBP').parse(), 'ٱثنين جنيه إسترليني وعشرون بنس فقط لا غير');
    });
    it('CHF — Swiss Franc', () => {
      assert.equal(new Tafgeet('3.05', 'CHF').parse(), 'ثلاثة فرنكات سويسرية وخمسة سنتيمات فقط لا غير');
    });
    it('CAD — Canadian Dollar', () => {
      assert.equal(new Tafgeet('1.25', 'CAD').parse(), 'واحد دولار كندي وخمسة وعشرون سنت فقط لا غير');
    });
  });
});
