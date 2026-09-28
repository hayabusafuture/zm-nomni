# spend-briefing

A short briefing for the **Spend & procurement** tab — under 100 words, built only from the data the tab already shows. Local and deterministic: no network, no model. The same approach as `js/sales-briefing`.

```
node spend-briefing.test.js     # 24 tests, no dependencies
```

## Usage

```js
const { summariseSpendTab } = require('./spend-briefing.js');
// In a browser without a bundler: window.SpendBriefing

const saved = loadBriefingMemory(userId);             // your storage: localStorage or server
const { text, memory } = summariseSpendTab(spendTabData, saved);
saveBriefingMemory(userId, memory);
render(text);
```

The input is the same data the Spend panels render. The full shape is documented at the top of `spend-briefing.js`.

## What it says, and what it won't

It picks the strongest findings (up to three), from:

- **Spend change**, split by supplier. Always included when spend moved.
- **Price rises** of 5% or more, grouped by item: where (one outlet by name, several by count, "all" when it's every outlet) and by how much at most.
- **Price discrepancies**: the Order accuracy headline, naming a supplier that holds half or more, plus "not received" only when it's above S$0.
- **A supplier under 90%** on fill rate or price accuracy, judged on the figure shown.
- **An outlet moving against the group** (group view only), or the biggest mover when the group is flat.

### Organised by story, not by panel

When two findings are about the same supplier, they're told as one story, with the supplier as the subject:

> Two things stand out for Sunrise Poultry Distributors: it raised the price of chicken thigh fillet by up to 14.3% at all 30 outlets, and it had 65% of its invoice lines at the ordered price. Overall, spend fell 4%, split between Green Valley Produce and Sunrise Poultry Distributors.

- If the supplier also holds most of the spend change, spend opens the story ("Spend fell 2%, and most of that is Sunrise… (−S$555), which also…").
- Otherwise spend becomes a line of context, after the story when the story is stronger and before it when it isn't. So the briefing doesn't always open with "Spend…".
- A story is short: spend plus one fact, or two facts. The supplier is named once.
- Other findings follow as their own sentences, some with a joining word ("Elsewhere,", "Separately,").

It never states a cause. The only link it draws is arithmetic: the spend change split by supplier, which adds up exactly to the total. Supplier comes from the invoice header, so the split is always exact; category is not used, because items can sit in TBD. The test suite checks 300 random scenarios for words like *because*, *usually*, *likely*, *suggests* and *driven by*.

Price changes are per outlet, as Procure tracks them. The briefing never averages an item's price across outlets; for an item that rose at several outlets it reports the largest rise and how many outlets.

It doesn't mention data gaps (missing invoices): the Data status footer under the text already does.

## Why it doesn't read the same every day

As `sales-briefing`: the data decides what leads, supporting findings rotate using `memory` (persist it per user), and each finding has several phrasings. Identical data always returns identical text.

## Before shipping, confirm upstream

| | |
|---|---|
| **Spend is invoiced spend** | The same figure the Spend panels use. |
| **Price rows are per outlet** | Each outlet against its own previous price. Rows with the same old and new price at several outlets may be collapsed; pass every outlet in `outlets`. |
| **Discrepancies use matched lines only** | Above ordered price: invoice lines matched to a PO line. Not received: invoice lines matched to a GRN line for the same item. |
| **Reliability rows are the panel's** | Only suppliers with enough orders (5 across a group, 2 for one outlet). |
| **Compare like-for-like days** | As the Spend panels. |

## Tuning

Thresholds live in `CONFIG` and were set against synthetic data. The ones most likely to need attention:

- `flatSpendPct` — below this, spend is "steady"
- `priceRisePct` — the smallest price rise worth saying
- `minDiscrepancy` — S$ above the ordered price before it's mentioned
- `outletDivergencePct` / `outletMoverPct` — how far an outlet must move
- `superlativeMarginPts` — how clearly an item must lead before it's called "the largest"
