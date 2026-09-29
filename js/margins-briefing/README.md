# margins-briefing

A short briefing for the **Margins** tab: under 100 words, built only from the numbers the tab already shows. Local and deterministic: no network, no model, no random numbers. The same approach as `js/sales-briefing` and `js/spend-briefing`, but simpler: one fixed wording per case, so there is no rotation and no stored memory.

```
node margins-briefing.test.js     # 17 tests, no dependencies
```

## Usage

```js
const { summariseMarginsTab } = require('./margins-briefing.js');
// In a browser without a bundler: window.MarginsBriefing

const { text } = summariseMarginsTab(marginsData);
```

The input shape is documented at the top of `margins-briefing.js`. `buildMarginsBriefingInput()` in `Procure - Dashboard.html` builds it from the same values the key-numbers strip uses.

## What it says

In this order, leaving out whatever has nothing to say:

1. **Gross profit** against target, and against the comparison period. "Gross profit is 68.5%, 0.2 pts above target and up 1.9 pts vs last month."
2. **Outlets below target** (group view only): how many, and the two furthest below, by name.
3. **Recorded wastage and unexplained variance** as amounts (rounded to S$10, like the tiles), and together as a share of revenue.
4. **Supplier price impact**: what price changes on the tracked items added to, or took off, costs.

## What it won't say: why

It states facts side by side and never explains them. The cost lines sit next to the gross profit figure; nothing says they caused it, because nothing in the data could show that. No "because", "driven by" or "which suggests", and a test fails if any appear.

Every number is either a figure the tab shows or plain arithmetic on those figures (a difference, a share of revenue). A test checks that each number in the text traces to the input.

Wastage and variance are stated as amounts only. Their change against the comparison period isn't reported, because the tab has no reliable comparison for them yet.

## Before shipping

| Needs | Why |
|---|---|
| A real gross profit change vs the comparison period | The prototype reuses the COGS card's change (sign flipped), so the tile, the briefing and the card agree. |
| A real target per outlet | The prototype sets one per outlet in `MARGINS_TARGET_COGS`. The group target is revenue-weighted. |
| Wastage and variance from stock counts | They are allocated sample figures in the prototype. |
| Price impact from invoice price history | See the note on `priceSteps()` in the dashboard. |
| Stock-count freshness in the data-status footer | Not modelled in the prototype, so the footer only reports outlets without POS. |
