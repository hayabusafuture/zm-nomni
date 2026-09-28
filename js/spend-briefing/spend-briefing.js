/**
 * spend-briefing.js
 * ------------------------------------------------------------------------
 * A short (≤100 word) briefing for the Spend & procurement tab, built only
 * from the data the tab already shows. Local and deterministic — no network,
 * no model. The same approach as sales-briefing.js.
 *
 *   summariseSpendTab(data, memory?) → { text, words, findings, memory }
 *
 * HOW IT AVOIDS SOUNDING THE SAME EVERY DAY
 *   1. It ranks findings from all panels together and leads with the strongest.
 *   2. Supporting findings ROTATE: when several qualify, it prefers ones it
 *      hasn't shown this user recently. Everything said is still true.
 *   3. Each finding has several phrasings.
 *   Identical data always returns identical text (cached against a hash of the
 *   data), so re-rendering or switching tabs never makes it flicker.
 *
 * HOW IT AVOIDS MAKING THINGS UP
 *   It never says WHY in the causal sense. The only link it draws is
 *   arithmetic: the spend change split by supplier (each supplier's change
 *   adds up exactly to the total). Supplier comes from the invoice header, so
 *   the split is always exact; category is not used, because items can sit
 *   uncategorised (TBD). No "because", no "which usually means".
 *
 * ------------------------------------------------------------------------
 * INPUT — the Spend tab's own data, already normalised. It does not read
 * invoices itself.
 *
 * data = {
 *   comparisonLabel: 'the same days last month',
 *   periodLabel:     'this month',
 *   spend: { current, previous },            // invoiced spend, as the panels
 *   suppliers: [{ id, name, spend, previousSpend }],
 *   priceMoves: [{                           // the Price movement rows, as shown
 *     id, item, supplier,
 *     change,                                // % change in unit price
 *     outlets: [names]                       // where; [] for a single-outlet view
 *   }],
 *   discrepancies: {
 *     over:        { value, count },         // invoiced above the ordered price
 *     notReceived: { value, count },         // invoiced but not received
 *     bySupplier:  [{ id, name, over, notReceived }]
 *   },
 *   reliability: [{ id, name, fill, accuracy }],   // qualified suppliers only; ratios 0–1
 *   outlets?: [{ id, name, spend, previousSpend }] // group view only
 * }
 *
 * memory — optional, persisted by the caller per user. Pass back whatever the
 * previous call returned.
 *
 * RETURNS
 *   text, words, findings [{ key, subject, score }], memory
 * ------------------------------------------------------------------------
 */

(function (root) {
  'use strict';

  var CONFIG = {
    maxWords: 100,
    minScore: 0.2,
    maxSupporting: 2,
    flatSpendPct: 2,           // spend change below this is "steady"
    offsetShare: 0.3,          // a supplier pulling the other way must offset this share of the change
    priceRisePct: 5,           // a price rise must be at least this to mention
    superlativeMarginPts: 2,   // "the largest" needs this lead over the runner-up
    minDiscrepancy: 50,        // S$ invoiced above the ordered price before it's worth saying
    discrepancyNameShare: 0.5, // one supplier must hold this share of it to be named
    reliabilityFloor: 90,      // a rate shown under this (in %) is mentioned
    outletDivergencePct: 5,    // an outlet must move this much against the group
    outletMoverPct: 10,        // …or this much when the group is flat
    recentMemory: 6
  };

  /* ════════════════════════════════════════════════════════════════════
     PUBLIC
     ════════════════════════════════════════════════════════════════════ */

  function summariseSpendTab(data, memory) {
    validate(data);
    memory = memory || {};

    var h = hashData(data);
    if (memory.lastHash === h && typeof memory.lastText === 'string') {
      return { text: memory.lastText, words: wordCount(memory.lastText),
               findings: memory.lastFindings || [], memory: memory };
    }

    var generation = (memory.generation || 0) + 1;
    var pick = picker((h ^ Math.imul(generation, 2654435761)) >>> 0);

    var findings = []
      .concat(spendFindings(data))
      .concat(priceFindings(data))
      .concat(discrepancyFindings(data))
      .concat(reliabilityFindings(data))
      .concat(outletFindings(data));

    var chosen = choose(findings, memory.recentKeys || []);
    var text = compose(chosen, pick);

    var recent = (memory.recentKeys || []).slice();
    chosen.slice(1).forEach(function (f) { recent.push(fid(f)); });
    recent = recent.slice(-CONFIG.recentMemory);

    var said = chosen.map(function (f) { return { key: f.key, subject: f.subject, score: round2(f.score) }; });
    return {
      text: text,
      words: wordCount(text),
      findings: said,
      memory: { lastHash: h, lastText: text, lastFindings: said, generation: generation, recentKeys: recent }
    };
  }

  /* ════════════════════════════════════════════════════════════════════
     SPEND — split by supplier (an exact decomposition), pinned
     ════════════════════════════════════════════════════════════════════ */

  function spendFindings(d) {
    var chg = change(d.spend.current, d.spend.previous);
    if (!isFinite(chg)) return [];
    var cmp = d.comparisonLabel;

    if (Math.abs(chg) < CONFIG.flatSpendPct) {
      var within = Math.max(1, Math.ceil(Math.abs(chg)));
      return [{
        key: 'spend', subject: 'spend', score: 0.25, steady: true,
        render: function (pick, ctx) {
          if (ctx.alone) return pick([
            'A steady period. Spend is within ' + within + '% of ' + cmp + ', and no price, supplier or outlet moved enough to call out.',
            'Little to report: spend is within ' + within + '% of ' + cmp + ', with nothing standing out.'
          ]);
          return pick([
            'Spend is within ' + within + '% of ' + cmp + '.',
            'Overall spend has barely moved on ' + cmp + '.'
          ]);
        }
      }];
    }

    var net = d.spend.current - d.spend.previous;
    var diffs = d.suppliers.map(function (s) { return { s: s, diff: s.spend - s.previousSpend }; });
    var same = diffs.filter(function (x) { return x.diff * net > 0; })
      .sort(function (a, b) { return Math.abs(b.diff) - Math.abs(a.diff); });
    var opposite = diffs.filter(function (x) { return x.diff * net < 0; })
      .sort(function (a, b) { return Math.abs(b.diff) - Math.abs(a.diff); });
    var top = same[0], second = same[1];
    var topShare = top ? top.diff / net : 0;
    var offset = opposite[0] && Math.abs(opposite[0].diff / net) >= CONFIG.offsetShare ? opposite[0] : null;
    var up = chg > 0;

    return [{
      key: 'spend', subject: 'spend', pinned: true,
      supplierId: top && (topShare >= 0.6 || !second) ? top.s.id : null,
      score: 0.3 + clamp(Math.abs(chg) / 15) * 0.7,
      render: function (pick) {
        var headline = pick(up ? [
          'Spend is up ' + abs(chg) + ' on ' + cmp,
          'Spend is up ' + abs(chg),
          'Spend rose ' + abs(chg)
        ] : [
          'Spend is down ' + abs(chg) + ' on ' + cmp,
          'Spend is down ' + abs(chg),
          'Spend fell ' + abs(chg)
        ]);
        if (!top) return headline + '.';
        var s;
        if (topShare >= 0.6 || !second) {
          s = pick([
            headline + ', mostly from ' + top.s.name + ' (' + signedMoney(top.diff) + ').',
            headline + '. Most of that came from ' + top.s.name + ' (' + signedMoney(top.diff) + ').'
          ]);
        } else {
          s = pick([
            headline + ', split between ' + top.s.name + ' (' + signedMoney(top.diff) + ') and ' + second.s.name + ' (' + signedMoney(second.diff) + ').',
            headline + '. It came from both ' + top.s.name + ' (' + signedMoney(top.diff) + ') and ' + second.s.name + ' (' + signedMoney(second.diff) + ').'
          ]);
        }
        if (offset) s += ' ' + offset.s.name + ' went the other way (' + signedMoney(offset.diff) + ').';
        return s;
      }
    }];
  }

  /* ════════════════════════════════════════════════════════════════════
     PRICE RISES — the Price movement rows, per outlet as shown
     ════════════════════════════════════════════════════════════════════ */

  function priceFindings(d) {
    // Rows are per outlet, so one item can rise at several outlets by different amounts. Group them by item and
    // report where and by how much at most — never an average, which Procure doesn't track.
    var byItem = {};
    (d.priceMoves || []).forEach(function (m) {
      if (!(m.change >= CONFIG.priceRisePct)) return;
      var k = m.item + '|' + m.supplier;
      var g = byItem[k] || (byItem[k] = { id: k, item: m.item, supplier: m.supplier, max: -Infinity, min: Infinity, outlets: [] });
      g.max = Math.max(g.max, m.change); g.min = Math.min(g.min, m.change);
      (m.outlets || []).forEach(function (o) { if (g.outlets.indexOf(o) < 0) g.outlets.push(o); });
    });
    var items = Object.keys(byItem).map(function (k) { return byItem[k]; })
      .sort(function (a, b) { return b.max - a.max; });
    if (!items.length) return [];
    var m = items[0];
    // "The largest" is only said when it clearly is.
    var clearlyLargest = !items[1] || m.max - items[1].max >= CONFIG.superlativeMarginPts;
    var several = m.outlets.length > 1;
    // The same rise everywhere (a list price change) is stated exactly; different rises say "by up to".
    var uniform = pct1(m.max) === pct1(m.min);
    var rise = several ? (uniform ? 'rose ' + pct1(m.max) + ' at ' + m.outlets.length + ' outlets' : 'rose by up to ' + pct1(m.max) + ' across ' + m.outlets.length + ' outlets')
      : 'rose ' + pct1(m.max) + (m.outlets.length === 1 ? ' at ' + m.outlets[0] : '');
    var n = items.length, over = CONFIG.priceRisePct + '%';
    return [{
      key: 'price', subject: 'price:' + m.id,
      score: 0.2 + clamp(m.max / 20) * 0.6,
      render: function (pick) {
        var base = m.item + ' from ' + m.supplier + ' ' + rise;
        if (n === 1) return pick([
          base + '.',
          base + ', the only item up more than ' + over + '.'
        ]);
        if (!clearlyLargest) return base + ', one of ' + numWord(n) + ' items up more than ' + over + '.';
        return pick([
          base + ', the largest rise of ' + numWord(n) + ' items up more than ' + over + '.',
          numWordCap(n) + ' items rose more than ' + over + ' in price. The largest: ' + m.item + ' from ' + m.supplier + ', which ' + rise + '.'
        ]);
      }
    }];
  }

  /* ════════════════════════════════════════════════════════════════════
     PRICE DISCREPANCIES — the Order accuracy headline
     ════════════════════════════════════════════════════════════════════ */

  function discrepancyFindings(d) {
    var disc = d.discrepancies;
    if (!disc || !disc.over || disc.over.value < CONFIG.minDiscrepancy) return [];
    var over = disc.over.value, notReceived = disc.notReceived ? disc.notReceived.value : 0;
    var top = (disc.bySupplier || []).slice().sort(function (a, b) { return b.over - a.over; })[0];
    var named = top && top.over / over >= CONFIG.discrepancyNameShare ? top : null;
    var ratio = d.spend.current > 0 ? over / d.spend.current * 100 : 0;
    return [{
      key: 'discrepancy', subject: 'discrepancy', supplierId: named ? named.id : null,
      score: 0.2 + clamp(ratio / 3) * 0.6,
      render: function (pick, ctx) {
        var tail = notReceived > 0 ? ', plus ' + money(notReceived) + ' invoiced but not received' : '';
        if (named && ctx.followsSupplier === named.id) {
          return 'The same supplier accounts for ' + money(named.over) + ' of the ' + money(over) + ' invoiced above the ordered price' + tail + '.';
        }
        if (named) return pick([
          money(over) + ' was invoiced above the ordered price, ' + money(named.over) + ' of it by ' + named.name + tail + '.',
          named.name + ' accounts for ' + money(named.over) + ' of the ' + money(over) + ' invoiced above the ordered price' + tail + '.'
        ]);
        return pick([
          money(over) + ' was invoiced above the ordered price' + tail + '.',
          'Invoices came in ' + money(over) + ' above the ordered price' + tail + '.'
        ]);
      }
    }];
  }

  /* ════════════════════════════════════════════════════════════════════
     SUPPLIER RELIABILITY — a rate shown under 90%
     ════════════════════════════════════════════════════════════════════ */

  function reliabilityFindings(d) {
    var worst = null;
    (d.reliability || []).forEach(function (s) {
      [['accuracy', s.accuracy], ['fill', s.fill]].forEach(function (pair) {
        var shown = Math.round(pair[1] * 100);   // judged on the figure shown, as the panel's amber
        if (shown >= CONFIG.reliabilityFloor) return;
        if (!worst || shown < worst.shown) worst = { s: s, metric: pair[0], shown: shown };
      });
    });
    if (!worst) return [];
    var w = worst;
    return [{
      key: 'reliability', subject: 'reliability:' + w.s.id, supplierId: w.s.id,
      score: 0.2 + clamp((CONFIG.reliabilityFloor - w.shown) / 30) * 0.5,
      render: function (pick, ctx) {
        var same = ctx.followsSupplier === w.s.id;
        // After "The same supplier accounts for…", a second "The same supplier" would stutter: "It" is unambiguous there.
        var who = ctx.prevKey === 'discrepancy' ? 'It' : 'The same supplier';
        if (w.metric === 'accuracy') {
          if (same) return who + ' billed at the ordered price on ' + w.shown + '% of invoice lines.';
          return pick([
            w.s.name + ' billed at the ordered price on ' + w.shown + '% of invoice lines.',
            'Only ' + w.shown + '% of ' + w.s.name + '’s invoice lines were at the ordered price.'
          ]);
        }
        if (same) return who + ' invoiced ' + w.shown + '% of the quantity ordered.';
        return pick([
          w.s.name + ' invoiced ' + w.shown + '% of the quantity ordered.',
          w.s.name + '’s fill rate was ' + w.shown + '%.'
        ]);
      }
    }];
  }

  /* ════════════════════════════════════════════════════════════════════
     OUTLETS — group view only
     ════════════════════════════════════════════════════════════════════ */

  function outletFindings(d) {
    var outlets = (d.outlets || []).filter(function (o) { return o.previousSpend > 0; });
    if (outlets.length < 2) return [];
    var groupChg = change(d.spend.current, d.spend.previous);
    var flat = Math.abs(groupChg) < CONFIG.flatSpendPct;
    var rows = outlets.map(function (o) { return { o: o, chg: change(o.spend, o.previousSpend), diff: o.spend - o.previousSpend }; });

    if (!flat) {
      var against = rows.filter(function (x) { return x.chg * groupChg < 0 && Math.abs(x.chg) >= CONFIG.outletDivergencePct; })
        .sort(function (a, b) { return Math.abs(b.chg) - Math.abs(a.chg); })[0];
      if (!against) return [];
      var o = against.o;
      return [{
        key: 'outlet', subject: 'outlet:' + o.id,
        score: 0.2 + clamp(Math.abs(against.chg) / 20) * 0.5,
        render: function (pick) {
          var mine = dirWord(against.chg) + ' (' + signedMoney(against.diff) + ')';
          return pick([
            o.name + ' went the other way, with spend ' + mine + '.',
            'While group spend is ' + dirWord(groupChg) + ', ' + o.name + ' is ' + mine + '.'
          ]);
        }
      }];
    }
    var sorted = rows.filter(function (x) { return Math.abs(x.chg) >= CONFIG.outletMoverPct; })
      .sort(function (a, b) { return Math.abs(b.chg) - Math.abs(a.chg); });
    var mover = sorted[0];
    if (!mover || (sorted[1] && Math.abs(mover.chg) - Math.abs(sorted[1].chg) < CONFIG.superlativeMarginPts)) return [];
    return [{
      key: 'outlet', subject: 'outlet:' + mover.o.id,
      score: 0.2 + clamp(Math.abs(mover.chg) / 25) * 0.5,
      render: function (pick) {
        var mine = dirWord(mover.chg) + ' (' + signedMoney(mover.diff) + ')';
        return pick([
          mover.o.name + ' saw the biggest change in spend of any outlet, ' + mine + '.',
          'Of the outlets, ' + mover.o.name + '’s spend moved most, ' + mine + '.'
        ]);
      }
    }];
  }

  /* ════════════════════════════════════════════════════════════════════
     SELECTION AND COMPOSITION
     ════════════════════════════════════════════════════════════════════ */

  function choose(findings, recent) {
    var ranked = findings.filter(function (f) { return f.score >= CONFIG.minScore || f.pinned; })
      .sort(function (a, b) { return b.score - a.score; });
    if (!ranked.length) return [];
    var lead = ranked[0];
    var pinned = ranked.filter(function (f) { return f.pinned && f !== lead; });
    var rest = ranked.slice(1).filter(function (f) {
      return !f.pinned && f.key !== lead.key && f.subject !== lead.subject;
    });
    rest.sort(function (a, b) {
      var ra = recent.indexOf(fid(a)) >= 0 ? 1 : 0, rb = recent.indexOf(fid(b)) >= 0 ? 1 : 0;
      return ra - rb || b.score - a.score;
    });
    var picked = [lead].concat(pinned);
    for (var i = 0; i < rest.length && picked.length <= CONFIG.maxSupporting; i++) {
      var f = rest[i];
      if (picked.some(function (p) { return p.key === f.key || p.subject === f.subject; })) continue;
      picked.push(f);
    }
    // Spend first when it moved, so "the same supplier" and "the other way" have context.
    var byKey = function (k) { return picked.filter(function (p) { return p.key === k; })[0]; };
    var spend = byKey('spend');
    if (spend && !spend.steady && picked.indexOf(spend) > 0) {
      picked.splice(picked.indexOf(spend), 1);
      picked.unshift(spend);
    }
    // A finding about the supplier just named reads best straight after it.
    function moveAfter(item, anchor) {
      if (!item || !anchor || picked.indexOf(item) < 0 || picked.indexOf(anchor) < 0) return;
      picked.splice(picked.indexOf(item), 1);
      picked.splice(picked.indexOf(anchor) + 1, 0, item);
    }
    var disc = byKey('discrepancy'), rel = byKey('reliability');
    if (spend && disc && disc.supplierId && spend.supplierId === disc.supplierId) moveAfter(disc, spend);
    if (disc && rel && disc.supplierId && disc.supplierId === rel.supplierId) moveAfter(rel, disc);
    else if (spend && rel && spend.supplierId && spend.supplierId === rel.supplierId) moveAfter(rel, spend);
    return picked;
  }

  function compose(chosen, pick) {
    if (!chosen.length) {
      return pick([
        'Nothing in this period’s spend stands out enough to call out.',
        'No notable change in spend this period.'
      ]);
    }
    var sentences = chosen.map(function (f, i) {
      var prev = chosen[i - 1];
      return f.render(pick, { alone: chosen.length === 1, followsSupplier: prev ? prev.supplierId || null : null, prevKey: prev ? prev.key : null });
    });
    // Word budget: drop supporting sentences from the end, never the lead or the pinned spend line.
    while (sentences.length > 1 && !chosen[sentences.length - 1].pinned && wordCount(sentences.join(' ')) > CONFIG.maxWords) {
      sentences.pop(); chosen.pop();
    }
    return sentences.join(' ');
  }

  /* ════════════════════════════════════════════════════════════════════
     VALIDATION
     ════════════════════════════════════════════════════════════════════ */

  function validate(d) {
    if (!d || typeof d !== 'object') throw new TypeError('summariseSpendTab: data must be an object');
    if (!d.spend || !isNum(d.spend.current) || !isNum(d.spend.previous)) {
      throw new TypeError('summariseSpendTab: spend.current and spend.previous must be numbers');
    }
    if (typeof d.comparisonLabel !== 'string' || !d.comparisonLabel) {
      throw new TypeError('summariseSpendTab: comparisonLabel is required, e.g. "the same days last month"');
    }
    if (!Array.isArray(d.suppliers)) throw new TypeError('summariseSpendTab: suppliers must be an array');
    d.suppliers.forEach(function (s, i) {
      if (!isNum(s.spend) || !isNum(s.previousSpend)) throw new TypeError('suppliers[' + i + '] needs spend and previousSpend');
    });
    ['priceMoves', 'reliability', 'outlets'].forEach(function (k) {
      if (d[k] && !Array.isArray(d[k])) throw new TypeError('summariseSpendTab: ' + k + ' must be an array');
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     SEEDING AND HELPERS — as sales-briefing.js
     ════════════════════════════════════════════════════════════════════ */

  function hashData(d) {
    var src = JSON.stringify({
      c: d.comparisonLabel, s: d.spend, su: d.suppliers, p: d.priceMoves,
      di: d.discrepancies, r: d.reliability, o: d.outlets
    });
    var h = 2166136261;
    for (var i = 0; i < src.length; i++) { h ^= src.charCodeAt(i); h = Math.imul(h, 16777619); }
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

  function fid(f) { return f.key + ':' + f.subject; }
  function isNum(v) { return typeof v === 'number' && isFinite(v); }
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function round2(v) { return Math.round(v * 100) / 100; }
  function change(now, then) { return then ? ((now - then) / then) * 100 : NaN; }
  function abs(p) { return Math.abs(Math.round(p)) + '%'; }
  function pct1(p) { var r = Math.round(Math.abs(p) * 10) / 10; return r + '%'; }
  function dirWord(p) { var r = Math.round(p); return r === 0 ? 'flat' : (r > 0 ? 'up ' : 'down ') + Math.abs(r) + '%'; }
  function money(v) { return 'S$' + Math.round(v).toLocaleString('en-SG'); }
  function signedMoney(v) { var r = Math.round(v); return (r > 0 ? '+' : r < 0 ? '−' : '') + money(Math.abs(r)); }
  function wordCount(s) { return s.trim().split(/\s+/).filter(Boolean).length; }
  function numWord(n) { return ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][n] || String(n); }
  function numWordCap(n) { var w = numWord(n); return w.charAt(0).toUpperCase() + w.slice(1); }
  function whereText(outlets) {
    if (!outlets || !outlets.length) return '';
    return outlets.length === 1 ? ' at ' + outlets[0] : ' at ' + outlets.length + ' outlets';
  }

  var api = { summariseSpendTab: summariseSpendTab, CONFIG: CONFIG };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (root) root.SpendBriefing = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
