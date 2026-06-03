import { describe, it, expect } from 'vitest';
import { distanceM } from './geoUtils';

describe('distanceM', () => {
  it('returns ~0 for identical points', () => {
    expect(distanceM({ lat: 40, lng: -74 }, { lat: 40, lng: -74 })).toBeCloseTo(0, 5);
  });

  it('computes a known short distance', () => {
    // ~111.2 m per 0.001 deg latitude
    const d = distanceM({ lat: 40.0, lng: -74.0 }, { lat: 40.001, lng: -74.0 });
    expect(d).toBeGreaterThan(100);
    expect(d).toBeLessThan(120);
  });
});
