# sales-briefing

A short briefing for the **Sales** tab — under 100 words, built only from the data the tab already shows. Local and deterministic: no network, no model.

```
node sales-briefing.test.js     # 19 tests, no dependencies
```

If `js/heatmap-summary/heatmap-summary.js` is present, the briefing also draws on the heatmap's findings. It is optional.

## Usage

```js
const { summariseSalesTab } = require('./sales-briefing.js');
// In a browser without a bundler: window.SalesBriefing

const saved = loadBriefingMemory(userId);            // your storage: localStorage or server
const { text, memory } = summariseSalesTab(salesTabData, saved);
saveBriefingMemory(userId, memory);
render(text);
```

The input is the same data the Sales panels render. The full shape is documented at the top of `sales-briefing.js`.

## What it says, and what it won't

It leads with the strongest finding from **any** panel — revenue, outlets, channels, items, dine-in spend per head, yesterday's covers, or the heatmap — then adds up to two supporting findings and a coverage note.

It never states a cause. The only links it draws between facts are arithmetic:

- **Revenue split** into dine-in (covers × spend per head) and off-premise (orders × average order value). This is an exact identity, so "most of that came from higher dine-in spend per head" is a calculation, not an interpretation.
- **A group change split by outlet**: "Wynyard and Chatswood account for 59% of the increase."

Nothing else is joined. The test suite checks 300 random scenarios for words like *because*, *usually*, *likely*, *suggests* and *driven by*.

## Why it doesn't read the same every day

- **The data decides what leads.** Different periods surface different panels.
- **Supporting findings rotate.** The lead is always the strongest finding, but when several supporting findings qualify, it prefers ones this user hasn't seen recently. That's what `memory` is for — persist it per user. Without it the output is still correct; it just won't rotate.
- **Each finding has several phrasings.**

Identical data always returns identical text, so re-rendering or switching tabs never makes it flicker. Rotation only happens when the data changes.

The revenue breakdown is **pinned**: whenever revenue moved, it's always included. It's the one thing the summary cards above can't show.

## Before shipping, confirm upstream

The module doesn't read POS invoices. Whatever builds the Sales tab data must already:

| | |
|---|---|
| **Count covers from dine-in only** | Takeaway and delivery record 1 guest per order, so off-premise "covers" are really order counts. Mixing them turns a delivery surge into "guests spending more". Dine-in gets covers and spend per head; off-premise gets orders and average order value. |
| **Convert to outlet-local time** | `createdAt` is UTC. See `buildHeatmapGrid` in `heatmap-summary.js`. |
| **Exclude refunds and deleted invoices** | As `buildHeatmapGrid` does. |
| **Compare like-for-like days** | Same days of the previous period, normalised by weekday count. |
| **Exclude outlets that connected POS mid-period** | Otherwise a partial month reads as huge growth. List them in `coverage.excluded` and the briefing will say so. |
| **Match items by product ID** | A renamed POS product otherwise "collapses" while a new one "appears". |
| **Only use closed, synced days** | `daily.lastClosedIndex` must be the last fully synced trading day. Never today. |

Use one shared normaliser for the panels and the briefing, so they can never disagree.

**This also affects the existing Covers and Spend per head panels.** If they currently use all-channel covers, they're showing the blended figure — covers inflated by order counts, spend per head inflated by delivery orders counted as one head each. They should be dine-in only.

## Tuning

Thresholds live in `CONFIG` and were set against synthetic data. Expect to adjust them on real data. The ones most likely to need attention:

- `flatRevenuePct` — below this, revenue is "steady"
- `channelShiftPts` — how many points of share a channel must move to be mentioned
- `outletDivergencePct` — how far an outlet must move against the group
- `superlativeMarginPts` — how clearly an outlet or item must lead before the briefing calls it "the steepest" or "the biggest". Raise this if the named outlet flips between days.
