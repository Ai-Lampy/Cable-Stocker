# Updates

## Pending

- User acceptance of the initial release in day-to-day cable-stock editing.
- Confirm an authoritative Lampy Paperwork composite-loom schema before enabling loom fields in its cable-stock export. Until then, generator project JSON and Excel preserve looms separately.

## Completed

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
- The user separately authorised the first GitHub upload and configured GitHub Pages. This v1.0.1 update is local only; the user will upload the changed files.
- Browser testing was explicitly authorised for this v1.0.1 fix. Every future update still needs fresh explicit browser-test approval.
- Application version is defined in js/version.js. Vendor version is separate.
- No production manifest location outside the supplied reference path was inferred.

## Future

- No future-release implementation or scaffolding is included. Record user-approved follow-up requests here after V1 use.
