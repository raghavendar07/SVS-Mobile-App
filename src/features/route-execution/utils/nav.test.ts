import { describe, it, expect } from 'vitest';
import { buildNavUrl } from './nav';
import type { RouteStop } from '@shared/types';

const base: RouteStop = {
  localId: 's1', routeId: 'r1', sequence: 1, type: 'pickup', status: 'pending',
  address: '14 Maple St', syncStatus: 'synced', version: 1, updatedAt: '',
};

describe('buildNavUrl', () => {
  it('uses lat,lng when present', () => {
    const url = buildNavUrl({ ...base, lat: 37.7849, lng: -122.4094 });
    expect(url).toContain('destination=37.7849,-122.4094');
    expect(url).toContain('travelmode=driving');
  });

  it('falls back to the encoded address when coordinates are missing', () => {
    const url = buildNavUrl(base);
    expect(url).toContain(`destination=${encodeURIComponent('14 Maple St')}`);
  });
});
