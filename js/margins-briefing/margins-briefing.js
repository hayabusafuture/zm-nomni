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
 *   Up to six kinds of statement; each is left out when there is nothing to say:
 *     gp        gross profit against target, and against the comparison period
 *     outlets   which outlets are below target, and by how much (group view only)
 *     trend     how many days/weeks/months gross profit was below target, and the lowest
 *     category  which sales categories have the highest and lowest COGS
 *     costs     wastage and unexplained variance, as amounts and as a share of revenue
 *     price     what supplier price changes added to (or took off) costs
 *   Gross profit is always said. Of the rest, at most three are said (four
 *   sentences in all), so the briefing stays short: the more notable ones win.
 *
 * HOW IT AVOIDS SOUNDING THE SAME EVERY TIME
 *   1. WHICH FACTS APPEAR. Each statement gets a score from its own numbers
 *      (how far from target, how many outlets, how big the move, how wide the
 *      category spread). The three highest-scoring supporting statements are
 *      said, after a small nudge derived from the data so that close calls
 *      don't always go the same way.
 *   2. THE LEAD FOLLOWS WHAT IS NOTABLE. Gross profit leads by default;
 *      another statement leads only when it is clearly more notable. The rest
 *      follow in score order.
 *   3. SEVERAL WORDINGS PER STATEMENT, in different shapes, all saying exactly
 *      the same thing with exactly the same figures.
 *   Everything in 1-3 comes from a hash of the displayed figures, so identical
 *   data always gives identical text (no flicker on re-render) and changed data
 *   usually reads differently. There is no stored memory.
 *
 * WHAT IT WON'T SAY
 *   It never says WHY. The statements are listed side by side, not offered as
 *   each other's explanation: nothing links them by cause, and nothing in the
 *   data could show that they do. No "because", no "driven by", no "which
 *   suggests". Every number is a figure the tab shows, or simple arithmetic on
 *   those figures (a difference, a count, a share). Wastage and variance are
 *   stated as amounts only. Their trend isn't reported: the tab has no
 *   reliable comparison for them yet.
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
 *   trend?: {                          // gross profit at each interval of the period
 *     unit: 'day' | 'week' | 'month',
 *     target,                          // gross profit target %
 *     points: [{ label, gp }]          // label as the chart shows it, e.g. '14 Sep', 'w/e 6 Jul', 'Mar'
 *   },
 *   categories?: {                     // COGS by sales category
 *     overall,                         // overall COGS %
 *     rows: [{ name, cogsPct, salesShare }]   // salesShare in % of sales
 *   },
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
    maxStatements: 4,      // gross profit plus up to three others
    maxNamedOutlets: 2,    // furthest-below outlets to name
    leadMargin: 0.15,      // another statement must beat gross profit's score by this to lead
    nudge: 0.24,           // total width of the data-derived nudge on supporting scores
    minTrendPoints: 4
  };

  // opts.seed forces a wording, and opts.unlimited says every statement (both are for tests).
  function summariseMarginsTab(data, opts) {
    validate(data);
    opts = opts || {};
    var seed = isNum(opts.seed) ? opts.seed >>> 0 : hashData(data);

    var found = []
      .concat(gpFinding(data))
      .concat(outletFinding(data))
      .concat(trendFinding(data))
      .concat(categoryFinding(data))
      .concat(costFinding(data))
      .concat(priceFinding(data));
    found.forEach(function (f) { f.nudged = f.score + (hashString(seed + f.key) / 4294967296 - 0.5) * CONFIG.nudge; });

    // Which facts: gross profit, then the highest-scoring others.
    var gp = found[0];
    var others = found.slice(1).sort(function (a, b) { return b.nudged - a.nudged; });
    var chosen = opts.unlimited ? found.slice() : [gp].concat(others.slice(0, CONFIG.maxStatements - 1));

    // The lead: gross profit unless something else is clearly more notable (raw scores, no nudge).
    var lead = chosen.reduce(function (best, f) { return f.score > best.score ? f : best; }, gp);
    if (lead !== gp && lead.score < gp.score + CONFIG.leadMargin) lead = gp;
    var ordered = [lead].concat(chosen.filter(function (f) { return f !== lead; }).sort(function (a, b) { return b.nudged - a.nudged; }));

    // Each statement picks its wording from its own stream, so it doesn't change when the order does.
    var sentences = ordered.map(function (f) { return { key: f.key, s: f.say(picker((seed ^ hashString(f.key)) >>> 0)) }; });

    // Over the word limit: drop from the end, never the gross profit sentence.
    function total() { return wordCount(sentences.map(function (x) { return x.s; }).join(' ')); }
    while (!opts.unlimited && sentences.length > 1 && total() > CONFIG.maxWords) {
      for (var i = sentences.length - 1; i >= 0; i--) if (sentences[i].key !== 'gp') { sentences.splice(i, 1); break; }
    }

    var out = sentences.map(function (x) { return x.s; }).join(' ');
    return { text: out, words: wordCount(out), findings: sentences.map(function (x) { return x.key; }) };
  }

  /* ════════════════════════════════════════════════════════════════════
     FINDINGS
     Each is { key, score, say(pick) }. score is how notable it is (0–1),
     from its own numbers. say() returns the sentence; every wording it can
     choose has the same figures.
     ════════════════════════════════════════════════════════════════════ */

  function gpFinding(d) {
    var g = d.gp, value = r1(g.value);
    var moved = isNum(g.change) ? r1(g.change) : null;
    var gap = isNum(g.target) ? r1(value - r1(g.target)) : null;
    var score = 0.35 + clamp(Math.abs(gap || 0) / 2) * 0.35 + clamp(Math.abs(moved || 0) / 3) * 0.25;
    return [{
      key: 'gp', score: score,
      say: function (pick) {
        var parts = [];
        if (gap !== null) {
          var a = pts(gap);
          parts.push(gap === 0 ? pick(['on target', 'right on target'])
            : gap > 0 ? pick([a + ' above target', a + ' ahead of target', a + ' over target'])
            : pick([a + ' below target', a + ' under target', a + ' short of target']));
        }
        if (moved !== null) {
          var m = pts(moved), c = d.comparison;
          parts.push(moved === 0 ? pick(['unchanged ' + c, 'no change ' + c])
            : moved > 0 ? pick(['up ' + m + ' ' + c, m + ' higher ' + c])
            : pick(['down ' + m + ' ' + c, m + ' lower ' + c]));
        }
        var lead = pick(['Gross profit is ', 'Gross profit stands at ', 'Overall gross profit is ']);
        return lead + value.toFixed(1) + '%' + (parts.length ? ', ' + and(parts) : '') + '.';
      }
    }];
  }

  function outletFinding(d) {
    var list = (d.outlets || []).filter(function (o) { return isNum(o.gp) && isNum(o.target); });
    if (list.length < 2) return [];
    var gaps = list.map(function (o) { return { name: o.name, gap: r1(r1(o.gp) - r1(o.target)) }; });
    var below = gaps.filter(function (o) { return o.gap < 0; }).sort(function (a, b) { return a.gap - b.gap; });
    var n = list.length;
    var score = below.length ? 0.25 + clamp(below.length / n) * 0.3 + clamp(Math.abs(below[0].gap) / 3) * 0.3 : 0.1;
    return [{
      key: 'outlets', score: score,
      say: function (pick) {
        if (!below.length) return pick([
          'All ' + n + ' outlets are at or above target.',
          'Every one of the ' + n + ' outlets is at or above target.',
          'No outlet is below target: all ' + n + ' are at or above it.'
        ]);
        if (below.length === 1) {
          var o = below[0], by = pts(o.gap);
          return pick([
            'Only ' + o.name + ' is below target, by ' + by + '.',
            o.name + ' is the only outlet below target, by ' + by + '.',
            'Just ' + o.name + ' is under target, by ' + by + '.'
          ]);
        }
        var named = below.slice(0, CONFIG.maxNamedOutlets).map(function (x) { return x.name + ' (' + pts(x.gap) + ')'; });
        var count = below.length === n ? 'All ' + n + ' outlets' : below.length + ' of ' + n + ' outlets';
        return pick([
          count + ' are below target, furthest ' + and(named) + '.',
          count + ' are under target. The furthest are ' + and(named) + '.',
          count + ' are below target, with ' + and(named) + ' furthest below.'
        ]);
      }
    }];
  }

  function trendFinding(d) {
    var t = d.trend;
    if (!t || !Array.isArray(t.points) || !isNum(t.target)) return [];
    var pts_ = t.points.filter(function (p) { return isNum(p.gp) && typeof p.label === 'string'; });
    if (pts_.length < CONFIG.minTrendPoints) return [];
    var target = r1(t.target), n = pts_.length;
    var below = pts_.filter(function (p) { return r1(p.gp) < target; }).length;
    var low = pts_.reduce(function (m, p) { return p.gp < m.gp ? p : m; }, pts_[0]);
    var unit = t.unit === 'week' ? 'week' : t.unit === 'month' ? 'month' : 'day';
    var units = unit + 's';
    var when = unit === 'week' ? 'the week ending ' + low.label.replace(/^w\/e\s*/, '') : unit === 'month' ? low.label : low.label;
    var atWhen = unit === 'day' ? 'on ' + when : unit === 'month' ? 'in ' + when : when;
    var v = r1(low.gp).toFixed(1) + '%';
    var score = 0.15 + clamp(below / n) * 0.3;
    return [{
      key: 'trend', score: score,
      say: function (pick) {
        if (below === 0) return pick([
          'Gross profit was at or above target on every ' + unit + ', lowest ' + atWhen + ' at ' + v + '.',
          'Not one of the ' + n + ' ' + units + ' fell below target; the lowest gross profit was ' + v + ' ' + atWhen + '.',
          'Every ' + unit + ' held gross profit at or above target, with a low of ' + v + ' ' + atWhen + '.'
        ]);
        var count = below === n ? 'every ' + unit : below + ' of ' + n + ' ' + units;
        return pick([
          'Gross profit was below target on ' + count + ', lowest ' + atWhen + ' at ' + v + '.',
          'The lowest gross profit was ' + v + ' ' + atWhen + ', and ' + (below === n ? 'every ' + unit + ' was' : below + ' of ' + n + ' ' + units + ' were') + ' under target.',
          below === n ? 'No ' + unit + ' reached the gross profit target; the lowest was ' + v + ' ' + atWhen + '.'
                      : 'Across the ' + n + ' ' + units + ', ' + below + ' finished under the gross profit target, the lowest at ' + v + ' ' + atWhen + '.'
        ]);
      }
    }];
  }

  function categoryFinding(d) {
    var c = d.categories;
    if (!c || !Array.isArray(c.rows)) return [];
    var rows = c.rows.filter(function (r) { return isNum(r.cogsPct) && typeof r.name === 'string'; })
      .sort(function (a, b) { return b.cogsPct - a.cogsPct || a.name.localeCompare(b.name); });
    if (rows.length < 2) return [];
    var hi = rows[0], lo = rows[rows.length - 1];
    var hiV = r1(hi.cogsPct), loV = r1(lo.cogsPct), spread = r1(hiV - loV);
    if (spread <= 0) return [];
    var share = isNum(hi.salesShare) ? Math.round(hi.salesShare) : null;
    var overall = isNum(c.overall) ? r1(c.overall) : null;
    var above = overall === null ? [] : rows.filter(function (r) { return r1(r.cogsPct) > overall; });
    var score = 0.12 + clamp(spread / 25) * 0.28;
    return [{
      key: 'category', score: score,
      say: function (pick) {
        var h = hi.name + ' (' + hiV.toFixed(1) + '%)', l = lo.name + ' (' + loV.toFixed(1) + '%)';
        var shapes = [
          function () { return 'By category, COGS is highest for ' + hi.name + ' at ' + hiV.toFixed(1) + '% and lowest for ' + lo.name + ' at ' + loV.toFixed(1) + '%.'; },
          function () { return hi.name + ' has the highest COGS of any category, ' + hiV.toFixed(1) + '%' + (share !== null ? ' on ' + share + '% of sales' : '') + ', against ' + loV.toFixed(1) + '% for ' + lo.name + '.'; },
          function () { return 'COGS runs from ' + loV.toFixed(1) + '% for ' + lo.name + ' up to ' + hiV.toFixed(1) + '% for ' + hi.name + '.'; }
        ];
        if (overall !== null && above.length && above.length < rows.length) {
          shapes.push(function () {
            var named = above.slice(0, 2).map(function (r) { return r.name + ' (' + r1(r.cogsPct).toFixed(1) + '%)'; });
            return above.length + ' of ' + rows.length + ' categories run above the overall COGS of ' + overall.toFixed(1) + '%, ' + (above.length > 2 ? 'led by ' : 'namely ') + and(named) + '.';
          });
        }
        return pick(shapes)();
      }
    }];
  }

  function costFinding(d) {
    var c = d.costs;
    if (!c) return [];
    var w = isNum(c.wastage) ? c.wastage : 0, v = isNum(c.variance) ? c.variance : 0;
    var w10 = round10(w), v10 = round10(v);
    if (w10 <= 0 && v10 <= 0) return [];
    var share = isNum(c.revenue) && c.revenue > 0 ? r1((w + v) / c.revenue * 100) : null;
    var score = 0.2 + clamp((share || 0) / 6) * 0.3;
    return [{
      key: 'costs', score: score,
      say: function (pick) {
        // The tab's own labels are "Recorded wastage" and "Unexplained variance"; the sentence says the same things in other words.
        var W = pick(['recorded wastage', 'logged wastage', 'wastage on record', 'wastage']);
        var V = pick(['unexplained variance', 'variance left unexplained', 'unaccounted-for variance']);
        var s;
        if (w10 > 0 && v10 > 0) {
          var z = share === null ? null : share.toFixed(1) + '% of revenue';
          // Three different shapes, not three rewordings of one sentence.
          var shape = z === null ? 0 : pick([0, 1, 2]);
          if (shape === 1) return cap(W) + ' (' + money(w10) + ') and ' + V + ' (' + money(v10) + ') ' + pick(['add up to ', 'come to ']) + z + '.';
          if (shape === 2) return cap(W) + ': ' + money(w10) + '. ' + cap(V) + ': ' + money(v10) + '. Together that is ' + z + '.';
          var past = pick([false, true]);   // one tense for both halves
          s = cap(W) + (past ? ' came to ' : ' is ') + money(w10) + ' and ' + V + (past ? ' was ' : ' is ') + money(v10);
          if (z !== null) s += pick([', together ' + z, ', ' + z + ' combined']);
        } else if (w10 > 0) {
          s = cap(W) + pick([' is ', ' came to ']) + money(w10);
        } else {
          s = cap(V) + pick([' is ', ' came to ']) + money(v10);
        }
        return s + '.';
      }
    }];
  }

  function priceFinding(d) {
    var p = d.priceImpact;
    if (!p || !isNum(p.value)) return [];
    var amount = round10(Math.abs(p.value));
    if (amount === 0) return [];
    var up = p.value > 0;
    var pct = isNum(p.changePct) ? r1(Math.abs(p.changePct)).toFixed(1) + '%' : null;
    var score = 0.15 + clamp((pct ? parseFloat(pct) : 0) / 6) * 0.45;
    return [{
      key: 'price', score: score,
      say: function (pick) {
        // What the figure covers (items with a price in both periods) is explained in the tile's "i" tooltip, not repeated here.
        var amt = money(amount), shape = pick([0, 1, 2]);
        var moreLess = up ? 'more' : 'less';
        if (shape === 1) return 'Compared with the old prices, the same purchases cost ' + amt + (pct ? ' (' + pct + ')' : '') + ' ' + moreLess + '.';
        if (shape === 2) return pick(['Price changes from suppliers ', 'Suppliers\' price changes ']) + (up ? 'added ' + amt + ' to' : 'took ' + amt + ' off') + ' costs' + (pct ? ' (' + pct + ')' : '') + '.';
        var verb = up ? pick(['added ' + amt + ' to costs', 'pushed costs up by ' + amt]) : pick(['took ' + amt + ' off costs', 'lowered costs by ' + amt]);
        var tail = pct === null ? '' : ', ' + pct + ' ' + (up ? pick(['more than at the old prices', 'above the old prices']) : pick(['less than at the old prices', 'below the old prices']));
        return 'Supplier price changes ' + verb + tail + '.';
      }
    }];
  }

  /* ════════════════════════════════════════════════════════════════════
     INPUT CHECK & HELPERS
     ════════════════════════════════════════════════════════════════════ */

  function validate(d) {
    if (!d || typeof d !== 'object') throw new Error('margins-briefing: data must be an object');
    if (typeof d.comparison !== 'string' || !d.comparison) throw new Error('margins-briefing: data.comparison is required');
    if (!d.gp || !isNum(d.gp.value)) throw new Error('margins-briefing: data.gp.value must be a number');
  }

  // A hash of the figures as they are displayed, so sub-display noise never changes the wording.
  function hashData(d) {
    var o = (d.outlets || []).map(function (x) { return [x.name, isNum(x.gp) ? r1(x.gp) : null, isNum(x.target) ? r1(x.target) : null]; });
    var c = d.costs ? [round10(d.costs.wastage || 0), round10(d.costs.variance || 0), Math.round(d.costs.revenue || 0)] : null;
    var p = d.priceImpact ? [round10(d.priceImpact.value), isNum(d.priceImpact.changePct) ? r1(d.priceImpact.changePct) : null] : null;
    var g = [r1(d.gp.value), isNum(d.gp.target) ? r1(d.gp.target) : null, isNum(d.gp.change) ? r1(d.gp.change) : null];
    var t = d.trend && d.trend.points ? [d.trend.unit, isNum(d.trend.target) ? r1(d.trend.target) : null, d.trend.points.map(function (x) { return [x.label, isNum(x.gp) ? r1(x.gp) : null]; })] : null;
    var k = d.categories && d.categories.rows ? d.categories.rows.map(function (x) { return [x.name, isNum(x.cogsPct) ? r1(x.cogsPct) : null, isNum(x.salesShare) ? Math.round(x.salesShare) : null]; }) : null;
    return hashString(JSON.stringify([d.comparison, g, o, t, k, c, p]));
  }
  function hashString(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function picker(seed) {
    var s = seed || 1;
    return function (arr) {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return arr[Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * arr.length)];
    };
  }

  function indexOfKey(list, key) { for (var i = 0; i < list.length; i++) if (list[i].key === key) return i; return -1; }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function isNum(v) { return typeof v === 'number' && isFinite(v); }
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
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
