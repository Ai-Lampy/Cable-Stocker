# Changelog

## v1.1.2 — 2026-10-14

Previous version: v1.1.1.

- Set table header/data rows to 35 px at 100% table zoom, including full-cell colour pickers. Long text and length-chip lists scroll inside their cells instead of increasing row height.
- Updated: `css/app.css`, `js/version.js`, `UPDATES.md`, `CHANGELOG.md`.
- Created/deleted: none. JSON schemas and original inputs unchanged.
- Validation: checked CSS sizing and version consistency locally. Browser testing not run; fresh approval required. Table zoom scales the 35 px base height. No upload or deployment performed.

## v1.1.1 — 2026-10-14

Previous version: v1.1.0. Local update for manual upload; not deployed by the builder.

### Changes

- Show only the selected vendor’s length colours in its active unit. New and pasted rows inherit both values; remove vendor/unit columns and show context above the table. Preserve hidden vendors in edits, deletions and dataset downloads. Error links identify hidden vendor assignments without selecting a different vendor’s row.
- Replace small swatches with colour-filled table cells and a scrollable Lampy palette matching the supplied reference image. Apply colour directly to the table cell, without inset bubbles. Support keyboard selection, No Colour, typed aliases through the cell editor, and correct placement with table zoom.
- Move Save table to the far right and make it prominent on every table. Successful saves clear only that table’s edit/addition highlights; later edits highlight again. Persist visual baselines separately from the original import/export-review baseline. Invalid input and blocked saves retain highlights.

### Files

Updated: `js/app.js`, `js/grid.js`, `js/version.js`, `css/app.css`, `README.md`, `UPDATES.md`, `CHANGELOG.md`.

Created: none. Deleted: none. Supplied reference image, JSON examples, palette, schemas and logos unchanged.

### Validation and limitations

- All 63 automated regression tests passed, including JSON import previews, schema preservation and Excel round trips.
- Approved local Chromium testing passed: vendor/unit isolation, inherited context, multi-row paste, sorted deletion, full-dataset preview, mouse/keyboard palette choice, zoom placement, table-only highlight clearing, reload persistence, subsequent edit highlighting, retained export review, invalid cell rejection and concurrent-tab save protection. No browser console errors observed.
- Modern browser popover support is required for the styled palette. Firefox/Safari and native Excel were not tested for this update. Existing loom export compatibility limitation remains.
- No GitHub files were changed and no deployment was performed or verified.

## v1.1.0 — 2026-10-13

Previous version: v1.0.1. Local feature release, ready for user upload; not deployed by the builder.

### Changes

- Automatically add Lighting Vendors entries to Vendor Manifest. Preserve existing paths; generate lowercase underscore filenames for missing vendors and avoid path collisions.
- Add a visible category dropdown with typed custom names. Recognised names/aliases populate associated cable types and connector defaults, leaving lengths empty.
- Add generator-only adaptor markers. Show direction editing only for marked adaptors; retain existing Lampy direction values and connector schemas.
- Add Save to every table, including committing a pending cell before saving locally. Invalid cells and storage failures remain visible.
- Add Length colour Settings with vendor, unit, length and three colour fields, using the supplied Lampy palette. Reject ambiguous aliases and unsupported colours; show matching colour bands on length chips.
- Add separate length_colours.json download and preserve existing saved references across the upgrade.
- Preserve adaptor markers through project backups and Excel. Older workbooks without the optional adaptor column remain importable.

### Files

Updated: `js/app.js`, `js/model.js`, `js/grid.js`, `js/excel.js`, `js/version.js`, `css/app.css`, `tests/core.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`.

Created: `data/length_colours.json` (new generator dataset, initially empty).

Supplied dependency to upload: `reference/colour_options.json` (unchanged user-provided Lampy palette).

Deleted: none. Original reference JSONs, brief/setup instructions and logos unchanged.

### Validation and limitations

- 63 automated tests passed, including vendor synchronisation/collisions, category seeding, adaptor changes/backups/Excel, legacy workbooks, palette aliases and duplicate colour assignments.
- Approved local Chromium testing verified all 15 manifest vendors and a newly added vendor, Save of a pending cell, category dropdown/autofill/custom entry, adaptor-only direction, reference adaptor controls, colour validation/save/reload/export, length bands, adaptor Excel round trip, loom-component Save and no console errors.
- Save uses local browser storage. Downloads are still required for independent backups and manual hosting updates.
- Renaming/removing a Lighting Vendors entry does not delete old manifest entries. Review unused entries manually; generated paths do not create cable-stock files.
- Adaptor markers and length-colour settings are generator metadata. Existing runtime direction fields are preserved. Colour assignments use a separate generator JSON, not vendor project/Excel backups or Lampy cable-stock JSON.
- No GitHub upload or deployment performed. Firefox, Safari and native Excel/LibreOffice were not tested. Existing V1 schema compatibility limits remain.

## v1.0.1 — 2026-10-13

Previous version: v1.0.0. Local patch release, ready for user upload; not deployed by the builder.

### Fix

- Re-importing unchanged cable-stock JSON now shows zero changes instead of counting every cable as both added and removed.
- Preview matches exact row content first, then unambiguous remaining names within each category. Actual modifications, additions, removals and row-order changes remain visible.
- Matching operates on a preview copy. Cancelling, import baselines, project-backup IDs and Lampy output schemas retain their existing behaviour.

### Files

Updated: `js/model.js`, `js/app.js`, `js/version.js`, `tests/core.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`.

Added: none. Deleted: none. Original reference JSONs and logos unchanged.

### Validation and limitations

- All 53 automated tests passed, including seven new JSON-preview regressions covering identical input, real changes, row order, duplicate names, metadata, category changes, loom removal and non-mutation.
- Authorised local Chromium tests verified zero changes for the original file, one modification for one edited length, cancellation without draft changes, accepted import with a fresh baseline, the v1.0.1 footer and no console errors.
- Stock JSON has no stable row IDs: renames and ambiguous duplicate-name edits remain additions/removals rather than guessed matches. Project backups continue to use their stored IDs.
- No GitHub changes or deployment checks were performed for this patch. Safari, Firefox and native Excel were not retested; the automated Excel regression suite passed. Existing v1.0.0 compatibility limits still apply.

## v1.0.0 — 2026-10-13

Initial local release. Previous version: none (handover inputs only).

### Changes

- Built a static, buildless cable-stock generator with relative asset/reference paths and one application version setting.
- Added vendor metadata, logos, unit selection without conversion, generator vendor versions, custom-field preservation and local drafts.
- Added category and Settings spreadsheets with keyboard navigation, rectangular copy/paste, range selection, drag fill, resize, sort/filter, zoom, alignment, wrapping and undo/redo.
- Added length chips, duplicate checks and copy/merge/replace reuse.
- Added structured composite looms with component counts and connector/length overrides in generator project JSON and Excel backups.
- Added authoritative-schema cable JSON import/export, category previews, imported baselines, yellow highlights, grouped review and non-blocking validation.
- Added complete/category Excel exports, blank templates, reviewed Merge/Replace imports, metadata preservation, worksheet mapping and component sheets.
- Added separate source-derived category/cable/connector datasets and exact-name Settings downloads, including the unchanged two-column manifest schema.

### Fixes verified during first-build testing

- Kept case variants of an alias within one reference entry valid.
- Made JSON comparison independent of object property order to avoid false Excel changes.
- Preserved direct Excel connector JSON edits and rejected conflicting endpoint edits.
- Preserved unchanged partially invalid fields through explicit workbook metadata.
- Retained and flagged duplicate Excel lengths instead of silently discarding them.
- Made paste/fill validation atomic and protected drafts against concurrent-tab overwrites.

### Files

Added: `.nojekyll`, `index.html`, `package.json`, `css/app.css`, `js/app.js`, `js/excel.js`, `js/grid.js`, `js/model.js`, `js/version.js`, `data/categories.json`, `data/cable_types.json`, `data/connector_types.json`, `vendor/xlsx.full.min.js`, `vendor/SHEETJS-LICENSE.txt`, `tests/core.test.mjs`, `UPDATES.md`, `CHANGELOG.md`.

Updated: `README.md`.

Deleted: none. Original brief/setup instructions, reference JSONs and all 15 logos remain unchanged.

### Validation

- 46 automated model/JSON/Excel/clipboard/reference tests passed.
- Local Chromium browser testing covered new vendors and unknown categories, example import, alias editing, yellow highlights, length entry/merge, rectangular and rejected invalid paste, undo/redo, drag fill, resizing/zoom, composite looms, complete Excel download/re-import, JSON copying/download, exact manifest download, Errors jump links, unit-change confirmation, autosave reload and concurrent-tab protection.
- App and references loaded successfully at a repository-style `/cable-generator/` subpath. Desktop and narrow layouts were inspected; the narrow layout had no document overflow. Browser console checks found no errors.
- Source checksums and exact logo filename case verified.
- No GitHub inspection, upload or deployment was performed. Deployment is not tested.

### Known compatibility limits

- The source schema has no demonstrated loom structure or vendor-version field. Newly authored looms and generator vendor versions stay in project/Excel backups, with an export warning. Existing imported custom fields remain preserved.
- Only the Christie cable filename/path is confirmed by the supplied manifest. Other output filenames need user confirmation.
- Run via HTTP(S); direct `file://` opening is unsupported. Clipboard buttons need browser permission.
- Desktop Excel, LibreOffice, Firefox and Safari were not used for native-engine validation. Excel accepts documented `.xlsx` layouts; formulas and unmapped/unknown columns are rejected with an explanation.
- Individual Excel cells have a 32,767-character limit; oversized row metadata requires a project JSON backup.
- The location of the manifest within the separate Lampy Paperwork deployment was not inspected or guessed.
