# HQ Module — Prototype Guide

Last updated: 20 August 2026

This guide describes the current user-facing HQ prototype: what each area contains, what an administrator can do, and the important behaviour represented in the prototype. For delivery status, limitations and backlog gaps, see `HQ_MODULE_STATUS.md`.

## HQ page

The HQ page is the operating view for a buyer's head office. It has a header with the HQ name, last-updated date, **Users** and **Edit details** actions, a summary strip, and six tabs: Overview, Suppliers, Items, Inventory, Recipes and Activity.

### Header and summary

- **Users** opens the HQ user list, where existing Procure users can be added, user access can be removed, and non-owner users can be activated or deactivated.
- **Edit details** opens the HQ editing screen. An HQ is identified by its HQ name; company is not collected or shown.
- The summary strip shows the total outlets, items, recipes and suppliers associated with the HQ.

## Overview

Overview is the home for outlet structure and HQ health.

### Outlets and groups

- Lists outlet groups and outlets that are not assigned to a group.
- Group rows can be expanded to see their outlets, POS state and summary counts.
- Search finds both group names and outlet names.
- **New group** starts creation of an outlet group for this HQ.
- **Add outlets** searches the wider Procure outlet directory and adds one or more outlets to the HQ. Added outlets are set to **Managed by HQ**.
- After adding outlets to an HQ, the user can choose an existing group for them or **Leave ungrouped**.
- Group actions offer **Add outlets**, **Settings** and **Delete group**.
- When adding outlets to a group, the picker includes both eligible Procure outlets and outlets already managed by the HQ but currently ungrouped. The latter are labelled accordingly.
- Ungrouped outlets can be selected in the table and added to a group in bulk.
- Removing an outlet from a group returns it to the ungrouped HQ list. Removing it from the HQ is represented as a confirmation flow.

### Health check

- Shows operational prompts, including pending price changes, ungrouped outlets, recipes above food-cost target and outlets not connected to POS.
- The price-change prompt opens the HQ Price changes page.

### Recent activity

- Shows recent prototype activity for the HQ, with a link to the full Activity tab.

## Suppliers

Suppliers are managed at HQ level and then made available to the relevant outlet groups or outlets.

- The list shows suppliers, available contact methods and status.
- **Add supplier** opens a two-step search and supplier-settings flow.
- Supplier search supports normal Procure suppliers, Active suppliers that require a Live Chat request, UEN/ABN lookup, and manual creation when no match exists.
- Each linked supplier has configurable notification contacts, minimum order rules, delivery days and cut-off times, including **Apply to all** for delivery settings.
- Email and WhatsApp are individually optional, but at least one contact method is required.
- Existing suppliers can be edited, disabled or reactivated; prototype changes are retained locally where supported.

## Items

Items is the HQ master market-list view.

- Search and filters narrow the item list.
- **Price changes** opens the HQ-level invoice price-review page.
- Items can be added from supplier catalogues and configured for access, UOMs, pricing and MOQ.
- Multi-UOM items use an expandable parent row. The parent shows the number of UOM options; child rows show the UOM, price and availability.
- **Available to** explains where an item can be used. It can identify all outlet groups, individual groups and individual outlets; the detail dialog separates group and outlet access.
- Item settings include Details, Exceptions and Access.

## Price changes

The dedicated Price changes page is reached from Items, Overview Health check and the Market List warning.

- Lists invoice-detected price changes awaiting review, with current price, invoice price, source HQ/outlet and detection date.
- Search and supplier filtering are available.
- **Update price** applies the new price to the HQ market list and confirms the HQ-wide effect.
- **Keep current** records a decision not to update.
- Reviewed decisions move to the Reviewed tab for the current browser session.

## Inventory

Inventory defines the HQ's inventory items and counting setup.

- Search, type and status filters narrow the list.
- **Add to inventory** adds catalogue items or recipes to inventory and configures inventory UOM, conversion and par level.
- Single-UOM rows show the UOM, unit cost and availability directly.
- Multi-UOM rows are expandable: the parent shows the number of UOM options, while each child row repeats the item name and shows its UOM, cost and availability.
- Availability in child rows can identify outlet groups and individual outlets.
- Row actions support editing and deactivating/removing inventory records in the prototype.

## Recipes

Recipes is the HQ recipe library.

- Search and filters support browsing by recipe type and food-cost status.
- Recipes can be created and edited, with ingredients, portions, instructions and food-cost information.
- Recipes can have variations. The default variation is available broadly; non-default variations can be explicitly assigned to selected groups or outlets.
- The **Available to** dialog makes the distinction between group-level availability and outlet-specific recipe variations visible.
- The prototype includes recipe version history, copying data between variations and ingredient-update propagation flows.

## Activity

Activity is the audit-style record for the HQ.

- Supports activity browsing, filters, date range and pagination in the prototype.
- It records selected prototype actions, while much of the displayed history remains illustrative.
- The reset control is deliberately kept outside the product UI at the lower-left of the prototype; it clears browser-stored demonstration state.

## Prototype search hints

On search-driven actions, a small helper panel appears above the reset control with terms that produce illustrative successful and unsuccessful results. It appears only for relevant actions, such as adding outlets, suppliers, items or users.

## Prototype boundaries

- This is a static HTML prototype. It does not connect to backend data or enforce real permissions.
- Some browser-local state is retained while the prototype is open; reset clears that state.
- Names, counts, activity and catalogues are illustrative unless explicitly derived from a prior prototype flow.

---

## Admin screen reference

This section maps the current Admin prototype files to their intended role. It includes adjacent Admin screens where they support the HQ journey, even if they are not owned by the HQ page itself.

### Buyers — `Admin - Buyers.html`

The Buyers page is the Admin entry point for buyer accounts and their organisational structure.

- **Outlets** lists outlets with their company, outlet group, HQ relationship, creation date, ordering activity and subscription. Row actions expose common outlet administration actions.
- **Trial** is a trial-account view.
- **Companies** and **Clusters** are reference lists for those organisational entities.
- **HQ & Outlet groups** lists HQs and their outlet groups. HQ rows can expand to reveal groups and related outlet counts, and the relevant HQ can be opened from here.
- **Verification requests** surfaces buyer verification work.
- The **Add new** menu routes to creation of an outlet, company, cluster, HQ or outlet group where a prototype route exists.

### Create HQ — `Admin - Create HQ.html`

Creates an HQ record.

- **Basic information:** HQ name is required and is the only displayed HQ identity. The form suggests the convention “brand or group name + HQ”.
- **Subscription information:** enables the relevant product add-ons: invoice processing, 3-way match, Retail POS, inventory tracking for recipes and AI features.
- The sticky footer provides **Cancel** and **Create HQ**.
- On successful creation, the prototype opens the new HQ Overview and stores enough browser-local state to demonstrate the empty-HQ journey.

### Edit HQ — `Admin - Edit HQ.html`

Edits the same HQ name and add-on settings as the creation form.

- It is reached from **Edit details** in the HQ header.
- Saving returns to the related HQ page.
- Company is deliberately absent: it is no longer an HQ field.

### HQ page — `Admin - HQ Settings.html`

This is the main HQ workspace. Its individual areas are documented above under **HQ page**, **Overview**, **Suppliers**, **Items**, **Inventory**, **Recipes** and **Activity**.

Supporting surfaces launched from this page include supplier search and configuration, item creation/configuration, inventory configuration, recipe operations, outlet-group settings and outlet assignment dialogs.

### HQ users — `Admin - HQ Users.html`

Manages people with access to the currently viewed HQ.

- Displays name, email, HQ Owner state and last active date; search filters the list.
- **Add user** searches existing Procure accounts by name or email. A matching account can be added directly without creating a duplicate.
- No match offers **Create new user**, carrying the current HQ into the new-user route.
- Row actions support editing user details, activating/deactivating and removing HQ access. HQ Owners are protected from ordinary access removal.

### HQ Price changes — `Admin - HQ - Price Changes.html`

Reviews invoice-detected price changes for managed outlets at HQ level.

- Accessible from Overview Health check and the Items tab.
- Separates **Pending review** from **Reviewed** decisions.
- Search and supplier filter help find a change.
- Each pending row shows the item, supplier, current price, invoice price and change amount, source outlet, and detection date.
- **Update price** changes the HQ market-list price after confirmation; **Keep current** records the alternative decision.

### Create outlet group — `Admin - Create Outlet Group.html`

Creates an outlet group below an HQ.

- Captures required group name and HQ, plus an optional internal description.
- **Add outlets** opens a searchable picker that can search the broader Procure outlet directory and filter by company or cluster.
- Selected outlets are displayed on the form and can be removed before saving.
- Creation returns to the selected HQ and shows the new group in its Overview for the prototype session.

### Outlet group page — `Admin - Edit Outlet Group.html`

This is the detailed management page for one outlet group.

- Header identifies the parent HQ, has a **Settings** action and **Add outlets** action, and links back to the HQ.
- Tabs cover the group’s Overview, Outlets, Recipes and Suppliers.
- **Overview** shows group-level summary information and key sections such as items and assigned outlets.
- **Outlets** lists members, supports adding multiple outlets, and supports removing an outlet from the group.
- The add-outlets picker searches the wider directory, but also includes ungrouped outlets already managed by Garden Cuisine HQ. These are clearly labelled as already linked to the HQ.
- **Settings** edits group name and internal description and exposes the destructive **Delete group** action.
- The group’s Items area includes item search, item management and group-level item controls; Recipe and Supplier areas surface the data available to this group.

### Outlet group settings — `Admin - Outlet Group Settings.html`

This is an older standalone settings route for outlet-group administration. The current preferred experience is the **Settings** dialog launched from the outlet group page, so it should be treated as a supporting/legacy prototype route until the pages are consolidated.

### Create outlet — `Admin - Create Outlet.html`

An Admin creation route for an individual outlet. It remains relevant to the broader Buyer administration journey, while HQ membership is managed from the HQ page through **Add outlets** or from outlet settings in the underlying product model.

### Add supplier — `Admin - Add Supplier.html`

An Admin supplier route. The active HQ-specific supplier experience is launched from the HQ Suppliers tab and contains the more complete HQ relationship settings; this standalone route should be treated as an adjacent prototype rather than the primary HQ entry point.

### HQ Create Item — `Admin - HQ Create Item.html`

Creates a new HQ market-list item. It is the dedicated route behind the HQ item-creation flow, collecting catalogue and ordering configuration before defining where the item is available.

### HQ recipe creation — `Admin - HQ Recipe Create.html` and `Admin - HQ Recipe Create - New.html`

The Admin recipe-creation screens support building the HQ recipe library.

- They capture recipe identity, ingredients, UOMs, portions and instructions.
- The flows support assigning recipes and variations to groups or individual outlets where applicable.
- These routes sit behind the Recipes tab rather than replacing it as the primary library view.

### Buyer user — `Admin - Buyer User.html`

The broader buyer-user create/edit route used when a new HQ user needs to be created instead of linked from an existing Procure account.

- Captures basic user details and access.
- Supports linking the person to an HQ and defining HQ-related permissions.
- It complements the HQ Users list, which is the preferred starting point when managing access for a known HQ.
