# Changelog

## v1.1.44 — 2026-10-17

Previous version: v1.1.43. Local release for manual upload; not deployed.

- Open all three direction choices immediately when an editable Direction cell is selected by one click, Tab/Shift+Tab or arrow-key navigation in stock and Settings tables. No double-click or F2 is required.
- Keep the behaviour limited to Direction cells. Read-only cells and range selections do not open an editor. Preserve typed replacement, validation, option selection, Tab commit, Escape cancellation and saving without recursive selection/editing.
- Updated/upload: `js/app.js`, `js/grid.js`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. If v1.1.43 has not been uploaded, also upload its `js/model.js`, `js/excel.js` and `tests/core.test.mjs`. New/deleted project files: none. User JSON, original examples and backups preserved. No upload/deployment or Lampy Paperwork changes.
- Validation: 200/201 automated tests passed, including five new selection/navigation regression tests. The existing reference-data audit still fails on the three unsupported splitter/tails direction values recorded under v1.1.43. JavaScript syntax, JSON validity, local imports, version consistency and protected data hashes passed.
- Approved local browser checks passed: one-click dropdown in both stock and Settings, reversed connector display after choice, Shift+Tab/arrow navigation into the cell, Tab away, Escape closing, read-only exclusion, keyboard choice and top/bottom saving. No console warnings/errors in the checked flows. Live deployment and other browsers were not tested.
- Cleanup: restored isolated browser storage, closed test tab and stopped local server; removed scratch files outside the project. No downloads or temporary project files. Screenshot retained outside the project.

## v1.1.43 — 2026-10-17

Previous version: v1.1.42. Local release for manual upload; not deployed.

- Support bidirectional, male > female and female > male directions. Show all three choices when editing Direction cells in vendor adaptor and Settings cable-type tables, with keyboard selection/Tab commit and rejection of other typed values. Keep existing column visibility rules.
- Display readable arrow labels while retaining compatible `male-female`, `female-male` and `bidirectional` JSON tokens. Accept imported arrow wording without rewriting it on import/export. Map reversed start/end cells to female/male connector keys; preserve connector identities, custom fields and existing forward/bidirectional data.
- Apply direction handling to connector forms, default inheritance, fallback/review/approval, validation and Excel endpoint columns. Preserve direction-only Excel edits without swapping stored gendered connector identities.
- Updated/upload: `js/app.js`, `js/model.js`, `js/excel.js`, `js/version.js`, `tests/core.test.mjs`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted project files: none. Reference JSON, original examples, user project JSON and backups preserved. Lampy Paperwork untouched; no upload or deployment.
- Validation: 195 of 196 automated tests passed, including six new direction tests and JSON/Excel round trips. Updated the existing supplied-loom regression to check each actual category, including FOH Snake. The remaining reference-data audit fails on three pre-existing unsupported directions: Socapex Splitter (`male > 2 x Female`), 63A 3ø > Tails and 125A 3ø > Tails (both `male > Tails`). These records were not silently changed. The previously flagged `female-male` record now validates. Blank connector defaults remain subject to existing fallback/review behaviour.
- Approved local browser checks passed: three visible options in stock and Settings tables; selecting female > male reverses displayed endpoints while preserving identities; connector form labels follow direction; bidirectional saves one shared endpoint; invalid input is rejected; valid typed input commits with Tab; top/bottom Save and reload persistence work. No console warnings/errors in checked flows. JavaScript syntax, JSON parsing, local paths and version consistency passed. Live deployment, other browsers and downstream Lampy Paperwork support for reversed directions remain unverified.
- Cleanup: restored isolated browser storage, closed test tab and stopped local server. No downloads or temporary project files retained; screenshot kept outside the project.

## v1.1.42 — 2026-10-17

Previous version: v1.1.41. Local release for manual upload; not deployed.

- Add editable Aliases (comma-separated) and Default category columns to Settings → Cable Types → Stock / Pre-Made Looms and FOH Snake. Keep metadata on parent rows and component metadata cells blank/read-only. Vendor stock tables retain their existing columns; Settings length controls remain hidden.
- Offer filtered loom-category choices, resolve category aliases, and move the complete reference between Settings sheets without losing components, IDs, connector overrides, saved lengths or custom fields. Reject empty/ordinary cable categories to protect composite data. Include aliases and category names in group filtering and sorting.
- Updated/upload: `js/app.js`, `js/model.js`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted project files: none. Reference JSON, user projects and backups preserved. No upload/deployment or Lampy Paperwork changes.
- Validation: 190 automated tests passed, including column editability, alias parsing, category suggestions/validation, scoped moves, data preservation, filtering/sorting and existing JSON/Excel regression tests. JavaScript syntax, JSON validity, local module paths and version consistency passed.
- Approved local browser checks passed: columns visible in both sheets, alias edit/Tab commit, filtered category selection and moving the complete loom, child metadata read-only, invalid category rejection, bottom Save accepting an active edit, alias search and persistence after reopening. No console warnings/errors in the checked flows. Other browsers, narrow screens and live deployment were not tested.
- Cleanup: removed isolated local test storage, closed the test tab and stopped the local server. No downloads or temporary project files; screenshot retained outside the project. Existing Paperwork compatibility remains pending.

## v1.1.41 — 2026-10-17

Previous version: v1.1.40. Local release for manual upload; not deployed.

- Treat FOH Snake as a separate loom category in project tabs and Settings Cable Types. Use the shared Add/Edit loom pane, expandable component rows, quantities, vendor available lengths, saving, undo/redo and confirmed deletion. Keep category edits, loading, previews, layout preferences and deletion separate from Stock / Pre-Made Looms.
- Correct FOH Snake's duplicate category ID to `cat-foh-snake` and mark it as a loom category. Preserve its name and aliases. Match published category updates by name when repairing duplicate IDs, retaining local edits. New published loom references populate only their selected category; preserve duplicate and unit-mismatch safeguards.
- Remove the available-length column and length-unit control from Settings loom sheets, including FOH Snake. Keep vendor project length controls and preserve previously saved reference lengths/units, aliases, components and custom data.
- Preserve separate loom categories in project JSON and full/category Excel backups, including empty tabs. Export each loom category as its own worksheet and limit partial replacement to that category. Loom-only full workbooks no longer add an unrelated empty Data sheet.
- Keep the agreed cable-stock JSON unchanged: both categories export into the existing `looms` array. That format has no category field; reopening it groups all looms under Stock / Pre-Made Looms. Use project JSON or Excel to retain FOH Snake grouping. Existing reference records remain in their assigned categories; the supplied Snake W-1 record remains in Stock / Pre-Made Looms.
- Updated/upload: `js/app.js`, `js/model.js`, `js/excel.js`, `js/version.js`, `data/categories.json`, `tests/core.test.mjs`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted project files: none. User cable_types.json edits, other reference inputs, project JSON and backups preserved. Lampy Paperwork untouched; no upload or deployment.
- Validation: 188 automated tests passed, covering scoped reference loading/refresh, unit mismatches, duplicate prevention, isolated stock/Settings edits, category deletion/undo, project and JSON/Excel round trips, empty/category workbooks, cached duplicate IDs and removal of Settings length controls. JavaScript syntax, JSON validity, local paths, version consistency and data preservation checks passed.
- Browser testing not run, as requested. Visual layout and live behaviour for v1.1.41 remain unverified. No test downloads, temporary project files or obsolete artifacts remained. Separate Paperwork compatibility and user acceptance remain pending.

## v1.1.40 — 2026-10-16

Previous version: v1.1.39. Local release for manual upload; not deployed.

- Fix adding Stock / Pre-Made Looms opening an empty tab: copy reference looms from cable_types.json into vendor stock, preserving components, quantities, connectors and matching-unit lengths. Use independent IDs and retain reference provenance in backups only. Re-adding the category adds missing looms without overwriting existing vendor entries or creating duplicates.
- Ask how to handle different reference/vendor length units during category addition. Cancel leaves the project unchanged; the safe option omits mismatched lengths, while keeping the same numbers under the vendor unit requires an explicit choice. Never silently convert values.
- Reconcile published Categories, Cable Types and Connectors with cached Settings at startup. Load new published entries and untouched updates while retaining local edits/deletions. Persist the last published snapshot separately from reference downloads and include it in Save & refresh verification.
- Copy newly published cable types into matching selected project categories on refresh, including looms. Preserve existing vendor edits and intentionally deleted categories/previously seen rows. Automatic mismatched-unit loom additions omit lengths and show a notice. Offer custom categories found only in the cable file.
- Updated/upload: `js/app.js`, `js/model.js`, `js/version.js`, `tests/core.test.mjs`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Upload any reference JSON files you updated separately to their existing data/ destinations. No new/deleted project files. User's updated cable_types.json, other references, project JSON and backups preserved. Lampy Paperwork untouched; no upload or deployment.
- Validation: 177 automated tests passed, including the supplied 304 ft reference loom, quantity/length and Excel/project preservation, duplicate prevention, unit mismatch choices, cache reconciliation, all-category additions, local edit/deletion protection, startup persistence and repeat refresh. JavaScript syntax, JSON parsing, local module paths and version consistency passed.
- Browser testing was not run, as requested. Visual behaviour and live deployment remain unverified. Reference updates require refresh/reopen; data-only uploads do not trigger the app-version banner. Existing Excel behaviour adds an empty Data sheet for a loom-only full workbook; loom content still round-trips. No test downloads; temporary verification data removed. Separate Paperwork compatibility remains pending.

## v1.1.39 — 2026-10-16

Previous version: v1.1.38. Local release for manual upload; not deployed.

- Add a separate, keyboard-accessible × delete button to every project category tab, including Stock / Pre-Made Looms. Keep Vendor fixed. Confirm before deleting category contents; return to Vendor only when the deleted tab was active.
- Share deletion handling with the existing Remove category action. Remove cable row IDs and associated adaptor markers along with the category; preserve the imported baseline for export review and session undo/redo. Loom deletion clears its contents and hides its tab without altering cable categories. Settings references stay intact.
- Protect invalid active edits, blocked saving and workspace replacement while confirmation is open. Update current README usage and app version.
- Updated/upload: `js/app.js`, `js/model.js`, `css/app.css`, `js/version.js`, `tests/core.test.mjs`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. No new/deleted project files. User project JSON, backups and original inputs preserved. Lampy Paperwork untouched; no upload or deployment.
- Validation: 168 automated tests passed. Checks cover confirmation before mutation, inactive/active page behaviour, undo/redo, reference isolation, adaptor cleanup, baseline preservation, invalid-edit/save guards and JSON/project/Excel round trips after cable/loom deletion. All seven app modules passed syntax checks; JSON parsing, local module paths and version consistency passed.
- Browser testing was not run, as requested. Visual layout and browser interaction remain unverified for this release. No test downloads or temporary project files created; temporary verification data outside the project removed. Existing Paperwork compatibility and user acceptance remain pending.

## v1.1.38 — 2026-10-16

Previous version: v1.1.37. Local release for manual upload; not deployed.

- Apply the shared Add/Edit loom side pane and expandable parent/child table to Settings → Cable Types → Stock / Pre-Made Looms. Include component types/quantities, available-length chips and copy/merge controls, sorting, selection, column widths, top/bottom Save, undo/redo and protected deletion.
- Save Settings looms in the existing cable_types.json items array, independently from vendor stock. Preserve aliases and unknown fields; retain a per-reference length unit with explicit confirmation before unit changes. Legacy rows receive non-mutating editor defaults and validation for missing components. Keep the vendor stock JSON and Excel schemas unchanged.
- Add regression coverage for reference/stock isolation, scoped additions/deletions, legacy references, JSON preservation and loom validation. Correct Settings error navigation to select the corresponding loom parent.
- Updated/upload: `js/app.js`, `js/model.js`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted project files: none. Original references, user project JSON and backups preserved. Lampy Paperwork untouched; no upload or deployment.
- Validation: 164 automated tests passed, including JSON/Excel round trips. JavaScript syntax, local imports, JSON validity and version consistency passed. Approved local browser checks passed Add/Edit, missing-component validation, Enter adding a component row, alias preservation, expanded 35 px rows, numeric length-chip sorting, bottom Save committing a quantity edit, discard protection, reload persistence, reference JSON preview/download, deletion and undo/redo. The downloaded file preserved quantities, lengths, aliases and every other reference entry. Vendor stock Add/Save/length editing/JSON preview and undo/redo also passed. No console warnings/errors in checked flows.
- Cleanup: removed test rows and the downloaded cable_types.json; cleared the isolated test origin's storage, closed test tabs and stopped the local server. Screenshot retained outside the project. Other browsers, narrow screens and live deployment were not tested. Separate Lampy Paperwork loom consumption remains pending.

## v1.1.37 — 2026-10-15

Previous version: v1.1.36. Local release for manual upload; not deployed.

- Remove the helper text beneath Length unit and Length display on the Vendor tab. Keep both labels, selectors, layout and unit-change confirmation.
- Updated/upload: `js/app.js`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New files: none. Deleted the regenerated root `.DS_Store` as cleanup. User project JSON, backups and references preserved. Lampy Paperwork untouched; no upload or deployment.
- Validation: 161 automated tests passed, including JSON/Excel round trips. All seven JavaScript modules passed syntax checks, all 10 JSON files parsed, local imports resolved, and helper-removal/version consistency checks passed.
- Browser testing was not run for this update; fresh approval was not requested for this text-only removal. Visual behaviour remains unverified for this release. No temporary files or downloads created. Existing pending Paperwork compatibility and user acceptance remain unchanged.

## v1.1.36 — 2026-10-15

Previous version: v1.1.35. Local release for manual upload; not deployed.

- Correct the previous layout: remove the full-row span from the unit/display group so it sits beside Vendor name. Each unit field occupies 40% of the right-hand form area. At the existing narrow-screen breakpoint, the pair stacks below Vendor name.
- Use compact unit labels (Metric (m) / Imperial (ft)) and display labels (m / Meter / ft / ' / Feet) so the choices fit the smaller controls. Preserve confirmation, preferences and numeric values.
- Updated/upload: `js/app.js`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Also upload `css/app.css` from v1.1.35 if it has not been uploaded; its 40% width rule is required and unchanged in this fix. New/deleted files: none. Project JSON, backups and references preserved. Lampy Paperwork untouched; no upload or deployment.
- Validation: 161 automated tests passed; all seven JavaScript modules passed syntax checks, all 10 JSON files parsed, local imports resolved and version consistency passed. Approved local browser checks measured all three controls at the same vertical position (457.59 px). Each unit/display control measured 130.46 px within a 326.16 px group (40%). Metric/imperial switching, display selection and remembering the metric choice passed; no console warnings/errors in checked flows.
- Cleanup: restored the local test workspace from the supplied Siyan project, closed the temporary browser tab and stopped the server. No downloads or temporary project files created; screenshot saved outside the project. Narrow-screen layout, other browsers and live deployment were not tested.

## v1.1.35 — 2026-10-15

Previous version: v1.1.34. Local release for manual upload; not deployed.

- Place Length unit and Length display next to each other in a shared row spanning the Vendor details form. Each field uses 40% of that row, separated by a 16 px gap. Keep existing unit confirmation, display preferences and numeric data unchanged.
- Update the app version and README usage. Updated/upload: `js/app.js`, `css/app.css`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none. User project JSON, backups and original inputs preserved. Lampy Paperwork untouched; no upload or deployment.
- Validation: 161 automated tests passed. All seven app modules passed syntax checks; all 10 JSON files parsed; local imports and version consistency passed. Source/CSS checks confirmed field order and 40% column widths.
- Browser testing was not run for this update; visual layout remains unverified. No temporary files or downloads created. Existing Paperwork compatibility and day-to-day acceptance remain pending.

## v1.1.34 — 2026-10-15

Previous version: v1.1.33. Local release for manual upload; not deployed.

- Add a Length display selector for the chosen vendor unit: metric `m` / `Meter`; imperial `ft` / `'` / `Feet`, with examples. Apply the format to length chips, length-dialog units, vendor/category summaries, loom headings and length-colour headings/cells. Feet marked with an apostrophe have no intervening space, such as `10'`.
- Store per-unit display preferences in generator project backups and Excel metadata. Preserve legacy project files without inserting defaults; reject invalid preference values. Full workbook imports adopt incoming preferences, while partial category imports retain the current vendor's preferences. The format does not convert values, change colour lookup units or add fields to cable-stock JSON.
- Update the app version and README usage. Updated/upload: `js/app.js`, `js/model.js`, `js/excel.js`, `js/version.js`, `tests/core.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none. User project JSON, references and backups preserved. Lampy Paperwork untouched; no upload or deployment.
- Validation: 161 automated tests passed, including all five labels, unchanged runtime units/lengths, project/Excel round trips, legacy backups, full/partial imports and invalid preferences. All seven app modules passed syntax checks; all 10 JSON files parsed; local module imports and version consistency passed.
- Browser testing was not run, as requested. Visual selector/layout behaviour remains unverified for this release. No temporary files or downloads created. Existing Paperwork loom compatibility and day-to-day user acceptance remain pending.

## v1.1.33 — 2026-10-15

Previous version: v1.1.32. Local release for manual upload; not deployed.

- Let the Vendor input grow from its 50% starting width to fit its current text using a hidden text measure with matching font and padding. Update the measure for initial values, typing, clearing and restoration. Keep the clear button in the same flex row with an 8 px gap so it moves directly alongside the input as it expands or shrinks. Cap growth at the available space beside the button; exceptionally long names scroll within the input.
- Start every newly created project at vendor version v1, including New vendor and empty projects created when no saved vendor file exists. Initialise the matching baseline to avoid a false version change. Preserve saved/imported project versions and existing cable-stock JSON schemas.
- Update the app version and current README guidance. Updated/upload: `js/app.js`, `js/model.js`, `css/app.css`, `js/version.js`, `tests/core.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none. User project JSON, backups and references preserved. Lampy Paperwork untouched; no upload or deployment.
- Validation: 157 automated tests passed, including new default-version/baseline assertions, project/Excel preservation of v1 and existing versions, JSON/Excel round trips and vendor loading. All seven app modules passed syntax checks; all 10 JSON files parsed; local module imports and version consistency passed. Source checks confirmed the growing input and clear button share a flex row with reserved button space.
- Browser testing was not run, as requested. Visual width, button movement and cross-browser layout remain unverified for this release. No temporary files or test downloads created. Existing Paperwork compatibility and day-to-day user acceptance remain pending.

## v1.1.32 — 2026-10-15

Previous version: v1.1.31. Local release for manual upload; not deployed.

- Replace the Vendor-page native datalist with an accessible dropdown that opens with all available vendors in alphabetical order, even when a vendor is already selected. Filter as you type; support mouse selection, arrow keys, Enter/Tab, Escape and custom names.
- Set the Vendor text input to 50% of its existing field width and add a ❌ clear-search button to its right. Clearing search shows every vendor without deleting or replacing the loaded project. Empty blur/Escape restores the current vendor name; project switching retains its existing confirmation and loading safeguards.
- Preserve normal focus styling without yellow Vendor-name change highlighting. Keep error navigation targeting the input, and retain the shared vendor datalist for Settings tables.
- Updated/upload: `js/app.js`, `css/app.css`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none. User project JSON, references, backups and Lampy schemas preserved. Lampy Paperwork untouched; no upload or deployment.
- Validation: 155 automated tests passed, including JSON/Excel round trips and vendor-project loading. All seven JavaScript modules passed syntax checks, local imports resolved and all 10 JSON files parsed. Approved local browser checks passed all 15 vendors appearing with an existing name, filtering, mouse loading of the saved Siyan project, keyboard Enter/Tab selection, switch cancellation, custom-name confirmation, clearing without changing the loaded project, Escape/blank restoration and absence of yellow highlighting. Measured input width 163.07 px within a 326.15 px field (50%). No browser console errors or warnings in checked flows.
- Cleanup: temporary local browser tab closed and server stopped; no test downloads or temporary project files created. Screenshot evidence saved outside the project. Other browsers and live deployment were not tested. Existing Paperwork compatibility and day-to-day user acceptance remain pending.

## v1.1.31 — 2026-10-15

Previous version: v1.1.30. Local release for manual upload; not deployed.

- Remove the warning banner above the Stock / Pre-Made Looms table. Loom editing, validation and JSON/Excel output are unchanged; compatibility guidance remains available in the README and export review.
- Increase `js/version.js` and the README current project version.
- Updated/upload: `js/app.js`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none. User project JSON, backups and original inputs preserved. Lampy Paperwork untouched; no upload or deployment.
- Validation: all 155 existing non-browser tests passed, including JSON/Excel round trips and loom editing/import/export regressions. All seven app modules passed syntax checks, local imports resolved and all 10 JSON files parsed. Version consistency and removal of the Looms-tab warning passed. Browser testing was not run for this update. Paperwork loom support and day-to-day user acceptance remain pending.

## v1.1.30 — 2026-10-15

Previous version: v1.1.29. Live at https://ailampy.com/cable/ after the user uploaded the release; verified 2026-10-15.

- Remove the yellow change highlight from the Vendor name field on the Vendor tab. Preserve normal input focus styling, length-unit highlighting and table highlighting. Vendor change tracking and export reviews remain unchanged.
- Increase `js/version.js` and the README current project version; record completion in UPDATES.md.
- Updated/upload: `js/app.js`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none. User projects, reference JSON and backups preserved. Lampy Paperwork was not accessed or changed.
- Validation: all 155 existing non-browser tests passed, including vendor change review, JSON/Excel round trips and project loading. All seven app modules passed syntax checks, local imports resolved and all 10 JSON files parsed. Version consistency passed. File hashes confirmed only the five listed files changed; no temporary project artifacts remained.
- Browser testing was not run during implementation. The first live check still showed v1.1.29 and a yellow Vendor name highlight, including after reloading without browser cache. After the user re-uploaded `js/app.js` and `js/version.js`, approved live browser testing on 2026-10-15 confirmed the v1.1.30 footer and that the Vendor name field no longer highlights yellow for the existing Siyan LTD draft, including after focusing it and tabbing away. The field had a white input background, a transparent label background and no `inline-changed` class. The address stayed at ailampy.com/cable/.
- The existing draft was preserved. No test data entered or files downloaded; temporary verification tabs closed. Lampy Paperwork was not accessed or changed. No upload or deployment performed by the agent. Other browsers were not tested; existing Paperwork compatibility and user acceptance remain pending.
- Documentation follow-up — 2026-10-15: updated/upload `UPDATES.md` and `CHANGELOG.md` only to record the live result. App remains v1.1.30; no app code changes or project files added/deleted. Documentation checks passed and the version file is unchanged. Existing browser results recorded without rerunning browser tests for this documentation edit.

- README Vendor-field guidance — 2026-10-15: clarified that Vendor name has no yellow change highlight, retains normal focus styling and still participates in export review. Distinguished Length unit highlighting from table save highlights. README contains current usage only; release notes and test history remain here. Updated/upload: `README.md`, `UPDATES.md`, `CHANGELOG.md`. App remains v1.1.30. Documentation/source checks passed; browser tests were not rerun for this documentation-only change. No app code changes, new/deleted files, uploads or deployment.

- Status correction and cleanup — 2026-10-15: corrected the v1.1.29 live status in `UPDATES.md` and this changelog using the preceding browser observations. Removed the regenerated root `.DS_Store` after checking references and open-file use. Updated/upload: `UPDATES.md`, `CHANGELOG.md`. New files: none. Deleted: root `.DS_Store`. App remains v1.1.30. File hashes confirmed all other files, including project JSON, backups and app code, were unchanged; JSON parsing and version checks passed. Browser tests were not rerun for this documentation/cleanup task. No upload or deployment.

## v1.1.29 — 2026-10-15

Previous version: v1.1.28. Observed live at https://ailampy.com/cable/ on 2026-10-15 during the initial v1.1.30 check; subsequently superseded by v1.1.30.

- Remove the helper sentence below the Vendor name field. Retain the field label, searchable vendor selector and existing saved-project loading behaviour. The corrected loom guidance remains in Your workspace.
- Increase `js/version.js` and the README current project version. Record successful live v1.1.28 verification below.
- Updated/upload: `js/app.js`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none. User projects, backups and original inputs preserved. Lampy Paperwork was not accessed or changed.
- Approved local browser checks confirmed the Vendor name helper is absent, its input remains visible, corrected loom guidance is retained and the footer displays v1.1.29. No test data entered or files downloaded; test tabs closed and the local test server stopped. Screenshot evidence retained outside the project folder.
- Validation: all 155 existing non-browser tests passed, including JSON/Excel round trips and vendor-project loading. All seven app modules passed syntax checks, local imports resolved and all 10 JSON files parsed. Version consistency and removal of the helper sentence passed. File hashes confirmed only the five listed files changed; no temporary project artifacts remained.
- Live observation: the initial v1.1.30 verification loaded v1.1.29, including after a reload without browser cache. The footer displayed v1.1.29; Vendor name still had the yellow highlight expected before the v1.1.30 fix. This confirms v1.1.29 was served live, not a full live regression test of that release. Other browsers were not tested. Lampy Paperwork compatibility and day-to-day acceptance remain pending. No upload or deployment performed by the agent.

## v1.1.28 — 2026-10-15

Previous version: v1.1.27. Live at https://ailampy.com/cable/ after the user uploaded the release; verified 2026-10-15.

- Correct the Vendor-page help text: cable-stock JSON includes loom names, IDs, available lengths and cable quantities. Explain that Lampy Paperwork needs its separate planned update to use them.
- Clarify that project JSON/Excel also retain the vendor version, loom descriptions, connector overrides and component lengths. No import/export or data behaviour changed.
- Increase the app version in `js/version.js` and update the README current project version. Mark the wording correction complete in UPDATES.md.
- Updated/upload: `js/app.js`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Added/deleted files: none. User projects, backups and original inputs preserved. Lampy Paperwork was not accessed or changed.
- Validation: all 155 existing non-browser tests passed, including JSON/Excel round trips and loom import/export. All seven app modules passed syntax checks and local imports resolved; all 10 JSON files parsed. Verified corrected help text, version consistency and that only the five listed files changed. No temporary project artifacts created.
- Browser testing was not run during implementation. Subsequent approved live browser inspection on 2026-10-15 confirmed the v1.1.28 footer and corrected Vendor-page help text covering loom JSON fields, the pending Paperwork update and richer project/Excel backups. The address stayed at ailampy.com/cable/. No draft edits or downloads; test tab closed. Lampy Paperwork was not accessed or changed. No upload or deployment performed by the agent. Lampy Paperwork compatibility and day-to-day acceptance remain pending.

## v1.1.27 — 2026-10-15

Previous version: v1.1.26. Live at https://ailampy.com/cable/ after the user uploaded the release; verified 2026-10-15.

- Export stock looms at the vendor JSON root using `looms: [{id, name, lengths, cables: [{cableType, quantity}]}]`. Available lengths belong to the complete loom and use the vendor unit. Keep ordinary cable data and manifest entries unchanged.
- Import this structure into the existing loom editor, preserving stable loom IDs, quantities, length values/order and unknown imported fields. Reject malformed structures and duplicate IDs before replacing a draft. Report invalid lengths/quantities without blocking their export.
- Update complete JSON previews/downloads and the loom preview/copy/download. The loom-only fragment is now `looms.fragment.json` using the stock structure, replacing the generator-only fragment format/name. Complete vendor filenames are unchanged.
- Preserve existing project backups, saved vendor projects and Excel layouts, including descriptions, connector overrides and component-specific lengths. Stock export excludes those editor-only fields. Preserve explicit empty loom arrays through project/Excel round trips and avoid false import-preview changes from editor IDs. Safely migrate legacy root loom data without silently overwriting conflicting definitions.
- Reserve the root `looms` field for the loom editor. Update README usage/example and replace obsolete exclusion messages. Lampy Paperwork needs a separate future update to consume stock looms; it was not accessed or changed during this release.
- Updated/upload: `js/app.js`, `js/model.js`, `js/excel.js`, `js/version.js`, `tests/core.test.mjs`, `tests/loom-stock.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New file: `tests/loom-stock.test.mjs`. Deleted files: none. Original references, images, user project JSON and backups preserved.
- Initial local validation: 155 non-browser tests passed, including approved-shape JSON round trips, Excel binary round trips, unchanged Siyan backup, empty/deleted looms, unknown fields, quantity/length validation, legacy migration, import reviews, and preview/copy/download controller checks. Browser tests were not run during implementation, as requested. These controller checks are not browser or live-site verification.
- Static validation: all 10 JSON files, seven app modules and test modules passed parsing/syntax checks. Local imports and documentation links resolved; the README JSON example parsed and v1.1.27 references matched. File hashes confirmed original references, user projects, data, images and bundled library unchanged. No temporary artifacts or test downloads were created.
- Live verification — 2026-10-15: approved browser testing confirmed v1.1.27 at https://ailampy.com/cable/. Exported Siyan LTD’s cable-stock JSON, imported the downloaded file through the import review, then exported again. Both downloaded JSON files contained identical data. The 2-Way Socapex Loom preserved its ID/name, available lengths of 10, 15, 20, 25 and 30 m, and cable quantities of Socapex 19-Pin ×2 and XLR-5 ×4. The imported table displayed the same lengths and expanded cable quantities; the address stayed at ailampy.com/cable/.
- Live-test cleanup: restored the original browser draft/preferences exactly, closed the test tab and deleted both test JSON downloads. Screenshot evidence remains outside the project folder. Lampy Paperwork was not accessed or changed; no upload or deployment performed by the agent.
- Wording issue identified during verification: the Vendor page contained an outdated help sentence about loom support. The tested export/import worked; this sentence was corrected locally in v1.1.28.
- Documentation follow-up — 2026-10-15: updated/upload `UPDATES.md` and `CHANGELOG.md` only to record the live result. App version remains v1.1.27; no app code changes or project files added/deleted. Existing browser results recorded without rerunning browser tests for this documentation edit.
- Compatibility: existing Lampy Paperwork does not consume these stock-loom definitions yet. Keep project/Excel backups for richer editor data. Day-to-day user acceptance remains pending. No upload or deployment performed by the agent.

## v1.1.26 — 2026-10-15

Previous version: v1.1.25. Live at https://ailampy.com/cable/ after the user uploaded the release; verified 2026-10-15.

- Project-folder documentation and cleanup record — 2026-10-15: corrected `projects/README.md` to identify the included user-supplied Siyan LTD project and its exact upload path. Recorded removal of the regenerated root `.DS_Store` during the preceding audit; no further files deleted in this documentation follow-up. Updated/upload: `projects/README.md`, `UPDATES.md`, `CHANGELOG.md`. App remains v1.1.26; no app code changes or new files. User project JSON, backups and original inputs preserved. Verified the project vendor/filename, local documentation link, unchanged version and that only these three documents changed. Browser tests were not rerun for this documentation-only change. No upload or deployment.

- README table-workflow audit — 2026-10-15: clarified cell selection, typing to replace versus editing existing text, Tab/Shift+Tab/Enter navigation and Escape cancellation. Corrected yellow-highlight guidance to use the table’s last successful Save when available, while export reviews retain the original import baseline. Clarified that either Save table button commits the active edit and preserves visible selection. README contains current usage only; release notes and test history remain in CHANGELOG.md. Updated/upload: `README.md`, `UPDATES.md`, `CHANGELOG.md`. App version remains v1.1.26. Source/documentation checks passed; browser tests were not rerun for this documentation-only change. No app code changes, new/deleted files, upload or deployment.

- Correct README wording: yellow edit highlights and added/removed rows in review; remove claims that added rows have green accents.
- Remove unused formula-bar/cell-address CSS rules and the undisplayed cell-address element and update code. Retain the active cell editor, selection outlines, fill handle and yellow change highlighting.
- Updated/upload: `js/grid.js`, `css/app.css`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Added/deleted project files: none. Original examples, user project JSON, backups and runtime schemas unchanged.
- Validation: 138 automated tests passed, including JSON/Excel round trips. All 10 JSON files and all 7 app modules passed parsing/syntax checks. Approved local Chromium checks passed v1.1.26 startup, cable-cell editing with Tab, arrow and range selection, yellow highlighting and Save clearing it, expanded loom quantity editing with Enter, bottom Save and Settings-cell navigation. No console warnings/errors in checked flows. Obsolete code references removed.
- Cleanup: restored the local test workspace to the supplied Siyan project; closed the test tab and stopped the local server. No downloads or temporary project files created; screenshot retained outside the project as evidence.
- Live verification: Approved live Chromium testing on 2026-10-15 confirmed v1.1.26 at https://ailampy.com/cable/. Table editing and Tab navigation, single-cell and range selection, yellow edit highlighting, and Save table accepting an active edit and clearing highlighting all passed. Saved changes survived reopening. The address stayed at ailampy.com/cable/; no console warnings/errors in the checked flows. Test values were restored and the original cable JSON matched the pre-test snapshot exactly. No downloads, uploads or deployment performed by the agent.
- Documentation follow-up — 2026-10-15: updated/upload `UPDATES.md` and `CHANGELOG.md` only to record the live result. App version remains v1.1.26. No app code changes or project files added/deleted. Existing browser results recorded; browser tests were not rerun for this documentation edit.
- Limits: Firefox/Safari were not tested for this release. Existing Lampy loom-schema limitation and pending user acceptance remain unchanged. No upload or deployment performed by the agent.

## v1.1.25 — 2026-10-15

Previous version: v1.1.24. Live at https://ailampy.com/cable/ after the user uploaded the release; verified 2026-10-15.

- README loom-workflow audit — 2026-10-15: clarified Save loom validation/local saving, ordinary 35 px child rows and saved-data persistence. Corrected general table guidance to distinguish the main loom table and side pane from cable/Settings blank-row entry and Save table controls. README contains current usage only; release notes and test history remain in CHANGELOG.md. Updated/upload: `README.md`, `UPDATES.md`, `CHANGELOG.md`. Version remains v1.1.25. Source/documentation checks passed; no browser tests rerun. No app code changes, project files added/deleted, upload or deployment.

- Correct the loom layout: Add loom opens a side pane with Loom name and exactly two component columns, Cable Type and Quantity. Save loom validates and adds the finished item; Cancel/Close/Escape protect changed drafts before discarding them. Edit loom uses the same pane.
- Expand saved parent rows to show ordinary child rows in the same table. Remove the nested component tables. Keep 35 px rows, available lengths on parents, Name sorting, grouped search, inline component editing and top/bottom Save table buttons. Child rows sort within their parent; new looms are created only through the pane.
- Preserve loom IDs, connector overrides, descriptions, custom fields, component lengths and project/Excel schemas. New components inherit recognised connectors or cable-name fallbacks. Lampy cable-stock JSON remains unchanged and excludes looms.
- Updated/upload: `js/app.js`, `js/model.js`, `js/grid.js`, `css/app.css`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Added/deleted project files: none. Removed superseded nested-table rendering/styles. User project JSON, original examples and backups preserved.
- Validation: 138 automated tests passed, including JSON/Excel round trips, draft validation, hierarchy ordering and field preservation. All 10 JSON files parsed and all 7 JavaScript modules passed syntax checks. Approved local Chromium checks passed two-column pane layout, required-name/component/positive-quantity validation, Enter row creation, Tab movement, Save, protected cancellation, ordinary 35 px child rows, inline quantity edits, grouped filtering, bottom Save, parent lengths, connector inheritance in JSON preview and persistence after reopening. No console warnings/errors in the final checked flow.
- Cleanup: local browser test workspace restored to the supplied Siyan project; test server stopped. No test downloads created. Screenshots retained outside the project folder as visual evidence.
- Live verification — 2026-10-15: after the user re-uploaded model.js and excel.js, approved Chromium testing confirmed v1.1.25 at https://ailampy.com/cable/. Add loom opened the side pane with Loom name and exactly two component columns, Cable Type and Quantity. Save loom added the parent; expansion displayed ordinary 35 px child rows in the same table, with no nested tables. Bottom Save table accepted a pending quantity edit; the saved loom and edited quantity survived reopening. The address stayed at ailampy.com/cable/.
- Live startup initially used stale cached files. A fresh load succeeded, then startup with normal caching also passed. No console warnings/errors in the successful flow. Removed the temporary test loom and confirmed original loom JSON exactly matched the pre-test snapshot. No files downloaded during this successful check; temporary scripts from the preceding failed verification had already been deleted.
- Documentation follow-up: updated/upload `UPDATES.md` and `CHANGELOG.md` only. App version remains v1.1.25; no app code changes or project files added/deleted. Existing browser results recorded without rerunning browser tests for this documentation edit.
- Limits: Firefox/Safari and native save pickers were not tested for this release. Loom expansion is session-only. Pending authoritative Lampy loom-schema support remains unchanged. No upload or deployment performed by the agent.

## v1.1.24 — 2026-10-15

Previous version: v1.1.23. Local release for manual upload; not deployed.

- Replace separate loom cards with a Name-sorted parent table containing loom name, available lengths and description. Expand a name to edit its cable types and quantities in a component table; quantities describe cables inside one loom.
- Retain shared table editing, filtering, resizing, top/bottom saving, undo and length chips. Keep expansion tied to loom identity. Scope nested table selection and events to their own grid, and protect pending component edits before collapsing or rebuilding the parent table.
- Preserve existing project/Excel loom structures, IDs, connectors, custom data and source length order. Lampy runtime JSON still excludes looms because its supplied schema has no demonstrated loom support.
- Updated/upload: `js/app.js`, `js/grid.js`, `css/app.css`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Added/deleted project files: none. Removed obsolete loom-card rendering/styles. Original project JSON, references and backups unchanged.
- Validation: 136 automated tests passed, including parent edits preserving component/custom data, separate loom identities, inherited connectors and pending-editor guards; existing JSON/Excel round-trip tests passed. Approved local Chromium checks passed existing loom expansion, new loom name/length/component entry, quantity editing with Tab, parent Save accepting a pending quantity, collapse/reopen, filtering, persistence in a new tab and invalid-quantity protection. No browser console warnings/errors in checked flows. Local test workspace restored to the original Siyan project; no test downloads created.
- Limits: Firefox/Safari and live deployment not tested for this release. Loom expansion is session-only; saved loom contents persist. No upload or deployment performed.

## v1.1.23 — 2026-10-14

Previous version: v1.1.22.

- README rule audit — 2026-10-14: Removed the remaining browser and Excel test-history statements from README; their coverage and limitations remain in the existing release entries below. Replaced historical seed-dataset wording with current destination guidance. Kept setup requirements, the local test command, usage and upload instructions. Updated `README.md`, `CHANGELOG.md` and `UPDATES.md`; app version remains v1.1.23. No files added/deleted, uploads or deployment. Documentation links and unchanged app/data files verified; no browser tests run for this documentation-only change.

- Documentation maintenance — 2026-10-14 (app remains v1.1.23): Corrected README upload guidance to include projects/ and saved vendor project JSON. Removed release notes, historical test reports and superseded instructions from README; retained current setup, usage, upload and troubleshooting guidance, with release history in CHANGELOG.md. Recorded the preceding removal of root .DS_Store. User project JSON, backups and app files preserved. Changed/upload: README.md, UPDATES.md, CHANGELOG.md. No new files; no further files deleted in this documentation follow-up. No upload or deployment.
- Documentation checks: README release-note sections removed; local document links and required upload paths checked. App version and all non-documentation files unchanged. Browser tests not run for this documentation-only change.

- Live vendor-project verification on 2026-10-14: saving vendor projects and loading them when a vendor is selected passed approved Chromium browser testing at https://ailampy.com/cable/ on v1.1.23 using Siyan LTD. Selecting Siyan LTD found projects/siyan_ltd.lampy-project.json and loaded vendor v2, 4 categories, 17 cable types and 1 loom after confirmation. Save vendor project → Download project JSON produced JSON exactly matching the supplied project. The address stayed at ailampy.com/cable/; no console errors. The project has 3 connectors awaiting review. Native Choose save location was not tested. No upload or deployment performed by the agent.
- Documentation-only follow-up: updated `UPDATES.md`, `CHANGELOG.md` and `README.md`; app version remains v1.1.23. Recorded cleanup of agent-created test downloads as an ongoing rule. No new or deleted project files.

- Move the bottom Save table action directly below the table rows and ahead of help text. Retain the top button’s horizontal alignment, dimensions and save behaviour across shared grids. Correct the earlier styling-only change.
- Updated/upload: `js/grid.js`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Added/deleted files: none.
- Validation: 133 automated tests passed. Approved local Chromium confirmed adjacent table/footer placement, equal button geometry and working save action, with no console errors. Other browsers not tested.
- Live verification on 2026-10-14 after user upload: ailampy.com/cable/ displays v1.1.23. Chromium checks passed bottom Save table placement directly below the rows and before help text, matching horizontal alignment/dimensions with the top button, and successful saving. The address stayed at ailampy.com/cable/; no console warnings/errors. No upload or deployment performed by the agent.

## v1.1.22 — 2026-10-14

Previous version: v1.1.21.

- Add generator-only Save vendor project with a deterministic filename and exact projects/ destination. Offer a native save-location picker where supported plus standard JSON download. Preserve complete generator project data; no changes to Lampy stock JSON or manifest schema.
- Vendor selection fetches its saved project relative to the app path without cached responses. Validate project format and vendor identity before replacement. Missing files start empty projects; HTTP/network/invalid-file errors preserve the current draft. Provide explicit reload for the current vendor.
- Confirm before replacing an existing workspace, with Cancel and Save current backup. Ignore superseded requests and responses arriving after workspace edits. Startup continues restoring local drafts without fetching over them.
- Explain manual GitHub upload, public hosted files, exact filenames, new-vendor reference updates and separate reference downloads. Register the new module in release-specific bootstrap imports.
- Updated/upload: `index.html`, `js/app.js`, `js/version.js`, new `js/vendor-projects.js`, new `tests/vendor-projects.test.mjs`, new `projects/README.md`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Deleted files: none. Original examples/reference inputs unchanged. No real vendor projects fabricated or bundled.
- Validation: 133 automated tests passed, including filenames/collisions, relative uncached requests, full project preservation, missing/error/mismatched files, stale requests and edits during loading. Approved local Chromium tests passed download to exact filename, loading the downloaded file from an isolated local hosted folder, vendor-selection loading, cancellation, saved version/cable restoration and invalid-file draft preservation. No console warnings/errors in checked flows.
- Not uploaded or deployed. Native OS save dialog/file writing and non-Chromium browsers were not tested; standard download was tested. Subsequent live saving and vendor-selection loading passed on v1.1.23 using Siyan LTD; see the verification above.

## v1.1.21 — 2026-10-14

Previous version: v1.1.20.

- Show an explicit category dropdown when editing a connector Category cell, including Uncategorised entries. Filter available sheets as the user types; support clicking or arrow keys with Enter/Tab. Retain custom category entry and existing colour palette restrictions.
- Match the bottom Save table button to the top button’s alignment, size, font, border and padding across shared tables.
- Record live v1.1.20 verification in README.md and UPDATES.md.
- Updated/upload: `js/app.js`, `js/grid.js`, `js/version.js`, `css/app.css`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none. Original inputs unchanged.
- Validation: 129 automated tests passed. Approved local Chromium checks passed dropdown display/filtering, keyboard and mouse selection, category moves and matching Save button geometry/styling. No console errors. Other browsers not tested.
- Local only; not uploaded or deployed.

## v1.1.20 — 2026-10-14

Previous version: v1.1.19.

- Confirmed live at ailampy.com/cable/ on 2026-10-14 after user upload. Chromium tests passed Connectors sheets, category assignment and bottom Save committing active edits. Address retained, no console errors, temporary test entry removed.

- Organise Settings → Connectors into category sheets matching Cable Types, with Uncategorised fallback. Infer existing entries from cable-type connector names/aliases without changing original inputs. Shared entries can appear in multiple inferred sheets; explicit category choices override inference.
- New connector rows inherit the selected sheet. Category edits move entries; additions, paste, deletion, table preferences and error navigation use the selected sheet. Approval assigns a single usage category when available. Export keeps all sheets in one connector_types.json; stock JSON stays unchanged.
- Add a second Save table button below every shared grid, using the same pending-edit validation, local save and highlight reset as the top button.
- Record v1.1.19's successful live browser verification in README.md, UPDATES.md and this changelog.
- Updated/upload: `js/app.js`, `js/model.js`, `js/grid.js`, `js/version.js`, `css/app.css`, `tests/core.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Added/deleted project files: none. Original reference examples and seed data unchanged.
- Validation: 129 automated tests passed. Approved local Chromium tests passed inferred Data/Mains sheets, new-row category inheritance, moving entries, complete reference export and bottom Save committing an active edit. No console warnings/errors in checked flows. Other browsers not tested.
- Local only; not uploaded or deployed. Local saves and connector approvals still require reference download/upload for publication.

## v1.1.19 — 2026-10-14

Previous version: v1.1.18 (local). v1.1.19 verified live at https://ailampy.com/cable/ on 2026-10-14.

- Missing cable endpoints first inherit recognised cable defaults, then use the cable name as fallback. Preserve populated overrides, unknown fields and imported baselines; malformed connector objects and invalid directions remain validation errors.
- Unknown connector names become grouped review warnings. The Errors button shows a yellow notification icon and pending connector count alongside its red error count. Existing reference names and aliases are already recognised and do not need repeat approval.
- Review a connector using a normal text input, optionally correct all listed cable ends, then explicitly approve it into the local Connectors list. Empty approvals are rejected; duplicate names/aliases are not added. Cancel leaves it pending. Download the exact connector_types.json from Errors or Settings and upload to data/connector_types.json to publish the permanent list.
- Review status follows the connector reference list across JSON, project backup and Excel round trips without adding fields to Lampy stock JSON. Keep adaptor-only table columns and the separate connector form.
- Updated/upload: `js/app.js`, `js/model.js`, `js/version.js`, `css/app.css`, `tests/core.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Include `js/grid.js` from v1.1.18 if upgrading from v1.1.17. Added/deleted project files: none. Original references/examples unchanged.
- Validation: 126 automated tests passed, including fallback, partial/malformed data, deduplicated approval, JSON/project/Excel review persistence and original schema round trips. Approved local Chromium testing passed fallback inputs, yellow indicator, empty approval rejection, corrected approval, connector reference download, stock JSON preview, hidden table columns and reopening with pending/approved states retained. No console warnings/errors in checked flows.
- Live verification after user upload: Chromium passed connector fallback, yellow review notification, corrected approval, reference and stock JSON previews, and approval persistence after reopening. Address stayed at ailampy.com/cable/; no console errors; temporary test data removed. Other browsers were not tested. Publishing reference changes still requires your manual download/upload.

## v1.1.18 — 2026-10-14

Previous version: v1.1.17.

- Correct the v1.1.17 table regression: custom/incomplete cables no longer reveal direction and connector columns for the whole table. Those columns are once again adaptor-only; non-adaptor cells remain hidden/read-only there.
- Add a Connectors button within the cable-name cell for custom/incomplete rows. Open ordinary connector inputs with a direction choice, required-end validation, Save and Cancel. No JSON input or adaptor flag is required. Connector error links open this form for non-adaptors. Retain recognised connector inheritance and existing overrides.
- Updated/upload: `js/app.js`, `js/grid.js`, `js/version.js`, `tests/core.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Added/deleted: none.
- Live verification: ailampy.com/cable/ displays v1.1.17 and retains that address. Live tests verified recognised inheritance and custom connector values in the JSON preview. Temporary test category removed; no deployed files modified and no console errors in checked flows.
- Local validation: 123 automated tests passed. Approved Chromium tests verified hidden columns for custom cables, connector form saving/export, and adaptor columns appearing/disappearing with the checkbox. No console errors.
- Limits: v1.1.18 is local only; not uploaded or deployed. Firefox/Safari not tested.

## v1.1.17 — 2026-10-14

Previous version: v1.1.16.

- Recognised cable names/aliases fill missing connector defaults on name entry and when their category opens. Preserve populated connector overrides and incompatible existing directions; incomplete recognised rows remain editable. Empty recognised rows inherit the reference direction.
- Show ordinary Direction, Start/male and End/female columns when a category contains custom cables, incomplete connector data or adaptors. These controls no longer require an adaptor flag. Keep JSON columns hidden. Bidirectional cables edit/display their existing end field.
- Connector errors link to usable connector fields and locate the source row correctly in sorted tables. Existing category repairs are saved as draft changes and remain visible in export review; imported baselines are retained.
- Updated/upload: `js/app.js`, `js/model.js`, `js/version.js`, `tests/core.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Added/deleted: none. Original examples/reference files unchanged.
- Validation: 123 automated tests passed, including aliases, partial inheritance, override preservation, bidirectional end fields, custom inputs and existing JSON/Excel round trips. Approved local Chromium checks verified custom inputs without adaptor flags, recognised inheritance, exported connector values and repair of an existing incomplete row after reopening its category. No console errors in checked flows.
- Limits: Unrecognised cable types require user-supplied connectors. Incompatible or malformed existing values remain available for manual correction. Existing recognised rows are repaired when their category is opened. Firefox/Safari and deployment not tested; no upload or deployment performed.

## v1.1.16 — 2026-10-14

Previous version: v1.1.15.

- Add Reset widths to each table toolbar. Restore only that table's editable columns to 150 px and save its preference; preserve other tables, zoom, alignment, sorting and highlighting. Validate a pending edit first and follow a rebuilt table.
- Display length chips lowest to highest using numeric comparison, including decimals. Sort a copy so imported/source arrays remain unchanged; retain duplicates and invalid entries for validation.
- Remove the 450 px chip-container cap. Length cells use their column's full width; overflowing chips remain scrollable from the first chip. The length-entry dialog is unchanged.
- Updated/upload: `js/grid.js`, `css/app.css`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none.
- Validation: 119 automated tests passed. Approved local Chromium checks verified 1.5/2/10/20 display order, 549 px chip content inside a 550 px column, Reset widths restoring 150 px only on the current table, another table retaining 170 px, and persistence across table switches. No console errors in checked flows.
- Limits: Length sorting is display-only; source/export array order stays unchanged. Firefox/Safari and live deployment not tested. No upload or deployment performed.

## v1.1.15 — 2026-10-14

Previous version: v1.1.14.

- Vendor version accepts a bare major/minor number and adds the v prefix when the field is committed: 2 → v2, 2.1 → v2.1. Accept existing v/V prefixes without duplication; trim surrounding whitespace. Keep minor digits such as 2.10 unchanged and allow clearing the field.
- Invalid text remains available for correction with existing validation warnings. App version and imported custom runtime version fields remain independent.
- Updated/upload: `js/app.js`, `js/model.js`, `js/version.js`, `tests/core.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none.
- Validation: 116 automated tests passed, covering numeric entry, existing prefixes, whitespace, empty/invalid values and increment compatibility. Browser testing not run for this update. No upload or deployment performed.

## v1.1.14 — 2026-10-14

Previous version: v1.1.13.

- Clear sort now restores the default ascending Name order instead of source order. Manifest uses vendor name, loom components use cable type, and Length colour uses numeric Length. Keep the search filter and validate pending edits before resetting.
- Allow paste to extend sorted tables safely, since clearing sort no longer disables sorting. A search filter must still be cleared before extending past visible rows.
- Updated/upload: `js/grid.js`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Added/deleted: none.
- Validation: 114 automated tests passed, including reset defaults, pending/rebuilt editors and sorted paste extension. Browser testing not run for this update. No upload or deployment performed.

## v1.1.13 — 2026-10-14

Previous version: v1.1.12.

- Default tables to ascending alphabetical Name order, ignoring case and using natural number ordering. Vendor Manifest sorts by vendor name; loom components sort by cable type. Length colour has no Name column and defaults to numeric Length order.
- Keep blank entry rows last, manual header sorting and Clear sort. Sorting affects display only; source/export array order is preserved. Clear sort before pasting beyond the visible rows, as with existing sorted tables.
- Updated/upload: `js/grid.js`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. New/deleted files: none.
- Validation: 111 automated tests passed. Browser testing not run for this update. No upload or deployment performed.

## v1.1.12 — 2026-10-14

Previous version: v1.1.11.

- Show a live filtered palette list while typing in Length colour cells. Match supplied names, aliases and palette codes; display each matching colour once with its swatch. Show a clear no-match message.
- Select a suggestion by clicking, or use Up/Down then Enter/Tab. Keep typing focus in the cell; Escape cancels. Existing values open as colour names rather than codes.
- Accept only values from the supplied palette (including its No Colour option). Reject unknown typed/pasted values; rectangular paste remains atomic. No external colour sources or new arbitrary colours.
- Updated/upload: `js/app.js`, `js/grid.js`, `js/model.js`, `js/version.js`, `css/app.css`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Added/deleted: none. Original reference palette unchanged.
- Validation: 108 automated tests passed, including filtering, allowed palette values and rejected pasted values. Approved local Chromium tests verified prefix filtering, keyboard selection with Tab, mouse selection, no-match feedback, rejected Enter and Escape. No browser console errors in checked flows.
- Limits: Firefox/Safari not tested for this release. Palette popovers require a modern browser, as before. No upload or deployment performed.

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
