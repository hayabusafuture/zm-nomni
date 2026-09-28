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
 *   outlets?: [{ id, name, spend, previousSpend }], // group view only
 *   outletCount?: number                            // outlets in the view, to say "all 10 outlets"
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
     FINDINGS
     Each finding can be said on its own (sentence) and, when it's about a
     supplier, as a verb phrase with that supplier as subject (vp), so several
     facts about one supplier can be told as one story.
     ════════════════════════════════════════════════════════════════════ */

  function spendFindings(d) {
    var chg = change(d.spend.current, d.spend.previous);
    if (!isFinite(chg)) return [];
    var cmp = d.comparisonLabel;
    var within = Math.max(1, Math.ceil(Math.abs(chg)));

    if (Math.abs(chg) < CONFIG.flatSpendPct) {
      return [{
        key: 'spend', subject: 'spend', score: 0.25, steady: true,
        context: function (pick) { return pick([
          'Overall spend is within ' + within + '% of ' + cmp + '.',
          'Overall, spend has barely moved on ' + cmp + '.'
        ]); },
        sentence: function (pick, ctx) {
          if (ctx.alone) return pick([
            'A steady period. Spend is within ' + within + '% of ' + cmp + ', and no price, supplier or outlet moved enough to call out.',
            'Little to report: spend is within ' + within + '% of ' + cmp + ', with nothing standing out.'
          ]);
          return pick(['Spend is within ' + within + '% of ' + cmp + '.', 'Overall spend has barely moved on ' + cmp + '.']);
        }
      }];
    }

    var net = d.spend.current - d.spend.previous;
    var diffs = d.suppliers.map(function (s) { return { s: s, diff: s.spend - s.previousSpend }; });
    var same = diffs.filter(function (x) { return x.diff * net > 0; }).sort(byAbs('diff'));
    var opposite = diffs.filter(function (x) { return x.diff * net < 0; }).sort(byAbs('diff'));
    var top = same[0], second = same[1];
    var mostly = top && (top.diff / net >= 0.6 || !second);
    var offset = opposite[0] && Math.abs(opposite[0].diff / net) >= CONFIG.offsetShare ? opposite[0] : null;
    var up = chg > 0, pctText = abs(chg);
    var noun = up ? 'increase' : 'drop';

    function headline(pick) {
      return pick(up
        ? ['Spend is up ' + pctText + ' on ' + cmp, 'Spend is up ' + pctText, 'Spend rose ' + pctText]
        : ['Spend is down ' + pctText + ' on ' + cmp, 'Spend is down ' + pctText, 'Spend fell ' + pctText]);
    }
    function offsetText() { return offset ? ' ' + offset.s.name + ' went the other way (' + signedMoney(offset.diff) + ').' : ''; }

    return [{
      key: 'spend', subject: 'spend', pinned: true,
      supplier: mostly ? top.s.name : null,
      score: 0.3 + clamp(Math.abs(chg) / 15) * 0.7,
      // Said on its own.
      sentence: function (pick) {
        var h = headline(pick);
        if (!top) return h + '.';
        if (mostly) return pick([
          h + ', mostly from ' + top.s.name + ' (' + signedMoney(top.diff) + ').',
          h + '. Most of that came from ' + top.s.name + ' (' + signedMoney(top.diff) + ').'
        ]) + offsetText();
        return pick([
          h + ', split between ' + top.s.name + ' (' + signedMoney(top.diff) + ') and ' + second.s.name + ' (' + signedMoney(second.diff) + ').',
          h + '. It came from both ' + top.s.name + ' (' + signedMoney(top.diff) + ') and ' + second.s.name + ' (' + signedMoney(second.diff) + ').'
        ]) + offsetText();
      },
      // Opening a story about the supplier that holds most of the change. Returns [sentence, needsPronoun].
      open: function (pick, rest) {
        var S = top.s.name, amt = signedMoney(top.diff), size = money(Math.abs(top.diff));
        if (!rest) return pick([
          h2(pick) + ', and most of that is ' + S + ' (' + amt + ').',
          S + ' accounts for ' + size + ' of the ' + pctText + ' ' + noun + ' in spend.'
        ]) + offsetText();
        return pick([
          h2(pick) + ', and most of that is ' + S + ' (' + amt + '), which also ' + rest + '.',
          'Most of the ' + pctText + ' ' + noun + ' in spend comes from ' + S + ' (' + amt + '). It also ' + rest + '.',
          S + ' accounts for ' + size + ' of the ' + pctText + ' ' + noun + ' in spend. It also ' + rest + '.'
        ]) + offsetText();
      },
      // A short line of context when the story leads with something else.
      context: function (pick) {
        if (!top) return pick(['Overall, ' + lc(headline(pick)) + '.', 'Across all suppliers, ' + lc(headline(pick)) + '.']);
        var from = mostly ? 'mostly from ' + top.s.name + ' (' + signedMoney(top.diff) + ')' : 'split between ' + top.s.name + ' and ' + second.s.name;
        return pick(['Overall, ' + lc(headline(pick)) + ', ' + from + '.', 'Across all suppliers, ' + lc(headline(pick)) + ', ' + from + '.']);
      }
    }];
    function h2(pick) { return headline(pick); }
  }

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
    var items = Object.keys(byItem).map(function (k) { return byItem[k]; }).sort(function (a, b) { return b.max - a.max; });
    if (!items.length) return [];
    var m = items[0];
    var clearlyLargest = !items[1] || m.max - items[1].max >= CONFIG.superlativeMarginPts;
    var n = items.length, over = CONFIG.priceRisePct + '%';
    // Where and how much. The same rise everywhere (a list price change) is stated exactly; different rises say
    // "by up to". All of a group's outlets is said as "all".
    var count = m.outlets.length;
    var place = count === 0 ? '' : count === 1 ? ' at ' + m.outlets[0]
      : (d.outletCount && count === d.outletCount ? ' at all ' + count + ' outlets' : ' at ' + count + ' outlets');
    var uniform = pct1(m.max) === pct1(m.min);
    var by = count > 1 && !uniform ? 'by up to ' + pct1(m.max) : pct1(m.max);
    var others = n === 1 ? '' : clearlyLargest ? ', the largest of ' + numWord(n) + ' items up more than ' + over : ', one of ' + numWord(n) + ' items up more than ' + over;
    return [{
      key: 'price', subject: 'price:' + m.id, supplier: m.supplier,
      score: 0.2 + clamp(m.max / 20) * 0.6,
      sentence: function (pick) {
        if (n === 1) return pick([
          m.item + ' from ' + m.supplier + ' rose ' + by + place + '.',
          m.supplier + ' raised the price of ' + m.item + ' by ' + (count > 1 && !uniform ? 'up to ' : '') + pct1(m.max) + place + '.'
        ]);
        if (!clearlyLargest) return m.item + ' from ' + m.supplier + ' rose ' + by + place + others + '.';
        return pick([
          m.item + ' from ' + m.supplier + ' rose ' + by + place + others + '.',
          numWordCap(n) + ' items rose more than ' + over + ' in price. The largest was ' + m.item + ' from ' + m.supplier + ', ' + (count > 1 && !uniform ? 'up to ' : 'up ') + pct1(m.max) + place + '.'
        ]);
      },
      vp: function () { return 'raised the price of ' + m.item + ' by ' + (count > 1 && !uniform ? 'up to ' : '') + pct1(m.max) + place; }
    }];
  }

  function discrepancyFindings(d) {
    var disc = d.discrepancies;
    if (!disc || !disc.over || disc.over.value < CONFIG.minDiscrepancy) return [];
    var over = disc.over.value, notReceived = disc.notReceived ? disc.notReceived.value : 0;
    var top = (disc.bySupplier || []).slice().sort(function (a, b) { return b.over - a.over; })[0];
    var named = top && top.over / over >= CONFIG.discrepancyNameShare ? top : null;
    var ratio = d.spend.current > 0 ? over / d.spend.current * 100 : 0;
    var tail = notReceived > 0 ? ', plus ' + money(notReceived) + ' invoiced but not received' : '';
    return [{
      key: 'discrepancy', subject: 'discrepancy', supplier: named ? named.name : null,
      score: 0.2 + clamp(ratio / 3) * 0.6,
      sentence: function (pick) {
        if (named) return pick([
          money(over) + ' was invoiced above the ordered price, ' + money(named.over) + ' of it by ' + named.name + tail + '.',
          named.name + ' accounts for ' + money(named.over) + ' of the ' + money(over) + ' invoiced above the ordered price' + tail + '.'
        ]);
        return pick([
          money(over) + ' was invoiced above the ordered price' + tail + '.',
          'Invoices came in ' + money(over) + ' above the ordered price' + tail + '.'
        ]);
      },
      // One form only: "accounts for" is already the spend story's verb, and a second would echo it.
      vp: function () { return 'billed ' + money(named.over) + ' of the ' + money(over) + ' invoiced above the ordered price'; },
      after: notReceived > 0 ? 'Separately, ' + money(notReceived) + ' was invoiced but not received.' : null
    }];
  }

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
    var w = worst, S = w.s.name, v = w.shown + '%';
    return [{
      key: 'reliability', subject: 'reliability:' + w.s.id, supplier: S,
      score: 0.2 + clamp((CONFIG.reliabilityFloor - w.shown) / 30) * 0.5,
      sentence: function (pick) {
        if (w.metric === 'accuracy') return pick([
          S + ' billed at the ordered price on ' + v + ' of invoice lines.',
          'Only ' + v + ' of ' + S + '’s invoice lines were at the ordered price.'
        ]);
        return pick([S + ' invoiced ' + v + ' of the quantity ordered.', S + '’s fill rate was ' + v + '.']);
      },
      vp: function () {
        return w.metric === 'accuracy' ? 'had ' + v + ' of its invoice lines at the ordered price' : 'invoiced ' + v + ' of the quantity ordered';
      }
    }];
  }

  function outletFindings(d) {
    var outlets = (d.outlets || []).filter(function (o) { return o.previousSpend > 0; });
    if (outlets.length < 2) return [];
    var groupChg = change(d.spend.current, d.spend.previous);
    var flat = Math.abs(groupChg) < CONFIG.flatSpendPct;
    var rows = outlets.map(function (o) { return { o: o, chg: change(o.spend, o.previousSpend), diff: o.spend - o.previousSpend }; });
    if (!flat) {
      var against = rows.filter(function (x) { return x.chg * groupChg < 0 && Math.abs(x.chg) >= CONFIG.outletDivergencePct; }).sort(byAbs('chg'))[0];
      if (!against) return [];
      var o = against.o, mine = dirWord(against.chg) + ' (' + signedMoney(against.diff) + ')';
      return [{
        key: 'outlet', subject: 'outlet:' + o.id,
        score: 0.2 + clamp(Math.abs(against.chg) / 20) * 0.5,
        sentence: function (pick) { return pick([
          'Across outlets, ' + o.name + ' is the exception, with spend ' + mine + '.',
          'Not every outlet followed: ' + o.name + '’s spend is ' + mine + '.'
        ]); }
      }];
    }
    var sorted = rows.filter(function (x) { return Math.abs(x.chg) >= CONFIG.outletMoverPct; }).sort(byAbs('chg'));
    var mover = sorted[0];
    if (!mover || (sorted[1] && Math.abs(mover.chg) - Math.abs(sorted[1].chg) < CONFIG.superlativeMarginPts)) return [];
    var mv = dirWord(mover.chg) + ' (' + signedMoney(mover.diff) + ')';
    return [{
      key: 'outlet', subject: 'outlet:' + mover.o.id,
      score: 0.2 + clamp(Math.abs(mover.chg) / 25) * 0.5,
      sentence: function (pick) { return pick([
        mover.o.name + ' saw the biggest change in spend of any outlet, ' + mv + '.',
        'Of the outlets, ' + mover.o.name + '’s spend moved most, ' + mv + '.'
      ]); }
    }];
  }

  /* ════════════════════════════════════════════════════════════════════
     SELECTION
     ════════════════════════════════════════════════════════════════════ */

  function choose(findings, recent) {
    var ranked = findings.filter(function (f) { return f.score >= CONFIG.minScore || f.pinned; })
      .sort(function (a, b) { return b.score - a.score; });
    if (!ranked.length) return [];
    var lead = ranked[0];
    var pinned = ranked.filter(function (f) { return f.pinned && f !== lead; });
    var rest = ranked.slice(1).filter(function (f) { return !f.pinned && f.key !== lead.key && f.subject !== lead.subject; });
    rest.sort(function (a, b) {
      var ra = recent.indexOf(fid(a)) >= 0 ? 1 : 0, rb = recent.indexOf(fid(b)) >= 0 ? 1 : 0;
      return ra - rb || b.score - a.score;
    });
    var picked = [lead].concat(pinned);
    for (var i = 0; i < rest.length && picked.length <= CONFIG.maxSupporting; i++) {
      if (picked.some(function (p) { return p.key === rest[i].key || p.subject === rest[i].subject; })) continue;
      picked.push(rest[i]);
    }
    // Facts about the same supplier are told together: when nothing chosen shares a supplier yet, one that just
    // missed the cut joins a chosen finding about its supplier, so the briefing can tell a story.
    if (!storySupplier(picked)) {
      var extra = rest.filter(function (f) {
        return f.vp && f.supplier && picked.indexOf(f) < 0 && picked.some(function (p) { return p.supplier === f.supplier; });
      })[0];
      if (extra) picked.push(extra);
    }
    return picked;
  }

  // The supplier with the most chosen findings, if it has two or more.
  function storySupplier(picked) {
    var counts = {};
    picked.forEach(function (f) { if (f.supplier) counts[f.supplier] = (counts[f.supplier] || 0) + 1; });
    var best = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })[0];
    return best && counts[best] >= 2 ? best : null;
  }

  /* ════════════════════════════════════════════════════════════════════
     COMPOSITION — organised by story, not by panel
     ════════════════════════════════════════════════════════════════════
     When two or more findings are about one supplier, they're told as one
     story in one or two sentences. Spend opens that story when the supplier
     holds most of the change; otherwise spend becomes a line of context,
     before or after the story depending on which is stronger. Anything else
     follows as its own sentence. */

  function compose(chosen, pick) {
    if (!chosen.length) return pick(['Nothing in this period’s spend stands out enough to call out.', 'No notable change in spend this period.']);
    if (chosen.length === 1) return chosen[0].sentence(pick, { alone: true });

    var S = storySupplier(chosen);
    var spend = chosen.filter(function (f) { return f.key === 'spend'; })[0];
    var out = [];

    if (S) {
      var story = chosen.filter(function (f) { return f.supplier === S; });
      var others = chosen.filter(function (f) { return story.indexOf(f) < 0; });
      // A story is short: spend plus one fact, or two facts. The strongest are kept; the rest are left for another day.
      var cap = spend && spend.supplier === S ? 1 : 2;
      var members = story.filter(function (f) { return f !== spend && f.vp; }).sort(function (a, b) { return b.score - a.score; }).slice(0, cap);
      story = story.filter(function (f) { return f === spend || members.indexOf(f) >= 0; });
      others = chosen.filter(function (f) { return story.indexOf(f) < 0 && !(f.supplier === S && f !== spend); });
      var vps = members.map(function (f) { return f.vp(pick); });
      var afters = members.map(function (f) { return f.after; }).filter(Boolean);
      var storyText;
      if (spend && spend.supplier === S) {
        storyText = spend.open(pick, vps.length ? listAnd(vps) : null);
      } else {
        storyText = pick([
          S + ' ' + listAnd(vps) + '.',
          'Two things stand out for ' + S + ': it ' + listAnd(vps, ', and it ') + '.'
        ]);
        if (vps.length > 2) storyText = S + ' ' + listAnd(vps) + '.';
      }
      var storyScore = Math.max.apply(null, story.map(function (f) { return f.score; }));
      if (spend && spend.supplier !== S) {
        // Spend as context: after the story when the story is stronger, before it otherwise.
        if (storyScore > spend.score) out.push(storyText, spend.context(pick));
        else out.push(spend.sentence(pick, {}), storyText);
      } else {
        out.push(storyText);
      }
      afters.forEach(function (a) { out.push(a); });
      others.filter(function (f) { return f !== spend; }).forEach(function (f, i) {
        out.push(connect(f.sentence(pick, {}), pick, i));
      });
    } else {
      // No shared story: spend first when it moved, the rest as their own sentences, with varied joins.
      var ordered = chosen.slice();
      if (spend && !spend.steady) { ordered.splice(ordered.indexOf(spend), 1); ordered.unshift(spend); }
      ordered.forEach(function (f, i) {
        var text = f === spend && spend.steady && i > 0 ? spend.context(pick) : f.sentence(pick, {});
        out.push(i >= 2 ? connect(text, pick, i) : text);
      });
    }

    // Word budget: drop sentences from the end, never the first.
    while (out.length > 1 && wordCount(out.join(' ')) > CONFIG.maxWords) out.pop();
    return out.join(' ');
  }

  // Joins a standalone sentence onto what came before. Only sentences that open with a name or a figure take a
  // connector, so capitalisation never has to be guessed.
  function connect(text, pick, i) {
    if (/^(Across outlets|Not every|Of the outlets|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Only|Invoices|Overall|Separately)/.test(text)) return text;
    return pick(['', 'Elsewhere, ', 'Separately, ']) + text;
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
      c: d.comparisonLabel, s: d.spend, su: d.suppliers, p: d.priceMoves, oc: d.outletCount,
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
  function byAbs(k) { return function (a, b) { return Math.abs(b[k]) - Math.abs(a[k]); }; }
  function lc(t) { return t.charAt(0).toLowerCase() + t.slice(1); }
  function listAnd(a, sep) { if (a.length <= 1) return a[0] || ''; if (sep) return a.join(sep); return a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
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
