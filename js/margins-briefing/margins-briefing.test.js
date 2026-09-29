// node margins-briefing.test.js — no dependencies.
const assert = require('assert');
const { summariseMarginsTab, CONFIG } = require('./margins-briefing.js');

let passed = 0, failed = 0;
function test(name, fn){ try { fn(); passed++; console.log('  ✓ ' + name); } catch (e) { failed++; console.log('  ✗ ' + name + '\n    ' + e.message); } }
const clone = o => JSON.parse(JSON.stringify(o));

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
    costs: { revenue: 63080, wastage: 1204, variance: 1893 },
    priceImpact: { value: 650, changePct: 3.2 }
  };
}
// Words that would claim a cause. The briefing states facts side by side; it never explains.
const causal = /\b(because|due to|driven|drove|caused?|reason|thanks to|as a result|resulting|which (usually )?(means|suggests)|likely|probably|suggests?|explains?|attribut)/i;

test('states gross profit against target and against the comparison period', () => {
  const r = summariseMarginsTab(base());
  assert.ok(r.text.startsWith('Gross profit is 68.5%, 0.4 pts below target and up 1.9 pts vs last month.'), r.text);
});
test('above, below and on target', () => {
  const d = base(); d.gp.target = 68.1;
  assert.ok(/0\.4 pts above target/.test(summariseMarginsTab(d).text));
  d.gp.target = 68.5; assert.ok(/68\.5%, on target/.test(summariseMarginsTab(d).text));
});
test('the target and the change are optional', () => {
  const d = base(); delete d.gp.target; delete d.gp.change;
  assert.ok(summariseMarginsTab(d).text.startsWith('Gross profit is 68.5%.'));
});
test('a fall and no movement', () => {
  const d = base(); d.gp.change = -0.6; assert.ok(/down 0\.6 pts vs last month/.test(summariseMarginsTab(d).text));
  d.gp.change = 0.02; assert.ok(/unchanged vs last month/.test(summariseMarginsTab(d).text));
});
test('names the outlets furthest below target, at most two', () => {
  const t = summariseMarginsTab(base()).text;
  assert.ok(t.includes("2 of 4 outlets are below target, furthest Roll'd Bondi (1.6 pts) and Roll'd Newtown (0.5 pts)."), t);
  const d = base(); d.outlets.push({ name: 'Third', gp: 60, target: 68 }, { name: 'Fourth', gp: 61, target: 68 }, { name: 'Fifth', gp: 62, target: 68 });
  const t2 = summariseMarginsTab(d).text;
  assert.ok(/Third \(8\.0 pts\) and Fourth \(7\.0 pts\)/.test(t2) && !/Fifth|Bondi/.test(t2), t2);
});
test('one outlet below, none below, all below', () => {
  let d = base(); d.outlets = d.outlets.filter(o => o.gp >= o.target).concat([{ name: 'Solo', gp: 60, target: 61 }]);
  assert.ok(/Only Solo is below target, by 1\.0 pts\./.test(summariseMarginsTab(d).text));
  d = base(); d.outlets = d.outlets.filter(o => o.gp >= o.target);
  assert.ok(/All 2 outlets are at or above target\./.test(summariseMarginsTab(d).text));
  d = base(); d.outlets = d.outlets.map(o => ({ ...o, gp: o.target - 1 }));
  assert.ok(/All 4 outlets are below target, furthest/.test(summariseMarginsTab(d).text));
});
test('outlets are judged on the rounded figures shown, so a 0.04 gap is not "below"', () => {
  const d = base(); d.outlets = [{ name: 'A', gp: 68.46, target: 68.5 }, { name: 'B', gp: 70, target: 68 }];
  assert.ok(/All 2 outlets are at or above target/.test(summariseMarginsTab(d).text));
});
test('no outlet sentence for a single outlet view', () => {
  const d = base(); delete d.outlets;
  assert.ok(!/outlets? (is|are)/.test(summariseMarginsTab(d).text));
  d.outlets = [{ name: 'Only', gp: 60, target: 61 }];
  assert.ok(!/Only/.test(summariseMarginsTab(d).text));
});
test('wastage and variance are amounts rounded like the tiles, with their share of revenue', () => {
  const t = summariseMarginsTab(base()).text;
  assert.ok(t.includes('Recorded wastage is S$1,200 and unexplained variance is S$1,890, together 4.9% of revenue.'), t);
});
test('one cost line at zero is left out, with no combined share', () => {
  const d = base(); d.costs.variance = 0;
  const t = summariseMarginsTab(d).text;
  assert.ok(t.includes('Recorded wastage is S$1,200.') && !/variance|together/i.test(t), t);
  d.costs.wastage = 0; assert.ok(!/wastage|variance/i.test(summariseMarginsTab(d).text));
});
test('supplier price impact: extra cost, saving, nothing', () => {
  assert.ok(/added S\$650 to costs, 3\.2% more than the same purchases at the old prices\./.test(summariseMarginsTab(base()).text));
  const d = base(); d.priceImpact = { value: -234, changePct: -2.1 };
  assert.ok(/took S\$230 off costs, 2\.1% less/.test(summariseMarginsTab(d).text));
  d.priceImpact = { value: 4, changePct: 0.1 }; assert.ok(!/price changes/.test(summariseMarginsTab(d).text));
  d.priceImpact = null; assert.ok(!/price changes/.test(summariseMarginsTab(d).text));
});
test('never claims a cause', () => {
  assert.ok(!causal.test(summariseMarginsTab(base()).text));
});
test('every number in the text traces back to the input', () => {
  const d = base(), t = summariseMarginsTab(d).text;
  const allowed = new Set(['68.5', '0.4', '1.9', '4', '2', '1.6', '0.5', '1,200', '1,890', '4.9', '650', '3.2']);
  (t.match(/\d+(?:,\d{3})*(?:\.\d+)?/g) || []).forEach(n => assert.ok(allowed.has(n), 'unexpected number ' + n + ' in: ' + t));
});
test('the same data always gives the same text', () => {
  assert.strictEqual(summariseMarginsTab(base()).text, summariseMarginsTab(clone(base())).text);
});
test('stays within the word limit and always keeps the gross profit sentence', () => {
  const d = base(); d.outlets = Array.from({ length: 30 }, (_, i) => ({ name: 'A very long outlet name number ' + i, gp: 50 - i, target: 70 }));
  CONFIG.maxWords = 25;
  const r = summariseMarginsTab(d);
  CONFIG.maxWords = 100;
  assert.ok(r.text.startsWith('Gross profit is') && r.findings[0] === 'gp');
  assert.ok(r.words <= 25 || r.findings.length === 1, r.words + ' words');
});
test('random scenarios: no NaN, no causal words, within the limit', () => {
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 300; i++) {
    const d = { comparison: 'vs last month', gp: { value: 55 + rnd() * 25 } };
    if (rnd() > .2) d.gp.target = 55 + rnd() * 25;
    if (rnd() > .2) d.gp.change = (rnd() - .5) * 8;
    if (rnd() > .3) d.outlets = Array.from({ length: 2 + Math.floor(rnd() * 28) }, (_, k) => ({ name: 'Outlet ' + k, gp: 55 + rnd() * 25, target: 55 + rnd() * 25 }));
    if (rnd() > .2) d.costs = { revenue: rnd() * 90000, wastage: rnd() * 3000, variance: rnd() > .3 ? rnd() * 3000 : 0 };
    if (rnd() > .3) d.priceImpact = { value: (rnd() - .4) * 3000, changePct: (rnd() - .4) * 8 };
    const r = summariseMarginsTab(d);
    assert.ok(r.text.length > 0 && !/undefined|NaN|Infinity/.test(r.text), i + ': ' + r.text);
    assert.ok(!causal.test(r.text) && r.words <= CONFIG.maxWords, i + ': ' + r.text);
  }
});
test('rejects malformed input with a clear message', () => {
  assert.throws(() => summariseMarginsTab(null), /must be an object/);
  assert.throws(() => summariseMarginsTab({ comparison: 'x', gp: {} }), /gp\.value/);
  assert.throws(() => summariseMarginsTab({ gp: { value: 1 } }), /comparison/);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
