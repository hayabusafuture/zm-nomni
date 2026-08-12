# PWF-1694 - Inventory counting UOM prototype log

This file tracks the design and prototype changes for Jira PWF-1694 in `Procure - Inventory.html`.

## Baseline snapshot

- Recorded: 6 August 2026, before adding the Counting UOMs section.
- File: `Procure - Inventory.html`
- SHA-256: `c6cc7bc23eeffae83959eb099049eb800e40fd80cb2e0dd2360c443ec413843b`
- Git state at capture: the HTML file already contained uncommitted prototype work from this design session.

### Behaviour at baseline

- Inventory contains Items, Lists and Activity views plus POS sync information.
- Each item row has actions for stock adjustment, settings, changing list and deleting.
- `Edit settings` opens an in-page item settings view inside the same HTML file.
- The settings view contains one primary Inventory UOM, PAR level and designated receiving/deduction list.
- Known UOMs are derived from `knownUoms`, `catalogueUoms`, `orderUom`, `originalUom` and the existing item UOM.
- Selecting a known UOM leaves the conversion equation inactive.
- Selecting an unknown UOM requires one conversion against a selectable known UOM.
- `Flip units` switches between `1 new UOM = quantity known UOM` and `1 known UOM = quantity new UOM`, preserving the mathematical relationship.
- Saving normalises settings into the local prototype inventory store.
- There is no separate Counting UOMs section yet.

## Agreed PWF-1694 direction

- The primary Inventory UOM remains the UOM used to store inventory quantities and express PAR.
- Every known catalogue/order UOM is automatically available for stock counts and adjustments.
- Known UOMs appear automatically and cannot be removed from Counting UOMs.
- Users can add additional counting-only UOMs when the required UOM is not known by the catalogue.
- Manually added counting UOMs require a conversion against a known UOM and can be edited or removed.
- Stock counts and adjustments will eventually convert all entered quantities back to the primary Inventory UOM when saved.

## Change log

### 6 August 2026 - Counting UOM settings

- Added a combined Counting UOMs section below the primary Inventory UOM configuration.
- The primary Inventory UOM is always shown and labelled `Default`.
- Every known catalogue/order UOM appears automatically as a read-only catalogue row.
- Known conversions are shown when catalogue conversion data is available.
- Added `Add counting UOM` for units that are not already known or configured.
- Manually added UOMs require a quantity and reference known UOM.
- Manual conversion entry supports the established `Flip units` interaction.
- Manually added UOMs can be edited or removed before the settings form is saved.
- Manual counting UOMs are stored separately from known UOMs in `item.countingUoms`.
- Saving the main settings form commits the counting UOM draft; using the Inventory back action discards unsaved changes.
- Expanded the prototype catalogue with sample known UOMs and conversions so the new behaviour can be evaluated with newly added catalogue items.
- Counting UOM conversions now resolve live through an unsaved Inventory UOM conversion. For example, if the catalogue knows `1 ctn = 10 kg` and the user enters `1 ltr = 1 kg`, the table shows `1 ctn = 10 ltr`.
- Changing the Inventory UOM conversion quantity, known-UOM reference or Flip direction updates every resolvable catalogue row immediately.
- The unresolved fallback is `Complete Inventory UOM conversion` instead of the ambiguous `Available from catalogue`.

### 11 August 2026 - User-facing terminology

- Renamed the settings section from `Counting UOMs` to `Other UOMs` so the interface does not present counting UOM as a formal UOM type.
- Updated the helper text to explain that these UOMs are also available for stock counts and adjustments.
- Renamed `Add counting UOM` to `Add UOM` and the editor field from `Counting UOM` to `UOM`.
- Changed the primary UOM badge from `Default` to `Primary`.
- Changed the manual source label from `Added manually` to `Added by you`.
- Fixed the Other UOM rows to use consistent source and action columns so `Catalogue`, `Added by you`, `Primary`, Edit and Remove align vertically.
- Removed the outer border and rounded container from the Other UOM list while retaining the dividers between rows.
- Removed the left and right padding from the Other UOM rows while retaining their vertical padding.
- Renamed `Other UOMs` to `Available UOMs` because the list includes the primary Inventory UOM as well as additional UOMs.
- Shortened the helper text to `Use these UOMs for stock counts and adjustments. Quantities convert to the primary UOM when saved.`
- Removed the visible `Available UOMs` section label. The first helper sentence is now bold, with `Quantities convert to the primary UOM when saved.` on the next line.
- Grouped the UOM helper, rows, Add UOM action and editor inside one soft neutral section without restoring the table's outer border.
- Moved the edit form directly beneath the selected user-added UOM row; the Add UOM form remains below the list.
- Replaced the user-specific `Added by you` source with `Custom` so the label remains accurate for every viewer.
- Removed the `Primary` badge because the row's `Inventory UOM` description already provides sufficient context.
- Updated the catalogue-add scenario so Chicken Breast initially uses custom Inventory UOM `pch`; its known catalogue UOMs remain `kg` and `ctn`.
- Separated the selected Inventory UOM from the known catalogue UOM set so a custom selection correctly requires conversion.
- Replaced the assumed `1 pch = 1 kg` conversion with the previously defined custom conversion `1 pch = 0.2 kg`.
- Replaced `primary UOM` in the helper copy with the established `Inventory UOM` term.
- Tightened the spacing between the ingredient warning and the UOM availability section by removing the warning's bottom margin and reducing the Inventory UOM row's bottom margin.
- Added a stable settings permalink using `?view=settings&itemId=chicken-breast-fillet-1kg`. Opening it in a fresh browser seeds the referenced prototype item, while entering and leaving settings updates browser history.
