/**
 * heatmap-summary.js
 * ------------------------------------------------------------------------
 * Local, deterministic summary text for the "Sales by day & hour" heatmap.
 * No network, no model — it reads the grid and describes what it finds.
 *
 * Three public functions:
 *
 *   buildHeatmapGrid(invoices, opts)  → { grid, dropped }
 *       Turns POS invoices into the 7 × H revenue grid, bucketed in each
 *       outlet's LOCAL time. Handles the timezone, refund and deleted-invoice
 *       traps so callers don't have to.
 *
 *   weekdayCounts(startDate, endDate) → number[7]
 *       How many Mondays, Tuesdays… a period contains. Required input,
 *       because a 31-day month has five of some weekdays and four of others.
 *
 *   summariseHeatmap(input)           → { text, findings, gaps }
 *       The summary itself.
 *
 * Minimal usage:
 *
 *   const { grid } = buildHeatmapGrid(invoices, {
 *     hours: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
 *     timeZone: 'Australia/Sydney'
 *   });
 *   const { text } = summariseHeatmap({
 *     mode: 'period',
 *     hours: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
 *     current: { grid, dayCounts: weekdayCounts('2026-09-01', '2026-09-21') }
 *   });
 *
 * ------------------------------------------------------------------------
 * INPUT CONTRACT for summariseHeatmap
 *
 *   mode      'period' | 'compare'
 *   hours     number[]        column start hours, 24h, LOCAL time, ascending
 *   current   PeriodData
 *   previous  PeriodData      required when mode is 'compare'
 *
 *   PeriodData = {
 *     grid:      number[7][hours.length]  net revenue per cell, rows Mon→Sun,
 *                                         SUMMED across the period
 *     dayCounts: number[7]                occurrences of each weekday in the
 *                                         period (see weekdayCounts)
 *     open?:     boolean[7][hours.length] trading-hours mask from
 *                                         StoreOperatingHour. Omit = all open.
 *   }
 *
 * Pass RAW revenue, never the percentile-capped values used to colour the
 * heatmap. The cap is a display decision and would distort the findings.
 *
 * ------------------------------------------------------------------------
 * RETURNS
 *
 *   text      string    one or two sentences, ready to render
 *   findings  Array     [{ key, score }] for what was said — useful for
 *                       logging, or for deciding not to also say it elsewhere
 *   gaps      Array     [{ day, dayIndex, fromHour, toHour }] runs of open
 *                       hours with ZERO sales across every occurrence of that
 *                       weekday. Almost always a reporting problem or an
 *                       unrecorded closure, not a quiet spell. Not narrated in
 *                       `text` — surface it separately. Empty unless `open`
 *                       is supplied.
 *
 * ------------------------------------------------------------------------
 * BEHAVIOUR
 *
 *   Deterministic. Phrasing is chosen with a seed derived from the grid, so
 *   identical data always yields identical text: toggling tabs or re-rendering
 *   never makes it flicker. New data → new seed → different phrasing.
 *
 *   Variety comes mostly from the data. Different periods surface different
 *   leading findings; each finding type also has several phrasings.
 *
 *   Comparisons are like-for-like. Every cell is divided by its weekday's
 *   occurrence count before any detector runs, so "Saturday leads the week"
 *   means a typical Saturday leads, not that the month had five of them.
 *
 * KNOWN LIMITS
 *
 *   - `gaps` only catches SYSTEMATIC gaps (zero on every occurrence of that
 *     weekday-hour). A one-off outage on a single date is diluted by the
 *     other weeks; detecting it needs per-date data this grid doesn't hold.
 *   - Scoring thresholds in CONFIG were tuned on synthetic data. Expect to
 *     adjust them once real grids come through.
 *   - Online / delivery orders are bucketed by createdAt, i.e. when they were
 *     PLACED, not fulfilled. Pre-orders will land in the wrong hour.
 * ------------------------------------------------------------------------
 */

(function (root) {
  'use strict';

  var DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var DAY_PLURAL = ['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'];
  var DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  /* Tunables. Exposed so they can be adjusted against real data without
     touching the detectors. */
  var CONFIG = {
    minScore: 0.18,             // findings below this are not worth saying
    secondFindingRatio: 0.55,   // a 2nd finding must score ≥ 55% of the 1st
    flatPct: 3,                 // |overall change| below this counts as flat
    offsettingMinSwingPct: 8,   // each side of an offsetting shift must move this much
    troughConsistency: 0.85,    // an hour must be quiet on ≥ 85% of eligible days
    troughMinEligibleDays: 5,   // …across at least this many days
    troughPeakRatio: 1.8,       // …with a peak at least this much busier on BOTH sides
    gapMinConsecutiveHours: 2,  // zero-sales runs shorter than this are ignored
    minTradingDays: 3           // below this, decline to summarise
  };

  var DAYPARTS = [
    { name: 'morning',   label: 'Morning',   lower: 'morning',   from: 0,  to: 11, span: 'before 11am' },
    { name: 'lunch',     label: 'Lunch',     lower: 'lunch',     from: 11, to: 14, span: 'between 11am and 2pm' },
    { name: 'afternoon', label: 'Afternoon', lower: 'afternoon', from: 14, to: 17, span: 'between 2pm and 5pm' },
    { name: 'dinner',    label: 'Dinner',    lower: 'dinner',    from: 17, to: 21, span: 'between 5pm and 9pm' },
    { name: 'late',      label: 'Late',      lower: 'late',      from: 21, to: 24, span: 'after 9pm' }
  ];

  var FALLBACK_PERIOD = [
    'Trade is spread fairly evenly across the week, with no single day or hour standing out.',
    'No strong pattern this period — sales are evenly distributed across days and hours.',
    'A steady, even week: nothing in the grid stands apart from the rest.'
  ];
  var FALLBACK_COMPARE = [
    'Much the same as last month, with no day or service moving meaningfully.',
    'Little change on last month — the pattern of trade has held steady.',
    'Very close to last month across the board; no shift worth calling out.'
  ];
  var TOO_LITTLE = 'Not enough trading data yet to describe a pattern.';

  /* ════════════════════════════════════════════════════════════════════
     PUBLIC: summariseHeatmap
     ════════════════════════════════════════════════════════════════════ */

  function summariseHeatmap(input) {
    var v = validateInput(input);
    var cur = normalise(v.current);
    var prev = v.previous ? normalise(v.previous) : null;
    if (prev) { var masked = maskJoint(cur, prev); cur = masked[0]; prev = masked[1]; }
    var gaps = findGaps(v.current, v.hours);

    if (!hasEnoughData(cur)) return { text: TOO_LITTLE, findings: [], gaps: gaps };

    var pick = picker(hash(v.current.grid, v.previous && v.previous.grid, v.mode));
    var findings = v.mode === 'compare'
      ? compareFindings(v.hours, cur, prev)
      : periodFindings(v.hours, cur);
    var chosen = select(findings);

    var text = chosen.length
      ? compose(chosen.map(function (f) { return f.render(pick); }), pick)
      : pick(v.mode === 'compare' ? FALLBACK_COMPARE : FALLBACK_PERIOD);

    return {
      text: text,
      findings: chosen.map(function (f) { return { key: f.key, score: Math.round(f.score * 100) / 100 }; }),
      gaps: gaps
    };
  }

  /* ════════════════════════════════════════════════════════════════════
     PUBLIC: buildHeatmapGrid
     ════════════════════════════════════════════════════════════════════
     opts = {
       hours:         number[]            required, the grid's columns
       timeZone:      string              IANA zone, e.g. 'Australia/Sydney'
       timeZoneFor:   (invoice) => string per-invoice zone, for groups whose
                                          outlets span timezones. Takes
                                          precedence over timeZone.
       revenueOf:     (invoice) => number revenue to count. Default:
                                          total − tips. Confirm against the
                                          InvoiceModel field semantics.
       includeRefunds: boolean            default false — see below
     }

     Refunds are EXCLUDED by default. A refund is recorded when it happens,
     not in the hour of the original sale, so counting it would subtract
     demand from the wrong cell. Set includeRefunds: true for cash-flow
     rather than demand-pattern use.

     Every skipped invoice is counted in `dropped`, so callers can see when
     data is being lost rather than having it vanish silently.
  */

  function buildHeatmapGrid(invoices, opts) {
    opts = opts || {};
    validateHours(opts.hours, 'opts.hours');
    if (!Array.isArray(invoices)) throw new TypeError('buildHeatmapGrid: invoices must be an array');
    if (!opts.timeZone && typeof opts.timeZoneFor !== 'function') {
      throw new TypeError('buildHeatmapGrid: supply opts.timeZone or opts.timeZoneFor. ' +
        'Bucketing UTC timestamps without converting to local time shifts the whole grid.');
    }
    var tzFor = typeof opts.timeZoneFor === 'function' ? opts.timeZoneFor : function () { return opts.timeZone; };
    // Deliberately not named valueOf — every object inherits
    // Object.prototype.valueOf, so that name would always look "supplied".
    var revenueOf = Object.prototype.hasOwnProperty.call(opts, 'revenueOf') && typeof opts.revenueOf === 'function'
      ? opts.revenueOf : defaultRevenueOf;
    var includeRefunds = !!opts.includeRefunds;

    var col = {};
    opts.hours.forEach(function (h, i) { col[h] = i; });
    var grid = emptyGrid(opts.hours.length, 0);
    var dropped = { deleted: 0, refunds: 0, outsideHours: 0, invalid: 0 };

    invoices.forEach(function (inv) {
      if (!inv) { dropped.invalid++; return; }
      if (inv.deleted === true) { dropped.deleted++; return; }
      if (inv.isRefund === true && !includeRefunds) { dropped.refunds++; return; }

      var tz = tzFor(inv);
      var when = new Date(inv.createdAt);
      if (!tz || isNaN(when.getTime())) { dropped.invalid++; return; }

      var local;
      try { local = localParts(when, tz); } catch (e) { dropped.invalid++; return; }
      if (local.dayIndex < 0) { dropped.invalid++; return; }

      var c = col[local.hour];
      if (c === undefined) { dropped.outsideHours++; return; }

      var val = Number(revenueOf(inv));
      if (!isFinite(val)) { dropped.invalid++; return; }
      grid[local.dayIndex][c] += inv.isRefund === true ? -Math.abs(val) : val;
    });

    return { grid: grid, dropped: dropped };
  }

  function defaultRevenueOf(inv) {
    return (Number(inv.total) || 0) - (Number(inv.tips) || 0);
  }

  var fmtCache = {};
  function localParts(date, tz) {
    var f = fmtCache[tz] || (fmtCache[tz] = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz, weekday: 'short', hour: '2-digit', hourCycle: 'h23'
    }));
    var wd, hr;
    f.formatToParts(date).forEach(function (p) {
      if (p.type === 'weekday') wd = p.value;
      if (p.type === 'hour') hr = parseInt(p.value, 10);
    });
    return { dayIndex: DAY_ABBR.indexOf(wd), hour: hr };
  }

  /* ════════════════════════════════════════════════════════════════════
     PUBLIC: weekdayCounts
     ════════════════════════════════════════════════════════════════════
     Inclusive of both ends. Pass 'YYYY-MM-DD' strings in the OUTLET's local
     calendar. Date objects are accepted but read in the runtime's local
     timezone, which is easy to get wrong on a server — prefer strings.
  */

  function weekdayCounts(start, end) {
    var s = toUTCDay(start), e = toUTCDay(end);
    if (e < s) throw new RangeError('weekdayCounts: end is before start');
    var counts = [0, 0, 0, 0, 0, 0, 0];
    for (var t = s; t <= e; t += 86400000) counts[(new Date(t).getUTCDay() + 6) % 7]++;
    return counts;
  }

  function toUTCDay(x) {
    if (x instanceof Date) return Date.UTC(x.getFullYear(), x.getMonth(), x.getDate());
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(x));
    if (!m) throw new TypeError('weekdayCounts: expected a Date or "YYYY-MM-DD", got ' + x);
    return Date.UTC(+m[1], +m[2] - 1, +m[3]);
  }

  /* ════════════════════════════════════════════════════════════════════
     Normalisation
     ════════════════════════════════════════════════════════════════════
     Each cell becomes the average per occurrence of its weekday, and closed
     cells become null. Every detector works on this, so day comparisons are
     like-for-like and closed hours can never read as quiet ones. */

  function normalise(p) {
    return p.grid.map(function (row, d) {
      var n = p.dayCounts[d];
      return row.map(function (v, c) {
        if (n === 0) return null;
        if (p.open && !p.open[d][c]) return null;
        return v / n;
      });
    });
  }

  // In compare mode, only cells open in BOTH periods are comparable.
  function maskJoint(a, b) {
    var outA = a.map(function (row) { return row.slice(); });
    var outB = b.map(function (row) { return row.slice(); });
    for (var d = 0; d < 7; d++) for (var c = 0; c < a[d].length; c++) {
      if (a[d][c] === null || b[d][c] === null) { outA[d][c] = null; outB[d][c] = null; }
    }
    return [outA, outB];
  }

  function hasEnoughData(g) {
    var days = g.filter(function (row) { return rowTotal(row) > 0; }).length;
    return days >= CONFIG.minTradingDays && total(g) > 0;
  }

  /* ════════════════════════════════════════════════════════════════════
     Period detectors
     ════════════════════════════════════════════════════════════════════ */

  function periodFindings(hours, g) {
    var sum = total(g);
    var vals = cells(g);
    var n = vals.length;
    var mean = sum / n;
    var findings = [];

    // 1. Daypart dominance — which service carries the business.
    var dp = daypartTotals(hours, g);
    if (dp.length) {
      var best = dp.slice().sort(function (a, b) { return b.total - a.total; })[0];
      var share = best.total / sum;
      var expected = best.openCells / n;
      findings.push({
        key: 'daypart', subject: 'daypart:' + best.name,
        score: clamp((share - expected) * 2.2),
        render: function (pick) {
          var p = pct(share), approx = approxWord(share);
          return pick([
            best.label + ' carries the business: ' + p + ' of sales land ' + best.span + '.',
            approx
              ? 'Close to ' + approx + ' of revenue comes through ' + best.lower + ' service.'
              : p + ' of revenue comes through ' + best.lower + ' service.',
            best.label + ' does the heavy lifting, at ' + p + ' of a typical week’s sales.',
            'The week is ' + best.lower + '-led — ' + p + ' of revenue arrives ' + best.span + '.'
          ]);
        }
      });
    }

    // 2. Weekend skew, against the share you'd expect from its open hours.
    var weekendVals = cells([g[5], g[6]]);
    if (weekendVals.length) {
      var ws = sumArr(weekendVals) / sum;
      var skew = ws - weekendVals.length / n;
      findings.push({
        key: 'weekend', subject: 'weekend',
        score: clamp(Math.abs(skew) * 3.2),
        render: function (pick) {
          var p = pct(ws);
          if (skew > 0) return pick([
            'Weekends punch above their weight: Saturday and Sunday take ' + p + ' of a typical week’s sales.',
            'Nearly ' + p + ' of a typical week’s revenue arrives on the weekend.',
            'Trade leans heavily on the weekend, which brings in ' + p + ' of sales.'
          ]);
          return pick([
            'Trade is weekday-led — the weekend accounts for only ' + p + ' of sales.',
            'Saturday and Sunday are comparatively quiet, at ' + p + ' of weekly revenue.',
            'Most of the money is made Monday to Friday; the weekend brings in just ' + p + '.'
          ]);
        }
      });
    }

    // 3. Concentration — how much revenue sits in the busiest hours.
    var topN = Math.max(1, Math.round(n / 7));
    var topShare = sumArr(vals.slice().sort(function (a, b) { return b - a; }).slice(0, topN)) / sum;
    findings.push({
      key: 'concentration', subject: 'concentration',
      score: clamp((topShare - topN / n) * 1.6),
      render: function (pick) {
        var p = pct(topShare);
        return pick([
          'Sales are concentrated: the busiest ' + topN + ' hours of a typical week generate ' + p + ' of revenue.',
          'Just ' + topN + ' of ' + n + ' trading hours bring in ' + p + ' of sales.',
          'A small number of peak hours do most of the work — ' + topN + ' of them account for ' + p + '.'
        ]);
      }
    });

    // 4. Consistent trough — an hour quiet on nearly every day.
    var trough = consistentTrough(hours, g);
    if (trough) {
      findings.push({
        key: 'trough', subject: 'hour:' + trough.hour,
        score: clamp(trough.consistency * (1 - trough.avg / mean) * 0.8),
        render: function (pick) {
          var h = hourLabel(trough.hour), avg = money(trough.avg);
          return pick([
            h + ' is quiet every day of the week, averaging ' + avg + ' — a consistent lull between services.',
            'There’s a dependable dip at ' + h + ', with sales averaging just ' + avg + '.',
            'Every day slows at ' + h + '; it’s the weakest hour on the grid at ' + avg + ' on average.'
          ]);
        }
      });
    }

    // 5. Strongest vs weakest day, per typical occurrence.
    var days = [];
    g.forEach(function (row, d) { var t = rowTotal(row); if (cells([row]).length) days.push({ d: d, t: t }); });
    if (days.length >= CONFIG.minTradingDays) {
      days.sort(function (a, b) { return b.t - a.t; });
      var hi = days[0], lo = days[days.length - 1];
      var dayMean = sumArr(days.map(function (x) { return x.t; })) / days.length;
      var ratio = hi.t / Math.max(1, lo.t);
      findings.push({
        key: 'dayRange', subject: 'day:' + hi.d,
        score: clamp(((hi.t - lo.t) / dayMean) * 0.45),
        render: function (pick) {
          var H = DAY_NAMES[hi.d], L = DAY_NAMES[lo.d];
          var vs = ratio >= 1.9
            ? (ratio < 2.15 ? 'about twice ' : 'about ' + round1(ratio) + ' times ') + L + '’s'
            : pct(ratio - 1) + ' ahead of ' + L;
          return pick([
            'A typical ' + H + ' brings in ' + money(hi.t) + ', ' + vs + '.',
            'The gap between days is wide: ' + H + ' averages ' + money(hi.t) + ', ' + L + ' ' + money(lo.t) + '.',
            DAY_PLURAL[hi.d] + ' lead the week; ' + DAY_PLURAL[lo.d] + ' trail at ' + money(lo.t) + ' on average.'
          ]);
        }
      });
    }

    // 6. Peak hour. Always true, rarely interesting — weighted down so it only
    //    leads when nothing else stands out.
    var pk = argMax2D(g);
    if (pk) {
      var peakVal = g[pk.d][pk.c];
      findings.push({
        key: 'peak', subject: 'day:' + pk.d,
        score: clamp(((peakVal / mean) - 1) / 5) * 0.55,
        render: function (pick) {
          var when = DAY_NAMES[pk.d] + ' at ' + hourLabel(hours[pk.c]);
          return pick([
            when + ' is the busiest hour of the week, averaging ' + money(peakVal) + '.',
            'The week peaks at ' + hourLabel(hours[pk.c]) + ' on ' + DAY_NAMES[pk.d] + ' — ' + money(peakVal) + ' on a typical ' + DAY_NAMES[pk.d] + '.',
            'No hour beats ' + when + ', at ' + money(peakVal) + ' on average.'
          ]);
        }
      });
    }

    return findings;
  }

  /* ════════════════════════════════════════════════════════════════════
     Compare detectors
     ════════════════════════════════════════════════════════════════════ */

  function compareFindings(hours, cur, prev) {
    var totalC = total(cur), totalP = total(prev);
    var overall = change(totalC, totalP);
    var findings = [];

    var dpC = daypartTotals(hours, cur), dpP = daypartTotals(hours, prev);
    var dpChg = dpC.map(function (d) {
      var p = dpP.filter(function (x) { return x.name === d.name; })[0];
      return { name: d.name, label: d.label, lower: d.lower, chg: p ? change(d.total, p.total) : NaN };
    }).filter(function (d) { return isFinite(d.chg); })
      .sort(function (a, b) { return b.chg - a.chg; });

    if (dpChg.length >= 2) {
      var up = dpChg[0], down = dpChg[dpChg.length - 1];

      // 1. Offsetting — flat overall but hiding a real shift. The most useful
      //    finding when true, so it scores highest when it applies.
      if (Math.abs(overall) < CONFIG.flatPct && up.chg > CONFIG.offsettingMinSwingPct && down.chg < -CONFIG.offsettingMinSwingPct) {
        findings.push({
          key: 'offsetting', subject: 'daypart:' + up.name,
          score: clamp((up.chg - down.chg) / 25 + 0.3),
          render: function (pick) {
            return pick([
              'Overall sales are flat on last month, but that hides a shift: ' + up.lower + ' up ' + abs(up.chg) + ', ' + down.lower + ' down ' + abs(down.chg) + '.',
              'The total barely moved, yet ' + up.lower + ' grew ' + abs(up.chg) + ' while ' + down.lower + ' fell ' + abs(down.chg) + '.',
              'A flat month on paper — underneath, trade moved from ' + down.lower + ' (' + signed(down.chg) + ') to ' + up.lower + ' (' + signed(up.chg) + ').'
            ]);
          }
        });
      }

      // 2. Daypart spread.
      findings.push({
        key: 'daypartShift', subject: 'daypart:' + up.name,
        score: clamp((up.chg - down.chg) / 30),
        render: function (pick) {
          if (up.chg > 0 && down.chg < 0) return pick([
            up.label + ' is up ' + abs(up.chg) + ' on last month, while ' + down.lower + ' slipped ' + abs(down.chg) + '.',
            'Growth came from ' + up.lower + ' (' + signed(up.chg) + '); ' + down.lower + ' went the other way (' + signed(down.chg) + ').',
            up.label + ' pulled ahead, up ' + abs(up.chg) + ', as ' + down.lower + ' eased ' + abs(down.chg) + '.'
          ]);
          var flat = CONFIG.flatPct;
          if (down.chg > flat) return pick([
            'Every service is ahead of last month, led by ' + up.lower + ' at ' + signed(up.chg) + '.',
            'Gains are across the board, with ' + up.lower + ' out in front (' + signed(up.chg) + ').'
          ]);
          if (up.chg < -flat) return pick([
            'Every service is down on last month, ' + down.lower + ' hardest at ' + signed(down.chg) + '.',
            'No daypart escaped the slowdown; ' + down.lower + ' fell furthest (' + signed(down.chg) + ').'
          ]);
          // Only one end moved; the rest held. Say that, not "across the board".
          if (Math.abs(up.chg) >= Math.abs(down.chg)) return pick([
            'The change is all ' + up.lower + ', up ' + abs(up.chg) + '; other services held steady.',
            up.label + ' drove it, up ' + abs(up.chg) + ', while the rest of the day was unchanged.'
          ]);
          return pick([
            'The change is all ' + down.lower + ', down ' + abs(down.chg) + '; other services held steady.',
            up.label === down.label ? '' : down.label + ' slipped ' + abs(down.chg) + ' while the rest of the day was unchanged.'
          ].filter(Boolean));
        }
      });
    }

    // 3. Day-of-week spread, like-for-like per occurrence.
    var dayChg = [];
    cur.forEach(function (row, d) {
      var c = change(rowTotal(row), rowTotal(prev[d]));
      if (isFinite(c) && cells([row]).length) dayChg.push({ d: d, chg: c });
    });
    dayChg.sort(function (a, b) { return b.chg - a.chg; });
    if (dayChg.length >= 2) {
      var dUp = dayChg[0], dDown = dayChg[dayChg.length - 1];
      var downLeads = Math.abs(dDown.chg) > Math.abs(dUp.chg);
      findings.push({
        key: 'dayShift', subject: 'day:' + (downLeads ? dDown.d : dUp.d),
        score: clamp((dUp.chg - dDown.chg) / 38),
        render: function (pick) {
          var U = DAY_PLURAL[dUp.d], D = DAY_PLURAL[dDown.d];
          if (dUp.chg > 0 && dDown.chg < 0) {
            // Lead with the larger move. A −45% day behind a +3% day is the
            // story told backwards.
            if (downLeads) return pick([
              D + ' fell furthest, down ' + abs(dDown.chg) + ' on last month.',
              'The weak spot is ' + D + ', down ' + abs(dDown.chg) + ' while the rest of the week held up.',
              D + ' stand out for the wrong reason — down ' + abs(dDown.chg) + ' on last month.'
            ]);
            return pick([
              U + ' improved most (' + signed(dUp.chg) + '); ' + D + ' fell furthest (' + signed(dDown.chg) + ').',
              'By day, ' + U + ' are the bright spot at ' + signed(dUp.chg) + ', and ' + D + ' the weak one at ' + signed(dDown.chg) + '.',
              'The biggest day-level swing: ' + U + ' ' + signed(dUp.chg) + ', ' + D + ' ' + signed(dDown.chg) + '.'
            ]);
          }
          var mover = downLeads ? dDown : dUp, M = DAY_PLURAL[mover.d];
          return pick([
            M + ' moved most, at ' + signed(mover.chg) + ' on last month.',
            'Of all days, ' + M + ' changed the most (' + signed(mover.chg) + ').'
          ]);
        }
      });
    }

    // 4. Breadth vs concentration of the change.
    var diffs = [];
    cur.forEach(function (row, d) {
      row.forEach(function (v, c) { if (v !== null) diffs.push({ d: d, c: c, diff: v - prev[d][c] }); });
    });
    var net = totalC - totalP;
    if (diffs.length && Math.abs(overall) >= CONFIG.flatPct) {
      var sign = net > 0 ? 1 : -1;
      var same = diffs.filter(function (x) { return x.diff * sign > 0; });
      var breadth = same.length / diffs.length;
      var top3 = same.slice().sort(function (a, b) { return Math.abs(b.diff) - Math.abs(a.diff); }).slice(0, 3);
      var top3Share = sumArr(top3.map(function (x) { return x.diff; })) / net;
      var narrow = top3.length > 0 && top3Share > 0.5;
      var focusD = top3.length ? modeOf(top3.map(function (x) { return x.d; })) : 0;
      findings.push({
        key: 'breadth', subject: narrow ? 'day:' + focusD : 'breadth',
        score: narrow ? clamp(top3Share * 0.9) : clamp((breadth - 0.5) * 1.4),
        render: function (pick) {
          var dir = sign > 0 ? 'increase' : 'drop', focus = DAY_NAMES[focusD];
          if (narrow) return pick([
            'The ' + dir + ' is narrow: three hours — mostly ' + focus + ' — account for ' + shareWord(top3Share) + ' of it.',
            'Most of the ' + dir + ' comes from a handful of hours, chiefly on ' + focus + '.',
            'This isn’t a broad shift; three ' + focus + '-heavy hours make up ' + shareWord(top3Share) + ' of the ' + dir + '.'
          ]);
          return pick([
            'The ' + (sign > 0 ? 'rise' : 'fall') + ' is broad-based, with ' +
              (breadth >= 0.995 ? 'every hourly slot' : pct(breadth) + ' of hourly slots') + ' ' +
              (sign > 0 ? 'ahead of' : 'behind') + ' last month.',
            'It’s a genuine ' + (sign > 0 ? 'lift' : 'softening') + ' across the week rather than one busy night — ' +
              (breadth >= 0.995 ? 'every hour moved the same way' : pct(breadth) + ' of hours moved the same way') + '.'
          ]);
        }
      });
    }

    // 5. Biggest single-hour swing.
    if (diffs.length) {
      var big = diffs.slice().sort(function (a, b) { return Math.abs(b.diff) - Math.abs(a.diff); })[0];
      var cellMean = totalP / diffs.length;
      findings.push({
        key: 'topCell', subject: 'day:' + big.d,
        score: clamp(Math.abs(big.diff) / Math.max(1, cellMean) / 4) * 0.6,
        render: function (pick) {
          var when = DAY_NAMES[big.d] + ' at ' + hourLabel(hours[big.c]);
          var amt = money(Math.abs(big.diff)), more = big.diff > 0 ? 'more' : 'less';
          return pick([
            'The single biggest swing is ' + when + ', averaging ' + amt + ' ' + more + ' than last month.',
            when + ' moved most of any hour — ' + amt + ' ' + more + ' on a typical ' + DAY_NAMES[big.d] + '.'
          ]);
        }
      });
    }

    return findings;
  }

  /* ════════════════════════════════════════════════════════════════════
     Selection and composition
     ════════════════════════════════════════════════════════════════════ */

  function select(findings) {
    var ranked = findings
      .filter(function (f) { return f.score >= CONFIG.minScore; })
      .sort(function (a, b) { return b.score - a.score; });
    if (!ranked.length) return [];
    var first = ranked[0];
    var second = ranked.slice(1).filter(function (f) {
      return f.subject !== first.subject && f.key !== first.key &&
             f.score >= first.score * CONFIG.secondFindingRatio;
    })[0];
    return second ? [first, second] : [first];
  }

  // Findings are written as standalone sentences. Joining them with
  // "while"/"and" risks ungrammatical output, so they stay separate.
  function compose(parts, pick) {
    if (parts.length === 1) return parts[0];
    return pick(['two', 'two', 'two', 'one']) === 'one' ? parts[0] : parts[0] + ' ' + parts[1];
  }

  /* ════════════════════════════════════════════════════════════════════
     Structure helpers
     ════════════════════════════════════════════════════════════════════ */

  function daypartTotals(hours, g) {
    return DAYPARTS.map(function (dp) {
      var cols = [];
      hours.forEach(function (h, i) { if (h >= dp.from && h < dp.to) cols.push(i); });
      var t = 0, open = 0;
      g.forEach(function (row) {
        cols.forEach(function (c) { if (row[c] !== null) { t += row[c]; open++; } });
      });
      return { name: dp.name, label: dp.label, lower: dp.lower, span: dp.span, openCells: open, total: t };
    }).filter(function (d) { return d.openCells > 0; });
  }

  // First and last open hour of each day are excluded: opening and closing
  // hours are always quiet, and saying so is not an insight.
  function consistentTrough(hours, g) {
    var eligible = g.map(function (row) {
      var open = [];
      row.forEach(function (v, c) { if (v !== null) open.push(c); });
      var first = open[0], last = open[open.length - 1];
      return row.map(function (v, c) { return v !== null && c !== first && c !== last; });
    });
    var pool = [];
    g.forEach(function (row, d) { row.forEach(function (v, c) { if (eligible[d][c]) pool.push(v); }); });
    if (pool.length < 10) return null;
    pool.sort(function (a, b) { return a - b; });
    var q1 = pool[Math.floor(pool.length * 0.25)];

    // Column averages across eligible days, used to confirm a candidate is a
    // real lull between two services — not the morning ramp or the wind-down.
    var colAvg = hours.map(function (h, c) {
      var s = 0, n = 0;
      for (var d = 0; d < 7; d++) if (eligible[d][c]) { s += g[d][c]; n++; }
      return n ? s / n : null;
    });
    function peakAround(c, dir) {
      var m = 0;
      for (var i = c + dir; i >= 0 && i < hours.length; i += dir) if (colAvg[i] !== null && colAvg[i] > m) m = colAvg[i];
      return m;
    }

    var best = null;
    hours.forEach(function (h, c) {
      var elig = 0, quiet = 0, s = 0;
      for (var d = 0; d < 7; d++) {
        if (!eligible[d][c]) continue;
        elig++; s += g[d][c];
        if (g[d][c] <= q1) quiet++;
      }
      if (elig < CONFIG.troughMinEligibleDays) return;
      var consistency = quiet / elig, avg = s / elig;
      var between = peakAround(c, -1) >= avg * CONFIG.troughPeakRatio && peakAround(c, 1) >= avg * CONFIG.troughPeakRatio;
      if (between && consistency >= CONFIG.troughConsistency && (!best || avg < best.avg)) {
        best = { hour: h, avg: avg, consistency: consistency };
      }
    });
    return best;
  }

  function findGaps(p, hours) {
    if (!p.open) return [];
    var out = [];
    for (var d = 0; d < 7; d++) {
      if (p.dayCounts[d] === 0) continue;
      var run = [];
      for (var c = 0; c <= hours.length; c++) {
        var isGap = c < hours.length && p.open[d][c] && p.grid[d][c] === 0;
        if (isGap) { run.push(c); continue; }
        if (run.length >= CONFIG.gapMinConsecutiveHours) {
          out.push({ day: DAY_NAMES[d], dayIndex: d, fromHour: hours[run[0]], toHour: hours[run[run.length - 1]] + 1 });
        }
        run = [];
      }
    }
    return out;
  }

  /* ════════════════════════════════════════════════════════════════════
     Validation
     ════════════════════════════════════════════════════════════════════ */

  function validateInput(input) {
    if (!input || typeof input !== 'object') throw new TypeError('summariseHeatmap: input must be an object');
    var mode = input.mode;
    if (mode !== 'period' && mode !== 'compare') throw new TypeError('summariseHeatmap: mode must be "period" or "compare"');
    validateHours(input.hours, 'hours');
    var H = input.hours.length;
    validatePeriod(input.current, H, 'current');
    if (mode === 'compare') {
      if (!input.previous) throw new TypeError('summariseHeatmap: "compare" mode requires previous');
      validatePeriod(input.previous, H, 'previous');
    }
    return { mode: mode, hours: input.hours, current: input.current, previous: mode === 'compare' ? input.previous : null };
  }

  function validateHours(hours, name) {
    if (!Array.isArray(hours) || !hours.length) throw new TypeError(name + ' must be a non-empty array');
    hours.forEach(function (h, i) {
      if (!Number.isInteger(h) || h < 0 || h > 23) throw new TypeError(name + '[' + i + '] must be an integer 0–23');
      if (i && h <= hours[i - 1]) throw new TypeError(name + ' must be strictly ascending');
    });
  }

  function validatePeriod(p, H, name) {
    if (!p || typeof p !== 'object') throw new TypeError(name + ' must be an object');
    check2D(p.grid, H, name + '.grid', function (v) { return typeof v === 'number' && isFinite(v); }, 'a finite number');
    if (!Array.isArray(p.dayCounts) || p.dayCounts.length !== 7) throw new TypeError(name + '.dayCounts must have 7 entries, Mon→Sun');
    p.dayCounts.forEach(function (n, i) {
      if (!Number.isInteger(n) || n < 0) throw new TypeError(name + '.dayCounts[' + i + '] must be a non-negative integer');
    });
    if (p.open != null) check2D(p.open, H, name + '.open', function (v) { return typeof v === 'boolean'; }, 'a boolean');
  }

  function check2D(g, H, name, ok, what) {
    if (!Array.isArray(g) || g.length !== 7) throw new TypeError(name + ' must have 7 rows, Mon→Sun');
    g.forEach(function (row, d) {
      if (!Array.isArray(row) || row.length !== H) throw new TypeError(name + '[' + d + '] must have ' + H + ' columns to match hours');
      row.forEach(function (v, c) { if (!ok(v)) throw new TypeError(name + '[' + d + '][' + c + '] must be ' + what); });
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     Seeded choice
     ════════════════════════════════════════════════════════════════════ */

  function hash(cur, prev, mode) {
    var h = 2166136261 ^ (mode === 'compare' ? 1 : 0);
    function mix(v) { h ^= Math.round(v); h = Math.imul(h, 16777619); }
    flatten(cur).forEach(mix);
    if (prev) flatten(prev).forEach(mix);
    return h >>> 0;
  }

  function picker(seed) {
    var s = seed || 1;
    return function (arr) {
      s |= 0; s = (s + 0x6D2B79F5) | 0; // mulberry32
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return arr[Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * arr.length)];
    };
  }

  /* ════════════════════════════════════════════════════════════════════
     Maths and formatting
     ════════════════════════════════════════════════════════════════════ */

  function emptyGrid(H, fill) { var g = []; for (var d = 0; d < 7; d++) { var r = []; for (var c = 0; c < H; c++) r.push(fill); g.push(r); } return g; }
  function flatten(g) { return [].concat.apply([], g); }
  function cells(g) { return flatten(g).filter(function (v) { return v !== null; }); }
  function sumArr(a) { return a.reduce(function (s, v) { return s + v; }, 0); }
  function rowTotal(row) { return sumArr(row.filter(function (v) { return v !== null; })); }
  function total(g) { return sumArr(cells(g)); }
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function argMax2D(g) {
    var best = null;
    g.forEach(function (row, d) { row.forEach(function (v, c) {
      if (v !== null && (!best || v > g[best.d][best.c])) best = { d: d, c: c };
    }); });
    return best;
  }
  function modeOf(a) {
    var n = {}; a.forEach(function (v) { n[v] = (n[v] || 0) + 1; });
    return +Object.keys(n).sort(function (x, y) { return n[y] - n[x]; })[0];
  }
  function change(now, then) { return then ? ((now - then) / then) * 100 : NaN; }
  function pct(f) { return Math.round(f * 100) + '%'; }
  function shareWord(f) { return f >= 0.995 ? 'all' : pct(f); }
  function abs(p) { return Math.abs(Math.round(p)) + '%'; }
  function signed(p) { var r = Math.round(p); return (r > 0 ? '+' : r < 0 ? '−' : '') + Math.abs(r) + '%'; }
  function round1(v) { return String(Math.round(v * 10) / 10); }
  function money(v) { return 'S$' + Math.round(v).toLocaleString('en-SG'); }
  function hourLabel(h) { return (h % 12 === 0 ? 12 : h % 12) + (h < 12 ? 'am' : 'pm'); }
  function approxWord(f) {
    if (f >= 0.47 && f <= 0.53) return 'half';
    if (f >= 0.31 && f <= 0.36) return 'a third';
    if (f >= 0.23 && f <= 0.27) return 'a quarter';
    if (f >= 0.63 && f <= 0.70) return 'two thirds';
    return null;
  }

  var api = {
    summariseHeatmap: summariseHeatmap,
    buildHeatmapGrid: buildHeatmapGrid,
    weekdayCounts: weekdayCounts,
    CONFIG: CONFIG
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (root) root.HeatmapSummary = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
