import { assert } from 'chai';

import { InvalidAmountError, Tafgeet } from '../src';

describe('Options validation (v1.2.1 hardening)', () => {
  // Pre-1.2.1: garbage in `options` was either silently ignored, silently
  // truncated, or crashed with a raw TypeError. JS callers (who ignore TS
  // types) hit these constantly. v1.2.1 throws a typed InvalidAmountError
  // with a clear message for every bad shape.

  describe('Rejects malformed options object', () => {
    it('null throws InvalidAmountError (was raw TypeError "Cannot read properties of null")', () => {
      assert.throws(
        () => new Tafgeet('1.5', 'EGP', null as never),
        InvalidAmountError,
        /options must be a plain object, got null/,
      );
    });
    it('string throws (was silently ignored)', () => {
      assert.throws(
        () => new Tafgeet('1.5', 'EGP', 'oops' as never),
        InvalidAmountError,
        /options must be a plain object, got string/,
      );
    });
    it('number throws', () => {
      assert.throws(
        () => new Tafgeet('1', 'EGP', 42 as never),
        InvalidAmountError,
        /options must be a plain object, got number/,
      );
    });
    it('array throws (arrays are objects but not plain options)', () => {
      assert.throws(
        () => new Tafgeet('1', 'EGP', [] as never),
        InvalidAmountError,
        /options must be a plain object, got array/,
      );
    });
    it('boolean throws', () => {
      assert.throws(
        () => new Tafgeet('1', 'EGP', true as never),
        InvalidAmountError,
        /options must be a plain object, got boolean/,
      );
    });
  });

  describe('Rejects unknown keys (catches typos)', () => {
    it('{ Rounding: ... } (capital R) throws — was silently ignored', () => {
      assert.throws(
        () => new Tafgeet('1.999', 'EGP', { Rounding: 'round' } as never),
        InvalidAmountError,
        /unknown option "Rounding"\. Supported: rounding/,
      );
    });
    it('{ rounding, foo: "bar" } throws on the extra key', () => {
      assert.throws(
        () => new Tafgeet('1.5', 'EGP', { rounding: 'round', foo: 'bar' } as never),
        InvalidAmountError,
        /unknown option "foo"/,
      );
    });
    it('{ precision: 2 } (a planned-but-not-yet-implemented option) throws', () => {
      assert.throws(
        () => new Tafgeet('1.5', 'EGP', { precision: 2 } as never),
        InvalidAmountError,
        /unknown option "precision"/,
      );
    });
  });

  describe('Rejects invalid rounding values', () => {
    it('{ rounding: "XYZ" } throws — was silently truncating', () => {
      assert.throws(
        () => new Tafgeet('1.999', 'EGP', { rounding: 'XYZ' } as never),
        InvalidAmountError,
        /options\.rounding must be one of \[truncate, round, floor, ceil, bankers\], got "XYZ"/,
      );
    });
    it('{ rounding: null } throws', () => {
      assert.throws(
        () => new Tafgeet('1.5', 'EGP', { rounding: null } as never),
        InvalidAmountError,
        /options\.rounding must be one of/,
      );
    });
    it('{ rounding: 42 } throws', () => {
      assert.throws(
        () => new Tafgeet('1.5', 'EGP', { rounding: 42 } as never),
        InvalidAmountError,
        /options\.rounding must be one of/,
      );
    });
    it('error message lists all valid modes', () => {
      try {
        new Tafgeet('1.5', 'EGP', { rounding: 'XYZ' } as never);
        assert.fail('should have thrown');
      } catch (e) {
        const msg = (e as Error).message;
        for (const mode of ['truncate', 'round', 'floor', 'ceil', 'bankers']) {
          assert.include(msg, mode, `error message should list "${mode}"`);
        }
      }
    });
  });

  describe('Accepts valid shapes unchanged', () => {
    it('omitted options', () => {
      assert.doesNotThrow(() => new Tafgeet('1', 'EGP'));
    });
    it('undefined options', () => {
      assert.doesNotThrow(() => new Tafgeet('1', 'EGP', undefined));
    });
    it('empty object {}', () => {
      assert.doesNotThrow(() => new Tafgeet('1', 'EGP', {}));
    });
    it('{ rounding: undefined } (explicit undefined value)', () => {
      assert.doesNotThrow(() => new Tafgeet('1', 'EGP', { rounding: undefined }));
    });
    it('each valid rounding mode', () => {
      for (const mode of ['truncate', 'round', 'floor', 'ceil', 'bankers'] as const) {
        assert.doesNotThrow(
          () => new Tafgeet('1.5', 'EGP', { rounding: mode }),
          `rounding: '${mode}' should be accepted`,
        );
      }
    });
  });

  describe('All errors carry the correct code field', () => {
    it('every options-validation error has code === "INVALID_AMOUNT"', () => {
      const cases: Array<() => unknown> = [
        () => new Tafgeet('1', 'EGP', null as never),
        () => new Tafgeet('1', 'EGP', 'str' as never),
        () => new Tafgeet('1', 'EGP', { foo: 'bar' } as never),
        () => new Tafgeet('1', 'EGP', { rounding: 'XYZ' } as never),
      ];
      for (const fn of cases) {
        try {
          fn();
          assert.fail('should have thrown');
        } catch (e) {
          assert.instanceOf(e, InvalidAmountError);
          assert.equal((e as InvalidAmountError).code, 'INVALID_AMOUNT');
        }
      }
    });
  });
});
