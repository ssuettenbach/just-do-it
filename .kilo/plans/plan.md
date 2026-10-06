# Offline Random Task PWA Plan

## Goal

Build a mobile-first, installable Android PWA for a personal task list. Its dashboard makes starting work one tap: randomly select a quick, any, or big open task. Data stays on the device after closing the app and can be manually backed up.

## Confirmed design

- **Stack:** React, TypeScript, Vite, Dexie/IndexedDB, `vite-plugin-pwa`, GitHub Pages, and GitHub Actions.
- **Android delivery:** Open the GitHub Pages HTTPS URL in Android Chrome and choose **Install app**. The installed PWA launches standalone and works offline after its first load.
- **Data:** Local IndexedDB only. No account, backend, analytics, synchronization, or remote storage.
- **Backup:** Versioned JSON export; validate imports before offering explicit **Replace all data** or **Merge import** actions.
- **Task data:** required title; optional whole-minute estimate; optional date-only due date; optional notes; zero or more labels; created, updated, and completed timestamps; open/completed status.
- **Due dates:** Informational only. Management displays due-today and overdue states. Date never biases random selection. No deadlines with a time or notifications.
- **Task lifecycle:** Open tasks support edit, complete, and delete. Completed tasks remain in History, can be reopened, and can be permanently deleted.
- **Dashboard:** Exactly three large action buttons with no filters: Quick (estimated <=5 minutes), Any (all open tasks, including unestimated), Big (estimated >=30 minutes). A no-match button is disabled with explanatory copy; no tasks shows an All done state.
- **Random result:** Select uniformly among eligible open tasks. Show title, estimate, date/status, labels, and notes with Complete, Pick another, and View/edit actions.
- **Management:** Open Tasks and History tabs. Optional management filters include text, label, duration, due status, and completion date where relevant. Labels do not affect dashboard picking.
- **Add task:** A global floating Add Task button is always visible, including on the dashboard and history. Empty open-task states include an Add Task shortcut.

## Implementation tasks

1. **Bootstrap and deploy**
    - Initialize the Vite React TypeScript app.
    - Add Dexie and PWA configuration; create web manifest, service worker, offline cache, standalone display settings, theme colors, and icons.
    - Configure Vite's GitHub Pages base path for `https://<github-user>.github.io/<repository>/`.
    - Add a GitHub Actions workflow to build and deploy `dist` when `main` is updated.
    - Ensure no task data is transmitted or included in cached application assets.

2. **Implement persistence and domain operations**
    - Create a versioned Dexie `tasks` table. Index status, due date, completed date, estimated duration, and labels as needed for list views.
    - Generate UUIDs and store `dueDate` as `YYYY-MM-DD` so local-device calendar day comparisons are reliable.
    - Provide repository/service functions for create, update, filtered lists, complete, reopen, delete, and eligible random selection.
    - Normalize labels by trimming, removing blanks, and case-insensitive deduplication. Derive known labels from task records instead of a separate label table.

3. **Create the mobile app shell**
    - Implement Dashboard, Management, and task create/edit/detail views.
    - Provide compact Dashboard/Manage navigation and place a 44px-or-larger floating Add Task control above it.
    - Use semantic controls, accessible labels, visible focus styling, adequate contrast, and a narrow-screen-first responsive layout.
    - Confirm permanent task deletion and replacement imports before writing data.

4. **Build the dashboard picker**
    - Compute Quick candidates from estimated durations 0–5 minutes, Any from every open task, and Big from estimates >=30 minutes. Unestimated tasks are Any-only.
    - Render no more than the three agreed large buttons. Disable each no-match choice and show a specific message. If all tasks are complete, retain Add Task and show All done.
    - Use `crypto.getRandomValues`-backed random indexing to choose one candidate uniformly. Do not apply due-date, label, or other priority weighting.
    - Display the picked task. Complete saves `completedAt` and returns to Dashboard; Pick another applies the same selected category; View/edit opens the edit form without changing status.

5. **Build task creation and management**
    - Make a form with title validation, whole-minute numeric estimate, browser-native date-only input, notes, and multi-label entry/removal.
    - Make Management default to Open Tasks, with History as the second tab.
    - Open Tasks: text, label, duration, and due-status filters; clear due-today/overdue indicators; edit, complete, and delete actions.
    - History: newest-completed-first ordering; text, label, and completion-date filters; original task details; reopen and delete actions.
    - Distinguish empty records from filters with no match. Offer Clear filters and the Add Task shortcut where appropriate.

6. **Add backup and recovery**
    - Expose Settings from Management for export/import and an explanation of local-only data.
    - Export a JSON document containing backup schema version, export time, and all task records.
    - Fully validate the import before writes: document shape/version, IDs, status, date strings, timestamps, estimates, and labels.
    - Replace atomically clears/replaces records only after confirmation. Merge adds absent IDs, retains existing task records, and reports imported/skipped totals.
    - Handle malformed files, unsupported backup versions, and storage failures with clear user-facing errors. Explain that browser/site data clearing, reset/uninstall, and device loss remove IndexedDB unless backed up.

7. **Validate and release**
    - Unit test eligibility thresholds, candidate construction, due-date status, label normalization, lifecycle transitions, and backup validation/merge/replace behavior.
    - Component test disabled dashboard states, result actions, form validation, empty-state Add Task shortcut, and destructive confirmations.
    - Manually test Android Chrome installation, standalone startup, offline relaunch, force-close persistence, JSON backup/restore, and GitHub Pages subpath deployment.
    - Create/push the repository, enable GitHub Actions-powered Pages, visit the HTTPS URL from Android Chrome, then install it. A public repository exposes source code only; task data remains in the device's IndexedDB.

## Boundaries and acceptance criteria

- Version one excludes accounts, remote storage, collaboration, cloud backup, notifications, due-time, recurrence, priority, projects, and analytics.
- IndexedDB survives normal app closure but not cleared site data, browser reset/uninstall, or device loss. JSON export is the recovery path.
- Dashboard selection never silently relaxes a duration rule; unavailable categories are disabled instead of falling back to another task group.
- PWA updates must preserve IndexedDB; subsequent schema changes require Dexie migrations and backup compatibility.
- The completed application must install from GitHub Pages, persist tasks/history locally and offline, offer the agreed three picker choices, separate management/history, keep Add Task visible, and restore validated backups through replace or merge.