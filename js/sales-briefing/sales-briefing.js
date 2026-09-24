/**
 * sales-briefing.js
 * ------------------------------------------------------------------------
 * A short (≤100 word) briefing for the Sales tab, built only from the data
 * the tab already shows. Local and deterministic — no network, no model.
 *
 *   summariseSalesTab(data, memory?) → { text, words, findings, memory }
 *
 * HOW IT AVOIDS SOUNDING THE SAME EVERY DAY
 *
 *   1. It ranks findings from ALL panels together and leads with the
 *      strongest. Different days lead with different panels because the
 *      data differs — an outlet diverging one day, a channel shift another.
 *   2. The lead is always the strongest finding, but supporting findings
 *      ROTATE: when several qualify, it prefers ones it hasn't shown you
 *      recently. Everything said is still true and above threshold.
 *   3. Each finding has several phrasings.
 *
 *   Identical data always returns the identical text (cached against a hash
 *   of the data), so re-rendering or switching tabs never makes it flicker.
 *   Rotation only happens when the data changes.
 *
 * HOW IT AVOIDS MAKING THINGS UP
 *
 *   It never says WHY in the causal sense. The only links it draws between
 *   facts are arithmetic:
 *     - revenue split into dine-in covers × spend per head and off-premise
 *       orders × average order value (an exact identity)
 *     - a group change split by outlet (a decomposition)
 *   Nothing else is joined. No "because", no "which usually means".
 *
 * ------------------------------------------------------------------------
 * INPUT — the Sales tab's own data, already normalised. It does not parse
 * POS invoices itself. The upstream normaliser must already have:
 *   - converted invoice times to each outlet's local timezone
 *   - excluded refunds and deleted invoices
 *   - compared like-for-like days, normalised by weekday count
 *   - excluded outlets whose POS connected partway through either period
 *   - matched items by product ID, not name
 *   - counted covers from dine-in only (off-premise records 1 per order)
 *
 * data = {
 *   comparisonLabel: 'the same days last month',   // how to name the comparison
 *   periodLabel:     'this month',                 // for "busiest Tuesday this month"
 *   revenue:  { current, previous },
 *   channels: [{
 *     name,                      // 'Dine-in', 'Takeaway', 'Online ordering', 'Delivery'
 *     onPremise: boolean,        // true only for dine-in
 *     revenue, previousRevenue,
 *     covers, previousCovers,    // on-premise only
 *     orders, previousOrders     // off-premise only
 *   }],
 *   outlets: [{
 *     id, name,
 *     revenue, previousRevenue,
 *     dineInRevenue, previousDineInRevenue,
 *     covers, previousCovers,    // dine-in covers
 *     belowFloor?: boolean       // too little volume to rank
 *   }],
 *   items: [{
 *     id, name,
 *     revenue, previousRevenue,
 *     timesSold, previousTimesSold,
 *     rank, previousRank         // 1-based revenue rank; previousRank null if new
 *   }],
 *   coverage: {
 *     withPos, total,
 *     missing:  [names without POS],
 *     excluded?: [names excluded for connecting POS mid-period]
 *   },
 *   daily?: {                    // for the "yesterday" finding
 *     dates: ['YYYY-MM-DD', …],  // outlet-local dates in the period
 *     dineInCovers: [number, …],
 *     lastClosedIndex,           // last fully synced trading day
 *     today: 'YYYY-MM-DD'
 *   },
 *   heatmap?: <input for HeatmapSummary.summariseHeatmap>   // optional
 * }
 *
 * memory — optional, persisted by the caller per user (localStorage or
 * server). Pass back whatever the previous call returned. Without it the
 * output is still correct, it just can't rotate.
 *
 * RETURNS
 *   text      the briefing
 *   words     its word count
 *   findings  [{ key, subject, score }] in the order said
 *   memory    store this and pass it next time
 * ------------------------------------------------------------------------
 */

(function (root) {
  'use strict';

  var CONFIG = {
    maxWords: 100,
    minScore: 0.2,
    maxSupporting: 2,
    flatRevenuePct: 1.5,       // revenue change below this is "steady"
    channelShiftPts: 1.5,      // share change needed to mention a channel
    outletDivergencePct: 3,    // an outlet must move this much against the group
    outletMoverPct: 8,         // …or this much when the group is flat
    concentrationShare: 0.5,   // 1–2 outlets must hold this share of the change
    itemChangePct: 25,
    itemMinTimesSold: 30,      // ignore items too small to be meaningful
    sphChangePct: 5,
    superlativeMarginPts: 2,   // "biggest"/"steepest" needs this lead over the runner-up
    yesterdayDeviationPct: 15,
    recentMemory: 6            // how many supporting findings to remember
  };

  var DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  /* ════════════════════════════════════════════════════════════════════
     PUBLIC
     ════════════════════════════════════════════════════════════════════ */

  function summariseSalesTab(data, memory) {
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
      .concat(revenueFindings(data))
      .concat(outletFindings(data))
      .concat(channelFindings(data))
      .concat(itemFindings(data))
      .concat(sphFindings(data))
      .concat(yesterdayFindings(data))
      .concat(heatmapFindings(data));

    var chosen = choose(findings, memory.recentKeys || []);
    var text = compose(chosen, data, pick);

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
     REVENUE — exact decomposition
     ════════════════════════════════════════════════════════════════════
     revenue = Σ dine-in (covers × spend per head) + Σ off-premise
               (orders × average order value)

     For a product R = A × B, the change splits exactly as
       ΔR = ΔA · (B₀+B₁)/2  +  ΔB · (A₀+A₁)/2
     so the four parts always sum to the true change. */

  function revenueFindings(d) {
    var chg = change(d.revenue.current, d.revenue.previous);
    if (!isFinite(chg)) return [];
    var cmp = d.comparisonLabel;

    if (Math.abs(chg) < CONFIG.flatRevenuePct) {
      var within = Math.max(1, Math.ceil(Math.abs(chg)));
      return [{
        key: 'revenue', subject: 'revenue', score: 0.25, steady: true,
        render: function (pick, ctx) {
          if (ctx.alone) return pick([
            'A steady period. Revenue is within ' + within + '% of ' + cmp + ', and no outlet, channel or item moved enough to call out.',
            'Little to report: revenue is within ' + within + '% of ' + cmp + ', with no outlet, channel or item standing out.'
          ]);
          return pick([
            'Revenue is within ' + within + '% of ' + cmp + '.',
            'Overall revenue has barely moved on ' + cmp + '.',
            'Revenue is level with ' + cmp + ', within ' + within + '%.'
          ]);
        }
      }];
    }

    var dine = d.channels.filter(function (c) { return c.onPremise; });
    var off = d.channels.filter(function (c) { return !c.onPremise; });
    var parts = decompose(dine, off);
    var up = chg > 0;
    var total = parts.reduce(function (s, p) { return s + p.eff; }, 0);

    var same = parts.filter(function (p) { return p.eff * total > 0; })
      .sort(function (a, b) { return Math.abs(b.eff) - Math.abs(a.eff); });
    var opposite = parts.filter(function (p) { return p.eff * total < 0; })
      .sort(function (a, b) { return Math.abs(b.eff) - Math.abs(a.eff); });
    var top = same[0], second = same[1];
    var topShare = top ? Math.abs(top.eff / total) : 0;
    var offset = opposite[0] && Math.abs(opposite[0].eff / total) >= 0.3 ? opposite[0] : null;

    return [{
      key: 'revenue', subject: 'revenue', pinned: true,
      score: 0.3 + clamp(Math.abs(chg) / 15) * 0.7,
      render: function (pick) {
        // The page header already states the comparison period, so most
        // variants don't repeat it.
        var headline = pick(up ? [
          'Revenue is up ' + abs(chg) + ' on ' + cmp,
          'Revenue is up ' + abs(chg),
          'Revenue rose ' + abs(chg),
          'Revenue has grown ' + abs(chg)
        ] : [
          'Revenue is down ' + abs(chg) + ' on ' + cmp,
          'Revenue is down ' + abs(chg),
          'Revenue fell ' + abs(chg),
          'Revenue has slipped ' + abs(chg)
        ]);
        if (!top) return headline + '.';

        var s;
        if (topShare >= 0.6 || !second) {
          s = pick([
            headline + ', mostly from ' + top.label + ' (' + top.detail + ').',
            headline + '. Most of that came from ' + top.label + ' (' + top.detail + ').',
            headline + '. The biggest contributor was ' + top.label + ', ' + top.move + '.'
          ]);
        } else {
          s = pick([
            headline + ', split between ' + top.label + ' and ' + second.label + '.',
            headline + '. It came from both ' + top.label + ' and ' + second.label + '.'
          ]);
        }
        if (offset) s += ' ' + cap(offset.label) + ' pulled the other way (' + offset.detail + ').';
        return s;
      }
    }];
  }

  function decompose(dine, off) {
    var dC0 = sumOf(dine, 'previousCovers'), dC1 = sumOf(dine, 'covers');
    var dR0 = sumOf(dine, 'previousRevenue'), dR1 = sumOf(dine, 'revenue');
    var oN0 = sumOf(off, 'previousOrders'), oN1 = sumOf(off, 'orders');
    var oR0 = sumOf(off, 'previousRevenue'), oR1 = sumOf(off, 'revenue');

    var parts = [];
    if (dC0 > 0 && dC1 > 0) {
      var s0 = dR0 / dC0, s1 = dR1 / dC1;
      var cChg = change(dC1, dC0), sChg = change(s1, s0);
      // The label already names the lead metric, so the detail gives its
      // number bare and names only the secondary one — and drops that if it
      // didn't move.
      var dineDetail = function (lead) {
        if (lead === 'sph') return signed(sChg) + (Math.round(cChg) !== 0 ? ', with covers ' + signed(cChg) : '');
        return 'covers ' + signed(cChg) + (Math.round(sChg) !== 0 ? ', with spend per head ' + signed(sChg) : '');
      };
      var cEff = (dC1 - dC0) * (s0 + s1) / 2;
      var sEff = (s1 - s0) * (dC0 + dC1) / 2;
      parts.push({ id: 'covers', eff: cEff,
        label: cEff > 0 ? 'more dine-in guests' : 'fewer dine-in guests',
        detail: dineDetail('covers'), move: dirWord(cChg) });
      parts.push({ id: 'sph', eff: sEff,
        label: sEff > 0 ? 'higher dine-in spend per head' : 'lower dine-in spend per head',
        detail: dineDetail('sph'), move: dirWord(sChg) });
    }
    if (oN0 > 0 && oN1 > 0) {
      var a0 = oR0 / oN0, a1 = oR1 / oN1;
      var nChg = change(oN1, oN0), aChg = change(a1, a0);
      var offDetail = function (lead) {
        if (lead === 'orders') return signed(nChg) + (Math.round(aChg) !== 0 ? ', with average order ' + signed(aChg) : '');
        return signed(aChg) + (Math.round(nChg) !== 0 ? ', with orders ' + signed(nChg) : '');
      };
      var nEff = (oN1 - oN0) * (a0 + a1) / 2;
      var aEff = (a1 - a0) * (oN0 + oN1) / 2;
      parts.push({ id: 'orders', eff: nEff,
        label: nEff > 0 ? 'more takeaway and delivery orders' : 'fewer takeaway and delivery orders',
        detail: offDetail('orders'), move: dirWord(nChg) });
      parts.push({ id: 'aov', eff: aEff,
        label: aEff > 0 ? 'larger takeaway and delivery orders' : 'smaller takeaway and delivery orders',
        detail: offDetail('aov'), move: dirWord(aChg) });
    }
    return parts;
  }

  /* ════════════════════════════════════════════════════════════════════
     OUTLETS
     ════════════════════════════════════════════════════════════════════ */

  function outletFindings(d) {
    var outlets = (d.outlets || []).filter(function (o) { return !o.belowFloor && o.previousRevenue > 0; });
    if (outlets.length < 2) return [];
    var out = [];
    var R0 = d.revenue.previous, R1 = d.revenue.current;
    var groupChg = change(R1, R0);
    var net = R1 - R0;
    var flat = Math.abs(groupChg) < CONFIG.flatRevenuePct;

    // Concentration: 1 or 2 outlets holding most of the group change.
    if (!flat && outlets.length >= 3) {
      var same = outlets.map(function (o) { return { o: o, diff: o.revenue - o.previousRevenue }; })
        .filter(function (x) { return x.diff * net > 0; })
        .sort(function (a, b) { return Math.abs(b.diff) - Math.abs(a.diff); });
      var s1 = same[0] ? same[0].diff / net : 0;
      var s2 = same[1] ? (same[0].diff + same[1].diff) / net : 0;
      var dir = net > 0 ? 'increase' : 'drop';
      if (s1 >= CONFIG.concentrationShare) {
        var A = same[0].o.name;
        out.push({ key: 'concentration', subject: 'outlet:' + same[0].o.id,
          score: clamp((s1 - 0.35) * 1.4) * (outlets.length >= 4 ? 1 : 0.7),
          render: function (pick) { return pick([
            A + ' accounts for ' + shareWord(s1) + ' of the revenue ' + dir + '.',
            A + ' alone makes up ' + shareWord(s1) + ' of the ' + dir + '.'
          ]); } });
      } else if (s2 >= CONFIG.concentrationShare && same[1]) {
        var B1 = same[0].o.name, B2 = same[1].o.name;
        out.push({ key: 'concentration', subject: 'outlets:' + same[0].o.id + ',' + same[1].o.id,
          score: clamp((s2 - 0.35) * 1.3) * (outlets.length >= 4 ? 1 : 0.7),
          render: function (pick) { return pick([
            B1 + ' and ' + B2 + ' account for ' + shareWord(s2) + ' of the revenue ' + dir + '.',
            'The revenue ' + dir + ' is concentrated: ' + B1 + ' and ' + B2 + ' make up ' + shareWord(s2) + ' of it.'
          ]); } });
      }
    }

    // Divergence: an outlet moving against the group.
    if (!flat) {
      var against = outlets.map(function (o) { return { o: o, chg: change(o.revenue, o.previousRevenue) }; })
        .filter(function (x) { return x.chg * groupChg < 0 && Math.abs(x.chg) >= CONFIG.outletDivergencePct; })
        .sort(function (a, b) { return Math.abs(b.chg) - Math.abs(a.chg); })[0];
      if (against) {
        var o = against.o;
        var restChg = change(R1 - o.revenue, R0 - o.previousRevenue);
        var others = outlets.length - 1;
        var weight = o.previousRevenue / R0;
        out.push({ key: 'divergence', subject: 'outlet:' + o.id, outletId: o.id,
          score: 0.25 + clamp(Math.abs(against.chg) / 12) * 0.6 + clamp(weight * 2) * 0.2,
          render: function (pick) {
            var mine = dirWord(against.chg), theirs = dirWord(restChg);
            return pick([
              o.name + ' is moving against the group, ' + mine + ' while the other ' + numWord(others) + ' outlets are ' + theirs + ' between them.',
              o.name + ' went the other way — ' + mine + ' — as the rest of the group was ' + theirs + '.',
              'While the rest of the group is ' + theirs + ', ' + o.name + ' is ' + mine + '.'
            ]);
          } });
      }
    } else {
      // Group flat: the single biggest mover is the story instead.
      var mover = outlets.map(function (o) { return { o: o, chg: change(o.revenue, o.previousRevenue) }; })
        .filter(function (x) { return Math.abs(x.chg) >= CONFIG.outletMoverPct; })
        .sort(function (a, b) { return Math.abs(b.chg) - Math.abs(a.chg); })[0];
      if (mover) {
        out.push({ key: 'divergence', subject: 'outlet:' + mover.o.id, outletId: mover.o.id,
          score: 0.2 + clamp(Math.abs(mover.chg) / 20) * 0.6,
          render: function (pick) { return pick([
            mover.o.name + ' saw the biggest move of any outlet, ' + dirWord(mover.chg) + '.',
            'Of the outlets, ' + mover.o.name + ' moved most, ' + dirWord(mover.chg) + '.'
          ]); } });
      }
    }
    return out;
  }

  /* ════════════════════════════════════════════════════════════════════
     CHANNELS
     ════════════════════════════════════════════════════════════════════ */

  function channelFindings(d) {
    var R1 = sumOf(d.channels, 'revenue'), R0 = sumOf(d.channels, 'previousRevenue');
    if (!(R0 > 0 && R1 > 0)) return [];
    // Dine-in's share is just 100% minus the others, so reporting it tells the
    // off-premise story from the wrong end. Only off-premise channels qualify.
    var best = d.channels.filter(function (c) { return !c.onPremise; }).map(function (c) {
      var s1 = c.revenue / R1 * 100, s0 = c.previousRevenue / R0 * 100;
      return { c: c, share: s1, pts: s1 - s0 };
    }).sort(function (a, b) { return Math.abs(b.pts) - Math.abs(a.pts); })[0];
    if (!best || Math.abs(best.pts) < CONFIG.channelShiftPts) return [];
    var n = best.c.name, sh = Math.round(best.share) + '%', pts = ptsWord(best.pts);
    var rose = best.pts > 0;
    return [{ key: 'channel', subject: 'channel:' + n,
      score: clamp(Math.abs(best.pts) / 4) * 0.8,
      render: function (pick) { return pick([
        n + '’s share ' + (rose ? 'rose ' : 'fell ') + pts + ' to ' + sh + ' of revenue.',
        n + ' now makes up ' + sh + ' of revenue, ' + (rose ? 'up ' : 'down ') + pts + '.',
        'The channel mix moved ' + (rose ? 'towards ' : 'away from ') + n + ', now ' + sh + ' of revenue.'
      ]); } }];
  }

  /* ════════════════════════════════════════════════════════════════════
     ITEMS
     ════════════════════════════════════════════════════════════════════ */

  function itemFindings(d) {
    var items = d.items || [];
    if (!items.length) return [];
    var out = [];
    var cmp = d.comparisonLabel;

    var entry = items.filter(function (i) { return i.rank <= 5 && (i.previousRank == null || i.previousRank > 5); })
      .sort(function (a, b) { return a.rank - b.rank; })[0];
    if (entry) out.push({ key: 'item', subject: 'item:' + entry.id, score: 0.42,
      render: function (pick) { return pick([
        entry.name + ' has entered the top five, with ' + fmtNum(entry.timesSold) + ' sold.',
        'New to the top five: ' + entry.name + ', with ' + fmtNum(entry.timesSold) + ' sold.'
      ]); } });

    var exit = items.filter(function (i) { return i.previousRank != null && i.previousRank <= 5 && i.rank > 5; })
      .sort(function (a, b) { return a.previousRank - b.previousRank; })[0];
    if (exit && exit.previousTimesSold > 0) {
      var tsChg = change(exit.timesSold, exit.previousTimesSold);
      out.push({ key: 'item', subject: 'item:' + exit.id, score: 0.45,
        render: function (pick) {
          if (tsChg < 0) return pick([
            exit.name + ' has dropped out of the top five, with times sold down ' + abs(tsChg) + '.',
            exit.name + ' fell out of the top five; times sold are down ' + abs(tsChg) + '.'
          ]);
          return exit.name + ' has dropped out of the top five as other items overtook it.';
        } });
    }

    var movers = items.filter(function (i) {
      return Math.max(i.timesSold, i.previousTimesSold || 0) >= CONFIG.itemMinTimesSold && i.previousRevenue > 0;
    }).map(function (i) { return { i: i, chg: change(i.revenue, i.previousRevenue) }; })
      .sort(function (a, b) { return Math.abs(b.chg) - Math.abs(a.chg); });
    var big = movers[0] && Math.abs(movers[0].chg) >= CONFIG.itemChangePct &&
      (!movers[1] || Math.abs(movers[0].chg) - Math.abs(movers[1].chg) >= CONFIG.superlativeMarginPts)
      ? movers[0] : null;
    if (big) out.push({ key: 'item', subject: 'item:' + big.i.id,
      score: 0.15 + clamp(Math.abs(big.chg) / 80) * 0.5,
      render: function (pick) { return pick([
        big.i.name + ' revenue is ' + dirWord(big.chg) + ' on ' + cmp + '.',
        'Among items, ' + big.i.name + ' moved most, ' + dirWord(big.chg) + '.'
      ]); } });

    return out;
  }

  /* ════════════════════════════════════════════════════════════════════
     DINE-IN SPEND PER HEAD BY OUTLET
     ════════════════════════════════════════════════════════════════════ */

  function sphFindings(d) {
    var rows = (d.outlets || []).filter(function (o) {
      return !o.belowFloor && o.covers > 0 && o.previousCovers > 0 && o.previousDineInRevenue > 0;
    }).map(function (o) {
      return { o: o, chg: change(o.dineInRevenue / o.covers, o.previousDineInRevenue / o.previousCovers) };
    });
    if (rows.length < 2) return [];
    var sorted = rows.slice().sort(function (a, b) { return Math.abs(b.chg) - Math.abs(a.chg); });
    var m = sorted[0];
    // "The steepest drop of any outlet" is only true if it clearly is. A near-tie
    // would name whichever outlet float noise put first.
    if (!m || Math.abs(m.chg) < CONFIG.sphChangePct) return [];
    if (sorted[1] && Math.abs(m.chg) - Math.abs(sorted[1].chg) < CONFIG.superlativeMarginPts) return [];
    var fell = m.chg < 0;
    var tail = fell ? 'the steepest drop of any outlet' : 'the biggest rise of any outlet';
    return [{ key: 'sph', subject: 'sph', outletId: m.o.id,
      score: clamp(Math.abs(m.chg) / 15) * 0.7,
      render: function (pick, ctx) {
        var verb = (fell ? 'fell ' : 'rose ') + abs(m.chg);
        if (ctx.followsOutlet === m.o.id) return 'Its dine-in spend per head ' + verb + ', ' + tail + '.';
        return pick([
          m.o.name + '’s dine-in spend per head ' + verb + ', ' + tail + '.',
          'Dine-in spend per head ' + verb + ' at ' + m.o.name + ', ' + tail + '.'
        ]);
      } }];
  }

  /* ════════════════════════════════════════════════════════════════════
     YESTERDAY — the part that genuinely changes day to day
     ════════════════════════════════════════════════════════════════════ */

  function yesterdayFindings(d) {
    var y = d.daily;
    if (!y || !y.dates || y.lastClosedIndex == null) return [];
    var i = y.lastClosedIndex;
    var val = y.dineInCovers[i];
    var wd = weekdayOf(y.dates[i]);
    var peers = [];
    y.dates.forEach(function (dt, j) { if (j !== i && j <= i && weekdayOf(dt) === wd) peers.push(y.dineInCovers[j]); });
    if (peers.length < 1) return [];
    var mean = peers.reduce(function (s, v) { return s + v; }, 0) / peers.length;
    var dev = change(val, mean);
    var isMax = peers.every(function (p) { return val > p; });
    var isMin = peers.every(function (p) { return val < p; });
    if (Math.abs(dev) < CONFIG.yesterdayDeviationPct || !(isMax || isMin)) return [];
    var when = isYesterday(y.dates[i], y.today) ? 'Yesterday' : DAY_NAMES[wd];
    var sup = isMax ? 'busiest' : 'quietest';
    var period = d.periodLabel || 'this period';
    return [{ key: 'yesterday', subject: 'yesterday',
      score: 0.15 + clamp(Math.abs(dev) / 40) * 0.55,
      render: function (pick) { return pick([
        when + ' was the ' + sup + ' ' + DAY_NAMES[wd] + ' ' + period + ', at ' + fmtNum(val) + ' dine-in covers.',
        'At ' + fmtNum(val) + ' dine-in covers, ' + (when === 'Yesterday' ? 'yesterday' : when) + ' was the ' + sup + ' ' + DAY_NAMES[wd] + ' ' + period + '.'
      ]); } }];
  }

  /* ════════════════════════════════════════════════════════════════════
     HEATMAP — delegated to heatmap-summary.js when available
     ════════════════════════════════════════════════════════════════════ */

  function heatmapFindings(d) {
    if (!d.heatmap) return [];
    // In a browser, heatmap-summary.js is loaded as its own <script> and sits on
    // window. Under Node (tests), it lives in the sibling js/heatmap-summary/
    // folder; the second path is a fallback for a flat layout.
    var HS = (root && root.HeatmapSummary) ||
      safeRequire('../heatmap-summary/heatmap-summary.js') ||
      safeRequire('./heatmap-summary.js');
    if (!HS) return [];
    var r;
    try { r = HS.summariseHeatmap(d.heatmap); } catch (e) { return []; }
    if (!r.findings.length) return [];
    var first = r.text.split(/(?<=\.)\s+/)[0];
    return [{ key: 'heatmap', subject: 'heatmap', score: r.findings[0].score * 0.6,
      render: function () { return first; } }];
  }

  /* ════════════════════════════════════════════════════════════════════
     SELECTION AND COMPOSITION
     ════════════════════════════════════════════════════════════════════ */

  function choose(findings, recent) {
    var ranked = findings.filter(function (f) { return f.score >= CONFIG.minScore || f.pinned; })
      .sort(function (a, b) { return b.score - a.score; });
    if (!ranked.length) return [];
    var lead = ranked[0];

    // The revenue breakdown is pinned when revenue moved: it's the one thing
    // the summary cards above can't show, so it never rotates out.
    var pinned = ranked.filter(function (f) { return f.pinned && f !== lead; });

    // Other supporting findings are ordered so ones NOT shown recently come
    // first; within each group the stronger still comes first. That is the
    // only source of rotation.
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

    // Ordering: a concentration finding reads best straight after the revenue
    // figure it breaks down; a spend-per-head finding about the diverging
    // outlet reads best straight after it, as "Its…".
    function moveAfter(item, anchor) {
      if (!item || !anchor || picked.indexOf(item) < 0 || picked.indexOf(anchor) < 0) return;
      picked.splice(picked.indexOf(item), 1);
      picked.splice(picked.indexOf(anchor) + 1, 0, item);
    }
    var byKey = function (k) { return picked.filter(function (p) { return p.key === k; })[0]; };
    var rev = byKey('revenue'), conc = byKey('concentration');
    if (rev && conc && !rev.steady) {
      if (picked.indexOf(conc) < picked.indexOf(rev)) {
        // Concentration outranked revenue; put revenue first so "the increase" has context.
        picked.splice(picked.indexOf(rev), 1);
        picked.splice(picked.indexOf(conc), 0, rev);
      }
      moveAfter(conc, rev);
    }
    var div = byKey('divergence'), sph = byKey('sph');
    if (div && sph && div.outletId === sph.outletId) moveAfter(sph, div);
    return picked;
  }

  function compose(chosen, d, pick) {
    var coverage = coverageClause(d.coverage);
    if (!chosen.length) {
      return [pick([
        'Nothing in this period’s sales stands out enough to call out.',
        'No notable change in sales this period.'
      ]), coverage].filter(Boolean).join(' ');
    }

    var sentences = chosen.map(function (f, i) {
      var prev = chosen[i - 1];
      var ctx = {
        alone: chosen.length === 1,
        followsOutlet: prev && prev.key === 'divergence' ? prev.outletId : null
      };
      return f.render(pick, ctx);
    });

    // Enforce the word budget: drop supporting sentences from the end,
    // never the lead, never the coverage clause.
    while (sentences.length > 1 && !chosen[sentences.length - 1].pinned && wordCount(sentences.concat(coverage || []).join(' ')) > CONFIG.maxWords) {
      sentences.pop(); chosen.pop();
    }
    return sentences.concat(coverage || []).join(' ');
  }

  function coverageClause(c) {
    if (!c || c.withPos >= c.total) return null;
    var s;
    var missing = c.missing || [];
    if (missing.length && missing.length <= 3) {
      s = 'Based on ' + c.withPos + ' of ' + c.total + ' outlets — ' + listJoin(missing) +
          (missing.length === 1 ? ' has' : ' have') + ' no POS.';
    } else {
      s = 'Based on ' + c.withPos + ' of ' + c.total + ' outlets with POS.';
    }
    var ex = c.excluded || [];
    if (ex.length) s += ' ' + (ex.length === 1 ? ex[0] + ' is' : ex.length + ' outlets are') +
      ' excluded for connecting POS partway through.';
    return s;
  }

  /* ════════════════════════════════════════════════════════════════════
     VALIDATION
     ════════════════════════════════════════════════════════════════════ */

  function validate(d) {
    if (!d || typeof d !== 'object') throw new TypeError('summariseSalesTab: data must be an object');
    if (!d.revenue || !isNum(d.revenue.current) || !isNum(d.revenue.previous)) {
      throw new TypeError('summariseSalesTab: revenue.current and revenue.previous must be numbers');
    }
    if (typeof d.comparisonLabel !== 'string' || !d.comparisonLabel) {
      throw new TypeError('summariseSalesTab: comparisonLabel is required, e.g. "the same days last month"');
    }
    if (!Array.isArray(d.channels)) throw new TypeError('summariseSalesTab: channels must be an array');
    d.channels.forEach(function (c, i) {
      if (typeof c.onPremise !== 'boolean') throw new TypeError('channels[' + i + '].onPremise must be true or false');
      if (c.onPremise && !(isNum(c.covers) && isNum(c.previousCovers))) {
        throw new TypeError('channels[' + i + '] is on-premise and needs covers and previousCovers');
      }
      if (!c.onPremise && !(isNum(c.orders) && isNum(c.previousOrders))) {
        throw new TypeError('channels[' + i + '] is off-premise and needs orders and previousOrders');
      }
    });
    if (d.outlets && !Array.isArray(d.outlets)) throw new TypeError('summariseSalesTab: outlets must be an array');
    if (d.items && !Array.isArray(d.items)) throw new TypeError('summariseSalesTab: items must be an array');
  }

  /* ════════════════════════════════════════════════════════════════════
     SEEDING AND HELPERS
     ════════════════════════════════════════════════════════════════════ */

  function hashData(d) {
    var src = JSON.stringify({
      c: d.comparisonLabel, r: d.revenue, ch: d.channels, o: d.outlets, i: d.items,
      cv: d.coverage, y: d.daily ? { l: d.daily.lastClosedIndex, v: d.daily.dineInCovers } : null,
      hm: d.heatmap ? d.heatmap.current && d.heatmap.current.grid : null
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

  function safeRequire(p) {
    try {
      if (typeof require !== 'function') return null;
      var path = typeof __dirname !== 'undefined' ? require('path').join(__dirname, p) : p;
      return require(path);
    } catch (e) { return null; }
  }
  function fid(f) { return f.key + ':' + f.subject; }
  function isNum(v) { return typeof v === 'number' && isFinite(v); }
  function sumOf(a, k) { return a.reduce(function (s, x) { return s + (Number(x[k]) || 0); }, 0); }
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function round2(v) { return Math.round(v * 100) / 100; }
  function change(now, then) { return then ? ((now - then) / then) * 100 : NaN; }
  function abs(p) { return Math.abs(Math.round(p)) + '%'; }
  function signed(p) { var r = Math.round(p); return (r > 0 ? '+' : r < 0 ? '−' : '') + Math.abs(r) + '%'; }
  function dirWord(p) { var r = Math.round(p); return r === 0 ? 'flat' : (r > 0 ? 'up ' : 'down ') + Math.abs(r) + '%'; }
  function ptsWord(p) { var r = Math.round(Math.abs(p) * 10) / 10; return r + ' pts'; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function fmtNum(v) { return Math.round(v).toLocaleString('en-SG'); }
  function wordCount(s) { return s.trim().split(/\s+/).filter(Boolean).length; }
  function listJoin(a) { return a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function numWord(n) { return ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][n] || String(n); }
  function shareWord(f) {
    if (f >= 0.95) return 'almost all';
    if (f >= 0.63 && f <= 0.70) return 'two thirds';
    if (f >= 0.5 && f < 0.56) return 'over half';
    return Math.round(f * 100) + '%';
  }
  function weekdayOf(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    return (new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).getUTCDay() + 6) % 7;
  }
  function isYesterday(iso, todayIso) {
    if (!todayIso) return false;
    var a = Date.parse(iso + 'T00:00:00Z'), b = Date.parse(todayIso + 'T00:00:00Z');
    return b - a === 86400000;
  }

  var api = { summariseSalesTab: summariseSalesTab, CONFIG: CONFIG };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (root) root.SalesBriefing = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
