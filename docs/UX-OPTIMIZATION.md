# SVS Driver — UX/UI Optimization

**Constraints honored throughout (restated):** No architecture, routing, state, logic, or data-model changes — every recommendation is presentational/compositional (className, JSX, props, token, sort/select on existing arrays). Mobile-only target viewport 390×844. All touch targets ≥48px. Status is always communicated as **color + icon + text** (never color alone).

---

## 1. UX Issues Found

**P0 — Resume/Start work buried behind interstitials**
- `src/shared/components/cards/RouteCard.tsx` — The whole card is a single `<button>` that only opens RouteDetail. An `in_progress` route requires card → RouteDetail → footer → "Continue route" (2 screens, 2 taps) to resume. No primary "Continue Route" CTA on the list card.
- `src/features/dashboard/screens/DashboardScreen.tsx` — Dashboard does not answer "what do I do next?". Two equal-weight Stat tiles (lines 36–37) plus a uniform list give every route identical emphasis; no hero "Resume your active route" card pinned at top.
- `src/features/checklist/screens/ChecklistOverviewScreen.tsx` — Pure interstitial: only an intro paragraph + read-only list of the same item labels the form already renders (lines 42–49). RouteDetail CTA (`RouteDetailScreen.tsx:37`) lands here, then "Start checklist" (line 29) reaches the actual form — a guaranteed +1 tap + full screen.
- `src/features/checklist/screens/ChecklistFormScreen.tsx` — On completion (lines 45–50) the driver is sent back to `paths.routeDetail` (replace), not forward to route start, breaking the natural checklist → odometer → go flow and adding a screen + re-tap.

**P0 — Touch targets & status glyph (global)**
- `tailwind.config.js` — `touch` token is **44px** (spacing line 15, minWidth line 32, minHeight line 33), below the 48px floor. Every `min-h-touch`/`h-touch`/`w-touch` consumer (Button, TextField, OdometerInput, headers, BottomNav, notification bell, checklist pass/fail/na) inherits 44px.
- `src/shared/components/ui/StatusBadge.tsx` — Renders **color + text only, no icon** (META lines 6–13, pill line 20), at `text-xs` (12px). It is the dominant state signal on RouteCard, StopCard, StopActionScreen, and RouteSummary; fails color+icon+text and is unreadable at arm's length / in sunlight.

**P1 — Missing at-a-glance content & prioritization**
- `src/shared/components/cards/RouteCard.tsx` — Omits required card fields. Renders only `route.label`, scheduled start/end, and StatusBadge; `stopCount` is optional and **never passed** by `DashboardScreen.tsx:57` or `RoutesScreen.tsx:29`, so stops-remaining never appears, and an undefined `label` falls back to a bare literal "Route".
- `src/features/routes/screens/RoutesScreen.tsx` — Routes render in raw array order (`routes.map`, line 27); the active/in_progress route is not floated to the top.
- `src/features/routes/screens/RouteDetailScreen.tsx` — For a not-yet-started route the footer CTA is "Start vehicle checklist" (line 37), an extra interstitial in the card→detail→checklist→start chain.
- `src/features/checklist/screens/StartRouteScreen.tsx` (route-execution) — Standalone screen for a single odometer field; combined with the ChecklistForm → RouteDetail → StartRoute bounce, route start spans 3 screens post-checklist.
- `src/features/route-execution/screens/ActiveRouteScreen.tsx` — No persistent progress: footer shows only faint `text-xs text-slate-400` "{n} stops remaining" and *disappears* when all resolved. No done/total count, no progress bar.
- `src/features/route-execution/screens/StopActionScreen.tsx` — Happy path (confirm pickup/drop-off) is a 2-screen/2-tap operation; negative outcomes force free-text reason entry (2+ taps + typing) with no quick-pick chips.
- `src/features/route-execution/screens/StopActionScreen.tsx` — Three negative actions are all `variant=secondary` (slate), differentiated by text only — indistinguishable outdoors despite being destructive.
- `src/features/checklist/components/ChecklistItemRow.tsx` — Pass/Fail/N/A active state is color-only fill (lines 10–14), no check/x/dash icon — color-only on the most-tapped control. Failure note textarea is `rows=2`, not auto-focused, and there is no "Take Photo" affordance.
- `src/shared/components/nav/BottomNav.tsx` — All four tab icons are identical placeholder `bg-current` dots (line 20); tabs distinguishable only by text label.
- `src/features/notifications/screens/NotificationsScreen.tsx` — Unread = a 2px accent dot + bold only (line 44); no "Unread" label/icon, no per-type icon. Reachable only from the Dashboard bell (`DashboardScreen.tsx:24`) — not one-tap from Routes/History/Profile — and the bell has no unread badge.
- `src/features/profile/screens/ProfileScreen.tsx` — Spec target (Driver Info / Change Password / App Settings / Support) unmet: no tappable Driver Info row, no Support anywhere in `src`, and Notification preferences / Sync status sit ungrouped.
- `src/features/dashboard/screens/DashboardScreen.tsx` — Page title `h1` is only `text-lg` (line 20), rendered ad-hoc per screen with no shared title primitive → inconsistent, small headings app-wide.
- `src/shared/components/feedback/StateViews.tsx` — Loading is a bare centered spinner; no skeleton loaders anywhere → perceived latency.
- `src/shared/components/ui/StatusBadge.tsx` — Uses raw one-off Tailwind colors instead of the canonical `status-*` token palette in `tailwind.config.js`; "pending" is styled like "assigned" (grey) so it reads as inert.

**P2 — Contrast, hit-area, polish**
- `src/features/dashboard/screens/DashboardScreen.tsx` — Notification trigger is emoji 🔔 (line 28, device-variable, low contrast); driver name is low-contrast `text-slate-500` (line 22).
- `src/shared/components/cards/RouteCard.tsx` / `StopCard.tsx` — Metadata is `text-slate-500` (line 22), low contrast for scanning while moving; title only `text-base`.
- `src/shared/components/layout/Screen.tsx` — Sticky header/footer use a 1px hairline border with no elevation; chrome blends into the white body on scroll.
- `src/features/notifications/screens/NotificationsScreen.tsx` — Rows are `px-4 py-3` with no `min-h-touch`; bare empty state (no icon/description) and contextless error state.
- `src/features/profile/screens/ProfileScreen.tsx` — Chevron is a low-contrast `text-slate-400` "›" glyph; row label `text-sm` is small for primary nav.
- `src/shared/components/feedback/StateViews.tsx` — ErrorState heading (`text-base`) and EmptyState heading (`text-lg`) are inconsistent; body `text-slate-500` is borderline outdoor contrast.
- `src/features/route-execution/screens/StopActionScreen.tsx` / `EndRouteScreen.tsx` — Back affordance is a thin "‹ Back" text glyph with no `min-w-touch` hit area.

---

## 2. Recommended Improvements

**Global tokens & primitives**
- `tailwind.config.js` — Bump `touch` from 44px → **48px** in `spacing.touch` (15), `minWidth.touch` (32), `minHeight.touch` (33). One change lifts every `min-h-touch`/`h-touch`/`w-touch` consumer to spec with zero component edits. *(S)*
- `src/shared/components/ui/StatusBadge.tsx` — Rewrite META to the **token palette + per-status icon**: completed → `status-done` + ✓; in_progress/arrived → `status-active` + ▶; cancelled/refused → `status-danger` + ✕; pending/no_show → `status-warn` + clock; assigned → `status-assigned` + ●. Render a leading icon span before the label; bump to `text-sm`, `px-3 py-1`, use `bg-*/10` tint + solid `text-*` token. Satisfies color+icon+text and standardizes the palette. *(M)*
- `src/shared/components/feedback/StateViews.tsx` — Add a `Skeleton`/`SkeletonList` primitive (`animate-pulse rounded-2xl bg-slate-100` blocks shaped like RouteCard; `animate-pulse` already proven in `SplashScreen.tsx:34`), export from `src/shared/components/index.ts`, and swap list/detail loading from spinner → skeletons. Align ErrorState heading to `text-lg` (match EmptyState); darken body `slate-500 → slate-600`. *(M)*
- `src/shared/components/layout/Screen.tsx` — Add a `ScreenTitle` className helper (`text-xl font-bold text-slate-900`) used by all headers; add elevation: header `border-b border-slate-200 shadow-sm`, footer `shadow-[0_-1px_3px_rgba(0,0,0,0.06)]`. *(M)*
- `src/shared/components/ui/Button.tsx` / `TextField.tsx` — Update "min 44px" JSDoc to "48px"; add `py-3` so single-line buttons keep comfortable padding at the new height. *(S)*

**Dashboard / Routes**
- `src/shared/components/cards/RouteCard.tsx` — Add an inline full-width brand-accent **"Continue route"** button (`min-h-touch`) below the meta row when `status==='in_progress'` ("View summary" when completed), wired to a new optional `onContinue` prop (callers pass `navigate(paths.execute(route.localId))`); `e.stopPropagation()` so the card tap still opens detail. Resumes in **1 tap**. *(M)*
- `src/shared/components/cards/RouteCard.tsx` — Always show identifier + stops remaining: `route.label ?? \`Route ${route.localId.slice(0,6)}\``, and a `{remaining}/{total} stops left` line via the existing `stopCount` prop + a new `stopsRemaining` prop, threaded from `DashboardScreen.tsx:57` and `RoutesScreen.tsx:29`. Promote title → `text-lg font-semibold`, metadata → `text-slate-600 font-medium` with a clock/pin icon. *(M)*
- `src/features/dashboard/screens/DashboardScreen.tsx` — Before the Stat grid (line 35), compute `routes.find(r=>r.status==='in_progress') ?? next non-completed` and render it as a larger brand-accent-bordered hero RouteCard with the inline Continue CTA; keep the list below as "Up next". Selection only — no data change. *(M)*
- `src/features/routes/screens/RoutesScreen.tsx` — Presentational sort before mapping (line 27): in_progress → assigned by `scheduledStart` → completed/cancelled last. *(S)*

**Checklist / Start**
- `src/features/routes/screens/RouteDetailScreen.tsx` — Change the not-checklistDone CTA destination (lines 36–37) from `paths.checklist(r.localId)` to `${paths.checklist(r.localId)}/form` to deep-link past the overview. *(S)*
- `src/features/checklist/screens/ChecklistFormScreen.tsx` — In `onComplete` (45–50) navigate to `paths.executeStart(routeId)` (when route not in_progress) instead of `paths.routeDetail`. Add a sticky footer "X of N answered" progress count above Complete using the existing `answeredSet`/`items`. *(S)*
- `src/features/checklist/components/ChecklistItemRow.tsx` — Add check/x/dash icon before each option label (icon+color+text); on flip to `fail`, `autoFocus` the note textarea and give it `min-h-[88px]` (replace `rows=2`). *(S)*

**Execution / Completion**
- `src/features/route-execution/screens/ActiveRouteScreen.tsx` — Replace the conditional faint footer text with a **persistent sticky header progress row**: "Stop {done} of {total} · {remaining} left" + thin bar (`done = stops.length - unresolved.length`); keep visible when all resolved ("All stops done"). *(M)*
- `src/shared/components/cards/StopCard.tsx` — Add an inline primary "Pickup"/"Drop-off" confirm button (`min-h-touch`) for pending/arrived stops via a new optional `onConfirm` prop so the happy path commits in **1 tap** from ActiveRouteScreen; card tap elsewhere still opens detail for negatives. Add `min-h-touch` to the wrapper. *(L)*
- `src/features/route-execution/screens/StopActionScreen.tsx` — Add tappable **quick-reason chips** above the textarea in the BottomSheet (no_show: "Not present"/"Wrong address"; refusal: "Declined"/"Unwell") that set `reason` and enable commit (1 tap); textarea stays as free-text override. Give the three negative buttons a warn/danger outline + per-action icon. *(M)*

**Profile / Nav / Notifications**
- `src/features/profile/screens/ProfileScreen.tsx` — Restructure to the spec set: wrap the identity block (34–37) as a tappable **"Driver Info"** Row; keep "Change password"; group "Notification preferences" + "Sync status" under an **"App Settings"** subheading; add a **"Support"** Row (mailto:/tel: href — no new route). Add icons; bump label to `text-base`; replace the `text-slate-400` "›" with a higher-contrast chevron. *(M)*
- `src/shared/components/nav/BottomNav.tsx` — Replace the `bg-current` dot (line 20) with a distinct icon per tab via a new `icon` field in `BOTTOM_TABS`; active tab keeps `text-brand-accent`. *(M)*
- `src/features/notifications/screens/NotificationsScreen.tsx` — Add an explicit "Unread" pill/leading alert icon next to the title alongside the dot (color+icon+text); add a per-type leading icon; enforce `min-h-touch` on the row (line 42); enrich EmptyState (icon + "You're all caught up…") and add ErrorState copy. *(M)*
- `src/features/dashboard/screens/DashboardScreen.tsx` — Replace 🔔 with the app icon/SVG at `text-slate-700`; bump driver name `slate-500 → slate-700`; wrap the bell in a relative span rendering an unread-count badge when `unread > 0` (data already in `useNotifications`). *(S)*

---

## 3. Screens to Merge

| Merge / Collapse | Files | Mechanism | Taps saved |
|---|---|---|---|
| Card → RouteDetail → footer "Continue route" → resume | `RouteCard.tsx`, `DashboardScreen.tsx`, `RoutesScreen.tsx` | Inline Continue CTA on the card resumes `in_progress` directly | 1 |
| Card → RouteDetail → "Start route" (checklist already done) | `RouteCard.tsx`, `RouteDetailScreen.tsx` | Inline Start CTA reaches `paths.executeStart` from the card | 1 |
| Stat tiles "Routes today" + "Remaining" → single summary line | `DashboardScreen.tsx:36–37` | Collapse two `3xl` tiles into one "X of Y routes done" line above the hero card | 0 (frees prime real estate) |
| Notifications list ↔ Notification preferences entry points | `NotificationsScreen.tsx`, `NotificationPrefsScreen.tsx` | Add a gear affordance in the Notifications header deep-linking to prefs (both currently titled "Notifications") | 2 |

*(Checklist Overview and the ChecklistForm→StartRoute bounce are removals, covered in §4.)*

---

## 4. Steps That Can Be Removed

| Step removed | File / line | Change | Taps saved |
|---|---|---|---|
| ChecklistOverview interstitial | `RouteDetailScreen.tsx:36–37` | Deep-link CTA to `…/checklist/form`, skipping the read-only overview (no input, duplicates the form's labels) | 1 + 1 screen |
| ChecklistForm → RouteDetail bounce | `ChecklistFormScreen.tsx:45–50` | `onComplete` navigates straight to `paths.executeStart(routeId)` → odometer, not back to RouteDetail | 1 + 1 screen |
| Mandatory free-text reason on negative outcomes | `StopActionScreen.tsx` | Quick-reason chips set `reason` in one tap; typing becomes optional override | 1 + keyboard |
| 'Sync status' standalone Profile row | `ProfileScreen.tsx:42` | Surface under App Settings / rely on existing `AppShell.tsx:15` `<SyncIndicator/>` | 1 |

**Keep as-is (do not "fix"):** `EndRoute → Summary → Home` already uses `navigate(..., {replace:true})` with no interstitial (`EndRouteScreen` onSuccess → `RouteSummaryScreen`; Summary "Done" → home). The closing path has nothing to remove.

---

## 5. Navigation Improvements

- **One-tap resume from lists:** inline Continue/Start CTA on `RouteCard.tsx` (Dashboard + Routes) removes the RouteDetail interstitial for the most frequent intent.
- **One-tap happy-path execution:** inline Pickup/Drop-off confirm on `StopCard.tsx` keeps StopActionScreen only for negative outcomes.
- **Deep-link the pre-trip chain:** `RouteDetailScreen.tsx` CTA → `…/checklist/form`; `ChecklistFormScreen.tsx` completion → `paths.executeStart`. Pre-trip collapses from 4 screens to 2.
- **Notifications reachable beyond Home:** add an unread-count badge to the Dashboard bell (`DashboardScreen.tsx:23–29`) and a gear deep-link from the Notifications header to prefs, eliminating the back-out-to-Profile detour.
- **Glanceable tab bar:** distinct per-tab icons in `BottomNav.tsx` so Home/Routes/History/Profile are identifiable by shape, not text alone (keep sticky + `pb-safe-b`).
- **Reliable back hit areas:** wrap the "‹ Back" text glyph in `StopActionScreen.tsx`/`EndRouteScreen.tsx` headers in a `min-h-touch`/`min-w-touch` button.

---

## 6. Information Hierarchy Improvements

- **Dashboard answers "what next?":** hero "Today's Route" card (brand-accent border, larger) pinned above a collapsed one-line stat summary; remaining routes demoted to an "Up next" list (`DashboardScreen.tsx`).
- **Active route floats to top** of the Routes list via presentational sort (`RoutesScreen.tsx:27`).
- **Persistent execution progress:** "Stop {done} of {total} · {remaining} left" + bar promoted from faint `text-xs text-slate-400` footer to a high-contrast sticky header element (`ActiveRouteScreen.tsx`).
- **Cards carry the required at-a-glance set:** identifier (never bare "Route"), stops-remaining chip, status, start time (`RouteCard.tsx`).
- **Standardized page titles:** shared `ScreenTitle` (`text-xl font-bold`) replaces per-screen `text-lg` ad-hoc headings (`Screen.tsx`, `DashboardScreen.tsx:20`).
- **Standardized status semantics:** success=completed / info=in_progress / warning=pending+no_show / danger=cancelled+refused / neutral=assigned, via the `status-*` tokens (`StatusBadge.tsx`) — "pending" no longer reads as inert grey.

---

## 7. Mobile Usability Improvements

- **≥48px everywhere** via the single `tailwind.config.js` token bump — Button, TextField, OdometerInput, headers, BottomNav tabs, notification bell, checklist Pass/Fail/N/A (3-col grid), notification rows, profile rows.
- **Thumb-first primary actions:** RouteDetail already uses a sticky full-width footer Button (`min-h-touch`) — replicate that pattern for the resume CTA on lists; move StopActionScreen's positive Confirm into the `Screen` footer (it currently sits mid-screen on tall stops) with the negative grid in the body.
- **`e.stopPropagation()`** on inner Continue/Confirm buttons so the thumb-first action and full-card navigation don't conflict (`RouteCard.tsx`, `StopCard.tsx`).
- **Reduce keyboard reliance at stops:** quick-reason chips in the BottomSheet (`StopActionScreen.tsx`); auto-focus + `min-h-[88px]` failure note (`ChecklistItemRow.tsx`).
- **Full-row tap targets:** make the whole notification-prefs `<li>` toggle the switch (currently only the 28px-tall switch is tappable); enforce `min-h-touch` on notification list rows.
- **Numeric entry preserved:** `OdometerInput` keeps `inputMode=numeric` + large `text-3xl` tabular digits; just inherits the 48px bump.

---

## 8. Visual Design Improvements

- **Status = color + icon + text** at `text-sm`/`px-3 py-1` using `status-*` tokens (`StatusBadge.tsx`) — readable in sunlight, safe for colorblind users; propagates to RouteCard, StopCard, StopActionScreen, RouteSummary.
- **Active-route emphasis:** brand-accent left bar / border on the in_progress card vs neutral `slate-200` for others (`RouteCard.tsx`).
- **Stop-progress affordance:** "X/Y stops left" chip / mini bar on cards and a persistent execution bar (Uber/Amazon feel).
- **Distinct nav icons** replacing identical placeholder dots (`BottomNav.tsx`).
- **Stronger unread treatment:** "Unread" pill + per-type icon, not a 2px dot (`NotificationsScreen.tsx`).
- **Contrast pass:** metadata/body `slate-500 → slate-600`, driver name + bell `slate-500/emoji → slate-700/SVG`, profile chevron darkened.
- **Distinguish destructive actions:** No-show/Refusal/Cancellation get warn/danger outline + icon instead of uniform slate (`StopActionScreen.tsx`).
- **Elevation + skeletons:** sticky header/footer `shadow` (`Screen.tsx`); content-shaped `animate-pulse` skeletons replace bare spinners (`StateViews.tsx`); richer empty/error states.
- **Typography scale:** card title `text-lg`, page title `text-xl`, consistent feedback headings.

---

## 9. Updated User Flow (optimized, with tap counts)

```
 ┌─────────────────────────────────────────────────────────────────────┐
 │  LOGIN                                                               │
 │  [employee code] + [password] ──tap"Sign in"(1)──▶                   │
 └─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
 ┌─────────────────────────────────────────────────────────────────────┐
 │  DASHBOARD (hero "Today's Route" card pinned on top)                 │
 │   ┌───────────────────────────────────────────────┐                 │
 │   │ ▶ Route A1B2C3   ● in_progress                 │  status=color   │
 │   │ 08:00–14:00   ·   3/8 stops left               │  +icon+text     │
 │   │ [ ===== Continue route ===== ]  ◀── 48px CTA   │                 │
 │   └───────────────────────────────────────────────┘                 │
 │                                                                       │
 │   ── NOT yet started? tap "Start" on hero card ──────────┐           │
 └──────────────────────────────────────────────────────────┼──────────┘
        │ in_progress: tap Continue (1)                      │ not started
        │                                                    │
        │                                       tap Start (1)│
        │                                                    ▼
        │                          ┌───────────────────────────────────┐
        │                          │ CHECKLIST FORM (overview SKIPPED)  │
        │                          │  Pass/Fail/N/A  ✓/✕/—  per item    │
        │                          │  "X of N answered"                 │
        │                          │  [ Complete ] (1) ─────────────┐   │
        │                          └────────────────────────────────┼───┘
        │                                                            ▼
        │                          ┌───────────────────────────────────┐
        │                          │ START ROUTE (odometer) — direct,   │
        │                          │  no RouteDetail bounce             │
        │                          │  [ Start route ] (1) ──────────┐   │
        │                          └────────────────────────────────┼───┘
        │                                                            │
        └────────────────────────────┬───────────────────────────────┘
                                      ▼
 ┌─────────────────────────────────────────────────────────────────────┐
 │  ACTIVE ROUTE  (sticky header: "Stop 4 of 8 · 4 left" + ▓▓▓░░ bar)  │
 │   ┌───────────────────────────────────────────────┐                 │
 │   │ Stop #4  ● pending   123 Main St               │                 │
 │   │                          [ Pickup ] (1) ◀──────┼── inline 1-tap  │
 │   └───────────────────────────────────────────────┘  happy path     │
 │     negatives: tap card ▶ StopActionScreen ▶ reason CHIP (1) ▶ commit│
 │   …repeat per stop…                                                   │
 │   [ ===== End route ===== ] (1)                                      │
 └─────────────────────────────────────────────────────────────────────┘
                                      ▼
 ┌─────────────────────────────────────────────────────────────────────┐
 │  END ROUTE (closing odometer) ─[ End route ](1)─▶ SUMMARY ─[Done](1)─▶ HOME
 │  (already {replace:true}, no interstitial — unchanged)               │
 └─────────────────────────────────────────────────────────────────────┘

 ── ROUTE-START TAP BUDGET (target < 30s) ──────────────────────────────
   Resume in_progress route:  Sign in(1) → Continue(1)          = 2 taps  (~8s)  ✓
   Cold start a new route:     Sign in(1) → Start(1) → Complete(1)
                               → Start route(1)                  = 4 taps  (~20s) ✓
   (was: Sign in → card → RouteDetail → Start checklist → Overview "Start"
        → Complete → RouteDetail "Start route" → odometer = ~8 taps / 4 extra screens)
```

---

## 10. Prioritized UX Improvement Roadmap

| Pri | Improvement | File | Effort |
|---|---|---|---|
| **P0** | Bump `touch` token 44px → 48px (lifts all targets app-wide) | `tailwind.config.js` | S |
| **P0** | StatusBadge: add per-status icon + `status-*` token palette + `text-sm` (color+icon+text) | `src/shared/components/ui/StatusBadge.tsx` | M |
| **P0** | Inline "Continue route" CTA on card (1-tap resume) | `src/shared/components/cards/RouteCard.tsx` | M |
| **P0** | Hero "Today's Route" card above stat grid | `src/features/dashboard/screens/DashboardScreen.tsx` | M |
| **P0** | Always show route id + stops-remaining on card | `src/shared/components/cards/RouteCard.tsx` | M |
| **P0** | Deep-link RouteDetail CTA past ChecklistOverview → `/checklist/form` | `src/features/routes/screens/RouteDetailScreen.tsx` | S |
| **P0** | Checklist completion → `executeStart` (remove RouteDetail bounce) | `src/features/checklist/screens/ChecklistFormScreen.tsx` | S |
| **P1** | Inline Pickup/Drop-off confirm on StopCard (1-tap happy path) | `src/shared/components/cards/StopCard.tsx` | L |
| **P1** | Persistent execution progress row + bar | `src/features/route-execution/screens/ActiveRouteScreen.tsx` | M |
| **P1** | Quick-reason chips + warn/danger styling on negatives | `src/features/route-execution/screens/StopActionScreen.tsx` | M |
| **P1** | Pass/Fail/N/A icons + auto-focus & taller fail note | `src/features/checklist/components/ChecklistItemRow.tsx` | S |
| **P1** | Sort active route to top | `src/features/routes/screens/RoutesScreen.tsx` | S |
| **P1** | Restructure Profile to Driver Info / Change Password / App Settings / Support | `src/features/profile/screens/ProfileScreen.tsx` | M |
| **P1** | Distinct per-tab nav icons | `src/shared/components/nav/BottomNav.tsx` | M |
| **P1** | Unread pill + per-type icon + `min-h-touch` rows + bell badge | `src/features/notifications/screens/NotificationsScreen.tsx` + `DashboardScreen.tsx` | M |
| **P1** | Skeleton loaders + aligned error/empty states | `src/shared/components/feedback/StateViews.tsx` | M |
| **P1** | Shared `ScreenTitle` primitive (standardize page titles) | `src/shared/components/layout/Screen.tsx` | M |
| **P1** | Sticky-footer "X of N answered" progress | `src/features/checklist/screens/ChecklistFormScreen.tsx` | S |
| **P2** | Replace emoji bell w/ SVG + raise driver-name contrast | `src/features/dashboard/screens/DashboardScreen.tsx` | S |
| **P2** | Card title/metadata contrast + clock/pin icon | `src/shared/components/cards/RouteCard.tsx` (+ `StopCard.tsx`) | S |
| **P2** | Sticky header/footer elevation | `src/shared/components/layout/Screen.tsx` | S |
| **P2** | Profile chevron contrast + `text-base` row labels | `src/features/profile/screens/ProfileScreen.tsx` | S |
| **P2** | `min-w-touch` back-button hit area in execution headers | `StopActionScreen.tsx`, `EndRouteScreen.tsx` | S |
| **P2** | Button/TextField doc + `py-3` padding after token bump | `src/shared/components/ui/Button.tsx`, `TextField.tsx` | S |