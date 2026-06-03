/**
 * Mock backend dataset (dev + tests). Shapes reuse the feature API DTOs.
 * DAOs map DTO -> device entity (localId + sync meta) on ingest.
 */
import type { RouteDTO, StopDTO } from '@features/routes/api/dto';
import type { ChecklistDTO, ChecklistItemDTO } from '@features/checklist/api/dto';

const TENANT = 'svs-demo';
const DRIVER = 'dev-driver';
const TODAY = '2026-06-03';

export const mockRoutes: RouteDTO[] = [
  {
    id: 'route-1001',
    tenantId: TENANT,
    driverId: DRIVER,
    status: 'assigned',
    scheduledStart: `${TODAY}T07:30:00.000Z`,
    scheduledEnd: `${TODAY}T11:00:00.000Z`,
    label: 'Morning — North Loop',
  },
  {
    id: 'route-1002',
    tenantId: TENANT,
    driverId: DRIVER,
    status: 'assigned',
    scheduledStart: `${TODAY}T13:00:00.000Z`,
    scheduledEnd: `${TODAY}T16:30:00.000Z`,
    label: 'Afternoon — Airport Shuttle',
  },
];

export const mockStops: StopDTO[] = [
  { id: 'stop-1', routeId: 'route-1001', sequence: 1, type: 'pickup', status: 'pending', address: '14 Maple St', passengerName: 'A. Rivera', passengerRef: 'P-201', scheduledAt: `${TODAY}T07:45:00.000Z` },
  { id: 'stop-2', routeId: 'route-1001', sequence: 2, type: 'pickup', status: 'pending', address: '9 Birch Ave', passengerName: 'M. Chen', passengerRef: 'P-202', scheduledAt: `${TODAY}T08:10:00.000Z` },
  { id: 'stop-3', routeId: 'route-1001', sequence: 3, type: 'drop_off', status: 'pending', address: 'Civic Center', scheduledAt: `${TODAY}T08:50:00.000Z` },
  { id: 'stop-4', routeId: 'route-1002', sequence: 1, type: 'pickup', status: 'pending', address: 'Terminal B', passengerName: 'J. Okafor', passengerRef: 'P-310', scheduledAt: `${TODAY}T13:15:00.000Z` },
  { id: 'stop-5', routeId: 'route-1002', sequence: 2, type: 'drop_off', status: 'pending', address: 'Grand Hotel', scheduledAt: `${TODAY}T14:00:00.000Z` },
];

const checklistItems = (checklistId: string): ChecklistItemDTO[] => [
  { id: `${checklistId}-i1`, checklistId, label: 'Tyres & pressure', category: 'Exterior', status: 'na' },
  { id: `${checklistId}-i2`, checklistId, label: 'Lights & indicators', category: 'Exterior', status: 'na' },
  { id: `${checklistId}-i3`, checklistId, label: 'Brakes', category: 'Mechanical', status: 'na' },
  { id: `${checklistId}-i4`, checklistId, label: 'Seatbelts', category: 'Interior', status: 'na' },
  { id: `${checklistId}-i5`, checklistId, label: 'First-aid kit', category: 'Safety', status: 'na' },
  { id: `${checklistId}-i6`, checklistId, label: 'Fire extinguisher', category: 'Safety', status: 'na' },
];

export const mockChecklists: ChecklistDTO[] = mockRoutes.map((r) => ({
  id: `chk-${r.id}`,
  routeId: r.id,
  blocking: true,
  items: checklistItems(`chk-${r.id}`),
}));

// Completed routes for History (§8) — prior days.
export const mockHistory: RouteDTO[] = [
  {
    id: 'route-0980',
    tenantId: TENANT,
    driverId: DRIVER,
    status: 'completed',
    scheduledStart: '2026-06-02T07:30:00.000Z',
    scheduledEnd: '2026-06-02T11:15:00.000Z',
    label: 'Morning — North Loop',
    odometerIn: 41230,
    odometerOut: 41298,
  },
  {
    id: 'route-0975',
    tenantId: TENANT,
    driverId: DRIVER,
    status: 'completed',
    scheduledStart: '2026-06-01T13:00:00.000Z',
    scheduledEnd: '2026-06-01T16:40:00.000Z',
    label: 'Afternoon — Airport Shuttle',
    odometerIn: 41180,
    odometerOut: 41230,
  },
];

export const mockHistoryStops: Record<string, StopDTO[]> = {
  'route-0980': [
    { id: 'h-1', routeId: 'route-0980', sequence: 1, type: 'pickup', status: 'completed', address: '14 Maple St', passengerName: 'A. Rivera' },
    { id: 'h-2', routeId: 'route-0980', sequence: 2, type: 'drop_off', status: 'completed', address: 'Civic Center' },
  ],
  'route-0975': [
    { id: 'h-3', routeId: 'route-0975', sequence: 1, type: 'pickup', status: 'no_show', address: 'Terminal B', passengerName: 'J. Okafor' },
    { id: 'h-4', routeId: 'route-0975', sequence: 2, type: 'drop_off', status: 'completed', address: 'Grand Hotel' },
  ],
};

export const mockNotifications = [
  { id: 'n-1', type: 'route_assigned', title: 'New route assigned', body: 'Morning — North Loop starts 07:30.', routeId: 'route-1001', read: false, receivedAt: `${TODAY}T06:00:00.000Z` },
  { id: 'n-2', type: 'route_reassigned', title: 'Route updated', body: 'Afternoon — Airport Shuttle stops changed.', routeId: 'route-1002', read: false, receivedAt: `${TODAY}T06:15:00.000Z` },
  { id: 'n-3', type: 'system', title: 'App updated', body: 'New version available next launch.', read: true, receivedAt: '2026-06-02T18:00:00.000Z' },
] as const;

export const mockDriver = {
  id: DRIVER,
  name: 'Dev Driver',
  employeeCode: 'EMP-001',
  phone: '+1 555 0100',
  licenseNumber: 'DL-99231',
  active: true,
};
