# Updates

## Pending

- User acceptance of the initial release in day-to-day cable-stock editing.
- Lampy Paperwork needs a separate future update to consume the agreed vendor stock-loom structure. Cable Stocker now exports it; Paperwork changes are outside this release. No implementation or deployment has been performed in Paperwork.

## Completed

- v1.1.30 (live at https://ailampy.com/cable/; verified 2026-10-15 after user upload): removed the yellow change highlight from the Vendor name field on the Vendor tab. Length-unit and table change highlighting remain intact; vendor changes still appear in export review. Increased the app version and README current project version.
- Release files: `js/app.js`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none. Approved live browser testing confirmed the v1.1.30 footer and that the Vendor name field no longer highlights yellow, including after focusing it and tabbing away. The existing Siyan LTD draft was preserved; the address stayed at ailampy.com/cable/. Full verification details are in CHANGELOG.md. Lampy Paperwork untouched; no upload or deployment performed by the agent.
- Documentation follow-up — 2026-10-15: updated/upload `UPDATES.md` and `CHANGELOG.md` only to record the live result. App remains v1.1.30; no app code changes or new/deleted files. Recorded the completed browser checks without rerunning them for this documentation edit.

- v1.1.29 (local, not uploaded or deployed) — 2026-10-15: removed the helper sentence below the Vendor name field. Retained the vendor selector, project loading and corrected loom guidance. Increased the app version and README current project version. Approved local browser checks confirmed the helper is absent, the input remains visible and the footer shows v1.1.29.
- Upload: `js/app.js`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none. Lampy Paperwork untouched; no upload or deployment. Validation details are in CHANGELOG.md.

- v1.1.28 (live at https://ailampy.com/cable/; verified 2026-10-15 after user upload): corrected the Vendor-page help text to describe stock-loom JSON support and the separate pending Lampy Paperwork update. Clarified that project JSON/Excel retain the vendor version and extra loom details. Increased `js/version.js` and the README current project version; no data/export behaviour changed.
- Upload: `js/app.js`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none. Approved live browser inspection confirmed the v1.1.28 footer and corrected Vendor-page loom guidance, with ailampy.com/cable/ retained in the address bar. No draft edits or downloads; Lampy Paperwork untouched. Initial non-browser validation is recorded in CHANGELOG.md.

- v1.1.27 (live at https://ailampy.com/cable/; verified 2026-10-15 after user upload): implemented the user-approved stock-loom structure with loom `id`, `name`, numeric available `lengths`, and `cables` entries containing `cableType` / `quantity`. Complete JSON export/import and loom fragment preview/copy/download use this structure. Existing project/Excel backups retain richer loom data; original cable schemas, manifest, references and Siyan project remain unchanged. Updated the export notices with the pending Paperwork compatibility notice; the remaining Vendor-page wording was corrected locally in v1.1.28.
- Initial local validation: 155 non-browser tests passed, including JSON/Excel round trips, legacy project preservation, import review, invalid data and preview/download controller checks. Browser tests were not run during implementation, as requested. Lampy Paperwork was not accessed or changed for this update.
- Live verification: approved browser testing confirmed v1.1.27 at https://ailampy.com/cable/. Siyan LTD’s 2-Way Socapex Loom retained its ID/name, available lengths of 10, 15, 20, 25 and 30 m, and cable quantities of Socapex 19-Pin ×2 and XLR-5 ×4 through export → import → re-export. Both downloaded JSON files contained identical data; imported lengths and quantities also appeared correctly in the table. Original browser draft/preferences restored exactly and both test downloads deleted. Lampy Paperwork untouched; no upload or deployment performed by the agent.
- Documentation follow-up — 2026-10-15: updated/upload `UPDATES.md` and `CHANGELOG.md` only to record the live result. App remains v1.1.27; no app code changes or project files added/deleted. Existing browser results recorded without rerunning browser tests for this documentation edit.
- Upload: `js/app.js`, `js/model.js`, `js/excel.js`, `js/version.js`, `tests/core.test.mjs`, `tests/loom-stock.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New file: `tests/loom-stock.test.mjs`. Deleted files: none.

- Project-folder documentation and cleanup record — 2026-10-15: corrected `projects/README.md` to identify the included user-supplied Siyan LTD project and its exact upload path. Recorded removal of the regenerated root `.DS_Store` during the preceding audit; no further files deleted in this documentation follow-up. Updated/upload: `projects/README.md`, `UPDATES.md`, `CHANGELOG.md`. App remains v1.1.26; no app code changes or new files. User project JSON, backups and original inputs preserved. Verified the project vendor/filename, local documentation link, unchanged version and that only these three documents changed. Browser tests were not rerun for this documentation-only change. No upload or deployment.

- README table-workflow audit — 2026-10-15: clarified cell selection, typing to replace versus editing existing text, Tab/Shift+Tab/Enter navigation and Escape cancellation. Corrected yellow-highlight guidance to use the table’s last successful Save when available, while export reviews retain the original import baseline. Clarified that either Save table button commits the active edit and preserves visible selection. README contains current usage only; release notes and test history remain in CHANGELOG.md. Updated/upload: `README.md`, `UPDATES.md`, `CHANGELOG.md`. App version remains v1.1.26. Source/documentation checks passed; browser tests were not rerun for this documentation-only change. No app code changes, new/deleted files, upload or deployment.

- v1.1.26 (live at https://ailampy.com/cable/; verified 2026-10-15): corrected README green-highlight wording and removed unused formula-bar/cell-address styles and code. 138 automated tests and approved local Chromium checks passed; details in CHANGELOG.md. Existing editing, selection, highlighting and saving retained. User uploaded the release; no upload/deployment performed by the agent.
- Upload: `js/grid.js`, `css/app.css`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted project files: none.
- Live verification: Approved live Chromium testing on 2026-10-15 confirmed v1.1.26 at https://ailampy.com/cable/. Table editing and Tab navigation, single-cell and range selection, yellow edit highlighting, and Save table accepting an active edit and clearing highlighting all passed. Saved changes survived reopening. The address stayed at ailampy.com/cable/; no console warnings/errors in the checked flows. Test values were restored and the original cable JSON matched the pre-test snapshot exactly. No downloads, uploads or deployment performed by the agent.
- Documentation follow-up — 2026-10-15: updated/upload `UPDATES.md` and `CHANGELOG.md` only to record the live result. App version remains v1.1.26. No app code changes or project files added/deleted. Existing browser results recorded; browser tests were not rerun for this documentation edit.

- README loom-workflow audit — 2026-10-15: clarified Save loom validation/local saving, ordinary 35 px child rows and saved-data persistence. Corrected general table guidance to distinguish the main loom table and side pane from cable/Settings blank-row entry and Save table controls. README contains current usage only; release notes and test history remain in CHANGELOG.md. Updated/upload: `README.md`, `UPDATES.md`, `CHANGELOG.md`. Version remains v1.1.25. Source/documentation checks passed; no browser tests rerun. No app code changes, project files added/deleted, upload or deployment.

- v1.1.25 (live at https://ailampy.com/cable/; verified 2026-10-15): Corrected Add/Edit loom to use a side pane with Loom name and Cable Type / Quantity inputs. Saved parent rows expand into ordinary child rows in the main table. Protected unsaved pane entries and preserved project/Excel data. 138 automated tests and approved local Chromium checks passed; details in CHANGELOG.md. User uploaded the release; no upload/deployment performed by the agent.
- Upload: `js/app.js`, `js/model.js`, `js/grid.js`, `css/app.css`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted project files: none.
- Live verification: approved Chromium testing passed Add loom opening the Loom name and Cable Type / Quantity side pane, Save loom adding a parent, expanded components appearing as ordinary 35 px child rows, bottom Save table accepting a quantity edit, and persistence after reopening. The address stayed at ailampy.com/cable/. After an initial stale-cache failure, a fresh load succeeded and normal cached startup also passed. No console warnings/errors in the successful flow. Test loom removed; original loom JSON matched the pre-test snapshot. No files downloaded during the successful check.
- Documentation follow-up — 2026-10-15: updated UPDATES.md and CHANGELOG.md with the live result. App remains v1.1.25. Upload only these two documents for this follow-up; no project files added/deleted, uploads or deployment.

- v1.1.24 (local): Stock / Pre-Made Looms now uses a parent table by loom name, with available lengths and expandable cable-type/quantity tables. Preserved project/Excel data and protected pending component edits. 136 automated tests and approved local Chromium checks passed; details in CHANGELOG.md. No upload/deployment.
- Upload: `js/app.js`, `js/grid.js`, `css/app.css`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted project files: none.

- README rule audit completed: remaining browser/Excel test history removed from README and retained in CHANGELOG.md; dataset guidance describes current use. Setup, usage and upload instructions retained. Documentation-only update to README.md, CHANGELOG.md and UPDATES.md; app remains v1.1.23. No files added/deleted or deployment.

- Documentation maintenance — 2026-10-14 (app remains v1.1.23): Corrected README upload guidance to include projects/ and saved vendor project JSON. Removed release notes, historical test reports and superseded instructions from README; retained current setup, usage, upload and troubleshooting guidance, with release history in CHANGELOG.md. Recorded the preceding removal of root .DS_Store. User project JSON, backups and app files preserved. Changed/upload: README.md, UPDATES.md, CHANGELOG.md. No new files; no further files deleted in this documentation follow-up. No upload or deployment.

- Live vendor-project verification on 2026-10-14: saving vendor projects and loading them when a vendor is selected passed approved Chromium browser testing at https://ailampy.com/cable/ on v1.1.23 using Siyan LTD. Selecting Siyan LTD found projects/siyan_ltd.lampy-project.json and loaded vendor v2, 4 categories, 17 cable types and 1 loom after confirmation. Save vendor project → Download project JSON produced JSON exactly matching the supplied project. The address stayed at ailampy.com/cable/; no console errors. The project has 3 connectors awaiting review. Native Choose save location was not tested. No upload or deployment performed by the agent.

- v1.1.23 (live at https://ailampy.com/cable/; verified 2026-10-14): Corrected bottom Save table placement. The button now appears directly after the table rows, before help text, aligned with the top Save button. v1.1.21 had changed styling only, not vertical placement.
- Validation: 133 automated tests passed. Approved local Chromium checks confirmed zero gap between table container and footer, identical button alignment/dimensions, and successful Save action. No console errors. After the user uploaded the files, live Chromium testing confirmed v1.1.23 at ailampy.com/cable/: bottom Save table placement directly below the rows and before help text, identical horizontal alignment/dimensions to the top button, and successful saving all passed. No live console warnings/errors; address retained. No upload or deployment performed by the agent.
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

- Keep README.md focused on current setup, usage and upload guidance. Record release notes and test history in CHANGELOG.md, and pending work/maintenance outcomes here.

- Delete agent-created test downloads once testing finishes. Preserve user originals and project source files; remove only downloads identified as test artifacts.
- BUILD_BRIEF.md remains authoritative. Read this file before subsequent changes.
- The user configured GitHub Pages and uploaded v1.1.5, including the corrected index.html. The release is verified live through ailampy.com/cable/. Future uploads and deployments remain the user's responsibility unless separately authorised.
- Browser testing was not run for v1.1.2, v1.1.3 or v1.1.4; fresh approval is required. Prior v1.1.1 browser testing remains recorded in CHANGELOG.md.
- The supplied colour_options.json is unchanged. New length_colours.json stores generator-only assignments; no unsupported colour/adaptor fields enter Lampy runtime JSON.
- Application version is defined in js/version.js. Vendor version is separate.
- Every future app update must increase the application version in `js/version.js` to a new, unique version, update `CHANGELOG.md`, and explicitly include `js/version.js` in the handover list of files to upload. Never reuse a released version.
- No production manifest location outside the supplied reference path was inferred.

## Future

- No future-release implementation or scaffolding is included. Record user-approved follow-up requests here after V1 use.
