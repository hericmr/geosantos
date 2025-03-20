import { describe, it, expect } from 'vitest';
import { LatLng } from 'leaflet';
import { calculateDistance, calculateScore, closestPointOnSegment } from '../utils/gameUtils';

describe('calculateDistance', () => {
  it('should calculate distance between two points correctly', () => {
    // Coordenadas de dois pontos em São Paulo (aproximadamente)
    const point1 = new LatLng(-23.550520, -46.633308); // Praça da Sé
    const point2 = new LatLng(-23.557467, -46.656636); // Praça da República
    
    const distance = calculateDistance(point1, point2);
    
    // A distância real é aproximadamente 2.5km
    expect(distance).toBeGreaterThan(2000); // Mais de 2km
    expect(distance).toBeLessThan(3000);    // Menos de 3km
  });

  it('should return 0 for same point', () => {
    const point = new LatLng(-23.550520, -46.633308);
    expect(calculateDistance(point, point)).toBe(0);
  });
});

describe('calculateScore', () => {
  it('should calculate maximum score for zero distance', () => {
    const score = calculateScore(0, 10);
    expect(score.distancePoints).toBe(1000);
    expect(score.timePoints).toBe(0); // Tempo > 2s não dá bônus
    expect(score.total).toBe(1000);
  });

  it('should calculate time bonus correctly', () => {
    const score = calculateScore(0, 2);
    expect(score.distancePoints).toBe(1000);
    expect(score.timePoints).toBe(500); // Máximo bônus de tempo
    expect(score.total).toBe(1500);
  });

  it('should return zero score for distance >= 10km', () => {
    const score = calculateScore(10000, 10); // 10km
    expect(score.distancePoints).toBe(0);
    expect(score.timePoints).toBe(0);
    expect(score.total).toBe(0);
  });
});

describe('closestPointOnSegment', () => {
  it('should return closest point on a horizontal line segment', () => {
    const point = new LatLng(0, 0);
    const segmentStart = new LatLng(0, -1);
    const segmentEnd = new LatLng(0, 1);
    
    const closest = closestPointOnSegment(point, segmentStart, segmentEnd);
    
    expect(closest.lat).toBe(0);
    expect(closest.lng).toBe(0);
  });

  it('should return segment start when point is before segment', () => {
    const point = new LatLng(0, -2);
    const segmentStart = new LatLng(0, -1);
    const segmentEnd = new LatLng(0, 1);
    
    const closest = closestPointOnSegment(point, segmentStart, segmentEnd);
    
    expect(closest.lat).toBe(segmentStart.lat);
    expect(closest.lng).toBe(segmentStart.lng);
  });

  it('should return segment end when point is after segment', () => {
    const point = new LatLng(0, 2);
    const segmentStart = new LatLng(0, -1);
    const segmentEnd = new LatLng(0, 1);
    
    const closest = closestPointOnSegment(point, segmentStart, segmentEnd);
    
    expect(closest.lat).toBe(segmentEnd.lat);
    expect(closest.lng).toBe(segmentEnd.lng);
  });
}); 