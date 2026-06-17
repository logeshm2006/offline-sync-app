## EdgeSync (Offline-Online Sync System)

EdgeSync is a production-ready PWA and Android-capable app that enables offline data collection and reliable sync when connectivity is restored. It uses IndexedDB for local storage, a Service Worker for offline caching, and a Capacitor-wrapped WebView for Android APK builds.

Live Demo: https://offline-sync-app-logeshmadhavan2006-9470s-projects.vercel.app/

Features
- Offline data collection with IndexedDB
- Automatic sync when online is restored
- PWA install support (desktop & mobile)
- Android APK via Capacitor (WebView)

Tech Stack
- React + Vite
- TypeScript
- Tailwind CSS
- IndexedDB (local offline storage)
- Service Worker (vite-plugin-pwa)
- Node.js backend (server/) and MongoDB Atlas

How to run locally
1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

How to build

```bash
npm run build
```

How to deploy (Vercel)
1. Push the repository to GitHub.
2. Create a new project in Vercel and link the GitHub repo.
3. Set the build command to `npm run build` and the output directory to `dist`.
4. Deploy — Vercel will serve the PWA automatically.

How to generate Android APK
1. Build the web app:

```bash
npm run build
```

2. Sync with Capacitor:

```bash
npx cap sync
npx cap open android
```

3. Open the Android project in Android Studio and build the APK as usual.

Notes
- The app works offline using IndexedDB. Offline changes are queued and synced when connectivity returns.
- Service Worker handles static asset caching; API calls are not aggressively cached.

Troubleshooting
- Service worker not updating: try clearing the browser cache or unregistering the service worker from DevTools, then reload.
- PWA install not showing: ensure `start_url` is `/` and that site is served over HTTPS (or localhost for dev).
- APK offline issue: confirm assets are bundled in the build output and that `public/` contains required icons (icon-192.png, icon-512.png, favicon.ico).

If you need help building the APK or deploying, open an issue or contact the maintainer.
