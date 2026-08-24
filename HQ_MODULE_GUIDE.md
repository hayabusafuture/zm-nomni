# HQ Module — Prototype Guide

Last updated: 24 August 2026

This guide is the single source of truth for the current user-facing HQ prototype, its delivery status, limitations and follow-up work.

## HQ page

### Lifecycle terminology

| Meaning | Use |
| --- | --- |
| HQ-wide record remains visible but cannot be used | **Disable / Enable** |
| Unavailable only in a group or ungrouped outlet | **Exclude / Include** |
| Removed from the HQ master list while historical references remain | **Remove / Restore** |
| Detaching membership or access | **Remove access / Remove from group** |

The effective priority is **Removed → Excluded → Disabled → Active**. Excluded records are hidden from the normal list for that scope and restored through an Excluded status filter or availability manager. HQ-disabled records remain visible, dimmed and labelled **Disabled at HQ**, and cannot be enabled locally. Legacy lifecycle wording is not used in HQ product UI or activity copy.

The HQ page is the operating view for a buyer's head office. It has a header with the HQ name, last-updated date, **Users** and **Edit details** actions, a summary strip, and seven tabs: Overview, Suppliers, Items, Inventory, Recipes, POS mapping and Activity.

### Last updated timestamps

- **HQ:** the timestamp reflects the most recent material change to HQ-owned configuration, including HQ details, the master market list, HQ suppliers, inventory or recipes, HQ availability rules, managed-outlet membership, POS integration settings or user/access settings.
- **Outlet group:** the timestamp reflects the most recent material change whose scope is that group, including group settings, items, inventory/UOMs, recipes, suppliers, POS mapping or outlet membership. A group-scoped change initiated from an HQ screen still updates the group timestamp.
- **Outlet:** the timestamp reflects the most recent material change to that outlet’s own settings, items, inventory/UOMs, recipes, suppliers or POS integration/mapping.
- Searches, tab views, filters, opening dialogs and other read-only actions do not update timestamps. When one action changes multiple scopes, update each affected resource and record the initiator in Activity.

### Header and summary

- **Users** opens the HQ user list, where existing Procure users can be added, users can be disabled or enabled, and access can be removed.
- **Edit details** opens the HQ editing screen. An HQ is identified by its HQ name; company is not collected or shown.
- The summary strip shows the total outlets, items, recipes and suppliers associated with the HQ.

## Overview

Health check panels are ordered by severity: warnings appear before informational items.

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
- Existing suppliers can be edited, disabled or enabled at HQ level; group/outlet-specific availability uses Exclude/Include.

## Items

Items is the HQ master market-list view.

- Search and filters narrow the item list.
- **Price changes** opens the HQ-level invoice price-review page.
- Items can be added from supplier catalogues and configured for access, UOMs, pricing and MOQ.
- Multi-UOM items use an expandable parent row. The parent shows the number of UOM options; child rows show the UOM, price and availability.
- **Available to** explains where an item can be used. It can identify all outlet groups, individual groups and individual outlets; the detail dialog separates group and outlet access.
- Item settings include Details, Exceptions and Access.
- **Master lifecycle:** an HQ item can be **Active**, **Disabled** or **Removed**. Disabled items remain visible but cannot be ordered by included outlet groups or ungrouped outlets. Removed items disappear from available market lists throughout the HQ, while existing Inventory and Recipe references remain as historical records and can no longer be newly selected.
- Removed items remain available in the HQ’s **Removed** status view, where they can be restored to the master market list.
- **Scope exclusion:** HQ can exclude an otherwise active or disabled item from a specific outlet group or ungrouped outlet. Exclusion means it is not available there at all. The effective-state priority is **Removed → Excluded → Disabled → Active**.
- In a group or outlet, **Exclude from this group/outlet** hides the item from the normal Items list; the **Excluded** status filter exposes it for **Include**. An HQ-disabled item remains visible, dimmed and labelled **Disabled at HQ**.

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
- HQ inventory uses **Disable / Enable** for master records and **Remove from inventory** for removal. Group/outlet-specific availability uses **Exclude / Include** and excluded records are hidden from the normal local list.
- Availability in child rows can identify outlet groups and individual outlets.
- Row actions support editing, disabling/enabling and removing inventory records in the prototype.

## POS mapping

POS mapping connects the HQ to Nomni POS and defines how POS sales affect the HQ's stock and recipe data. The HQ tab is a connection and progress overview; detailed master mapping happens on a dedicated full-width workspace.

- **Open POS mapping** opens the HQ's master-mapping workspace. It uses the HQ's Nomni POS EMS API key and its mappings form the baseline for all outlets managed by that HQ.
- The HQ tab lists individual outlets, their connection state, mapping progress and last sync so an HQ user can check mapping accuracy at outlet level. Outlet API keys are for viewing that outlet's data and validation; they do not require the HQ to repeat the master mapping for every outlet.
- The outlet table includes every outlet managed by the HQ. Each outlet can have fewer POS products than the HQ EMS catalogue, but never more; its mapping count is therefore measured against that outlet's own product total.
- The overview can be filtered by outlet name, outlet group, POS connection state and mapping status. An outlet is treated as **Mapped** in this overview once it has at least one mapped POS product; otherwise it is **Unmapped**.
- The Overview health-check alert for outlets not connected to POS opens this tab. Its count is derived from the same outlet records, so it remains consistent with the table.
- The first visit to the HQ workspace presents a setup state. The user opens **POS settings** and saves the HQ Nomni POS API key; in the prototype, any key connects sample EMS products.
- Once connected, the workspace is split into a POS-product list and a Procure mapping area.
- A POS product or variant can map to any HQ inventory entry, including standard inventory items, Group SKUs and recipes that have been added to inventory.
- It can alternatively map directly to a recipe that is not an inventory item.
- **Ignore mapping** is available for POS products or variants that should not affect inventory. An ignored mapping is shown explicitly.
- The current regular-outlet Procure flow also supports a more advanced variant model—add/modify ingredients, replace an ingredient, or apply a multiplier to the base recipe. The HQ prototype should adopt these variant behaviours when the detailed mapping editor is designed, rather than duplicating a recipe for each variant.

## Recipes

Recipes is the HQ recipe library.

- Search and filters support browsing by recipe type, food-cost status and lifecycle status, including **Removed**.
- Recipes can be created and edited, with ingredients, portions, instructions and food-cost information.
- Recipes can have variations. The default variation is available broadly; non-default variations can be explicitly assigned to selected groups or outlets.
- **Manage availability** controls the groups and individual outlets in which a recipe is available; the **Available to** dialog remains a read-only summary.
- The prototype includes recipe version history, copying data between variations and ingredient-update propagation flows.
- **Master lifecycle:** HQ recipes can be **Active**, **Disabled** or **Removed**. Disabled recipes remain visible but unusable. Removed recipes disappear from HQ and local recipe lists but retain their POS mappings, inventory records and historical data; they can be restored from the **Removed** filter. Group/outlet recipe availability uses **Exclude / Include**; excluded recipes are hidden from the normal local list and restored from the **Excluded** filter. A recipe disabled at HQ remains visible locally as **Disabled at HQ**.

## Activity

Activity is the audit-style record for the HQ.

- Supports activity browsing, filters, date range and pagination in the prototype.
- It records selected prototype actions, while much of the displayed history remains illustrative.
- The reset control is deliberately kept outside the product UI at the lower-left of the prototype; it clears browser-stored demonstration state.

## Prototype search hints

On search-driven actions, a small helper panel appears above the reset control with terms that produce illustrative successful and unsuccessful results. It appears only for relevant actions, such as adding outlets, suppliers, items or users.

## Prototype boundaries

- This is a static HTML prototype. It does not connect to backend data or enforce real permissions.
- Outlet groups and their linked outlets are retained in browser-local state across refreshes until **Reset prototype** is used. Other prototype state may still be session-only.
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
- Row actions support editing user details, disabling/enabling users and removing HQ access. HQ Owners are protected from ordinary access removal.

### HQ Price changes — `Admin - HQ - Price Changes.html`

Reviews invoice-detected price changes for managed outlets at HQ level.

- Accessible from Overview Health check and the Items tab.
- Separates **Pending review** from **Reviewed** decisions.
- Search and supplier filter help find a change.
- Each pending row shows the item, supplier, current price, invoice price and change amount, source outlet, and detection date.
- **Update price** changes the HQ market-list price after confirmation; **Keep current** records the alternative decision.

### HQ POS mapping — `Admin - HQ Settings.html`, POS mapping tab and `Admin - HQ - POS Mapping.html`

The POS mapping tab is the HQ-level version of the existing Nomni Procure POS mapping experience.

- The HQ tab provides outlet-level connection and mapping status, while **Open POS mapping** opens the dedicated wide HQ master-mapping screen.
- Users can search the managed outlets and filter the overview by group, connection state or mapping status before opening a specific outlet for validation or setup.
- The HQ mapping screen starts in a Nomni POS connection state and opens a small settings dialog for the HQ EMS API key. Outlet-level views are for validating the derived mapping against each outlet's separate POS connection.
- Its left pane lists POS products with product codes, category and Mapped/Unmapped filters. Products expose their variants in an accordion.
- Its right pane is the Procure search-and-map workspace. The user selects Inventory or Recipes and then maps the selected POS entry.
- Inventory choices deliberately include regular inventory items, Group SKUs and inventory recipes; Recipe choices are recipes not held in inventory.
- For variants, the workspace presents the existing Procure behaviours: Add/modify, Replace and Multiplier. Detailed ingredient selection for those behaviours remains to be built.
- The API-key-only connection is a current prototype assumption. The production connection requirements, POS location selection and visibility/category settings still need confirmation.

### Create outlet group — `Admin - Create Outlet Group.html`

Creates an outlet group below an HQ.

- Captures required group name and HQ, plus an optional internal description.
- **Add outlets** opens a searchable picker that can search the broader Procure outlet directory and filter by company or cluster.
- Selected outlets are displayed on the form and can be removed before saving.
- Creation returns to the selected HQ and shows the new group in its Overview for the prototype session.

### Outlet group page — `Admin - Edit Outlet Group.html`

This is the detailed management page for one outlet group.

- Header identifies the parent HQ, has a **Settings** action and **Add outlets** action, and links back to the HQ.
- Tabs cover the group’s Overview, Outlets, Inventory, Recipes, Suppliers and Activity.
- **Overview** shows group-level summary information and key sections such as items and assigned outlets.
- **Outlets** lists members, supports adding multiple outlets, and supports removing an outlet from the group.
- The add-outlets picker searches the wider directory, but also includes ungrouped outlets already managed by Garden Cuisine HQ. These are clearly labelled as already linked to the HQ.
- **Settings** edits group name and internal description and exposes the destructive **Delete group** action.
- The group’s Items area includes item search, item management and group-level item controls. Multi-UOM items use the same expandable pattern as the HQ: the parent shows the number of options, while child rows show the UOM, price and MOQ.
- **Inventory** shows the stock-tracked items and UOM/cost setup that applies to the group.
- Recipe and Supplier areas surface the data available to this group. Each outlet group—and each ungrouped outlet—uses one assigned recipe variation, so the group recipe view does not expose recipe version or variation choices.

### Group Activity boundary

- The group Activity tab records changes whose scope is this group: outlets added/removed, group item or inventory changes, supplier excluded/included actions, recipe changes, POS mapping changes and group settings updates.
- HQ Activity remains the audit trail for HQ-wide changes, such as changing the HQ market list, HQ suppliers, HQ-level availability, linking outlets to the HQ or changing HQ settings. The same event should not be duplicated in both views unless the HQ action also created a group-level result.
- Activity placement follows the **scope of the resulting change**, not the screen or button used to start it. For example, an HQ user disabling a supplier specifically for one group creates a group Activity entry, even if initiated from an HQ control; the entry should retain the origin (for example, “Initiated from HQ”). A change applied across the whole HQ belongs in HQ Activity.
- If one HQ action has both scopes, record the group-level result in each affected group’s Activity and retain the broader administrative action in HQ Activity. Copying setup follows the same rule: record the copied changes in the destination group, including the source group and initiator.

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

## Planned follow-up work

### Complete and confirm core flows

- **Create item:** the page captures the required details but **Save item** does not yet create a locally retained HQ catalogue record. Complete the save, return and list-refresh flow.
- **Recipes:** recipe creation and editing screens need to be fully fleshed out, including validation, save behaviour, variations, ingredients and retained state.
- **POS mapping:** the HQ overview and mapping workspace are represented, but the end-to-end mapping flow and its dependency rules are not fully fleshed out.
- **Price changes:** confirm that the dedicated HQ Price changes page, its scope and its review actions are the intended product experience before treating it as final.
- **Unit costs and pricing:** confirm how unit costs are calculated and displayed across every HQ, outlet-group and outlet tab when supplier costs, item overrides, UOMs or price tiers differ by scope.
- **Recipe availability:** define and build the management experience for recipe availability. The current dialog is a placeholder and needs clear group/outlet controls, exclusion behaviour and a restoration path.

### Ungrouped outlet management

- **Implemented prototype:** clicking an ungrouped outlet in the HQ Overview opens an individual outlet-management view. It is clearly marked as independently managed and exposes Overview, Items, Inventory, Recipes, Suppliers, POS mapping and Activity sections.
- An ungrouped outlet needs its own Items, Inventory, Recipes, Suppliers and POS connection/mapping configuration until it is added to a group.
- The view makes scope explicit: item rows can show whether a value comes from the HQ setup or an outlet override; inventory and supplier settings are outlet-specific; POS mapping uses the outlet's own API key; and Activity records outlet-level changes.
- Supplier counts and lists honour outlet-specific exclusions. Excluded suppliers are omitted from the normal ungrouped-outlet list and can be restored from the Excluded filter, so the detail-page count matches the HQ Overview for each outlet.
- Grouped outlets should continue to inherit their group configuration rather than exposing competing individual customisation. Selecting one from the HQ Overview should take the user to its group context.

### Outlet-group activity

- **Implemented prototype:** the outlet-group page includes an **Activity** tab.
- Record configuration changes relevant to the group, including items, recipes, suppliers, inventory records and features being enabled, disabled, excluded, included, added or removed. Use **disabled/enabled** for HQ-wide state and **excluded/included** for scope-specific availability.
- Each entry uses the shared HQ audit-log format: a module-coloured dot, 14px activity text, 11px metadata for date/time, module and user, and a trailing navigation chevron. The scope field is omitted on detail pages because the current outlet group or outlet already supplies that context.
- Outlet-group Outlets, Inventory and Suppliers tables use the shared table typography used by Recipes; item names use the common medium-weight treatment rather than browser-default bold text.

### Split an outlet into a new group without losing its setup

- **Implemented prototype:** each outlet’s action menu on the outlet-group **Outlets** tab and inside the HQ Overview group accordions includes **Split into new group**. It creates a new group for that outlet and defaults to copying the current group’s setup.
- The default safe path should create a new outlet group using a copy of the current group’s configuration, then move the outlet into it. This preserves its items, inventory setup and UOMs, recipes, supplier settings and relevant POS mapping.
- The confirmation step should make the alternative explicit: **Use the current group’s setup** (recommended) or **Start with HQ settings**. The latter should warn that it may substantially change what the outlet can order, count or use.
- After the move, the new group becomes independent: future changes to either group do not affect the other. This prevents a removed outlet silently reverting to the generic HQ configuration.
- **Implemented prototype:** group settings include **Copy setup**, which remains available after a group is created or split. The user selects a source group and the sections to overwrite; historical data, users and API keys are excluded.
- **Implemented prototype:** supplier relationship settings use a left-hand scope navigator: **Default** applies to all HQ-managed groups and outlets, while saved overrides appear beneath it. **Add override** separates outlet-group selection from individual-outlet selection (including grouped and ungrouped outlets); each scoped page exposes its effective scope and a Delete action.

## Delivery status and gaps

### Status definitions

- **Built:** the intended interaction works in the prototype.
- **Partial:** the screen or interaction exists, but a material part of the flow is incomplete.
- **Not built:** absent or represented only by a non-functional control.
- **Product decision:** behaviour or ownership remains undefined.

Prototype status does not imply backend integration. Browser-local state is used for selected demonstration flows; outlet-group assignments persist through refreshes until the prototype is reset.

### Current delivery snapshot

| Area | Status | Remaining work |
|---|---|---|
| HQ creation and first outlet group | Built | Replace browser-local state with durable records and define production validation/error handling. |
| HQ overview, groups and outlet assignment | Partial | Define removal consequences; linked outlets and group structure now persist locally until reset. |
| HQ suppliers | Partial | Persist relationship settings, lifecycle changes and dependency reporting. |
| HQ items | Partial | Complete locally retained Create item, then persist catalogue, access and exception state. |
| HQ price changes | Partial | Confirm the page’s product scope and review workflow before finalising it; then persist review state. |
| HQ inventory | Partial | Persist setup; define Group SKU dependency safeguards and views. |
| HQ recipes | Partial | Fully flesh out creation and editing, then persist recipes, availability, history and variation changes. |
| HQ POS mapping | Partial | Fully flesh out the end-to-end mapping flow and its dependency rules. |
| Cost and pricing model | Product decision | Define the effective unit-cost calculation and display rules across HQ, group and outlet scopes. |
| HQ users | Built | Replace the hard-coded prototype directory with real data and permissions. |
| Activity | Partial | Write all actions to one durable audit trail. |
| HQ lifecycle | Not built | Define and implement an HQ-wide enable/disable lifecycle. |

### Admin and Procure ownership

The intended split is by lifecycle stage rather than by surface alone: Admin supports provisioning, governance and CS-assisted onboarding; Procure supports ongoing buyer self-service.

In the Admin HQ supplier search, an Admin user can add an Active supplier directly. The Procure-facing equivalent can retain **Contact Nomni to add** where supplier activation needs Nomni involvement.

| Capability | Admin | Procure |
|---|---|---|
| Create or disable an HQ | Owns | — |
| HQ Owner management | Owns | View only |
| HQ details | Support/override | Owns day-to-day changes |
| Outlet groups, suppliers, items and inventory | Onboarding/support | Owns ongoing changes |
| Recipes | Fallback/support | Owns |
| Overview and Activity | Read-mostly support/audit view | Primary buyer dashboard |
| Routine HQ-user linking | Support path | Owns ongoing changes |

### Cross-cutting implementation gaps

- Backend/API integration, durable prototype state, roles and permissions, shared validation, loading/error states and accessibility review are not complete.
- Confirmation, undo, notifications and audit conventions are only partially consistent.
- Complex tables and modals still need a systematic responsive review.

### Suggested next work

1. Confirm Admin/Procure ownership and permission boundaries.
2. Extend durable prototype state across HQ configuration, not only creation flows.
3. Connect Health check and Activity to the same change events used by interactions.
4. Complete disconnected actions and align confirmation, error and notification patterns.
