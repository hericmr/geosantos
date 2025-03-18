import { LatLng } from 'leaflet';
import { ROUND_TIME, MAX_DISTANCE_METERS } from './gameConstants';
import { ScoreCalculation } from '../types/game';

// Earth's radius in meters
const EARTH_RADIUS = 6371000;

export const calculateDistance = (point1: LatLng, point2: LatLng): number => {
  // Convert latitude and longitude to radians
  const lat1 = point1.lat * Math.PI / 180;
  const lat2 = point2.lat * Math.PI / 180;
  const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
  const deltaLng = (point2.lng - point1.lng) * Math.PI / 180;

  // Haversine formula
  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  // Calculate distance in meters
  return EARTH_RADIUS * c;
};

export const calculateScore = (distance: number, timeLeft: number): ScoreCalculation => {
  // Se a distância for maior que 2000m, aplica penalidade
  if (distance > 2000) {
    const penalty = Math.round((distance - 2000) / 50); // -1 ponto a cada 50m além dos 2000m
    return {
      total: -penalty,
      distancePoints: -penalty,
      timePoints: 0 // Sem pontos por tempo em erros grandes
    };
  }

  // Cálculo normal para distâncias até 2000m
  const distanceScore = Math.max(0, 1 - (distance / MAX_DISTANCE_METERS));
  const distancePoints = Math.round(distanceScore * 700);
  
  // Só calcula pontos por tempo se a distância for menor que 2000m
  const timeScore = timeLeft / ROUND_TIME;
  const timePoints = Math.round(timeScore * 600 * distanceScore);
  
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