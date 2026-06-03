import { http, HttpResponse } from 'msw';
import { env } from '@app/config/env';
import {
  mockChecklists,
  mockDriver,
  mockRoutes,
  mockStops,
  mockHistory,
  mockHistoryStops,
  mockNotifications,
} from './data';
import type { ChecklistDTO } from '@features/checklist/api/dto';

const base = env.apiBaseUrl.replace(/\/$/, '');
const url = (path: string) => `${base}${path}`;

function issueTokens() {
  const now = Date.now();
  return {
    accessToken: `mock-access-${now}`,
    accessTokenExpiresAt: new Date(now + 15 * 60 * 1000).toISOString(),
    refreshToken: `mock-refresh-${now}`,
    refreshTokenExpiresAt: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

// Mutable copy so checklist submissions persist within a session.
// Mutable session copies so writes from the sync engine persist within a session.
const checklists: ChecklistDTO[] = structuredClone(mockChecklists);
const routes = structuredClone(mockRoutes) as (typeof mockRoutes[number] & Record<string, unknown>)[];
const stops = structuredClone(mockStops) as (typeof mockStops[number] & Record<string, unknown>)[];

export const handlers = [
  // --- Auth ---
  http.post(url('/auth/login'), async () => {
    return HttpResponse.json({ data: { driver: mockDriver, ...issueTokens() } });
  }),
  http.post(url('/auth/refresh'), async () => {
    return HttpResponse.json({ data: issueTokens() });
  }),
  http.post(url('/auth/forgot-password'), async () => {
    return HttpResponse.json({ data: { ok: true } });
  }),
  http.post(url('/auth/logout'), async () => HttpResponse.json({ data: { ok: true } })),
  http.post(url('/auth/change-password'), async () => HttpResponse.json({ data: { ok: true } })),

  // --- Profile ---
  http.get(url('/me'), () => HttpResponse.json({ data: mockDriver })),

  // --- Routes ---
  http.get(url('/routes/today'), () => HttpResponse.json({ data: routes })),
  http.get(url('/routes/:routeId'), ({ params }) => {
    const route = routes.find((r) => r.id === params.routeId);
    return route
      ? HttpResponse.json({ data: route })
      : new HttpResponse(null, { status: 404 });
  }),
  http.get(url('/routes/:routeId/stops'), ({ params }) => {
    return HttpResponse.json({ data: stops.filter((s) => s.routeId === params.routeId) });
  }),

  // --- Checklist ---
  http.get(url('/routes/:routeId/checklist'), ({ params }) => {
    const cl = checklists.find((c) => c.routeId === params.routeId);
    return cl ? HttpResponse.json({ data: cl }) : new HttpResponse(null, { status: 404 });
  }),
  http.put(url('/checklists/:checklistId'), async ({ params, request }) => {
    const body = (await request.json()) as Partial<ChecklistDTO>;
    const idx = checklists.findIndex((c) => c.id === params.checklistId);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    checklists[idx] = {
      ...checklists[idx],
      ...body,
      completedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ data: checklists[idx] });
  }),

  // --- History (§8) ---
  http.get(url('/history'), ({ request }) => {
    const u = new URL(request.url);
    const page = Number(u.searchParams.get('page') ?? '1');
    const pageSize = Number(u.searchParams.get('pageSize') ?? '20');
    const start = (page - 1) * pageSize;
    const items = mockHistory.slice(start, start + pageSize);
    return HttpResponse.json({
      data: { items, page, pageSize, total: mockHistory.length, hasMore: start + pageSize < mockHistory.length },
    });
  }),
  http.get(url('/history/:routeId'), ({ params }) => {
    const route = mockHistory.find((r) => r.id === params.routeId);
    if (!route) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ data: { route, stops: mockHistoryStops[route.id] ?? [] } });
  }),

  // --- Notifications (§9) ---
  http.get(url('/notifications'), () => HttpResponse.json({ data: mockNotifications })),
  http.post(url('/notifications/:id/read'), () => HttpResponse.json({ data: { ok: true } })),
  http.post(url('/fcm/register'), () => HttpResponse.json({ data: { ok: true } })),

  // --- Sync engine targets (§6). All accept idempotent writes, echo ok. ---
  http.post(url('/route-events'), () => HttpResponse.json({ data: { ok: true } }, { status: 201 })),
  http.patch(url('/routes/:id'), async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const r = routes.find((x) => x.id === params.id);
    if (r) Object.assign(r, body, { id: r.id });
    return HttpResponse.json({ data: r ?? { ok: true } });
  }),
  http.patch(url('/stops/:id'), async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const s = stops.find((x) => x.id === params.id);
    if (s) Object.assign(s, body, { id: s.id });
    return HttpResponse.json({ data: s ?? { ok: true } });
  }),
  http.patch(url('/checklist-items/:id'), () => HttpResponse.json({ data: { ok: true } })),
  http.post(url('/checklist-photos'), () => HttpResponse.json({ data: { ok: true } }, { status: 201 })),
  http.post(url('/gps/points'), () => HttpResponse.json({ data: { ok: true } }, { status: 201 })),
  http.post(url('/gps/batch'), () => HttpResponse.json({ data: { ok: true } }, { status: 201 })),
];
