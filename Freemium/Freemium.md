# Freemium Prototype Notes

## Main Objective

Create a freemium entry flow and supporting UX/UI that lets users directly try Nomni Procure, formerly Zeemart.

The start of the flow currently presents two CTAs:

- **Get started** as the primary CTA
- **Book a demo** as the secondary CTA

The `Get started` CTA on the Nomni and Zeemart marketing pages redirects to a Procure-owned entry page: `Freemium/procure-get-started.html`.

That page shows the lead-capture and signup dialog over a heavily blurred Procure dashboard background with a cream-led brand wash. The intent is that the marketing sites only need to own a simple link, while the Procure product owns the lead capture, demo request, signup, onboarding transition, and dashboard handoff.

The first screen captures the user's work email and shows the two path CTAs in the same view.

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
   - Step 2 asks for company registered name, venue name, country, and structured venue address fields.
   - Step 2 includes prototype-only duplicate company validation. Typing `Existing Company Pty Ltd`, `Kind Foods Pte Ltd`, or `Whole Foods Pte Ltd` into the company field and clicking `Continue` shows an inline `company already exists` card (validation runs on Continue, not while typing/on blur).
   - The company-exists card's only action is `Sign in instead`, linking to `https://buyer.zeemart.co/`. There is no `Contact support` option or "if this doesn't look right" copy on this state.
   - While the company-exists error is showing, the `Continue` button is disabled; it re-enables as soon as the user edits the company name field.
   - The entry dialog switches to a scrollable/top-aligned layout while this card is visible (an `is-overflowing` state) so the taller Step 2 content doesn't get clipped or overflow the viewport.
   - Supported prototype countries are Australia and Singapore. The country selector auto-detects Singapore from browser locale/timezone; all other detected countries default to Australia.
   - For Australia, address entry is ordered as postcode, suburb, then state. For Singapore, only postal code is shown after street address and autocomplete is disabled for now.
   - Step 3 asks optional setup questions: primary goal, number of locations, and current ordering method.
   - The primary goal is shown as a stacked list of three selectable rows with large icons: `Order faster`, `Digitise invoices`, and `Manage inventory`. Users can click a row once to select it, or click the selected row again to clear it.
   - Goal row icons use `Freemium/assets/icons/orders.svg`, `Freemium/assets/icons/invoices.svg`, and `Freemium/assets/icons/inventory.svg`.
   - The selected primary goal is stored as `primaryGoal` so the trial dashboard checklist can be personalised around the user's setup priority.
   - Prototype evaluation shortcut: open `Freemium/procure-get-started.html?step=3&prefill=1` to jump straight to Step 3 with harmless sample details. Add `&primaryGoal=Digitise%20invoices` or `&primaryGoal=Manage%20inventory` to preview a selected goal.
   - Finish shows a short `Creating your account` transition, then sends the user to the trial dashboard checklist with `setup=1`, so the onboarding view appears even if the user previously dismissed it.
   - If no primary goal is selected, the dashboard defaults to the `Order faster` checklist.

The current landing-page work is the top-of-funnel UI for this flow. The above-the-fold sections should make the “try Nomni Procure” action feel immediate and low-friction.

## Current Page Recreation Goal

Recreate the above-the-fold sections of two marketing websites for prototyping:

- Nomni Procure landing page
- Zeemart transition/home page

Only the top portion is needed for now. Content below the fold is represented only as a small visual preview/hint where useful.

## Source References

Original saved site captures are in:

- `Freemium/_refs/Nomni - Procure.html`
- `Freemium/_refs/Nomni - Procure_files/`
- `Freemium/_refs/Zeemart.html`
- `Freemium/_refs/Zeemart_files/`

User-provided screenshots used as the strongest visual references:

- `/Users/williamarya/Desktop/Screenshot 2026-07-01 at 12.26.39.png`
  - Nomni Procure hero
  - Cream background, top green announcement bar, centered nav, large left headline, right dashboard mockup, dark green next-section band
- `/Users/williamarya/Desktop/Screenshot 2026-07-01 at 12.26.51.png`
  - Zeemart page
  - Dark green top strip, white nav, large rounded image hero card, “Nomni is the new home of Zeemart” message

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
- `Freemium/procure-trial-orders.html`, `Freemium/procure-trial-inventory.html`, `Freemium/procure-trial-invoices.html` — placeholder pages (empty state only) for the `Place first order` / `Set up inventory` / `Upload first invoice` checklist CTAs.

Generated preview screenshots:

- `Freemium/nomni-procure-top-preview.png`
- `Freemium/zeemart-top-preview.png`

## Current Implementation Notes

Both prototypes are standalone HTML files:

- Inline CSS in `<style>`
- No external JavaScript
- Google Fonts only
- Local assets referenced from `_refs`
- Top-level Freemium pages use the root favicon at `../assets/favicon.svg` so Cloudflare-served `/Freemium/...` URLs show the Nomni tab icon.

Lowercase helper URLs:

- `Freemium/freemium.html` redirects to `Freemium/nomni.html`
- `Freemium/zeemart.html` redirects to `Freemium/Zeemart.html`

Important casing/deploy note:

- GitHub Pages is case-sensitive, so users typing lowercase `Freemium/zeemart.html` will not reach uppercase `Freemium/Zeemart.html` unless a redirect exists.
- GitHub can store both `Zeemart.html` and `zeemart.html`, but a typical macOS checkout is case-insensitive and can confuse or collapse those two paths locally.
- Long-term recommendation: avoid keeping both case variants in the repo. Keep canonical `Freemium/Zeemart.html`, and use a hosting redirect instead.
- If moving to Cloudflare Pages, add a redirect rule or `_redirects` entry:
  - `/freemium.html /Freemium/nomni.html 301`
  - `/Freemium/zeemart.html /Freemium/Zeemart.html 301`
  - `/Freemium/freemium.html /Freemium/nomni.html 301`
- Cloudflare Pages redirect setup has been added in the repo-root `_redirects` file. This assumes the Pages project publishes the repository root as the static output directory, preserving URLs like `/Freemium/nomni.html`.

The shared `Get started` dialog flow lives on `Freemium/procure-get-started.html`:

- Email screen headline: `What's your email address?`
- Email screen body: `Start free, or take a quick look around first.`
- Email screen field: `Work email`
- Email screen CTAs:
  - Primary: `Sign up for FREE`
  - Secondary: `Try the demo account`
- Signup verification:
  - `Sign up for FREE` moves to a verification step before collecting account details.
  - The page shows a delayed email notification toast for the verification code.
  - The toast opens `Freemium/procure-verification-email.html` in a new tab.
  - Mock verification code: `123456`.
- The page reads `?source=nomni` or `?source=zeemart` so the back link can return to the relevant marketing prototype.
- On page load, the blurred Procure dashboard background appears first. The dialog then fades/settles in softly, shows a short `Opening Nomni Procure` transition, and crossfades into the email step. Step changes also animate the dialog height so the card shape does not snap between forms.
- Background treatment uses the actual dashboard pattern rather than the trial setup dashboard. It is intentionally very blurred with a cream-led overlay so it gives product context without competing with the dialog, while making the move from the Nomni marketing page feel less abrupt.
- The page behind the entry dialog is locked; only the dialog card itself scrolls when needed.
- The entry dialog does not show an `X` close button; returning to the marketing site is reserved for explicit confirmation states.
- CTA and form label weights are semibold to reduce visual heaviness.
- Dialog width: `540px` max on desktop.
- Trial dashboard and onboarding behaviour is documented in `Trial Onboarding Current Behaviour` below.
- Demo confirmation:
  - `Check your inbox`
  - Private demo link sent to the captured email, expiring in 14 days.
  - Animated email notification appears after a small delay on the confirmation state.
  - Notification uses a red email icon so it is easier to notice.
  - Notification opens the demo email mockup in a new tab.
- Duplicate demo request state:
  - Triggered when the page has a prefilled `?email=...` value and the user clicks `Try the demo account` while that same email is still in the field.
  - Heading: `Demo already requested`
  - Body tells the user a private demo link has already been sent to that email.
  - Primary action: `Speak to Nomni's team`, linking to `https://www.nomni.ai/lets-chat`.
  - Secondary action: `Use another email`, returning to the email step.
- Demo email:
  - Subject-style page: `Your private Nomni Procure demo link`.
  - Main CTA opens the demo account dashboard.
- Demo dashboard:
  - Uses sample Procure dashboard data.
  - Topbar includes `Demo link expires in 14 days`.
  - Topbar CTAs: `Start my FREE trial` and `Book a demo`.
  - `Start my FREE trial` links back to `procure-get-started.html?source=demo&email=...` when an email is available.
- Email validation is enabled on the first email screen, the verification step checks for the mock 6-digit code, and Step 1 validates the password rule. The venue details step also uses required fields so the trial dashboard can receive meaningful venue context.
- Signup Step 1:
  - A compact 3-part visual stepper appears above the title: 1 Account, 2 Venue, 3 Business.
  - No helper/body text below the title.
  - First name
  - Last name
  - Create password
  - Password field includes an inline eye icon toggle to show or hide the password.
- Signup Step 2:
  - The stepper marks Account complete and Venue current.
  - Heading: `Add your venue details`
  - No helper/body text below the title.
  - Company registered name
  - Venue name
  - Country
  - Street address
  - Postcode
  - Suburb, only when Australia is selected
  - Australian state, only when Australia is selected
- Address autocomplete note:
  - Suburb lookup is wired into the static prototype using a trimmed Matthew Proctor Australian Postcodes CSV at `Freemium/assets/australian_postcodes.csv`.
  - The CSV keeps only `locality`, `state`, and `postcode`; selecting a suburb or postcode suggestion fills the matching postcode, suburb, and state.
  - Search matches suburb, state, and postcode together, so entries like `Armadale`, `Armadale VIC`, and `Armadale 3143` can return the same result.
  - Postcode search is also wired to the same CSV so users can type a postcode first and choose the matching locality.
  - Postcode/suburb suggestions float over the dialog instead of expanding the dialog height, so longer match lists do not make Step 2 scroll.
  - The state and postcode fields remain editable because this is locality lookup, not full address validation.
  - Singapore currently uses a plain postal code field with no autocomplete.
  - If the CSV cannot load, the prototype falls back to a small demo suburb list.
  - Browser autofill can still help through standard autocomplete attributes.
  - Public OpenStreetMap/Nominatim is not suitable for production autocomplete because its public usage policy forbids autocomplete-style use.
  - Google Places and Mapbox are better production candidates, but both require reviewing billing/free-tier limits.
- Signup Step 3 optional questions:
  - The stepper marks Account and Venue complete, with Business current.
  - Heading: `Tell us about your business`
  - Body: `A few quick details to help us understand your business.`
  - Primary goal
  - Number of locations
  - Current ordering method
- Finish transition:
  - Heading: `Creating your account`
  - Body: `Setting up Nomni Procure for your venue.`
  - Redirects to `Freemium/Procure Trial Dashboard.html` after a short loading state.
  - Carries the entered email, first/last name, and venue name into the trial dashboard URL so the dashboard can personalize the topbar user and setup panel.
- Dialog padding: `36px` on desktop, reduced slightly on mobile.
- The signup flow includes handoff inspectors in the top-right corner:
  - `Aa` enables hover inspection for font size/token, font weight, colour, and font family.
  - `Box` enables hover inspection for dimensions, padding, margin, corner radius, border, background, display/gap, positioning, and box sizing.
  - Clicking while an inspector is active pins the tooltip; pressing `Escape` clears inspector mode.

The prototypes were initially too large, like the browser was zoomed to roughly 125%. We adjusted:

- Desktop typography down by roughly 15-20%
- Zeemart nav font specifically to `16px`
- Desktop max-widths:
  - Nomni nav and hero: `1200px`
  - Zeemart hero card: `1200px`
  - Zeemart strip/nav/below content: `1360px`

## Nomni Procure Page

Current key visual structure:

- Top green announcement bar
- Cream navigation bar using the Nomni SVG logo from `_refs/Nomni - Procure_files/YrWX4pL0xkRKmYWVXyVDn3E.svg`
- Left hero copy:
  - “Daily ordering & inventory simplified.”
  - `simplified.` uses italic Fraunces-style display treatment
  - Four green check bullets
- Hero CTA row:
  - Primary CTA: `Get started →`
    - Links to `procure-get-started.html?source=nomni`
  - Secondary CTA: `Book a demo`
    - Links to `https://www.nomni.ai/lets-chat`
- Header CTA:
  - `Let's Chat` links to `https://www.nomni.ai/lets-chat`
- Right hero image uses dashboard mockup:
  - `_refs/Nomni - Procure_files/8Qo0RnAz08WIcl17DKFpocOrvY.png`
- Floating status cards:
  - `ORDER # PO-2407381900`
  - `Placed`
  - `Received`
  - `Invoiced`
- Dark green band below the fold with small chat pill.

## Zeemart Page

Current key visual structure:

- Dark green top strip:
  - “Nomni is the new home of Zeemart.”
  - Right CTA: “Visit Nomni to learn more →”
- White nav:
  - Zeemart wordmark approximated with text/icon
  - Nav links: Restaurants, Suppliers, Pricing, News, Support
  - `Get started` green filled button
    - Replaces the previous `Get in touch` button
    - Links to `procure-get-started.html?source=zeemart`
- Large rounded hero card on grey background:
  - Text overlay: “Nomni is the new home of Zeemart”
  - Switch pill: `Zeemart → Now Nomni`
  - CTAs: “Your questions answered” and “Explore Nomni.ai →”
- Uses closest available local cafe/interior hero image:
  - `_refs/Zeemart_files/taH1mkIbIe7ar657hVcmi9O2E.png`

Note: the exact Zeemart screenshot hero photo was not found among downloaded reference assets. The current asset is the closest available local match.

## Trial Onboarding Current Behaviour

`Freemium/Procure Trial Dashboard.html` is the destination after the user finishes the free signup flow.

Dashboard states:

- First visit, or `?setup=1`, shows the onboarding checklist.
- `Go to dashboard` dismisses onboarding and stores the choice in `localStorage` under `nomniProcureSetupDismissed`.
- After dismissal, Dashboard shows the regular empty trial dashboard with zero-value cards and empty spending sections.
- The persistent sidebar `Get started` card reopens the onboarding checklist with `?setup=1`.

Trial app chrome:

- Topbar shows `Trial ends in 14 days`, `Book setup`, and the trial user.
- Sidebar includes the Procure nav, the `Get started` card directly below `News`, and the lower-left Intercom-style launcher.
- The sidebar card shows current setup progress, a progress bar, and one recommended next action. The card body returns to the checklist; only the next-action text starts the active guided flow.
- Signup details travel through URL params. Trial pages use the captured user name and `venueName`; direct file previews fall back to `Trial user` and `Trial Outlet`.
- Orders, Invoices, Items, and Inventory nav links point to the trial placeholder/live pages instead of `#`.

Checklist logic:

- `Create account` is complete for every trial, so progress starts at 20%.
- Goal-dependent primary paths:
  - `Order faster`: Add first supplier, Build market list, Place first order, Set up inventory.
  - `Digitise invoices`: Add first supplier, Build market list, Upload first invoice, Digitise invoices.
  - `Manage inventory`: Add first supplier, Build market list, Set up inventory, Complete first stock count.
- `Add first supplier` is required before `Build market list`.
- `Build market list` is required before `order`, `inventory`, and `invoiceUpload`.
- Checklist row unlocking uses each task's `dependsOn` field, not strict list position. After the market list is built, `Create order`, `Set up inventory`, and `Upload invoice` all unlock with real CTA buttons.
- Chained tasks keep real prerequisites: `invoiceDigitise` depends on `invoiceUpload`, `invoiceExport` depends on `invoiceDigitise`, and `stockCount` depends on `inventory`.
- The sidebar still recommends exactly one next action based on the selected goal, even when several checklist actions are unlocked.

Guided-tour standards:

- Copy should sound like helpful product onboarding, not prototype or implementation notes.
- Avoid technical/internal wording such as `SKU manually`, `OCR-assisted path`, `create form`, or copy that explains wiring.
- Lead with the user's job: add items the team orders, link them to the right supplier, set buying details, decide whether to count them in inventory, then save.
- Users should advance by clicking highlighted product controls wherever possible.
- Use `Prev` / `Next` only for same-page guidance where the real click target does not naturally advance. Show `Prev` only when the previous step is on the same page.
- `Next` uses the primary green treatment; `Prev` uses the mint secondary treatment; `Dismiss` uses the tertiary grey treatment.
- Popovers must not cover the control users need to click. Tour placement measures the rendered popover height and keeps arrows aligned, with adaptive clamping near viewport edges.
- The tour uses lightweight highlight rings/cards without a full-page dark overlay, except where the underlying product control is a modal.

Add supplier flow:

- The dashboard `Add supplier` CTA starts Step 1 pointing at `Outlets` in the sidenav. Clicking that nav item opens `Freemium/procure-trial-outlet-suppliers.html?tour=2`.
- The trial assumes one outlet, so the flow opens directly in that outlet's `Suppliers` tab.
- The Suppliers tab starts empty and reads the signup `venueName`.
- Search outcomes:
  - Searching `23` shows demo supplier results and continues through `Add to My Supplier`.
  - Any other nonblank search shows the no-results path with `Try expanded search` and `Or create new`.
  - Blank search stays on the search page.
- The no-results branch opens a `Create supplier` dialog with the supplier name prefilled from the search term.
- Supplier settings covers order contacts, WhatsApp/SMS behind `More`, order policy/minimum order, delivery-day cutoff, per-row `Apply to all`, and `Save`.
- Saving returns to the outlet Suppliers tab with the new supplier visible, shows a success toast, opens a `Setup updated` handoff pointing at the sidebar card, and passes `supplierAdded=1`.
- `supplierAdded=1` advances setup progress from 20% to 40% and moves the next action to `Build market list`.

Build market list flow:

- The dashboard `Build market list` row shows a real `Add items` CTA once the supplier prerequisite is complete.
- The CTA and sidebar `Next • Build market list` both start Step 1 pointing at `Items` in the sidenav. Clicking it opens `Freemium/procure-trial-items.html?tour=1`.
- `Freemium/procure-trial-items.html` stays locked without `supplierAdded=1`, because items must be linked to a supplier.
- The Items page follows the real product shape: `Purchased` tab, outlet selector, `Search SKU`, table rows, and action bar. The outlet selector uses `venueName` or falls back to `Trial Outlet`.
- Step 3 highlights the open `Add` menu as a choice point. Users can choose `Create new` for the manual path or `Add from invoice` for the upload-assisted path.
- Manual item creation follows: `Create new`, supplier selection, then `Freemium/procure-trial-create-sku.html`.
- The Select supplier dialog defaults to `Select supplier`. Choosing a supplier keeps users on Step 4 and moves the highlight to the dialog's `Create new` button, so users still click the real CTA without adding another numbered step.
- The manual branch covers item name, UOM/minimum order quantity/price, optional `Add to Inventory`, inventory list/UOM/par fields, and the fixed footer `Save` action.
- Supplier/my product code fields remain visible but are no longer a dedicated tour stop.
- Inventory list/UOM/par fields stay visible but disabled until `Add to Inventory` is selected; selecting it enables those fields and advances the guidance.
- Saving returns to Items with a created row, success toast (`added to market list`), and `marketListBuilt=1`.
- `marketListBuilt=1` advances setup progress from 40% to 60%, completes `Build market list`, and moves the sidebar next action to the goal-dependent step:
  - `Order faster`: `Place first order`
  - `Digitise invoices`: `Upload first invoice`
  - `Manage inventory`: `Set up inventory`
- After save, the Items page uses the same tour panel style for the completion handoff, pointing at the sidebar `Get started` card so users know where to continue.

Invoice item creation:

- `Add from invoice` is implemented as the alternate build-market-list path from the shared Step 3 `Add` menu choice.
- The invoice branch covers: Items, Add, choose `Add from invoice`, select/upload invoices in one guided step, review split view, check extracted rows, save reviewed items, confirm save.
- The upload modal supports a static demo selection of 3 invoice PDFs and simulates upload progress before opening `Freemium/procure-trial-review-invoice-items.html`.
- The review page uses the saved product pattern: invoice preview on the left, extracted item rows on the right, invoice-level `Save` and `Skip for later`, collapsed pending invoices, and a `Save items?` confirmation modal.
- For onboarding, all extracted rows are treated as new or updated market-list items, so the tour skips detailed status education and focuses on checking names, units, prices, and codes.
- Confirming save returns to Items with `marketListBuilt=1` and `invoiceItemsAdded=1`, shows `4 items created or updated`, appends invoice-created rows, and opens the same 60% completion handoff to the sidebar setup card.
- Per Jira `PWF-1511`, a fuller future branch can add multi-invoice review handling, OCR error states, date/supplier editing, and pending-review skip flows.

Placeholder pages:

- `Freemium/procure-trial-orders.html`, `Freemium/procure-trial-inventory.html`, and `Freemium/procure-trial-invoices.html` are empty-state pages for the unlocked `Create order`, `Set up inventory`, and `Upload invoice` CTAs.

Support links:

- Navigating Nomni Procure app: `https://support.zeemart.co/en/articles/9418174-navigating-the-nomni-procure-app`
- Nomni Procure help collection: `https://support.zeemart.co/en/collections/9530788-for-restaurants-nomni-procure`

## Verification

Chrome headless was used to regenerate previews at:

- Nomni: `2048x1117`
- Zeemart: `2048x1123`

HTML parsing and local image reference checks were run during development.

## Open Follow-Ups

- Define what “demo access” includes inside the stripped-down Nomni Procure prototype.
- Decide which exact support article should be the primary support link.
- If an exact Zeemart hero photo asset is provided, swap it into the hero card background.
- The Zeemart logo is currently approximated in text; replace with exact SVG/PNG if available.
- Continue keeping this document updated as visual or content changes are made.
