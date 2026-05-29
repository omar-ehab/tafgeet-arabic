import { COLUMN_PROPERTIES, columns, currencies, HUNDREDS, ONES, ONES_F, TEENS, TEENS_F, TENS } from './constants';
import { AmountOutOfRangeError, InvalidAmountError, UnsupportedCurrencyError } from './errors';
import { CurrencyInput, Gender, RoundingMode, TafgeetOptions } from './types';

/** The four counted-noun forms + gender that drive Arabic number agreement. */
interface CountedNoun {
  singular: string;
  dual: string;
  plural: string;
  gender: Gender;
}

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
      // Numbers >= 1e21 or < 1e-6 stringify in scientific notation
      // (e.g. "1e+21", "1.79e+308", "5e-324"). Pre-1.2.1 these slipped
      // past validation and parseFraction silently corrupted the output
      // (Number.MAX_VALUE rendered as "1.79 EGP"). Reject them here and
      // tell the caller how to recover.
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
   *
   * @throws {AmountOutOfRangeError} if the integer part is 16+ digits.
   *   Unreachable from normal API use — the constructor catches this
   *   earlier — but kept as a safety net against reflection-based misuse.
   */
  parse(): string {
    const intStr = this.digit.toString();
    // Re-validate the internal state — guards against post-construction
    // mutation (private fields are TS-only, accessible at runtime via
    // reflection). The constructor already validates these, so these only
    // fire if someone mutated state between construction and parse.
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
      str = this.renderIntegerWords(this.digit, 'm', false);
    } else {
      const cur = currencies[this.currency as keyof typeof currencies];
      str = this.renderCountedNoun(this.digit, {
        singular: cur.singular,
        dual: cur.dual,
        plural: cur.plural,
        gender: cur.gender,
      });
      if (this.fraction !== 0) {
        str +=
          ' و' +
          this.renderCountedNoun(this.fraction, {
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
   * Renders a number together with its counted noun, applying Arabic
   * agreement: 1 → noun + واحد/واحدة, 2 → the dual noun, 3–10 → number +
   * plural, everything else → number + singular. The number words for the
   * group that directly governs the noun take the noun's gender.
   */
  private renderCountedNoun(value: number, noun: CountedNoun): string {
    if (value === 1) return `${noun.singular} ${noun.gender === 'f' ? 'واحدة' : 'واحد'}`;
    if (value === 2) return noun.dual;
    const words = this.renderIntegerWords(value, noun.gender, true);
    const tail = value % 100;
    const form = tail >= 3 && tail <= 10 ? noun.plural : noun.singular;
    return `${words} ${form}`;
  }

  /**
   * Renders the number words for an integer ≥ 1 (no counted noun). `gender`
   * applies only to the lowest group — the one that directly governs the
   * counted noun; scale-multiplier groups are always masculine. `idafaToNoun`
   * is true when a counted noun immediately follows (currency mode), which
   * makes the final dual drop its nūn (ألفا جنيه, مائتا جنيه).
   */
  private renderIntegerWords(n: number, gender: Gender, idafaToNoun: boolean): string {
    const intStr = n.toString();
    if (intStr.length <= 3) {
      return this.readNumber(n, gender, idafaToNoun);
    }
    // Split into 3-digit groups, head-first (e.g. "1234567" -> [1, 234, 567]).
    const startCol = Tafgeet.columnIndexForLength(intStr.length);
    const headLen = intStr.length % 3 === 0 ? 3 : intStr.length % 3;
    const groups: number[] = [parseInt(intStr.slice(0, headLen), 10)];
    for (let i = headLen; i < intStr.length; i += 3) {
      groups.push(parseInt(intStr.slice(i, i + 3), 10));
    }

    let lastIdx = -1;
    for (let i = 0; i < groups.length; i++) {
      if ((groups[i] ?? 0) !== 0) lastIdx = i;
    }

    // groups[i] -> column (startCol + i). A trailing group past columns.length
    // is the "ones" position (no suffix) and directly governs the noun, so it
    // takes `gender`. Zero groups are skipped (implicit trailing-zero cleanup).
    const rendered: string[] = [];
    for (let i = 0; i < groups.length; i++) {
      const value = groups[i] ?? 0;
      if (value === 0) continue;
      const colIdx = startCol + i;
      const isLast = i === lastIdx;
      if (colIdx >= columns.length) {
        rendered.push(this.readNumber(value, gender, idafaToNoun && isLast));
      } else {
        rendered.push(this.addSuffixForGroup(value, colIdx, idafaToNoun && isLast));
      }
    }
    return rendered.join(' و');
  }

  /**
   * Renders a value 0–999 as Arabic words (without any column/currency suffix).
   * Exposed publicly for use as a low-level helper; for whole amounts, use
   * `parse()` instead. Always uses the masculine forms.
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
    return this.readNumber(d, 'm', false);
  }

  // Renders 0–999 with gender. Private: trusts a validated 0..999 input.
  // `idafa` only affects an exact 200 (مائتان -> مائتا when مضاف).
  private readNumber(d: number, gender: Gender, idafa: boolean): string {
    if (d === 0) return '';
    if (d < 10) return this.readOnes(d, gender);
    if (d < 100) return this.readTens(d, gender);
    return this.readHundreds(d, gender, idafa);
  }

  // Maps digit-count of an integer part -> starting column index.
  //   1–3 digits:  no column (handled by renderIntegerWords directly)
  //   4–6:  thousands (3), 7–9: millions (2), 10–12: billions (1), 13–15: trillions (0)
  private static columnIndexForLength(len: number): number {
    if (len <= 3) return 0;
    if (len <= 6) return 3;
    if (len <= 9) return 2;
    if (len <= 12) return 1;
    return 0;
  }

  // Nominative dual ...ان loses its nūn when مضاف: مائتان→مائتا, ألفان→ألفا.
  private static dropDualNun(dual: string): string {
    return dual.endsWith('ان') ? dual.slice(0, -1) : dual;
  }

  private readOnes(d: number, gender: Gender): string {
    if (d === 0) return '';
    const dict = gender === 'f' ? ONES_F : ONES;
    return dict[d] ?? '';
  }

  private readTens(d: number, gender: Gender): string {
    if (d === 10) return gender === 'f' ? 'عشر' : 'عشرة';
    const onesDigit = d % 10;
    const tensDigit = Math.floor(d / 10);
    if (onesDigit === 0) return TENS[d] ?? '';
    if (d > 10 && d < 20) {
      const dict = gender === 'f' ? TEENS_F : TEENS;
      return dict[d] ?? '';
    }
    if (d > 19 && d < 100) {
      return this.readOnes(onesDigit, gender) + ' و' + (TENS[tensDigit * 10] ?? '');
    }
    return '';
  }

  private readHundreds(d: number, gender: Gender, idafa: boolean): string {
    const hundredsDigit = Math.floor(d / 100);
    const lastTwo = d % 100;

    let head = HUNDREDS[hundredsDigit * 100] ?? '';
    // مائتان is the final word (so مضاف to the noun) only when the value is
    // exactly 200; in 2xx it is followed by the tens/ones and keeps its nūn.
    if (d === 200 && idafa) head = Tafgeet.dropDualNun(head);

    if (lastTwo === 0) return head;
    if (Math.floor(lastTwo / 10) === 0) {
      return head + ' و' + this.readOnes(lastTwo, gender);
    }
    return head + ' و' + this.readTens(lastTwo, gender);
  }

  /**
   * Renders a single 1–999 group followed by its column suffix
   * (ألف / مليون / مليار / تريليون), applying Arabic count rules. The
   * multiplier is always masculine (scale words are masculine):
   *   1     -> singular (ألف)
   *   2     -> dual (ألفان; ألفا when مضاف to a following counted noun)
   *   3–10  -> count + plural (ثلاثة آلاف, عشرة آلاف)
   *   11+   -> count + singular (مائة ألف); the count is مضاف to the scale word.
   */
  private addSuffixForGroup(value: number, columnIdx: number, idafaToNoun: boolean): string {
    const colName = columns[columnIdx];
    const props = colName ? COLUMN_PROPERTIES[colName] : undefined;
    if (!props) return this.readNumber(value, 'm', false);
    if (value === 1) return props.singular;
    if (value === 2) return idafaToNoun ? Tafgeet.dropDualNun(props.binary) : props.binary;
    if (value >= 3 && value <= 10) return `${this.readNumber(value, 'm', false)} ${props.plural}`;
    return `${this.readNumber(value, 'm', true)} ${props.singular}`;
  }
}
