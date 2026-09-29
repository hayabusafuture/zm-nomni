// node margins-briefing.test.js — no dependencies.
const assert = require('assert');
const { summariseMarginsTab, CONFIG } = require('./margins-briefing.js');

let passed = 0, failed = 0;
function test(name, fn){ try { fn(); passed++; console.log('  ✓ ' + name); } catch (e) { failed++; console.log('  ✗ ' + name + '\n    ' + e.message); } }
const clone = o => JSON.parse(JSON.stringify(o));
const SEEDS = Array.from({ length: 40 }, (_, i) => i * 7919 + 3);
const say = (d, seed) => summariseMarginsTab(d, seed === undefined ? undefined : { seed }).text;
// Wording tests read every statement, so they turn the four-sentence cap and the word limit off.
const full = (d, seed) => summariseMarginsTab(d, { seed, unlimited: true }).text;
// Every wording, for a scenario.
const allTexts = d => SEEDS.map(seed => full(d, seed));

function base(){
  return {
    comparison: 'vs last month',
    gp: { value: 68.52, target: 68.9, change: 1.9 },
    outlets: [
      { name: "Roll'd Bondi", gp: 66.9, target: 68.5 },
      { name: "Roll'd Newtown", gp: 69, target: 69.5 },
      { name: "Roll'd Wynyard", gp: 70, target: 68 },
      { name: "Roll'd Chatswood", gp: 68, target: 67.5 }
    ],
    trend: { unit: 'day', target: 68.9, points: [67.5, 68.0, 69.5, 70.1, 66.9, 68.4, 69.0, 71.0, 68.8, 69.2].map((gp, i) => ({ label: (i + 1) + ' Sep', gp })) },
    categories: { overall: 31.5, rows: [
      { name: 'Mains', cogsPct: 36.8, salesShare: 52.4 }, { name: 'Sides', cogsPct: 32.9, salesShare: 7 }, { name: 'Starters', cogsPct: 30.3, salesShare: 13 },
      { name: 'Desserts', cogsPct: 23.5, salesShare: 5 }, { name: 'Beverages', cogsPct: 21.0, salesShare: 22 }] },
    costs: { revenue: 63080, wastage: 1204, variance: 1893 },
    priceImpact: { value: 650, changePct: 3.2 }
  };
}
// Words that would claim a cause. The briefing states facts side by side; it never explains.
const causal = /\b(because|due to|driven|drove|caused?|reason|thanks to|as a result|resulting|which (usually )?(means|suggests)|likely|probably|suggests?|explains?|attribut)/i;
// A quiet gross profit line, so another statement can lead.
const quietGp = d => { d.gp = { value: 68.5, target: 68.5, change: 0.1 }; return d; };

test('gross profit leads by default, with its figure, target gap and change', () => {
  allTexts(base()).forEach(t => {
    assert.ok(/^(Gross profit is|Gross profit stands at|Overall gross profit is) 68\.5%, 0\.4 pts (below|under|short of) target and (up 1\.9 pts vs last month|1\.9 pts higher vs last month)\./.test(t), t);
  });
});
test('above, below and on target', () => {
  const d = base(); d.gp.target = 68.1;
  allTexts(d).forEach(t => assert.ok(/0\.4 pts (above|ahead of|over) target/.test(t), t));
  d.gp.target = 68.5; allTexts(d).forEach(t => assert.ok(/68\.5%, (right )?on target/.test(t), t));
});
test('the target and the change are optional', () => {
  const d = base(); delete d.gp.target; delete d.gp.change;
  allTexts(d).forEach(t => assert.ok(/(Gross profit is|Gross profit stands at|Overall gross profit is) 68\.5%\./.test(t), t));
});
test('a fall and no movement', () => {
  const d = base(); d.gp.change = -0.6; allTexts(d).forEach(t => assert.ok(/(down 0\.6 pts|0\.6 pts lower) vs last month/.test(t), t));
  d.gp.change = 0.02; allTexts(d).forEach(t => assert.ok(/(unchanged|no change) vs last month/.test(t), t));
});
test('names the outlets furthest below target, at most two, in every wording', () => {
  allTexts(base()).forEach(t => {
    assert.ok(/2 of 4 outlets are (below|under) target/.test(t) && t.includes("Roll'd Bondi (1.6 pts) and Roll'd Newtown (0.5 pts)"), t);
  });
  const d = base(); d.outlets.push({ name: 'Third', gp: 60, target: 68 }, { name: 'Fourth', gp: 61, target: 68 }, { name: 'Fifth', gp: 62, target: 68 });
  allTexts(d).forEach(t => assert.ok(t.includes('Third (8.0 pts) and Fourth (7.0 pts)') && !/Fifth|Bondi/.test(t), t));
});
test('one outlet below, none below, all below', () => {
  let d = base(); d.outlets = d.outlets.filter(o => o.gp >= o.target).concat([{ name: 'Solo', gp: 60, target: 61 }]);
  allTexts(d).forEach(t => assert.ok(/Solo[^.]*(below|under) target, by 1\.0 pts|Only Solo is below target, by 1\.0 pts|Just Solo is under target, by 1\.0 pts/.test(t), t));
  d = base(); d.outlets = d.outlets.filter(o => o.gp >= o.target);
  allTexts(d).forEach(t => assert.ok(/all 2 are at or above it|All 2 outlets are at or above target|Every one of the 2 outlets is at or above target/.test(t), t));
  d = base(); d.outlets = d.outlets.map(o => ({ ...o, gp: o.target - 1 }));
  allTexts(d).forEach(t => assert.ok(/All 4 outlets are (below|under) target/.test(t), t));
});
test('outlets are judged on the rounded figures shown, so a 0.04 gap is not "below"', () => {
  const d = base(); d.outlets = [{ name: 'A', gp: 68.46, target: 68.5 }, { name: 'B', gp: 70, target: 68 }];
  allTexts(d).forEach(t => assert.ok(/at or above/.test(t), t));
});
test('no outlet sentence for a single outlet view', () => {
  const d = base(); delete d.outlets;
  allTexts(d).forEach(t => assert.ok(!/outlets?\b.*\btarget/.test(t.replace(/Gross profit[^.]*\./, '')), t));
  d.outlets = [{ name: 'Only', gp: 60, target: 61 }];
  allTexts(d).forEach(t => assert.ok(!/Only/.test(t), t));
});
const WASTAGE = '(?:[Rr]ecorded wastage|[Ll]ogged wastage|[Ww]astage on record|[Ww]astage)';
const VARIANCE = '(?:[Uu]nexplained variance|variance left unexplained|unaccounted-for variance)';
test('wastage and variance are amounts rounded like the tiles, with their share of revenue', () => {
  const shapes = new Set(), nouns = new Set();
  const A = new RegExp(WASTAGE + ' (is|came to) S\\$1,200 and ' + VARIANCE + ' (is|was) S\\$1,890, (together 4\\.9% of revenue|4\\.9% of revenue combined)\\.');
  const B = new RegExp(WASTAGE + ' \\(S\\$1,200\\) and ' + VARIANCE + ' \\(S\\$1,890\\) (add up to|come to) 4\\.9% of revenue\\.');
  const C = new RegExp(WASTAGE + ': S\\$1,200\\. [A-Za-z -]+: S\\$1,890\\. Together that is 4\\.9% of revenue\\.');
  allTexts(base()).forEach(t => {
    const costs = t.split(/(?<=\.) (?=[A-Z])/).filter(x => /wastage/i.test(x)).join(' ');
    const m = A.exec(t) || B.exec(t) || C.exec(t);
    assert.ok(m, t);
    shapes.add(B.test(t) ? 1 : C.test(t) ? 2 : 0);
    nouns.add(costs.match(/[Rr]ecorded wastage|[Ll]ogged wastage|[Ww]astage on record|[Ww]astage/)[0].toLowerCase());
    const a = A.exec(t); if (a) assert.strictEqual(a[1] === 'came to', a[2] === 'was', 'tense should match: ' + t);
  });
  assert.strictEqual(shapes.size, 3, 'expected three different shapes');
  assert.ok(nouns.size >= 3, 'the wastage term should vary; got ' + [...nouns]);
});
test('one cost line at zero is left out, with no combined share', () => {
  const d = base(); d.costs.variance = 0;
  allTexts(d).forEach(t => assert.ok(new RegExp(WASTAGE + ' (is|came to) S\\$1,200\\.').test(t) && !/variance|together|combined|add up|come to 4/i.test(t), t));
  d.costs.wastage = 0; allTexts(d).forEach(t => assert.ok(!/wastage|variance/i.test(t), t));
  d.costs.variance = 1893; allTexts(d).forEach(t => assert.ok(new RegExp(VARIANCE.replace('[Uu]', '[Uu]') + ' (is|came to) S\\$1,890\\.', 'i').test(t) && !/wastage/i.test(t), t));
});
test('supplier price impact: extra cost, saving, nothing', () => {
  const up = /Supplier price changes (added S\$650 to costs|pushed costs up by S\$650), 3\.2% (more than at the old prices|above the old prices)\.|Compared with the old prices, the same purchases cost S\$650 \(3\.2%\) more\.|(Price changes from suppliers|Suppliers' price changes) added S\$650 to costs \(3\.2%\)\./;
  const shapes = new Set();
  allTexts(base()).forEach(t => { assert.ok(up.test(t), t); shapes.add(/Compared with the old prices/.test(t) ? 1 : /\(3\.2%\)\./.test(t) ? 2 : 0); });
  assert.strictEqual(shapes.size, 3, 'expected three different shapes');
  const d = base(); d.priceImpact = { value: -234, changePct: -2.1 };
  const down = /Supplier price changes (took S\$230 off costs|lowered costs by S\$230), 2\.1% (less than at the old prices|below the old prices)\.|Compared with the old prices, the same purchases cost S\$230 \(2\.1%\) less\.|(Price changes from suppliers|Suppliers' price changes) took S\$230 off costs \(2\.1%\)\./;
  allTexts(d).forEach(t => assert.ok(down.test(t), t));
  d.priceImpact = { value: 4, changePct: 0.1 }; allTexts(d).forEach(t => assert.ok(!/price changes|Compared with the old/i.test(t), t));
  d.priceImpact = null; allTexts(d).forEach(t => assert.ok(!/price changes|Compared with the old/i.test(t), t));
});
test('the price line says nothing about panels or tracking', () => {
  allTexts(base()).forEach(t => assert.ok(!/tracks|tracked|Procure|Price movement/.test(t), t));
});
test('never claims a cause, in any wording', () => {
  allTexts(base()).forEach(t => assert.ok(!causal.test(t), t));
});
test('every figure traces to the input, in every wording', () => {
  const allowed = new Set(['68.5', '0.4', '1.9', '4', '2', '1.6', '0.5', '1,200', '1,890', '4.9', '650', '3.2',
    '5', '10', '66.9', '36.8', '21.0', '52', '31.5', '32.9', '3']);
  allTexts(base()).forEach(t => (t.match(/\d+(?:,\d{3})*(?:\.\d+)?/g) || []).forEach(n => assert.ok(allowed.has(n), 'unexpected number ' + n + ' in: ' + t)));
});
test('the wordings of one statement all state the same figures (costs, price, trend)', () => {
  const only = keep => { const d = base(); ['outlets', 'trend', 'categories', 'costs', 'priceImpact'].forEach(k => { if (!keep.includes(k)) delete d[k]; }); return d; };
  const figures = (d, seeds) => new Set(seeds.map(seed => (full(d, seed).match(/\d+(?:,\d{3})*(?:\.\d+)?/g) || []).sort().join('|')));
  ['costs', 'priceImpact', 'trend'].forEach(k => assert.strictEqual(figures(only([k]), SEEDS).size, 1, k));
});
test('wording varies with the data, but the same data always gives the same text', () => {
  assert.strictEqual(say(base()), say(clone(base())));
  assert.ok(new Set(allTexts(base())).size > 10, 'expected many distinct wordings');
  const seen = new Set();
  for (let i = 0; i < 30; i++) { const d = base(); d.gp.value = 68 + i / 10; seen.add(say(d).replace(/\d+(\.\d+)?/g, '#')); }
  assert.ok(seen.size > 3, 'different data should usually read differently; got ' + seen.size);
});
test('trend: how many intervals were under target, and the lowest', () => {
  allTexts(base()).forEach(t => {
    const s = t.split(/(?<=\.) (?=[A-Z])/).filter(x => /target/.test(x) && /(day|days)/.test(x)).join(' ');
    assert.ok(/5 of 10 days|Across the 10 days, 5 finished/.test(s) && /66\.9%/.test(s) && /5 Sep/.test(s), s || t);
  });
  const d = base(); d.trend.points = d.trend.points.map(p => ({ ...p, gp: 70 }));
  allTexts(d).forEach(t => assert.ok(/(at or above target on every day|Not one of the 10 days fell below target|Every day held gross profit at or above target)/.test(t), t));
  d.trend.points = d.trend.points.map(p => ({ ...p, gp: 60 }));
  allTexts(d).forEach(t => assert.ok(/(below target on every day|every day was under target|No day reached the gross profit target)/.test(t), t));
});
test('trend: weeks and months read naturally, and short series are left out', () => {
  const w = base(); w.trend = { unit: 'week', target: 68.9, points: ['w/e 29 Jun', 'w/e 6 Jul', 'w/e 13 Jul', 'w/e 20 Jul', 'w/e 27 Jul'].map((label, i) => ({ label, gp: [68, 69, 70, 67.2, 69.5][i] })) };
  allTexts(w).forEach(t => { if (/weeks/.test(t)) assert.ok(/the week ending 20 Jul/.test(t) && !/w\/e/.test(t), t); });
  const m = base(); m.trend = { unit: 'month', target: 68.9, points: ['Jan', 'Feb', 'Mar', 'Apr'].map((label, i) => ({ label, gp: [69, 68, 70, 69.5][i] })) };
  allTexts(m).forEach(t => assert.ok(!/ on Feb/.test(t) && !/w\/e/.test(t)));
  assert.ok(allTexts(m).some(t => / in Feb/.test(t)));
  const s = base(); s.trend.points = s.trend.points.slice(0, 3);
  allTexts(s).forEach(t => assert.ok(!/ days/.test(t.replace(/5 Sep/g, '')) || !/under target|below target on/.test(t.split('. ').filter(x => /days/.test(x)).join('')), t));
  assert.ok(!summariseMarginsTab(s, { unlimited: true }).findings.includes('trend'));
});
test('trend is judged on the rounded figures shown', () => {
  const d = base(); d.trend.points = d.trend.points.map((p, i) => ({ ...p, gp: i < 3 ? 68.86 : 69.5 }));   // 68.9 shown, equal to target
  allTexts(d).forEach(t => assert.ok(!/on every day|below target on/.test(t) || /at or above target on every day|Not one of|Every day held/.test(t), t));
  assert.ok(allTexts(d).every(t => !/\b\d+ of 10 days\b/.test(t) || /0 of/.test(t) === false));
});
test('category: highest and lowest COGS in every wording', () => {
  allTexts(base()).forEach(t => {
    const s = t.split(/(?<=\.) (?=[A-Z])/).filter(x => /COGS/.test(x) && /(Mains|Beverages)/.test(x)).join(' ');
    assert.ok(/Mains/.test(s) && (/Beverages/.test(s) || /2 of 5 categories run above the overall COGS of 31\.5%, namely Mains \(36\.8%\) and Sides \(32\.9%\)/.test(s)), s);
  });
  const shapes = new Set();
  allTexts(base()).forEach(t => shapes.add(/By category/.test(t) ? 0 : /has the highest COGS of any/.test(t) ? 1 : /COGS runs from/.test(t) ? 2 : /categories run above/.test(t) ? 3 : -1));
  assert.deepStrictEqual([...shapes].sort(), [0, 1, 2, 3]);
});
test('category: left out when there is no spread or fewer than two categories', () => {
  const d = base(); d.categories.rows = d.categories.rows.map(r => ({ ...r, cogsPct: 30 }));
  assert.ok(!summariseMarginsTab(d, { unlimited: true }).findings.includes('category'));
  d.categories.rows = [{ name: 'Mains', cogsPct: 36.8, salesShare: 100 }];
  assert.ok(!summariseMarginsTab(d, { unlimited: true }).findings.includes('category'));
});
test('at most four sentences, gross profit always among them', () => {
  for (let i = 0; i < 60; i++) {
    const d = base(); d.gp.value = 66 + i / 8; d.priceImpact.value = 100 + i * 40; d.trend.points[2].gp = 60 + i / 5;
    const f = summariseMarginsTab(d).findings;
    assert.ok(f.length <= CONFIG.maxStatements && f.includes('gp') && new Set(f).size === f.length, f.join());
  }
});
test('which supporting facts appear changes with the data', () => {
  const sets = new Set();
  for (let i = 0; i < 60; i++) { const d = base(); d.gp.value = 66 + i / 8; d.priceImpact.value = 100 + i * 60; d.costs.wastage = 300 + i * 40; sets.add(summariseMarginsTab(d).findings.slice().sort().join()); }
  assert.ok(sets.size >= 3, 'expected different combinations, got ' + [...sets].join(' / '));
});
test('the lead: gross profit by default; something else only when clearly more notable', () => {
  assert.strictEqual(summariseMarginsTab(base()).findings[0], 'gp');
  const d = quietGp(base()); d.outlets = d.outlets.map(o => ({ ...o, gp: o.target - 2 }));
  const r = summariseMarginsTab(d);
  assert.strictEqual(r.findings[0], 'outlets'); assert.ok(r.findings.includes('gp'));
  const q = quietGp(base()); q.outlets = q.outlets.map(o => ({ ...o, gp: o.target + 1 })); q.priceImpact = { value: 40, changePct: 0.3 };
  assert.strictEqual(summariseMarginsTab(q).findings[0], 'gp');
  const p = quietGp(base()); p.outlets = p.outlets.map(o => ({ ...o, gp: o.target + 1 })); p.costs = { revenue: 63080, wastage: 100, variance: 100 }; p.priceImpact = { value: 3000, changePct: 7 };
  p.trend.points = p.trend.points.map(x => ({ ...x, gp: 70 })); p.categories.rows = p.categories.rows.map(r => ({ ...r, cogsPct: 30 }));
  SEEDS.forEach(seed => assert.strictEqual(summariseMarginsTab(p, { seed }).findings[0], 'price'));   // a lead never moves
});
test('a statement keeps its wording when the order changes', () => {
  const a = base(), b = quietGp(base()); b.outlets = b.outlets.map(o => ({ ...o, gp: o.target - 2 }));
  const costs = t => t.split(/(?<=\.) (?=[A-Z])/).find(x => /wastage|variance/i.test(x));
  assert.strictEqual(costs(full(a, 5)), costs(full(b, 5)));
});
test('stays within the word limit and always keeps the gross profit sentence', () => {
  const d = base(); d.outlets = Array.from({ length: 30 }, (_, i) => ({ name: 'A very long outlet name number ' + i, gp: 50 - i, target: 70 }));
  CONFIG.maxWords = 25;
  const r = summariseMarginsTab(d);
  CONFIG.maxWords = 100;
  assert.ok(r.findings.includes('gp'));
  assert.ok(r.words <= 25 || r.findings.length === 1, r.words + ' words');
});
test('random scenarios: no NaN, no causal words, within the limit, every statement present', () => {
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 300; i++) {
    const d = { comparison: 'vs last month', gp: { value: 55 + rnd() * 25 } };
    if (rnd() > .2) d.gp.target = 55 + rnd() * 25;
    if (rnd() > .2) d.gp.change = (rnd() - .5) * 8;
    if (rnd() > .3) d.outlets = Array.from({ length: 2 + Math.floor(rnd() * 28) }, (_, k) => ({ name: 'Outlet ' + k, gp: 55 + rnd() * 25, target: 55 + rnd() * 25 }));
    if (rnd() > .2) d.costs = { revenue: rnd() * 90000, wastage: rnd() * 3000, variance: rnd() > .3 ? rnd() * 3000 : 0 };
    if (rnd() > .3) d.priceImpact = { value: (rnd() - .4) * 3000, changePct: (rnd() - .4) * 8 };
    if (rnd() > .3) d.trend = { unit: ['day', 'week', 'month'][Math.floor(rnd() * 3)], target: 55 + rnd() * 25, points: Array.from({ length: Math.floor(rnd() * 32) }, (_, k) => ({ label: k + ' Sep', gp: 55 + rnd() * 25 })) };
    if (rnd() > .3) d.categories = { overall: 20 + rnd() * 20, rows: Array.from({ length: Math.floor(rnd() * 7) }, (_, k) => ({ name: 'Cat ' + k, cogsPct: 15 + rnd() * 30, salesShare: rnd() * 60 })) };
    const r = summariseMarginsTab(d);
    assert.ok(r.text.length > 0 && !/undefined|NaN|Infinity/.test(r.text), i + ': ' + r.text);
    assert.ok(!causal.test(r.text) && r.words <= CONFIG.maxWords, i + ': ' + r.text);
    assert.ok(r.findings.includes('gp') && r.findings.length <= CONFIG.maxStatements, i + ': ' + r.findings.join());
  }
});
test('rejects malformed input with a clear message', () => {
  assert.throws(() => summariseMarginsTab(null), /must be an object/);
  assert.throws(() => summariseMarginsTab({ comparison: 'x', gp: {} }), /gp\.value/);
  assert.throws(() => summariseMarginsTab({ gp: { value: 1 } }), /comparison/);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
