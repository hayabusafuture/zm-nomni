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
- Self-registered users receive the credential-free lifecycle welcome email in `SendGrid - Welcome - Freemium.html`. It confirms that the account is ready, links to desktop and mobile login options, and presents the four onboarding actions without repeating a username or generated password.
- `SendGrid - Trial - Personal Welcome - Paran.html` is a separate human follow-up from Paranthaman Chinniah (Paran), Director of Customer Success. It introduces the Customer Success contact, points the user back to the setup checklist, and invites a direct reply to `paran@nomni.ai`; it does not replace the automated account-ready welcome email.
- Trial lifecycle email prototypes use the same credential-free SendGrid visual system:
  - `SendGrid - Trial - Setup Reminder.html` is sent when setup remains incomplete and opens the Dashboard onboarding checklist.
  - `SendGrid - Trial - Ending Soon.html` is sent three days before the account's current trial end date when setup remains incomplete, and offers setup continuation or a live demo.
  - `SendGrid - Trial - Ending Soon - Setup Complete.html` is sent three days before the current trial end date when all onboarding tasks are complete. It acknowledges completion and offers a route to discuss continuing with Nomni Procure or reopen the product.
  - `SendGrid - Trial - Ended.html` is sent after the current trial end date and offers a route to continue or request an extension.
  - `SendGrid - Trial - Extended.html` is sent when an extension is granted, confirms the new end date, and returns the user to their existing setup progress.
  - `SendGrid - Trial - Extended - Personal.html` is an alternative extension confirmation written as a direct note from the team member who granted the extension. It uses the recipient's first name and the sender's name and job title, and encourages a direct reply.
- Trial timing must use the account's current trial end date. If the trial is extended, any pending ending-soon or ended message based on the former date must be cancelled and rescheduled; the welcome and setup sequence must not restart.
- All email CTAs that invite the user to continue or resume setup must open the Dashboard with the onboarding checklist visible. SendGrid supplies this destination as `dashboardChecklistUrl`; emails must not deep-link directly into an individual setup task or tour.
   - If no primary goal is selected, the dashboard defaults to the `Order faster` checklist.

## Source References

Primary visual references are:

- `Freemium/_refs/Nomni - Procure.html`
- `Freemium/_refs/Nomni - Procure_files/`
- `Freemium/_refs/Zeemart.html`
- `Freemium/_refs/Zeemart_files/`
- the current Freemium prototype HTML files in this folder

## Prototype Files

- **Marketing:** `nomni.html` and `Zeemart.html`; `freemium.html` and `zeemart.html` are compatibility redirects.
- **Entry and email:** `procure-get-started.html`, `procure-verification-email.html`, `procure-demo-email.html`, and `../SendGrid - Welcome - Freemium.html`.
- **Trial:** `Procure Trial Dashboard.html` and the `procure-trial-*.html` pages. The compatibility `procure-trial-add-supplier.html` redirects to `procure-trial-outlet-suppliers.html`.
- **Demo:** `procure-demo-dashboard.html`, which hands off to the corresponding `?demo=1` product pages.

## Demo Account Current Behaviour

`Freemium/procure-demo-dashboard.html` is the destination from the private demo email. It is a seeded, freely explorable Procure account with restricted mutations—not a guided trial or onboarding checklist.

[`Demo Dashboard.md`](Demo%20Dashboard.md) is the source of truth for demo scope, safety rules, section capabilities, hidden controls, sample data, planned work, and change history. Keep it updated when the demo changes.

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

- Trial-page topbars show an interactive `Trial ends in 14 days` countdown, the real-site `Help` link, and the trial user. On the Trial Dashboard, clicking the trial user opens the account menu with icons for Supply, settings, password, companies, language, legal links, privacy, and logout. The countdown opens a conversion/support popover on hover, click, or keyboard focus, with `Book a live demo` and `Chat with us` actions; this replaces the former separate adjacent demo link across the trial prototype. The demo action follows the standard primary-button hover treatment across every trial page: dark seaweed background and border with green text.
- Trial Dashboard page-first prototype: its `Book a live demo` actions now open an in-product two-step request dialog instead of leaving for the Nomni contact page. Step 1 asks for preferred contact method, contact details, and timing. Step 2 asks the user to confirm `locations`, choose one or more current ordering methods (prefilled from `orderingNow` when available), and add optional questions. Primary goal is not repeated in this dialog. The current signup handoff only carries `primaryGoal` and `email`; if this treatment is approved for the full flow, `locations` and `orderingNow` must also be added to the signup/dashboard parameter handoff.
- The same two-step `Book a live demo` request dialog is now used by the countdown popover across every authenticated `procure-trial-*` page. These in-product trial buttons no longer link to `nomni.ai/lets-chat`. Marketing-page CTAs and the mock email remain external links because they sit outside the authenticated trial product.
- After a live-demo request is submitted, the trial conversion popover shows `Demo requested on D Mon YYYY` beneath its explanatory copy. The date is stored locally and remains visible across authenticated trial pages and browser refreshes, providing confirmation because no email or SMS acknowledgement is sent.
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
- When the Suppliers tab is empty, concise guidance leads to a repeated `Add new` button inside the empty state; the toolbar `Add new` remains available too.
- The Suppliers tab starts empty and reads the signup `venueName`.
- Search outcomes:
  - Searching `23` shows demo supplier results and continues through `Add to My Supplier`.
  - The matching-results tour step highlights the complete results table rather than the first supplier or its action button. This keeps the choice neutral: the user may select any result that matches their records, and choosing any `Add to My Supplier` action advances the flow.
  - Any other nonblank search shows the no-results path with `Try expanded search` and `Or create new`.
  - Blank search stays on the search page.
- The no-results branch opens a `Create supplier` dialog with the supplier name prefilled from the search term.
- Supplier settings covers order contacts, WhatsApp/SMS behind `More`, order policy/minimum order, delivery-day cutoff, per-row `Apply to all`, and `Save`. When the cutoff is unknown, helper text suggests a cautious temporary default of two days earlier at 12:00 PM and explains that it can be updated later. The helper uses the same cream treatment as the setup banner above.
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
- `ocrFallback=1` is a separate comparison variation for a failed supplier match. The invoice header remains visible, while the line-item area is faded and unavailable until the supplier, invoice number, invoice date and payment terms are entered. Step 2 links to the existing Add supplier flow in a new tab and tells the user to return and select `Refresh pre-filled data`, which checks the invoice again using the newly available supplier and continues at unmatched-item review. For direct comparison, `supplierResolved=1` opens the already-refreshed state.
- OCR may pre-fill supplier, invoice number, invoice date, and payment terms. Matched products appear as invoice lines, while unmatched products and matched products with a missing order UOM appear together in one `Items require setup` list. If the supplier cannot be matched, line-item editing may remain unavailable until the user selects or creates the supplier. Payment terms remains required even when OCR supplies it. For Jira PWF-1608, selecting `Custom…` as the payment term reveals a required native due-date picker; switching to another term hides and clears it, while publishing a custom-term invoice uses the selected date in the Invoices table's Due column.
- Selecting an unmatched-product suggestion immediately adds it as a provisional invoice line using the available OCR name, code, quantity, UOM, price, and tax. The line includes an edit action that opens the SKU form only when the buyer wants to review or change the catalogue details. Removing an unpublished provisional line does not create an orphaned catalogue SKU.
- All suggestions use the same `Add to invoice` action. When an item's order UOM is missing, its dialog explains why extra information is needed — for example, `Before we can add 5 cartons of Envy USA Apple to this invoice, tell us how many kilograms are in one carton.` A resolved suggestion is removed from the list; when none remain, the whole section disappears. The older Admin-only behaviour that exposes every possible UOM in the normal line dropdown is not included.
- The conversion dialog also offers `Flip units`, so buyers can enter either direction — for example, cartons per kilogram instead of kilograms per carton. The prototype converts either entry to the same saved conversion.
- Until the invoice is published, a line created through the missing-UOM path uses the same edit icon as a provisional SKU line. Its icon reopens the conversion dialog, while a provisional SKU's icon opens the SKU form. Buyers can correct that invoice-specific value in the same dialog; publishing exits the workspace, so the conversion is no longer editable in this flow.
- `Add SKU` appends a blank row, so invoices can contain any number of line items. `Add new` contains Create new SKU, Add custom item, and Add free SKU.
- Every invoice line has a left-side drag handle for reordering and an adjacent delete action. Reordering changes only the line-item display order and does not affect invoice totals.
- Manual Create new SKU and the optional edit action reuse the fields from `procure-trial-create-sku.html`: SKU name, supplier/my product codes, UOM, minimum order quantity, price before tax, tax rate, and optional inventory setup. `Add to Inventory` is off by default and its Inventory list/UOM/par fields remain hidden until selected.
- The workspace has a sticky bottom footer with the live invoice total and `Publish invoice` action. Extra bottom padding keeps the final line items visible above it.
- Publishing sets `invoiceDigitise=1`, removes the pending upload, and adds the processed record to Invoices.

Invoice tours:

- Uploading and digitising are separate tours. From the Dashboard checklist or small Get started widget on Dashboard, Create SKU, Items, Orders, Inventory, or Stock count, Step 1 stays on the current page and highlights the Invoices navigation; clicking it carries the tour into the appropriate invoice flow with subsequent step numbers offset correctly. When launched while already on Invoices, Step 1 starts directly at Upload invoice or View/edit.
- **Upload tour:** Upload invoice → choose one or more files in the dropzone → the user clicks Done without an additional explanatory step → `Review your uploads` handoff pointing at the newly added row and explaining that `View/edit` starts digitisation. The first pointer uses device-neutral copy, popover arrows align to their target, and the file-selection pointer sits beside the dropzone so it does not cover the upload controls. Completing the upload updates the sidebar widget immediately from 60% to 80% and changes its next action to `Digitise invoices`. Instructional kickers use the existing `Step N` format only.
- **Digitise tour:** Open the pending invoice with View/edit, then four review areas: (1) check all invoice details and mandatory payment terms, including missing/incorrect OCR matches; (2) review all matched line items; (3) learn that Add SKU/Add new can handle missing items; (4) publish only when the complete invoice is valid. The newer OCR suggestions remain available in the prototype but are outside the guided sequence. Publishing continues to a final `Invoice digitised` handoff pointing at the new processed row instead of ending abruptly. It also updates the sidebar widget immediately to 100%, shows its completion tick, and moves the widget to the first optional `Also try` action.
- When `invoiceUpload=1` is carried into a fresh page load without in-memory uploaded files, the digitise tour creates one pending sample upload so the checklist CTA still has a record to open in this static prototype.

Tour behaviour: the digitise tour is explanatory rather than forcing field-by-field actions; users can dismiss or go back; adding/removing rows does not reset it; it never implies that OCR found every product or that reviewing one row completes the invoice; the Create SKU dialog is outside the guided sequence.

Set up inventory flow:

- `Freemium/procure-trial-inventory.html` provides Items, Lists, and Activity views with live summary metrics and empty states. The header also shows the active POS sync status, latest update time, and a `Sync now` action. Users can create or select an inventory list, choose catalogue items, set PAR values, and save them to the list.
- Each item row's `Actions` menu mirrors the live-product options: `Add stock adjustment`, `Edit settings`, `Change list`, and `Delete`. The first three provide prototype feedback; `Delete` retains its existing local-store behaviour.
- On a first visit, creating a list is the direct next step; otherwise users choose a list before adding items. Inventory actions become available once items exist, and users can delete items or lists to return to an empty state.
- Saving selected items updates the trial checklist's `Set up inventory` task and the sidebar recommendation. The prototype uses static catalogue data; the extra catalogue filters remain visual-only.

Set up inventory guided tour:

- The guided path starts from the Dashboard's Inventory navigation pointer, then has users create a list, choose items, and save them through the real controls. It appears only for a first-time empty inventory and ends with an Inventory setup hand-off to the sidebar `Get started` card.
- As with other trial tours, the flow is action-driven and keeps the user on their current page until they select the highlighted product navigation.

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
- Alternative order paths carry an explicit replay state, allowing the Order by item branch-selection tour to open after another order branch has already marked Place order complete.
- The invoice page now sets the Dashboard's existing `invoiceUpload=1` and `invoiceDigitise=1` completion parameters through real prototype actions. `invoiceExport` remains defined in the prototype data but is coded out of the visible "More setup options" list for now.

Sidebar "Get started" widget — tick icon and Next/Also try label:

- The widget shows current progress and a single specific next action. After the primary goal is complete, it switches to an optional `Also try:` action; it hides the action line when nothing remains.

Support links:

- Nomni Procure help collection for restaurants: `https://support.zeemart.co/en/collections/9530788-for-restaurants-nomni-procure`

Demo Outlets:

- The Outlets page opens on a production-aligned Details tab based on the saved real page.
- Company, outlet name, address, logo, outlet email and subscription data are populated with read-only sample content.
- Billing management, logo upload and saving outlet changes are unavailable in the demo; their production-style controls remain visible but inactive.

## Further detail

- **Jira PWF-1702** — guided-tour copy, sequence, and stable review screenshots in `Freemium/assets/tour-screenshots/PWF-1702/`.
- **Jira PWF-1511** — future invoice-review states, including OCR errors and deferred-review handling.

## Open Follow-Ups

- Decide how the demo dashboard works: what data appears, whether it is seeded, and how it differs from the guided trial checklist/dashboard.
- Decide whether the later `Export invoices` extra task remains in scope. It is still defined in prototype data for future wiring, but is currently coded out of the visible "More setup options" list.
