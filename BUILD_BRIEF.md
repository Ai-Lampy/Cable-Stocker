# Lampy Cable Stock JSON Generator — V1 Development & Handover Brief

**Status:** V1 requirements frozen for first implementation.  
**Purpose:** Hand directly to the builder/Codex.  
**Priority:** Existing working Lampy cable-stock JSON schemas and canonical filenames override illustrative examples in this document.

## 1. Objective and scope

Build a static, GitHub Pages-compatible browser application to create, import, edit, validate and export lighting-vendor cable-stock JSON without repetitive manual editing. It must work from the same relative folder structure locally and on GitHub Pages, with no backend or database. Prefer HTML, CSS and vanilla JavaScript; use a small client-side spreadsheet library only if needed for reliable `.xlsx` support.

**V1 is cable stock only.** Do not implement, scaffold or create placeholder files for future rigging, fixture or inventory modules.

## 2. Authoritative sources and first-build discovery

Before implementing JSON mappings, inspect actual working Lampy cable-stock JSON examples and the canonical reference filenames. The supplied `reference/lighting_vendors.json` is a *generator-specific simplified copy* of the uploaded vendor list; it retains 15 names and original logo filenames but changes paths to `images/vendor/`. Do not modify the original Lampy Paperwork vendor file.

The existing `manifest.json` schema is authoritative:
```json
{
  "catalogues": [
    {"vendor": "Christie Lites UK", "file": "json/cable/christie_lites_cable.json"}
  ]
}
```
The manifest is **only** a Lampy Paperwork runtime lookup: `catalogues[]` entries have exactly `vendor` and `file`. No IDs, versions or editing metadata. Preserve actual existing entries and paths when a real manifest is supplied; the above is a schema example, not a complete production manifest.

The builder must request missing authoritative cable-stock examples and the actual manifest during the initial clarification window, if not already present. **Do not fabricate a production-compatible schema or filenames.** If sources remain unavailable, implement isolated adapters and clearly mark any unverified mappings; do not claim compatibility is proven.

## 3. UI shell, vendor and navigation

Use a vendor-first interface with tabs: `Vendor | Data | Mains | Multi | TRS | Stock / Pre-Made Looms | +` (only show categories actually selected; list is illustrative). `+` searches or creates a category. Settings and Errors are accessible from a persistent header.

Vendor tab:
- Searchable vendor selector from `lighting_vendors.json`, with ability to add vendors.
- Vendor metadata required by the actual cable-stock schema, including existing version information and any custom fields.
- Metric or imperial **once per vendor**; lengths are numeric and UI shows m or ft. Never silently convert numbers when changing units.
- Import existing vendor JSON; autosave drafts locally; warn before destructive changes.
- Display selected vendor logo at top of category navigation, preserving aspect ratio, with vendor-name fallback. Source logo path directly from the vendor record; images live under `images/vendor/`.
- Footer on every page, displaying application version from one authoritative application version setting. Style primarily after the **Tool Tracker footer**, secondarily Lampy Paperwork and AI.Lampy; do not invent exact styles without inspecting references.

Keep **application version** independent of each **vendor JSON version**.

## 4. Categories, cable types and aliases

Category, cable type and connector reference entries have a default/canonical name and multiple searchable aliases. Prefer stable internal reference IDs for rename-safe editing **where compatible with existing reference schemas**; IDs must not leak into production stock JSON or manifest unless supported by the authoritative schema.

Selecting an alias must preserve the deliberately selected wording in vendor data/output when the schema supports it. Never silently normalise vendor terminology. Categories are extensible and not hard-coded restrictions.

Cable rows support name/type, category, start connector, end connector, direction when relevant, lengths and all authoritative schema-specific fields. Connector selectors search canonical names and aliases, accept new values and offer to add them to the connector reference. Cable type defaults can prefill connectors; individual vendor entries can override them.

Suggested categories: Data, Multi, Mains, TRS, Stock / Pre-Made Looms. Seed cable types/connectors from actual existing Lampy data, including relevant DMX 3/5-pin, Ethernet/EtherCON, Socapex, mains and TRUE1 concepts **only where supported by sources**.

## 5. Fast length entry and reuse

Every length editor, including pre-made looms:
- Type number → Enter → visible bubble/chip; repeat without typing separators.
- Support positive integers/decimals, removal/backspace, duplicate detection and paste of separated lists.
- Show active vendor unit next to control.
- `Copy Lengths` and `Apply/Paste Lengths` between entries; when target has values, choose Replace, Merge or Cancel. Merge deduplicates.
- Keep original imported lengths as baseline for change tracking.

Track **available lengths only**, not how many cables/looms the vendor owns.

## 6. Stock / Pre-Made Looms

A pre-made loom is **one packaged composite stock item**, distinct from individual cable rows. Editor supports loom name, available lengths, optional description and a structured component table with cable type, component count, inherited connectors and optional overrides. Example: one 30 m loom with 4 × Socapex 19-pin, 2 × DMX 5-pin, 2 × EtherCON.

Component counts describe *what is inside one loom*; do not track stock quantity of looms. Optional per-component lengths may be supported when needed without cluttering the normal editor. Preserve loom structure through JSON and Excel round trips; if existing Lampy stock schema lacks loom support, raise that compatibility gap during initial clarification and do not silently invent runtime fields.

## 7. Spreadsheet-style table editing

**Exact UI reference:** [Tool Tracker → Inventory → Table View](https://ailampy.com/tracker/inventory). This private Codex-built site may require sign-in; it is **not a GitHub repository**. Inspect it during the first 10-minute clarification window if access is available. Do not change the live site, bypass authentication or assume access to other Codex chats. If inaccessible, implement the specified features independently and report the limitation.

Apply to cable-category tables and Settings tables:
- Keyboard cell navigation (arrows, Enter, Tab, Shift+Tab).
- Single/range selection, copy/paste with Excel, rectangular multi-cell paste.
- Drag-to-fill/copy, column resizing, text alignment/wrapping, useful display formatting.
- Full available page width, horizontal scrolling, in-table zoom in/out/reset (not browser zoom).
- Undo/redo, sorting/filtering, persisted widths and zoom preferences.
- Highlight changes to imported baseline **yellow**; preserve chip-based length input.
- Validate pasted/filled data; do not silently corrupt or discard values.
- Formatting/zoom are UI preferences, **not extra Lampy JSON fields**.

## 8. Import, change tracking and review

Import existing vendor JSON and rebuild vendor tab, categories, cable rows, lengths, looms, version and custom metadata. Accept unknown valid categories and preserve unknown JSON fields through editing/export wherever possible.

Keep a deep snapshot of imported data. Highlight modified cells yellow, and identify added/removed rows. Before applying an Excel import show additions, modifications and removals with Merge/Replace/Cancel. Before JSON or Excel export show a concise grouped-by-category review of changes and issues, e.g. `3 changes · 1 error · 2 warnings`.

Persistent header Errors control with red numbered badge. Hover/focus shows five most recent issues with proposed fixes; click opens Errors page grouped by category, with expandable details, suggestions and jump-to-field links. Distinguish warnings/errors. **Validation never blocks preview, copying, downloading or export.** Clearly warn and allow export anyway. For partially invalid inputs, do not falsely label the result valid.

## 9. JSON previews and output

Every category offers formatted JSON preview, copy and download as appropriate. A category preview is not a standalone complete vendor document.

Build complete vendor JSON from metadata, categories, cables, connectors, lengths, looms and supported custom fields. Validate, show final review and download. Re-parse generated JSON and verify it can be reopened. Support vendor-file major/minor versions (e.g. v2, v2.1), with user-controlled increment and no silent overwrite. Preserve exact required vendor output filenames once confirmed against the actual Lampy repository.

## 10. Excel import/export

Provide:
- Download individual category `.xlsx`.
- Download complete vendor `.xlsx` with one worksheet per category.
- Import a single-category `.xlsx` or multi-sheet workbook; sheet names map to categories.
- Download blank workbook/template using the same column layout.
- Standard, documented columns; store multiple lengths as numeric comma-separated values in a cell for Excel interoperability.
- For looms, use a separate structured components sheet/table with a stable loom key and component count, so composite data survives.
- Include vendor unit, vendor version and any required metadata in a dedicated metadata sheet for full-workbook round trips; do not mistake that sheet for a category.
- Resolve Excel sheet-name constraints (31 characters and forbidden characters) using a mapping sheet; preserve full category names.
- Import review before changes, validation through Errors, yellow change highlighting.

Excel is a secondary editing/backup format; Lampy-compatible JSON remains the authoritative deployment output. Test JSON→app→JSON and app→Excel→app round trips including aliases, connectors, custom fields, lengths and looms. If a field cannot be represented losslessly in Excel, flag it and preserve it using an explicit metadata mechanism rather than silently discard it.

## 11. Settings and reference datasets

Settings tabs:
1. Categories
2. Cable Types
3. Connectors
4. Lighting Vendors
5. Vendor Manifest

Editable spreadsheet-style tables with search, add/edit/delete, multi-row paste, duplicate detection, undo and downloads.

Maintain **separate reference JSONs**, not one combined configuration. Load reference data on startup from relative paths; local Settings edits immediately affect current session, and export exact canonical filenames with no suffix, timestamp or case change. A browser/OS may independently rename conflicting local downloads.

Lighting Vendors reference is intentionally simplified to `{ "vendors": [{ "name": "...", "logo": "images/vendor/existing.png" }] }`; do not include address/phone fields in generator copy. The 15 provided records are seed data. Preserve original logo filename case. Use `images/vendor/`.

Vendor Manifest editor is exactly a two-column `vendor`/`file` editor for `catalogues[]`, with add/edit/delete, duplicate vendor/path checks and relative-path validation; export **`manifest.json`** exactly. No IDs, versions or extra manifest fields. Do not invent entries when original manifest has not been supplied.

Reference filename examples such as `categories.json`, `cable_types.json`, `connector_types.json` are **provisional** until confirmed from Lampy; keep existing canonical names wherever they exist.

## 12. Autosave and data safety

Local browser storage autosaves drafts; it is not authoritative reference hosting. Warn before vendor switching, importing over drafts, resetting or navigating away with unexported edits where practical. Protect data from accidental loss. Support basic undo in Settings and tables. Preserve unknown import fields. Never silently convert length units, replace data or discard alias choices.

## 13. First-build deliverables and GitHub handover

Provide the **complete finished first-pass files** ready for manual GitHub upload, plus a complete folder tree in chat, placement instructions and tests run. Show new, changed and deleted files. Use relative paths so the same layout works on GitHub Pages and local backup. Any existing Lampy filename/path change requires explanation and prior user approval.

Suggested generator-only structure (verify authoritative paths before build):
```text
/
├── index.html
├── css/
│   └── app.css
├── js/
│   └── app.js
├── data/
│   ├── lighting_vendors.json
│   ├── categories.json          # provisional
│   ├── cable_types.json         # provisional
│   └── connector_types.json     # provisional
├── images/
│   └── vendor/
├── README.md
├── UPDATES.md
└── CHANGELOG.md
```
`manifest.json` belongs at its **actual existing Lampy path**, which must be verified, not guessed from this example. Vendor cable-stock JSON files are portable and need not be hosted inside the generator. Do not confuse the generator's folder tree with Lampy Paperwork's existing repository tree.

Builder must create `UPDATES.md` at root with Pending, Completed, Notes and Future sections, ready for user edits. Builder must maintain root `CHANGELOG.md` for actual releases.

## 14. Permanent builder rules

### Communication and autonomy
- First **10 minutes** after work begins: ask all critical clarification/access questions, preferably grouped.
- Afterwards: no routine questions or progress interruptions; make safe decisions using this brief and document assumptions. Escalate only a genuine blocker or required permission; do not bypass it.
- Return on completion with the deliverables and a concise chat summary, not a separately opened completion report.
- Do not assume access to another Codex chat/project or private Tool Tracker implementation.

### GitHub
- **Never** create a repo, upload, commit, push, modify or deploy to GitHub. User performs all GitHub actions.
- Do not inspect/check the user's GitHub repository until user explicitly provides repository name/URL **and requests inspection**.
- Read-only inspection permission does not imply write/deploy permission.
- Local test success is not proof that GitHub deployment succeeded.

### Testing permissions
- **Initial V1 build:** Full local testing, including browser/UI testing, is authorised without additional approval.
- **Every subsequent update/fix/release:** Browser testing requires explicit fresh user approval **each time**. Run non-browser validation/regression checks automatically; report untested browser behaviour.
- Initial testing permission does not authorise live-site modification or deployment.
- Check syntax, file paths, JSON validity, import/export, Excel round trips, regression behaviour, and GitHub Pages static-site compatibility. Do not claim unperformed checks passed.

### Versioning and change history
- Every completed app change increments a unique app version using major.minor.patch: `v1.0.0`, `v1.1.0`, `v1.1.1`.
- Maintain one source of truth for current app version; display it in footer.
- Root `CHANGELOG.md` records version, date, changes, fixes, files added/removed and known issues.
- Vendor JSON versioning is independent of app versioning.
- Preserve recoverability via versioned changelog and user-managed Git history; never reuse a released version.

### Ongoing maintenance
- Read root `UPDATES.md` before requested changes; implement applicable Pending items and mark outcomes clearly.
- After every update, remove superseded files/code/references only after verifying they are unused elsewhere.
- Regression-check existing working functionality. Avoid unnecessary restructuring.
- Report directly **in chat** under:
  - Previous Version → New Version
  - Changes Made
  - Files to Upload
  - New Files Created
  - Files Deleted
  - Tests Passed / Not Run / Known Issues
  - CHANGELOG entry
- Do not open a separate completion document.

## 15. V1 acceptance criteria

V1 passes when the builder can demonstrate:
1. Create a new vendor, edit category stock rapidly and export authoritative-schema-compatible JSON.
2. Import an existing vendor JSON, preserve unknown fields, edit and re-export.
3. Search canonical names/aliases; preserve chosen aliases and vendor connector overrides.
4. Enter lengths with Enter-to-chip, copy/merge/replace sets, detect duplicates.
5. Define a structured composite loom with component counts but no vendor inventory quantities.
6. Edit tables using keyboard, drag-to-fill, paste, resize and zoom.
7. Import/export single-sheet and multi-sheet Excel with lossless round trips for supported data.
8. Review yellow-highlighted changes and grouped warnings/errors; export remains possible.
9. Maintain reference datasets and two-column manifest with exact canonical filenames.
10. Show selected vendor logo and application version footer.
11. Deliver full folder structure, ready-to-upload files, test report and changelog.
12. Make **no** GitHub changes.

If authoritative schema examples or private reference UI access remain unavailable, distinguish implemented features from **unverified compatibility** in the handover.

## 16. V2 — FUTURE CONSIDERATIONS ONLY: DO NOT IMPLEMENT

Potential independent inventory types: Rigging (possibly truss, motors, hardware), Fixtures and others. Each would use its **own JSON schema, files, validation, previews and export**. A future collapsible left navigation could list stock types and collapse to icons, with shared shell/vendor/settings where appropriate.

**No V2 code, placeholders, scaffolding, directories or UI controls in V1.** Decide V2 details only after V1 has been built, published, used and refined.

## 17. User-supplied handover inputs and first-build reference rules

The project handover folder will include **one** known-working, unmodified vendor cable-stock JSON under `reference/examples/`. One example is sufficient to begin. Do not demand a second real vendor file or fabricate production examples. Use generated test fixtures only for internal testing and label them as test data.

The user will also supply the actual `reference/manifest.json` and any existing category, cable-type and connector reference JSONs. If the latter three do not yet exist, generate them from the working stock example and documented requirements, then clearly identify them as newly created files. Confirm canonical filenames before treating them as production paths.

All existing vendor logo images will be placed by the user under `images/vendor/`. Verify each referenced image filename **including case**, keep the files unmodified and report any missing logos. Do not fetch, replace or rename logo assets without permission.

Treat the working vendor JSON and manifest as read-only authoritative source examples. Preserve originals. Use their actual schemas rather than inventing production fields. The first-build handover must show where user-provided reference inputs belong and distinguish source examples from app runtime data.

The builder must read `PROJECT_SETUP_INSTRUCTIONS.txt` alongside this brief during initial project review. That text file is guidance for the user and contains a copy-ready initial builder prompt; this brief remains the detailed source of requirements.
