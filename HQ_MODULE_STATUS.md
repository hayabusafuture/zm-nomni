# HQ Module — Prototype Status and Gaps

Last reviewed: 13 August 2026

## Purpose

This document tracks what has been prototyped for the multi-outlet HQ module, what is only partially represented, and what still needs to be designed or built.

The current prototype is primarily in the Admin context. Some capabilities may ultimately belong in Procure rather than Admin; product ownership and permissions will be decided later.

## Status definitions

- **Built:** The intended interaction works within the prototype.
- **Partial:** Some screens or interactions exist, but the flow is incomplete.
- **Not built:** The capability is absent or represented only by a non-functional control.
- **Product decision:** The experience cannot be completed until its ownership or behaviour is defined.

Prototype status does not imply backend integration or persistent data. Unless stated otherwise, interactive changes reset after navigation or refresh.

## Current focus: HQ creation

Target journey:

`Create HQ form → validation → successful creation → new HQ overview → onboarding actions`

Recommended model: create an empty HQ first, then guide the administrator to add outlets and create the first outlet group.

| Part | Status | What exists | Gap / next step |
|---|---|---|---|
| Create HQ form | Built | Company, HQ name and add-ons | Intentionally limited to details required for managing HQ data |
| Required fields | Built | Company and HQ name are validated with inline errors and focus on the first invalid field | Confirm the production validation rules |
| Create HQ submission | Built | The button validates the form, stores the new HQ for the prototype session and opens its Overview | Replace session storage with backend creation when implemented |
| Duplicate checks | Not built | — | Represent duplicate HQ name/company handling |
| Creation success | Built | Successful submission opens the newly created HQ Overview | A separate success message is intentionally omitted |
| New HQ record | Partial | The new HQ record is available on its Overview for the current browser session | Add it to the Buyers listing and backend when persistence is implemented |
| Post-creation destination | Built | The new HQ opens directly on its empty Overview | — |
| Empty HQ state | Built | All tabs remain visible. Items, Inventory and Recipes explain unmet prerequisites; Suppliers is immediately actionable; Activity shows no activity yet | — |
| Cancel / unsaved changes | Partial | Cancel returns to Buyers | Add an unsaved-changes warning once the form has been edited |
| Persistence | Partial | The newly created HQ is retained for the current browser session | It is not yet added permanently to the Buyers listing or backend |
| Submission errors | Not built | — | Add a general failure state and retry path |

## Admin HQ flow inventory

| Area | Flow | Status | What exists | Gap / next step |
|---|---|---|---|---|
| Discovery | Open HQ & Outlet Groups from Buyers | Built | Tab routing, listing, search, pagination and expandable HQ rows | Connect remaining demonstration records to complete destinations |
| Discovery | Open an HQ | Partial | Garden Cuisine HQ opens the full HQ Settings prototype | Other HQs do not have complete destinations |
| Discovery | HQ listing row actions | Partial | Action menus open | Many Edit, Delete, View and Remove actions have no handler |
| HQ details | View HQ Overview | Built | Status, metadata, statistics, health check, activity, groups and ungrouped outlets | Replace fixed data when persistence is introduced |
| HQ details | Edit HQ details | Partial | Populated form; Save returns to HQ Settings | Add validation, confirmation and persistence |
| HQ details | Activate or deactivate HQ | Not built | Active status is displayed | Define lifecycle rules and build the status flow |
| Outlet groups | Create outlet group | Partial | HQ preselection, details, outlet search, filters and selection work | Retain the created group and show it on HQ Overview |
| Outlet groups | Expand group and view outlets | Built | Expandable rows show assigned outlets and POS state | — |
| Outlet groups | Search groups and outlets | Built | Search covers group and outlet names | — |
| Outlet groups | Edit group | Partial | Chargrill opens the group editor | Connect all group rows consistently |
| Outlet groups | Edit group settings | Partial | Settings modal edits name and description | Retain saved changes and reconcile the separate Settings page |
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
| HQ items | Add existing catalogue items | Partial | Three-step selection and configuration wizard | Retain added items |
| HQ items | Group price and MOQ exceptions | Partial | Add, edit, duplicate validation and removal work | Retain exceptions; consider effective dates |
| HQ suppliers | Browse suppliers | Built | Supplier listing and View Supplier Items shortcut | — |
| HQ suppliers | Link existing suppliers | Partial | Multi-select picker and confirmation work | Retain linked suppliers |
| HQ suppliers | Find supplier through Admin | Partial | Opens the existing Add Supplier page | Preserve HQ context and return journey |
| HQ suppliers | Disable or reactivate supplier | Partial | Warning and cascade choices are represented | Retain changes and define dependency reporting |
| Group suppliers | View supplier availability | Built | Active and inactive states are represented | — |
| Group suppliers | Disable or reactivate by group | Partial | Item cascade choices are represented | Retain changes |
| Inventory | Browse HQ inventory | Built | Search, filters, pagination and expandable rows | — |
| Inventory | Add catalogue item | Partial | Two-step picker and inventory-UOM configuration | Retain the result |
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
| Activity | Record prototype actions | Not built | Static audit events are displayed | Write new events when prototype actions occur |
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
| Persistent prototype data | Not built | Most state resets after navigation or refresh |
| Backend/API integration | Not built | Prototype is currently standalone HTML and JavaScript |
| Roles and permissions | Not built | Required before Admin and Procure ownership can be finalised |
| Validation standards | Partial | Individual controls validate selectively; no shared pattern |
| Loading, empty and error states | Partial | Some empty states exist; loading and failure states are largely absent |
| Confirmation and undo conventions | Partial | Destructive confirmation exists in places but is inconsistent |
| Notifications | Not built | No consistent success/error notification model across flows |
| Audit trail | Partial | Activity UI exists but actions do not generate durable records |
| Accessibility review | Not reviewed | Keyboard, focus, semantics and screen-reader behaviour need review |
| Responsive behaviour | Partial | Navigation adapts; complex HQ tables and modals need systematic review |

## Suggested next work

1. Complete the HQ creation prototype journey.
2. Decide the post-creation onboarding sequence for outlets and groups.
3. Define Admin versus Procure ownership and permissions.
4. Add lightweight session persistence so connected prototype flows can be tested end to end.
5. Close disconnected and duplicate routes, particularly outlet-group settings and hidden HQ Users.

## Change log

| Date | Change |
|---|---|
| 13 August 2026 | Added explanatory prerequisite empty states for Items, Inventory, Recipes and Activity. |
| 13 August 2026 | Made supplier linking available immediately after HQ creation, with an empty Suppliers state. |
| 13 August 2026 | Simplified Create HQ and Edit HQ by removing address, logo and contact fields. |
| 13 August 2026 | Simplified Create HQ and Edit HQ by removing address, logo and contact fields. |
| 13 August 2026 | Simplified Create HQ and Edit HQ by removing address, logo and contact fields. |
| 13 August 2026 | Simplified Create HQ and Edit HQ by removing address, logo and contact fields. |
| 13 August 2026 | Simplified Create HQ and Edit HQ by removing address, logo and contact fields. |
| 13 August 2026 | Completed the Create HQ validation, submission and empty Overview flow. |
| 13 August 2026 | Completed the Create HQ validation, submission and empty Overview flow. |
| 13 August 2026 | Completed the Create HQ validation, submission and empty Overview flow. |
| 13 August 2026 | Created the initial tracker from the current Admin HQ prototype review. |
