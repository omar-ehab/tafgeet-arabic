import { currencies } from './constants';
import { AmountOutOfRangeError, InvalidAmountError, UnsupportedCurrencyError } from './errors';
import { readNumber, renderCountedNoun, renderIntegerWords } from './render';
import { CurrencyInput, RoundingMode, TafgeetOptions } from './types';

export type {
  Currency,
  Currencies,
  CurrencyCode,
  CurrencyInput,
  Gender,
  NumberProperties,
  RoundingMode,
  TafgeetOptions,
} from './types';
export { SUPPORTED_CURRENCIES } from './constants';
export {
  InvalidAmountError,
  AmountOutOfRangeError,
  UnsupportedCurrencyError,
  isTafgeetError,
  type TafgeetErrorCode,
} from './errors';

export class Tafgeet {
  private currency: string;
  private splitted: string[];
  private fraction: number;
  private digit: number;

  constructor(digit: string | number, currency: CurrencyInput = 'EGP', options: TafgeetOptions = {}) {
    Tafgeet.validateOptions(options);
    // Trim whitespace from currency for consistency with the amount
    // (which is also trimmed during normalization). `' EGP '` works.
    const trimmedCurrency = typeof currency === 'string' ? currency.trim() : currency;
    // Format + type validation runs early; integer-range validation runs
    // AFTER rounding so that e.g. `'0.999'` with rounding `'round'` can
    // legitimately carry into integer 1 instead of being rejected as < 1.
    const normalized = Tafgeet.validateInput(digit, trimmedCurrency);
    // validateInput guarantees trimmedCurrency is now a string.
    this.currency = trimmedCurrency as string;
    this.splitted = normalized.split('.');
    // No-currency mode has no fraction word to render, so reject fractions.
    if (this.currency === '' && /[1-9]/.test(this.splitted[1] ?? '')) {
      throw new InvalidAmountError(
        `Tafgeet: no-currency mode does not accept fractional amounts (no fraction word to render), got "${normalized}". Pass an integer amount, or specify a currency.`,
      );
    }
    const intValue = parseInt(this.splitted[0] ?? '0', 10);
    const { fracValue, intCarry } = this.parseFraction(this.splitted[1], this.currency, options.rounding ?? 'truncate');
    const finalInt = intValue + intCarry;
    Tafgeet.validateIntegerRange(finalInt, normalized);
    this.digit = finalInt;
    this.fraction = fracValue;
  }

  /**
   * Validates the optional 3rd constructor argument. Strict: rejects
   * non-plain-objects, unknown keys (catches typos like `Rounding`),
   * and invalid `rounding` values. JS callers can pass anything;
   * this catches the misuses TS would have prevented at compile time.
   */
  private static validateOptions(options: unknown): void {
    if (options === undefined) return; // omitted → use defaults
    if (options === null || typeof options !== 'object' || Array.isArray(options)) {
      throw new InvalidAmountError(
        `Tafgeet: options must be a plain object, got ${options === null ? 'null' : Array.isArray(options) ? 'array' : typeof options}`,
      );
    }
    const allowedKeys = new Set(['rounding']);
    for (const key of Object.keys(options)) {
      if (!allowedKeys.has(key)) {
        throw new InvalidAmountError(`Tafgeet: unknown option "${key}". Supported: ${[...allowedKeys].join(', ')}`);
      }
    }
    const rounding = (options as { rounding?: unknown }).rounding;
    if (rounding !== undefined) {
      const allowedModes: ReadonlySet<string> = new Set(['truncate', 'round', 'floor', 'ceil', 'bankers']);
      if (typeof rounding !== 'string' || !allowedModes.has(rounding)) {
        throw new InvalidAmountError(
          `Tafgeet: options.rounding must be one of [${[...allowedModes].join(', ')}], got ${JSON.stringify(rounding)}`,
        );
      }
    }
  }

  /**
   * Normalizes Latin / Arabic-Indic / Eastern Arabic-Indic digits and
   * strips thousands separators (commas, underscores, all whitespace,
   * Arabic ٬) to a canonical Latin-digit string. Arabic decimal mark
   * ٫ becomes `.`. Does NOT pad — `'1.2'` stays two-tenths, not `'1.20'`.
   */
  private static normalizeAmount(input: string): string {
    return input
      .trim()
      .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)) // Arabic-Indic
      .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)) // Eastern Arabic-Indic (Farsi/Urdu)
      .replace(/٫/g, '.') // Arabic decimal separator
      .replace(/٬/g, '') // Arabic thousands separator
      .replace(/[,_\s]/g, ''); // comma, underscore, any whitespace
  }

  /**
   * Parses the fractional portion.
   *   - empty/undefined     -> 0
   *   - length <= decimals  -> right-pad with zeros to `decimals`, then
   *     parse. `'1.5 EGP'` -> 50 piasters (NOT 5). `'1.20 TND'` -> 200
   *     millimes (NOT 20). This matches universal decimal interpretation.
   *   - length >  decimals  -> rounding per `mode`; may carry into the
   *     integer part (`1.995 EGP` with `'round'` -> `2 EGP`).
   */
  private parseFraction(
    fracStr: string | undefined,
    currency: string,
    mode: RoundingMode,
  ): { fracValue: number; intCarry: number } {
    if (!fracStr) return { fracValue: 0, intCarry: 0 };
    const decimals = currencies[currency as keyof typeof currencies]?.decimals ?? 2;

    if (fracStr.length <= decimals) {
      // Right-pad so `'5'` for EGP -> '50' (50 piasters), not 5 piasters.
      return { fracValue: parseInt(fracStr.padEnd(decimals, '0'), 10), intCarry: 0 };
    }

    const keep = fracStr.slice(0, decimals);
    const drop = fracStr.slice(decimals);
    const kept = parseInt(keep, 10);
    const fracValue = kept + Tafgeet.computeRoundingCarry(drop, keep, mode);

    // Handle overflow: rounding pushed the fraction to 10^decimals,
    // which represents +1 of the main unit (e.g. 100 piasters = 1 pound).
    const max = 10 ** decimals;
    if (fracValue >= max) {
      return { fracValue: 0, intCarry: 1 };
    }
    return { fracValue, intCarry: 0 };
  }

  /**
   * Returns 1 if the kept fraction should be incremented under `mode`,
   * 0 otherwise. Integer arithmetic on the digit string — no FP hazards.
   * `keep` is used by `'bankers'` for the last-digit parity check.
   */
  private static computeRoundingCarry(drop: string, keep: string, mode: RoundingMode): number {
    if (mode === 'truncate' || mode === 'floor') return 0;
    const firstDropDigit = parseInt(drop.charAt(0), 10);
    if (mode === 'ceil') return /[1-9]/.test(drop) ? 1 : 0;
    if (mode === 'round') return firstDropDigit >= 5 ? 1 : 0;
    if (mode === 'bankers') {
      // Only the exactly-0.5 case differs from half-up; otherwise identical.
      const isExactlyHalf = firstDropDigit === 5 && /^0*$/.test(drop.slice(1));
      if (isExactlyHalf) {
        const lastKept = parseInt(keep.charAt(keep.length - 1), 10);
        return lastKept % 2 === 1 ? 1 : 0;
      }
      return firstDropDigit >= 5 ? 1 : 0;
    }
    return 0;
  }

  /**
   * Validates the constructor arguments and returns the canonical
   * Latin-digit amount string. Accepts `unknown` because JS callers
   * can violate the public types — that's what runtime validation is for.
   *
   * Throws InvalidAmountError / AmountOutOfRangeError /
   * UnsupportedCurrencyError as appropriate.
   */
  private static validateInput(digit: unknown, currency: unknown): string {
    if (digit === null || digit === undefined) {
      throw new InvalidAmountError(`Tafgeet: amount is required, got ${String(digit)}`);
    }
    if (typeof digit !== 'number' && typeof digit !== 'string') {
      throw new InvalidAmountError(`Tafgeet: amount must be a number or numeric string, got ${typeof digit}`);
    }

    let normalized: string;
    if (typeof digit === 'number') {
      if (!Number.isFinite(digit)) {
        throw new AmountOutOfRangeError(`Tafgeet: amount must be a finite number, got ${digit}`);
      }
      if (digit < 0) {
        throw new AmountOutOfRangeError(`Tafgeet: amount must be non-negative, got ${digit}`);
      }
      normalized = digit.toString();
      // Numbers >= 1e21 or < 1e-6 stringify in scientific notation
      // (e.g. "1e+21", "5e-324"), which parseInt would corrupt — reject them
      // and tell the caller to pass a string instead.
      if (!/^\d+(\.\d+)?$/.test(normalized)) {
        throw new AmountOutOfRangeError(
          `Tafgeet: number ${digit} is outside the representable decimal range ` +
            `(stringifies via scientific notation to "${normalized}"). ` +
            `Pass the value as a string for full precision, e.g. \`"${digit.toFixed(0)}"\`.`,
        );
      }
    } else {
      // Normalize first (Arabic-Indic digits, thousands separators, etc.)
      // BEFORE the format regex — otherwise a perfectly valid Arabic
      // numeric string like "١٬٥٠٠٫٢٥" would be wrongly rejected.
      normalized = Tafgeet.normalizeAmount(digit);
      if (normalized === '' || !/^-?\d+(\.\d+)?$/.test(normalized)) {
        throw new InvalidAmountError(
          `Tafgeet: amount string must be a plain decimal number (e.g. "1234.56"), got "${digit}"`,
        );
      }
      if (normalized.startsWith('-')) {
        throw new AmountOutOfRangeError(`Tafgeet: amount must be non-negative, got "${digit}"`);
      }
    }

    if (typeof currency !== 'string') {
      throw new InvalidAmountError(`Tafgeet: currency must be a string, got ${typeof currency}`);
    }
    if (currency !== '' && !(currency in currencies)) {
      const supported = Object.keys(currencies).join(', ');
      throw new UnsupportedCurrencyError(`Tafgeet: unknown currency "${currency}". Supported: ${supported}`);
    }

    return normalized;
  }

  /**
   * Validates the FINAL integer part (after rounding has had a chance to
   * carry from the fractional part). Range: 1..999,999,999,999,999.
   *
   * Splitting this from validateInput is what enables `'0.999' + round`
   * to legitimately become `'1'` instead of being rejected as < 1.
   */
  private static validateIntegerRange(finalInt: number, originalNormalized: string): void {
    if (finalInt < 1) {
      // Amounts < 1 (e.g. "0", "0.5") are not supported in 1.x — the
      // dictionaries have no "صفر" entry and the column logic assumes
      // at least one integer digit.
      throw new AmountOutOfRangeError(`Tafgeet: integer part must be >= 1, got "${originalNormalized}"`);
    }
    if (finalInt.toString().length >= 16) {
      // Catches both the original-too-big case and the rare "rounding
      // pushed a 15-digit integer to 16" overflow.
      throw new AmountOutOfRangeError(`Tafgeet: integer part must be < 16 digits, got "${originalNormalized}"`);
    }
  }

  /**
   * Renders the amount as Arabic words, including the currency suffix
   * and the closing فقط لا غير.
   */
  parse(): string {
    const intStr = this.digit.toString();
    // Defense in depth: re-validate state in case the (runtime-accessible)
    // private fields were mutated by reflection after construction.
    if (!Number.isInteger(this.digit) || this.digit < 1) {
      throw new AmountOutOfRangeError(`Tafgeet: integer part must be >= 1, got ${this.digit}`);
    }
    if (intStr.length >= 16) {
      throw new AmountOutOfRangeError('Tafgeet: integer part must be < 16 digits');
    }
    if (typeof this.currency !== 'string') {
      throw new InvalidAmountError(`Tafgeet: currency must be a string, got ${typeof this.currency}`);
    }
    if (this.currency !== '' && !(this.currency in currencies)) {
      throw new UnsupportedCurrencyError(`Tafgeet: unknown currency "${this.currency}"`);
    }

    let str: string;

    if (this.currency === '') {
      // No-currency mode: bare number, masculine, with no following noun
      // (so no إضافة — duals keep their nūn: مائتان, ألفان).
      str = renderIntegerWords(this.digit, 'm', false);
    } else {
      const cur = currencies[this.currency as keyof typeof currencies];
      str = renderCountedNoun(this.digit, {
        singular: cur.singular,
        dual: cur.dual,
        plural: cur.plural,
        gender: cur.gender,
      });
      if (this.fraction !== 0) {
        str +=
          ' و' +
          renderCountedNoun(this.fraction, {
            singular: cur.fraction,
            dual: cur.fractionDual,
            plural: cur.fractions,
            gender: cur.fractionGender,
          });
      }
    }

    str += ' فقط لا غير';
    return str;
  }

  /**
   * Renders a value 0–999 as Arabic words (without any column/currency suffix),
   * using the masculine forms. Exposed publicly as a low-level helper; for
   * whole amounts, use `parse()` instead.
   *
   * `0` returns `''` (no Arabic word for zero in this dictionary).
   *
   * @throws {InvalidAmountError} if `d` is not a finite integer
   * @throws {AmountOutOfRangeError} if `d` is outside the `0..999` range
   */
  read(d: number): string {
    if (typeof d !== 'number' || !Number.isFinite(d) || !Number.isInteger(d)) {
      throw new InvalidAmountError(`Tafgeet.read: argument must be a finite integer, got ${String(d)}`);
    }
    if (d < 0 || d > 999) {
      throw new AmountOutOfRangeError(`Tafgeet.read: argument must be in 0..999, got ${d}`);
    }
    return readNumber(d, 'm', false);
  }
}
