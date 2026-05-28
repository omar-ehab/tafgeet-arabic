import { assert } from 'chai';

import { InvalidAmountError, Tafgeet, UnsupportedCurrencyError } from '../src';

describe('Currency trim (v1.2.1)', () => {
  // Pre-1.2.1: amount strings were trimmed, but currency strings weren't —
  // so ' EGP ' threw UnsupportedCurrencyError even though 'EGP' is valid.
  // Now trimmed for consistency.

  it("trims leading/trailing space: ' EGP '", () => {
    assert.equal(new Tafgeet('1', ' EGP ').parse(), new Tafgeet('1', 'EGP').parse());
  });
  it('trims tabs and newlines: "\\tEGP\\n"', () => {
    assert.equal(new Tafgeet('1', '\tEGP\n').parse(), new Tafgeet('1', 'EGP').parse());
  });
  it("whitespace-only currency is treated as no-currency mode (trims to '')", () => {
    assert.equal(new Tafgeet('100', '   ').parse(), new Tafgeet('100', '').parse());
  });
  it('still rejects truly-unknown currencies after trim', () => {
    assert.throws(() => new Tafgeet('1', ' BTC '), UnsupportedCurrencyError, /unknown currency/);
  });
  it('trim preserves backward compat for already-clean codes', () => {
    for (const code of ['EGP', 'SAR', 'KWD', 'USD'] as const) {
      assert.doesNotThrow(() => new Tafgeet('1', code));
    }
  });
});

describe('No-currency mode rejects fractional input (v1.2.1)', () => {
  // Pre-1.2.1: `new Tafgeet('1.50', '')` silently dropped the .50 and
  // returned 'واحد فقط لا غير' (just "one"). Now: throws so the user
  // sees their input was incompatible with no-currency mode.

  describe('rejects', () => {
    it("'1.50' in no-currency mode throws", () => {
      assert.throws(
        () => new Tafgeet('1.50', ''),
        InvalidAmountError,
        /no-currency mode does not accept fractional amounts/,
      );
    });
    it("'1.001' in no-currency mode throws (any non-zero fraction)", () => {
      assert.throws(() => new Tafgeet('1.001', ''), InvalidAmountError);
    });
    it("'100.5' in no-currency mode throws", () => {
      assert.throws(() => new Tafgeet('100.5', ''), InvalidAmountError);
    });
    it('the error message guides toward a fix', () => {
      try {
        new Tafgeet('1.50', '');
        assert.fail('should have thrown');
      } catch (e) {
        const msg = (e as Error).message;
        assert.include(msg, 'integer', 'should mention "Pass an integer"');
        assert.include(msg, 'currency', 'should mention "specify a currency"');
      }
    });
  });

  describe('accepts (no fractional content present)', () => {
    it("'1' in no-currency mode — pure integer", () => {
      assert.equal(new Tafgeet('1', '').parse(), 'واحد فقط لا غير');
    });
    it("'1.0' in no-currency mode — all-zero fraction (effectively integer)", () => {
      assert.equal(new Tafgeet('1.0', '').parse(), 'واحد فقط لا غير');
    });
    it("'1.00' in no-currency mode — all-zero fraction", () => {
      assert.equal(new Tafgeet('1.00', '').parse(), 'واحد فقط لا غير');
    });
    it("'1.000' in no-currency mode — all-zero fraction", () => {
      assert.equal(new Tafgeet('1.000', '').parse(), 'واحد فقط لا غير');
    });
    it("'7564654' in no-currency mode (regression — existing test)", () => {
      assert.equal(
        new Tafgeet('7564654', '').parse(),
        'سبعة ملايين وخمسمائة وأربعة وستون ألف وستمائة وأربعة وخمسون فقط لا غير',
      );
    });
  });
});
