# Updates

## Pending

- User acceptance of the initial release in day-to-day cable-stock editing.
- Confirm an authoritative Lampy Paperwork composite-loom schema before enabling loom fields in its cable-stock export. Until then, generator project JSON and Excel preserve looms separately.

## Completed

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
