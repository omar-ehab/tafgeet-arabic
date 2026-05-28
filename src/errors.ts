/**
 * Custom error classes thrown by the Tafgeet constructor.
 *
 * Design notes:
 *
 *   - Each class extends the appropriate built-in (TypeError / RangeError /
 *     Error) so existing catch-by-built-in patterns continue to work:
 *
 *       try { new Tafgeet(null); } catch (e) {
 *         if (e instanceof TypeError) { ... }    // still works
 *       }
 *
 *   - Each carries a typed `code` field for structured catching:
 *
 *       try { new Tafgeet(input, currency); } catch (e) {
 *         if (isTafgeetError(e)) {
 *           switch (e.code) {
 *             case 'INVALID_AMOUNT':        ...; break;
 *             case 'AMOUNT_OUT_OF_RANGE':   ...; break;
 *             case 'UNSUPPORTED_CURRENCY':  ...; break;
 *           }
 *         }
 *       }
 *
 *   - There is NO `TafgeetError` base class. JavaScript doesn't support
 *     multiple inheritance, so a base class can't be both `extends Error`
 *     AND keep `instanceof TypeError` / `instanceof RangeError` true on
 *     subclasses. Use the `isTafgeetError` typeguard instead.
 */

/** Discriminated codes for structured error catching. */
export type TafgeetErrorCode = 'INVALID_AMOUNT' | 'AMOUNT_OUT_OF_RANGE' | 'UNSUPPORTED_CURRENCY';

/**
 * Thrown when the amount input is the wrong type or malformed:
 * null, undefined, non-numeric string, empty string, scientific
 * notation, etc.
 *
 * Extends TypeError, so `instanceof TypeError` is `true`.
 */
export class InvalidAmountError extends TypeError {
  readonly code = 'INVALID_AMOUNT' as const;

  constructor(message: string) {
    super(message);
    this.name = 'InvalidAmountError';
  }
}

/**
 * Thrown when the amount is the right type but outside the supported
 * range: NaN, ±Infinity, negative, zero (integer part < 1), or more
 * than 15 integer digits.
 *
 * Extends RangeError, so `instanceof RangeError` is `true`.
 */
export class AmountOutOfRangeError extends RangeError {
  readonly code = 'AMOUNT_OUT_OF_RANGE' as const;

  constructor(message: string) {
    super(message);
    this.name = 'AmountOutOfRangeError';
  }
}

/**
 * Thrown when the currency code is a string but not one of the
 * registered codes in `SUPPORTED_CURRENCIES`.
 *
 * Extends Error directly (currency mismatch isn't a type or range
 * issue — it's a lookup failure).
 */
export class UnsupportedCurrencyError extends Error {
  readonly code = 'UNSUPPORTED_CURRENCY' as const;

  constructor(message: string) {
    super(message);
    this.name = 'UnsupportedCurrencyError';
  }
}

/**
 * Type guard for "any error thrown by the Tafgeet constructor".
 *
 * Useful when you want to handle all Tafgeet errors uniformly and
 * forward unrelated errors (e.g. from your own code) up the stack:
 *
 *   try {
 *     ...
 *   } catch (e) {
 *     if (isTafgeetError(e)) {
 *       reportToUser(e.code, e.message);
 *     } else {
 *       throw e;
 *     }
 *   }
 */
export function isTafgeetError(e: unknown): e is InvalidAmountError | AmountOutOfRangeError | UnsupportedCurrencyError {
  return e instanceof InvalidAmountError || e instanceof AmountOutOfRangeError || e instanceof UnsupportedCurrencyError;
}
