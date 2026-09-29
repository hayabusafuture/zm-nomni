/**
 * margins-briefing.js
 * ------------------------------------------------------------------------
 * A short (≤100 word) briefing for the Margins tab, built only from the
 * numbers the tab already shows. Local and deterministic: no network, no
 * model, no random numbers. The same approach as sales-briefing.js and
 * spend-briefing.js.
 *
 *   summariseMarginsTab(data) → { text, words, findings }
 *
 * WHAT IT SAYS
 *   Four kinds of statement, in this order, each left out when there is
 *   nothing to say:
 *     1. gross profit against target, and against the comparison period
 *     2. which outlets are below target, and by how much (group view only)
 *     3. recorded wastage and unexplained variance, as amounts and as a share
 *        of revenue
 *     4. what supplier price changes added to (or took off) costs
 *
 * WHAT IT WON'T SAY
 *   It never says WHY. The cost lines are listed next to the gross profit
 *   figure, not offered as its explanation: nothing links them by cause, and
 *   nothing in the data could show that they do. No "because", no "driven
 *   by", no "which suggests". Every number is a figure the tab shows, or
 *   simple arithmetic on those figures (a difference, a share of revenue).
 *   Wastage and variance are stated as amounts only. Their trend isn't
 *   reported: the tab has no reliable comparison for them yet.
 *
 * ------------------------------------------------------------------------
 * INPUT: the Margins tab's own data, already normalised.
 *
 * data = {
 *   comparison: 'vs last month',       // how the tab labels the comparison
 *   gp: {
 *     value,                           // gross profit %, for the whole view
 *     target?,                         // target %, revenue-weighted for a group
 *     change?                          // points vs the comparison period
 *   },
 *   outlets?: [{ name, gp, target }],  // group view only: each outlet's GP % and target %
 *   costs?: { revenue, wastage, variance },   // S$; wastage and variance are recorded amounts
 *   priceImpact?: { value, changePct } | null // S$ signed (+ = extra cost), % on the same purchases
 * }
 *
 * RETURNS  text, words, findings (the keys of what was said, in order)
 * ------------------------------------------------------------------------
 */

(function (root) {
  'use strict';

  var CONFIG = {
    maxWords: 100,
    maxNamedOutlets: 2   // furthest-below outlets to name
  };

  function summariseMarginsTab(data) {
    validate(data);
    var found = []
      .concat(gpFinding(data))
      .concat(outletFinding(data))
      .concat(costFinding(data))
      .concat(priceFinding(data));

    // Over the word limit: drop from the end, never the gross profit sentence.
    while (found.length > 1 && wordCount(found.map(text).join(' ')) > CONFIG.maxWords) found.pop();

    var out = found.map(text).join(' ');
    return { text: out, words: wordCount(out), findings: found.map(function (f) { return f.key; }) };
  }

  /* ════════════════════════════════════════════════════════════════════
     FINDINGS
     ════════════════════════════════════════════════════════════════════ */

  function gpFinding(d) {
    var g = d.gp, value = r1(g.value), parts = [];
    var moved = isNum(g.change) ? r1(g.change) : null;
    if (isNum(g.target)) {
      var gap = r1(value - r1(g.target));
      parts.push(gap === 0 ? 'on target' : pts(gap) + (gap > 0 ? ' above' : ' below') + ' target');
    }
    if (moved !== null) parts.push(moved === 0 ? 'unchanged ' + d.comparison : (moved > 0 ? 'up ' : 'down ') + pts(moved) + ' ' + d.comparison);
    var s = 'Gross profit is ' + value.toFixed(1) + '%' + (parts.length ? ', ' + and(parts) : '') + '.';
    return [{ key: 'gp', s: s }];
  }

  function outletFinding(d) {
    var list = (d.outlets || []).filter(function (o) { return isNum(o.gp) && isNum(o.target); });
    if (list.length < 2) return [];
    var gaps = list.map(function (o) { return { name: o.name, gap: r1(r1(o.gp) - r1(o.target)) }; });
    var below = gaps.filter(function (o) { return o.gap < 0; }).sort(function (a, b) { return a.gap - b.gap; });
    var n = list.length, s;
    if (!below.length) {
      s = 'All ' + n + ' outlets are at or above target.';
    } else if (below.length === 1) {
      s = 'Only ' + below[0].name + ' is below target, by ' + pts(below[0].gap) + '.';
    } else {
      var named = below.slice(0, CONFIG.maxNamedOutlets).map(function (o) { return o.name + ' (' + pts(o.gap) + ')'; });
      var lead = below.length === n ? 'All ' + n + ' outlets are below target' : below.length + ' of ' + n + ' outlets are below target';
      s = lead + ', furthest ' + and(named) + '.';
    }
    return [{ key: 'outlets', s: s }];
  }

  function costFinding(d) {
    var c = d.costs;
    if (!c) return [];
    var w = isNum(c.wastage) ? c.wastage : 0, v = isNum(c.variance) ? c.variance : 0;
    var w10 = round10(w), v10 = round10(v);
    var parts = [];
    if (w10 > 0) parts.push('Recorded wastage is ' + money(w10));
    if (v10 > 0) parts.push((parts.length ? 'unexplained variance is ' : 'Unexplained variance is ') + money(v10));
    if (!parts.length) return [];
    var s = parts.join(' and ');
    if (w10 > 0 && v10 > 0 && isNum(c.revenue) && c.revenue > 0) s += ', together ' + r1((w + v) / c.revenue * 100).toFixed(1) + '% of revenue';
    return [{ key: 'costs', s: s + '.' }];
  }

  function priceFinding(d) {
    var p = d.priceImpact;
    if (!p || !isNum(p.value)) return [];
    var amount = round10(Math.abs(p.value));
    if (amount === 0) return [];
    var up = p.value > 0;
    var pct = isNum(p.changePct) ? ', ' + r1(Math.abs(p.changePct)).toFixed(1) + '% ' + (up ? 'more' : 'less') + ' than the same purchases at the old prices' : '';
    return [{ key: 'price', s: 'Supplier price changes on the items Procure tracks ' + (up ? 'added ' + money(amount) + ' to' : 'took ' + money(amount) + ' off') + ' costs' + pct + '.' }];
  }

  /* ════════════════════════════════════════════════════════════════════
     INPUT CHECK & HELPERS
     ════════════════════════════════════════════════════════════════════ */

  function validate(d) {
    if (!d || typeof d !== 'object') throw new Error('margins-briefing: data must be an object');
    if (typeof d.comparison !== 'string' || !d.comparison) throw new Error('margins-briefing: data.comparison is required');
    if (!d.gp || !isNum(d.gp.value)) throw new Error('margins-briefing: data.gp.value must be a number');
  }

  function text(f) { return f.s; }
  function isNum(v) { return typeof v === 'number' && isFinite(v); }
  function r1(v) { return Math.round(v * 10) / 10; }
  function round10(v) { return Math.round(v / 10) * 10; }
  function pts(v) { return Math.abs(r1(v)).toFixed(1) + ' pts'; }
  function money(v) { return 'S$' + Math.round(v).toLocaleString('en-SG'); }
  function wordCount(s) { return s.trim().split(/\s+/).filter(Boolean).length; }
  function and(a) { return a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }

  var api = { summariseMarginsTab: summariseMarginsTab, CONFIG: CONFIG };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (root) root.MarginsBriefing = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
