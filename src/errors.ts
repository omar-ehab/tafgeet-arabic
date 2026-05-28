/**
 * Errors thrown by the Tafgeet constructor.
 *
 * Each class extends the appropriate built-in (TypeError / RangeError /
 * Error) so existing `instanceof TypeError` patterns keep working, and
 * each carries a discriminated `code` field for structured catching via
 * the {@link isTafgeetError} type guard.
 *
 * There is no shared `TafgeetError` base class — JS has no multiple
 * inheritance, so a base couldn't both `extends Error` AND keep
 * `instanceof TypeError` true on subclasses.
 */

/** Discriminated codes for structured error catching. */
export type TafgeetErrorCode = 'INVALID_AMOUNT' | 'AMOUNT_OUT_OF_RANGE' | 'UNSUPPORTED_CURRENCY';

/**
 * Wrong type / malformed amount: null, undefined, non-numeric string,
 * empty string, scientific notation, non-string currency.
 */
export class InvalidAmountError extends TypeError {
  readonly code = 'INVALID_AMOUNT' as const;

  constructor(message: string) {
    super(message);
    this.name = 'InvalidAmountError';
  }
}

/**
 * Right type but out of range: NaN, ±Infinity, negative, zero
 * (integer part < 1), or > 15 integer digits.
 */
export class AmountOutOfRangeError extends RangeError {
  readonly code = 'AMOUNT_OUT_OF_RANGE' as const;

  constructor(message: string) {
    super(message);
    this.name = 'AmountOutOfRangeError';
  }
}

/** Currency string not in {@link SUPPORTED_CURRENCIES}. */
export class UnsupportedCurrencyError extends Error {
  readonly code = 'UNSUPPORTED_CURRENCY' as const;

  constructor(message: string) {
    super(message);
    this.name = 'UnsupportedCurrencyError';
  }
}

/** Type guard for any error thrown by the Tafgeet constructor. */
export function isTafgeetError(e: unknown): e is InvalidAmountError | AmountOutOfRangeError | UnsupportedCurrencyError {
  return e instanceof InvalidAmountError || e instanceof AmountOutOfRangeError || e instanceof UnsupportedCurrencyError;
}
