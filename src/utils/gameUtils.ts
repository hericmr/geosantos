import { LatLng } from 'leaflet';
import { ROUND_TIME, MAX_DISTANCE_METERS } from './gameConstants';
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

export const calculateScore = (distance: number, timeLeft: number): ScoreCalculation => {
  // Converte a distância para quilômetros
  const distanceKm = distance / 1000;
  
  // Pontuação baseada na distância
  // Quanto menor a distância, maior a pontuação
  // Máximo de 1000 pontos para distância de 0km
  // Mínimo de 0 pontos para distância de 10km ou mais
  const distanceScore = Math.max(0, 1000 * (1 - (distanceKm / 10)));
  
  // Bônus de tempo
  // Quanto mais tempo restante, maior o bônus
  // Máximo de 500 pontos de bônus
  // Só dá bônus se o tempo for menor que 2 segundos
  const timeBonus = timeLeft <= 2 ? Math.round((timeLeft / 2) * 500) : 0;
  
  return {
    total: Math.round(distanceScore + timeBonus),
    distancePoints: Math.round(distanceScore),
    timePoints: timeBonus
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