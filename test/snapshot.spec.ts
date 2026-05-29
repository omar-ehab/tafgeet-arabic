import { assert } from 'chai';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { Tafgeet } from '../src';

/**
 * Snapshot tests — regression-proof safety net.
 *
 * This file defines the INPUT matrix (which combinations to test).
 * The expected outputs live in test/snapshots/parse.snap.json, which
 * is committed and reviewable in PRs. Any unintended output change
 * surfaces as a modified line in the snapshot diff.
 *
 * To regenerate the snapshot after an *intentional* output change:
 *
 *   UPDATE_SNAPSHOTS=1 npm test                  (POSIX shells)
 *   $env:UPDATE_SNAPSHOTS=1; npm test            (PowerShell)
 *
 * Then review the snapshot diff carefully before committing.
 *
 * Coverage matrix:
 *   - 24 supported currencies
 *   - Canonical numbers spanning every magnitude (1..1e12+)
 *   - The boundary numbers from the v1.2 spec
 *     (0, 1, 2, 3, 10, 11, 12, 20, 21, 99, 100, 101, 102, 111,
 *      1000, 1001, 1000000)
 *   - Fractional cases per currency (respecting its decimal precision)
 *   - Regression cases for fixed issues (#7, #8, fraction-plural)
 */

const SNAPSHOT_PATH = join(__dirname, 'snapshots', 'parse.snap.json');
const UPDATE = process.env.UPDATE_SNAPSHOTS === '1';

interface SnapshotEntry {
  amount: string;
  currency: string;
  expected: string;
}

// -- Input matrix -----------------------------------------------------------

// Alphabetical — matches SUPPORTED_CURRENCIES.
const ALL_CURRENCIES = [
  'AED',
  'AUD',
  'BHD',
  'CAD',
  'CHF',
  'DZD',
  'EGP',
  'EUR',
  'GBP',
  'IQD',
  'JOD',
  'KWD',
  'LBP',
  'LYD',
  'MAD',
  'OMR',
  'QAR',
  'SAR',
  'SDG',
  'SYP',
  'TND',
  'TRY',
  'USD',
  'YER',
] as const;
const TWO_DECIMAL_CURRENCIES = [
  'AED',
  'AUD',
  'CAD',
  'CHF',
  'DZD',
  'EGP',
  'EUR',
  'GBP',
  'LBP',
  'MAD',
  'QAR',
  'SAR',
  'SDG',
  'SYP',
  'TRY',
  'USD',
  'YER',
] as const;
const THREE_DECIMAL_CURRENCIES = ['BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND'] as const;

// Canonical magnitudes — covers every Arabic grammatical break:
//   1 (singular), 2 (dual), 3-9 (broken plural), 10, 11-19 (teens),
//   20+ (tens), 100/200 (special hundreds), thousands/millions/billions.
const CANONICAL_INTEGERS = [
  '1',
  '2',
  '3',
  '10',
  '11',
  '12',
  '13',
  '20',
  '21',
  '22',
  '23',
  '99',
  '100',
  '101',
  '102',
  '103',
  '111',
  '200',
  '500',
  '999',
  '1000',
  '1001',
  '2000',
  '10000',
  '100000',
  '1000000',
  '1000001',
  '1000003',
  '1100000',
  '10000000',
  '1000000000',
  '1234567890',
  '999999999999999', // 15-digit boundary
];

// Fractions tuned per decimal-precision.
// 2-decimal: 01, 02, 03, 05, 10, 20, 50, 66, 99
//   (covers 1/2 singular, 3-10 plural, 11+ singular, big-singular cases)
// 3-decimal: 001, 002, 005, 010, 100, 500, 999
const TWO_DECIMAL_FRACTIONS = ['01', '02', '03', '05', '10', '11', '20', '50', '66', '99'];
const THREE_DECIMAL_FRACTIONS = ['001', '002', '005', '010', '011', '100', '205', '500', '999'];

// Build the matrix.
const cases: Array<{ amount: string; currency: string }> = [];

// 1. Two currencies get the full canonical sweep: EGP (masculine, the default)
//    and TRY (feminine ليرة) — so the masculine/feminine number agreement is
//    exhaustively pinned across every magnitude.
const EXHAUSTIVE_CURRENCIES = ['EGP', 'TRY'];
for (const currency of EXHAUSTIVE_CURRENCIES) {
  for (const amount of CANONICAL_INTEGERS) {
    cases.push({ amount, currency });
  }
}

// 2. Every other currency gets a representative subset covering
//    singular / dual / plural / 11+ singular tamyīz / compound / connector.
const PER_CURRENCY_SUBSET = ['1', '2', '3', '11', '21', '100', '1000', '1100000'];
for (const currency of ALL_CURRENCIES) {
  if (EXHAUSTIVE_CURRENCIES.includes(currency)) continue; // already covered above
  for (const amount of PER_CURRENCY_SUBSET) {
    cases.push({ amount, currency });
  }
}

// 3. Fractional cases per currency (decimal-precision-aware).
for (const currency of TWO_DECIMAL_CURRENCIES) {
  for (const frac of TWO_DECIMAL_FRACTIONS) {
    cases.push({ amount: `1.${frac}`, currency });
    cases.push({ amount: `100.${frac}`, currency });
  }
}
for (const currency of THREE_DECIMAL_CURRENCIES) {
  for (const frac of THREE_DECIMAL_FRACTIONS) {
    cases.push({ amount: `1.${frac}`, currency });
    cases.push({ amount: `100.${frac}`, currency });
  }
}

// 4. Explicit regression cases for issues that were fixed in 1.1.0
//    — pinned here so any future regression breaks the snapshot
//    even if the corresponding mocha unit test were ever removed.
const REGRESSIONS: Array<{ amount: string; currency: string }> = [
  // Issue #8 — concats indexing (missing "و" connector for 1.x million)
  { amount: '1100000', currency: 'SAR' },
  { amount: '1010000', currency: 'SAR' },
  // Issue #7 class — "مليونين" literal special case
  { amount: '2100000', currency: 'QAR' },
  { amount: '2250000', currency: 'QAR' },
  // Fraction singular/plural — gated on fraction value, not integer
  { amount: '1.05', currency: 'EGP' },
  { amount: '100.05', currency: 'EGP' },
  { amount: '1.005', currency: 'TND' },
  // KWD 1.010 case from PR #3 (originally it.skip'd)
  { amount: '1.010', currency: 'KWD' },
  // No-currency mode — masculine, no إضافة so duals keep their nūn
  // (اثنان، مائتان، ألفان) — distinct from the مضاف forms in currency mode.
  { amount: '7564654', currency: '' },
  { amount: '2', currency: '' },
  { amount: '12', currency: '' },
  { amount: '13', currency: '' },
  { amount: '22', currency: '' },
  { amount: '200', currency: '' },
  { amount: '2000', currency: '' },
  // v1.4 grammar anchors — feminine fraction unit (هللة) and the
  // last-component plural rule for fractions (205 → plural).
  { amount: '1.02', currency: 'SAR' },
  { amount: '1.03', currency: 'SAR' },
  { amount: '1.205', currency: 'OMR' },
];
cases.push(...REGRESSIONS);

// -- Snapshot read / write helpers -----------------------------------------

function loadSnapshot(): SnapshotEntry[] {
  if (!existsSync(SNAPSHOT_PATH)) return [];
  return JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf-8')) as SnapshotEntry[];
}

function saveSnapshot(entries: SnapshotEntry[]): void {
  // Stable ordering: by currency, then amount-as-string (so diffs are
  // local to one currency block per change).
  const sorted = [...entries].sort((a, b) => {
    if (a.currency !== b.currency) return a.currency.localeCompare(b.currency);
    return a.amount.localeCompare(b.amount, undefined, { numeric: true });
  });
  writeFileSync(SNAPSHOT_PATH, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');
}

function key(amount: string, currency: string): string {
  return `${currency || '<empty>'} :: ${amount}`;
}

// -- Mocha suite -----------------------------------------------------------

describe('Snapshot tests', () => {
  if (UPDATE) {
    // Regenerate mode — produce a fresh snapshot from current outputs.
    it(`regenerates snapshot at ${SNAPSHOT_PATH}`, () => {
      const fresh: SnapshotEntry[] = cases.map(({ amount, currency }) => ({
        amount,
        currency,
        expected: new Tafgeet(amount, currency).parse(),
      }));
      saveSnapshot(fresh);
      console.log(`  → wrote ${fresh.length} snapshot entries`);
    });
    return;
  }

  // Assertion mode — compare each case against the committed snapshot.
  const snapshot = loadSnapshot();
  const lookup = new Map<string, string>();
  for (const entry of snapshot) {
    lookup.set(key(entry.amount, entry.currency), entry.expected);
  }

  it('snapshot file exists', () => {
    assert.isAtLeast(snapshot.length, 1, `Snapshot is empty. Run \`UPDATE_SNAPSHOTS=1 npm test\` to generate it.`);
  });

  it('snapshot covers every case in the input matrix', () => {
    const missing: string[] = [];
    for (const { amount, currency } of cases) {
      if (!lookup.has(key(amount, currency))) {
        missing.push(key(amount, currency));
      }
    }
    assert.deepEqual(
      missing,
      [],
      `Snapshot is missing ${missing.length} entries. Run \`UPDATE_SNAPSHOTS=1 npm test\`.`,
    );
  });

  for (const { amount, currency } of cases) {
    const k = key(amount, currency);
    it(k, () => {
      const expected = lookup.get(k);
      const actual = new Tafgeet(amount, currency).parse();
      assert.equal(
        actual,
        expected,
        `Output changed. If intentional, run \`UPDATE_SNAPSHOTS=1 npm test\` and review the snapshot diff.`,
      );
    });
  }
});
