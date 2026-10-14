# Updates

## Pending

- User acceptance of the initial release in day-to-day cable-stock editing.
- Confirm an authoritative Lampy Paperwork composite-loom schema before enabling loom fields in its cable-stock export. Until then, generator project JSON and Excel preserve looms separately.

## Completed

- v1.1.23 (local): Corrected bottom Save table placement. The button now appears directly after the table rows, before help text, aligned with the top Save button. v1.1.21 had changed styling only, not vertical placement.
- Validation: 133 automated tests passed. Approved local Chromium checks confirmed zero gap between table container and footer, identical button alignment/dimensions, and successful Save action. No console errors. No upload/deployment; live version could not be rechecked via the available HTTP tools this turn.
- Upload: `js/grid.js`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none. If earlier updates are not uploaded, include their listed files too (especially `css/app.css` for matching Save button styling).

- v1.1.22 (local): Save full generator vendor projects under projects/ and load them on vendor selection. Added native-save option/download fallback, exact filename guidance, protected replacement and explicit current-vendor reload. Existing Lampy schemas and references unchanged.
- Validation: 133 automated tests and approved local Chromium download/hosted-load/cancel/invalid-file checks passed. Native OS save picker not tested. No console errors in checked flows. No upload or deployment.
- Upload: `index.html`, `js/app.js`, `js/version.js`, new `js/vendor-projects.js`, new `tests/vendor-projects.test.mjs`, new `projects/README.md`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Deleted: none. No actual vendor projects included. Also include the v1.1.21 files if not uploaded yet: `js/grid.js` and `css/app.css`.

- v1.1.21 (local): Explicit category suggestions in Connectors, including Uncategorised, with filtered typing and mouse/keyboard selection. Bottom Save table now matches the top button’s horizontal alignment, dimensions, border, font and padding.
- Validation: 129 automated tests passed. Approved local Chromium checks passed dropdown opening, filtering, keyboard Tab selection, mouse selection and moving connectors between sheets. Browser measurements confirmed identical Save button geometry/styling. No console errors. Not uploaded or deployed.
- Upload: `js/app.js`, `js/grid.js`, `js/version.js`, `css/app.css`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none.
- Live v1.1.20 browser verification passed category sheets, assignment and bottom Save committing active edits. Address stayed at ailampy.com/cable/. No console errors; temporary test entry removed. No deployment performed by the agent.

- v1.1.20 (live at https://ailampy.com/cable/; verified 2026-10-14): Connectors category sheets, inferred grouping for existing references, explicit category moves, new-row/approval categories, and complete-list downloads. Added bottom Save table buttons to every shared grid.
- Validation: 129 automated tests and approved local Chromium tests passed for category filtering, new entries, moves, export and bottom Save with an active edit. No console errors. No upload or deployment.
- Upload: `js/app.js`, `js/model.js`, `js/grid.js`, `js/version.js`, `css/app.css`, `tests/core.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted project files: none. Original inputs unchanged.

- v1.1.19 (live at https://ailampy.com/cable/; verified 2026-10-14): Cable-name connector fallbacks, grouped review warnings, yellow Errors notification, explicit approval/correction and exact connector-list download. Hidden table columns retained. Reference names/aliases are trusted; other names need review.
- Validation: 126 automated tests and approved local Chromium checks passed. After the user uploaded v1.1.19, live Chromium checks passed fallback, yellow review notification, corrected approval, reference/stock JSON previews and persistence after reopening. Address retained, no console errors, test data removed. No upload or deployment performed by the agent.
- Upload: `js/app.js`, `js/model.js`, `js/version.js`, `css/app.css`, `tests/core.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Also include `js/grid.js` from v1.1.18 when upgrading from v1.1.17. New/deleted project files: none; original inputs unchanged. Publish approved references separately by downloading `connector_types.json` to `data/connector_types.json`.

- v1.1.18 (local): Restored adaptor-only direction/connector columns. Custom/incomplete cables use a Connectors button and normal form; inheritance retained. 123 automated tests and approved local Chromium checks passed. No upload or deployment.
- v1.1.17 verified live at ailampy.com/cable/: recognised inheritance and custom connector JSON preview passed. Address retained, test category removed, no console errors in checked flows.
- Upload: `js/app.js`, `js/grid.js`, `js/version.js`, `tests/core.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none.

- v1.1.17 (local): Recognised names/aliases inherit missing connectors on entry and category opening, preserving existing overrides. Custom/incomplete cables show normal connector and direction columns without an adaptor flag. Error links target visible fields and sorted rows correctly.
- Validation: 123 automated tests passed; approved Chromium checks passed custom inputs, inheritance, JSON preview and existing-row repair. No console errors. No upload or deployment.
- Upload: `js/app.js`, `js/model.js`, `js/version.js`, `tests/core.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none. Original references unchanged.

- v1.1.16 (local): Added Reset widths for only the current table (150 px). Length chips display numerically lowest to highest without mutating source data. Removed their 450 px container cap; content uses the resized column width.
- Validation: 119 automated tests passed; approved local Chromium checks verified chip order/full width, reset isolation and persistence. No console errors. No upload or deployment.
- Upload: `js/grid.js`, `css/app.css`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none.

- v1.1.15 (local): Vendor version accepts 2 or 2.1 and adds the v prefix automatically when committed. Existing prefixes, minor digits and empty values are handled without duplication or numeric rounding. 116 automated tests passed; browser testing not run. No upload or deployment.
- Upload: `js/app.js`, `js/model.js`, `js/version.js`, `tests/core.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none.

- v1.1.14 (local): Clear sort restores the default ascending table order and keeps the search filter. Sorted paste can extend tables without disabling sorting. 114 automated tests passed; browser testing not run. No upload or deployment.
- Upload: `js/grid.js`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none.

- v1.1.13 (local): Tables start in ascending Name order (vendor name for Manifest, cable type for loom components; numeric Length for Length colour). Blank rows stay last; manual sorting remains available; source/export order is unchanged.
- Validation: 111 automated tests passed. Browser testing not run. No upload or deployment.
- Upload: `js/grid.js`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none.

- v1.1.12 (local): Live filtered palette suggestions in colour cells, with click/keyboard selection and no-match feedback. Only supplied palette names, aliases and codes can be committed; unknown typed/pasted values are rejected. Original palette unchanged.
- Validation: 108 automated tests and approved local Chromium checks passed; no console errors in checked flows. No upload or deployment.
- Upload: `js/app.js`, `js/grid.js`, `js/model.js`, `js/version.js`, `css/app.css`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none.

- v1.1.11 (local): Enter on the last table row adds a blank entry row in the same column after accepting valid input. Shift+Enter moves up; invalid input stays editable. Length-colour picker supports typing to select colours with name/alias suggestions. Removed green cell accent stripes; kept selection and yellow change highlighting.
- Validation: 106 automated tests passed; approved local Chromium checks passed Enter/colour typing/invalid input/Shift+Enter and accent removal, with no console errors. No upload or deployment.
- Upload: `js/grid.js`, `js/app.js`, `css/app.css`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none.

- v1.1.10 (local): Default editable-column width increased from 90 px to 150 px across all tables; manually saved widths remain unchanged. 101 automated tests passed. Browser testing not run for this update. No upload or deployment.
- Upload: `js/grid.js`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none.

- v1.1.9 (local): Vendor custom metadata now uses ordinary labelled fields, number inputs, Yes/No choices and structured groups/lists. Add/remove fields without entering JSON; preserve existing field names, types and schema.
- Validation: 101 automated tests passed; approved local Chromium checks passed creation/editing, export types and saved-value recovery. No console errors in checked flows. No upload or deployment.
- Upload: `js/app.js`, `css/app.css`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`, new `tests/metadata.test.mjs`. Deleted: none. Earlier unpublished release files must also be included when upgrading from an older release.

- v1.1.8 (local): All tables default to centred text and 90 px editable columns. One-time layout migration replaces old widths/alignment while retaining zoom and highlight baselines; later choices persist. Empty/small tables show five entry slots without exporting untouched blank records.
- Removed the formula bar. Typing edits the cell directly, with Tab/Enter commit, Escape cancel and invalid-input retention. Cable, reference and loom-component tables share this behaviour. Existing chip dialogs, checkboxes and colour pickers remain available.
- Settings notes/hints now have Ok acknowledgement saved by note text; only new/changed notes reappear. Length colour values show m/ft suffixes while retaining numeric editing/export and vendor/unit isolation.
- Validation: 98 automated tests passed. Approved local Chromium tests covered defaults, empty rows, direct editing, rebuilt tables, invalid entries, saves/sorting, persistent acknowledgements, both unit suffixes and empty exports. No console errors in checked flows. Not uploaded or deployed.
- v1.1.8 changed files: `js/app.js`, `js/grid.js`, `css/app.css`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`; added `tests/tables.test.mjs`; deleted none. Also upload `index.html`, `js/updates.js` and `tests/loading.test.mjs` if the v1.1.7 cache fix has not yet been published.

- v1.1.7 (local, ready for user upload): Load fresh release metadata before startup and use release-specific URLs for every app module, stylesheet and Excel library. Import maps cover relative dependencies; Save & refresh also requests fresh HTML and restores the clean address without clearing drafts.
- Failed/malformed metadata, mismatched version modules and unsupported browsers show a retry/error instead of silently loading stale code. `js/version.js` remains the only version setting.
- Validation: 87 automated tests passed. Approved local Chromium testing cached an old v1.1.5 module, loaded v1.1.7, then advanced to simulated v1.1.8 via Save & refresh. Footer version changed, pending reference entry survived, banner disappeared, /cable/ URL stayed clean and all app modules/CSS used new release URLs. No console errors in the app flow.
- Earlier live v1.1.5 testing proved notification and draft recovery using simulated metadata; it did not verify replacing cached modules with a real new release. The v1.1.7 regression test covers that gap.
- v1.1.7 upload list: `index.html`, `js/app.js`, `js/updates.js`, `js/version.js`, new `tests/loading.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Deleted files: none. No upload or deployment performed.

- v1.1.6 (uploaded by the user; confirmed in a fresh live Chromium tab on 2026-10-14): Removed the 90 px editable-column resize floor, inline minimum widths and forced full-width table stretching. Explicit table widths preserve user-selected sizes; a 1 px guard prevents zero/negative geometry. Narrow cells clip/scroll content without changing data. Keyboard resizing retains focus; widths persist per table.
- README now records v1.1.5 as verified live at ailampy.com/cable and explains version notifications, Save & refresh, retained data and session-state limits.
- Validation for v1.1.6: 80 automated tests passed. Approved local Chromium tests passed pointer/keyboard resizing below 90 px, 1 px narrowing and reopening, zoom and width persistence across table switches; no console errors. No upload or deployment performed.
- v1.1.6 files to upload: `js/grid.js`, `css/app.css`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none.

- v1.1.5: New-release banner checks published version metadata on startup, every five minutes while visible and on return to the tab. Save & refresh commits a valid pending table edit, verifies saved project/reference data and reloads.
- Refresh guards preserve invalid/unfinished entries and block open dialogs/imports, multiple pending loom editors, storage failures and detected concurrent-tab conflicts.
- 80 automated tests passed. Freshly approved local Chromium tests verified notification, simulated release refresh, pending stock/reference recovery, invalid-cell/unfinished-field refusal and concurrent-tab protection.
- v1.1.5 is live at https://ailampy.com/cable/ following the user's GitHub upload. Approved live browser testing on 2026-10-14 confirmed successful startup and the displayed v1.1.5 version after the corrected index.html was published.
- Live update notification and safe refresh passed: a browser-only simulated v1.1.6 response displayed the notification; Save & refresh preserved an uncommitted table entry and kept ailampy.com/cable/ in the address bar. Removing the simulation restored the real v1.1.5 check and hid the banner. The test cell was restored to its original value; no browser console errors were reported. No deployed files were changed during testing.

- v1.1.4: Hide raw JSON columns in every table; preserve underlying data. Show cable connector endpoints only for adaptors.
- Cable Types now has separate category sheets with scoped edits, inherited categories, full-dataset downloads and category-aware error links.
- Removed the Vendor tab’s Christie sample-loading button and unused handler; the original example remains unchanged.

- v1.1.3: Tab accepts a pending cell edit and moves right; Shift+Tab moves left. Invalid entries stay in the editor. Navigation follows rebuilt tables and wraps between existing rows.

- v1.1.2: Set table header/data rows to 35 px at 100% table zoom, including colour cells. Long cell text/chip lists scroll inside the compact rows.

- v1.1.1: Length colours show only the selected vendor and unit. Added/pasted rows inherit that context; vendor/unit columns removed.
- Colour-filled table cells and scrollable palette follow the supplied picker image, including keyboard selection and table-zoom placement.
- Prominent Save table buttons at the far right clear only their table’s edit highlights. Original export-review baselines remain intact.
- Local tests verified vendor/unit isolation, scoped paste/deletion, save/reload, later edits, invalid input and concurrent-tab protection.

- v1.1.0: Lighting Vendors adds missing manifest entries with user-approved generated filenames and preserves existing paths.
- Category dropdown with typed entries and automatic cable-type/connector seeding for recognised categories.
- Adaptor checkbox and adaptor-only direction editing; existing runtime direction values retained.
- Save button on every cable, reference, colour and loom-component table.
- Length colour Settings with vendor/unit/length and three palette-only colours, local saving and separate JSON download.
- Existing draft/reference migration and adaptor project/Excel round trips tested.

- v1.0.1: Fixed false additions/removals in plain JSON import previews; added seven regression tests and verified identical/changed imports, cancellation and accepted-import baselines in local Chromium.
- Initial cable-stock-only application, v1.0.0.
- Vendor selection, logos, unit choice, independent generator vendor version and custom metadata.
- Editable cable-category and Settings tables, length chips, aliases and connector defaults/overrides.
- Structured composite loom editor and lossless project/Excel backups.
- JSON import/export, deep imported baseline, change review, warnings/errors and local draft protection.
- Separate generator reference datasets, exact manifest editor and canonical download names.
- Local automated and browser validation. See CHANGELOG.md for scope and limitations.
- Original stock example, manifest, vendor reference and 15 logos preserved unchanged.

## Notes

- BUILD_BRIEF.md remains authoritative. Read this file before subsequent changes.
- The user configured GitHub Pages and uploaded v1.1.5, including the corrected index.html. The release is verified live through ailampy.com/cable/. Future uploads and deployments remain the user's responsibility unless separately authorised.
- Browser testing was not run for v1.1.2, v1.1.3 or v1.1.4; fresh approval is required. Prior v1.1.1 browser testing remains recorded in CHANGELOG.md.
- The supplied colour_options.json is unchanged. New length_colours.json stores generator-only assignments; no unsupported colour/adaptor fields enter Lampy runtime JSON.
- Application version is defined in js/version.js. Vendor version is separate.
- Every future app update must increase the application version in `js/version.js` to a new, unique version, update `CHANGELOG.md`, and explicitly include `js/version.js` in the handover list of files to upload. Never reuse a released version.
- No production manifest location outside the supplied reference path was inferred.

## Future

- No future-release implementation or scaffolding is included. Record user-approved follow-up requests here after V1 use.
