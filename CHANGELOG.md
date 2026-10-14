# Changelog

## v1.1.11 — 2026-10-14

Previous version: v1.1.10.

- Enter on the last visible table row adds a blank entry row and selects the same column. Commit valid edits first; invalid entries stay in place. Shift+Enter moves up. Support rebuilt, sorted and filtered tables. Untouched entry rows are temporary UI slots and stay out of exports.
- Length-colour cells accept typing from the open picker as well as the selected cell. Suggestions include supplied colour names and aliases; Enter accepts the colour and moves down/adds a row. Invalid colours remain editable. Preserve the palette picker and stored colour format.
- Remove the green accent stripe from added table cells. Retain selection outlines and yellow change highlighting.
- Updated/upload: `js/grid.js`, `js/app.js`, `css/app.css`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none.
- Validation: 106 automated tests passed. Approved local Chromium tests verified last-row Enter, typed colour selection from the open picker, invalid-colour retention without row creation, Shift+Enter, Enter from colour buttons and removal of green cell accents. No browser console errors in checked flows.
- Limits: Unused new entry slots disappear when the table is reopened; typing in a later slot materialises preceding rows, as before. Firefox/Safari and live deployment not tested. No upload or deployment performed.

## v1.1.10 — 2026-10-14

Previous version: v1.1.9.

- Change the default editable-column width from 90 px to 150 px across all tables. Preserve manually saved widths, alignment and unrestricted resizing. The row-number gutter remains 42 px.
- Updated/upload: `js/grid.js`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none.
- Validation: 101 automated tests passed, including the updated default-width and saved-width regression. Browser testing not run for this update; fresh approval is required. No upload or deployment performed.

## v1.1.9 — 2026-10-14

Previous version: v1.1.8.

- Replace vendor-page custom metadata JSON editors with labelled text/number fields and Yes/No choices. Add fields using a name and value type; remove with confirmation. Nested groups and lists use structured controls; imported empty values remain preserved.
- Preserve field names, numeric/boolean/text types, nested data and the existing cable-stock schema. Reject empty/invalid number edits and duplicate/reserved new field names.
- Updated: `js/app.js`, `css/app.css`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Added: `tests/metadata.test.mjs`. Deleted: none.
- Validation: 101 automated tests passed, including metadata controls, invalid numbers, nested values and export types. Approved local Chromium tests verified field creation, text/number/Yes-No editing, export preview types and saved values after reopening. No console errors in checked flows.
- Limits: Firefox/Safari and live deployment not tested. No GitHub upload or deployment performed. Existing field types remain fixed; remove and add a field to change its type (empty values offer Enter text).

## v1.1.8 — 2026-10-14

Previous version: v1.1.7.

- Set centred text and 90 px editable-column defaults for all tables. Migrate older alignment/width preferences once; preserve zoom/highlight baselines and later user choices. Keep unrestricted resizing below 90 px.
- Display five entry slots for empty/small tables. Untouched slots stay out of data, validation and exports; sorted slots follow populated rows. Editing a later slot creates the preceding required rows.
- Replace the formula bar with direct in-cell editing, including lengths and colour names. Tab/Shift+Tab and Enter accept/move; Escape cancels. Keep invalid input in place and commit valid pending entries before saves, sorting and navigation. Preserve checkboxes, colour pickers and length-chip dialogs.
- Add persistent Ok acknowledgement to Settings notes/hints; show new/changed note text again. Display m/ft suffixes in Length colour cells and headings without changing stored numeric lengths.
- Updated: `js/app.js`, `js/grid.js`, `css/app.css`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Added: `tests/tables.test.mjs`. Deleted: none. If upgrading directly from v1.1.6, also upload v1.1.7's `index.html`, `js/updates.js`, `tests/loading.test.mjs`.
- Validation: 98 automated tests passed. Approved local Chromium tests covered all three table families, 90 px/centred defaults, five blank rows, direct entry, Tab/Enter/Escape, table rebuilds, invalid input, Save/sorting, note acknowledgement after reopening, m/ft suffixes and empty-reference export. No browser console errors in checked flows.
- Limits: Existing table widths/alignment reset once. Very narrow columns can clip content. Note acknowledgement is browser-local; storage failure keeps it for the session only. Firefox/Safari and live deployment not tested for this release. No upload or deployment performed.


## v1.1.7 — 2026-10-14

Previous version: v1.1.6.

- Fix the refresh path that could detect a newer version while reusing cached app modules. Read fresh version metadata before startup and use release-specific URLs for all six app modules, CSS and the Excel library. Import maps cover relative dependencies; no duplicate version setting is required.
- Save & refresh verifies drafts as before, requests fresh HTML, then restores the clean address. Keep browser storage intact. Show a retry/error for unavailable or malformed metadata, inconsistent version modules or missing import-map support.
- Updated: `index.html`, `js/app.js`, `js/updates.js`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Added: `tests/loading.test.mjs`. Deleted: none. Upload all eight files together.
- Validation: 87 automated tests passed. Approved local Chromium testing cached a v1.1.5 module, loaded v1.1.7, then advanced to simulated v1.1.8. Save & refresh changed the actual footer version, preserved a pending reference entry, removed the banner and restored /cable/. Requests verified new release URLs for all six app modules and CSS; no app console errors.
- Test correction: The earlier v1.1.5 live test verified notification and draft recovery using simulated metadata, but did not prove a real version change through cached dependencies. This regression test adds that missing coverage.
- Live inspection: Published v1.1.6 index, grid and version files matched local v1.1.6; a fresh Chromium tab displayed v1.1.6. The user's stale session was not reproduced directly.
- Limits: Existing cached HTML may need one hard refresh or the documented temporary install URL to adopt this fix. Fresh startup needs network access and import-map support; already open sessions continue editing if update checks fail. Firefox/Safari not tested. v1.1.7 remains local; no upload or deployment performed.


## v1.1.6 — 2026-10-14

Previous version: v1.1.5.

- Remove the 90 px minimum from pointer and keyboard column resizing, inline header minimum widths and the table's forced full-width stretching. Explicit table widths allow independent narrow columns; keep a 1 px non-zero geometry guard and the 42 px row-number gutter. Clip/scroll narrow contents without changing stored data.
- Keep keyboard resize focus and persist selected widths per table.
- Update README with v1.1.5 live status, verified update notification and safe refresh behaviour, and the v1.1.6 upload inventory.
- Files to upload: `js/grid.js`, `css/app.css`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Added/deleted: none.
- Validation: 80 automated tests passed. Approved local Chromium tests verified pointer and keyboard resizing below 90 px, narrowing to 1 px and expanding again, zoom and saved widths across table switches. No browser console errors.
- Limits: Very narrow columns clip their visible content; widen them or use the selected-cell editor to read/edit the value. Firefox/Safari not tested for this update. Local release only; no upload or deployment performed.


## v1.1.5 — 2026-10-14

Previous version: v1.1.4.

- Notify when a newer app release is available, with a Save & refresh button. Check same-site version metadata on startup, every five minutes while visible and when returning to the tab; throttle repeated checks and ignore unavailable/malformed responses.
- Commit a pending valid table entry and verify saved project/reference data before reloading. Retain unexported edits and the imported baseline. Block refresh for invalid/unfinished entries, open dialogs/imports, multiple pending loom editors, storage failures and detected conflicting tabs.
- Updated: `index.html`, `css/app.css`, `js/app.js`, `js/grid.js`, `js/version.js`, `package.json`, `README.md`, `UPDATES.md`, `CHANGELOG.md`.
- Added: `js/updates.js`, `tests/updates.test.mjs`. Deleted: none.
- Validation: 80 automated tests passed. Approved local Chromium testing verified a simulated v1.1.5 → v1.1.6 update, notification removal after refresh, pending cable name, edited lengths and reference recovery, invalid length retention, unfinished metadata retention and concurrent-tab refusal. No browser console errors in the tested refresh flow.
- Live status: v1.1.5 is live at https://ailampy.com/cable/ following the user's GitHub upload, including the corrected `index.html`. Approved live Chromium testing on 2026-10-14 confirmed successful startup and the displayed v1.1.5 version.
- Live update notification and safe refresh passed browser testing. A browser-only simulated v1.1.6 response displayed the notification; Save & refresh preserved an uncommitted table entry and kept ailampy.com/cable/ in the address bar. Removing the simulation restored the real v1.1.5 check and hid the banner. The test cell was restored to its original value, and no browser console errors were reported. No deployed files were changed during testing.
- Limits: Existing older tabs need one manual refresh to install this feature. Undo/redo history, selection, temporary filters and internal Copy Lengths reset on reload. Drafts stay in the same browser/origin. Network/cache delays may postpone detection; offline editing continues. Firefox/Safari were not tested for this update.


## v1.1.4 — 2026-10-14

Previous version: v1.1.3.

- Show Start / male, End / female and direction columns only when a cable table contains adaptors. Ordinary rows remain blank/read-only in those columns. Preserve original connectors and directions.
- Hide raw JSON columns across all tables, including cable fields, reference connectors and loom overrides. Keep their data in backups and exports.
- Split Settings → Cable Types into category sheets, including custom and uncategorised entries. Scope search, edits, deletion and Save to the active sheet; new rows inherit its category. Preserve complete reference downloads and route error links to the correct sheet.
- Remove the Load supplied Christie example button and unused handler. Preserve the original input file.
- Updated: `js/app.js`, `js/grid.js`, `js/model.js`, `js/version.js`, `tests/core.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Created/deleted files: none.
- Validation: 70 automated tests passed, including column visibility, category sheet discovery and controller checks for scoped additions, multi-cell category moves, deletions and hidden-data preservation. Browser testing not run; fresh approval required. No upload or deployment performed.

## v1.1.3 — 2026-10-14

Previous version: v1.1.2.

- Tab accepts a pending cell entry and selects the next cell to the right. Shift+Tab accepts and moves left. Wrap between existing rows; stay at the table’s first/last boundary.
- Invalid entries retain editor focus and selection. Preserve navigation when an edit rebuilds the table or changes its visible columns. Colour cells and checkbox cells use the same Tab navigation.
- Updated: `js/grid.js`, `js/app.js`, `js/version.js`, `tests/core.test.mjs`, `UPDATES.md`, `CHANGELOG.md`. Created/deleted: none.
- Validation: 67 automated tests passed, including four new commit/navigation regressions. Browser testing not run; fresh approval required. No upload or deployment performed.

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
