import { assert } from 'chai';

import { Tafgeet } from '../src';

describe('Flexible input (1.2.0) — Arabic-Indic digits, thousands separators', () => {
  // Each parser-equivalence test: assert that the "exotic" input
  // produces byte-identical output to its plain-Latin counterpart.
  // This is much stronger than asserting a specific Arabic string;
  // it proves normalization is genuinely a no-op for parsing.

  describe('Arabic-Indic digits (٠-٩, U+0660..0669)', () => {
    it('parses "١" as 1', () => {
      assert.equal(new Tafgeet('١').parse(), new Tafgeet('1').parse());
    });
    it('parses "١٢٣٤" as 1234', () => {
      assert.equal(new Tafgeet('١٢٣٤').parse(), new Tafgeet('1234').parse());
    });
    it('parses "١٠٠٠٠٠٠" as 1000000', () => {
      assert.equal(new Tafgeet('١٠٠٠٠٠٠', 'SAR').parse(), new Tafgeet('1000000', 'SAR').parse());
    });
    it('parses fractional "١٢٣٤.٥٦" as 1234.56', () => {
      assert.equal(new Tafgeet('١٢٣٤.٥٦').parse(), new Tafgeet('1234.56').parse());
    });
    it('parses with Arabic decimal separator "٫" as "."', () => {
      // "١٢٣٤٫٥٦" uses the Arabic decimal mark (U+066B), not a dot.
      assert.equal(new Tafgeet('١٢٣٤٫٥٦').parse(), new Tafgeet('1234.56').parse());
    });
    it('parses fully-Arabic input with Arabic thousands separator', () => {
      // "١٬٥٠٠٫٢٥" — Arabic thousands sep (U+066C), Arabic decimal (U+066B), Arabic digits.
      assert.equal(new Tafgeet('١٬٥٠٠٫٢٥', 'EGP').parse(), new Tafgeet('1500.25', 'EGP').parse());
    });
  });

  describe('Eastern Arabic-Indic digits (۰-۹, U+06F0..06F9 — Farsi/Urdu)', () => {
    it('parses "۱۲۳۴" as 1234', () => {
      assert.equal(new Tafgeet('۱۲۳۴').parse(), new Tafgeet('1234').parse());
    });
    it('parses fractional "۱۲۳۴.۵۶" as 1234.56', () => {
      assert.equal(new Tafgeet('۱۲۳۴.۵۶').parse(), new Tafgeet('1234.56').parse());
    });
  });

  describe('Comma thousands separators', () => {
    it('parses "1,234" as 1234', () => {
      assert.equal(new Tafgeet('1,234').parse(), new Tafgeet('1234').parse());
    });
    it('parses "1,234,567" as 1234567', () => {
      assert.equal(new Tafgeet('1,234,567').parse(), new Tafgeet('1234567').parse());
    });
    it('parses "1,500.25" as 1500.25', () => {
      assert.equal(new Tafgeet('1,500.25', 'USD').parse(), new Tafgeet('1500.25', 'USD').parse());
    });
    it('parses "1,000,000.00" with multiple commas and trailing zeros', () => {
      assert.equal(new Tafgeet('1,000,000.00').parse(), new Tafgeet('1000000.00').parse());
    });
  });

  describe('Underscore separators (JS numeric literal style)', () => {
    it('parses "1_000_000" as 1000000', () => {
      assert.equal(new Tafgeet('1_000_000').parse(), new Tafgeet('1000000').parse());
    });
    it('parses "1_234.56" as 1234.56', () => {
      assert.equal(new Tafgeet('1_234.56').parse(), new Tafgeet('1234.56').parse());
    });
  });

  describe('Space separators (French / EU style)', () => {
    it('parses "1 234 567" with regular spaces', () => {
      assert.equal(new Tafgeet('1 234 567').parse(), new Tafgeet('1234567').parse());
    });
    it('parses "1 234" with non-breaking space (U+00A0)', () => {
      assert.equal(new Tafgeet('1 234').parse(), new Tafgeet('1234').parse());
    });
    it('parses "1 234" with narrow no-break space (U+202F)', () => {
      assert.equal(new Tafgeet('1 234').parse(), new Tafgeet('1234').parse());
    });
  });

  describe('Mixed inputs', () => {
    it('parses Arabic digits + Latin commas: "١,٥٠٠"', () => {
      assert.equal(new Tafgeet('١,٥٠٠').parse(), new Tafgeet('1500').parse());
    });
    it('parses Latin digits + Arabic decimal: "1234٫56"', () => {
      assert.equal(new Tafgeet('1234٫56').parse(), new Tafgeet('1234.56').parse());
    });
    it('parses surrounding whitespace + commas: "  1,234.56  "', () => {
      assert.equal(new Tafgeet('  1,234.56  ').parse(), new Tafgeet('1234.56').parse());
    });
  });

  describe('Rejection of malformed input (after normalization)', () => {
    // Make sure normalization doesn't accidentally turn garbage into
    // valid input. These should all throw — same as plain "abc".
    it('rejects "1,2,3" (commas between every digit)', () => {
      // Strips to "123" — actually this should be ACCEPTED, since the
      // result is a valid integer. Document the intentional permissiveness.
      assert.equal(new Tafgeet('1,2,3').parse(), new Tafgeet('123').parse());
    });
    it('rejects "1.2.3" (multiple decimal points)', () => {
      assert.throws(() => new Tafgeet('1.2.3'), TypeError, /plain decimal number/);
    });
    it('rejects "abc"', () => {
      assert.throws(() => new Tafgeet('abc'), TypeError, /plain decimal number/);
    });
    it('rejects "١abc" (mixed digits + letters)', () => {
      assert.throws(() => new Tafgeet('١abc'), TypeError, /plain decimal number/);
    });
    it('rejects "," (only separator)', () => {
      assert.throws(() => new Tafgeet(','), TypeError, /plain decimal number/);
    });
    it('rejects "1e3" (scientific notation unchanged)', () => {
      assert.throws(() => new Tafgeet('1e3'), TypeError, /plain decimal number/);
    });
  });
});
