# Freemium Prototype Notes

## Main Objective

Create a freemium entry flow and supporting UX/UI that lets users directly try Nomni Procure, formerly Zeemart.

The start of the flow currently presents two CTAs:

- **Get started** as the primary CTA
- **Book a demo** as the secondary CTA

The `Get started` CTA on the Nomni and Zeemart marketing pages redirects to a Procure-owned entry page: `Freemium/procure-get-started.html`.

That page shows the lead-capture and signup dialog over a heavily blurred Procure dashboard background with a cream-led brand wash. The intent is that the marketing sites only need to own a simple link, while the Procure product owns the lead capture, demo request, signup, onboarding transition, and dashboard handoff.

The first screen captures the user's work email and country, and shows the two path CTAs in the same view. The full-width country selector appears directly below the email field. It defaults to Singapore or Australia when either can be identified from the browser locale/timezone; users elsewhere see `Select country` and must choose before continuing.

The opening email screen presents two paths after the user enters an email:

1. **Try the demo account**
   - User sees a confirmation message telling them to check their inbox.
   - Copy says a private demo link was sent to their email and expires in 14 days.
   - This verifies the email address before demo access.
   - While on the `Check your inbox` step, a push-notification-style email toast appears.
   - Clicking the toast opens `Freemium/procure-demo-email.html` in a new tab.
   - The email contains a CTA to `Freemium/procure-demo-dashboard.html`, a demo dashboard with sample data.
   - The captured email is carried through the email and demo dashboard links, then prefilled if the user starts a free trial from the demo.
   - Prototype duplicate-demo logic: when the entry page is opened with a prefilled `?email=...`, clicking `Try the demo account` with the same email shows a `Demo already requested` message instead of sending another demo link. The message asks the user to check their inbox or speak to Nomni's team if they need another demo.

2. **Sign up for FREE**
   - Let the user create a real account and begin a 14-day trial.
   - The user is first asked to verify their email with a 6-digit code.
   - A push-notification-style email toast appears while the user is on the verification step.
   - Clicking the toast opens `Freemium/procure-verification-email.html`, showing the mock email and verification code.
   - Prototype verification code: `123456`.
   - After verification, Step 1 asks for first name, last name, and password.
   - Password rule: minimum 8 characters with at least one lowercase letter, one uppercase letter, one number, and one symbol/special character.
   - Step 2 asks for company registered name, venue name, and structured venue address fields. Country is shown as a read-only label using the selection made on the opening email screen.
   - Step 2 includes prototype-only duplicate company validation. Typing `Existing Company Pty Ltd`, `Kind Foods Pte Ltd`, or `Whole Foods Pte Ltd` into the company field and clicking `Continue` shows an inline `This company may already have a Nomni Procure account` card (validation runs on Continue, not while typing/on blur).
   - The company-exists card's only action is `Sign in instead`, linking to `https://buyer.zeemart.co/`. There is no `Contact support` option or "if this doesn't look right" copy on this state.
   - While the company-exists error is showing, the `Continue` button is disabled; it re-enables as soon as the user edits the company name field.
   - The entry dialog switches to a scrollable/top-aligned layout while this card is visible (an `is-overflowing` state) so the taller Step 2 content doesn't get clipped or overflow the viewport.
   - Supported prototype countries are Australia and Singapore. Changing the country requires returning to the opening email screen, keeping the address fields and validation aligned with the selected market.
   - For Australia, address entry is ordered as postcode, suburb, then state. For Singapore, only postal code is shown after street address and autocomplete is disabled for now.
   - Step 3 asks optional setup questions: primary goal, number of locations, and current ordering method.
   - The primary goal is shown as a stacked list of three selectable rows with large icons: `Order faster`, `Digitise invoices`, and `Manage inventory`. Users can click a row once to select it, or click the selected row again to clear it.
   - Goal row icons use `Freemium/assets/icons/orders.svg`, `Freemium/assets/icons/invoices.svg`, and `Freemium/assets/icons/inventory.svg`.
   - The selected primary goal is stored as `primaryGoal` so the trial dashboard checklist can be personalised around the user's setup priority.
   - Prototype evaluation shortcut: open `Freemium/procure-get-started.html?step=3&prefill=1` to jump straight to Step 3 with harmless sample details. Add `&primaryGoal=Digitise%20invoices` or `&primaryGoal=Manage%20inventory` to preview a selected goal.
   - Finish shows a short `Creating your account` transition, then sends the user to the trial dashboard checklist with `setup=1`, so the onboarding view appears even if the user previously dismissed it.
   - If no primary goal is selected, the dashboard defaults to the `Order faster` checklist.

The current landing-page work is the top-of-funnel UI for this flow. The above-the-fold sections should make the “try Nomni Procure” action feel immediate and low-friction.

## Source References

Primary visual references are:

- `Freemium/_refs/Nomni - Procure.html`
- `Freemium/_refs/Nomni - Procure_files/`
- `Freemium/_refs/Zeemart.html`
- `Freemium/_refs/Zeemart_files/`
- the current Freemium prototype HTML files in this folder

## Prototype Files

- `Freemium/nomni.html`
- `Freemium/Zeemart.html`
- `Freemium/freemium.html`
- `Freemium/zeemart.html`
- `Freemium/procure-get-started.html`
- `Freemium/procure-verification-email.html`
- `Freemium/procure-demo-email.html`
- `Freemium/procure-demo-dashboard.html`
- `Freemium/Procure Trial Dashboard.html`
- `Freemium/procure-trial-outlet-suppliers.html`
- `Freemium/procure-trial-add-supplier-search.html`
- `Freemium/procure-trial-add-supplier-results.html`
- `Freemium/procure-trial-add-supplier-settings.html`
- `Freemium/procure-trial-add-supplier.html` redirects to the split supplier setup entry page for compatibility.
- `Freemium/procure-trial-items.html` — Items page and guided Add item / Build market list onboarding flow, linked from the `Items` sidenav entry and the checklist's `Add items` CTA.
- `Freemium/procure-trial-create-sku.html` — full-page manual `Create SKU` form used after selecting a supplier from the Items `Add > Create new` path.
- `Freemium/procure-trial-review-invoice-items.html` — invoice-assisted item review page used after Items `Add > Add from invoice`.
- `Freemium/procure-trial-orders.html` — Orders page and guided Place order entry flow, including the `New order` split menu.
- `Freemium/procure-trial-new-order-item.html` — order-by-item creation flow used for the first order onboarding path.
- `Freemium/procure-trial-new-order-supplier.html` — order-by-supplier creation flow used as the secondary first-order path.
- `Freemium/procure-trial-inventory.html` — Inventory page and guided Set up inventory / stock-count onboarding flows.
- `Freemium/procure-trial-stock-count.html` — stock-count flow linked from Inventory onboarding and the Manage inventory checklist path.
- `Freemium/procure-trial-invoices.html` — interactive invoice onboarding page for the `Upload invoice` and `Digitise invoices` checklist CTAs. It starts empty, accepts one or more JPG/PNG/PDF uploads, lists them under Uploads with the live-style five-part completeness status, and opens an OCR-prefilled review form through `View/edit`. Saving moves the record into Invoices. `Pay online` is intentionally omitted.
  - The Upload invoice tour ends with a `Digitise invoices` hand-off rather than a generic `Done` action. The hand-off starts Digitise Step 1 on the existing `View/edit` control; selecting `View/edit` directly also dismisses the upload popover and continues at Digitise Step 2 in the editor.

Generated preview screenshots:

- `Freemium/nomni-procure-top-preview.png`
- `Freemium/zeemart-top-preview.png`

## Asset downloads for devs

Handoff-enabled pages expose `↓ Assets` downloads for that page and for the
whole flow. The static archives live in `Freemium/assets/downloads/`.

After changing local image references, run `build-asset-downloads.py` to
regenerate the archives and manifest. Run `inject_asset_widget.py` only when a
new handoff-enabled page needs the widget. Marketing pages, email mockups, and
redirect stubs remain out of scope.

## Implementation Notes

All prototypes are standalone HTML files with inline CSS and JavaScript,
Google Fonts, and local assets. Handoff-enabled trial pages include the `Aa`
and `Box` inspectors.

`freemium.html` and `zeemart.html` are compatibility redirects to the current
Nomni and Zeemart marketing prototypes. The shared entry flow reads
`?source=nomni` or `?source=zeemart` for its back link, and passes identity,
venue, and primary-goal context to the trial dashboard. Australia uses the
local postcode/suburb lookup; Singapore uses manual postal-code entry.

## Trial Onboarding Current Behaviour

`Freemium/Procure Trial Dashboard.html` is the destination after the user finishes the free signup flow.

Dashboard states:

- First visit, or `?setup=1`, shows the onboarding checklist.
- Dashboard sidenav clicks also open the onboarding checklist by default until setup is 100% done or the user explicitly chooses `Dismiss setup`.
- `Dismiss setup` opens a short choice dialog. `Keep setup shortcut` adds `setupDismissed=1`, so Dashboard opens the regular dashboard while the sidebar `Get started` card remains available. `Hide everywhere` also adds `setupPanelDismissed=1`, hiding the sidebar card across trial pages.
- After dismissal, Dashboard shows the regular empty trial dashboard with zero-value cards and empty spending sections.
- The persistent sidebar `Get started` card reopens the onboarding checklist with `?setup=1`.

Trial app chrome:

- Trial-page topbars show an interactive `Trial ends in 14 days` countdown, the real-site `Help` link, and the trial user. The countdown opens a conversion/support popover on hover, click, or keyboard focus, with `Book a live demo` and `Chat with us` actions; this replaces the former separate adjacent demo link across the trial prototype. The demo action follows the standard primary-button hover treatment across every trial page: dark seaweed background and border with green text.
- Trial Dashboard page-first prototype: its `Book a live demo` actions now open an in-product two-step request dialog instead of leaving for the Nomni contact page. Step 1 asks for preferred contact method, contact details, and timing. Step 2 asks the user to confirm `locations`, choose one or more current ordering methods (prefilled from `orderingNow` when available), and add optional questions. Primary goal is not repeated in this dialog. The current signup handoff only carries `primaryGoal` and `email`; if this treatment is approved for the full flow, `locations` and `orderingNow` must also be added to the signup/dashboard parameter handoff.
- The same two-step `Book a live demo` request dialog is now used by the countdown popover across every authenticated `procure-trial-*` page. These in-product trial buttons no longer link to `nomni.ai/lets-chat`. Marketing-page CTAs and the mock email remain external links because they sit outside the authenticated trial product.
- `Trial ends in 14 days` switches to an amber warning treatment when the prototype receives `trialDaysLeft=3` or fewer, so the near-expiry state can be reviewed.
- `Help` and `View support articles` both point to the Restaurants / Nomni Procure knowledge-base collection.
- Sidebar includes the Procure nav, the `Get started` card directly below `News`, and the lower-left Intercom-style launcher.
- The sidebar card shows current setup progress, a progress bar, and one recommended next action. The card body returns to the checklist; only the next-action text starts the active guided flow.
- The checklist panel includes a non-progress mobile-app helper card. It introduces the Nomni Procure mobile app and uses official App Store / Google Play badges. On mobile, the badges open the relevant store listing directly; on desktop, they open a QR modal for the selected store. This is informational only and must not count towards setup progress.
- Signup details travel through URL params. Trial pages use the captured user name and `venueName`; direct file previews fall back to `Trial user` and `Trial Outlet`.
- Orders, Invoices, Items, and Inventory nav links point to the trial placeholder/live pages instead of `#`.

Checklist logic:

- `Create account` is complete for every trial, so progress starts at 20%.
- Prerequisite recovery states can be reviewed directly on the checklist. Each page initially shows the normal checklist; click the affected flow CTA or its sidebar `Next` action to open the compact prerequisite modal:
  - `?setup=1&primaryGoal=Order%20faster&prerequisite=order` — no orderable market-list items; offers `Go to Items` and `View guide`.
  - `?setup=1&primaryGoal=Digitise%20invoices&prerequisite=digitise` — no uploaded invoice awaiting review; offers `Upload invoice` and `View guide`.
  - `?setup=1&primaryGoal=Manage%20inventory&prerequisite=stockCount` — no inventory list containing items; offers `Go to Inventory` and `View guide`.
- These recovery states deliberately do not start or restart another guided tour. The same compact modal appears after the user attempts to start the unavailable flow from either the checklist or persistent sidebar widget, keeps them on their current page, explains the missing prerequisite, and provides a direct product action alongside the existing support guide.
- Cross-page widget example: open `procure-trial-outlet-suppliers.html` with `supplierAdded=1&marketListBuilt=1&primaryGoal=Order%20faster&prerequisite=order`, then select `Next: Place order`.
- The `Dismiss setup?` dialog treats `Keep setup shortcut` as the primary action and `Hide everywhere` as the secondary action.
- In a recovery warning, `View guide` points to the missing prerequisite rather than the unavailable task: managing market-list items for Place order, uploading invoices for Digitise invoices, and managing items in inventory lists for Complete stock count.
- Goal-dependent primary paths:
  - `Order faster`: Add supplier, Build market list, Place order, Set up inventory.
  - `Digitise invoices`: Add supplier, Build market list, Upload invoice, Digitise invoices.
  - `Manage inventory`: Add supplier, Build market list, Set up inventory, Complete stock count.
- `Add supplier` is required before `Build market list`.
- `Build market list` is required before `order`, `inventory`, and `invoiceUpload`.
- Checklist row unlocking uses each task's `dependsOn` field, not strict list position. After the market list is built, `Create order`, `Set up inventory`, and `Upload invoice` all unlock with real CTA buttons.
- Chained tasks keep real prerequisites: `invoiceDigitise` depends on `invoiceUpload`, and `stockCount` depends on `inventory`. `invoiceExport` remains defined in the prototype data for later but is currently coded out of the visible setup list.
- The sidebar still recommends exactly one next action based on the selected goal, even when several checklist actions are unlocked.

Guided-tour standards:

- Copy should sound like helpful product onboarding, not prototype or implementation notes.
- Avoid technical/internal wording such as `SKU manually`, `OCR-assisted path`, `create form`, or copy that explains wiring.
- Lead with the user's job: add items the team orders, link them to the right supplier, set buying details, decide whether to count them in inventory, then save.
- Never start a checklist flow by automatically redirecting the user to another page. The CTA should first open the tour on the current page, point at the real sidenav or on-page control, and let the user click it to continue.
- The sidebar `Next: ...` action follows the same rule: when a guided flow exists, it should open that flow's starting tour panel on the current page, not send users back to the checklist. Supplier, market-list, order, inventory, and stock-count starts all begin by pointing at the relevant sidenav item; clicking that real nav item continues the flow. This includes next actions when the user is already on Items, Orders, Inventory, Create SKU, or a supplier-flow page.
- Users should advance by clicking highlighted product controls wherever possible.
- Use `Prev` / `Next` only for same-page guidance where the real click target does not naturally advance. Show `Prev` only when the previous step is on the same page.
- `Next` uses the primary green treatment and `Prev` uses the mint secondary treatment. Tour cards close with an X button in the top-right corner rather than a footer `Dismiss` button.
- Tours use lightweight highlight cards, continuous step numbering, and copy that describes the user's action and outcome. They must not obstruct the control being explained.
- Shared `START HERE` pointers and detailed tour copy are maintained against Jira `PWF-1702`; retain the current-page start convention and the real product layout when changing them.
- Completion hand-offs point to the sidebar setup card and use `Setup updated` until the selected goal is complete.

Add supplier flow:

- The dashboard `Add supplier` CTA starts Step 1 pointing at `Outlets` in the sidenav. Clicking that nav item opens `Freemium/procure-trial-outlet-suppliers.html?tour=2`.
- The trial assumes one outlet, so the flow opens directly in that outlet's `Suppliers` tab.
- The Suppliers tab starts empty and reads the signup `venueName`.
- Search outcomes:
  - Searching `23` shows demo supplier results and continues through `Add to My Supplier`.
  - The matching-results tour step highlights the complete results table rather than the first supplier or its action button. This keeps the choice neutral: the user may select any result that matches their records, and choosing any `Add to My Supplier` action advances the flow.
  - Any other nonblank search shows the no-results path with `Try expanded search` and `Or create new`.
  - Blank search stays on the search page.
- The no-results branch opens a `Create supplier` dialog with the supplier name prefilled from the search term.
- Supplier settings covers order contacts, WhatsApp/SMS behind `More`, order policy/minimum order, delivery-day cutoff, per-row `Apply to all`, and `Save`.
- Saving returns to the outlet Suppliers tab with the new supplier visible, shows a success toast, opens a `Setup updated` handoff pointing at the sidebar card, and passes `supplierAdded=1`.
- `supplierAdded=1` advances setup progress from 20% to 40% and moves the next action to `Build market list`.

Build market list flow:

- The dashboard `Build market list` row shows a real `Add items` CTA once the supplier prerequisite is complete.
- The CTA and sidebar `Next: Build market list` both start Step 1 pointing at `Items` in the sidenav. Clicking it opens `Freemium/procure-trial-items.html?tour=1`.
- The START HERE copy is standardised across Dashboard and same-page starts: `Open Items to build the list your team will order from.`
- `Freemium/procure-trial-items.html` stays locked without `supplierAdded=1`, because items must be linked to a supplier.
- The Items page follows the real product shape: `Purchased` tab, outlet selector, `Search SKU`, and action bar. The outlet selector uses `venueName` or falls back to `Trial Outlet`.
- A fresh trial account starts with an empty Items page (`No items yet`). Item rows should only appear after the user builds the market list through the manual or invoice-assisted flow.
- Step 3 highlights the open `Add` menu as a choice point. Users can choose `Create new` for the manual path or `Add from invoice` for the upload-assisted path.
- Manual item creation follows: `Create new`, supplier selection, then `Freemium/procure-trial-create-sku.html`.
- The Select supplier dialog defaults to `Select supplier`. Step 4 points only at the supplier dropdown; choosing a supplier closes the guidance so the dialog's `Create new` button is clearly visible and users can click the real CTA.
- The manual branch covers item name, UOM/minimum order quantity/price, `Add to Inventory`, inventory list/UOM/par fields, and the fixed footer `Save` action.
- Supplier/my product code fields remain visible but are no longer a dedicated tour stop.
- Once the mandatory item fields are complete, `Add to Inventory` turns on by default, matching the live product. The inventory tour is one step that explains how stock is counted and notes that users can turn `Add to Inventory` off for order-only items.
- Saving returns to Items with a created row, success toast (`added to market list`), and `marketListBuilt=1`.
- `marketListBuilt=1` advances setup progress from 40% to 60%, completes `Build market list`, and moves the sidebar next action to the goal-dependent step:
  - `Order faster`: `Place order`
  - `Digitise invoices`: `Upload invoice`
  - `Manage inventory`: `Set up inventory`
- After save, the return URL includes `marketHandoff=1`; the Items page uses the same tour panel style for the one-time completion handoff, pointing at the sidebar `Get started` card so users know where to continue. Normal later navigation to Items must not replay this handoff.
- If only one item-creation branch has been explored, the completion handoff shows a low-emphasis inline link for the untried path, while the completed dashboard checklist row keeps the secondary CTA on the right. Completed checklist rows show the tick on the left in place of the setup illustration.

Invoice item creation:

- `Add from invoice` is implemented as the alternate build-market-list path from the shared Step 3 `Add` menu choice.
- The invoice branch covers: Items, Add, choose `Add from invoice`, select/upload invoices in one guided step, check the extracted item details in one step, then save reviewed items.
- The upload modal supports a static demo selection of 3 invoice PDFs and simulates upload progress before opening `Freemium/procure-trial-review-invoice-items.html`.
- The review page uses the saved product pattern: invoice preview on the left, extracted item rows on the right, invoice-level `Save` and `Skip for later`, collapsed pending invoices, and a `Save items?` confirmation modal.
- For onboarding, all extracted rows are treated as new or updated market-list items, so the tour skips detailed status education and focuses on checking names, units, prices, and codes.
- The review tour teaches the first invoice only. Once the user saves that first reviewed invoice, the tour gets out of the way; any remaining uploaded invoices open in sequence with the same review UI and no repeated Step 5/Step 6 popovers.
- Confirming save completes only the active invoice. If more uploaded invoices are still pending, the saved invoice collapses into a `Completed` row and the next invoice opens for review; the user stays on the review page until the batch is done.
- After the final pending invoice is saved, the flow returns to Items with `marketListBuilt=1`, `invoiceItemsAdded=1`, and `marketHandoff=1`, appends invoice-created rows, and opens the same one-time 60% completion handoff to the sidebar setup card.
- Per Jira `PWF-1511`, a fuller future branch can add OCR error states, date/supplier editing, and pending-review skip flows.

Invoice digitisation:

- `Freemium/procure-trial-invoices.html` starts with no records. Uploading one or more invoices sets `invoiceUpload=1`, switches to Uploads, and creates a pending row for each file. `View/edit` opens a live-style split digitisation workspace: required invoice fields and line items on the left, uploaded document preview on the right.
- OCR may pre-fill supplier, invoice number, invoice date, and payment terms. Matched products appear as invoice lines, while unmatched products and matched products with a missing order UOM appear together in one `Items require setup` list. If the supplier cannot be matched, line-item editing may remain unavailable until the user selects or creates the supplier. Payment terms remains required even when OCR supplies it.
- Selecting an unmatched-product suggestion immediately adds it as a provisional invoice line using the available OCR name, code, quantity, UOM, price, and tax. The line includes an edit action that opens the SKU form only when the buyer wants to review or change the catalogue details. Removing an unpublished provisional line does not create an orphaned catalogue SKU.
- A missing-UOM suggestion is labelled with the specific next step, such as `Set up carton to add`. Its dialog explains that the invoice uses that unit and asks how much one unit contains before the line is added. Both suggestion types use the same completed treatment after resolution. The older Admin-only behaviour that exposes every possible UOM in the normal line dropdown is not included.
- `Add SKU` appends a blank row, so invoices can contain any number of line items. `Add new` contains Create new SKU, Add custom item, and Add free SKU.
- Manual Create new SKU and the optional edit action reuse the fields from `procure-trial-create-sku.html`: SKU name, supplier/my product codes, UOM, minimum order quantity, price before tax, tax rate, and optional inventory setup. `Add to Inventory` is off by default and its Inventory list/UOM/par fields remain hidden until selected.
- Publishing sets `invoiceDigitise=1`, removes the pending upload, and adds the processed record to Invoices.

Invoice tours:

- Uploading and digitising are separate tours. From the Dashboard checklist or small Get started widget on Dashboard, Create SKU, Items, Orders, Inventory, or Stock count, Step 1 stays on the current page and highlights the Invoices navigation; clicking it carries the tour into the appropriate invoice flow with subsequent step numbers offset correctly. When launched while already on Invoices, Step 1 starts directly at Upload invoice or View/edit.
- **Upload tour:** Upload invoice → choose one or more files in the dropzone → the user clicks Done without an additional explanatory step → `Review your uploads` handoff pointing at the newly added row and explaining that `View/edit` starts digitisation. The first pointer uses device-neutral copy, popover arrows align to their target, and the file-selection pointer sits beside the dropzone so it does not cover the upload controls. Completing the upload updates the sidebar widget immediately from 60% to 80% and changes its next action to `Digitise invoices`. Instructional kickers use the existing `Step N` format only.
- **Digitise tour:** Open the pending invoice with View/edit, then four review areas: (1) check all invoice details and mandatory payment terms, including missing/incorrect OCR matches; (2) review all matched line items; (3) learn that Add SKU/Add new can handle missing items; (4) publish only when the complete invoice is valid. The newer OCR suggestions remain available in the prototype but are outside the guided sequence. Publishing continues to a final `Invoice digitised` handoff pointing at the new processed row instead of ending abruptly. It also updates the sidebar widget immediately to 100%, shows its completion tick, and moves the widget to the first optional `Also try` action.
- When `invoiceUpload=1` is carried into a fresh page load without in-memory uploaded files, the digitise tour creates one pending sample upload so the checklist CTA still has a record to open in this static prototype.

Tour behaviour: the digitise tour is explanatory rather than forcing field-by-field actions; users can dismiss or go back; adding/removing rows does not reset it; it never implies that OCR found every product or that reviewing one row completes the invoice; the Create SKU dialog is outside the guided sequence.

Set up inventory flow:

- `Freemium/procure-trial-inventory.html` has Items and Lists tabs (matching the live Procure Inventory page), each with its own stat cards (Items: Est. value / No. of items / Below PAR; Lists: Est. value / No. of items) and empty states. State (lists + items) persists in `localStorage` under `nomniProcureInventoryStore`, scoped to the browser, not the checklist params. Item records carry `par`/`onHand`/`lastCount`/`lastCountDate`/`movement`/`price`/`supplier`/`tag`, so the stat cards, Below PAR count, and est. value are all computed live from the store rather than hardcoded.
- The page-header `Stock count` split button and `Adjustment/Production` button are hidden whenever the store has zero items (`data-stock-count-wrap` / `data-adjustment-btn`, toggled in `render()`) — there's nothing to count or adjust yet, and showing them over an empty Items tab implied actions that don't make sense until at least one item exists. They reappear automatically as soon as the first item is added, no reload needed.
- Every Items row and Lists row ends in an `Actions` text link (last, right-aligned column, matching the "Add to order"/"View/edit" trailing-link pattern used elsewhere in the trial) that opens a small `Delete` dropdown — this is how a tester returns Inventory to its empty state without clearing `localStorage` by hand. The menu is `position: fixed` and positioned in JS off the toggle button's `getBoundingClientRect()` (flipping to open upward if it would run off the bottom of the viewport), not CSS-anchored to the row, because `.table-card` uses `overflow: hidden` to clip the table's rounded corners — a row-anchored absolute dropdown opening from the last row would get clipped by that. Deleting a list cascade-deletes every item assigned to it (an orphaned item pointing at a deleted list name would otherwise sit in a kind of limbo — visible on the Items tab but uncounted by any list), so deleting all lists (or all items) is enough to get back to the genuine "no lists/no items yet" empty state. Only one row's menu can be open at a time; it also closes on any outside click, on scroll, on resize, and automatically before every `render()` (since `render()` rebuilds the table body and would otherwise leave a stale/detached menu reference).
- Users land on the Items tab. Clicking `Add item` (toolbar or empty-state CTA) or either `Add SKU or recipe` / `Create Group SKU` normally opens the `Select inventory list` modal (`Add to:` dropdown + `Next`). **Exception:** if no inventory lists exist yet (first-time/empty state), it skips that modal — which would otherwise show an empty, useless dropdown — and opens `Create new list` directly instead, since creating a list is the only possible next step anyway.
- The `Select inventory list` modal always shows a persistent `+ Create new list` link next to the dropdown. Clicking it stacks the `Create new list` modal (list name + `Next`) on top; submitting it adds the list, pre-selects it back in the `Add to:` dropdown, and returns to the Select inventory list modal.
- When `Create new list` was opened via the zero-lists shortcut (not via that `+ Create new list` link), submitting it skips returning to `Select inventory list` altogether — there's nothing else to select, so it goes straight into the **Add to list** catalog picker with the just-created list as the active target, same as if the user had picked it from the dropdown and clicked `Next`.
- `Next` opens the real **Add to list** catalog picker (matching the live product): item-name search, `Select Supplier` filter, `Not in Inventory` / `Invoiced in past` filters (decorative), and a checkbox table (Name incl. "In N lists"/Recipe/Sub-recipe tags, Inventory UOM, Conversion rate to order UOM, Par). Checking a row reveals an inline editable Par input. A small static `DEMO_CATALOG` (plain items + recipes + sub-recipes) backs the picker since there's no real catalog behind this prototype. Footer shows "N items selected", a `Save N selected & add more` link that commits without closing, and `Done` which commits and closes.
- `Done` adds the selected items (with their par) to the chosen list in the store, shows a toast ("Inventory Management" / "Products added to the shelve succesfully" — copy matches the live product's typo), and re-renders the Items/Lists tabs.
- The Items tab table now has the full live-product column set: Item/UOM/PAR/On hand/Last count/Movement/Incoming.
- The catalog picker's `Done` action calls `markInventorySetupComplete()`, which sets `inventorySetup=1` into the live `params`/URL (via `history.replaceState`, no reload), then re-syncs the sidebar `Get started` card in place. For `Order faster`, if the first order is already placed, it also stamps `setupComplete=1` so the completed state carries through later navigation. This is threaded through every trial page's param passthrough and marks the dashboard's `Set up inventory` checklist task complete (same pattern as `orderPlaced`), updating goal progress % automatically.
- Follow-up (not yet built): a matching `+ Create new list` shortcut inside `procure-trial-create-sku.html`'s own `Inventory list` field for the non-inventory (Build market list) entry point, and real filtering behavior for `Not in Inventory` / `Invoiced in past`.

Set up inventory guided tour:

- Triggered by `?tour=1` on `procure-trial-inventory.html`, only when the store has no lists and no items yet (returning users with existing data never see it). The tour is fully action-driven — there's no Next/Prev button, each step only advances when the user performs the real action, matching the "guided, but they do it themselves" rule used everywhere else in this trial.
- Step 1 lives on the Dashboard's own pointer (see below), so the on-page tour continues the same sequence rather than restarting at 1: Step 2 highlights `Add item` → user clicks it. Since the guided tour only ever runs on a store with no lists yet, this click always takes the zero-lists shortcut above and opens `Create new list` directly — the `Select inventory list` modal, and its own `+ Create new list` Step 3, never appear during this tour. What follows is numbered Step 3 (name the list, in the `Create new list` modal) → user names it and clicks Next, which — because it was opened via the shortcut — jumps straight into the Add to list catalog modal (no quiet gap waiting on a `Select inventory list` `Next` click). Step 4 highlights the item table → user checks an item → Step 5 highlights `Done` → user clicks it, which completes the tour and shows a brief "Inventory set up" handoff pointer at the sidebar `Get started` card.
- The `createList`/name/pick/done step kickers aren't hardcoded — `nameList`/`pickItems`/`doneStep` compute their `Step N` label from whether the `createList` step actually got shown this run (`sawCreateListStep`), so a returning user who already has a list (and therefore does see the Select inventory list modal's own Step 3) gets a correctly-shifted Step 4/5/6 afterward instead of a repeated "Step 3."
- The `Done` highlight repositions on every checkbox/par toggle while the tour is active, so it stays glued to the button instead of drifting as the user selects more items.
- Step 2's target (`Add item`) only exists in the Items tab markup, but `startTour('inventory')` can fire same-page (no reload) from the sidebar `Get started` card's `Next: Set up inventory` link, whatever tab is currently active — including Lists, if the browser's local `nomniProcureInventoryStore` already has lists from earlier testing even though the URL's `inventorySetup` param says setup isn't done yet. `startTour()`'s default branch now force-activates the Items tab before rendering Step 2, so the popover always has a real button to point at instead of falling back to its default top-left position with no highlight.
- The tour popover self-heals instead of going stale: `placeTour()` and a `refreshTourVisibility()` check (wired into `activateTab()` and every modal's close handler — Select inventory list, Create new list, Add to list catalog, New stock count) hide the whole `[data-tour]` overlay whenever the current step's target isn't actually on screen (zero-size rect or detached), rather than leaving the highlight box and card frozen at the target's last real position. That stale-position bug is why closing the Select/Create list modal mid-step, or switching tabs mid-step, used to leave a popover pointing at whatever unrelated element happened to sit at those same coordinates (eg. a table cell, or the Lists tab's `+ New list` button occupying the same corner as the Items tab's `Add item` button). The tour state (`currentTourStep`/`tourActive`) isn't reset when this happens — the popover reappears correctly once the user gets the real target back on screen (eg. reopening the modal, or switching back to the right tab).
- The completion toast ("Inventory Management" / "Products added to the shelve succesfully") uses the same top-right, `#E2FFE6` slide-down toast convention as every other trial page — not a bottom-center placement.
- Users are never redirected straight to `procure-trial-inventory.html` to start this tour from the Dashboard checklist. The dashboard's existing `dashboardTourMode` "Start from X" pointer system (previously `supplier`/`market`/`order`) gained a 4th `inventory` mode: pointer targets the `Inventory` sidenav link, "Start from Inventory" / "Create your first inventory list and add items to start tracking stock on hand." (no "...in the sidebar" trailer — kept concise). The dashboard checklist's `Set up inventory` CTA opens that Dashboard pointer. Sidebar `Next` actions follow the established current-page rule: if the current trial page has a sidebar target for the next flow, it shows the pointer in place; otherwise its fallback URL points directly to the page that owns the next tour, not back through the Dashboard.
- The Items/Lists tab stat cards sit in a single continuous grey (`#F5F5F5`) strip flush against the tabs row (no gap), not individual bordered cards, matching the live product. Icons are the real product SVGs (`assets/icons/inventory-est-value.svg`, `-no-of-items.svg`, `-below-par.svg`, copied locally from the captured reference), not generic stroke icons.
- The tabs row also carries a POS sync status bar on the right (`Sync is active. Latest update from POS: {date/time} - Sync now`), matching the live product's `.inv-pos-sync-bar` layout. The check icon is an inline SVG (green circle + white checkmark) rather than a new icon-font dependency — the real product uses a bundled Font Awesome `fa-check-circle` glyph, but this repo doesn't load Font Awesome anywhere else, so the shape is replicated locally instead. `Sync now` updates the timestamp to the real current time and shows a toast.

Stock count flow:

- The `START HERE` pointer uses the same copy from every entry page: `Open Inventory to record a stock count.`
- The page header's `Stock count` button is a split button (`Stock count` + caret) opening a small menu: `New stock count` / `Import stock count` (decorative stub).
- The `Complete stock count` checklist CTA uses the same guided-start convention as the other flows: first show the dashboard pointer at `Inventory`; clicking Inventory opens `procure-trial-inventory.html?tour=stockCount`, which points at the real Stock count controls. If the user is already on Inventory, the sidebar `Next` action starts the stock-count pointer in place instead of bouncing them back to the dashboard.
- `New stock count` opens a modal: `Inventory list` dropdown (populated from the store's lists) + `Start stock count` button, disabled until a list is chosen. Starting navigates to the new `Freemium/procure-trial-stock-count.html?list=<name>`.
- That page mirrors the live product: `New stock count: {list}` header, count date/time (real `Date()`, not hardcoded), an item count + `SKU name` search, an `Auto-fill with last count data` shortcut, and a table (Name/Supplier/UOM/Last count/On hand/**Counted Qty** input/Value) sourced from the chosen list's items in the shared store. Value recalculates live per row (`counted qty × item price`) and the footer tracks `Est. value` + `N/M counted`.
- Footer actions: `Cancel` and `Save as draft & exit` return to Inventory without persisting; `Save as draft` is a decorative no-op (shows "Draft saved" inline); `Done` opens the `Update stock count` confirm modal ("The stock levels will be immediately updated upon saving.") → `Save stock count`.
- Saving updates each counted item's `onHand`/`lastCount`/`lastCountDate`/`movement` in the shared store and redirects to `procure-trial-inventory.html?stockCountDone=1`, which shows an "Inventory Management" / "Stock count created successfully" toast.
- `stockCountDone=1` is threaded through every trial page's param passthrough and marks the dashboard's `Complete stock count` checklist task complete, advancing the `Manage inventory` goal to 100% (goal-gated — a no-op for other goals since `stockCount` isn't in their checklist).
- Currency note: this flow uses `A$` throughout for consistency with the rest of the Inventory page's own store-derived values, even though the reference production screenshots for this specific flow show `S$` (different demo region) — an intentional internal-consistency choice over screenshot-literal fidelity on a cosmetic detail.
- Guided tour: kickers are plain `Step X` (no `of N` count, matching the other tours). The Dashboard's "Start from Inventory" pointer is Step 1; the on-page steps on `procure-trial-inventory.html` continue as Step 2 (`Stock count` button) → Step 3 (`New stock count` menu item) → Step 4 (`Inventory list` dropdown, no `placement` override — it defaults to appearing beside the dropdown rather than below it, since `below` used to render the popover directly on top of the `Start stock count` button sitting right underneath in that small modal). Clicking `Start stock count` has no popover of its own (an obvious, single-button click doesn't need one) — the `tour` param carries through to `procure-trial-stock-count.html` in the navigation, not via a dedicated step.
- The tour continues on `procure-trial-stock-count.html` (previously had no tour code at all) as Step 5 (first Counted Qty input — advances once the user types any value) → Step 6 (`Done` button; copy is forward-looking — "Once you've counted everything on the list, click Done to finish up." — not an assertion that counting is already finished, since the tour only requires one row filled in to get there). There's no Step 7 on `Save stock count` in the confirm modal — same reasoning as `Start stock count`, one obvious button doesn't need a popover. Saving still redirects with `tourHandoff=1` when the tour was active, which shows the sidebar "Inventory set up" handoff pointer back on Inventory.

Place order flow:

- The `Order faster` checklist path unlocks `Place order` after `marketListBuilt=1`.
- The dashboard `Create order` CTA starts Step 1 on the dashboard, pointing at `Orders` in the sidenav. The sidebar `Next: Place order` starts the same Step 1 pointer in place on whatever trial page the user is currently viewing; it must not redirect back to the dashboard first.
- After the user opens Orders, the next step highlights the `New order` split button and opens its menu. The first guided path chooses `Order by item`, because it reinforces the market list the user just built.
- `Freemium/procure-trial-new-order-item.html` follows the existing product pattern: full-page create-order shell, market-list item table on the left, supplier-grouped cart on the right, and a fixed cart footer.
- The order-by-item page should reflect what the user added while building the market list: manual `createdSku`/`createdSupplier` values and invoice-created items feed the orderable item list. The cart starts empty and only appears as a supplier-grouped order after the user clicks `Add to order`.
- The guided order-by-item path covers: add an item to order, review/select the newly-created supplier cart group, then place the order.
- `Freemium/procure-trial-new-order-supplier.html` covers the secondary `Order by supplier` path: Orders opens the real-style supplier picker modal first, then a supplier-specific item table with a review modal. It uses the same created supplier and market-list items as the item path; the order starts empty until the user adds an item.
- The Order by supplier branch uses one continuous sequence across pages: Step 1 `Create an order`, Step 2 `Choose the supplier`, Step 3 `Add an item from this supplier`, Step 4 `Review the order`, and Step 5 `Send it to the supplier`.
- Step 3 highlights the visible `Add to order` buttons as one Quantity-column target rather than favouring the first item. Selecting any highlighted action advances the tour.
- The supplier-specific order page shows at least four market-list items in the prototype, retaining any item created earlier in the flow, so the list-level highlight and free item choice are clear during review.
- Placing an order returns to Orders with `orderPlaced=1`, shows a placed order row using the created supplier, marks `Place order` complete on the dashboard, and advances `Order faster` setup progress from 60% to 80%.
- The order branch that was used is tracked separately with `orderByItemDone=1` or `orderBySupplierDone=1`. If one branch is complete and the other is not, the completed checklist row can show a secondary option to try the other path without making it part of checklist completion.
- The return URL also includes `orderHandoff=1`, which opens a short setup-updated tour panel pointing at the sidebar `Get started` card so users know where to continue. When only one order branch has been tried, this handoff also includes a low-emphasis inline link to start the other order path from the Orders page tour.

Checklist "100% done" state (`Procure Trial Dashboard.html`):

- The primary checklist does not show a separate green success banner at 100%; once the selected primary goal reaches 100%, the progress header is replaced by the centred `You're all set` message. Optional "More setup options" tasks do not block this state.
- Once the primary 5-task checklist (`account` + the 4 goal-specific tasks) hits 100%, the primary completed rows collapse behind a `<details>` toggle ("Show completed steps") the first time 100% is reached — still viewable on demand, not hidden for good. While incomplete, this wrapper renders as a plain block with no visible chrome.
- Completed tasks from "More setup options" move into the same "Show completed steps" section after primary completion. Incomplete optional tasks remain in the separate "More setup options" section, which keeps the same heading across states and auto-opens itself the first time the primary checklist hits 100%.
- If every visible optional task is also complete, the "More setup options" section is hidden and all completed rows are combined behind the single "Show completed steps" toggle. `allSetupDone=1` remains a preview shortcut for this fully complete review state.
- Completed rows first show unfinished secondary onboarding paths where they exist, for example `Try adding from invoice`, `Try creating manually`, or `Try ordering by supplier/item`. If no secondary path remains and a relevant article exists, the row shows a low-emphasis `View guide` support-article link. `Create account` does not show a repeat or article action because signup is not repeatable.
- Tasks with secondary paths are still considered complete after one path is finished; the alternate path is optional and does not affect checklist progress.
- The invoice page now sets the Dashboard's existing `invoiceUpload=1` and `invoiceDigitise=1` completion parameters through real prototype actions. `invoiceExport` remains defined in the prototype data but is coded out of the visible "More setup options" list for now.

Sidebar "Get started" widget — tick icon and Next/Also try label:

- The widget shows current progress and a single specific next action. After the primary goal is complete, it switches to an optional `Also try:` action; it hides the action line when nothing remains.

Support links:

- Nomni Procure help collection for restaurants: `https://support.zeemart.co/en/collections/9530788-for-restaurants-nomni-procure`

## Further detail

- **Jira PWF-1702** — guided-tour copy, sequence, and stable review screenshots in `Freemium/assets/tour-screenshots/PWF-1702/`.
- **Jira PWF-1511** — future invoice-review states, including OCR errors and deferred-review handling.

## Open Follow-Ups

- Decide how the demo dashboard works: what data appears, whether it is seeded, and how it differs from the guided trial checklist/dashboard.
- Decide whether the later `Export invoices` extra task remains in scope. It is still defined in prototype data for future wiring, but is currently coded out of the visible "More setup options" list.
