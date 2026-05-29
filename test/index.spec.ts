import { assert } from 'chai';

import { Tafgeet } from '../src';

const text = new Tafgeet('1');

describe('Reading numbers from 1 - 999', () => {
  it('should read 1', () => {
    assert.equal('واحد', text.read(1));
  });
  it('should read 2', () => {
    assert.equal('اثنان', text.read(2));
  });
  it('should read 10', () => {
    assert.equal('عشرة', text.read(10));
  });
  it('should read 11', () => {
    assert.equal('أحد عشر', text.read(11));
  });
  it('should read 12', () => {
    assert.equal('اثنا عشر', text.read(12));
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
    assert.equal('اثنا عشر فقط لا غير', new Tafgeet('12', '').parse());
  });
  it('should read 74', () => {
    assert.equal('أربعة وسبعون فقط لا غير', new Tafgeet('74', '').parse());
  });
  // No-currency mode is masculine and not مضاف, so 200 keeps its nūn (مائتان).
  it('should read 234', () => {
    assert.equal('مائتان وأربعة وثلاثون فقط لا غير', new Tafgeet('234', '').parse());
  });
});
describe('Reading full amounts', () => {
  // 1 → noun + agreeing adjective (جنيه مصري واحد), not number-first.
  it('should read EGP 1', () => {
    assert.equal('جنيه مصري واحد فقط لا غير', new Tafgeet('1').parse());
  });
  it('should read EGP 1.20', () => {
    assert.equal('جنيه مصري واحد وعشرون قرش فقط لا غير', new Tafgeet('1.20').parse());
  });
  it('should read TND 1.200', () => {
    assert.equal('دينار تونسي واحد ومائتا مليم فقط لا غير', new Tafgeet('1.200', 'TND').parse());
  });
  it('should read SDG 1.20 even if there are three decimal places', () => {
    assert.equal('جنيه سوداني واحد وعشرون قرش فقط لا غير', new Tafgeet('1.200', 'SDG').parse());
  });
  it('should read EGP 1,000', () => {
    assert.equal('ألف جنيه مصري فقط لا غير', new Tafgeet('1000').parse());
  });
  it('should read EGP 1,345', () => {
    assert.equal('ألف وثلاثمائة وخمسة وأربعون جنيه مصري فقط لا غير', new Tafgeet('1345').parse());
  });
  // 2000 → the dual ألف is مضاف to the noun, so it drops its nūn: ألفا.
  it('should read EGP 2,455', () => {
    assert.equal('ألفان وأربعمائة وخمسة وخمسون جنيه مصري فقط لا غير', new Tafgeet('2455').parse());
  });
  // 10 takes the broken plural آلاف (3–10 rule), not the singular ألف.
  it('should read EGP 10,000', () => {
    assert.equal('عشرة آلاف جنيه مصري فقط لا غير', new Tafgeet('10000').parse());
  });
  it('should read EGP 12,444', () => {
    assert.equal('اثنا عشر ألف وأربعمائة وأربعة وأربعون جنيه مصري فقط لا غير', new Tafgeet('12444').parse());
  });
  it('should read EGP 100,000', () => {
    assert.equal('مائة ألف جنيه مصري فقط لا غير', new Tafgeet('100000').parse());
  });
  it('should read EGP 101,000', () => {
    assert.equal('مائة وواحد ألف جنيه مصري فقط لا غير', new Tafgeet('101000').parse());
  });
  it('should read EGP 102,000', () => {
    assert.equal('مائة واثنان ألف جنيه مصري فقط لا غير', new Tafgeet('102000').parse());
  });
  it('should read EGP 1,000,000.66', () => {
    assert.equal('مليون جنيه مصري وستة وستون قرش فقط لا غير', new Tafgeet('1000000.66').parse());
  });
  it('should read TND 1,000,000.660', () => {
    assert.equal('مليون دينار تونسي وستمائة وستون مليم فقط لا غير', new Tafgeet('1000000.660', 'TND').parse());
  });
  it('should read EGP 1,000,001,000', () => {
    assert.equal('مليار وألف جنيه مصري فقط لا غير', new Tafgeet('1000001000').parse());
  });
  // 10 billions / 10 millions take the broken plural (مليارات / ملايين).
  it('should read EGP 10,010,001,000', () => {
    assert.equal('عشرة مليارات وعشرة ملايين وألف جنيه مصري فقط لا غير', new Tafgeet('10010001000').parse());
  });
  it('should read EGP 1,001,000,001,000', () => {
    assert.equal('تريليون ومليار وألف جنيه مصري فقط لا غير', new Tafgeet('1001000001000').parse());
  });
  it('should read EGP 1,000,000,000,001', () => {
    assert.equal('تريليون وواحد جنيه مصري فقط لا غير', new Tafgeet('1000000000001').parse());
  });
  it('should read EGP 1,000,100,000,001', () => {
    assert.equal('تريليون ومائة مليون وواحد جنيه مصري فقط لا غير', new Tafgeet('1000100000001').parse());
  });
  it('should read EGP 10,000,000', () => {
    assert.equal('عشرة ملايين جنيه مصري فقط لا غير', new Tafgeet('10000000').parse());
  });
  it('should read EGP 10,000,001', () => {
    assert.equal('عشرة ملايين وواحد جنيه مصري فقط لا غير', new Tafgeet('10000001').parse());
  });
  it('should read TND 1,001', () => {
    assert.equal('ألف وواحد دينار تونسي فقط لا غير', new Tafgeet('1001', 'TND').parse());
  });
  it('should read QAR 250,00.00', () => {
    assert.equal('خمسة وعشرون ألف ريال قطري فقط لا غير', new Tafgeet('25000.00', 'QAR').parse());
  });
  it('should read QAR 250,000.00', () => {
    assert.equal('مائتان وخمسون ألف ريال قطري فقط لا غير', new Tafgeet('250000.00', 'QAR').parse());
  });
  it('should read QAR 2,250,000.00', () => {
    // Duals are rendered in the nominative (مليونان، مائتان) per v1.4.
    assert.equal('مليونان ومائتان وخمسون ألف ريال قطري فقط لا غير', new Tafgeet('2250000.00', 'QAR').parse());
  });
  it('should read QAR 2,250,000.000', () => {
    assert.equal('ملياران ومائتان وخمسون مليون ريال قطري فقط لا غير', new Tafgeet('2250000000.00', 'QAR').parse());
  });
  it('should read TND 556,563.999', () => {
    assert.equal(
      'خمسمائة وستة وخمسون ألف وخمسمائة وثلاثة وستون دينار تونسي وتسعمائة وتسعة وتسعون مليم فقط لا غير',
      new Tafgeet('556563.999', 'TND').parse(),
    );
  });
  it('should read EGP 10,001', () => {
    assert.equal('عشرة آلاف وواحد جنيه مصري فقط لا غير', new Tafgeet('10001').parse());
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
  it('should read EGP 55,000,051,000.2 (single-digit fraction padded to 20 piasters)', () => {
    assert.equal(
      'خمسة وخمسون مليار وواحد وخمسون ألف جنيه مصري وعشرون قرش فقط لا غير',
      new Tafgeet('55000051000.2').parse(),
    );
  });
  it('should read EGP 55,000,051,000.1 (single-digit fraction padded to 10 piasters)', () => {
    assert.equal(
      'خمسة وخمسون مليار وواحد وخمسون ألف جنيه مصري وعشرة قروش فقط لا غير',
      new Tafgeet('55000051000.1').parse(),
    );
  });

  // Regression tests for issue #8 — the "و" connector between a millions
  // group and the following hundred-thousands group.
  it('should read SAR 1,100,000 (issue #8)', () => {
    assert.equal('مليون ومائة ألف ريال سعودي فقط لا غير', new Tafgeet('1100000', 'SAR').parse());
  });
  it('should read SAR 1,010,000 (issue #8 variant)', () => {
    assert.equal('مليون وعشرة آلاف ريال سعودي فقط لا غير', new Tafgeet('1010000', 'SAR').parse());
  });
  it('should read EGP 1,100,000 (issue #8, any currency)', () => {
    assert.equal('مليون ومائة ألف جنيه مصري فقط لا غير', new Tafgeet('1100000').parse());
  });
  it('should read EGP 1,500,000 (issue #8 variant)', () => {
    assert.equal('مليون وخمسمائة ألف جنيه مصري فقط لا غير', new Tafgeet('1500000').parse());
  });
  it('should read EGP 1,000,100 — non-trailing zero unchanged (issue #8 control)', () => {
    assert.equal('مليون ومائة جنيه مصري فقط لا غير', new Tafgeet('1000100').parse());
  });

  // Regression tests for issue #7 — the 2-millions class (now rendered with
  // the nominative dual مليونان).
  it('should read QAR 2,100,000 (issue #7 class)', () => {
    assert.equal('مليونان ومائة ألف ريال قطري فقط لا غير', new Tafgeet('2100000', 'QAR').parse());
  });
  it('should read EGP 2,500,000 (issue #7 class)', () => {
    assert.equal('مليونان وخمسمائة ألف جنيه مصري فقط لا غير', new Tafgeet('2500000').parse());
  });
  // 2,000,000 → the dual مليون is مضاف to the noun, so it drops its nūn: مليونا.
  it('should read EGP 2,000,000 (dual مضاف drops the nūn)', () => {
    assert.equal('مليونا جنيه مصري فقط لا غير', new Tafgeet('2000000').parse());
  });

  // Regression tests for v1.2.1 — short-fraction padding bug.
  it('should read EGP 1.5 (single digit padded to 50 piasters)', () => {
    assert.equal('جنيه مصري واحد وخمسون قرش فقط لا غير', new Tafgeet('1.5').parse());
  });
  it('should read EGP 1.3 (single digit padded to 30 piasters)', () => {
    assert.equal('جنيه مصري واحد وثلاثون قرش فقط لا غير', new Tafgeet('1.3').parse());
  });
  it('should read EGP 100.5 (single digit fraction on large amount)', () => {
    assert.equal('مائة جنيه مصري وخمسون قرش فقط لا غير', new Tafgeet('100.5').parse());
  });
  it('should read TND 1.20 (2-digit fraction padded to 200 millimes)', () => {
    assert.equal('دينار تونسي واحد ومائتا مليم فقط لا غير', new Tafgeet('1.20', 'TND').parse());
  });
  it('should read TND 1.2 (single-digit fraction padded to 200 millimes)', () => {
    assert.equal('دينار تونسي واحد ومائتا مليم فقط لا غير', new Tafgeet('1.2', 'TND').parse());
  });
  it('should read KWD 1.5 (single-digit fraction padded to 500 fils)', () => {
    assert.equal('دينار كويتي واحد وخمسمائة فلس فقط لا غير', new Tafgeet('1.5', 'KWD').parse());
  });
  it('should read KWD 1.05 (2-digit fraction padded to 50 fils)', () => {
    assert.equal('دينار كويتي واحد وخمسون فلس فقط لا غير', new Tafgeet('1.05', 'KWD').parse());
  });

  // Fraction agreement: 1 → noun + واحد/واحدة, 2 → dual noun, 3–10 → plural,
  // otherwise singular — driven by the FRACTION value, not the integer.
  it('should use the واحد form for fraction=1', () => {
    assert.equal('جنيه مصري واحد وقرش واحد فقط لا غير', new Tafgeet('1.01').parse());
  });
  it('should use the dual form for fraction=2', () => {
    assert.equal('جنيه مصري واحد وقرشان فقط لا غير', new Tafgeet('1.02').parse());
  });
  it('should use PLURAL fraction word for fraction=3', () => {
    assert.equal('جنيه مصري واحد وثلاثة قروش فقط لا غير', new Tafgeet('1.03').parse());
  });
  it('should use PLURAL fraction word for fraction=5', () => {
    assert.equal('جنيه مصري واحد وخمسة قروش فقط لا غير', new Tafgeet('1.05').parse());
  });
  it('should use PLURAL fraction word for fraction=10', () => {
    assert.equal('جنيه مصري واحد وعشرة قروش فقط لا غير', new Tafgeet('1.10').parse());
  });
  it('should use SINGULAR fraction word for fraction=11', () => {
    assert.equal('جنيه مصري واحد وأحد عشر قرش فقط لا غير', new Tafgeet('1.11').parse());
  });
  it('should use SINGULAR fraction word for fraction=99', () => {
    assert.equal('جنيه مصري واحد وتسعة وتسعون قرش فقط لا غير', new Tafgeet('1.99').parse());
  });
  it('should pluralize both currency and fraction when both in 3–10', () => {
    assert.equal('خمسة جنيهات مصرية وخمسة قروش فقط لا غير', new Tafgeet('5.05').parse());
  });
  it('should pluralize fraction when integer is OUT of 3–10 (regression)', () => {
    assert.equal('مائة جنيه مصري وخمسة قروش فقط لا غير', new Tafgeet('100.05').parse());
  });
  it('should pluralize TND fraction in 3–10', () => {
    assert.equal('دينار تونسي واحد وخمسة مليمات فقط لا غير', new Tafgeet('1.005', 'TND').parse());
  });
  it('should pluralize USD fraction in 3–10', () => {
    assert.equal('دولار أمريكي واحد وخمسة سنتات فقط لا غير', new Tafgeet('1.05', 'USD').parse());
  });
});

describe('KWD (Kuwaiti Dinar — 3 decimals, originally proposed in PR #3)', () => {
  // Integer amounts — exercises singular/dual/plural for the currency word.
  it('should read KWD 1', () => {
    assert.equal('دينار كويتي واحد فقط لا غير', new Tafgeet('1', 'KWD').parse());
  });
  it('should read KWD 2', () => {
    assert.equal('ديناران كويتيان فقط لا غير', new Tafgeet('2', 'KWD').parse());
  });
  it('should read KWD 3 (plural)', () => {
    assert.equal('ثلاثة دنانير كويتية فقط لا غير', new Tafgeet('3', 'KWD').parse());
  });
  it('should read KWD 10 (plural)', () => {
    assert.equal('عشرة دنانير كويتية فقط لا غير', new Tafgeet('10', 'KWD').parse());
  });
  it('should read KWD 11 (singular)', () => {
    assert.equal('أحد عشر دينار كويتي فقط لا غير', new Tafgeet('11', 'KWD').parse());
  });

  it('should read KWD 1.001 (1 fils)', () => {
    assert.equal('دينار كويتي واحد وفلس واحد فقط لا غير', new Tafgeet('1.001', 'KWD').parse());
  });
  it('should read KWD 1.005 (5 fils — plural)', () => {
    assert.equal('دينار كويتي واحد وخمسة فلوس فقط لا غير', new Tafgeet('1.005', 'KWD').parse());
  });
  it('should read KWD 1.010 (10 fils — plural, previously skipped in PR #3)', () => {
    assert.equal('دينار كويتي واحد وعشرة فلوس فقط لا غير', new Tafgeet('1.010', 'KWD').parse());
  });
  it('should read KWD 1.100 (100 fils — singular)', () => {
    assert.equal('دينار كويتي واحد ومائة فلس فقط لا غير', new Tafgeet('1.100', 'KWD').parse());
  });
  it('should read KWD 2.500 (dual dinar + 500 fils)', () => {
    assert.equal('ديناران كويتيان وخمسمائة فلس فقط لا غير', new Tafgeet('2.500', 'KWD').parse());
  });

  it('should read KWD 123.456 (3-decimal precision)', () => {
    assert.equal(
      'مائة وثلاثة وعشرون دينار كويتي وأربعمائة وستة وخمسون فلس فقط لا غير',
      new Tafgeet('123.456', 'KWD').parse(),
    );
  });

  it('should read KWD 1,000', () => {
    assert.equal('ألف دينار كويتي فقط لا غير', new Tafgeet('1000', 'KWD').parse());
  });
  it('should read KWD 1,000,000', () => {
    assert.equal('مليون دينار كويتي فقط لا غير', new Tafgeet('1000000', 'KWD').parse());
  });
  it('should read KWD 1,100,000 (issue #8 fix still applies for KWD)', () => {
    assert.equal('مليون ومائة ألف دينار كويتي فقط لا غير', new Tafgeet('1100000', 'KWD').parse());
  });
  it('should read KWD 1,000,000,000', () => {
    assert.equal('مليار دينار كويتي فقط لا غير', new Tafgeet('1000000000', 'KWD').parse());
  });
  it('should read KWD 1,234,567.890 (mixed, large + 3-decimal fraction)', () => {
    assert.equal(
      'مليون ومائتان وأربعة وثلاثون ألف وخمسمائة وسبعة وستون دينار كويتي وثمانمائة وتسعون فلس فقط لا غير',
      new Tafgeet('1234567.890', 'KWD').parse(),
    );
  });
});

describe('Input validation (1.1.0)', () => {
  describe('rejects with TypeError', () => {
    it('null amount', () => {
      assert.throws(() => new Tafgeet(null as any), TypeError, /amount is required/);
    });
    it('undefined amount', () => {
      assert.throws(() => new Tafgeet(undefined as any), TypeError, /amount is required/);
    });
    it('boolean amount', () => {
      assert.throws(() => new Tafgeet(true as any), TypeError, /must be a number or numeric string/);
    });
    it('object amount', () => {
      assert.throws(() => new Tafgeet({} as any), TypeError, /must be a number or numeric string/);
    });
    it('empty string amount', () => {
      assert.throws(() => new Tafgeet(''), TypeError, /plain decimal number/);
    });
    it('non-numeric string', () => {
      assert.throws(() => new Tafgeet('abc'), TypeError, /plain decimal number/);
    });
    it('scientific-notation string', () => {
      assert.throws(() => new Tafgeet('1e3'), TypeError, /plain decimal number/);
    });
    it('string with leading spaces around junk', () => {
      assert.throws(() => new Tafgeet(' abc '), TypeError, /plain decimal number/);
    });
    it('numeric currency', () => {
      assert.throws(() => new Tafgeet(5, 123 as any), TypeError, /currency must be a string/);
    });
  });

  describe('rejects with RangeError', () => {
    it('NaN', () => {
      assert.throws(() => new Tafgeet(NaN), RangeError, /finite number/);
    });
    it('positive Infinity', () => {
      assert.throws(() => new Tafgeet(Infinity), RangeError, /finite number/);
    });
    it('negative Infinity', () => {
      assert.throws(() => new Tafgeet(-Infinity), RangeError, /finite number/);
    });
    it('negative number', () => {
      assert.throws(() => new Tafgeet(-5), RangeError, /non-negative/);
    });
    it('negative string', () => {
      assert.throws(() => new Tafgeet('-5'), RangeError, /non-negative/);
    });
    it('zero', () => {
      assert.throws(() => new Tafgeet(0), RangeError, /integer part must be >= 1/);
    });
    it('zero string', () => {
      assert.throws(() => new Tafgeet('0.50'), RangeError, /integer part must be >= 1/);
    });
    it('16+ digit integer', () => {
      assert.throws(() => new Tafgeet('1000000000000000'), RangeError, /< 16 digits/);
    });
  });

  describe('rejects unknown currency', () => {
    it('throws with helpful list of supported codes', () => {
      assert.throws(
        () => new Tafgeet(5, 'XYZ'),
        /unknown currency "XYZ"\. Supported: SDG, SAR, QAR, AED, EGP, KWD, USD, AUD, TND, TRY/,
      );
    });
  });

  describe('accepts valid inputs unchanged (backward compat)', () => {
    it('empty-string currency still produces no-currency output', () => {
      assert.equal('أربعة وسبعون فقط لا غير', new Tafgeet('74', '').parse());
    });
    it('default EGP currency', () => {
      assert.equal('جنيه مصري واحد فقط لا غير', new Tafgeet(1).parse());
    });
    it('numeric input (not just string)', () => {
      assert.equal('جنيه مصري واحد فقط لا غير', new Tafgeet(1).parse());
    });
    it('15-digit integer (largest supported)', () => {
      assert.doesNotThrow(() => new Tafgeet('999000000000000'));
    });
  });
});
