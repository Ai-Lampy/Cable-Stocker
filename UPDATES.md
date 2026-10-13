# Updates

## Pending

- User acceptance of the initial release in day-to-day cable-stock editing.
- Confirm an authoritative Lampy Paperwork composite-loom schema before enabling loom fields in its cable-stock export. Until then, generator project JSON and Excel preserve looms separately.

## Completed

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
- The user separately authorised the first GitHub upload and configured GitHub Pages. This v1.1.2 update is local only; the user will upload the changed files.
- Browser testing was not run for v1.1.2; fresh approval is required. Prior v1.1.1 browser testing remains recorded in CHANGELOG.md.
- The supplied colour_options.json is unchanged. New length_colours.json stores generator-only assignments; no unsupported colour/adaptor fields enter Lampy runtime JSON.
- Application version is defined in js/version.js. Vendor version is separate.
- No production manifest location outside the supplied reference path was inferred.

## Future

- No future-release implementation or scaffolding is included. Record user-approved follow-up requests here after V1 use.
