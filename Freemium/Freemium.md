# Freemium Prototype Notes

## Main Objective

Create a freemium entry flow and supporting UX/UI that lets users directly try Nomni Procure, formerly Zeemart.

The start of the flow currently presents two CTAs:

- **Get started** as the primary CTA
- **Book a demo** as the secondary CTA

The `Get started` CTA opens a shared lead-capture and signup dialog on both the Nomni and Zeemart pages. The first step captures the user's work email and shows the two path CTAs in the same view.

Step 1 presents two paths after the user enters an email:

1. **Try the demo account**
   - User sees a confirmation message telling them to check their inbox.
   - Copy says a private demo link was sent to their email and expires in 30 days.
   - This verifies the email address before demo access.

2. **Sign up for FREE**
   - Let the user create a real account and begin a 30-day trial.
   - Step 2 asks for first name, last name, mobile number optional, company registered name, and trading name.
   - Step 3 asks optional setup questions: business type, primary goal, number of locations, and current ordering method.
   - Finish sends the user to the trial dashboard placeholder.

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
- `Freemium/Procure Trial Dashboard.html`

Generated preview screenshots:

- `Freemium/nomni-procure-top-preview.png`
- `Freemium/zeemart-top-preview.png`

## Current Implementation Notes

Both prototypes are standalone HTML files:

- Inline CSS in `<style>`
- No external JavaScript
- Google Fonts only
- Local assets referenced from `_refs`

The shared `Get started` dialog flow:

- Step 1 headline: `Try Nomni Procure`
- Step 1 body: `Start free, or take a quick look around first.`
- Step 1 field: `Work email`
- Step 1 CTAs:
  - Primary: `Sign up for FREE`
  - Secondary: `Try the demo account`
- Dialog width: `540px` max on desktop.
- Demo confirmation:
  - `Check your inbox`
  - Private demo link sent to the captured email, expiring in 30 days.
- Signup Step 2:
  - First name
  - Last name
  - Mobile optional
  - Company registered name
  - Trading name
- Signup Step 3 optional questions:
  - Business type
  - Primary goal
  - Number of locations
  - Current ordering method
- Dialog padding: `36px` on desktop, reduced slightly on mobile.

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
    - Opens the shared freemium dialog
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
    - Opens the same shared freemium dialog as the Nomni page
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
- Shows onboarding/setup content instead of live metrics.
- Includes setup tasks:
  - Create your account
  - Add your first supplier
  - Build a starter product list
  - Place a sample order
  - Upload an invoice
- Includes a `Book a demo` button linking to `https://www.nomni.ai/lets-chat`.
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
