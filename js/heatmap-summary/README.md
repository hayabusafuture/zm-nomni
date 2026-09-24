# heatmap-summary

Generates a one- or two-sentence summary of the **Sales by day & hour** heatmap, locally and deterministically. No network, no model — it reads the grid and describes what it finds.

```
node heatmap-summary.test.js     # 24 tests, no dependencies
```

## Integration

```js
const { buildHeatmapGrid, weekdayCounts, summariseHeatmap } = require('./heatmap-summary.js');
// In a browser without a bundler, the same API is on window.HeatmapSummary.

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const current = {
  grid: buildHeatmapGrid(invoicesThisPeriod, { hours: HOURS, timeZone: 'Australia/Sydney' }).grid,
  dayCounts: weekdayCounts('2026-09-01', '2026-09-21'),
  open: openHoursMask            // optional, from StoreOperatingHour
};
const previous = { /* same shape, for the comparison period */ };

const { text, findings, gaps } = summariseHeatmap({
  mode: 'compare',               // or 'period'
  hours: HOURS,
  current,
  previous
});
```

Call it whenever the heatmap renders: on scope change, period change, and when the *This period / vs last month* toggle switches. The same data always returns the same text, so re-rendering won't make it flicker.

## Before shipping, confirm

| | Why it matters |
|---|---|
| **Timezone per outlet** | `createdAt` is UTC. Bucketing without conversion shifts the whole grid by hours — dinner lands in the lunch columns, and the summary confidently describes the wrong service. For groups spanning zones, pass `timeZoneFor: invoice => …`. |
| **Revenue definition** | The default counts `total − tips`. Check this against the `InvoiceModel` semantics (tax, surcharge, service charge) and override with `revenueOf` if it differs. |
| **Refunds** | Excluded by default: a refund is recorded when it happens, not in the hour of the original sale, so counting it subtracts demand from the wrong cell. Set `includeRefunds: true` only for cash-flow use. |
| **Deleted invoices** | Skipped if `deleted === true`. If deleted invoices come from a separate endpoint, don't pass them at all. |
| **Raw, not capped, values** | Pass raw revenue. The heatmap's 95th-percentile cap is a display decision and would distort the findings. |
| **Weekday counts** | Pass `weekdayCounts()` in the **outlet's local calendar**, as `YYYY-MM-DD` strings. Date objects are read in the runtime's timezone, which is easy to get wrong on a server. |
| **Open-hours mask** | Optional but recommended. Without it, a closed hour reads as a quiet one, and `gaps` is always empty. |

`buildHeatmapGrid` returns a `dropped` count by reason — `deleted`, `refunds`, `outsideHours`, `invalid`. Log it. A high `outsideHours` means the grid's hours don't cover when the outlet actually trades.

## What `gaps` means

Runs of **open** hours with zero sales on **every** occurrence of that weekday — almost always a reporting problem or an unrecorded closure, not a quiet spell. It isn't narrated in `text`; surface it separately.

It only catches systematic gaps. A one-off outage on a single date is diluted by the other weeks.

## Labelling

Don't put the AI chip on this. It's computed locally from the grid and can't invent a number, so calling it AI would mislead in the other direction. "Summary" is accurate.

## Tuning

All thresholds live in `CONFIG` and were tuned against synthetic data. Expect to adjust them once real grids come through — real data is noisier, and some findings will fire more readily than they should. Watch `offsetting` hardest: "flat overall, but hiding a shift" is the most valuable finding when it's true and the most embarrassing when it's noise.

## Known limits

- Online and delivery orders are bucketed by when they were **placed**, not fulfilled.
- Built for a Mon→Sun, hour-column grid. Dayparts are fixed (lunch 11am–2pm, dinner 5–9pm, etc.) in `DAYPARTS`.
- Currency is formatted as S$. Change `money()` for other markets.
