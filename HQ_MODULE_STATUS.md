# HQ Module — Prototype Status and Gaps

Last reviewed: 14 August 2026

## Purpose

This document tracks what has been prototyped for the multi-outlet HQ module, what is only partially represented, and what still needs to be designed or built.

The current prototype is primarily in the Admin context. Some capabilities may ultimately belong in Procure rather than Admin; product ownership and permissions will be decided later.

## Status definitions

- **Built:** The intended interaction works within the prototype.
- **Partial:** Some screens or interactions exist, but the flow is incomplete.
- **Not built:** The capability is absent or represented only by a non-functional control.
- **Product decision:** The experience cannot be completed until its ownership or behaviour is defined.

Prototype status does not imply backend integration or persistent data. Unless stated otherwise, interactive changes reset after navigation or refresh; the new-HQ setup journey is retained in local browser storage.

## Current focus: HQ creation

Target journey:

`Create HQ form → validation → successful creation → new HQ overview → first management actions`

Recommended model: create an empty HQ first, then guide the administrator to add outlets and create the first outlet group.

| Part | Status | What exists | Gap / next step |
|---|---|---|---|
| Create HQ form | Built | Company, HQ name and add-ons | Intentionally limited to details required for managing HQ data |
| Required fields | Built | Company and HQ name are validated with inline errors and focus on the first invalid field | Confirm the production validation rules |
| Create HQ submission | Built | The button validates the form, stores the new HQ for the prototype session and opens its Overview | Replace session storage with backend creation when implemented |
| Duplicate checks | Not built | — | Represent duplicate HQ name/company handling |
| Creation success | Built | Successful submission opens the newly created HQ Overview and shows a one-time Freemium-style “HQ created” toast | — |
| New HQ record | Partial | The new HQ record is available on its Overview for the current browser session | Add it to the Buyers listing and backend when persistence is implemented |
| Post-creation destination | Built | The new HQ opens directly on its empty Overview | — |
| Empty HQ state | Built | All tabs remain visible. Items, Inventory and Recipes use stable empty-state copy with prerequisite-aware CTAs; Suppliers is immediately actionable; Activity shows no activity yet | — |
| First outlet group | Built | New group inherits the current HQ, retains its details and selected outlets across refreshes in local browser storage, returns to Overview and links to its populated details page | Replace local storage with backend persistence |
| New-HQ Overview progression | Built | The standard summary strip starts at zero and updates with outlet counts; Recent activity appears from HQ creation and Health check appears when the first group provides data to assess | Connect the generated events and checks to production data |
| Cancel / unsaved changes | Partial | Cancel returns to Buyers | Add an unsaved-changes warning once the form has been edited |
| Persistence | Partial | The newly created HQ is retained for the current browser session | It is not yet added permanently to the Buyers listing or backend |
| Submission errors | Not built | — | Add a general failure state and retry path |

## Admin HQ flow inventory

| Area | Flow | Status | What exists | Gap / next step |
|---|---|---|---|---|
| Discovery | Open HQ & Outlet Groups from Buyers | Built | Tab routing, listing, search, pagination and expandable HQ rows | Connect remaining demonstration records to complete destinations |
| Discovery | Open an HQ | Partial | Garden Cuisine HQ opens the full HQ Settings prototype | Other HQs do not have complete destinations |
| Discovery | HQ listing row actions | Partial | Action menus open | Many Edit, Delete, View and Remove actions have no handler |
| HQ details | View HQ Overview | Built | Metadata, statistics, health check, activity, groups and ungrouped outlets | Replace fixed data when persistence is introduced |
| HQ details | Edit HQ details | Partial | Populated form; Save returns to HQ Settings | Add validation, confirmation and persistence |
| HQ details | Activate or deactivate HQ | Not built | No lifecycle status is currently shown on the HQ page | Define lifecycle rules and build the status flow |
| Outlet groups | Create outlet group | Built | HQ preselection works for existing and newly created HQs; details, outlet search, filters and selection work; the result is added to Overview for the browser session | Replace session storage with backend persistence |
| Outlet groups | Expand group and view outlets | Built | Expandable rows show assigned outlets and POS state | — |
| Outlet groups | Search groups and outlets | Built | Fixed-width search covers group and outlet names in existing and newly populated HQ states | — |
| Outlet groups | Group row actions | Partial | Three-dot menus expose Add outlets, Settings and Delete group; Add outlets opens a search-first in-page picker of Procure outlets not yet attached to an HQ, with company and cluster filters, capped results and select/deselect-all for the filtered result set | Replace the prototype catalogue with server-side search and pagination |
| Outlet groups | Edit group settings | Built | Overview and group-details use the same centred settings-dialog design; name and description changes persist in local browser storage | Replace local storage with backend persistence |
| Outlet groups | Delete group | Partial | Confirmation and in-page removal exist | Define dependencies, persistence and recovery |
| Outlet assignment | Add ungrouped outlet to group | Partial | Selection modal moves the outlet in the current page | Retain the assignment |
| Outlet assignment | Add outlets from group editor | Partial | Search, filters, multi-select and confirmation work | Retain the assignment |
| Outlet assignment | Remove outlet from group | Partial | Confirmation removes it from the current group | Define and display its ungrouped state consistently |
| Outlet assignment | Remove outlet from HQ | Partial | Confirmation flows exist | Define consequences for items, suppliers, recipes, users and Procure access |
| Group overview | View statistics and summaries | Built | Item, outlet, supplier and recipe summaries | Replace fixed data when persistence is introduced |
| Group items | Search, filter, sort and paginate | Built | Listing controls work | — |
| Group items | Edit item overrides | Partial | Custom name and item modal interactions work | Retain saved overrides |
| Group items | Enable or disable items | Partial | Confirmation and supplier-blocked states exist | Retain state and write audit events |
| Group items | Manage availability | Partial | Manage Items modal and toggles exist | Apply and retain changes |
| HQ items | Browse master items | Built | Search, filters, sorting and pagination | — |
| HQ items | Inspect UOM and access | Built | UOM and group-access controls are interactive | Retain changes |
| HQ items | Create catalogue item | Partial | Details, supplier, tax, UOM, MOQ, inventory and access fields | Add validation and create a retained item record |
| HQ items | Add existing catalogue items | Partial | Three-step selection and configuration wizard; the prototype directory provides at least five catalogue items for every searchable supplier and displays only items from suppliers linked to the HQ | Retain added items in the backend |
| HQ items | Group price and MOQ exceptions | Partial | Add, edit, duplicate validation and removal work | Retain exceptions; consider effective dates |
| HQ suppliers | Browse suppliers | Built | Supplier listing and View Supplier Items shortcut | — |
| HQ suppliers | Link existing suppliers | Built | A shared search-first dialog finds suppliers in the large Procure directory by name, UEN or ABN; linked suppliers persist locally and feed the HQ catalogue | Replace the prototype directory with server-side search and pagination |
| HQ suppliers | Add supplier to Procure | Built | A no-result path captures supplier name, UEN/ABN, category, address and optional contact details, then links the new record to the HQ | Add duplicate registration checks, validation and backend persistence |
| HQ suppliers | Disable or reactivate supplier | Partial | Warning and cascade choices are represented | Retain changes and define dependency reporting |
| Group suppliers | View supplier availability | Built | Active and inactive states are represented | — |
| Group suppliers | Disable or reactivate by group | Partial | Item cascade choices are represented | Retain changes |
| Inventory | Browse HQ inventory | Built | Search, filters, pagination and expandable rows | — |
| Inventory | Add catalogue item | Built | One-screen picker with inline Inventory UOM, conversion to order UOM, Flip units, Par and save-and-add-more behaviour | — |
| Inventory | Add recipe or sub-recipe | Partial | Two-step picker and confirmation | Retain the result |
| Inventory | Add Group SKU | Not built | Menu option exists | Design and build the flow |
| Inventory | Link suppliers | Partial | Multi-select modal and confirmation | Retain links |
| Recipes | Browse recipe library | Built | Search, filters, sorting, pagination and food-cost indicators | — |
| Recipes | Configure food-cost threshold | Partial | Settings update highlighting during the session | Retain the threshold |
| Recipes | View group assignments | Built | Assignment dialog displays groups and variations | Confirm whether assignments should also be editable here |
| Recipes | Create basic recipe | Partial | Name, portion, group chips, ingredients, UOM and instructions | Complete tags, calculations, Copy Data, Save & Create Another and persistence |
| Recipes | Edit existing recipe | Built | Detailed editor, ingredients, instructions, pricing and save state | Retain changes |
| Recipe variations | Create, rename and delete | Built | Variation lifecycle is interactive | Retain changes |
| Recipe variations | Assign to outlet groups | Built | Conflict warnings and reassignment flows exist | Retain assignments and confirm backend rules |
| Recipe variations | Propagate ingredient changes | Built | Pending updates and bulk-apply flows exist | Retain updates |
| Recipe history | Save named versions | Built | Version modal, history panel and snapshots | Add durable history and permissions |
| Recipe history | Preview and restore versions | Built | Full or selected restoration with compatibility checks | Add durable history |
| Recipe data | Copy between variations | Built | Searchable picker and overwrite warning | Retain copied data |
| Activity | Browse activity | Built | Filters, date range and pagination | — |
| Activity | Record prototype actions | Partial | HQ creation and newly created outlet groups appear in the new-HQ Overview activity summary; the full Activity tab remains static | Write all prototype actions into one retained event collection |
| HQ users | View attached users | Partial | A Users panel exists in the HTML | Expose it in the main navigation or remove it |
| HQ users | Add and manage users | Not built | Add User control exists | Design invitations, roles, permissions and removal |

## Admin and Procure ownership gaps

| Question | Status | Decision needed |
|---|---|---|
| Which HQ capabilities belong in Admin? | Product decision | Define platform-operator responsibilities |
| Which HQ capabilities belong in Procure? | Product decision | Define buyer-controlled responsibilities |
| Which capabilities appear in both contexts? | Product decision | Define shared functions and permission differences |
| Who can create an HQ? | Product decision | Nomni administrator only, buyer administrator, or both |
| Who can manage outlets and groups? | Product decision | Define role and scope rules |
| Who controls suppliers, master items and exceptions? | Product decision | Separate commercial administration from buyer operations |
| Who controls recipes and inventory? | Product decision | Confirm whether Admin needs operational controls or visibility only |
| How is an HQ provisioned into Procure? | Not built | Define creation, activation and first-login hand-off |
| How are Admin changes communicated to buyers? | Not built | Define notifications and activity history |

## Cross-cutting implementation gaps

| Gap | Status | Notes |
|---|---|---|
| Persistent prototype data | Partial | New HQ, outlet group, linked suppliers, catalogue items and generated activity use local browser storage and survive refreshes; Activity includes a reset control | Replace local storage with backend persistence |
| Backend/API integration | Not built | Prototype is currently standalone HTML and JavaScript |
| Roles and permissions | Not built | Required before Admin and Procure ownership can be finalised |
| Validation standards | Partial | Individual controls validate selectively; no shared pattern |
| Loading, empty and error states | Partial | Some empty states exist; loading and failure states are largely absent |
| Confirmation and undo conventions | Partial | Destructive confirmation exists in places but is inconsistent |
| Notifications | Partial | Outlet-group creation uses the Freemium success-toast pattern; other flows remain inconsistent |
| Audit trail | Partial | Activity UI exists and the new-HQ Overview simulates creation events, but actions do not generate a shared durable record |
| Accessibility review | Not reviewed | Keyboard, focus, semantics and screen-reader behaviour need review |
| Responsive behaviour | Partial | Navigation adapts; complex HQ tables and modals need systematic review |

## Suggested next work

1. Define Admin versus Procure ownership and permissions.
2. Extend the session-backed prototype state beyond HQ and outlet-group creation.
3. Connect Health check and Activity to the same simulated data and events used by the flows.
4. Close disconnected and duplicate routes, particularly outlet-group settings and hidden HQ Users.
5. Standardise loading, error, confirmation and notification patterns across HQ flows.

## Change log

| Date | Change |
|---|---|
| 17 August 2026 | Connected Inventory row Edit actions to an HQ-specific item settings page based on PWF-1694, with Inventory UOM and par settings, read-only catalogue UOMs, editable custom counting UOM conversions and locally persisted updates. |
| 17 August 2026 | Realigned the HQ Inventory item settings page to the existing Procure Inventory settings pattern: matching header and form rhythm, grey Counting UOM card, aligned Par level row and single fixed Save action, while retaining HQ-wide settings behaviour. |
| 17 August 2026 | Reworked “Add to inventory” to match the existing Inventory flow: removed the stepper, moved Inventory UOM, conversion and Par configuration inline, added Flip units and “Save selected & add more”, and removed the redundant group-access step. |
| 17 August 2026 | Aligned supplier-catalogue Step 2 with the existing add-item model: SKU selection happens in Step 1, UOM rows no longer have separate checkboxes, and zero price/MOQ values represent an unused UOM. |
| 17 August 2026 | Aligned the HQ Items list with the live market-list pattern: multi-UOM SKUs now use expandable option rows, while single-UOM SKUs show price and MOQ directly. |
| 17 August 2026 | Connected HQ-level UOM enablement to the Items list, so option counts and expanded UOM rows update immediately when a UOM is enabled or disabled. |
| 17 August 2026 | Connected “Add SKUs to inventory” to the current HQ Items list, including enabled UOMs and newly added items, and aligned its stepper with the supplier-catalogue flow. |
| 17 August 2026 | Improved multi-UOM access summaries in the Items list: shared access is shown directly, while genuinely different access links to the complete UOM-level Access view. |
| 17 August 2026 | Removed the populated-HQ price-review warning from the new-HQ Items state and prevented empty-state refreshes from restoring it with a broken stacked layout. |
| 17 August 2026 | Connected group, outlet and UOM changes in an item’s Access tab to the Groups with access details in the Items table. |
| 17 August 2026 | Added filter-aware Select all/Deselect all to the supplier-catalogue item picker and standardised outlet-picker Select all controls as 14px text actions across Admin and Procure HQ flows. |
| 14 August 2026 | Standardised Create outlet group and both Add outlets flows on one search-first picker with Company/Cluster filters, filter-aware select all and a visible removable list of selected outlets. |
| 14 August 2026 | Aligned the HQ Overview and group-details Add outlets dialogs on the same Procure outlet catalogue, compact centred layout, result-row styling, metadata, selected-outlet panel, counts and Add-button behaviour; corrected the selected-count/list mismatch. |
| 14 August 2026 | Made outlet-picker search fields active on dialog open, applied the Styleguide green focus border and 18% focus ring to picker form controls, and strengthened the search-first empty-state hierarchy. |
| 14 August 2026 | Extended the Styleguide picker focus treatment across Admin HQ and Procure HQ outlet-group pages, and automatically focused the primary search field in item, inventory and recipe picker dialogs. |
| 14 August 2026 | Moved outlet selection on Create outlet group into the shared Add outlets dialog; confirmed selections now close the dialog and appear as a removable list on the page. |
| 14 August 2026 | Fixed Add outlets result-state drift by locking the shared picker body to 420px and normalising selection IDs so highlighted results, the count badge and selected-outlet rows remain synchronised. |
| 14 August 2026 | Corrected a shared selected-panel render failure after the first choice, prevented picker filters from clipping, and removed the active-looking focus treatment from disabled confirmation buttons. |
| 14 August 2026 | Standardised the selected-panel empty state across all three Add outlets instances with muted “No outlets selected” text and lighter supporting copy. |
| 14 August 2026 | Corrected the Create outlet group footer/sidebar alignment and revised the outlet empty state with a primary Add outlets CTA plus a lighter header text action. |
| 14 August 2026 | Aligned the Create outlet group back link with other Admin HQ pages, using the chevron treatment and the parent HQ name from the page URL. |
| 14 August 2026 | Standardised the group-details Items search and HQ Overview search at a fixed 320px × 38px, with matching icon treatment and the Styleguide green focus border plus 18% ring. |
| 14 August 2026 | Moved Delete group from the group-details page header into the Settings dialog while retaining the destructive-action confirmation. |
| 14 August 2026 | Aligned outlet-group detail tabs with the HQ tab system: full-width rule, 28px spacing, 46px tab height, darker inactive labels and the same active underline treatment. |
| 14 August 2026 | Replaced the ambiguous supplier count “13 of 14” with the active supplier total only, matching the count treatment used by the other tabs. |
| 17 August 2026 | Create outlet group now redirects to the selected parent HQ using an explicit HQ route parameter, preserving the created-group state and success toast on arrival. |
| 17 August 2026 | Fixed Edit details for newly created HQs so it opens a pre-filled editor for the saved HQ, persists name/company changes locally and returns to that same HQ page. |
| 14 August 2026 | Removed the established-HQ price-review banner from newly created HQs, which have no invoice price changes to review. |
| 14 August 2026 | Fixed newly added and previously saved catalogue items being treated as inactive because their prototype access and active-state defaults were missing. |
| 14 August 2026 | Expanded the prototype supplier catalogue to at least five items for every searchable Procure supplier. |
| 14 August 2026 | Added a one-time success toast when a newly created HQ first opens. |
| 14 August 2026 | Unified supplier linking around Procure-directory search plus new-supplier capture, limited catalogue items to linked suppliers, improved the Add Item stepper and added locally retained Activity events with a reset control. |
| 14 August 2026 | Retained the newly created group across refreshes, connected it to a populated group-details page, restored the new-HQ summary strip and unified the centred group Settings dialog. |
| 14 August 2026 | Changed Add outlets to use a search-first, capped catalogue of Procure outlets not already attached to an HQ, with outlet search plus company and cluster filters. |
| 14 August 2026 | Connected outlet-group creation to the originating HQ and simulated the new group and selected outlets on Overview. |
| 14 August 2026 | Added progressive new-HQ Overview content: HQ creation activity immediately, then Health check and group creation activity after the first group. |
| 14 August 2026 | Standardised Overview group controls with fixed-width search and Add outlets, Settings and Delete group actions. |
| 14 August 2026 | Standardised HQ empty-state copy and prerequisite-aware CTAs for Items, Inventory and Recipes. |
| 14 August 2026 | Aligned HQ page-title typography, Admin Buyers pagination and outlet-group creation toast with Freemium conventions. |
| 13 August 2026 | Added explanatory prerequisite empty states for Items, Inventory, Recipes and Activity. |
| 13 August 2026 | Made supplier linking available immediately after HQ creation, with an empty Suppliers state. |
| 13 August 2026 | Simplified Create HQ and Edit HQ by removing address, logo and contact fields. |
| 13 August 2026 | Completed the Create HQ validation, submission and empty Overview flow. |
| 13 August 2026 | Created the initial tracker from the current Admin HQ prototype review. |
