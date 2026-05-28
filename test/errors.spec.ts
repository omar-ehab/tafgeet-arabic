import { assert } from 'chai';

import {
  AmountOutOfRangeError,
  InvalidAmountError,
  isTafgeetError,
  Tafgeet,
  UnsupportedCurrencyError,
  type TafgeetErrorCode,
} from '../src';

describe('Custom error classes (1.2.0)', () => {
  describe('InvalidAmountError', () => {
    it('is thrown for null amount', () => {
      assert.throws(() => new Tafgeet(null as never), InvalidAmountError);
    });
    it('is thrown for undefined amount', () => {
      assert.throws(() => new Tafgeet(undefined as never), InvalidAmountError);
    });
    it('is thrown for non-numeric string', () => {
      assert.throws(() => new Tafgeet('abc'), InvalidAmountError);
    });
    it('is thrown for empty string', () => {
      assert.throws(() => new Tafgeet(''), InvalidAmountError);
    });
    it('is thrown for scientific notation', () => {
      assert.throws(() => new Tafgeet('1e3'), InvalidAmountError);
    });
    it('is thrown for non-string currency', () => {
      assert.throws(() => new Tafgeet(1, 42 as never), InvalidAmountError);
    });
    it('still passes instanceof TypeError (backward compat)', () => {
      try {
        new Tafgeet(null as never);
        assert.fail('should have thrown');
      } catch (e) {
        assert.instanceOf(e, TypeError);
        assert.instanceOf(e, InvalidAmountError);
      }
    });
    it('has code === "INVALID_AMOUNT"', () => {
      try {
        new Tafgeet('abc');
        assert.fail('should have thrown');
      } catch (e) {
        assert.instanceOf(e, InvalidAmountError);
        assert.equal((e as InvalidAmountError).code, 'INVALID_AMOUNT');
      }
    });
    it('has name === "InvalidAmountError"', () => {
      const err = new InvalidAmountError('test');
      assert.equal(err.name, 'InvalidAmountError');
    });
  });

  describe('AmountOutOfRangeError', () => {
    it('is thrown for NaN', () => {
      assert.throws(() => new Tafgeet(NaN), AmountOutOfRangeError);
    });
    it('is thrown for Infinity', () => {
      assert.throws(() => new Tafgeet(Infinity), AmountOutOfRangeError);
    });
    it('is thrown for negative number', () => {
      assert.throws(() => new Tafgeet(-5), AmountOutOfRangeError);
    });
    it('is thrown for negative string', () => {
      assert.throws(() => new Tafgeet('-5'), AmountOutOfRangeError);
    });
    it('is thrown for zero', () => {
      assert.throws(() => new Tafgeet(0), AmountOutOfRangeError);
    });
    it('is thrown for 16+ digit integer', () => {
      assert.throws(() => new Tafgeet('1000000000000000'), AmountOutOfRangeError);
    });
    it('still passes instanceof RangeError (backward compat)', () => {
      try {
        new Tafgeet(NaN);
        assert.fail('should have thrown');
      } catch (e) {
        assert.instanceOf(e, RangeError);
        assert.instanceOf(e, AmountOutOfRangeError);
      }
    });
    it('has code === "AMOUNT_OUT_OF_RANGE"', () => {
      try {
        new Tafgeet(-5);
        assert.fail('should have thrown');
      } catch (e) {
        assert.instanceOf(e, AmountOutOfRangeError);
        assert.equal((e as AmountOutOfRangeError).code, 'AMOUNT_OUT_OF_RANGE');
      }
    });
  });

  describe('UnsupportedCurrencyError', () => {
    it('is thrown for unknown currency', () => {
      assert.throws(() => new Tafgeet(1, 'BTC'), UnsupportedCurrencyError);
    });
    it('still passes instanceof Error (backward compat)', () => {
      try {
        new Tafgeet(1, 'BTC');
        assert.fail('should have thrown');
      } catch (e) {
        assert.instanceOf(e, Error);
        assert.instanceOf(e, UnsupportedCurrencyError);
      }
    });
    it('has code === "UNSUPPORTED_CURRENCY"', () => {
      try {
        new Tafgeet(1, 'BTC');
        assert.fail('should have thrown');
      } catch (e) {
        assert.instanceOf(e, UnsupportedCurrencyError);
        assert.equal((e as UnsupportedCurrencyError).code, 'UNSUPPORTED_CURRENCY');
      }
    });
    it('message lists supported codes', () => {
      try {
        new Tafgeet(1, 'BTC');
        assert.fail('should have thrown');
      } catch (e) {
        assert.match((e as Error).message, /SDG, SAR, QAR, AED, EGP, KWD, USD, AUD, TND, TRY/);
      }
    });
  });

  describe('isTafgeetError type guard', () => {
    it('returns true for InvalidAmountError', () => {
      assert.isTrue(isTafgeetError(new InvalidAmountError('msg')));
    });
    it('returns true for AmountOutOfRangeError', () => {
      assert.isTrue(isTafgeetError(new AmountOutOfRangeError('msg')));
    });
    it('returns true for UnsupportedCurrencyError', () => {
      assert.isTrue(isTafgeetError(new UnsupportedCurrencyError('msg')));
    });
    it('returns false for plain Error', () => {
      assert.isFalse(isTafgeetError(new Error('msg')));
    });
    it('returns false for plain TypeError', () => {
      assert.isFalse(isTafgeetError(new TypeError('msg')));
    });
    it('returns false for non-error values', () => {
      assert.isFalse(isTafgeetError(null));
      assert.isFalse(isTafgeetError(undefined));
      assert.isFalse(isTafgeetError('error'));
      assert.isFalse(isTafgeetError(42));
      assert.isFalse(isTafgeetError({}));
    });
    it('narrows the type — code is accessible after guard', () => {
      // Compile-time check: after isTafgeetError, `e.code` is typed.
      const e: unknown = new InvalidAmountError('msg');
      if (isTafgeetError(e)) {
        const code: TafgeetErrorCode = e.code;
        assert.equal(code, 'INVALID_AMOUNT');
      }
    });
  });

  describe('Structured error handling pattern', () => {
    // Document the recommended way to handle errors uniformly.
    function describeError(input: unknown, currency: unknown): { code: TafgeetErrorCode; message: string } | null {
      try {
        new Tafgeet(input as never, currency as never);
        return null;
      } catch (e) {
        if (isTafgeetError(e)) {
          return { code: e.code, message: e.message };
        }
        throw e;
      }
    }

    it('returns INVALID_AMOUNT for non-numeric string', () => {
      const result = describeError('abc', 'EGP');
      assert.deepNestedInclude(result, { code: 'INVALID_AMOUNT' });
    });
    it('returns AMOUNT_OUT_OF_RANGE for negative', () => {
      const result = describeError(-5, 'EGP');
      assert.deepNestedInclude(result, { code: 'AMOUNT_OUT_OF_RANGE' });
    });
    it('returns UNSUPPORTED_CURRENCY for bad currency', () => {
      const result = describeError(1, 'BTC');
      assert.deepNestedInclude(result, { code: 'UNSUPPORTED_CURRENCY' });
    });
    it('returns null for valid input', () => {
      assert.isNull(describeError('1', 'EGP'));
    });
  });
});
