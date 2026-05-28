import { assert } from 'chai';

import { SUPPORTED_CURRENCIES, Tafgeet, type CurrencyCode } from '../src';

describe('CurrencyCode + SUPPORTED_CURRENCIES (1.2.0)', () => {
  describe('SUPPORTED_CURRENCIES runtime export', () => {
    it('is an array of all 24 built-in codes', () => {
      assert.lengthOf(SUPPORTED_CURRENCIES, 24);
      assert.includeMembers(
        [...SUPPORTED_CURRENCIES],
        [
          'EGP',
          'SAR',
          'QAR',
          'AED',
          'KWD',
          'USD',
          'AUD',
          'SDG',
          'TND',
          'TRY',
          'BHD',
          'OMR',
          'JOD',
          'IQD',
          'LYD',
          'LBP',
          'MAD',
          'DZD',
          'SYP',
          'YER',
          'EUR',
          'GBP',
          'CHF',
          'CAD',
        ],
      );
    });

    it('is frozen — cannot be mutated', () => {
      assert.throws(() => {
        (SUPPORTED_CURRENCIES as CurrencyCode[]).push('BTC' as CurrencyCode);
      }, /Cannot add property|object is not extensible/);
    });

    it('every code is round-trip valid as a Tafgeet currency arg', () => {
      for (const code of SUPPORTED_CURRENCIES) {
        const text = new Tafgeet('1', code).parse();
        assert.isString(text);
        assert.notInclude(text, 'undefined', `${code} produced "undefined" in output`);
        assert.include(text, 'فقط لا غير', `${code} missing closing فقط لا غير`);
      }
    });
  });

  describe('CurrencyCode type (compile-time)', () => {
    // These tests pass if they COMPILE — the runtime assertion is incidental.
    // The whole point of `CurrencyCode` is that TS catches typos at build time
    // (e.g. `'EPG'` instead of `'EGP'`).
    it('accepts a CurrencyCode-typed variable', () => {
      const code: CurrencyCode = 'EGP';
      const text = new Tafgeet('1', code).parse();
      assert.equal(text, 'واحد جنيه مصري فقط لا غير');
    });

    it('accepts an arbitrary string at the type level (forward compat)', () => {
      // The `(string & {})` trick in CurrencyInput preserves autocomplete
      // for the literal union while still allowing arbitrary strings —
      // useful for codes coming from APIs / user input that the type
      // system can't know about.
      const code: string = 'EGP';
      const text = new Tafgeet('1', code).parse();
      assert.equal(text, 'واحد جنيه مصري فقط لا غير');
    });

    it('runtime still rejects unknown codes', () => {
      // The type may allow `(string & {})` for forward compat, but the
      // validator still throws on unregistered codes.
      assert.throws(() => new Tafgeet('1', 'BTC'), /unknown currency "BTC"/);
    });
  });

  describe('Backward compatibility', () => {
    it('plain string literal still works as before', () => {
      assert.equal(new Tafgeet('1', 'EGP').parse(), 'واحد جنيه مصري فقط لا غير');
    });

    it('empty string (no-currency mode) still works as before', () => {
      assert.equal(new Tafgeet('1', '').parse(), 'واحد فقط لا غير');
    });

    it('default EGP still applies when currency omitted', () => {
      assert.equal(new Tafgeet('1').parse(), 'واحد جنيه مصري فقط لا غير');
    });
  });
});
