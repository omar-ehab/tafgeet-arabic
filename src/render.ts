/**
 * The Arabic number→words rendering engine — pure, stateless functions that
 * live here rather than on the `Tafgeet` class (which owns input parsing and
 * the public API). They encode the grammar: gender agreement (3–10 oppose the
 * noun, 1/2 agree), singular/dual/plural selection by the governing number,
 * and the nominative dual that drops its nūn when مضاف (مائتا جنيه، ألفا جنيه).
 */

import { COLUMN_PROPERTIES, columns, HUNDREDS, ONES, ONES_F, TEENS, TEENS_F, TENS } from './constants';
import { CountedNoun, Gender } from './types';

// Nominative dual ...ان loses its nūn when مضاف: مائتان→مائتا, ألفان→ألفا.
function dropDualNun(dual: string): string {
  return dual.endsWith('ان') ? dual.slice(0, -1) : dual;
}

// Maps digit-count of an integer part -> starting column index.
//   1–3 digits: no column (handled by renderIntegerWords directly)
//   4–6: thousands (3), 7–9: millions (2), 10–12: billions (1), 13–15: trillions (0)
function columnIndexForLength(len: number): number {
  if (len <= 3) return 0;
  if (len <= 6) return 3;
  if (len <= 9) return 2;
  if (len <= 12) return 1;
  return 0;
}

function readOnes(d: number, gender: Gender): string {
  if (d === 0) return '';
  const dict = gender === 'f' ? ONES_F : ONES;
  return dict[d] ?? '';
}

function readTens(d: number, gender: Gender): string {
  if (d === 10) return gender === 'f' ? 'عشر' : 'عشرة';
  const onesDigit = d % 10;
  const tensDigit = Math.floor(d / 10);
  if (onesDigit === 0) return TENS[d] ?? '';
  if (d > 10 && d < 20) {
    const dict = gender === 'f' ? TEENS_F : TEENS;
    return dict[d] ?? '';
  }
  if (d > 19 && d < 100) {
    return readOnes(onesDigit, gender) + ' و' + (TENS[tensDigit * 10] ?? '');
  }
  return '';
}

function readHundreds(d: number, gender: Gender, idafa: boolean): string {
  const hundredsDigit = Math.floor(d / 100);
  const lastTwo = d % 100;

  let head = HUNDREDS[hundredsDigit * 100] ?? '';
  // مائتان is the final word (so مضاف to the noun) only when the value is
  // exactly 200; in 2xx it is followed by the tens/ones and keeps its nūn.
  if (d === 200 && idafa) head = dropDualNun(head);

  if (lastTwo === 0) return head;
  if (Math.floor(lastTwo / 10) === 0) {
    return head + ' و' + readOnes(lastTwo, gender);
  }
  return head + ' و' + readTens(lastTwo, gender);
}

/**
 * Renders a value 0–999 as Arabic words (no column/currency suffix).
 * Trusts a validated 0..999 input. `gender` selects the masculine/feminine
 * forms; `idafa` only affects an exact 200 (مائتان → مائتا when مضاف).
 */
export function readNumber(d: number, gender: Gender, idafa: boolean): string {
  if (d === 0) return '';
  if (d < 10) return readOnes(d, gender);
  if (d < 100) return readTens(d, gender);
  return readHundreds(d, gender, idafa);
}

/**
 * Renders a single 1–999 group followed by its column suffix
 * (ألف / مليون / مليار / تريليون). The multiplier is always masculine
 * (scale words are masculine):
 *   1     -> singular (ألف)
 *   2     -> dual (ألفان; ألفا when مضاف to a following counted noun)
 *   3–10  -> count + plural (ثلاثة آلاف, عشرة آلاف)
 *   11+   -> count + singular (مائة ألف); the count is مضاف to the scale word.
 */
function addSuffixForGroup(value: number, columnIdx: number, idafaToNoun: boolean): string {
  const colName = columns[columnIdx];
  const props = colName ? COLUMN_PROPERTIES[colName] : undefined;
  if (!props) return readNumber(value, 'm', false);
  if (value === 1) return props.singular;
  if (value === 2) return idafaToNoun ? dropDualNun(props.binary) : props.binary;
  if (value >= 3 && value <= 10) return `${readNumber(value, 'm', false)} ${props.plural}`;
  return `${readNumber(value, 'm', true)} ${props.singular}`;
}

/**
 * Renders the number words for an integer ≥ 1 (no counted noun). `gender`
 * applies only to the lowest group — the one that directly governs the
 * counted noun; scale-multiplier groups are always masculine. `idafaToNoun`
 * is true when a counted noun immediately follows (currency mode), which
 * makes the final dual drop its nūn (ألفا جنيه, مائتا جنيه).
 */
export function renderIntegerWords(n: number, gender: Gender, idafaToNoun: boolean): string {
  const intStr = n.toString();
  if (intStr.length <= 3) {
    return readNumber(n, gender, idafaToNoun);
  }
  // Split into 3-digit groups, head-first (e.g. "1234567" -> [1, 234, 567]).
  const startCol = columnIndexForLength(intStr.length);
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
      rendered.push(readNumber(value, gender, idafaToNoun && isLast));
    } else {
      rendered.push(addSuffixForGroup(value, colIdx, idafaToNoun && isLast));
    }
  }
  return rendered.join(' و');
}

/**
 * Renders a number together with its counted noun, applying Arabic
 * agreement: 1 → noun + واحد/واحدة, 2 → the dual noun, 3–10 → number +
 * plural, everything else → number + singular. The number words for the
 * group that directly governs the noun take the noun's gender.
 */
export function renderCountedNoun(value: number, noun: CountedNoun): string {
  if (value === 1) return `${noun.singular} ${noun.gender === 'f' ? 'واحدة' : 'واحد'}`;
  if (value === 2) return noun.dual;
  const words = renderIntegerWords(value, noun.gender, true);
  const tail = value % 100;
  const form = tail >= 3 && tail <= 10 ? noun.plural : noun.singular;
  return `${words} ${form}`;
}
