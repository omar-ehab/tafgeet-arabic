import { COLUMN_PROPERTIES, columns, currencies, HUNDREDS, ONES, TEENS, TENS } from './constants';
import { AmountOutOfRangeError, InvalidAmountError, UnsupportedCurrencyError } from './errors';
import { CurrencyInput, RoundingMode, TafgeetOptions } from './types';

export type {
  Currency,
  Currencies,
  CurrencyCode,
  CurrencyInput,
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
    // No-currency mode silently dropped fractional input pre-1.2.1.
    // Now: reject up front (the user clearly intended fractional rendering
    // but no-currency mode has no fraction word to render with).
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
   *
   * @throws {AmountOutOfRangeError} if the integer part is 16+ digits.
   *   Unreachable from normal API use — the constructor catches this
   *   earlier — but kept as a safety net against reflection-based misuse.
   */
  parse(): string {
    const intStr = this.digit.toString();
    if (intStr.length >= 16) {
      throw new AmountOutOfRangeError('Tafgeet: integer part must be < 16 digits');
    }

    let str = '';

    // 1–3 digit amounts have no thousands/millions/etc. column at all.
    if (intStr.length <= 3) {
      str += this.read(this.digit);
    } else {
      // Split into 3-digit groups, head-first (e.g. "1234567" -> [1, 234, 567]).
      const startCol = this.getColumnIndex();
      const headLen = intStr.length % 3 === 0 ? 3 : intStr.length % 3;
      const groups: number[] = [parseInt(intStr.slice(0, headLen), 10)];
      for (let i = headLen; i < intStr.length; i += 3) {
        groups.push(parseInt(intStr.slice(i, i + 3), 10));
      }

      // groups[i] -> column (startCol + i). A trailing group past
      // columns.length is the "ones" position (no suffix). Skipping
      // zero groups makes trailing-zero cleanup implicit.
      const rendered: string[] = [];
      for (let i = 0; i < groups.length; i++) {
        const value = groups[i] ?? 0;
        if (value === 0) continue;
        const colIdx = startCol + i;
        if (colIdx >= columns.length) {
          rendered.push(this.read(value));
        } else {
          rendered.push(this.addSuffixForGroup(value, colIdx));
        }
      }
      str += rendered.join(' و');
    }

    if (this.currency !== '') {
      const cur = currencies[this.currency as keyof typeof currencies];
      str += ' ' + (this.digit >= 3 && this.digit <= 10 ? cur.plural : cur.singular);
      if (this.fraction !== 0) {
        // Arabic broken-plural rule: counts 3–10 take the plural form
        // (قروش), everything else (1, 2, 11+) takes the singular (قرش).
        const fracWord = this.fraction >= 3 && this.fraction <= 10 ? cur.fractions : cur.fraction;
        str += ' و' + this.read(this.fraction) + ' ' + fracWord;
      }
    }

    str += ' فقط لا غير';
    return str;
  }

  /**
   * Renders a value 0–999 as Arabic words (without any column/currency suffix).
   * Exposed publicly for use as a low-level helper; for whole amounts, use
   * `parse()` instead.
   */
  read(d: number): string {
    if (d < 10) return this.readOnes(d);
    if (d < 100) return this.readTens(d);
    if (d < 1000) return this.readHundreds(d);
    return '';
  }

  // Maps digit-count of the integer part -> starting column index.
  //   1–3 digits:  hundreds-only (handled separately in parse(); returns 0).
  //   4–6 digits:  thousands  (column 3)
  //   7–9 digits:  millions   (column 2)
  //   10–12 digits: billions  (column 1)
  //   13–15 digits: trillions (column 0)
  private getColumnIndex(): number {
    const len = this.digit.toString().length;
    if (len <= 3) return 0;
    if (len <= 6) return 3;
    if (len <= 9) return 2;
    if (len <= 12) return 1;
    return 0;
  }

  private readOnes(d: number): string {
    if (d === 0) return '';
    return ONES[d] ?? '';
  }

  private readTens(d: number): string {
    const onesDigit = d % 10;
    const tensDigit = Math.floor(d / 10);
    if (onesDigit === 0) return TENS[d] ?? '';
    if (d > 10 && d < 20) return TEENS[d] ?? '';
    if (d > 19 && d < 100) {
      return (ONES[onesDigit] ?? '') + ' و' + (TENS[tensDigit * 10] ?? '');
    }
    return '';
  }

  private readHundreds(d: number): string {
    const hundredsDigit = Math.floor(d / 100);
    const lastTwo = d % 100;
    const tensDigit = Math.floor(lastTwo / 10);
    const onesDigit = lastTwo % 10;

    let str = HUNDREDS[hundredsDigit * 100] ?? '';
    if (tensDigit === 0 && onesDigit !== 0) {
      str += ' و' + (ONES[onesDigit] ?? '');
    } else if (tensDigit !== 0) {
      str += ' و' + this.readTens(lastTwo);
    }
    return str;
  }

  /**
   * Renders a single 1–999 group followed by its column suffix
   * (ألف / مليون / مليار / ترليون), applying Arabic singular / dual /
   * plural rules for the count:
   *   1     -> singular (ألف)
   *   2     -> dual     (ألفين)
   *   3–9   -> count + plural (ثلاثة ألآف)
   *   10+   -> rendered + singular (عشرة ألف)
   */
  private addSuffixForGroup(value: number, columnIdx: number): string {
    const colName = columns[columnIdx];
    const props = colName ? COLUMN_PROPERTIES[colName] : undefined;
    if (!props) return this.read(value);
    if (value === 1) return props.singular;
    if (value === 2) return props.binary;
    if (value >= 3 && value <= 9) return `${ONES[value] ?? ''} ${props.plural}`;
    return `${this.read(value)} ${props.singular}`;
  }
}
