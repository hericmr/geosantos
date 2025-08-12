import * as L from 'leaflet';
import { calculateDistance, calculateDirection, getDirectionText } from './geometry';

/**
 * Utilitários de validação compartilhados entre modos de jogo
 * 
 * Este módulo contém funções de validação que eram duplicadas entre os modos
 * neighborhood e famousPlaces, agora centralizadas para reutilização.
 */

// ============================================================================
// SISTEMA DE LOGGING PARA DEBUG
// ============================================================================

/**
 * Sistema de logging estruturado para debug
 * CORREÇÃO: Adicionado para rastrear problemas de validação
 */
export const gameLogger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[GAME-VALIDATION] ${message}`, data);
    }
  },
  error: (message: string, error?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[GAME-VALIDATION] ERROR: ${message}`, error);
    }
  },
  performance: (operation: string, duration: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[GAME-VALIDATION] ${operation}: ${duration}ms`);
    }
  },
  validation: (operation: string, result: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[GAME-VALIDATION] ${operation}:`, result);
    }
  }
};

// ============================================================================
// FUNÇÕES DE NORMALIZAÇÃO
// ============================================================================

/**
 * Normaliza o nome de um bairro para busca consistente no GeoJSON
 * CORREÇÃO: Padroniza diferentes formatos de propriedades
 */
export const normalizeNeighborhoodName = (feature: any): string | null => {
  if (!feature || !feature.properties) return null;
  
  // Prioridade: NOME (padrão do GeoJSON de Santos)
  if (feature.properties.NOME && typeof feature.properties.NOME === 'string') {
    return feature.properties.NOME.trim();
  }
  
  // Fallback: name (formato alternativo)
  if (feature.properties.name && typeof feature.properties.name === 'string') {
    return feature.properties.name.trim();
  }
  
  // Fallback: NOME_BAIRRO (formato alternativo)
  if (feature.properties.NOME_BAIRRO && typeof feature.properties.NOME_BAIRRO === 'string') {
    return feature.properties.NOME_BAIRRO.trim();
  }
  
  return null;
};

/**
 * Encontra um bairro no GeoJSON usando nome normalizado
 * CORREÇÃO: Busca consistente independente do formato da propriedade
 */
export const findNeighborhoodByName = (
  geoJsonData: any, 
  targetName: string
): any | null => {
  const startTime = performance.now();
  
  if (!geoJsonData || !geoJsonData.features || !Array.isArray(geoJsonData.features)) {
    gameLogger.error('findNeighborhoodByName: Dados GeoJSON inválidos', { geoJsonData, targetName });
    return null;
  }
  
  const normalizedTargetName = targetName.trim().toLowerCase();
  gameLogger.info('findNeighborhoodByName: Buscando bairro', { targetName, normalizedTargetName });
  
  const result = geoJsonData.features.find((feature: any) => {
    const normalizedFeatureName = normalizeNeighborhoodName(feature);
    return normalizedFeatureName && normalizedFeatureName.toLowerCase() === normalizedTargetName;
  }) || null;
  
  const duration = performance.now() - startTime;
  gameLogger.performance('findNeighborhoodByName', duration);
  gameLogger.validation('findNeighborhoodByName', { targetName, found: !!result, duration });
  
  return result;
};

// ============================================================================
// TIPOS DE VALIDAÇÃO COMPARTILHADOS
// ============================================================================

/**
 * Resultado base de validação
 */
export interface BaseValidationResult {
  isValid: boolean;
  distance: number;
  message: string;
  score: number;
  isPerfect: boolean;
}

/**
 * Validação de distância
 */
export interface DistanceValidation {
  distance: number;
  isWithinThreshold: boolean;
  threshold: number;
  precision: number;
  direction: string;
}

/**
 * Validação de clique
 */
export interface ClickValidation extends BaseValidationResult {
  timestamp: number;
  precision: number;
  direction: string;
}

// ============================================================================
// FUNÇÕES DE VALIDAÇÃO BASE
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
// FUNÇÕES DE VALIDAÇÃO ESPECÍFICAS
// ============================================================================

/**
 * Valida clique em um lugar famoso específico
 */
export const validateFamousPlaceClick = (
  clickedPoint: L.LatLng,
  targetPlace: { name: string; latitude: number; longitude: number },
  timeLeft: number,
  distanceThreshold: number = 100
): ClickValidation => {
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
    timestamp: Date.now(),
    precision: distanceValidation.precision,
    direction: distanceValidation.direction
  };
};

/**
 * Valida clique em um bairro específico
 */
export const validateNeighborhoodClick = (
  clickedPoint: L.LatLng,
  targetNeighborhood: string,
  geoJsonData: any,
  timeLeft: number
): ClickValidation => {
  // CORREÇÃO: Usar função de busca normalizada
  const targetFeature = findNeighborhoodByName(geoJsonData, targetNeighborhood);
  
  if (!targetFeature) {
    return {
      isValid: false,
      distance: Infinity,
      message: 'Bairro não encontrado',
      score: 0,
      isPerfect: false,
      timestamp: Date.now(),
      precision: 0,
      direction: 'unknown'
    };
  }
  
  // Verificar se o clique está dentro do polígono do bairro
  const coordinates = targetFeature.geometry.coordinates[0].map((coord: number[]) => 
    L.latLng(coord[1], coord[0])
  );
  
  const isInside = isPointInsidePolygon(clickedPoint, coordinates);
  
  if (isInside) {
    // Clique dentro do bairro - acerto perfeito
    return {
      isValid: true,
      distance: 0,
      message: `Perfeito! Você acertou o bairro ${targetNeighborhood}!`,
      score: 0, // Será calculado pelo sistema de pontuação
      isPerfect: true,
      timestamp: Date.now(),
      precision: 1.0,
      direction: 'center'
    };
  } else {
    // Clique fora do bairro - calcular distância até a borda
    const borderDistance = calculateDistanceToBorder(clickedPoint, coordinates);
    
    // Determinar direção aproximada
    const center = calculatePolygonCenter(coordinates);
    const direction = calculateDirection(clickedPoint, center);
    
    // Gerar mensagem baseada na distância
    let message = '';
    if (borderDistance.distance < 100) {
      message = `Quase lá! Você está a ${Math.round(borderDistance.distance)}m do bairro ${targetNeighborhood}`;
    } else if (borderDistance.distance < 500) {
      message = `Está próximo! Continue tentando!`;
    } else if (borderDistance.distance < 1000) {
      message = `Ainda longe, mas no caminho certo!`;
    } else {
      message = `Muito longe! Tente novamente!`;
    }
    
    return {
      isValid: true,
      distance: borderDistance.distance,
      message,
      score: 0, // Será calculado pelo sistema de pontuação
      isPerfect: false,
      timestamp: Date.now(),
      precision: 0,
      direction
    };
  }
};

/**
 * Valida clique em um bairro específico - Versão para modo Neighborhood
 * CORREÇÃO: Retorna o tipo correto NeighborhoodClickValidation
 */
export const validateNeighborhoodClickForMode = (
  clickedPoint: L.LatLng,
  targetNeighborhood: string,
  geoJsonData: any,
  timeLeft: number
): any => {
  const startTime = performance.now();
  gameLogger.info('validateNeighborhoodClickForMode: Iniciando validação', { 
    targetNeighborhood, 
    clickedPoint: { lat: clickedPoint.lat, lng: clickedPoint.lng },
    timeLeft 
  });
  
  // CORREÇÃO: Usar função de busca normalizada
  const targetFeature = findNeighborhoodByName(geoJsonData, targetNeighborhood);
  
  if (!targetFeature) {
    gameLogger.error('validateNeighborhoodClickForMode: Bairro não encontrado', { targetNeighborhood });
    return {
      isValid: false,
      distance: Infinity,
      message: 'Bairro não encontrado',
      score: 0,
      isPerfect: false,
      isCorrectNeighborhood: false,
      isNearBorder: false,
      neighborhoodName: targetNeighborhood
    };
  }
  
  // Verificar se o clique está dentro do polígono do bairro
  const coordinates = targetFeature.geometry.coordinates[0].map((coord: number[]) => 
    L.latLng(coord[1], coord[0])
  );
  
  const isInside = isPointInsidePolygon(clickedPoint, coordinates);
  gameLogger.info('validateNeighborhoodClickForMode: Verificação de polígono', { 
    isInside, 
    coordinatesCount: coordinates.length 
  });
  
  if (isInside) {
    // Clique dentro do bairro - acerto perfeito
    const result = {
      isValid: true,
      distance: 0,
      message: `Perfeito! Você acertou o bairro ${targetNeighborhood}!`,
      score: 0, // Será calculado pelo sistema de pontuação
      isPerfect: true,
      isCorrectNeighborhood: true,
      isNearBorder: false,
      neighborhoodName: targetNeighborhood
    };
    
    const duration = performance.now() - startTime;
    gameLogger.performance('validateNeighborhoodClickForMode', duration);
    gameLogger.validation('validateNeighborhoodClickForMode - ACERTO', result);
    
    return result;
  } else {
    // Clique fora do bairro - calcular distância até a borda
    const borderDistance = calculateDistanceToBorder(clickedPoint, coordinates);
    
    // Determinar direção aproximada
    const center = calculatePolygonCenter(coordinates);
    const direction = calculateDirection(clickedPoint, center);
    
    // Verificar se está próximo da borda (para bônus)
    const isNearBorder = borderDistance.distance <= 500;
    
    // Gerar mensagem baseada na distância
    let message = '';
    if (borderDistance.distance < 100) {
      message = `Quase lá! Você está a ${Math.round(borderDistance.distance)}m do bairro ${targetNeighborhood}`;
    } else if (borderDistance.distance < 500) {
      message = `Está próximo! Continue tentando!`;
    } else if (borderDistance.distance < 1000) {
      message = `Ainda longe, mas no caminho certo!`;
    } else {
      message = `Muito longe! Tente novamente!`;
    }
    
    const result = {
      isValid: true,
      distance: borderDistance.distance,
      message,
      score: 0, // Será calculado pelo sistema de pontuação
      isPerfect: false,
      isCorrectNeighborhood: false,
      isNearBorder,
      neighborhoodName: targetNeighborhood,
      additionalData: {
        closestPoint: borderDistance.closestPoint
      }
    };
    
    const duration = performance.now() - startTime;
    gameLogger.performance('validateNeighborhoodClickForMode', duration);
    gameLogger.validation('validateNeighborhoodClickForMode - ERRO', { 
      ...result, 
      borderDistance: borderDistance.distance,
      direction 
    });
    
    return result;
  }
};

// ============================================================================
// FUNÇÕES AUXILIARES DE GEOMETRIA
// ============================================================================

/**
 * Verifica se um ponto está dentro de um polígono usando o algoritmo ray casting
 */
function isPointInsidePolygon(point: L.LatLng, polygon: L.LatLng[]): boolean {
  const x = point.lng;
  const y = point.lat;
  
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    
    const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
}

/**
 * Calcula a distância até a borda mais próxima do polígono
 */
function calculateDistanceToBorder(point: L.LatLng, polygon: L.LatLng[]): { distance: number; closestPoint: L.LatLng } {
  let minDistance = Infinity;
  let closestPoint = polygon[0];
  
  // Verificar distância até cada segmento do polígono
  for (let i = 0; i < polygon.length; i++) {
    const start = polygon[i];
    const end = polygon[(i + 1) % polygon.length];
    
    const distance = pointToSegmentDistance(point, start, end);
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = getClosestPointOnSegment(point, start, end);
    }
  }
  
  return {
    distance: minDistance,
    closestPoint
  };
}

/**
 * Calcula a distância de um ponto até um segmento de linha
 */
function pointToSegmentDistance(point: L.LatLng, start: L.LatLng, end: L.LatLng): number {
  const A = point.lng - start.lng;
  const B = point.lat - start.lat;
  const C = end.lng - start.lng;
  const D = end.lat - start.lat;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) {
    // start e end são o mesmo ponto
    return Math.sqrt(A * A + B * B);
  }
  
  let param = dot / lenSq;
  
  if (param < 0) {
    // Ponto mais próximo é start
    return Math.sqrt(A * A + B * B);
  } else if (param > 1) {
    // Ponto mais próximo é end
    const E = point.lng - end.lng;
    const F = point.lat - end.lat;
    return Math.sqrt(E * E + F * F);
  } else {
    // Ponto mais próximo está no segmento
    const G = start.lng + param * C;
    const H = start.lat + param * D;
    const I = point.lng - G;
    const J = point.lat - H;
    return Math.sqrt(I * I + J * J);
  }
}

/**
 * Obtém o ponto mais próximo em um segmento de linha
 */
function getClosestPointOnSegment(point: L.LatLng, start: L.LatLng, end: L.LatLng): L.LatLng {
  const A = point.lng - start.lng;
  const B = point.lat - start.lat;
  const C = end.lng - start.lng;
  const D = end.lat - start.lat;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) {
    return start;
  }
  
  let param = dot / lenSq;
  param = Math.max(0, Math.min(1, param));
  
  return L.latLng(
    start.lat + param * D,
    start.lng + param * C
  );
}

/**
 * Calcula o centro de um polígono
 */
function calculatePolygonCenter(polygon: L.LatLng[]): L.LatLng {
  let sumLat = 0;
  let sumLng = 0;
  
  for (const point of polygon) {
    sumLat += point.lat;
    sumLng += point.lng;
  }
  
  return L.latLng(sumLat / polygon.length, sumLng / polygon.length);
}

// ============================================================================
// FUNÇÕES DE BUSCA
// ============================================================================

/**
 * Encontra o lugar famoso mais próximo de um ponto
 */
export const findNearestFamousPlace = <T extends { latitude: number; longitude: number; name: string }>(
  clickedPoint: L.LatLng,
  famousPlaces: T[]
): { place: T; distance: number } | null => {
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
 * Encontra o bairro mais próximo de um ponto
 */
export const findNearestNeighborhood = (
  point: L.LatLng, 
  geoJsonData: any
): { name: string; distance: number } | null => {
  if (!geoJsonData || !geoJsonData.features || geoJsonData.features.length === 0) {
    return null;
  }
  
  let nearestNeighborhood = geoJsonData.features[0];
  let nearestDistance = Infinity;
  
  for (const feature of geoJsonData.features) {
    if (feature.geometry.type === 'Polygon') {
      const coordinates = feature.geometry.coordinates[0].map((coord: number[]) => 
        L.latLng(coord[1], coord[0])
      );
      
      // Verificar se o ponto está dentro do polígono
      if (isPointInsidePolygon(point, coordinates)) {
        const neighborhoodName = normalizeNeighborhoodName(feature);
        return {
          name: neighborhoodName || 'Bairro Desconhecido',
          distance: 0
        };
      }
      
      // Calcular distância até a borda
      const borderDistance = calculateDistanceToBorder(point, coordinates);
      if (borderDistance.distance < nearestDistance) {
        nearestDistance = borderDistance.distance;
        nearestNeighborhood = feature;
      }
    }
  }
  
  const neighborhoodName = normalizeNeighborhoodName(nearestNeighborhood);
  return {
    name: neighborhoodName || 'Bairro Desconhecido',
    distance: nearestDistance
  };
};

// ============================================================================
// FUNÇÕES DE DICAS E FEEDBACK
// ============================================================================

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