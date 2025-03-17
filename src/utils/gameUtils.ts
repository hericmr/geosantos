import { LatLng } from 'leaflet';
import { ROUND_TIME, MAX_DISTANCE_METERS } from './gameConstants';
import { ScoreCalculation } from '../types/game';

export const calculateDistance = (point1: LatLng, point2: LatLng): number => {
  return point1.distanceTo(point2);
};

export const calculateScore = (distance: number, timeLeft: number): ScoreCalculation => {
  // Calculate click accuracy (0 to 1)
  const distanceScore = Math.max(0, 1 - (distance / MAX_DISTANCE_METERS));
  
  // Calculate points by distance (max 700)
  const distancePoints = Math.round(distanceScore * 700);
  
  // Calculate points by time (max 300), multiplied by click accuracy
  const timeScore = timeLeft / ROUND_TIME;
  const timePoints = Math.round(timeScore * 300 * distanceScore);
  
  return {
    total: distancePoints + timePoints,
    distancePoints,
    timePoints
  };
};

export const getNeighborhoodStyle = (feature: any, revealedNeighborhoods: Set<string>, currentNeighborhood: string) => {
  const isRevealed = revealedNeighborhoods.has(feature.properties?.NOME);
  const isCurrent = feature.properties?.NOME === currentNeighborhood;

  if (isCurrent && isRevealed) {
    return {
      fillColor: '#00FF00',
      weight: 2,
      opacity: 1,
      color: '#000000',
      fillOpacity: 0.7,
      dashArray: '3'
    };
  }

  return {
    fillColor: '#32CD32',
    weight: 2,
    opacity: isRevealed ? 1 : 0,
    color: '#000000',
    fillOpacity: isRevealed ? 0.3 : 0,
    dashArray: '3'
  };
}; 