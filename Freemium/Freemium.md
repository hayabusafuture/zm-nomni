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
- `Freemium/procure-trial-items.html` — placeholder Items page, empty state only, linked from the `Items` sidenav entry and the checklist's `Add items` CTA.

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
- Cloudflare Pages would help with routing/case redirects and potentially faster/more reliable preview deploys, but it does not fix this Codex sandbox's local `.git/index.lock` write limitation.

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
- Trial dashboard checklist personalisation:
  - `Create account` is shown as completed Step 1 for every checklist, so users start at 20% progress.
  - `Order faster`: Add first supplier, Build market list, Place first order, Set up inventory.
  - `Digitise invoices`: Add first supplier, Build market list, Upload first invoice, Digitise invoices.
  - `Manage inventory`: Add first supplier, Build market list, Set up inventory, Complete first stock count.
  - Add first supplier and Build market list are mandatory prerequisites before later setup options unlock.
  - Other useful setup actions remain visible in a collapsed `More setup options` section, but do not count toward onboarding progress.
  - The sidebar setup entry is a white elevated card below the nav list, leaving the lower-left corner free for the Intercom launcher. It uses relaxed internal spacing and shows `Get started` and `20% done` on the same row, followed by a small progress bar and `Next • Add first supplier`, with `Next` highlighted in green.
  - The same sidebar setup card appears throughout the supplier onboarding pages. The card body returns to the onboarding dashboard, while only the next action name starts the guided action. For the current prototype, clicking `Add first supplier` keeps the user on the current page and opens Step 1 of the supplier tour in place, pointing at the Outlets nav item. Clicking Outlets then continues to the supplier setup flow.
  - Checklist rows use full-colour task icons from `Freemium/assets/icons/*.svg`.
  - The checklist panel uses a compact header: `Get started with just a few steps` is set in Hanken Grotesk and sits beside a small thick-stroke circular progress indicator and separate `20% done` text, so the first checklist item appears higher on the page without a wide progress strip above it.
  - Add supplier guided flow now supports two search outcomes:
    - Searching `23` shows the demo results table and continues through `Add to My Supplier`.
    - Searching any other typed value shows a `No results` empty state with `Try expanded search` and `Or create new`.
    - Blank search no longer routes to results; it stays on the search page.
  - The no-results branch opens a `Create supplier` dialog. The supplier name is prefilled from the search term, and `Continue to Supplier settings` stays enabled once a name is present so the prototype remains easy to evaluate.
  - Step 4 on the no-results branch keeps the page scrollable while the tour is active and deliberately anchors the tour above the `Or create new` button.
  - Supplier settings now follows the real setup sequence: order contact details, order & delivery policy, one delivery-day cutoff, `Apply to all`, then `Save`.
  - In supplier settings, clicking `More` below WhatsApp reveals an SMS phone field. The field stays visible and there is no collapse control, matching the current product behaviour.
  - The guided popover on supplier settings uses explicit `Prev` / `Next` controls for same-page steps; typing into fields no longer advances the tour automatically.
  - Supplier settings tour highlights use tighter inner targets for the minimum-order controls and delivery-day table, so the overlay does not wrap empty card padding.
  - Each delivery day row has its own `Apply to all` action. The action becomes available once that row has a selected day, day(s)-earlier value, and cutoff time, then copies that row's cutoff to all days.
  - The supplier is only considered added after the user saves supplier settings. Saving returns to the outlet Suppliers tab with the newly added supplier visible, and `supplierAdded=1` lets the trial dashboard advance the checklist from 20% to 40% done.
  - Tour `Dismiss` controls use a filled secondary-button treatment rather than appearing as plain text.
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

Trial dashboard / onboarding behavior:

- `Freemium/Procure Trial Dashboard.html` now behaves as the trial dashboard route with two states:
  - First visit, or `?setup=1`, shows the onboarding checklist.
  - Clicking `Go to dashboard` explicitly dismisses onboarding and stores that choice in `localStorage` under `nomniProcureSetupDismissed`.
  - After dismissal, clicking Dashboard shows the regular dashboard layout instead of the onboarding checklist.
  - The dismissed dashboard mirrors the existing Procure dashboard structure, with the standard greeting, order metric cards, spending overview, and top expenditures sections, but all values are zero/empty because the trial account has no setup data yet.
  - The persistent setup card in the sidebar opens the onboarding checklist again with `?setup=1`.
- Trial support controls are now part of the persistent app chrome:
  - Topbar pill: `Trial ends in 14 days`
  - Topbar CTA: `Book setup`
  - Sidebar card: white elevated card below the nav list, showing `Get started`, `20% done`, progress bar, and `Next • [next checklist step]`, while keeping the bottom-left Intercom area free. The card body links back to the onboarding dashboard; only the next action name links directly to the guided prototype flow.
  - The sidebar also includes a 48×48 px Intercom-style chat launcher in the lower-left corner to match the real Procure shell.
  - These controls also appear in the split supplier setup pages so trial users can see trial status and reopen setup while moving through the guided flow.
- The setup checklist is sequential:
  - Step 2: Add your first supplier
  - Step 3: Build a starter product list, locked until supplier setup
  - Step 4: Place your first order, locked until products exist
  - Step 5: Set up inventory, locked until products exist

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

## Trial Dashboard Placeholder

`Freemium/Procure Trial Dashboard.html` is the destination after the user finishes the free signup flow.

Current role:

- Uses a Procure-style app shell with topbar, sidebar, and dashboard content.
- Uses the real Procure sidebar menu and icon assets, excluding `Payments`.
- Shows onboarding/setup content instead of live metrics.
- Centers the setup panel with a constrained max width, a large gently animated wave mark above the `Welcome to Nomni Procure!` headline, and a soft staggered load-in for the welcome content. The `Get started with just a few steps` checklist panel slides up subtly on page load.
- Reads signup details from URL params when available:
  - Topbar user name and avatar initials use the entered name.
  - Setup panel keeps the generic `Get started with just a few steps` title so the progress header stays compact.
- Uses a soft cream/mint patterned background treatment and a floating panel surface for the setup section.
- Keeps trial guidance inside the setup panel rather than scattering it through the topbar and sidebar. The topbar and sidenav stay focused on normal app navigation.
- Shows trial status and guided setup help as compact cards above the setup progress.
- Shows account setup progress inside the setup panel. The full setup is 5 steps; the account-created step is already complete, leaving 4 remaining actions.
- Marks the completed account step with a quiet green `Completed` status rather than a button-like chip.
- Adds two non-checklist helper CTAs inside the setup panel: `Explore our setup guide` and `Book a live demo`.
- Includes setup tasks:
  - Create your account
  - Add your first supplier
  - Build a starter product list
  - Place your first order
  - Upload an invoice
- Checklist tasks are sequential:
  - `Add your first supplier` is the only active next action after account creation.
  - Product list is locked until a supplier exists.
  - First order is locked until products exist.
  - Invoice upload is locked until the first order flow is available.
- Add supplier onboarding:
  - The `Add supplier` checklist action now starts a guided pointer on the trial dashboard instead of immediately changing the main content.
  - Step 1 points to `Outlets` in the dashboard sidenav. Clicking that real nav item opens `Freemium/procure-trial-outlet-suppliers.html?tour=2`.
  - The prototype assumes the trial account has only one outlet/venue, so after the `Outlets` pointer it skips the outlet listing page and starts directly inside that outlet's `Suppliers` tab.
  - Steps 2-5 cover clicking `Add new`, searching by supplier name/UEN, choosing a supplier result, and confirming supplier settings.
  - Each supplier setup step is now a separate static HTML page:
    - Step 2: `Freemium/procure-trial-outlet-suppliers.html`
    - Step 3: `Freemium/procure-trial-add-supplier-search.html`
    - Step 4: `Freemium/procure-trial-add-supplier-results.html`
    - Step 5: `Freemium/procure-trial-add-supplier-settings.html`
  - Tour popovers do not include forward CTAs; users advance by clicking the highlighted product controls.
  - The outlet details page reads the signup `venueName` URL parameter so the outlet name matches the venue created during signup.
  - The Suppliers tab starts with an empty state because this is a new trial outlet with no suppliers yet.
  - Tour typography follows the app styleguide scale: 12px kicker, 21px title, 14px body/action text.
  - The tour uses a lightweight highlight ring and card without a dark page overlay so the product controls remain visible and clickable.
  - Saved real-product references for this path live in `assets/outlet_detail_details.html`, `assets/outlet_detail_suppliers.html`, `assets/outlet_detail_suppliers-addsupplier.html`, and `assets/outlet_detail_suppliers-addsupplier2.html`.
  - On `procure-trial-add-supplier-settings.html`, the guided tour (Steps 5-8 of 8) covers order contacts, order policy, delivery days, then save:
    - Step 5 (`Add order contacts`) copy references adding a WhatsApp number for updates instead of SMS, matching the visible WhatsApp field (SMS only appears behind `More`).
    - Step 6 (`Set the order policy`), Step 7 (`Add delivery days`), and Step 8 (`Save the supplier`) each show their own distinct copy — a prior stray-quote typo on the popover's copy element broke the selector that updates this text, so every step after Step 5 incorrectly showed Step 5's copy. Fixed.
    - The standalone `Copy if needed` (Apply to all) tour step was removed; `Apply to all` remains a per-row action but is no longer a numbered tour stop.
    - The tour highlight box now re-syncs on scroll so it doesn't drift out of alignment with its target while the page auto-scrolls between steps.
  - After saving a supplier, `procure-trial-outlet-suppliers.html` shows a top-right toast (`"<Supplier name> created"`) for 4 seconds, in addition to the existing inline `Supplier added` note.
  - The sidebar `Get started` card is now wired dynamically (not just static markup) on every supplier onboarding page (`procure-trial-outlet-suppliers.html`, `-add-supplier-search.html`, `-add-supplier-results.html`, `-add-supplier-no-results.html`, `-add-supplier-settings.html`): once `supplierAdded=1` is present, it updates from `20% done` / `Next • Add first supplier` to `40% done` / `Next • Build market list`, and the next-action link goes to the dashboard checklist instead of re-triggering the add-supplier tour.
  - The `Build market list` checklist row on the trial dashboard now shows a real `Add items` button (like `Add supplier` on the first row) instead of a plain, non-interactive `Next` label. It links to `Freemium/procure-trial-items.html`.
  - `Freemium/procure-trial-items.html` is a new placeholder Items page (topbar, sidebar with `Items` active, empty state: `No items yet`). It is intentionally left empty for now — building the real add-items flow is a future follow-up. The `Items` sidenav entry across every trial page (dashboard, outlet suppliers, and all add-supplier pages) now links here instead of `#`.
- Includes help/support links:
  - Navigating Nomni Procure app: `https://support.zeemart.co/en/articles/9418174-navigating-the-nomni-procure-app`
  - Nomni Procure help collection: `https://support.zeemart.co/en/collections/9530788-for-restaurants-nomni-procure`

## Verification

Chrome headless was used to regenerate previews at:

- Nomni: `2048x1117`
- Zeemart: `2048x1123`

HTML parsing and local image reference checks were run during development.

## Open Follow-Ups

- Define what “demo access” includes inside the stripped-down Nomni Procure prototype.
- Replace the trial dashboard placeholder with richer onboarding once the desired first-run tasks are confirmed.
- Decide which exact support article should be the primary support link.
- If an exact Zeemart hero photo asset is provided, swap it into the hero card background.
- The Zeemart logo is currently approximated in text; replace with exact SVG/PNG if available.
- Continue keeping this document updated as visual or content changes are made.
