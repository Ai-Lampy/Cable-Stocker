# Lampy Cable Stock JSON Generator

Static, local-first cable-stock editor. The application version has one source of truth: `js/version.js`. `BUILD_BRIEF.md` remains the authoritative specification.

**Live app:** [ailampy.com/cable](https://ailampy.com/cable/), running **v1.1.23**. Verified in Chromium on 2026-10-14 after the user's upload. The bottom **Save table** button sits directly below the rows, before help text, with identical horizontal alignment and dimensions to the top button. Placement, alignment and saving passed live browser testing. The address stayed at ailampy.com/cable/ and no console warnings/errors were found.

Live vendor-project verification on 2026-10-14: saving vendor projects and loading them when a vendor is selected passed approved Chromium browser testing at https://ailampy.com/cable/ on v1.1.23 using Siyan LTD. Selecting Siyan LTD found projects/siyan_ltd.lampy-project.json and loaded vendor v2, 4 categories, 17 cable types and 1 loom after confirmation. Save vendor project → Download project JSON produced JSON exactly matching the supplied project. The address stayed at ailampy.com/cable/; no console errors. The project has 3 connectors awaiting review. Native Choose save location was not tested. No upload or deployment performed by the agent.

Earlier live checks: v1.1.19 passed connector review/approval and persistence; v1.1.20 passed Connectors category sheets, category assignment and bottom-button saving.

## Saved vendor projects — generator only

1. Build or import your vendor’s project, then choose **Vendor → Save vendor project**.
2. Use **Choose save location** where supported, or **Download project JSON**. Save/move the file into this project’s **`projects/`** folder using the exact generated filename. For example: `projects/christie_lites_uk.lampy-project.json`.
3. Upload that file to the same `projects/` location in your GitHub repository. Do not add it to Lampy’s cable-stock manifest. No project index or manifest change is needed.
4. Selecting the vendor now looks for its uploaded generator project. Confirm before replacing an existing workspace, or cancel to keep your draft. Use **Load saved vendor project** to reload the currently selected vendor.

The project JSON preserves cable stock, custom fields, looms, adaptor markers, vendor version and imported baseline. Settings/reference changes remain separate files; for a newly added vendor, upload the updated `reference/lighting_vendors.json` so it appears in the selector. Approved connectors still need their own `data/connector_types.json` download/upload.

Vendor selection now switches projects rather than renaming the current stock. If no saved project exists, it starts an empty vendor project after confirmation when there is existing work. Invalid files, network failures, wrong-vendor documents or edits made while a request is pending leave the current draft unchanged. Reopening the app restores your local draft; it does not silently replace it from the hosted file.

Keep vendor names and generated filenames consistent. Filenames are derived from vendor names; conflicting names are rejected. Renaming a vendor requires saving/uploading under its new filename. Hosted project files are readable by visitors to the site.

The native save-location picker requires a supporting browser and permission to write the chosen file. Standard download is the fallback. Neither button uploads to GitHub or automatically writes to your source folder without your choice.

## Connector category sheets and table saving

Settings → Connectors now has one sheet per category, like Cable Types, plus Uncategorised. Existing connectors without an assigned category are grouped from the Cable Types reference, matching names and aliases. Shared connectors appear in each relevant sheet as the same entry. Unmatched connectors appear in Uncategorised. Editing or deleting a shared entry affects that entry everywhere.

New rows inherit the selected category. Double-click the Category cell or press F2 to show available categories, including Uncategorised. Type to filter; click a choice or use arrow keys and Enter/Tab. You can still type a new category. Selecting a category moves the entry to that sheet; an explicit category overrides automatic grouping. Approved connectors inherit their cable category when all reviewed uses share one category; otherwise they start in Uncategorised. The download remains one complete `connector_types.json`, including every sheet. Category metadata stays in this generator reference file, never in Lampy cable-stock JSON.

Both Save table buttons perform the same action: accept a valid pending edit, save locally and clear that table’s edit highlights. The additional button sits directly below the rows, before help text, in every cable, Settings and loom-component table. Its horizontal alignment and dimensions match the top button. Saving locally does not publish files.

## Connector review

Missing connectors inherit recognised cable defaults first. Any required end still missing uses the cable name. Existing connector values stay unchanged. Unknown names show a yellow notification icon and count on **Errors**; names and aliases already in Connectors do not need repeat approval.

Open **Errors**, expand a connector warning and choose **Review connector**. Confirm or correct its name, then choose **Approve & add to Connectors**. Approval updates the listed cable ends and saves the connector in your local reference list. Cancel keeps it pending. Custom cables still use the **Connectors** form in their name cell; adaptor columns stay hidden for normal cables.

Use **Download connector list** on Errors (or the Connectors download in Settings), then upload the resulting `connector_types.json` to **`data/connector_types.json`** to publish the permanent list. Browser approval does not change GitHub files. Keep this reference download with your project backups: pending reviews are determined by which connector names are absent from the reference list. Lampy cable-stock JSON keeps its existing schema.

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
3. Add categories with **+**. Choose a name/alias from the dropdown or type a category. Recognised categories start with their associated cable types and connector defaults, with empty lengths. Custom categories start empty. The selected category wording remains in vendor data; adding an existing category does not replace its rows.
4. Ordinary cables hide direction and Start / male / End / female columns. When a category contains adaptors, those columns appear for adaptor rows; ordinary rows stay blank and read-only in those columns. Mark a row **Adaptor** to edit its direction and endpoints. Existing direction fields remain in Lampy JSON for compatibility. Add a row. Select a cell and type to replace its contents directly in that cell; double-click or press F2 to edit existing text. Press Enter to accept and move down, or Tab to accept and move right (Shift+Tab moves left). Escape cancels the pending cell edit. Invalid entries remain in the cell for correction. Selecting a cable reference on a new row prefills connectors. Adaptor endpoint overrides remain editable. Hidden connector and custom data remain in JSON and Excel exports.
5. Use **Edit lengths**. Type a positive number and press Enter for each chip. Paste separated lists. Backspace removes the last chip when the input is empty. **Copy Lengths** stores a set inside the app. **Apply / Paste Lengths** offers Replace, Merge or Cancel. No unit conversion occurs.
6. Open **Review & export**. Errors do not block JSON previews, copying or downloads. A downloaded file with errors is not labelled valid.

Selecting a different vendor looks for its saved project and asks before replacing existing work. Use **New vendor** for an empty document. Imports, category deletion and row deletion have review/confirmation. Undo/redo covers vendor, cable, loom and reference edits for the current session (up to 100 operations).

Plain cable-stock JSON import previews compare against your current draft by matching identical rows first, then matching a single remaining row with the same name in the same category. An unchanged file reports zero changes. Renames and ambiguous duplicate-name edits appear as additions/removals because stock JSON has no persistent row IDs. Project backups retain their existing ID-based comparison. Cancelling leaves your draft untouched; accepting a stock JSON import establishes a fresh baseline.

## Three output types

| Output | Purpose | Contents |
| --- | --- | --- |
| Lampy cable-stock JSON | File read by Lampy Paperwork | Exact source schema: `vendor`, `cables`, and retained imported custom fields. No editor IDs or preferences. |
| `*.lampy-project.json` | Reopen vendor work | Cable stock, composite looms, adaptor markers, generator vendor version, filename, row identities and imported baseline. **Not** a Lampy Paperwork input. |
| `.xlsx` | Spreadsheet editing and backup | Cable categories, adaptor markers, looms/components, vendor metadata, custom fields and stable row keys. |

The supplied cable-stock example has **no loom structure or version field**. V1 keeps newly authored looms and the generator vendor version in project/Excel backups. It warns before a Lampy download that excludes them. Imported runtime version fields and other custom fields stay untouched and can be edited under Custom metadata. The app does not claim Lampy Paperwork can consume composite looms. No unsupported runtime fields were invented.

Vendor versions such as `v2` and `v2.1` are independent of the app version. Major/minor buttons require confirmation. A category JSON preview/download is a labelled fragment, not a complete vendor file.

## Tables

All tables default to centred text and 150 px editable columns. The row-number gutter stays 42 px. Manually saved widths remain unchanged. The v1.1.8 layout migration still resets pre-v1.1.8 layouts once; your later choices persist. Table zoom and saved edit-highlight baselines are retained. Columns can still shrink to 1 px.

Empty tables show five editable entry rows. Small tables retain blank entry slots up to five rows. Untouched slots are presentation only: they do not add records, errors or exported rows. Entering data creates the required rows; entering a later slot also creates the preceding rows. Filters can show no matches, and sorting keeps unused slots at the end. **+ Row** still adds an actual record.

The formula bar has been removed. All typing takes place in the selected table cell. Tab/Shift+Tab and Enter accept the edit and move; Escape restores its prior value. Save, sorting and page actions commit valid pending entries first; invalid input stays editable. Length chips and the separate **Edit lengths** dialog remain available, as do checkboxes and colour pickers.

Every cable, Settings and loom-component table has a prominent **Save table** button at the far right. It commits the cell currently being edited and saves the workspace in this browser. A successful save clears that table’s yellow edit and green added-row highlights, including rows hidden by its search. Other tables keep their highlights. Later edits highlight again; the saved visual baseline survives reload. Cell selection remains visible. The original import baseline remains intact for export reviews. Invalid cell input prevents that save and displays a message. Save does not upload or rewrite the hosted files. Download project/Excel backups for vendor work and separate JSON files for Settings data.

- Arrows, Enter, Tab and Shift+Tab move between cells. Shift+arrows or Shift+click extends a range. Ctrl/⌘ A selects the table.
- Ctrl/⌘ C and Ctrl/⌘ V copy/paste rectangular Excel-compatible TSV. Quoted multiline cells are supported. Toolbar Copy/Paste uses clipboard permission when available.
- Drag the green selection corner to repeat values into a rectangle. Fill down repeats the first selected row. Invalid paste/fill operations apply no cells.
- Drag a header separator to resize. Focus the separator and use left/right arrows for keyboard resizing. Editable columns no longer have the 90 px minimum or expand to fill the table viewport. They can shrink to 1 px (the non-zero geometry guard) and expand again; narrow content is clipped or scrollable without changing its data. The row-number gutter stays 42 px. Chosen widths persist per table, including at different zoom levels.
- Click a heading to sort ascending/descending. **Clear sort** restores the default ascending order. Search filters displayed rows. Clear the search filter before extending the table with pasted rows; sorting can remain active.
- Zoom, widths, alignment and wrapping persist per table. Zoom changes the table only. Preferences never enter Lampy JSON.
- Yellow marks values changed from the imported baseline. Added rows have a green edge. Removed rows appear in review. Excel imports retain the original baseline; importing another stock JSON establishes a new one.

## Composite looms

Add **Stock / Pre-Made Looms** from the category selector. Set its name, optional description and available lengths. Add components with cable type, positive whole-number count, inherited connectors and optional connector/length overrides. Counts represent cables **inside one loom**, never the number of looms owned.

## Excel format

Use app-generated workbooks/templates. Import accepts `.xlsx`, not legacy `.xls`. Formula cells are rejected: paste values in Excel first. Parsing happens locally; no upload occurs. Imports larger than 25 MB are rejected.

Cable worksheet columns, in order:

`key`, `name`, `direction`, `start_connector`, `end_connector`, `lengths`, `connectors_json`, `custom_json`, `adaptor`

- `adaptor` is `yes` or `no` and stores generator-only editing behaviour. Older workbooks without this column still import. Direction remains in the workbook to preserve the source JSON even when hidden in ordinary cable tables.
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

## Cable type category sheets

Settings → **Cable Types** has a separate sheet for each category, including custom categories and **Uncategorised**. New and pasted rows inherit the active category. Editing Default category moves that row to its destination sheet. Search, selection, deletion and Save operate on the active sheet; downloading cable_types.json still includes every category.

All tables hide raw JSON columns, including cable custom fields, reference connector objects and loom connector overrides. The underlying data stays intact in backups and exports. Use Excel/project files when you need to edit those hidden structured fields. The Vendor tab no longer has a sample-loading shortcut; use Import for existing files.

## Vendor manifest and length colours

Settings notes and table hints have an **Ok** button. Acknowledgements are saved in this browser by note text, so unchanged notes stay hidden across visits and reloads; new or changed notes appear. If storage is unavailable, acknowledgement lasts for the current session. Vendor/unit context and validation errors remain visible.

Length colour cells show the vendor unit as a suffix, for example **12.5 ft** or **3.5 m**; the column heading also names the unit. In-cell editing and JSON downloads use the numeric length only. Changing units does not convert numbers or mix assignments between units/vendors.

Lighting Vendors automatically adds missing vendors to Vendor Manifest on startup and after edits. Existing catalogue paths remain untouched. New paths use `json/cable/<vendor_name>_cable.json`, with lowercase underscores and numbered suffixes for collisions. Removing or renaming a vendor does not delete its older manifest entry automatically. Review those entries manually. This creates lookup entries, not the referenced cable-stock files. Download `manifest.json` to retain the expanded catalogue; the supplied original stays unchanged.

Settings → **Length colour** shows only the vendor selected on the Vendor tab, in that vendor’s current unit (`m` or `ft`). Vendor and unit appear above the table; its columns are **Length / Colour 1 / Colour 2 / Colour 3**. Added and pasted rows inherit the selected vendor and unit. Switching vendor or unit hides other assignments without deleting them. The full dataset download retains every vendor. Different vendors and units can use different codes for the same number. Duplicate vendor/unit/length rows appear in Errors. Blank colour fields mean No Colour. Colour-filled table cells open a scrollable palette based on the supplied picker image. Choose with the mouse or arrow keys and Enter; Escape closes the palette. Typed names/aliases remain available through the selected-cell editor and paste.

Colours resolve exclusively through the unchanged `reference/colour_options.json`. Full names, unambiguous aliases and palette hex codes are accepted; ambiguous abbreviations such as `G`, `B` and `P` require a full name. Assignments store the palette's exact hex values. Matching length chips display three colour bands. A colour assignment never converts or changes cable lengths.

Download assignments as **length_colours.json** and place them in `data/length_colours.json`. This is a new generator dataset, not an invented Lampy cable-stock extension. Like other Settings references, it is separate from vendor project/Excel backups. Existing saved references are retained when upgrading from v1.0.1.

## References and exact destinations

| File | Role / destination |
| --- | --- |
| `reference/lighting_vendors.json` | Original simplified 15-vendor reference; replace here after a Settings download. |
| `reference/manifest.json` | Original authoritative lookup. Replace the generator copy here; apply to Lampy Paperwork only at your existing manifest location. |
| `reference/examples/christie_lites_cable.json` | Read-only original. Generated output belongs separately in Lampy Paperwork at `json/cable/christie_lites_cable.json`. |
| `reference/colour_options.json` | Supplied Lampy Paperwork palette; keep unchanged at this path. |
| `data/length_colours.json` | **New generator dataset** for vendor/unit/length colour assignments. Place Settings download here. |
| `data/categories.json` | **New generator seed dataset**. Place Settings download here. |
| `data/cable_types.json` | **New generator seed dataset**. Place Settings download here. |
| `data/connector_types.json` | **New generator seed dataset**. Place Settings download here. |
| `images/vendor/*` | 15 unchanged original logos. Preserve path and filename case. |

The original three seed dataset filenames were approved for generator use; length_colours.json is the new generator-only assignment dataset. They do not claim pre-existing Lampy production paths. The supplied manifest has one Christie entry, preserved in full. Its location in the separate Lampy Paperwork deployment was not inspected or guessed.

Settings downloads use the exact basename without timestamps. Your browser may add a duplicate-download suffix; restore the canonical name before manually replacing a reference. Browsers cannot overwrite project files themselves.

## Draft safety

Drafts and references autosave in localStorage for the current browser origin. Clearing browser data, changing host/port, private browsing or storage limits can remove/prevent drafts. Keep downloaded backups. Reference edits need separate JSON downloads: project backups contain vendor work, not all Settings datasets.

The app warns on leaving with unexported edits where permitted. Storage failures appear in the header. If another tab changes the draft, autosave pauses; download the current in-memory project before reloading. Damaged saved drafts are not silently overwritten. No analytics, server storage or runtime CDN requests are used.

## Tests and compatibility

Run `node --test tests/*.test.mjs` with Node 22+ recommended. Tests use generated internal fixtures, never modify original sources, and need no package installation. `package.json` supplies optional npm shortcuts; npm is not needed for the app.

Target current Chromium, Firefox and Safari with import maps, ES modules, native dialog and popover, structuredClone, localStorage and CSS zoom. Browser tests used Codex Chromium. Older browsers, mobile drag gestures and native Excel/LibreOffice behaviour are not certified. Clipboard buttons depend on permission; keyboard copy/paste is the fallback.

Tool Tracker Inventory Table View and footer were inspected read-only. No changes were made to that reference site. The user authorised the initial GitHub upload separately and configured GitHub Pages. The deployed v1.0.0 was subsequently tested. The v1.0.1 fix was uploaded by the user and verified live. The v1.1.0 features and v1.1.1 refinements were tested locally with fresh browser-test approval; local checks do not verify their deployment. Future browser testing requires fresh approval, per `BUILD_BRIEF.md`.

Bundled library: SheetJS CE 0.20.3 from its official CDN, with Apache 2.0 licence in `vendor/SHEETJS-LICENSE.txt`. Documentation: https://docs.sheetjs.com/docs/getting-started/installation/standalone/.

## Upload inventory

Upload the root HTML/docs/package files and `.nojekyll`, plus `css/`, `js/`, `data/`, `reference/`, `images/vendor/`, `vendor/` and `tests/`, retaining every filename and subfolder. The chat handover provides the complete file tree. Exclude Finder `.DS_Store` files and locally downloaded test outputs. No V2 modules or placeholders are included.

For v1.1.8, upload `js/app.js`, `js/grid.js`, `css/app.css`, `js/version.js`, new `tests/tables.test.mjs`, `README.md`, `UPDATES.md` and `CHANGELOG.md`. If v1.1.7 has not been uploaded, also include its `index.html`, `js/updates.js` and `tests/loading.test.mjs` to retain the cache fix. No files were deleted. Every future app update must increase the unique version in `js/version.js`, update the changelog and explicitly include `js/version.js` in the upload list.


## App updates (v1.1.5)

The app checks its own `js/version.js` on startup, every five minutes while visible, and when you return to the tab (checks are throttled to once per 30 seconds). Newer releases show a persistent banner with **Save & refresh**. Offline/failed checks do not interrupt editing. The version file is read as text, with an uncached request; no remote JavaScript is executed by the checker.

Save & refresh accepts one pending valid table edit, saves the complete project and reference edits locally, verifies both stored values and reloads. Your imported baseline, looms, custom fields and unexported status remain intact. It refuses to reload with invalid cells, unfinished form fields, an open dialog/import, multiple pending loom-table entries, a storage error or a detected conflicting tab. Finish those entries or resolve the conflict first. The button never refreshes automatically.

After refresh, the Vendor page opens; undo/redo history, table selection, temporary filters and the internal Copy Lengths buffer reset. Saved stock/reference data and persisted table preferences remain. Drafts are specific to this browser and origin: switching between GitHub Pages and ailampy.com does not transfer them. Local storage is not a separate backup.

The v1.1.5 release included: `index.html`, `css/app.css`, `js/app.js`, `js/grid.js`, `js/version.js`, new `js/updates.js`, `package.json`, new `tests/updates.test.mjs`, `README.md`, `UPDATES.md`, `CHANGELOG.md`. Keep the version declaration format unchanged. Existing v1.1.4 tabs need one manual refresh to install the notification feature. Future releases must increment `js/version.js`. The website proxy needs no redeployment for ordinary app releases. Publishing/caching can delay when a release becomes visible.

Live verification on 2026-10-14 used a browser-only simulated v1.1.6 version response to trigger the banner. Save & refresh preserved an uncommitted table entry and kept ailampy.com/cable/ in the address bar. Removing the simulation restored the real v1.1.5 check and hid the banner. The test value was restored; no browser console errors were reported and no deployed files were changed.

The local v1.1.6 update passed 80 automated tests and approved Chromium checks for pointer/keyboard resizing below 90 px, narrowing to 1 px and expanding again, zoom and width persistence across table switches. Firefox/Safari and deployment of v1.1.6 have not been tested.


## Reliable release loading (v1.1.7)

A normal refresh could previously find a newer version for the banner but reuse cached app modules. The page now reads fresh version metadata before startup, then loads all app modules, CSS and the Excel library using that release in their URLs. An import map also versions relative module dependencies. `js/version.js` remains the sole version setting; you do not edit version numbers in HTML.

**Save & refresh** still commits and verifies your local draft/reference changes first. It then requests a fresh document, loads the published release and removes its temporary cache query from the address bar. It does not clear browser storage. If the version response is malformed, unavailable or inconsistent with its loaded module, startup offers Retry loading instead of silently displaying an old release. Already open sessions can keep editing when update checks fail; a new page load needs network access to check the release.

After uploading v1.1.7, an old cached page may need one hard refresh (Ctrl+Shift+R on Windows/Linux or Cmd+Shift+R on macOS Chromium), or open `https://ailampy.com/cable/?_lampy_update=install117` once to request the updated HTML. Commit pending edits and save a project backup first; keep separate reference downloads for Settings changes. Do not clear site data: it contains your drafts. No AI Lampy Website deployment is needed for this app fix.

Validation: 87 automated tests passed. Approved local Chromium testing first cached an old v1.1.5 module, then loaded v1.1.7 and advanced to a simulated published v1.1.8 through Save & refresh. The footer actually changed, the notification disappeared, the clean /cable/ URL returned, and an uncommitted reference cell survived. Server requests confirmed all six app modules and CSS used the new release URLs. This closes a gap in the earlier v1.1.5 live test, which proved notification and draft recovery but only simulated metadata, not a real module-version change. Firefox/Safari and deployment of v1.1.7 have not been tested.


## v1.1.8 validation

98 automated tests passed, including default migration, virtual entry rows, atomic validation, acknowledgement persistence, sorting and numeric suffix formatting. Approved local Chromium tests covered centred 90 px defaults, five entry rows in cable/Settings/loom tables, direct text/numeric/length/colour entry, Tab/Enter/Escape, table rebuilds, invalid-entry retention, Save and sorting during edits, note acknowledgement across tabs/reopening, unit switching and empty-reference export. No browser console errors were reported in the checked flows. Firefox/Safari and deployment of v1.1.8 have not been tested.

## Custom metadata fields — v1.1.9

Open **Custom metadata** on the Vendor page. Enter text and numbers in labelled fields and select Yes/No for switches. Use **+ Add field** to choose a field name and value type. Groups contain fields; lists contain items. **Remove** asks for confirmation. No JSON code is needed.

Imported field names, types and nested values stay intact in exports. Existing value types remain fixed; remove and recreate a field to change its type. Empty values offer **Enter text**. Standard vendor name and length unit remain in their dedicated controls.

Upload `js/app.js`, `css/app.css`, `js/version.js`, `README.md`, `UPDATES.md`, `CHANGELOG.md` and new `tests/metadata.test.mjs` to the same paths. Include earlier release files if you have not uploaded them yet. No files deleted.

Validation: 101 automated tests passed. Approved local Chromium checks verified field creation, text/numeric/Yes-No editing, export types and values after reopening. No console errors in checked flows. Firefox/Safari and deployment were not tested for this release.

## v1.1.10 upload

Upload `js/grid.js`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md` and `CHANGELOG.md` to the same paths. Include earlier unpublished release files if needed. No new or deleted files. 101 automated tests passed; browser testing and deployment were not performed for this update.

## Enter and typed colours — v1.1.11

Press **Enter** on the last visible table row to show another blank row and move into the same column. A valid pending edit is accepted first; invalid input stays in the editor. **Shift+Enter** moves up without adding a row. Unused blank entry rows are temporary and are not exported; typing into a later slot creates preceding required rows.

In Length colour, type a supplied colour name or alias directly in the selected cell, or start typing while its picker is open. Suggestions include palette names and aliases. **Enter** accepts and moves down; **Tab** accepts and moves right. The picker remains available. Green cell accent stripes are removed; selection outlines and yellow change highlighting remain.

Upload `js/grid.js`, `js/app.js`, `css/app.css`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md` and `CHANGELOG.md`. No new/deleted files. 106 automated tests and approved local Chromium checks passed. Firefox/Safari and deployment were not tested.

## Filtered palette selection — v1.1.12

Type in a Length colour cell to see matching colours from the supplied palette. Matching includes names and aliases. Click a colour, or use Up/Down then Enter/Tab to select it. Escape cancels. Unrecognised text shows **No matching colours** and cannot be saved. Pasted values must also belong to the palette; a rectangular paste containing an unknown colour is rejected without partially changing cells. No external colour data is added.

Upload `js/app.js`, `js/grid.js`, `js/model.js`, `js/version.js`, `css/app.css`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md` and `CHANGELOG.md`. No new/deleted files. 108 automated tests and approved local Chromium checks passed. Firefox/Safari and deployment were not tested for this release.

## Default sorting — v1.1.13

Tables open sorted A–Z by Name, ignoring case and ordering embedded numbers naturally. Vendor Manifest uses vendor name; loom components use cable type. Length colour has no Name column and sorts numerically by Length. Blank rows stay last. Header sorting and **Clear sort** remain available; export/source order is unchanged. Clear the search filter before pasting more rows than are currently visible. Sorting can remain active.

Upload `js/grid.js`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md` and `CHANGELOG.md`. No new/deleted files. 111 automated tests passed. Browser testing and deployment were not performed for this update.

## Clear sort — v1.1.14

**Clear sort** restores Name A–Z (vendor name for Manifest, cable type for loom components, numeric Length for Length colour). It does not remove the default sorting or clear your search. Invalid pending edits must be corrected first. Pasting additional rows now works with sorting active.

Upload `js/grid.js`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md` and `CHANGELOG.md`. No new/deleted files. 114 automated tests passed. Browser testing and deployment were not performed for this update.

## Vendor version entry — v1.1.15

Enter **2** or **2.1** in Vendor version, then Tab or click outside the field. The app displays and saves **v2** or **v2.1** automatically. Entering an existing v prefix also works. Clear the field to leave the vendor version unset. Invalid formats retain the existing validation warning. This generator vendor version remains separate from the app version and imported custom version fields.

Upload `js/app.js`, `js/model.js`, `js/version.js`, `tests/core.test.mjs`, `README.md`, `UPDATES.md` and `CHANGELOG.md`. No new/deleted files. 116 automated tests passed; browser testing and deployment were not performed for this update.

## Table widths and length display — v1.1.16

**Reset widths** restores the current table's editable columns to 150 px. Other tables keep their chosen widths. Zoom, alignment, sorting and highlighting remain unchanged.

Length chips display from lowest to highest, including decimal lengths. This changes the display only; imported/source array order stays intact. Length chips now use the full resized column width, with scrolling when needed, rather than stopping at 450 px. The length-entry dialog remains unchanged.

Upload `js/grid.js`, `css/app.css`, `js/version.js`, `tests/tables.test.mjs`, `README.md`, `UPDATES.md` and `CHANGELOG.md`. No new/deleted files. 119 automated tests and approved local Chromium checks passed. Firefox/Safari and deployment were not tested for this release.

## Cable connectors — v1.1.17

Recognised cable names and aliases inherit missing connectors from Cable Types. Existing populated overrides stay intact. Opening a category also fills missing defaults in its recognised rows and saves those repairs as draft changes.

Custom cables and unresolved connector data show **Direction**, **Start / male** and **End / female** columns. Enter connector names normally; you do not need to tick Adaptor or write JSON. Bidirectional cables use the same end connector at both ends. Complete recognised cables keep these columns hidden unless another row needs them. Existing incompatible/malformed data needs manual correction; it is not silently replaced.

Upload `js/app.js`, `js/model.js`, `js/version.js`, `tests/core.test.mjs`, `README.md`, `UPDATES.md` and `CHANGELOG.md`. No new/deleted files. 123 automated tests and approved local Chromium checks passed. Firefox/Safari and deployment were not tested for this release.

## Connector form and hidden columns — v1.1.18

Direction and connector columns appear only for adaptors. A custom/incomplete cable now has a **Connectors** button inside its name cell. Use that form to choose direction and enter connector names, then **Save connectors**. **Cancel** leaves the row unchanged. Connector errors for non-adaptors open the form. Recognised cables still inherit missing defaults.

This replaces v1.1.17's behaviour of showing connector columns for the whole table when a custom row was present.

Upload `js/app.js`, `js/grid.js`, `js/version.js`, `tests/core.test.mjs`, `README.md`, `UPDATES.md` and `CHANGELOG.md`. No new/deleted files. 123 automated tests and approved local Chromium checks passed. v1.1.18 is not deployed; the verified live release is v1.1.17. Firefox/Safari were not tested.
