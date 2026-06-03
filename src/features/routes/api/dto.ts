import type { RouteStatus, StopStatus, StopType } from '@shared/types';

/** Server DTOs for routes/stops (server uses `id`; DAO maps to device entities). */
export interface RouteDTO {
  id: string;
  tenantId: string;
  driverId: string;
  status: RouteStatus;
  scheduledStart: string;
  scheduledEnd?: string;
  label?: string;
  odometerIn?: number;
  odometerOut?: number;
}

export interface StopDTO {
  id: string;
  routeId: string;
  sequence: number;
  type: StopType;
  status: StopStatus;
  address: string;
  lat?: number;
  lng?: number;
  passengerName?: string;
  passengerRef?: string;
  scheduledAt?: string;
}
