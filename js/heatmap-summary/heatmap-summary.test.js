/**
 * Tests for heatmap-summary.js — run with:  node heatmap-summary.test.js
 * No dependencies. Exits non-zero on failure.
 */
'use strict';
const assert = require('assert');
const { summariseHeatmap, buildHeatmapGrid, weekdayCounts } = require('./heatmap-summary.js');

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const grid = fn => [0, 1, 2, 3, 4, 5, 6].map(d => HOURS.map((h, c) => Math.max(0, Math.round(fn(d, h, c)))));
const allOpen = () => grid(() => 1).map(r => r.map(() => true));
const THREE_WEEKS = [3, 3, 3, 3, 3, 3, 3];

// A typical lunch-and-dinner outlet, busier towards the weekend.
const shape = (d, h) => (120 + Math.exp(-((h - 12.5) ** 2) / 2) * 900 + Math.exp(-((h - 18.5) ** 2) / 2.2) * 1100)
  * [0.7, 0.75, 0.8, 0.9, 1.2, 1.4, 1.0][d];
const typicalWeek = grid(shape);
const times = (g, k) => g.map(r => r.map(v => v * k));

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { failed++; console.log('  ✗ ' + name + '\n      ' + e.message); }
}

console.log('\nweekdayCounts');
test('three whole weeks give three of each weekday', () => {
  assert.deepStrictEqual(weekdayCounts('2026-09-01', '2026-09-21'), [3, 3, 3, 3, 3, 3, 3]);
});
test('a 31-day month is uneven (Aug 2026 has five Sat, Sun, Mon)', () => {
  assert.deepStrictEqual(weekdayCounts('2026-08-01', '2026-08-31'), [5, 4, 4, 4, 4, 5, 5]);
});
test('rejects end before start', () => {
  assert.throws(() => weekdayCounts('2026-09-10', '2026-09-01'), RangeError);
});

console.log('\nbuildHeatmapGrid');
test('refuses to run without a timezone', () => {
  assert.throws(() => buildHeatmapGrid([], { hours: HOURS }), /timeZone/);
});
test('buckets a UTC timestamp into Sydney local time, not UTC', () => {
  // 08:30 UTC on Fri 4 Sep 2026 = 18:30 AEST (UTC+10). A naive UTC bucket
  // would put this in the 8am column, which isn't even on the grid.
  const { grid: g } = buildHeatmapGrid(
    [{ createdAt: '2026-09-04T08:30:00Z', total: 100, tips: 0 }],
    { hours: HOURS, timeZone: 'Australia/Sydney' });
  assert.strictEqual(g[4][HOURS.indexOf(18)], 100);
});
test('respects DST — the same UTC time lands an hour later in summer', () => {
  // 08:30 UTC on Fri 4 Dec 2026 = 19:30 AEDT (UTC+11).
  const { grid: g } = buildHeatmapGrid(
    [{ createdAt: '2026-12-04T08:30:00Z', total: 100 }],
    { hours: HOURS, timeZone: 'Australia/Sydney' });
  assert.strictEqual(g[4][HOURS.indexOf(19)], 100);
});
test('per-invoice timezones for groups spanning zones', () => {
  const { grid: g } = buildHeatmapGrid(
    [{ createdAt: '2026-09-04T04:00:00Z', total: 50, tz: 'Asia/Singapore' },      // 12:00 SGT
     { createdAt: '2026-09-04T02:00:00Z', total: 70, tz: 'Australia/Sydney' }],   // 12:00 AEST
    { hours: HOURS, timeZoneFor: inv => inv.tz });
  assert.strictEqual(g[4][HOURS.indexOf(12)], 120);
});
test('excludes refunds and deleted invoices by default, and counts them', () => {
  const r = buildHeatmapGrid([
    { createdAt: '2026-09-04T02:00:00Z', total: 100 },
    { createdAt: '2026-09-04T02:00:00Z', total: 40, isRefund: true },
    { createdAt: '2026-09-04T02:00:00Z', total: 999, deleted: true }
  ], { hours: HOURS, timeZone: 'Australia/Sydney' });
  assert.strictEqual(r.grid[4][HOURS.indexOf(12)], 100);
  assert.strictEqual(r.dropped.refunds, 1);
  assert.strictEqual(r.dropped.deleted, 1);
});
test('subtracts tips from revenue by default', () => {
  const { grid: g } = buildHeatmapGrid([{ createdAt: '2026-09-04T02:00:00Z', total: 110, tips: 10 }],
    { hours: HOURS, timeZone: 'Australia/Sydney' });
  assert.strictEqual(g[4][HOURS.indexOf(12)], 100);
});
test('counts sales outside the grid hours instead of losing them silently', () => {
  const r = buildHeatmapGrid([{ createdAt: '2026-09-04T12:00:00Z', total: 100 }], // 22:00 AEST
    { hours: HOURS, timeZone: 'Australia/Sydney' });
  assert.strictEqual(r.dropped.outsideHours, 1);
});

console.log('\nsummariseHeatmap — correctness traps');
test('uneven weekday counts do not make a day "lead" (five Saturdays)', () => {
  // Every day trades identically per occurrence, but the month has five
  // Saturdays. Raw totals would crown Saturday; normalised, nothing leads.
  const flatPerDay = grid(() => 500);
  const counts = [4, 4, 4, 4, 4, 5, 4];
  const summed = flatPerDay.map((r, d) => r.map(v => v * counts[d]));
  const { text, findings } = summariseHeatmap({
    mode: 'period', hours: HOURS, current: { grid: summed, dayCounts: counts }
  });
  assert.ok(!findings.some(f => f.key === 'dayRange'), 'dayRange fired: ' + text);
  assert.ok(!/Saturday/.test(text), 'mentions Saturday: ' + text);
});
test('closed hours are never reported as a trough', () => {
  // Shut 3–4pm every day. With zeros treated as trading, 3pm would be the
  // "dependable dip"; with the open mask it must not be mentioned.
  const shut = grid((d, h) => (h === 15 ? 0 : shape(d, h)));
  const open = allOpen().map(r => r.map((_, c) => HOURS[c] !== 15));
  const { text } = summariseHeatmap({
    mode: 'period', hours: HOURS, current: { grid: shut, dayCounts: THREE_WEEKS, open }
  });
  assert.ok(!/3pm/.test(text), 'mentions 3pm: ' + text);
});
test('zero sales inside open hours are returned as a gap', () => {
  const g = typicalWeek.map(r => r.slice());
  g[3][HOURS.indexOf(18)] = 0; g[3][HOURS.indexOf(19)] = 0; // Thursday 6–8pm
  const { gaps } = summariseHeatmap({
    mode: 'period', hours: HOURS, current: { grid: g, dayCounts: THREE_WEEKS, open: allOpen() }
  });
  assert.deepStrictEqual(gaps, [{ day: 'Thursday', dayIndex: 3, fromHour: 18, toHour: 20 }]);
});
test('compare mode is like-for-like across periods with different weekday mixes', () => {
  // Identical trade per occurrence; August has extra Sat/Sun/Mon. Should read
  // as unchanged, not as a drop.
  const aug = [5, 4, 4, 4, 4, 5, 5], sep = THREE_WEEKS;
  const perOcc = typicalWeek;
  const { text } = summariseHeatmap({
    mode: 'compare', hours: HOURS,
    current: { grid: perOcc.map((r, d) => r.map(v => v * sep[d])), dayCounts: sep },
    previous: { grid: perOcc.map((r, d) => r.map(v => v * aug[d])), dayCounts: aug }
  });
  assert.ok(/little change|much the same|very close/i.test(text), 'reported a change: ' + text);
});
test('declines to summarise when there is too little data', () => {
  const g = grid(() => 0); g[0][3] = 400;
  const { text } = summariseHeatmap({ mode: 'period', hours: HOURS, current: { grid: g, dayCounts: THREE_WEEKS } });
  assert.match(text, /Not enough/);
});

console.log('\nsummariseHeatmap — behaviour');
test('identical data gives identical text', () => {
  const a = summariseHeatmap({ mode: 'period', hours: HOURS, current: { grid: typicalWeek, dayCounts: THREE_WEEKS } });
  const b = summariseHeatmap({ mode: 'period', hours: HOURS, current: { grid: typicalWeek, dayCounts: THREE_WEEKS } });
  assert.strictEqual(a.text, b.text);
});
test('output varies as data varies', () => {
  const seen = new Set();
  for (let k = 0; k < 8; k++) {
    seen.add(summariseHeatmap({ mode: 'period', hours: HOURS,
      current: { grid: times(typicalWeek, 1 + k * 0.013), dayCounts: THREE_WEEKS } }).text);
  }
  assert.ok(seen.size >= 3, 'only ' + seen.size + ' distinct phrasings in 8 runs');
});
test('never lowercases a day name', () => {
  const tueCollapse = grid((d, h) => shape(d, h) * (d === 1 ? 0.55 : 1.03));
  const { text } = summariseHeatmap({ mode: 'compare', hours: HOURS,
    current: { grid: tueCollapse, dayCounts: THREE_WEEKS }, previous: { grid: typicalWeek, dayCounts: THREE_WEEKS } });
  assert.ok(!/(mon|tues|wednes|thurs|fri|satur|sun)days?\b/.test(text.replace(/[A-Z]\w+days?/g, '')), text);
});
test('leads with the larger move (a −45% day is not buried behind +3%)', () => {
  const tueCollapse = grid((d, h) => shape(d, h) * (d === 1 ? 0.55 : 1.03));
  const { text } = summariseHeatmap({ mode: 'compare', hours: HOURS,
    current: { grid: tueCollapse, dayCounts: THREE_WEEKS }, previous: { grid: typicalWeek, dayCounts: THREE_WEEKS } });
  assert.ok(text.indexOf('Tuesday') > -1 && (text.indexOf('Wednesday') === -1 || text.indexOf('Tuesday') < text.indexOf('Wednesday')), text);
});
test('no double signs like "up +16%"', () => {
  const shifted = grid((d, h) => shape(d, h) * (h >= 17 ? 1.16 : h >= 11 && h < 14 ? 0.84 : 1));
  const { text } = summariseHeatmap({ mode: 'compare', hours: HOURS,
    current: { grid: shifted, dayCounts: THREE_WEEKS }, previous: { grid: typicalWeek, dayCounts: THREE_WEEKS } });
  assert.ok(!/(up|down|grew|fell|slipped|eased) [+−-]/.test(text), text);
});

console.log('\nvalidation');
test('rejects a grid with the wrong column count', () => {
  assert.throws(() => summariseHeatmap({ mode: 'period', hours: HOURS,
    current: { grid: grid(() => 1).map(r => r.slice(1)), dayCounts: THREE_WEEKS } }), /columns to match hours/);
});
test('rejects missing dayCounts', () => {
  assert.throws(() => summariseHeatmap({ mode: 'period', hours: HOURS, current: { grid: typicalWeek } }), /dayCounts/);
});
test('rejects compare mode without previous', () => {
  assert.throws(() => summariseHeatmap({ mode: 'compare', hours: HOURS,
    current: { grid: typicalWeek, dayCounts: THREE_WEEKS } }), /requires previous/);
});
test('rejects non-ascending hours', () => {
  assert.throws(() => summariseHeatmap({ mode: 'period', hours: [9, 11, 10],
    current: { grid: grid(() => 1).map(r => r.slice(0, 3)), dayCounts: THREE_WEEKS } }), /ascending/);
});

console.log('\nsample output');
const samples = {
  'Period · lunch and dinner, weekend-heavy': { mode: 'period', current: { grid: typicalWeek, dayCounts: THREE_WEEKS } },
  'Period · CBD lunch, quiet weekend': { mode: 'period', current: { grid: grid((d, h) =>
    (100 + Math.exp(-((h - 12.5) ** 2) / 1.5) * 1400 + Math.exp(-((h - 18) ** 2) / 3) * 300) * [1, 1, 1.05, 1.05, .95, .25, .2][d]), dayCounts: THREE_WEEKS } },
  'Period · evenly spread': { mode: 'period', current: { grid: grid((d, h) => 500 + ((d * 7 + h * 3) % 5) * 6), dayCounts: THREE_WEEKS } },
  'Compare · flat overall, dinner up, lunch down': { mode: 'compare',
    current: { grid: grid((d, h) => shape(d, h) * (h >= 17 ? 1.16 : h >= 11 && h < 14 ? 0.84 : 1)), dayCounts: THREE_WEEKS },
    previous: { grid: typicalWeek, dayCounts: THREE_WEEKS } },
  'Compare · broad rise': { mode: 'compare', current: { grid: times(typicalWeek, 1.09), dayCounts: THREE_WEEKS },
    previous: { grid: typicalWeek, dayCounts: THREE_WEEKS } },
  'Compare · one big Saturday': { mode: 'compare',
    current: { grid: grid((d, h) => shape(d, h) + (d === 5 && h >= 18 ? 1600 : 0)), dayCounts: THREE_WEEKS },
    previous: { grid: typicalWeek, dayCounts: THREE_WEEKS } },
  'Compare · Tuesdays collapse': { mode: 'compare',
    current: { grid: grid((d, h) => shape(d, h) * (d === 1 ? 0.55 : 1.03)), dayCounts: THREE_WEEKS },
    previous: { grid: typicalWeek, dayCounts: THREE_WEEKS } }
};
for (const [name, s] of Object.entries(samples)) {
  console.log('  ' + name + '\n    ' + summariseHeatmap(Object.assign({ hours: HOURS }, s)).text);
}

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed ? 1 : 0);
