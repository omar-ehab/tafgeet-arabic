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
    this.fraction = 0;
    let fraction: string | number;
    if (this.splitted.length > 1) {
      if (this.splitted[1].length > 1) {
        fraction = parseInt(this.splitted[1], 10);
        if (fraction >= 1 && fraction <= 99) {
          this.fraction = this.splitted[1].length === 1 ? fraction * 10 : fraction;
        } else {
          // trim it
          const trimmed = this.splitted[1].split('');
          fraction = '';
          for (let index = 0; index < currencies[currency as keyof typeof currencies].decimals; index++) {
            fraction += trimmed[index];
          }
          this.fraction = parseInt(fraction, 10);
        }
      } else {
        this.fraction = parseInt(this.splitted[1], 10);
      }
    }
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

  parse() {
    const serialized: string[][] = [];
    let tmp: string[] = [];
    let inc = 1;
    const count = this.length();
    let columnIdx = this.getColumnIndex();
    if (count >= 16) {
      throw new Error('Number out of range!');
    }
    // Sperate the number into columns
    Array.from(this.digit.toString())
      .reverse()
      .forEach((d, i) => {
        tmp.push(d);
        if (inc === 3) {
          serialized.unshift(tmp);
          tmp = [];
          inc = 0;
        }
        if (inc === 0 && count - (i + 1) < 3 && count - (i + 1) !== 0) {
          serialized.unshift(tmp);
        }
        inc++;
      });

    // Generate concatenation array
    const concats: string[] = [];
    for (let i = this.getColumnIndex(); i < columns.length; i++) {
      concats[i] = ' و';
    }

    // Suppress the "و" connector that would precede a trailing zero group.
    // serialized[i] corresponds to column (startCol + i); the connector emitted
    // AFTER that column lives in concats[startCol + i]. The connector that
    // would INTRODUCE serialized[i] lives at concats[startCol + i - 1].
    // For each trailing zero group, clear the connector that would have led to it.
    if (this.digit > 999) {
      const startCol = this.getColumnIndex();
      for (let i = serialized.length - 1; i >= 1; i--) {
        if (parseInt(serialized[i].join(''), 10) !== 0) {
          break;
        }
        const connectorCol = startCol + i - 1;
        if (connectorCol >= 0 && connectorCol < columns.length) {
          concats[connectorCol] = '';
        }
      }
    }

    let str = '';

    if (this.length() >= 1 && this.length() <= 3) {
      str += this.read(this.digit);
    } else {
      for (const element of serialized) {
        const joinedNumber = parseInt(element.reverse().join(''), 10);
        if (joinedNumber === 0) {
          columnIdx++;
          continue;
        }
        if (columnIdx + 1 > columns.length) {
          str += this.read(joinedNumber);
        } else {
          str += this.addSuffixPrefix(element, columnIdx) + concats[columnIdx];
        }
        columnIdx++;
      }
    }

    if (this.currency !== '') {
      if (this.digit >= 3 && this.digit <= 10) {
        str += ' ' + currencies[this.currency as keyof typeof currencies].plural;
      } else {
        str += ' ' + currencies[this.currency as keyof typeof currencies].singular;
      }
      if (this.fraction !== 0) {
        // Plural-vs-singular for the FRACTION word depends on the FRACTION
        // value (3–10 → broken plural in Arabic), not on the integer part.
        // Pre-1.1.0 this incorrectly gated on `this.digit`, so e.g.
        // `1.05 EGP` returned "...وخمسة قرش" instead of "...وخمسة قروش".
        if (this.fraction >= 3 && this.fraction <= 10) {
          str += ' و' + this.read(this.fraction) + ' ' + currencies[this.currency as keyof typeof currencies].fractions;
        } else {
          str += ' و' + this.read(this.fraction) + ' ' + currencies[this.currency as keyof typeof currencies].fraction;
        }
      }
    }

    str += ' فقط لا غير';
    return str;
  }

  read(d: number) {
    let str = '';
    const len = Array.from(d.toString()).length;
    if (len === 1) {
      str += this.readOnes(d);
    } else if (len === 2) {
      str += this.readTens(d);
    } else if (len === 3) {
      str += this.readHundreds(d);
    }
    return str;
  }

  private length() {
    return Array.from(this.digit.toString()).length;
  }

  private getColumnIndex() {
    let column = 0;
    if (this.length() > 12) {
      column = 0;
    } else if (this.length() <= 12 && this.length() > 9) {
      column = 1;
    } else if (this.length() <= 9 && this.length() > 6) {
      column = 2;
    } else if (this.length() <= 6 && this.length() >= 4) {
      column = 3;
    }
    return column;
  }

  private readOnes(d: number): string | undefined {
    if (d === 0) return;
    return ONES[d];
  }

  private readTens(d: number): string | undefined {
    if (Array.from(d.toString())[1] === '0') {
      return TENS[d];
    }
    if (d > 10 && d < 20) {
      return TEENS[d];
    }
    if (d > 19 && d < 100 && Array.from(d.toString())[1] !== '0') {
      const tensDigit = parseInt(Array.from(d.toString())[0], 10);
      const onesDigit = parseInt(Array.from(d.toString())[1], 10);
      return this.readOnes(onesDigit) + ' و' + TENS[tensDigit * 10];
    }
  }

  private readHundreds(d: number): string {
    const hundredsDigit = parseInt(Array.from(d.toString())[0], 10);
    let str = HUNDREDS[hundredsDigit * 100];

    if (Array.from(d.toString())[1] === '0' && Array.from(d.toString())[2] !== '0') {
      str += ' و' + this.readOnes(parseInt(Array.from(d.toString())[2], 10));
    }

    if (Array.from(d.toString())[1] !== '0') {
      str += ' و' + this.readTens(parseInt(Array.from(d.toString())[1] + Array.from(d.toString())[2], 10));
    }
    return str;
  }

  private addSuffixPrefix(arr: string[], columnIdx: number): string | undefined {
    const columnConstant = this.getColumnConstantByColumnIdx(columnIdx);
    if (!columnConstant) return undefined;
    if (arr.length === 1) {
      const v = parseInt(arr[0], 10);
      if (v === 1) return columnConstant.singular;
      if (v === 2) return columnConstant.binary;
      if (v > 2 && v <= 9) return `${this.readOnes(v)} ${columnConstant.plural}`;
      return undefined;
    }
    const joinedNumber = parseInt(arr.join(''), 10);
    if (joinedNumber > 1) {
      return `${this.read(joinedNumber)} ${columnConstant.singular}`;
    }
    return columnConstant.singular;
  }

  private getColumnConstantByColumnIdx(columnIdx: number): NumberProperties | null {
    const colName = columns[columnIdx];
    return COLUMN_PROPERTIES[colName] ?? null;
  }
}
