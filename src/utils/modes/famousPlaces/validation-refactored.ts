import * as L from 'leaflet';
import { FamousPlacesValidation, DistanceValidation } from '../../../types/modes/famousPlaces';
import { FamousPlace } from '../../../types/famousPlaces';

// Função para calcular distância entre dois pontos
export const calculateDistance = (point1: L.LatLng, point2: L.LatLng): number => {
  return point1.distanceTo(point2);
};

// Função para validar se um ponto está dentro do threshold de distância
export const validateDistance = (
  clickedPoint: L.LatLng,
  targetPoint: L.LatLng,
  threshold: number = 100
): DistanceValidation => {
  const distance = calculateDistance(clickedPoint, targetPoint);
  const isWithinThreshold = distance <= threshold;
  
  // Calcular precisão (0 = perfeito, 1 = no limite do threshold)
  const precision = isWithinThreshold ? 1 - (distance / threshold) : 0;
  
  // Determinar direção do clique em relação ao alvo
  const direction = calculateDirection(clickedPoint, targetPoint);
  
  return {
    distance,
    isWithinThreshold,
    threshold,
    precision,
    direction
  };
};

// Função para calcular a direção do clique em relação ao alvo
export const calculateDirection = (clickedPoint: L.LatLng, targetPoint: L.LatLng): 
  'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest' => {
  
  const latDiff = clickedPoint.lat - targetPoint.lat;
  const lngDiff = clickedPoint.lng - targetPoint.lng;
  
  const absLatDiff = Math.abs(latDiff);
  const absLngDiff = Math.abs(lngDiff);
  
  // Determinar direção principal
  if (absLatDiff > absLngDiff * 2) {
    // Diferença de latitude é dominante
    return latDiff > 0 ? 'north' : 'south';
  } else if (absLngDiff > absLatDiff * 2) {
    // Diferença de longitude é dominante
    return lngDiff > 0 ? 'east' : 'west';
  } else {
    // Diferença mista - direção diagonal
    if (latDiff > 0 && lngDiff > 0) return 'northeast';
    if (latDiff > 0 && lngDiff < 0) return 'northwest';
    if (latDiff < 0 && lngDiff > 0) return 'southeast';
    if (latDiff < 0 && lngDiff < 0) return 'southwest';
    
    // Fallback para casos extremos
    return 'north';
  }
};

// Função para validar clique em um lugar famoso específico
export const validateFamousPlaceClick = (
  clickedPoint: L.LatLng,
  targetPlace: FamousPlace,
  timeLeft: number,
  distanceThreshold: number = 100
): FamousPlacesValidation => {
  const targetLatLng = L.latLng(targetPlace.latitude, targetPlace.longitude);
  const distanceValidation = validateDistance(clickedPoint, targetLatLng, distanceThreshold);
  
  const isCorrectPlace = distanceValidation.isWithinThreshold;
  const precisionBonus = Math.round(distanceValidation.precision * 1000);
  
  // Gerar mensagem baseada na distância e direção
  let message = '';
  if (isCorrectPlace) {
    message = `Perfeito! Você encontrou ${targetPlace.name}!`;
  } else {
    const directionText = getDirectionText(distanceValidation.direction);
    if (distanceValidation.distance < 250) {
      message = `Quase lá! Continue tentando! (${directionText})`;
    } else if (distanceValidation.distance < 500) {
      message = `Está no caminho certo! (${directionText})`;
    } else if (distanceValidation.distance < 1000) {
      message = `Ainda longe, mas continue! (${directionText})`;
    } else {
      message = `Muito longe! Tente novamente! (${directionText})`;
    }
  }
  
  return {
    isValid: true,
    distance: distanceValidation.distance,
    message,
    score: 0, // Será calculado pelo sistema de pontuação
    isPerfect: isCorrectPlace,
    isCorrectPlace,
    placeName: targetPlace.name,
    targetLatLng,
    clickedLatLng: clickedPoint,
    distanceThreshold,
    precisionBonus
  };
};

// Função para obter texto descritivo da direção
export const getDirectionText = (direction: string): string => {
  const directionMap: Record<string, string> = {
    'north': 'norte',
    'south': 'sul',
    'east': 'leste',
    'west': 'oeste',
    'northeast': 'nordeste',
    'northwest': 'noroeste',
    'southeast': 'sudeste',
    'southwest': 'sudoeste'
  };
  
  return directionMap[direction] || direction;
};

// Função para encontrar o lugar famoso mais próximo de um ponto
export const findNearestFamousPlace = (
  clickedPoint: L.LatLng,
  famousPlaces: FamousPlace[]
): { place: FamousPlace; distance: number } | null => {
  if (famousPlaces.length === 0) return null;
  
  let nearestPlace = famousPlaces[0];
  let nearestDistance = calculateDistance(clickedPoint, L.latLng(nearestPlace.latitude, nearestPlace.longitude));
  
  for (let i = 1; i < famousPlaces.length; i++) {
    const place = famousPlaces[i];
    const distance = calculateDistance(clickedPoint, L.latLng(place.latitude, place.longitude));
    
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestPlace = place;
    }
  }
  
  return {
    place: nearestPlace,
    distance: nearestDistance
  };
};

// Função para calcular área de busca baseada no threshold
export const calculateSearchArea = (
  centerPoint: L.LatLng,
  radius: number
): { bounds: L.LatLngBounds; center: L.LatLng; radius: number } => {
  const bounds = L.latLngBounds(
    L.latLng(centerPoint.lat - (radius / 111000), centerPoint.lng - (radius / (111000 * Math.cos(centerPoint.lat * Math.PI / 180)))),
    L.latLng(centerPoint.lat + (radius / 111000), centerPoint.lng + (radius / (111000 * Math.cos(centerPoint.lat * Math.PI / 180))))
  );
  
  return {
    bounds,
    center: centerPoint,
    radius
  };
};

// Função para verificar se um ponto está dentro de uma área de busca
export const isPointInSearchArea = (
  point: L.LatLng,
  searchArea: { bounds: L.LatLngBounds; center: L.LatLng; radius: number }
): boolean => {
  return searchArea.bounds.contains(point);
};

// Função para obter dicas baseadas na distância e direção
export const getPlaceHints = (
  distance: number,
  direction: string,
  placeName: string
): string[] => {
  const hints: string[] = [];
  
  if (distance < 100) {
    hints.push('Você está muito perto!');
    hints.push('Continue procurando na área!');
  } else if (distance < 250) {
    hints.push(`O ${placeName} está a ${Math.round(distance)}m de distância`);
    hints.push(`Continue na direção ${getDirectionText(direction)}`);
  } else if (distance < 500) {
    hints.push(`O ${placeName} está a ${Math.round(distance)}m de distância`);
    hints.push(`Mova-se na direção ${getDirectionText(direction)}`);
  } else if (distance < 1000) {
    hints.push(`O ${placeName} está a ${(distance / 1000).toFixed(1)}km de distância`);
    hints.push(`Você precisa ir para o ${getDirectionText(direction)}`);
  } else {
    hints.push(`O ${placeName} está muito longe`);
    hints.push(`Considere usar o mapa para navegar`);
  }
  
  return hints;
};

// Função para calcular precisão do clique (0-100%)
export const calculateClickPrecision = (
  distance: number,
  threshold: number
): number => {
  if (distance <= threshold) {
    return Math.round((1 - (distance / threshold)) * 100);
  }
  return 0;
};

// Função para validar múltiplos cliques (anti-spam)
export const validateClickSequence = (
  clicks: Array<{ latlng: L.LatLng; timestamp: number }>,
  minInterval: number = 500
): boolean => {
  if (clicks.length < 2) return true;
  
  const lastClick = clicks[clicks.length - 1];
  const previousClick = clicks[clicks.length - 2];
  
  const timeDiff = lastClick.timestamp - previousClick.timestamp;
  return timeDiff >= minInterval;
}; 