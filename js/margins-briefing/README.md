# margins-briefing

A short briefing for the **Margins** tab: under 100 words, built only from the numbers the tab already shows. Local and deterministic: no network, no model, no random numbers. The same approach as `js/sales-briefing` and `js/spend-briefing`, but simpler: no stored memory, so nothing that applies is ever left out.

```
node margins-briefing.test.js     # 33 tests, no dependencies
```

## Usage

```js
const { summariseMarginsTab } = require('./margins-briefing.js');
// In a browser without a bundler: window.MarginsBriefing

const { text } = summariseMarginsTab(marginsData);
```

The input shape is documented at the top of `margins-briefing.js`. `buildMarginsBriefingInput()` in `Procure - Dashboard.html` builds it from the same values the key-numbers strip uses.

## What it says

Up to eight kinds of statement. Each is left out when there is nothing to say:

1. **Gross profit** against target, and against the comparison period. "Gross profit is 68.5%, 0.2 pts above target and up 1.9 pts vs last month." Always said.
2. **Outlets below target** (group view only): how many, and the two furthest below, by name.
3. **Gross profit leaders** (group view, three or more outlets): the outlet with the most gross profit in dollars and the runner-up, with the leader's change vs the comparison period. "Roll'd Chatswood earns the most gross profit, $8,636 (69.2% GP, up 1% vs last month), then Roll'd Bondi at $7,871." The figures are the ones in the **Outlet performance** panel. Four wordings. It scores high enough to be said in nearly every briefing, always straight after the gross profit sentence or the outlets-below-target one, and it never leads.
4. **Trend**: how many days (or weeks, months) gross profit was below target, and the lowest one. It uses the same points as the GP% tile.
5. **Category**: which sales categories have the highest and lowest COGS, or how many run above the overall COGS. It uses COGS by sales category for the selected outlets.
6. **Recorded wastage and estimated food cost above target**, as two separate amounts (both in whole dollars, like their tiles). They are never added together or called a loss: they can overlap, and the second is an estimate from recipe costs, not from purchases or stock counts.
7. **Supplier price impact**: what supplier price changes added to, or took off, costs. What it covers (items with a price in both periods) is in the tile's "i" tooltip, not repeated in the sentence.
8. **Recipe cost**: the estimated extra cost this period of ingredient price rises on the recipes sold (cost change per serve × number sold). It names the ingredient when there is only one, and the outlet when one outlet is selected. It states the amount as a fact and never explains it.

Gross profit plus **at most three others** are said (four sentences), so the briefing stays short. The three chosen are the highest scoring, so a quiet trend or a small price move drops out.

## Not the same every time

- **Which facts appear.** Each statement is scored from its own numbers (how far from target, how many outlets are below, how big the price move, how wide the category spread). The top three supporting statements are said, after a small nudge derived from the data so that close calls don't always go the same way. So the mix changes as the numbers do.
- **The lead follows what's notable.** Gross profit leads unless another statement beats its score by a clear margin (`CONFIG.leadMargin`). For example, when gross profit is on target but several outlets are well below theirs, the outlets sentence goes first. The rest follow in score order.
- **Different shapes, not just synonyms.** Most statements come in three or four structures. For example, "Recorded wastage is $120. Estimated food cost above target is $160." / "Estimated recipe cost above your targets is $160, and logged wastage is $120." / "Wastage on record came to $120; estimated food cost above the targets came to $160."
- **The tab's own labels aren't repeated verbatim.** Wastage is "recorded", "logged", "on record" or plain; food cost above target is always "estimated", and is "food cost", "recipe cost", "above target" or "above your targets". The price line names no panel and says nothing about "tracked" items or "Procure".
- **Deterministic.** Everything above comes from a hash of the displayed figures, so identical data always gives identical text (no flicker on re-render). Each statement uses its own stream, so its wording doesn't change just because the order did.
- **Tests force every wording** (`{ seed, unlimited }` options) and check that the figures are the same across the wordings of a statement.

## What it won't say: why

It states facts side by side and never explains them. The cost lines sit next to the gross profit figure; nothing says they caused it, because nothing in the data could show that. No "because", "driven by" or "which suggests", and a test fails if any appear.

Every number is either a figure the tab shows or plain arithmetic on those figures (a difference, a share of revenue). A test checks that each number in the text traces to the input.

Wastage and food cost above target are stated as amounts only. Their change against the comparison period isn't reported in the sentence. When there isn't enough data for food cost above target (no outlet has a target), the dashboard passes `null` and the sentence is left out.

## Before shipping

| Needs | Why |
|---|---|
| A real gross profit change vs the comparison period | The prototype reuses the COGS card's change (sign flipped), so the tile, the briefing and the card agree. |
| A real target per outlet | The prototype sets one per outlet in `MARGINS_TARGET_COGS`. The group target is revenue-weighted. |
| Wastage from the wastage log, and recipe costs per mapped sale | Wastage is an allocated sample figure in the prototype, and food cost above target is worked out from sample daily sales and COGS %. |
| Price impact from invoice price history | See the note on `priceSteps()` in the dashboard. |
| Stock-count freshness in the data-status footer | Not modelled in the prototype, so the footer only reports outlets without POS. |
