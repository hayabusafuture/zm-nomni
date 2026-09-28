// node spend-briefing.test.js — no dependencies.
const assert = require('assert');
const { summariseSpendTab, CONFIG } = require('./spend-briefing.js');

let passed = 0, failed = 0;
function test(name, fn){ try { fn(); passed++; console.log('  ✓ ' + name); } catch (e) { failed++; console.log('  ✗ ' + name + '\n    ' + e.message); } }
const clone = o => JSON.parse(JSON.stringify(o));

function base(){
  return {
    comparisonLabel: 'the same days last month', periodLabel: 'this month',
    spend: { current: 36478, previous: 37401 },
    suppliers: [
      { id: 'sun', name: 'Sunrise Poultry Distributors', spend: 7647, previousSpend: 8202 },
      { id: 'coa', name: 'Coastal Beverages', spend: 1954, previousSpend: 2203 },
      { id: 'har', name: 'Harbour Seafood Supply', spend: 4754, previousSpend: 4971 },
      { id: 'nor', name: 'Northside Meats', spend: 4321, previousSpend: 4133 },
      { id: 'oth', name: 'Everyone else', spend: 17802, previousSpend: 17892 }
    ],
    priceMoves: [
      { id: 'spinach', item: 'Baby spinach', supplier: 'Green Valley Produce', change: 12.7, outlets: ['A', 'B', 'C', 'D', 'E', 'F'] },
      { id: 'chicken:wyn', item: 'Chicken thigh fillet', supplier: 'Sunrise Poultry Distributors', change: 10.6, outlets: ["Roll'd Wynyard"] },
      { id: 'oil:bon', item: 'Olive oil', supplier: 'Pantry Wholesale', change: -10.3, outlets: ["Roll'd Bondi"] }
    ],
    discrepancies: {
      over: { value: 690, count: 11 }, notReceived: { value: 0, count: 0 },
      bySupplier: [{ id: 'sun', name: 'Sunrise Poultry Distributors', over: 490, notReceived: 0 }, { id: 'har', name: 'Harbour Seafood Supply', over: 70, notReceived: 0 }]
    },
    reliability: [
      { id: 'sun', name: 'Sunrise Poultry Distributors', fill: 0.91, accuracy: 0.65 },
      { id: 'har', name: 'Harbour Seafood Supply', fill: 0.94, accuracy: 0.90 }
    ],
    outlets: [
      { id: 'wyn', name: "Roll'd Wynyard", spend: 3145, previousSpend: 2726 },
      { id: 'bar', name: "Roll'd Barangaroo", spend: 4041, previousSpend: 4703 },
      { id: 'mar', name: "Roll'd Martin Place", spend: 3038, previousSpend: 3378 }
    ]
  };
}

// Random scenarios for the property tests.
function rng(seed){ let s = seed; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function randomScenario(seed){
  const r = rng(seed), n = 2 + Math.floor(r() * 10);
  const suppliers = Array.from({ length: n }, (_, i) => { const p = 200 + r() * 9000; return { id: 's' + i, name: 'Supplier ' + i, spend: p * (0.6 + r() * 0.8), previousSpend: p }; });
  const spend = { current: suppliers.reduce((s, x) => s + x.spend, 0), previous: suppliers.reduce((s, x) => s + x.previousSpend, 0) };
  const priceMoves = Array.from({ length: Math.floor(r() * 8) }, (_, i) => ({ id: 'p' + i, item: 'Item ' + i, supplier: 'Supplier ' + (i % n), change: (r() - 0.4) * 30, outlets: r() > 0.5 ? ['Outlet ' + i] : ['X', 'Y', 'Z'] }));
  const over = r() * 1500, nr = r() > 0.7 ? r() * 300 : 0;
  return {
    comparisonLabel: 'the same days last month', periodLabel: 'this month', spend, suppliers, priceMoves,
    discrepancies: { over: { value: over, count: 3 }, notReceived: { value: nr, count: nr ? 1 : 0 }, bySupplier: suppliers.slice(0, 3).map((s, i) => ({ id: s.id, name: s.name, over: over * [0.6, 0.3, 0.1][i], notReceived: 0 })) },
    reliability: suppliers.slice(0, 4).map(s => ({ id: s.id, name: s.name, fill: 0.8 + r() * 0.2, accuracy: 0.6 + r() * 0.4 })),
    outlets: r() > 0.3 ? Array.from({ length: 2 + Math.floor(r() * 6) }, (_, i) => { const p = 1000 + r() * 4000; return { id: 'o' + i, name: 'Outlet ' + i, spend: p * (0.7 + r() * 0.6), previousSpend: p }; }) : undefined
  };
}

console.log('spend-briefing');

test('identical data gives identical text', () => {
  const a = summariseSpendTab(base()), b = summariseSpendTab(base());
  assert.strictEqual(a.text, b.text);
});

test('same data with its own memory returns the cached text', () => {
  const a = summariseSpendTab(base()), b = summariseSpendTab(base(), a.memory);
  assert.strictEqual(b.text, a.text);
});

test('spend change is always included, split by supplier', () => {
  const r = summariseSpendTab(base());
  assert.ok(r.findings.some(f => f.key === 'spend'));
  assert.match(r.text, /Sunrise Poultry Distributors \(−S\$555\)|S\$555 of the 2% drop/);
});

test('a big spend change leads; a small one can become context', () => {
  const d = base(); d.spend = { current: 30000, previous: 37401 }; d.suppliers[4].spend = 11324;
  assert.match(summariseSpendTab(d).text, /^(Spend|Most of the 20% drop|Everyone else accounts)/);
});

test('steady spend with nothing else to say reads as a steady period', () => {
  const d = base(); d.spend = { current: 37100, previous: 37401 };
  d.priceMoves = []; d.discrepancies.over.value = 0; d.reliability = []; d.outlets = [];
  assert.match(summariseSpendTab(d).text, /steady period|Little to report/);
});

test('steady spend is not pinned: stronger findings can replace it', () => {
  const d = base(); d.spend = { current: 37100, previous: 37401 };
  const r = summariseSpendTab(d);
  assert.doesNotMatch(r.text, /mostly from/);
});

test('two suppliers share the change when neither holds 60%', () => {
  const d = base(); d.discrepancies.over.value = 0; d.reliability = []; d.priceMoves = []; d.outlets = [];
  d.suppliers = [
    { id: 'a', name: 'Alpha', spend: 1000, previousSpend: 1500 },
    { id: 'b', name: 'Beta', spend: 1000, previousSpend: 1400 },
    { id: 'c', name: 'Gamma', spend: 1000, previousSpend: 1100 }
  ];
  d.spend = { current: 3000, previous: 4000 };
  assert.match(summariseSpendTab(d).text, /Alpha \(−S\$500\) and Beta \(−S\$400\)/);
});

test('a supplier offsetting 30%+ of the change is named as going the other way', () => {
  const d = base(); d.discrepancies.over.value = 0; d.reliability = []; d.priceMoves = []; d.outlets = [];
  d.suppliers = [{ id: 'a', name: 'Alpha', spend: 1000, previousSpend: 2000 }, { id: 'b', name: 'Beta', spend: 1400, previousSpend: 1000 }];
  d.spend = { current: 2400, previous: 3000 };
  assert.match(summariseSpendTab(d).text, /Beta went the other way \(\+S\$400\)/);
});

test('facts about one supplier are told as one story, without repeating its name', () => {
  const d = base(); d.outlets = []; d.priceMoves = [];
  for (let g = 1; g <= 12; g++) {
    const t = summariseSpendTab(d, { generation: g }).text;
    const mentions = t.split('Sunrise Poultry Distributors').length - 1;
    assert.ok(mentions === 1, 'named ' + mentions + ' times: ' + t);
    assert.match(t, /65% of its invoice lines at the ordered price|65% of invoice lines|S\$490 of the S\$690/);
  }
});

test('the story never says "billed" twice in one sentence', () => {
  const d = base(); d.outlets = []; d.priceMoves = [];
  for (let g = 1; g <= 12; g++) {
    const t = summariseSpendTab(d, { generation: g }).text;
    t.split(/(?<=\.)\s/).forEach(sentence => assert.ok((sentence.match(/\bbilled\b/g) || []).length <= 1, sentence));
  }
});

test('openings vary across data: not every briefing starts with "Spend"', () => {
  const starts = new Set();
  for (let seed = 1; seed <= 60; seed++) starts.add(summariseSpendTab(randomScenario(seed)).text.split(' ').slice(0, 2).join(' '));
  assert.ok(starts.size >= 6, 'only ' + starts.size + ' different openings: ' + [...starts].join(' | '));
});

test('discrepancies name a supplier only with half or more', () => {
  const d = base(); d.discrepancies.bySupplier[0].over = 300; d.suppliers[0].previousSpend = 7647; // stop spend naming Sunrise
  d.spend = { current: 36478, previous: 36846 };
  d.reliability = []; d.priceMoves = []; d.outlets = [];
  const r = summariseSpendTab(d);
  assert.match(r.text, /S\$690 was invoiced above the ordered price\.|Invoices came in S\$690 above/);
});

test('not received is mentioned only when it is above S$0', () => {
  const d = base(); d.reliability = []; d.outlets = []; d.priceMoves = [];
  assert.doesNotMatch(summariseSpendTab(d).text, /not received/);
  d.discrepancies.notReceived = { value: 120, count: 2 };
  assert.match(summariseSpendTab(d).text, /S\$120 (was )?invoiced but not received/);
});

test('small discrepancies are not mentioned', () => {
  const d = base(); d.discrepancies.over.value = 40;
  assert.ok(!summariseSpendTab(d).findings.some(f => f.key === 'discrepancy'));
});

test('a price rise says where: one outlet by name, several by count, all as "all"', () => {
  const d = base(); d.discrepancies.over.value = 0; d.reliability = []; d.outlets = [];
  assert.match(summariseSpendTab(d).text, /12\.7% at 6 outlets/);
  d.outletCount = 6;
  assert.match(summariseSpendTab(d).text, /12\.7% at all 6 outlets/);
  d.priceMoves[0].outlets = ["Roll'd Bondi"];
  assert.match(summariseSpendTab(d).text, /12\.7% at Roll'd Bondi/);
});

test('rows for the same item at different outlets group into one item, reporting the largest rise', () => {
  const d = base(); d.discrepancies.over.value = 0; d.reliability = []; d.outlets = [];
  d.priceMoves = [
    { id: 'c:a', item: 'Chicken thigh', supplier: 'Sunrise', change: 14.3, outlets: ['Glebe'] },
    { id: 'c:b', item: 'Chicken thigh', supplier: 'Sunrise', change: 9.1, outlets: ['Ryde', 'Rhodes'] },
    { id: 'm:a', item: 'Milk', supplier: 'Eastview', change: 6, outlets: ['Glebe'] }
  ];
  const t = summariseSpendTab(d).text;
  assert.match(t, /(by )?up to 14\.3% at 3 outlets/);
  assert.match(t, /two items/i);
});

test('"the largest" is only said with a clear lead', () => {
  const d = base(); d.discrepancies.over.value = 0; d.reliability = []; d.outlets = [];
  d.priceMoves[1].change = 12.0; // within 2 pts of 12.7
  const t = summariseSpendTab(d).text;
  assert.doesNotMatch(t, /largest/);
  assert.match(t, /one of two items up more than 5%/);
});

test('price falls are not reported as rises', () => {
  const d = base(); d.priceMoves = [{ id: 'x', item: 'Olive oil', supplier: 'Pantry', change: -12, outlets: [] }];
  assert.ok(!summariseSpendTab(d).findings.some(f => f.key === 'price'));
});

test('reliability is judged on the figure shown: 89.6% reads as 90% and is not mentioned', () => {
  const d = base(); d.reliability = [{ id: 'x', name: 'Xeno', fill: 0.896, accuracy: 0.95 }];
  assert.ok(!summariseSpendTab(d).findings.some(f => f.key === 'reliability'));
  d.reliability[0].fill = 0.894; d.priceMoves = []; d.discrepancies.over.value = 0; d.outlets = [];
  assert.match(summariseSpendTab(d).text, /Xeno invoiced 89% of the quantity ordered|Xeno’s fill rate was 89%/);
});

test('an outlet moving against the group appears only in a group view', () => {
  const d = base(); d.discrepancies.over.value = 0; d.reliability = []; d.priceMoves = [];
  assert.match(summariseSpendTab(d).text, /Roll'd Wynyard/);
  delete d.outlets;
  assert.doesNotMatch(summariseSpendTab(d).text, /Roll'd Wynyard/);
});

test('a supplier story can include a price rise from the same supplier', () => {
  const d = base(); d.outlets = []; d.discrepancies.over.value = 0;
  d.priceMoves = [{ id: 'c', item: 'Chicken thigh', supplier: 'Sunrise Poultry Distributors', change: 13.9, outlets: ['A', 'B'] }];
  const t = summariseSpendTab(d).text;
  assert.match(t, /raised the price of Chicken thigh by 13\.9% at 2 outlets/);
});

test('supporting findings rotate when the data changes', () => {
  const d = base();
  const seen = new Set();
  let memory;
  for (let i = 0; i < 6; i++) {
    d.spend.current += 1; // new data each time, same story
    const r = summariseSpendTab(clone(d), memory); memory = r.memory;
    r.findings.slice(1).forEach(f => seen.add(f.key));
  }
  assert.ok(seen.size >= 3, 'expected at least three different supporting findings, saw ' + [...seen].join(', '));
});

test('never over the word budget, never a causal word, across 300 random scenarios', () => {
  const banned = /\b(because|usually|likely|suggests?|driven by|due to|caused|probably|as a result)\b/i;
  for (let seed = 1; seed <= 300; seed++) {
    const r = summariseSpendTab(randomScenario(seed));
    assert.ok(r.words <= CONFIG.maxWords, 'seed ' + seed + ': ' + r.words + ' words');
    assert.ok(!banned.test(r.text), 'seed ' + seed + ': ' + r.text);
    assert.ok(r.text.length > 0 && !/undefined|NaN/.test(r.text), 'seed ' + seed + ': ' + r.text);
  }
});

test('rejects malformed input with a clear message', () => {
  assert.throws(() => summariseSpendTab(null), /must be an object/);
  assert.throws(() => summariseSpendTab({ comparisonLabel: 'x', suppliers: [] }), /spend\.current/);
  const d = base(); delete d.comparisonLabel; assert.throws(() => summariseSpendTab(d), /comparisonLabel/);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
