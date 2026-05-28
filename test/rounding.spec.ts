import { assert } from 'chai';

import { AmountOutOfRangeError, Tafgeet, type RoundingMode } from '../src';

describe('Rounding option (1.2.0)', () => {
  describe('default rounding === truncate (preserves v1.1.x behavior)', () => {
    it('1.999 EGP defaults to truncate (fraction = 99)', () => {
      const out = new Tafgeet('1.999').parse();
      // 1.999 truncated to 2 decimals -> 1.99 -> "...وتسعة وتسعون قرش"
      assert.match(out, /وتسعة وتسعون قرش/);
      // Same as explicit truncate.
      assert.equal(out, new Tafgeet('1.999', 'EGP', { rounding: 'truncate' }).parse());
    });
    it('1.999 SDG defaults to truncate (snapshot regression test)', () => {
      assert.equal(new Tafgeet('1.999', 'SDG').parse(), new Tafgeet('1.999', 'SDG', { rounding: 'truncate' }).parse());
    });
  });

  describe("'truncate' mode (alias of 'floor' for non-negative)", () => {
    it('1.999 EGP -> 1.99', () => {
      assert.equal(new Tafgeet('1.999', 'EGP', { rounding: 'truncate' }).parse(), new Tafgeet('1.99', 'EGP').parse());
    });
    it('1.001 EGP -> 1.00', () => {
      assert.equal(new Tafgeet('1.001', 'EGP', { rounding: 'truncate' }).parse(), new Tafgeet('1.00', 'EGP').parse());
    });
    it('1.234 TND -> 1.234 (length == decimals, no rounding)', () => {
      assert.equal(new Tafgeet('1.234', 'TND', { rounding: 'truncate' }).parse(), new Tafgeet('1.234', 'TND').parse());
    });
  });

  describe("'floor' mode", () => {
    it('behaves identically to truncate for non-negative inputs', () => {
      const cases = ['1.001', '1.499', '1.500', '1.999', '99.949', '99.950'];
      for (const amount of cases) {
        assert.equal(
          new Tafgeet(amount, 'EGP', { rounding: 'floor' }).parse(),
          new Tafgeet(amount, 'EGP', { rounding: 'truncate' }).parse(),
          `floor !== truncate for ${amount}`,
        );
      }
    });
  });

  describe("'ceil' mode", () => {
    it('1.001 EGP -> 1.01 (any non-zero dropped digit carries)', () => {
      assert.equal(new Tafgeet('1.001', 'EGP', { rounding: 'ceil' }).parse(), new Tafgeet('1.01', 'EGP').parse());
    });
    it('1.991 EGP -> 2.00 (carries into integer)', () => {
      assert.equal(new Tafgeet('1.991', 'EGP', { rounding: 'ceil' }).parse(), new Tafgeet('2', 'EGP').parse());
    });
    it('1.000 EGP -> 1.00 (no dropped digits to round up)', () => {
      assert.equal(new Tafgeet('1.000', 'EGP', { rounding: 'ceil' }).parse(), new Tafgeet('1.00', 'EGP').parse());
    });
    it('1.500 EGP -> 1.50 (trailing zeros after dropped 5 still no extra carry)', () => {
      // 1.500 with decimals=2: keep="50", drop="0". 0 is zero → no carry.
      // (The dropped "0" doesn't trigger ceil because nothing non-zero remains.)
      assert.equal(new Tafgeet('1.500', 'EGP', { rounding: 'ceil' }).parse(), new Tafgeet('1.50', 'EGP').parse());
    });
  });

  describe("'round' mode (half-up)", () => {
    it('1.234 EGP -> 1.23 (drop digit 4 < 5)', () => {
      assert.equal(new Tafgeet('1.234', 'EGP', { rounding: 'round' }).parse(), new Tafgeet('1.23', 'EGP').parse());
    });
    it('1.235 EGP -> 1.24 (drop digit 5 carries)', () => {
      assert.equal(new Tafgeet('1.235', 'EGP', { rounding: 'round' }).parse(), new Tafgeet('1.24', 'EGP').parse());
    });
    it('1.236 EGP -> 1.24', () => {
      assert.equal(new Tafgeet('1.236', 'EGP', { rounding: 'round' }).parse(), new Tafgeet('1.24', 'EGP').parse());
    });
    it('1.995 EGP -> 2.00 (carries through fraction overflow into integer)', () => {
      assert.equal(new Tafgeet('1.995', 'EGP', { rounding: 'round' }).parse(), new Tafgeet('2', 'EGP').parse());
    });
    it('99.995 EGP -> 100.00 (carry across multiple digits)', () => {
      assert.equal(new Tafgeet('99.995', 'EGP', { rounding: 'round' }).parse(), new Tafgeet('100', 'EGP').parse());
    });
    it('1.2349 TND -> 1.235 (3-decimal currency)', () => {
      assert.equal(new Tafgeet('1.2349', 'TND', { rounding: 'round' }).parse(), new Tafgeet('1.235', 'TND').parse());
    });
    it('1.2345 TND -> 1.235 (half-up rounding)', () => {
      assert.equal(new Tafgeet('1.2345', 'TND', { rounding: 'round' }).parse(), new Tafgeet('1.235', 'TND').parse());
    });
  });

  describe("'bankers' mode (half-to-even, IEEE 754)", () => {
    it('1.225 EGP -> 1.22 (half + last-kept even -> no carry)', () => {
      assert.equal(new Tafgeet('1.225', 'EGP', { rounding: 'bankers' }).parse(), new Tafgeet('1.22', 'EGP').parse());
    });
    it('1.235 EGP -> 1.24 (half + last-kept odd -> carry)', () => {
      assert.equal(new Tafgeet('1.235', 'EGP', { rounding: 'bankers' }).parse(), new Tafgeet('1.24', 'EGP').parse());
    });
    it('1.245 EGP -> 1.24 (half + last-kept even -> no carry)', () => {
      assert.equal(new Tafgeet('1.245', 'EGP', { rounding: 'bankers' }).parse(), new Tafgeet('1.24', 'EGP').parse());
    });
    it('1.255 EGP -> 1.26 (half + last-kept odd -> carry)', () => {
      assert.equal(new Tafgeet('1.255', 'EGP', { rounding: 'bankers' }).parse(), new Tafgeet('1.26', 'EGP').parse());
    });
    it('1.2351 EGP -> 1.24 (NOT exactly half — falls back to round-half-up)', () => {
      // 0.5 + a tiny bit more is no longer "exactly half"
      assert.equal(new Tafgeet('1.2351', 'EGP', { rounding: 'bankers' }).parse(), new Tafgeet('1.24', 'EGP').parse());
    });
    it('1.2349 EGP -> 1.23 (drop < 0.5 — no carry regardless of mode)', () => {
      assert.equal(new Tafgeet('1.2349', 'EGP', { rounding: 'bankers' }).parse(), new Tafgeet('1.23', 'EGP').parse());
    });
  });

  describe('No-rounding cases (length <= decimals)', () => {
    it('"1.5" EGP — single fraction digit preserved as literal (no rounding involvement)', () => {
      // Historical: "1.5" with EGP gives fraction=5 (five piasters, NOT 50).
      // Rounding mode is irrelevant since length (1) <= decimals (2).
      for (const mode of ['truncate', 'round', 'floor', 'ceil', 'bankers'] satisfies RoundingMode[]) {
        assert.equal(
          new Tafgeet('1.5', 'EGP', { rounding: mode }).parse(),
          new Tafgeet('1.5', 'EGP').parse(),
          `mode=${mode} changed "1.5" output`,
        );
      }
    });
  });

  describe('Rounding can carry from fractional <1 across to integer 1 (v1.2.1 regression)', () => {
    // Pre-1.2.1: validateInput checked `intPart < 1` BEFORE rounding had a
    // chance to carry. So `'0.999'` with rounding `'round'` threw
    // AmountOutOfRangeError instead of rounding up to 1. Fixed by
    // moving the integer-range check to AFTER parseFraction returns.

    it("'0.999' EGP + round -> 1 EGP", () => {
      assert.equal(new Tafgeet('0.999', 'EGP', { rounding: 'round' }).parse(), 'واحد جنيه مصري فقط لا غير');
    });
    it("'0.999' EGP + ceil -> 1 EGP", () => {
      assert.equal(new Tafgeet('0.999', 'EGP', { rounding: 'ceil' }).parse(), 'واحد جنيه مصري فقط لا غير');
    });
    it("'0.999' EGP + bankers -> 1 EGP (drop=9 > 5 -> carry, not the exactly-half case)", () => {
      assert.equal(new Tafgeet('0.999', 'EGP', { rounding: 'bankers' }).parse(), 'واحد جنيه مصري فقط لا غير');
    });
    it("'0.991' EGP + ceil -> 1 EGP (fraction carry from ceil)", () => {
      // ceil sees drop='1' → carry, fracValue 99+1=100, overflow → intCarry=1
      assert.equal(new Tafgeet('0.991', 'EGP', { rounding: 'ceil' }).parse(), 'واحد جنيه مصري فقط لا غير');
    });
    it("'0.001' EGP + ceil -> still throws (rounds to 0.01, not 1.00)", () => {
      // Sanity: ceil rounds the FRACTION up (to 1 piaster), it doesn't
      // round the whole amount up. 0.001 → 0.01 → integer still 0.
      assert.throws(
        () => new Tafgeet('0.001', 'EGP', { rounding: 'ceil' }),
        AmountOutOfRangeError,
        /integer part must be >= 1/,
      );
    });
    it("'0.999' TND + round -> 1 TND (3-decimal currency)", () => {
      // TND has 3 decimals. '0.999' is fracStr='999' length 3 == decimals,
      // no over-precision → no rounding → fracValue=999, intCarry=0.
      // finalInt=0, throws. The carry-fix specifically helps OVER-PRECISION
      // cases where rounding generates the carry — not exact-precision cases.
      assert.throws(
        () => new Tafgeet('0.999', 'TND', { rounding: 'round' }),
        AmountOutOfRangeError,
        /integer part must be >= 1/,
      );
    });
    it("'0.9999' TND + round -> 1 TND (4-digit fraction on 3-decimal -> rounds, carries)", () => {
      assert.equal(new Tafgeet('0.9999', 'TND', { rounding: 'round' }).parse(), 'واحد دينار تونسي فقط لا غير');
    });

    // Cases that should STILL throw — verify the fix didn't accidentally
    // make us too permissive.
    it("'0.999' EGP + truncate -> still throws (no carry, finalInt=0)", () => {
      assert.throws(
        () => new Tafgeet('0.999', 'EGP', { rounding: 'truncate' }),
        AmountOutOfRangeError,
        /integer part must be >= 1/,
      );
    });
    it("'0.999' EGP + floor -> still throws", () => {
      assert.throws(
        () => new Tafgeet('0.999', 'EGP', { rounding: 'floor' }),
        AmountOutOfRangeError,
        /integer part must be >= 1/,
      );
    });
    it("'0' EGP -> still throws regardless of rounding mode", () => {
      assert.throws(() => new Tafgeet('0', 'EGP'), AmountOutOfRangeError);
      assert.throws(() => new Tafgeet('0', 'EGP', { rounding: 'round' }), AmountOutOfRangeError);
      assert.throws(() => new Tafgeet('0', 'EGP', { rounding: 'ceil' }), AmountOutOfRangeError);
    });

    // Upper-bound carry: 15-digit integer that rounds to 16 should reject.
    it("'999999999999999.999' EGP + round -> rejected (carry pushes to 16 digits)", () => {
      assert.throws(
        () => new Tafgeet('999999999999999.999', 'EGP', { rounding: 'round' }),
        AmountOutOfRangeError,
        /must be < 16 digits/,
      );
    });
  });

  describe('Backward compatibility', () => {
    it('omitting options behaves like { rounding: "truncate" }', () => {
      assert.equal(new Tafgeet('1.999', 'EGP').parse(), new Tafgeet('1.999', 'EGP', { rounding: 'truncate' }).parse());
    });
    it('omitting options behaves like {} (empty options object)', () => {
      assert.equal(new Tafgeet('1.999', 'EGP').parse(), new Tafgeet('1.999', 'EGP', {}).parse());
    });
    it('all 262 snapshot test inputs would produce identical output with any rounding mode (length <= decimals)', () => {
      // Spot-check: amounts in the existing snapshot all have length <= decimals,
      // so rounding mode shouldn't affect them.
      for (const amount of ['1.05', '100.05', '1.99', '1.005', '1.999']) {
        const fracLen = (amount.split('.')[1] ?? '').length;
        const cur = fracLen === 3 ? 'TND' : 'EGP';
        const decimals = cur === 'TND' ? 3 : 2;
        for (const mode of ['truncate', 'round', 'ceil', 'bankers'] satisfies RoundingMode[]) {
          const want = new Tafgeet(amount, cur).parse();
          const got = new Tafgeet(amount, cur, { rounding: mode }).parse();
          if (fracLen <= decimals) {
            assert.equal(got, want, `mode=${mode} changed "${amount} ${cur}"`);
          }
        }
      }
    });
  });
});
