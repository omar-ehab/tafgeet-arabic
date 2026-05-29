import { assert } from 'chai';

import { AmountOutOfRangeError, InvalidAmountError, Tafgeet, UnsupportedCurrencyError } from '../src';

describe('read() input validation (v1.2.1 — Bug B)', () => {
  // Pre-1.2.1: read() silently returned '' for any invalid input.
  // Docs said "0–999"; out-of-range / wrong-type calls were silent
  // failures. Now: throws typed errors.

  const t = new Tafgeet('1', 'EGP'); // any instance — read() is shared

  describe('accepts valid inputs', () => {
    it('read(0) returns empty string (no Arabic word for zero)', () => {
      assert.equal(t.read(0), '');
    });
    it('read(1) returns واحد', () => {
      assert.equal(t.read(1), 'واحد');
    });
    it('read(42) returns اثنان وأربعون', () => {
      assert.equal(t.read(42), 'اثنان وأربعون');
    });
    it('read(100) returns مائة', () => {
      assert.equal(t.read(100), 'مائة');
    });
    it('read(999) returns تسعمائة وتسعة وتسعون', () => {
      assert.equal(t.read(999), 'تسعمائة وتسعة وتسعون');
    });
  });

  describe('throws AmountOutOfRangeError for out-of-range', () => {
    it('read(-1) throws (was: silent "")', () => {
      assert.throws(() => t.read(-1), AmountOutOfRangeError, /must be in 0\.\.999, got -1/);
    });
    it('read(1000) throws (was: silent "")', () => {
      assert.throws(() => t.read(1000), AmountOutOfRangeError, /must be in 0\.\.999, got 1000/);
    });
    it('read(99999) throws', () => {
      assert.throws(() => t.read(99999), AmountOutOfRangeError);
    });
  });

  describe('throws InvalidAmountError for non-integer / non-number', () => {
    it('read(1.5) throws (was: silent "")', () => {
      assert.throws(() => t.read(1.5), InvalidAmountError, /must be a finite integer/);
    });
    it('read(NaN) throws (was: silent "")', () => {
      assert.throws(() => t.read(NaN), InvalidAmountError);
    });
    it('read(Infinity) throws (was: silent "")', () => {
      assert.throws(() => t.read(Infinity), InvalidAmountError);
    });
    it('read(-Infinity) throws', () => {
      assert.throws(() => t.read(-Infinity), InvalidAmountError);
    });
    it('read("42") throws (string not accepted; was: silent "")', () => {
      assert.throws(() => t.read('42' as never), InvalidAmountError);
    });
    it('read("abc") throws', () => {
      assert.throws(() => t.read('abc' as never), InvalidAmountError);
    });
    it('read(null) throws', () => {
      assert.throws(() => t.read(null as never), InvalidAmountError);
    });
    it('read(undefined) throws', () => {
      assert.throws(() => t.read(undefined as never), InvalidAmountError);
    });
    it('read({}) throws', () => {
      assert.throws(() => t.read({} as never), InvalidAmountError);
    });
  });
});

describe('parse() validates internal state (v1.2.1 — Bug C)', () => {
  // Pre-1.2.1: parse() trusted that this.digit was still valid. Anyone
  // mutating it via reflection (TS-private is not runtime-private) could
  // produce broken output like " جنيه مصري فقط لا غير" (leading space,
  // no number). Now: parse() re-validates this.digit's lower bound + integer-ness.
  // (Upper bound was already checked.)

  describe('throws if this.digit was mutated to invalid state', () => {
    it('digit = 0 → throws AmountOutOfRangeError (was: " جنيه مصري...")', () => {
      const t = new Tafgeet('1', 'EGP');
      // TS hides this; JS allows it. Reflection use.
      (t as unknown as { digit: number }).digit = 0;
      assert.throws(() => t.parse(), AmountOutOfRangeError, /integer part must be >= 1, got 0/);
    });
    it('digit = -5 → throws', () => {
      const t = new Tafgeet('1', 'EGP');
      (t as unknown as { digit: number }).digit = -5;
      assert.throws(() => t.parse(), AmountOutOfRangeError, />= 1/);
    });
    it('digit = 1.5 → throws (non-integer)', () => {
      const t = new Tafgeet('1', 'EGP');
      (t as unknown as { digit: number }).digit = 1.5;
      assert.throws(() => t.parse(), AmountOutOfRangeError, />= 1, got 1.5/);
    });
    it('digit = NaN → throws (non-integer)', () => {
      const t = new Tafgeet('1', 'EGP');
      (t as unknown as { digit: number }).digit = NaN;
      assert.throws(() => t.parse(), AmountOutOfRangeError);
    });
    it('digit = Infinity → throws', () => {
      const t = new Tafgeet('1', 'EGP');
      (t as unknown as { digit: number }).digit = Infinity;
      assert.throws(() => t.parse(), AmountOutOfRangeError);
    });
    it('digit = huge (16+ digits) → still throws via existing upper-bound check', () => {
      const t = new Tafgeet('1', 'EGP');
      (t as unknown as { digit: number }).digit = 100000000000000000;
      assert.throws(() => t.parse(), AmountOutOfRangeError, /< 16 digits/);
    });
  });

  describe('parse() still idempotent and unaffected on valid state', () => {
    it('repeated parse() returns same output', () => {
      const t = new Tafgeet('1234.56', 'EGP');
      assert.equal(t.parse(), t.parse());
      assert.equal(t.parse(), t.parse()); // three calls just to be sure
    });
    it('normal construction → valid parse()', () => {
      assert.equal(
        new Tafgeet('1234.56', 'EGP').parse(),
        'ألف ومائتان وأربعة وثلاثون جنيه مصري وستة وخمسون قرش فقط لا غير',
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Bug D — found in the 2nd-pass audit. Symmetric to Bug C but for currency.
  // ---------------------------------------------------------------------------
  describe('parse() validates currency state (v1.2.1 — Bug D)', () => {
    it('mutated currency = unregistered string → UnsupportedCurrencyError (was: raw TypeError)', () => {
      const t = new Tafgeet('1.50', 'EGP');
      (t as unknown as { currency: string }).currency = 'INVALID';
      assert.throws(() => t.parse(), UnsupportedCurrencyError, /unknown currency "INVALID"/);
    });
    it('mutated currency = number → InvalidAmountError (was: raw TypeError)', () => {
      const t = new Tafgeet('1.50', 'EGP');
      (t as unknown as { currency: number }).currency = 42;
      assert.throws(() => t.parse(), InvalidAmountError, /currency must be a string/);
    });
    it('mutated currency = null → InvalidAmountError', () => {
      const t = new Tafgeet('1.50', 'EGP');
      (t as unknown as { currency: null }).currency = null;
      assert.throws(() => t.parse(), InvalidAmountError, /currency must be a string/);
    });
    it('mutated currency = SAR (valid) still works (only invalid state throws)', () => {
      const t = new Tafgeet('1', 'EGP');
      (t as unknown as { currency: string }).currency = 'SAR';
      assert.equal(t.parse(), 'ريال سعودي واحد فقط لا غير');
    });
    it('mutated currency = "" → no-currency mode still works', () => {
      const t = new Tafgeet('1', 'EGP');
      (t as unknown as { currency: string }).currency = '';
      assert.equal(t.parse(), 'واحد فقط لا غير');
    });
  });
});
