# Project rules

## Post-work cleanup

After a task, plan or goal is completed, remove temporary, obsolete and non-essential files from the project folder. Perform this cleanup after the work to maintain a clean and structured working environment.

- Remove disposable previews, scratch files, logs, caches, intermediate exports, duplicate outputs and obsolete build artifacts when they are no longer needed.
- Keep required source, documentation, tests and finished deliverables in their appropriate folders.
- Preserve required configuration, dependencies, user-provided files, inventory data, backups and finished deliverables. Do not treat a file as disposable merely because it is ignored by Git or stored in a temporary folder.
- Check references and running processes before deleting files. Verify that cleanup has not broken the project or removed required data.
- If a file's purpose is uncertain, establish whether it is required before removing it.

### GitHub
- Do not create a repository, upload, commit, push, modify or deploy to GitHub unless the user explicitly instructs it. When the user says to upload or deploy, carry out that authorised action without asking for the same permission again. An earlier release approval does not authorise future releases.
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

### Documentation responsibilities
- `README.md` must contain current setup, usage and upload instructions only.
- Keep release notes and test history in `CHANGELOG.md`.
- Keep pending work in `UPDATES.md`.

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
