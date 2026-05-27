import { assert } from 'chai';

import { Tafgeet } from '../src';

const text = new Tafgeet('1');

describe('Reading numbers from 1 - 999', () => {
  it('should read 1', () => {
    assert.equal('واحد', text.read(1));
  });
  it('should read 2', () => {
    assert.equal('ٱثنين', text.read(2));
  });
  it('should read 10', () => {
    assert.equal('عشرة', text.read(10));
  });
  it('should read 11', () => {
    assert.equal('أحد عشر', text.read(11));
  });
  it('should read 12', () => {
    assert.equal('أثني عشر', text.read(12));
  });
  it('should read 20', () => {
    assert.equal('عشرون', text.read(20));
  });
  it('should read 21', () => {
    assert.equal('واحد وعشرون', text.read(21));
  });
  it('should read 99', () => {
    assert.equal('تسعة وتسعون', text.read(99));
  });
  it('should read 100', () => {
    assert.equal('مائة', text.read(100));
  });
  it('should read 120', () => {
    assert.equal('مائة وعشرون', text.read(120));
  });
  it('should read 191', () => {
    assert.equal('مائة وواحد وتسعون', text.read(191));
  });
  it('should read 989', () => {
    assert.equal('تسعمائة وتسعة وثمانون', text.read(989));
  });
});
describe('Reading full amounts without a currecy specified', () => {
  it('should read 7,564,654', () => {
    assert.equal(
      'سبعة ملايين وخمسمائة وأربعة وستون ألف وستمائة وأربعة وخمسون فقط لا غير',
      new Tafgeet('7564654', '').parse(),
    );
  });
  it('should read 12', () => {
    assert.equal('أثني عشر فقط لا غير', new Tafgeet('12', '').parse());
  });
  it('should read 74', () => {
    assert.equal('أربعة وسبعون فقط لا غير', new Tafgeet('74', '').parse());
  });
  it('should read 234', () => {
    assert.equal('مائتين وأربعة وثلاثون فقط لا غير', new Tafgeet('234', '').parse());
  });
});
describe('Reading full amounts', () => {
  it('should read EGP 1', () => {
    assert.equal('واحد جنيه مصري فقط لا غير', new Tafgeet('1').parse());
  });
  it('should read EGP 1.20', () => {
    assert.equal('واحد جنيه مصري وعشرون قرش فقط لا غير', new Tafgeet('1.20').parse());
  });
  it('should read TND 1.200', () => {
    assert.equal('واحد دينار تونسي ومائتين مليم فقط لا غير', new Tafgeet('1.200', 'TND').parse());
  });
  it('should read SDG 1.20 even if there are three decimal places', () => {
    assert.equal('واحد جنيه سوداني وعشرون قرش فقط لا غير', new Tafgeet('1.200', 'SDG').parse());
  });
  it('should read EGP 1,000', () => {
    assert.equal('ألف جنيه مصري فقط لا غير', new Tafgeet('1000').parse());
  });
  it('should read EGP 1,345', () => {
    assert.equal('ألف وثلاثمائة وخمسة وأربعون جنيه مصري فقط لا غير', new Tafgeet('1345').parse());
  });
  it('should read EGP 2,455', () => {
    assert.equal('ألفين وأربعمائة وخمسة وخمسون جنيه مصري فقط لا غير', new Tafgeet('2455').parse());
  });
  it('should read EGP 10,000', () => {
    assert.equal('عشرة ألف جنيه مصري فقط لا غير', new Tafgeet('10000').parse());
  });
  it('should read EGP 12,444', () => {
    assert.equal('أثني عشر ألف وأربعمائة وأربعة وأربعون جنيه مصري فقط لا غير', new Tafgeet('12444').parse());
  });
  it('should read EGP 100,000', () => {
    assert.equal('مائة ألف جنيه مصري فقط لا غير', new Tafgeet('100000').parse());
  });
  it('should read EGP 101,000', () => {
    assert.equal('مائة وواحد ألف جنيه مصري فقط لا غير', new Tafgeet('101000').parse());
  });
  it('should read EGP 102,000', () => {
    assert.equal('مائة وٱثنين ألف جنيه مصري فقط لا غير', new Tafgeet('102000').parse());
  });
  it('should read EGP 1,000,000.66', () => {
    assert.equal('مليون جنيه مصري وستة وستون قرش فقط لا غير', new Tafgeet('1000000.66').parse());
  });
  it('should read TND 1,000,000.660', () => {
    assert.equal('مليون دينار تونسي وستمائة وستون مليم فقط لا غير', new Tafgeet('1000000.660', 'TND').parse());
  });
  it('should read EGP 100,000', () => {
    assert.equal('مائة ألف جنيه مصري فقط لا غير', new Tafgeet('100000').parse());
  });
  it('should read EGP 1,000,001,000', () => {
    assert.equal('مليار وألف جنيه مصري فقط لا غير', new Tafgeet('1000001000').parse());
  });
  it('should read EGP 10,010,001,000', () => {
    assert.equal('عشرة مليار وعشرة مليون وألف جنيه مصري فقط لا غير', new Tafgeet('10010001000').parse());
  });
  it('should read EGP 1,001,000,001,000', () => {
    assert.equal('ترليون ومليار وألف جنيه مصري فقط لا غير', new Tafgeet('1001000001000').parse());
  });
  it('should read EGP 1,000,000,000,001', () => {
    assert.equal('ترليون وواحد جنيه مصري فقط لا غير', new Tafgeet('1000000000001').parse());
  });
  it('should read EGP 1,000,100,000,001', () => {
    assert.equal('ترليون ومائة مليون وواحد جنيه مصري فقط لا غير', new Tafgeet('1000100000001').parse());
  });
  it('should read EGP 10,000,000', () => {
    assert.equal('عشرة مليون جنيه مصري فقط لا غير', new Tafgeet('10000000').parse());
  });
  it('should read EGP 10,000,001', () => {
    assert.equal('عشرة مليون وواحد جنيه مصري فقط لا غير', new Tafgeet('10000001').parse());
  });
  it('should read TND 1,001', () => {
    assert.equal('ألف وواحد دينار تونسي فقط لا غير', new Tafgeet('1001', 'TND').parse());
  });
  it('should read QAR 250,00.00', () => {
    assert.equal('خمسة وعشرون ألف ريال قطري فقط لا غير', new Tafgeet('25000.00', 'QAR').parse());
  });
  it('should read QAR 250,000.00', () => {
    assert.equal('مائتين وخمسون ألف ريال قطري فقط لا غير', new Tafgeet('250000.00', 'QAR').parse());
  });
  it('should read QAR 2,250,000.00', () => {
    // Pre-1.1.0 this returned the grammatically-wrong 'مليونين مائتين…' (missing و).
    // Fixed as part of issues #7/#8 — the missing-connector class of bug.
    assert.equal('مليونين ومائتين وخمسون ألف ريال قطري فقط لا غير', new Tafgeet('2250000.00', 'QAR').parse());
  });
  it('should read QAR 2,250,000.000', () => {
    assert.equal('مليارين ومائتين وخمسون مليون ريال قطري فقط لا غير', new Tafgeet('2250000000.00', 'QAR').parse());
  });
  it('should read TND 556,563.999', () => {
    assert.equal(
      'خمسمائة وستة وخمسون ألف وخمسمائة وثلاثة وستون دينار تونسي وتسعمائة وتسعة وتسعون مليم فقط لا غير',
      new Tafgeet('556563.999', 'TND').parse(),
    );
  });
  it('should read EGP 10,001', () => {
    assert.equal('عشرة ألف وواحد جنيه مصري فقط لا غير', new Tafgeet('10001').parse());
  });
  it('should read EGP 556,563.20', () => {
    assert.equal(
      'خمسمائة وستة وخمسون ألف وخمسمائة وثلاثة وستون جنيه مصري وعشرون قرش فقط لا غير',
      new Tafgeet('556563.20').parse(),
    );
  });
  it('should read EGP 100,100', () => {
    assert.equal('مائة ألف ومائة جنيه مصري فقط لا غير', new Tafgeet('100100').parse());
  });
  it('should read EGP 55,000,051,000', () => {
    assert.equal('خمسة وخمسون مليار وواحد وخمسون ألف جنيه مصري فقط لا غير', new Tafgeet('55000051000').parse());
  });
  it('should read EGP 55,000,051,000.2', () => {
    assert.equal(
      'خمسة وخمسون مليار وواحد وخمسون ألف جنيه مصري وٱثنين قرش فقط لا غير',
      new Tafgeet('55000051000.2').parse(),
    );
  });
  it('should read EGP 55,000,051,000.1', () => {
    assert.equal(
      'خمسة وخمسون مليار وواحد وخمسون ألف جنيه مصري وواحد قرش فقط لا غير',
      new Tafgeet('55000051000.1').parse(),
    );
  });

  // Regression tests for issue #8 — concats indexing bug
  // (https://github.com/omar-ehab/tafgeet-arabic/issues/8)
  // Before the fix, the "و" connector between millions and hundred-thousands
  // was wrongly suppressed by the trailing-zero cleanup loop, producing
  // outputs like "مليونمائة ألف …" instead of "مليون ومائة ألف …".
  it('should read SAR 1,100,000 (issue #8)', () => {
    assert.equal(
      'مليون ومائة ألف ريال سعودي فقط لا غير',
      new Tafgeet('1100000', 'SAR').parse(),
    );
  });
  it('should read SAR 1,010,000 (issue #8 variant)', () => {
    assert.equal(
      'مليون وعشرة ألف ريال سعودي فقط لا غير',
      new Tafgeet('1010000', 'SAR').parse(),
    );
  });
  it('should read EGP 1,100,000 (issue #8, any currency)', () => {
    assert.equal(
      'مليون ومائة ألف جنيه مصري فقط لا غير',
      new Tafgeet('1100000').parse(),
    );
  });
  it('should read EGP 1,500,000 (issue #8 variant)', () => {
    assert.equal(
      'مليون وخمسمائة ألف جنيه مصري فقط لا غير',
      new Tafgeet('1500000').parse(),
    );
  });
  it('should read EGP 1,000,100 — non-trailing zero unchanged (issue #8 control)', () => {
    assert.equal(
      'مليون ومائة جنيه مصري فقط لا غير',
      new Tafgeet('1000100').parse(),
    );
  });

  // Regression tests for issue #7 (likely the same class as #8, around the
  // 2-millions hardcoded literal branch that has been removed in 1.1.0).
  it('should read QAR 2,100,000 (issue #7 class)', () => {
    assert.equal(
      'مليونين ومائة ألف ريال قطري فقط لا غير',
      new Tafgeet('2100000', 'QAR').parse(),
    );
  });
  it('should read EGP 2,500,000 (issue #7 class)', () => {
    assert.equal(
      'مليونين وخمسمائة ألف جنيه مصري فقط لا غير',
      new Tafgeet('2500000').parse(),
    );
  });
  it('should read EGP 2,000,000 (no trailing connector)', () => {
    assert.equal('مليونين جنيه مصري فقط لا غير', new Tafgeet('2000000').parse());
  });
});
