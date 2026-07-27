# Nomni Procure Demo Dashboard

Last updated: 27 July 2026

## Purpose

The demo account lets prospective customers explore Nomni Procure as if it were a live outlet, using realistic sample data. It is a freely explorable product experience rather than a guided tour.

The demo should help users understand the value of Procure, complete a small number of safe actions, and move naturally towards either booking a live demo or starting a free trial.

## Experience principles

- Do not use step-by-step tours, numbered walkthroughs, setup checklists, spotlights, or forced paths.
- Reuse the real Procure page layouts and interaction patterns wherever possible.
- Show realistic, internally consistent sample data rather than empty states or explanatory placeholder content.
- Let users complete meaningful product actions when those actions can remain safely within the demo.
- Clearly distinguish the account from a live account without interrupting exploration.
- Never contact real suppliers, invite real users, connect integrations, move money, or create lasting external records.
- All demo-created data is temporary and is deleted when the demo period ends.

## Demo shell

- Entry page: `Freemium/procure-demo-dashboard.html`
- The entry page redirects to `../Procure - Dashboard.html?demo=1`.
- An amber `DEMO` pill (`#F5B731`) appears beside the Procure wordmark.
- `Expires in 14 days` sits beside the DEMO pill.
- The earlier full-width mint demo banner has been removed.
- The Outlet/HQ toggle is hidden.
- The shell, sidenav, topbar, page title, tabs and content padding remain stable between demo pages.
- Topbar actions:
  - `Book a live demo` opens the same two-step request dialog used by the freemium flow.
  - `Start my FREE trial` opens the freemium signup flow and preserves the captured email address.

## Current demo navigation

The implemented demo navigation contains:

1. Dashboard
2. Orders
3. Invoices
4. Items
5. Inventory
6. Users

Payments and News are removed entirely.

Items and Inventory use the more realistic layouts built for the freemium flow rather than the older root-page layouts.

## Dashboard

Source: `../Procure - Dashboard.html?demo=1`

Available:

- View realistic spend, order, invoice, delivery and price-change metrics.
- View populated charts and expenditure breakdowns.
- Start a sample order.
- Start a sample invoice upload.
- Use the topbar conversion actions.

Unavailable:

- Live supplier, accounting or payment data.
- Any action that changes an external account.

## Orders

Source: `../Procure - Orders.html?demo=1`

Available:

- Browse realistic orders across different states.
- Search and inspect the order table.
- Create a sample order by item.
- Create a sample order by supplier.
- Review items, suppliers, quantities and totals in the existing order flows.
- Complete the order flow and return to Orders.
- See the newly created order at the top of the table.
- Receive a top-right success toast confirming that nothing was sent.

Demo-specific rules:

- The Purchase requisitions tab is removed.
- New recurring and weekly order actions are not part of the implemented demo journey.
- Placing an order creates only temporary local demo data.
- No order is transmitted to a supplier.
- No real supplier can be added or linked.

Order flow sources:

- `../Procure - New Order - Item.html?demo=1`
- `../Procure - New Order - Supplier.html?demo=1`

## Invoices

Source: `procure-trial-invoices.html?demo=1`

The freemium onboarding version intentionally begins empty. Demo mode instead opens with realistic sample data.

Invoices tab:

- Shows five sample processed invoices.
- Includes varied suppliers, invoice numbers, dates, due dates, totals and export/sync states.
- Supports the existing invoice search and table interactions.

Uploads tab:

- Shows three sample uploads in progress.
- Includes realistic filenames, upload times, invoice numbers, invoice dates and suppliers.
- Keeps the existing completeness and `View/edit` interaction.
- Allows local JPG, PNG and PDF uploads.
- A newly uploaded file remains inside the demo context.

Unavailable:

- Payments and `Pay online`.
- Sending data to accounting integrations.
- Creating a lasting invoice record outside the demo.

## Users

Source: `../Procure - Users.html?demo=1`

Available:

- View realistic sample users.
- Inspect roles and outlet access.

Unavailable:

- Add user.
- Send invitations.
- Change access in a way that affects a real account.

The Add user action is locked and should explain that user management becomes available in a trial or live account.

## Items

Status: implemented.

Source: `../Procure - Items.html?demo=1`

- Uses the more realistic freemium Items layout in demo mode.
- Removes trial conversion, setup and tour chrome.
- Shows a realistic purchased-items market list with eight sample SKUs.

Available:

- Browse and search sample SKUs.
- Inspect supplier, price, UOM, expense category and last-ordered information.
- Create a temporary sample SKU.
- Add an item from a sample invoice where the interaction remains local.

Unavailable:

- Add or connect a real supplier.
- Bulk operations that imply an external import or export.
- Permanent catalogue changes.

## Inventory

Status: implemented.

Source: `../Procure - Inventory.html?demo=1`

- Uses the more realistic freemium Inventory layout in demo mode.
- Removes trial conversion, setup and tour chrome.
- Uses a separate demo-only local inventory store.
- Shows three inventory lists and seven tracked sample items.

Available:

- Browse inventory lists and tracked items.
- Inspect stock on hand and inventory values.
- Start and complete a temporary sample stock count.
- Save a demo stock count locally.

Unavailable:

- Import live stock data.
- Transfer stock to a real outlet.
- Update production inventory.

## Data and safety rules

- Use fictional but credible Singapore business, outlet, supplier and user data.
- Demo data must be clearly isolated from production data.
- User-created demo orders, uploads, invoices, items and stock counts must remain temporary.
- Do not send emails, WhatsApp messages, supplier notifications or invitations.
- Do not expose supplier-connection, payment, banking, PEPPOL or accounting-integration setup.
- Do not allow an action to appear successfully completed if it could affect an external party.
- When a risky action is locked, explain what is available in a trial or live account and provide an appropriate conversion action.

## Implemented change log

### 27 July 2026

- Replaced the placeholder demo landing experience with demo mode on the real Procure shell.
- Limited the first demo release to Dashboard, Orders, Invoices and Users.
- Removed Payments and News.
- Made Users visible but read-only.
- Removed the Outlet/HQ switcher.
- Added the DEMO pill and moved the expiry indicator beside it.
- Removed the mint demo banner.
- Restored `Book a live demo` and added `Start my FREE trial` to the topbar.
- Reused the approved freemium live-demo request dialog.
- Corrected title spacing and stabilised shared shell positioning between pages.
- Populated Dashboard charts and metrics.
- Added complete Order by item and Order by supplier demo flows.
- Added new demo orders to the Orders table with a top-right confirmation toast.
- Removed Purchase requisitions from demo Orders.
- Seeded both Invoices and Uploads with realistic sample data.
- Replaced the older demo Items and Inventory views with the richer freemium layouts.
- Added Items and Inventory to the demo sidenav, expanding it to six sections.
- Seeded eight purchased items, three inventory lists and seven tracked inventory items.
- Isolated Inventory demo records in a separate local store so they do not affect freemium trial data.
- Standardised all six demo page titles to Hanken Grotesk with consistent 32px top spacing.
- Removed the POS syncing status line from the demo Inventory page.
- Added the Inventory Activity tab with date filtering, filter/export actions, and realistic stock-count, production, wastage and adjustment history.
- Standardised the demo outlet name as `Nomni Kitchen — Tanjong Pagar`, including seeded Orders and order-creation screens.
- Changed the DEMO pill from Nomni green to amber (`#F5B731`) across all demo pages and order flows.
- Corrected the Inventory metric-icon paths after moving the richer layout into the root page.

## Maintenance

Update this file whenever any of the following changes:

- Demo navigation or section availability.
- Allowed or locked actions.
- Sample-data assumptions.
- Safety restrictions.
- CTA or conversion behaviour.
- Demo duration or expiry treatment.
- Source prototype pages.
- New demo flows, dialogs, tables, charts or screenshots.
- A planned item moves into implementation or completion.
