import {
  BILLIONS,
  COLUMN_PROPERTIES,
  columns,
  currencies,
  HUNDREDS,
  MILLIONS,
  ONES,
  TEENS,
  TENS,
  THOUSANDS,
  TRILLIONS,
} from './constants';
import { NumberProperties } from './interfaces/NumberProperties';

export class Tafgeet {
  private currency: string;
  private splitted: string[];
  private fraction: number;
  private digit: number;

  // Kept for backward compatibility with anyone reaching into private
  // state — these now reference the shared module-level dictionaries
  // rather than per-instance allocations.
  private ones = ONES;
  private teens = TEENS;
  private tens = TENS;
  private hundreds = HUNDREDS;
  private thousands: NumberProperties = THOUSANDS;
  private millions: NumberProperties = MILLIONS;
  private billions: NumberProperties = BILLIONS;
  private trillions: NumberProperties = TRILLIONS;

  constructor(digit: string | number, currency: string = 'EGP') {
    Tafgeet.validateInput(digit, currency);
    this.currency = currency;
    this.splitted = digit.toString().split('.');
    this.digit = parseInt(this.splitted[0], 10);
    this.fraction = this.parseFraction(this.splitted[1], currency);
  }

  /**
   * Parses the fractional portion of the amount.
   *
   *   undefined / ""    -> 0
   *   1 digit  ("2")    -> 2           (literal, no padding — historical
   *                                     behavior preserved for backward
   *                                     compatibility; "1.2 EGP" still
   *                                     renders as "1 pound and 2 piaster",
   *                                     not "20 piaster")
   *   2 digits ("20")   -> 20
   *   3+ digits         -> truncated to the currency's decimals count
   *                        ("1.999 SDG"  -> 99,  decimals=2)
   *                        ("1.456 TND"  -> 456, decimals=3)
   */
  private parseFraction(fracStr: string | undefined, currency: string): number {
    if (!fracStr) return 0;
    if (fracStr.length <= 2) return parseInt(fracStr, 10);

    const decimals = currencies[currency as keyof typeof currencies]?.decimals ?? 2;
    return parseInt(fracStr.slice(0, decimals), 10);
  }

  /**
   * Validates the constructor arguments and throws a clear, typed error
   * for malformed input. Pre-1.1.0 invalid input either crashed deep
   * inside parse() with a cryptic TypeError, or silently produced
   * strings containing the literal word "undefined".
   *
   * Throws:
   *   TypeError  — wrong type, non-numeric string, null/undefined
   *   RangeError — NaN, Infinity, negative, zero, or > 15 digits
   *   Error      — unknown currency code
   */
  private static validateInput(digit: unknown, currency: unknown): void {
    if (digit === null || digit === undefined) {
      throw new TypeError(`Tafgeet: amount is required, got ${String(digit)}`);
    }
    if (typeof digit !== 'number' && typeof digit !== 'string') {
      throw new TypeError(`Tafgeet: amount must be a number or numeric string, got ${typeof digit}`);
    }

    let normalized: string;
    if (typeof digit === 'number') {
      if (!Number.isFinite(digit)) {
        throw new RangeError(`Tafgeet: amount must be a finite number, got ${digit}`);
      }
      if (digit < 0) {
        throw new RangeError(`Tafgeet: amount must be non-negative, got ${digit}`);
      }
      normalized = digit.toString();
    } else {
      const trimmed = digit.trim();
      if (trimmed === '' || !/^-?\d+(\.\d+)?$/.test(trimmed)) {
        throw new TypeError(
          `Tafgeet: amount string must be a plain decimal number (e.g. "1234.56"), got "${digit}"`,
        );
      }
      if (trimmed.startsWith('-')) {
        throw new RangeError(`Tafgeet: amount must be non-negative, got "${digit}"`);
      }
      normalized = trimmed;
    }

    const intPartStr = normalized.split('.')[0];
    const intPart = parseInt(intPartStr, 10);
    if (intPart < 1) {
      // Amounts < 1 (e.g. "0", "0.5") are not supported in 1.x — the
      // dictionaries have no "صفر" entry and the column logic assumes
      // at least one integer digit. Tracked as a future enhancement.
      throw new RangeError(`Tafgeet: integer part must be >= 1, got "${normalized}"`);
    }
    if (intPartStr.length >= 16) {
      throw new RangeError(`Tafgeet: integer part must be < 16 digits, got "${normalized}"`);
    }

    if (typeof currency !== 'string') {
      throw new TypeError(`Tafgeet: currency must be a string, got ${typeof currency}`);
    }
    if (currency !== '' && !(currency in currencies)) {
      const supported = Object.keys(currencies).join(', ');
      throw new Error(`Tafgeet: unknown currency "${currency}". Supported: ${supported}`);
    }
  }

  /**
   * Renders the amount as Arabic words, including the currency suffix
   * and the closing فقط لا غير.
   *
   * @throws {Error} if the integer part is 16+ digits (kept for backward
   *   compatibility — the constructor's stricter validation now catches
   *   this earlier, so this branch is unreachable from current API use).
   */
  parse(): string {
    const intStr = this.digit.toString();
    if (intStr.length >= 16) {
      throw new Error('Number out of range!');
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

      // groups[i] corresponds to column (startCol + i). The final group
      // can land at column index >= columns.length — that's the "ones"
      // position and gets rendered without a suffix.
      // Join non-zero parts with " و"; the trailing-zero cleanup is
      // implicit because we only emit non-zero groups.
      const rendered: string[] = [];
      for (let i = 0; i < groups.length; i++) {
        if (groups[i] === 0) continue;
        const colIdx = startCol + i;
        if (colIdx >= columns.length) {
          rendered.push(this.read(groups[i]));
        } else {
          rendered.push(this.addSuffixForGroup(groups[i], colIdx));
        }
      }
      str += rendered.join(' و');
    }

    if (this.currency !== '') {
      const cur = currencies[this.currency as keyof typeof currencies];
      str += ' ' + (this.digit >= 3 && this.digit <= 10 ? cur.plural : cur.singular);
      if (this.fraction !== 0) {
        // Plural-vs-singular for the FRACTION word depends on the FRACTION
        // value (3–10 → broken plural in Arabic), not on the integer part.
        // Pre-1.1.0 this incorrectly gated on `this.digit`, so e.g.
        // `1.05 EGP` returned "...وخمسة قرش" instead of "...وخمسة قروش".
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
    if (d < 10) return this.readOnes(d) ?? '';
    if (d < 100) return this.readTens(d) ?? '';
    if (d < 1000) return this.readHundreds(d);
    return '';
  }

  private length(): number {
    return this.digit.toString().length;
  }

  // Maps digit-count -> starting column index.
  // 1–3 digits: hundreds-only (handled separately in parse(), returns 0).
  // 4–6 digits: thousands (column 3).
  // 7–9 digits: millions (column 2).
  // 10–12 digits: billions (column 1).
  // 13–15 digits: trillions (column 0).
  private getColumnIndex(): number {
    const len = this.length();
    if (len <= 3) return 0;
    if (len <= 6) return 3;
    if (len <= 9) return 2;
    if (len <= 12) return 1;
    return 0;
  }

  private readOnes(d: number): string | undefined {
    if (d === 0) return undefined;
    return ONES[d];
  }

  private readTens(d: number): string | undefined {
    const onesDigit = d % 10;
    const tensDigit = Math.floor(d / 10);
    if (onesDigit === 0) return TENS[d];
    if (d > 10 && d < 20) return TEENS[d];
    if (d > 19 && d < 100) return ONES[onesDigit] + ' و' + TENS[tensDigit * 10];
    return undefined;
  }

  private readHundreds(d: number): string {
    const hundredsDigit = Math.floor(d / 100);
    const lastTwo = d % 100;
    const tensDigit = Math.floor(lastTwo / 10);
    const onesDigit = lastTwo % 10;

    let str = HUNDREDS[hundredsDigit * 100];
    if (tensDigit === 0 && onesDigit !== 0) {
      str += ' و' + ONES[onesDigit];
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
    const props = COLUMN_PROPERTIES[columns[columnIdx]];
    if (!props) return this.read(value);
    if (value === 1) return props.singular;
    if (value === 2) return props.binary;
    if (value >= 3 && value <= 9) return `${ONES[value]} ${props.plural}`;
    return `${this.read(value)} ${props.singular}`;
  }
}
