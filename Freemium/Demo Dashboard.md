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

## Locked-feature pattern

Use the same treatment wherever a demo page contains locked or limited functionality.

- Show a full-width light cream banner at the top of the content area, above the page title.
- Do not include an icon in the banner.
- Banner title: `Some features are unavailable in the demo account`
- Banner copy: `You can view sample data, but changes are disabled.`
- Keep the normal action label and icon, such as `+ Add user`; do not put a lock icon in the button.
- Selecting a locked action opens a standard modal titled `Feature unavailable in demo`.
- Briefly explain what becomes available in a free trial or live account.
- Keep sample lists short.
- Allow users to open record details.
- Detail views are read-only: fields and mutation buttons are disabled, while navigation and Close remain available.

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

Hidden or removed:

- Payments and News sidenav entries.
- Outlet/HQ mode switcher.
- `Aa` and `Box` handoff inspectors.
- Earlier full-width mint demo banners.

## Current demo navigation

The implemented demo navigation contains:

1. Dashboard
2. Orders
3. Invoices
4. Items
5. Inventory
6. Recipes
7. Outlets
8. Users

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

Hidden or removed:

- The Purchase requisitions tab is removed.
- The Needs approval tab is removed.
- The `Nothing will be sent` topbar label is removed from both order-creation branches.

Demo-specific rules:

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
- Offers two downloadable, clearly fictional sample invoice PDFs.
- Allows the user to load either sample or both samples together.
- Carries the selected samples through the digitisation review form with matching supplier, invoice and line-item data.
- Keeps newly digitised records inside the local demo context.

Unavailable:

- Uploading the user’s own invoice, including by file picker or drag and drop.
- Payments and `Pay online`.
- Sending data to accounting integrations.
- Creating a lasting invoice record outside the demo.

Hidden or removed:

- Payments and `Pay online`.
- Personal invoice file selection and drag-and-drop controls. Only the fictional sample-invoice controls are shown.

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

Hidden or removed:

- User-row avatars. The signed-in account avatar remains in the topbar.

## Outlets

Source: `../Procure - Outlets.html?demo=1`

Available:

- View the sample outlet’s Details, Users, Settings, Suppliers and Integration tabs.
- Open the Details tab by default, using the saved production outlet-details layout.
- Inspect a short list of five realistic suppliers.
- Open read-only supplier details.
- View the company, outlet name, structured Singapore address, logo, outlet email and current subscription plan.
- View the users assigned to the outlet.
- Review outlet settings and available integration categories.
- Downloading or exporting sample-only information may be allowed where it has no external effect.

Unavailable:

- Add or connect a real supplier.
- Edit supplier contact or ordering settings.
- Archive or remove suppliers.
- Change outlet details, users or settings.
- Connect accounting or POS integrations.
- Send supplier invitations, emails, orders or notifications.

The page uses the shared cream locked-feature banner. `Add new` keeps its standard plus icon and opens the shared unavailable-in-demo modal. Integration `Connect` actions use the same modal.

Hidden or removed:

- Interactive `Manage subscription` behaviour. The label remains visible inside the production-style subscription card, but is not actionable.
- Editable logo upload. The real file field and `Browse` control remain visible but disabled.
- Active Save behaviour. The production-style Cancel and Save actions remain visible for layout fidelity, with Save disabled.

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
- Create temporary inventory lists.
- Add items from the sample catalogue to any demo list.
- Create a temporary SKU from Items and optionally assign it to a demo inventory list.
- Start and complete a temporary sample stock count.
- Save a demo stock count locally, update stock-on-hand values and add a new Activity record.

Unavailable:

- Import live stock data.
- Transfer stock to a real outlet.
- Update production inventory.

## Recipes

Status: implemented.

Source: `../Procure - Recipes.html?demo=1`

Available:

- Browse the outlet-level recipe table used by `Procure - Recipes - Outlet.html`.
- Search recipes and filter the list to favourites.
- Review recipe type, recipe code, cost, retail price, food-cost percentage and last-modified date.
- Open an existing recipe to inspect its yield, cost summary and ingredients.
- Create a temporary recipe with type, tags, yield, retail price and sample ingredients.
- Save the new recipe to the local demo account and see it appear in the table.

Unavailable:

- Edit or delete existing recipes.
- Publish recipe changes to inventory or a live outlet.

Existing sample recipe data remains read-only. Newly created recipes are temporary and remain within the local demo account.
Delete, Duplicate, Save & create another and Save remain visible on the full detail page and open the standard unavailable-in-demo dialog.

Recipe detail source: `../Procure - Recipes - Detail.html?demo=1`

Hidden or removed:

- Settings and Help actions.
- On existing recipe details: Add ingredient and Copy data from.
- Existing-recipe editing controls are hidden or rendered read-only; temporary recipe creation remains available.

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
- Standardised all demo page titles to Hanken Grotesk with consistent 32px top spacing.
- Removed the POS syncing status line from the demo Inventory page.
- Added the Inventory Activity tab with date filtering, filter/export actions, and realistic stock-count, production, wastage and adjustment history.
- Standardised the demo outlet name as `Nomni Kitchen — Tanjong Pagar`, including seeded Orders and order-creation screens.
- Changed the DEMO pill from Nomni green to amber (`#F5B731`) across all demo pages and order flows.
- Corrected the Inventory metric-icon paths after moving the richer layout into the root page.
- Standardised the demo topbar identity as `William Arya` with the initials `WA` across every section.
- Established the cream locked-feature banner, shared copy and unavailable-action modal pattern.
- Shortened the Users demo list to five records and added clickable, read-only user details.
- Added Outlets as the seventh demo section using the freemium outlet/supplier layout.
- Added read-only outlet Details, Users, Settings, Suppliers and Integration tabs.
- Seeded five sample suppliers and locked supplier creation, editing and integration connections.
- Added Recipes as the eighth demo section with a read-only outlet summary and recipe details.
- Replaced unrestricted demo invoice upload with two downloadable fictional sample PDFs.
- Allowed either or both sample invoices to pass through the local digitisation review flow while blocking personal invoice uploads.
- Made inventory-list creation, sample-catalogue additions and temporary SKU creation persist in the demo-only browser store.
- Connected the full stock-count flow to the demo store, including updated quantities, an Activity entry and a success toast on return.
- Centred the shared cream locked-feature banner copy.
- Removed avatars from the Users table across all page modes while retaining the account avatar in the topbar.
- Removed the redundant `Nothing will be sent` label from the order-creation topbar; safety confirmation remains at order completion.
- Standardised the outlet selector and supplier-order summary across both order branches as `Nomni Kitchen — Tanjong Pagar`.
- Replaced the Recipes outlet-summary screen with the detailed outlet recipe-table layout.
- Simplified the demo Inventory page title to `Inventory`.
- Removed Settings and Help from Recipes, added read-only recipe details and enabled temporary recipe creation.
- Replaced the interim recipe-details popup with demo mode on the existing full recipe-detail prototype.
- Added hidden-or-removed control notes under each relevant demo section so simplification decisions remain auditable in context.

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
- Buttons, tabs, navigation items or other controls that are hidden, removed or restored.
- A planned item moves into implementation or completion.
