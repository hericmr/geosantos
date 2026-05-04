import { LatLng } from 'leaflet';
import { ROUND_TIME, MAX_DISTANCE_METERS } from './gameConstants'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { ScoreCalculation } from '../types/game';

// Earth's radius in meters
const EARTH_RADIUS = 6371000;

// Calcula o ponto mais próximo em um segmento de reta
export const closestPointOnSegment = (p: LatLng, v: LatLng, w: LatLng): LatLng => {
  // Converte para coordenadas cartesianas para simplificar o cálculo
  const vx = v.lng;
  const vy = v.lat;
  const wx = w.lng;
  const wy = w.lat;
  const px = p.lng;
  const py = p.lat;

  // Calcula o quadrado da distância do segmento
  const l2 = Math.pow(wx - vx, 2) + Math.pow(wy - vy, 2);
  
  if (l2 === 0) return v; // v == w case
  
  // Calcula a projeção do ponto p no segmento
  const t = Math.max(0, Math.min(1, ((px - vx) * (wx - vx) + (py - vy) * (wy - vy)) / l2));
  
  // Calcula o ponto mais próximo
  return new LatLng(
    vy + t * (wy - vy),
    vx + t * (wx - vx)
  );
};

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

export const calculateScore = (distance: number, timeLeft: number, gameMode: 'neighborhoods' | 'famous_places' = 'neighborhoods'): ScoreCalculation => {
  const distanceKm = distance / 1000;

  if (gameMode === 'famous_places') {
    // Pontuação linear: máx 800 pela distância (até 3km), + até 200 pelo tempo
    const distancePoints = Math.round(Math.max(0, 800 * (1 - distanceKm / 3)));
    const timePoints = Math.round((timeLeft / ROUND_TIME) * 200);
    return { total: distancePoints + timePoints, distancePoints, timePoints };
  }

  // Modo bairros — clique errado: máx 800 pela distância (até 10km), + até 200 pelo tempo
  const distancePoints = Math.round(Math.max(0, 800 * (1 - distanceKm / 10)));
  const timePoints = Math.round((timeLeft / ROUND_TIME) * 200);
  return { total: distancePoints + timePoints, distancePoints, timePoints };
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