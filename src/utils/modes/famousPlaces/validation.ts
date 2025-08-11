import * as L from 'leaflet';
import { FamousPlacesValidation, DistanceValidation } from '../../../types/modes/famousPlaces';
import { FamousPlace } from '../../../types/famousPlaces';
import {
  calculateDistance,
  calculateDirection,
  getDirectionText,
  findNearestElement
} from '../../shared';

/**
 * Validação de cliques para o modo de lugares famosos usando utilitários compartilhados
 * 
 * Este arquivo foi refatorado para usar os utilitários compartilhados
 * em vez de duplicar código entre modos.
 */

// ============================================================================
// FUNÇÕES DE VALIDAÇÃO ESPECÍFICAS DO MODO LUGARES FAMOSOS
// ============================================================================

/**
 * Valida se um ponto está dentro do threshold de distância
 */
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

/**
 * Valida clique em um lugar famoso específico
 */
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
    targetLatLng: targetLatLng,
    clickedLatLng: clickedPoint,
    distanceThreshold: distanceThreshold,
    precisionBonus: Math.round(distanceValidation.precision * 1000)
  };
};

/**
 * Encontra o lugar famoso mais próximo de um ponto
 */
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

/**
 * Calcula área de busca circular
 */
export const calculateSearchArea = (
  centerPoint: L.LatLng,
  radius: number
): { bounds: L.LatLngBounds; center: L.LatLng; radius: number } => {
  const bounds = L.latLngBounds(
    [centerPoint.lat - (radius / 111000), centerPoint.lng - (radius / (111000 * Math.cos(centerPoint.lat * Math.PI / 180)))],
    [centerPoint.lat + (radius / 111000), centerPoint.lng + (radius / (111000 * Math.cos(centerPoint.lat * Math.PI / 180)))]
  );
  
  return {
    bounds,
    center: centerPoint,
    radius
  };
};

/**
 * Verifica se um ponto está dentro da área de busca
 */
export const isPointInSearchArea = (
  point: L.LatLng,
  searchArea: { bounds: L.LatLngBounds; center: L.LatLng; radius: number }
): boolean => {
  return searchArea.bounds.contains(point);
};

/**
 * Gera dicas baseadas na distância e direção
 */
export const getPlaceHints = (
  distance: number,
  direction: string,
  placeName: string
): string[] => {
  const hints: string[] = [];
  
  if (distance < 100) {
    hints.push(`Você está muito próximo de ${placeName}!`);
    hints.push(`Continue procurando na área!`);
  } else if (distance < 500) {
    hints.push(`Você está próximo de ${placeName}`);
    hints.push(`Procure na direção ${getDirectionText(direction)}`);
  } else if (distance < 1000) {
    hints.push(`Você está a uma distância média de ${placeName}`);
    hints.push(`Mova-se na direção ${getDirectionText(direction)}`);
  } else {
    hints.push(`Você está longe de ${placeName}`);
    hints.push(`Comece se movendo na direção ${getDirectionText(direction)}`);
  }
  
  return hints;
};

/**
 * Calcula a precisão do clique baseado na distância
 */
export const calculateClickPrecision = (
  distance: number,
  threshold: number
): number => {
  if (distance <= threshold) {
    return 1 - (distance / threshold);
  }
  return 0;
};

/**
 * Valida sequência de cliques para evitar spam
 */
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

// ============================================================================
// FUNÇÕES DE VALIDAÇÃO AVANÇADAS
// ============================================================================

/**
 * Valida se um conjunto de lugares famosos forma uma sequência válida
 */
export const validateFamousPlacesSequence = (
  places: FamousPlace[],
  minPlaces: number = 3,
  maxPlaces: number = 20
): boolean => {
  if (places.length < minPlaces || places.length > maxPlaces) {
    return false;
  }
  
  // Verificar se todos os lugares têm coordenadas válidas
  for (const place of places) {
    if (typeof place.latitude !== 'number' || 
        typeof place.longitude !== 'number' ||
        isNaN(place.latitude) || 
        isNaN(place.longitude)) {
      return false;
    }
  }
  
  return true;
};

/**
 * Calcula estatísticas de precisão para um conjunto de cliques
 */
export const calculateFamousPlacesAccuracy = (
  clicks: Array<{ latlng: L.LatLng; timestamp: number; isCorrect: boolean; distance: number }>
): {
  totalClicks: number;
  correctClicks: number;
  accuracy: number;
  averageDistance: number;
  averageTime: number;
  consecutiveCorrect: number;
} => {
  if (clicks.length === 0) {
    return {
      totalClicks: 0,
      correctClicks: 0,
      accuracy: 0,
      averageDistance: 0,
      averageTime: 0,
      consecutiveCorrect: 0
    };
  }
  
  const correctClicks = clicks.filter(click => click.isCorrect).length;
  const accuracy = correctClicks / clicks.length;
  
  // Calcular distância média
  const totalDistance = clicks.reduce((sum, click) => sum + click.distance, 0);
  const averageDistance = totalDistance / clicks.length;
  
  // Calcular tempo médio entre cliques
  let totalTime = 0;
  for (let i = 1; i < clicks.length; i++) {
    totalTime += clicks[i].timestamp - clicks[i - 1].timestamp;
  }
  const averageTime = clicks.length > 1 ? totalTime / (clicks.length - 1) : 0;
  
  // Calcular acertos consecutivos
  let consecutiveCorrect = 0;
  let maxConsecutive = 0;
  for (const click of clicks) {
    if (click.isCorrect) {
      consecutiveCorrect++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveCorrect);
    } else {
      consecutiveCorrect = 0;
    }
  }
  
  return {
    totalClicks: clicks.length,
    correctClicks,
    accuracy,
    averageDistance,
    averageTime,
    consecutiveCorrect: maxConsecutive
  };
};

/**
 * Gera feedback baseado na precisão do clique
 */
export const generatePrecisionFeedback = (
  distance: number,
  threshold: number,
  placeName: string
): string => {
  if (distance <= threshold) {
    return `Excelente precisão! Você encontrou ${placeName}!`;
  } else if (distance <= threshold * 2) {
    return `Boa tentativa! Você está muito próximo de ${placeName}`;
  } else if (distance <= threshold * 5) {
    return `Continue tentando! Você está no caminho certo para ${placeName}`;
  } else {
    return `Você ainda está longe de ${placeName}. Continue explorando!`;
  }
};

/**
 * Valida se um lugar famoso está dentro de uma área específica
 */
export const validatePlaceInArea = (
  place: FamousPlace,
  area: { bounds: L.LatLngBounds; center: L.LatLng; radius: number }
): boolean => {
  const placeLatLng = L.latLng(place.latitude, place.longitude);
  return isPointInSearchArea(placeLatLng, area);
};

/**
 * Filtra lugares famosos por área de busca
 */
export const filterPlacesByArea = (
  places: FamousPlace[],
  area: { bounds: L.LatLngBounds; center: L.LatLng; radius: number }
): FamousPlace[] => {
  return places.filter(place => validatePlaceInArea(place, area));
};

/**
 * Ordena lugares famosos por proximidade de um ponto
 */
export const sortPlacesByProximity = (
  places: FamousPlace[],
  referencePoint: L.LatLng
): FamousPlace[] => {
  return [...places].sort((a, b) => {
    const distanceA = calculateDistance(referencePoint, L.latLng(a.latitude, a.longitude));
    const distanceB = calculateDistance(referencePoint, L.latLng(b.latitude, b.longitude));
    return distanceA - distanceB;
  });
}; 