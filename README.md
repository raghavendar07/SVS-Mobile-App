# SVS Driver Mobile App

Offline-first PWA for Smart Vendor Solutions drivers. Mobile-only (390×844 reference viewport).

Stack: React 19 · TypeScript · Vite · Tailwind · React Router · TanStack Query · Zustand · React Hook Form · Zod · Axios · Dexie (IndexedDB) · PWA.

Full architecture: see the blueprint at `~/.claude/plans/svs-driver-mobile-mellow-clarke.md`.

## Scripts

```bash
npm install      # install deps
npm run dev      # vite dev server
npm run build    # typecheck + production build
npm run test     # vitest
npm run lint     # eslint
```

## Status — All 10 phases complete

- **P1 Setup** — feature-sliced structure, path aliases, canonical types/enums (§0), Dexie schema (§11), Axios client + interceptors (§10), TanStack Query client, Zustand stores, mobile shell + bottom-nav + auth-guarded router, PWA manifest, Vitest.
- **P2 Auth** — RHF + Zod login, auth API, session persistence in Dexie + restore on splash, single-flight 401 token refresh, forgot-password, logout.
- **P3 Dashboard/Routes** — offline-first read-through (API → Dexie cache → fallback), today's-routes list, route detail + stops, RouteCard/StopCard/StatusBadge.
- **P4 Checklist** — overview + form, pass/fail/na per item, failure notes, completion gating, every mutation enqueued as an OfflineAction in the SyncQueue.
- **P5 Route Execution** — state machine: start + odometer-in → stop events (pickup/drop/no-show/refusal/cancel with reasons) → odometer-out → end → summary. Each action writes an immutable RouteEvent + advances Route/Stop status, all queued.
- **P6 Offline Sync Engine** — drains the SyncQueue in clientSeq order, respects `dependsOn`, idempotent retries with exponential backoff + dead-letter, conflict resolution (server-wins on 409), last-synced tracking. Triggers: reconnect, app start, visibility, post-enqueue, interval. Global SyncIndicator strip.
- **P7 GPS** — event fixes captured at every RouteEvent (flagged + `locationMissing` on denial/timeout), 30s trail while active, Dexie buffer + batched upload (GPSBatch). Browser Geolocation now; Capacitor background contract documented.
- **P8 History** — paginated completed-route list + read-only detail (odometer, distance, stop outcomes).
- **P9 Notifications** — in-app list + read state, deep-link to route, preferences (toggles persisted to UserSettings), FCM lifecycle service (config-gated, no-op without Firebase creds).
- **P10 Testing** — Vitest + fake-indexeddb + MSW: DB schema, offline queue, GPS math, execution state machine, sync-engine drain (incl. dependsOn). 12 tests.

**Dev backend:** MSW (`src/test/msw`) mocks the API so the app runs standalone (persists writes within a session). Set `VITE_API_BASE_URL` to use a real backend.

Verified end-to-end in-browser: login → checklist → start route (odometer-in) → pickup → end route (odometer-out) → summary showing **Completed, 80 km, queue drained to 0**; History + Notifications render from the mock API.

### Known follow-ups (production hardening)
- **Background Sync**: foreground sync is complete; OS-background replay needs the Service Worker Background Sync API — switch `vite-plugin-pwa` to `injectManifest` and host the drain in a custom SW.
- **FCM**: provide Firebase config + `firebase-messaging-sw.js` to activate real push (service + backend contract already wired).
- **GPS background**: add Capacitor `background-geolocation` for locked-device tracking.
- **Local encryption / biometric gate** (§13) and **lazy-route code-splitting** (§1.5, bundle ~630 KB) remain.
