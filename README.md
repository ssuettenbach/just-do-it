# Just Do It

An offline-first progressive web app (PWA) for picking random tasks and getting started quickly.

**Live at:** https://ssuettenbach.github.io/just-do-it/

## Features

- **Offline-first:** All data stays on your device. No accounts, backend, or analytics.
- **Mobile-optimized:** Installable as an Android app via Chrome. Works standalone and offline.
- **Random task picker:** Three buttons for Quick (≤5 min), Any (all tasks), and Big (≥30 min).
- **Local backup:** Export tasks as JSON; restore with Replace or Merge.
- **Minimal:** Just pick a task, complete it, or add new ones.

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Build for Production

```bash
npm run build
```

The app is built for GitHub Pages at https://ssuettenbach.github.io/just-do-it/.

## Tests

```bash
npm test       # run once
npm run test:watch  # watch mode
```

## Deploy to GitHub Pages

1. Push to the `main` branch of [ssuettenbach/just-do-it](https://github.com/ssuettenbach/just-do-it):
   ```bash
   git push origin main
   ```

2. GitHub Actions automatically builds and deploys (watch [Actions](https://github.com/ssuettenbach/just-do-it/actions)).

3. Verify deployment at https://ssuettenbach.github.io/just-do-it/

4. **Pages Setup:** Settings → Pages → Source: GitHub Actions

## Install on Android

1. Open https://ssuettenbach.github.io/just-do-it/ in **Chrome** on Android.
2. Tap the menu (three dots) → **Install app**.
3. The app installs standalone and works offline after the first load.

## Manual Release Checklist

Before deploying, verify on a mobile device or emulator:

- [ ] Android Chrome: Install app from menu → Install app
- [ ] Standalone mode: Verify app launches without browser UI
- [ ] Offline relaunch: Close app, disable network, relaunch, verify works
- [ ] Force-close persistence: Force-stop app (Settings → Apps), relaunch, verify data persists
- [ ] JSON export: Export tasks, verify valid JSON file downloads
- [ ] JSON import (Replace): Import exported file, verify all tasks replaced correctly
- [ ] JSON import (Merge): Import file with new tasks, verify merge behavior correct
- [ ] Subpath deployment: Verify app works at `https://ssuettenbach.github.io/just-do-it/` (not just root)

## Data Privacy

- **All tasks are stored locally** in your device's IndexedDB. No data is sent to any server.
- Backup the app before clearing site data, browser reset, uninstall, or device loss; JSON exports are the recovery path.
- Reinstalling the app or clearing app data removes all local tasks unless you have a backup.
