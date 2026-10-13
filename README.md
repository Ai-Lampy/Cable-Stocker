# Lampy Cable Stock JSON Generator

Static, local-first cable-stock editor. The application version has one source of truth: `js/version.js`. `BUILD_BRIEF.md` remains the authoritative specification.

## Run locally

From this folder:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open `http://localhost:8080`. Keep the terminal running while using the app. No install or build is needed. Do not open `index.html` using `file://`: browsers prevent its reference-file requests.

For manual GitHub Pages upload, retain the complete folder structure and use this folder as the published static root. All application requests use relative paths, including under a repository subpath. For later updates, replace changed files at those same relative paths.

## Work with cable stock

1. Select a vendor, or enter a new vendor name. New vendors start in metres. Imported feet remain feet.
2. Confirm the output filename. The supplied manifest confirms `christie_lites_cable.json` for Christie Lites UK. Its Lampy Paperwork destination is `json/cable/christie_lites_cable.json`.
3. Add categories with **+**. Search names and aliases or enter a new category. The selected wording remains in vendor data.
4. Add a row. Double-click a cell or press F2 to edit it through the cell-content bar. Press Enter or **Apply cell** to commit. Selecting a cable reference on a new row prefills connectors. Vendor overrides remain editable.
5. Use **Edit lengths**. Type a positive number and press Enter for each chip. Paste separated lists. Backspace removes the last chip when the input is empty. **Copy Lengths** stores a set inside the app. **Apply / Paste Lengths** offers Replace, Merge or Cancel. No unit conversion occurs.
6. Open **Review & export**. Errors do not block JSON previews, copying or downloads. A downloaded file with errors is not labelled valid.

Changing the vendor name keeps the current stock and asks before doing so when stock exists. Use **New vendor** for an empty document. Imports, category deletion and row deletion have review/confirmation. Undo/redo covers vendor, cable, loom and reference edits for the current session (up to 100 operations).

Plain cable-stock JSON import previews compare against your current draft by matching identical rows first, then matching a single remaining row with the same name in the same category. An unchanged file reports zero changes. Renames and ambiguous duplicate-name edits appear as additions/removals because stock JSON has no persistent row IDs. Project backups retain their existing ID-based comparison. Cancelling leaves your draft untouched; accepting a stock JSON import establishes a fresh baseline.

## Three output types

| Output | Purpose | Contents |
| --- | --- | --- |
| Lampy cable-stock JSON | File read by Lampy Paperwork | Exact source schema: `vendor`, `cables`, and retained imported custom fields. No editor IDs or preferences. |
| `*.lampy-project.json` | Reopen all generator work | Cable stock, composite looms, generator vendor version, filename, row identities and imported baseline. **Not** a Lampy Paperwork input. |
| `.xlsx` | Spreadsheet editing and backup | Cable categories, looms/components, vendor metadata, custom fields and stable row keys. |

The supplied cable-stock example has **no loom structure or version field**. V1 keeps newly authored looms and the generator vendor version in project/Excel backups. It warns before a Lampy download that excludes them. Imported runtime version fields and other custom fields stay untouched and can be edited under Custom metadata. The app does not claim Lampy Paperwork can consume composite looms. No unsupported runtime fields were invented.

Vendor versions such as `v2` and `v2.1` are independent of the app version. Major/minor buttons require confirmation. A category JSON preview/download is a labelled fragment, not a complete vendor file.

## Tables

- Arrows, Enter, Tab and Shift+Tab move between cells. Shift+arrows or Shift+click extends a range. Ctrl/⌘ A selects the table.
- Ctrl/⌘ C and Ctrl/⌘ V copy/paste rectangular Excel-compatible TSV. Quoted multiline cells are supported. Toolbar Copy/Paste uses clipboard permission when available.
- Drag the green selection corner to repeat values into a rectangle. Fill down repeats the first selected row. Invalid paste/fill operations apply no cells.
- Drag a header separator to resize. Focus the separator and use left/right arrows for keyboard resizing.
- Click a heading to sort ascending/descending. **Clear sort** restores source order. Search filters displayed rows. Clear filtering/sorting before extending the table with pasted rows.
- Zoom, widths, alignment and wrapping persist per table. Zoom changes the table only. Preferences never enter Lampy JSON.
- Yellow marks values changed from the imported baseline. Added rows have a green edge. Removed rows appear in review. Excel imports retain the original baseline; importing another stock JSON establishes a new one.

## Composite looms

Add **Stock / Pre-Made Looms** from the category selector. Set its name, optional description and available lengths. Add components with cable type, positive whole-number count, inherited connectors and optional connector/length overrides. Counts represent cables **inside one loom**, never the number of looms owned.

## Excel format

Use app-generated workbooks/templates. Import accepts `.xlsx`, not legacy `.xls`. Formula cells are rejected: paste values in Excel first. Parsing happens locally; no upload occurs. Imports larger than 25 MB are rejected.

Cable worksheet columns, in order:

`key`, `name`, `direction`, `start_connector`, `end_connector`, `lengths`, `connectors_json`, `custom_json`

- Keep `key` unchanged for existing rows. Leave it blank for a new row. Duplicate keys are rejected.
- `lengths` contains numeric comma-separated values with decimal dots, such as `5, 10, 12.5`. It is not a stock quantity.
- Bidirectional cables use `connectors.end`. Start and end cells display the same connector.
- Edit either endpoint cells or `connectors_json`. If you edit both, they must agree. Unknown connector keys survive.
- Use `custom_json` for additional row fields. Unexpected columns are rejected rather than discarded.

Loom columns: `key`, `name`, `lengths`, `description`, `custom_json`.

`_Components` columns: `loom_key`, `component_key`, `type`, `count`, `connectors_json`, `lengths`, `custom_json`.

`_Categories` maps Excel-safe sheet names to full category names and kinds (`cables` or `looms`). It preserves names longer than 31 characters and forbidden Excel characters. Map any new sheets. To remove a category from a full workbook, remove both its sheet and mapping row.

`_Metadata` has editable `vendor_name`, `length_unit`, `vendor_version` and `filename` rows. Its `json_…` rows explicitly preserve custom document metadata and original cable-row values. Keep them unchanged. Large metadata is split across cells. Unchanged partially invalid imported values remain preserved and flagged. Changed invalid length lists are rejected on import.

Single-category exports include mapping and metadata so imports know their scope. **Replace imported scope** removes rows absent from that scope; **Merge** updates matching keys (or names when keys are unavailable) and retains absent rows. Review shows both outcomes. A plain single sheet with documented cable columns can be imported without metadata; its sheet name becomes the category and current vendor metadata remains.

Excel's 32,767-character limit applies to each cell. Oversized row metadata requires project JSON as the lossless alternative. Desktop Microsoft Excel and LibreOffice were not used for native-application validation; binary read/write and local-browser re-import were tested.

## References and exact destinations

| File | Role / destination |
| --- | --- |
| `reference/lighting_vendors.json` | Original simplified 15-vendor reference; replace here after a Settings download. |
| `reference/manifest.json` | Original authoritative lookup. Replace the generator copy here; apply to Lampy Paperwork only at your existing manifest location. |
| `reference/examples/christie_lites_cable.json` | Read-only original. Generated output belongs separately in Lampy Paperwork at `json/cable/christie_lites_cable.json`. |
| `data/categories.json` | **New generator seed dataset**. Place Settings download here. |
| `data/cable_types.json` | **New generator seed dataset**. Place Settings download here. |
| `data/connector_types.json` | **New generator seed dataset**. Place Settings download here. |
| `images/vendor/*` | 15 unchanged original logos. Preserve path and filename case. |

The three new dataset filenames were approved for generator use. They do not claim pre-existing Lampy production paths. The supplied manifest has one Christie entry, preserved in full. Its location in the separate Lampy Paperwork deployment was not inspected or guessed.

Settings downloads use the exact basename without timestamps. Your browser may add a duplicate-download suffix; restore the canonical name before manually replacing a reference. Browsers cannot overwrite project files themselves.

## Draft safety

Drafts and references autosave in localStorage for the current browser origin. Clearing browser data, changing host/port, private browsing or storage limits can remove/prevent drafts. Keep downloaded backups. Reference edits need separate JSON downloads: project backups contain vendor work, not all Settings datasets.

The app warns on leaving with unexported edits where permitted. Storage failures appear in the header. If another tab changes the draft, autosave pauses; download the current in-memory project before reloading. Damaged saved drafts are not silently overwritten. No analytics, server storage or runtime CDN requests are used.

## Tests and compatibility

Run `node --test tests/core.test.mjs` with Node 22+ recommended. Tests use generated internal fixtures, never modify original sources, and need no package installation. `package.json` supplies optional npm shortcuts; npm is not needed for the app.

Target current Chromium, Firefox and Safari with ES modules, native dialog, structuredClone, localStorage and CSS zoom. Browser tests used Codex Chromium. Older browsers, mobile drag gestures and native Excel/LibreOffice behaviour are not certified. Clipboard buttons depend on permission; keyboard copy/paste is the fallback.

Tool Tracker Inventory Table View and footer were inspected read-only. No changes were made to that reference site. The user authorised the initial GitHub upload separately and configured GitHub Pages. The deployed v1.0.0 was subsequently tested. The v1.0.1 fix was tested locally with fresh browser-test approval and awaits the user's upload; those local checks do not verify its deployment. Future browser testing requires fresh approval, per `BUILD_BRIEF.md`.

Bundled library: SheetJS CE 0.20.3 from its official CDN, with Apache 2.0 licence in `vendor/SHEETJS-LICENSE.txt`. Documentation: https://docs.sheetjs.com/docs/getting-started/installation/standalone/.

## Upload inventory

Upload the root HTML/docs/package files and `.nojekyll`, plus `css/`, `js/`, `data/`, `reference/`, `images/vendor/`, `vendor/` and `tests/`, retaining every filename and subfolder. The chat handover provides the complete file tree. Exclude Finder `.DS_Store` files and locally downloaded test outputs. No V2 modules or placeholders are included.
