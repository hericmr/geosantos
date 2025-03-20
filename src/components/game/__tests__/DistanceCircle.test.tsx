import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { DistanceCircle } from '../DistanceCircle';
import * as L from 'leaflet';

describe('DistanceCircle', () => {
  const mockMap = {
    eachLayer: vi.fn(),
    removeLayer: vi.fn()
  };

  const mockCircle = {
    setRadius: vi.fn(),
    addTo: vi.fn().mockReturnThis()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(L, 'circle').mockReturnValue(mockCircle as any);
  });

  it('should not render circle when distanceCircle is null', () => {
    render(
      <DistanceCircle
        map={mockMap as any}
        distanceCircle={null}
        onAnimationComplete={() => {}}
      />
    );

    expect(L.circle).not.toHaveBeenCalled();
  });

  it('should render and animate circle when distanceCircle is provided', () => {
    const center = { lat: 0, lng: 0 };
    const radius = 1000;
    
    render(
      <DistanceCircle
        map={mockMap as any}
        distanceCircle={{ center, radius }}
        onAnimationComplete={() => {}}
      />
    );

    expect(L.circle).toHaveBeenCalledWith(
      center,
      expect.objectContaining({
        radius: 0,
        color: '#ff6b6b',
        fillColor: '#ff6b6b',
        fillOpacity: 0.05,
        weight: 1.5
      })
    );
  });
}); 