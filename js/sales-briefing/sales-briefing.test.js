/**
 * Tests for sales-briefing.js — run with:  node sales-briefing.test.js
 * No dependencies. Exits non-zero on failure.
 */
'use strict';
const assert = require('assert');
const { summariseSalesTab } = require('./sales-briefing.js');

/* ── A seeded scenario builder ────────────────────────────────────── */

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const OUTLETS = ["Roll'd Wynyard", "Roll'd Haymarket", "Roll'd Chatswood", "Roll'd Circular Quay",
  "Roll'd Barangaroo", "Roll'd Newtown", "Roll'd Martin Place", "Roll'd Parramatta", "Roll'd Bondi"];
const ITEMS = ['Grilled Pork Banh Mi', 'Beef Pho Bowl', 'Chargrilled Chicken Rice', 'Vietnamese Iced Coffee',
  'Fresh Spring Rolls', 'BBQ Pork Rice Bowl', 'Tofu Noodle Salad', 'Coconut Water', 'Pork Summer Rolls', 'Beef Brisket Noodle Soup'];

/**
 * Builds a Sales-tab dataset where each dial is an explicit % change:
 *   dineCovers, dineSph, offOrders, offAov — the four revenue parts
 *   outletShift — per-outlet extra % on top of the group
 *   deliveryShare — shifts revenue between channels
 */
function scenario(o = {}) {
  const r = rng(o.seed || 7);
  const g = k => 1 + (o[k] || 0) / 100;

  const dineCov0 = 4200, dineSph0 = 11.8;
  const offOrd0 = 1900, offAov0 = 14.2;
  const dineCov1 = dineCov0 * g('dineCovers'), dineSph1 = dineSph0 * g('dineSph');
  const offOrd1 = offOrd0 * g('offOrders'), offAov1 = offAov0 * g('offAov');

  const dineR0 = dineCov0 * dineSph0, dineR1 = dineCov1 * dineSph1;
  const offR0 = offOrd0 * offAov0, offR1 = offOrd1 * offAov1;

  // Split off-premise across three channels; deliveryShift moves share into delivery.
  const shift = (o.deliveryShift || 0) / 100;
  const offSplit0 = [0.5, 0.3, 0.2];
  const offSplit1 = [0.5 - shift * 0.6, 0.3 - shift * 0.4, 0.2 + shift];
  const offNames = ['Takeaway', 'Online ordering', 'Delivery'];

  const channels = [
    { name: 'Dine-in', onPremise: true, revenue: dineR1, previousRevenue: dineR0,
      covers: dineCov1, previousCovers: dineCov0 },
    ...offNames.map((name, i) => ({
      name, onPremise: false,
      revenue: offR1 * offSplit1[i], previousRevenue: offR0 * offSplit0[i],
      orders: offOrd1 * offSplit1[i], previousOrders: offOrd0 * offSplit0[i]
    }))
  ];

  const n = o.outletCount || OUTLETS.length;
  const weights = OUTLETS.slice(0, n).map(() => 0.6 + r() * 0.8);
  const wSum = weights.reduce((a, b) => a + b, 0);
  const totalR0 = dineR0 + offR0, totalR1 = dineR1 + offR1;
  let outlets = OUTLETS.slice(0, n).map((name, i) => {
    const w = weights[i] / wSum;
    const extra = 1 + ((o.outletShift && o.outletShift[name]) || 0) / 100;
    const sphExtra = 1 + ((o.outletSph && o.outletSph[name]) || 0) / 100;
    const cov0 = dineCov0 * w, cov1 = dineCov1 * w;
    return {
      id: 'o' + i, name,
      revenue: totalR1 * w * extra, previousRevenue: totalR0 * w,
      dineInRevenue: dineR1 * w * sphExtra, previousDineInRevenue: dineR0 * w,
      covers: cov1, previousCovers: cov0
    };
  });
  // Keep the group total consistent with the outlets after any shifts.
  const outletSum1 = outlets.reduce((s, x) => s + x.revenue, 0);
  const scale = totalR1 / outletSum1;
  outlets = outlets.map(x => Object.assign(x, { revenue: x.revenue * scale }));

  const items = ITEMS.map((name, i) => {
    const prevRank = i + 1;
    const moved = o.itemMoves && o.itemMoves[name];
    const rank = moved ? moved.rank : prevRank;
    const ts0 = 400 - i * 30, ts1 = ts0 * (moved && moved.timesSold ? moved.timesSold : 1);
    return { id: 'i' + i, name, rank, previousRank: prevRank,
      timesSold: ts1, previousTimesSold: ts0, revenue: ts1 * 9, previousRevenue: ts0 * 9 };
  });

  const data = {
    comparisonLabel: 'the same days last month',
    periodLabel: 'this month',
    revenue: { current: totalR1, previous: totalR0 },
    channels, outlets, items,
    coverage: o.coverage || { withPos: n, total: n, missing: [] }
  };
  if (o.daily) data.daily = o.daily;
  if (o.heatmap) data.heatmap = o.heatmap;
  return data;
}

const BANNED = /\b(because|due to|which means|usually|typically|likely|probably|suggests|may indicate|could be|driven by|as a result)\b/i;

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { failed++; console.log('  ✗ ' + name + '\n      ' + e.message); }
}

console.log('\nrevenue decomposition');
test('higher dine-in spend per head is identified as the driver', () => {
  const { text } = summariseSalesTab(scenario({ dineSph: 7, dineCovers: 1 }));
  assert.match(text, /higher dine-in spend per head/, text);
});
test('more dine-in guests is identified as the driver', () => {
  const { text } = summariseSalesTab(scenario({ dineCovers: 9, dineSph: 0.5 }));
  assert.match(text, /more dine-in guests/, text);
});
test('a delivery surge is NOT reported as dine-in spend per head rising', () => {
  // The guest = 1 trap. Off-premise orders jump; dine-in is untouched.
  const { text } = summariseSalesTab(scenario({ offOrders: 30 }));
  assert.ok(!/spend per head/.test(text) || /takeaway and delivery/.test(text), text);
  assert.match(text, /more takeaway and delivery orders/, text);
});
test('a component moving against the total is called out', () => {
  const { text } = summariseSalesTab(scenario({ dineSph: 14, dineCovers: -6 }));
  assert.match(text, /pulled the other way/, text);
});
test('a flat period says so, and only claims nothing moved when nothing did', () => {
  const { text, findings } = summariseSalesTab(scenario({ dineSph: 0.3, dineCovers: 0.2 }));
  assert.match(text, /within 1%|barely moved|level with/, text);
  if (/no outlet, channel or item/.test(text)) assert.strictEqual(findings.length, 1);
});

console.log('\noutlets, channels, items');
test('an outlet moving against the group is surfaced', () => {
  const { text } = summariseSalesTab(scenario({ dineSph: 5, outletShift: { "Roll'd Parramatta": -60 } }));
  assert.match(text, /Parramatta/, text);
});
test('a channel shift is reported in points, not percent', () => {
  const { text } = summariseSalesTab(scenario({ deliveryShift: 8, dineSph: 0.2 }));
  assert.match(text, /Delivery.*pts|pts.*Delivery|towards Delivery/, text);
});
test('an item dropping out of the top five is surfaced', () => {
  const { text } = summariseSalesTab(scenario({ dineSph: 0.2,
    itemMoves: { 'Fresh Spring Rolls': { rank: 8, timesSold: 0.55 }, 'Coconut Water': { rank: 5 } } }));
  assert.match(text, /Fresh Spring Rolls|Coconut Water/, text);
});
test('a single-outlet data set never compares outlets', () => {
  const { text, findings } = summariseSalesTab(scenario({ outletCount: 1, dineSph: 6 }));
  assert.ok(!findings.some(f => f.key === 'divergence' || f.key === 'concentration' || f.key === 'sph'), text);
});

console.log('\ncoverage');
test('names missing outlets when there are three or fewer', () => {
  const { text } = summariseSalesTab(scenario({ dineSph: 6,
    coverage: { withPos: 9, total: 10, missing: ["Roll'd World Square"] } }));
  assert.match(text, /Based on 9 of 10 outlets — Roll'd World Square has no POS\./, text);
});
test('counts rather than names when more than three are missing', () => {
  const { text } = summariseSalesTab(scenario({ dineSph: 6,
    coverage: { withPos: 26, total: 30, missing: ['A', 'B', 'C', 'D'] } }));
  assert.match(text, /Based on 26 of 30 outlets with POS\./, text);
});

console.log('\nyesterday');
test('flags yesterday when it was the busiest of its weekday', () => {
  const dates = [], cov = [];
  for (let d = 1; d <= 21; d++) { dates.push('2026-09-' + String(d).padStart(2, '0')); cov.push(200); }
  cov[20] = 290; // Mon 21 Sep, vs 200 on the two earlier Mondays
  const { text } = summariseSalesTab(scenario({ dineSph: 0.2,
    daily: { dates, dineInCovers: cov, lastClosedIndex: 20, today: '2026-09-22' } }));
  assert.match(text, /Yesterday was the busiest Monday|yesterday was the busiest Monday/, text);
});

console.log('\nguarantees');
test('never exceeds 100 words across 300 random scenarios', () => {
  const r = rng(42);
  for (let k = 0; k < 300; k++) {
    const v = () => (r() - 0.5) * 30;
    const res = summariseSalesTab(scenario({ seed: k + 1, dineSph: v(), dineCovers: v(), offOrders: v(), offAov: v(),
      deliveryShift: (r() - 0.5) * 10, coverage: { withPos: 9, total: 10, missing: ["Roll'd World Square"] } }));
    assert.ok(res.words <= 100, res.words + ' words: ' + res.text);
  }
});
test('never uses causal or speculative language across 300 random scenarios', () => {
  const r = rng(99);
  for (let k = 0; k < 300; k++) {
    const v = () => (r() - 0.5) * 30;
    const { text } = summariseSalesTab(scenario({ seed: k + 1, dineSph: v(), dineCovers: v(), offOrders: v(),
      offAov: v(), deliveryShift: (r() - 0.5) * 10 }));
    assert.ok(!BANNED.test(text), 'banned word in: ' + text);
  }
});
test('identical data gives identical text, with or without memory', () => {
  const d = scenario({ dineSph: 6 });
  assert.strictEqual(summariseSalesTab(d).text, summariseSalesTab(d).text);
  const first = summariseSalesTab(d);
  const again = summariseSalesTab(d, first.memory);
  assert.strictEqual(again.text, first.text);
});
test('the lead stays the strongest finding while supporting facts rotate', () => {
  // Same shape of data every "day", nudged slightly so the hash changes.
  let memory, leads = new Set(), supports = new Set();
  for (let day = 0; day < 7; day++) {
    const res = summariseSalesTab(scenario({
      dineSph: 7 + day * 0.01, deliveryShift: 5,
      outletShift: { "Roll'd Parramatta": -45 },
      itemMoves: { 'Fresh Spring Rolls': { rank: 8, timesSold: 0.6 }, 'Coconut Water': { rank: 5 } }
    }), memory);
    memory = res.memory;
    leads.add(res.findings[0].key);
    res.findings.slice(1).forEach(f => supports.add(f.key));
  }
  assert.strictEqual(leads.size, 1, 'lead changed: ' + [...leads]);
  assert.ok(supports.size >= 3, 'only ' + supports.size + ' supporting types across 7 days');
});

console.log('\nvalidation');
test('rejects an on-premise channel without covers', () => {
  assert.throws(() => summariseSalesTab({ comparisonLabel: 'x', revenue: { current: 1, previous: 1 },
    channels: [{ name: 'Dine-in', onPremise: true, revenue: 1, previousRevenue: 1 }] }), /covers/);
});
test('rejects an off-premise channel without orders', () => {
  assert.throws(() => summariseSalesTab({ comparisonLabel: 'x', revenue: { current: 1, previous: 1 },
    channels: [{ name: 'Delivery', onPremise: false, revenue: 1, previousRevenue: 1 }] }), /orders/);
});
test('requires a comparison label', () => {
  assert.throws(() => summariseSalesTab({ revenue: { current: 1, previous: 1 }, channels: [] }), /comparisonLabel/);
});

/* ── Sample output ────────────────────────────────────────────────── */

console.log('\nsample briefings');
const cov = { withPos: 9, total: 10, missing: ["Roll'd World Square"] };
const samples = {
  'Guests spending more, concentrated in two outlets':
    scenario({ dineSph: 6, dineCovers: 2, coverage: cov,
      outletShift: { "Roll'd Wynyard": 30, "Roll'd Chatswood": 28 } }),
  'One outlet against the group, its spend per head falling':
    scenario({ dineSph: 5, dineCovers: 2, coverage: cov,
      outletShift: { "Roll'd Parramatta": -45 }, outletSph: { "Roll'd Parramatta": -12 } }),
  'Delivery surge — must not read as guests spending more':
    scenario({ offOrders: 28, deliveryShift: 9, coverage: cov }),
  'Flat month with an item dropping out':
    scenario({ dineSph: 0.3, coverage: cov,
      itemMoves: { 'Fresh Spring Rolls': { rank: 8, timesSold: 0.55 }, 'Coconut Water': { rank: 5 } } }),
  'Nothing notable at all':
    scenario({ dineSph: 0.2, dineCovers: 0.1 })
};
for (const [name, d] of Object.entries(samples)) {
  const r = summariseSalesTab(d);
  console.log('  ' + name + ' (' + r.words + ' words)\n    ' + r.text);
}

console.log('\nseven days, same underlying picture — watch the support rotate');
let mem;
for (let day = 0; day < 7; day++) {
  const r = summariseSalesTab(scenario({
    dineSph: 7 + day * 0.01, deliveryShift: 5, coverage: cov,
    outletShift: { "Roll'd Parramatta": -45 },
    itemMoves: { 'Fresh Spring Rolls': { rank: 8, timesSold: 0.6 }, 'Coconut Water': { rank: 5 } }
  }), mem);
  mem = r.memory;
  console.log('  Day ' + (day + 1) + ': ' + r.text);
}

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed ? 1 : 0);
