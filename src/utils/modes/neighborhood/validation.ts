import * as L from 'leaflet';
import { NeighborhoodValidation, PolygonValidation, NeighborhoodFeature } from '../../../types/modes/neighborhood';
import {
  isPointInsidePolygon,
  calculateDistanceToBorder,
  calculateDirection,
  getDirectionText,
  findNearestElement
} from '../../shared';

/**
 * Validação de cliques para o modo de bairros usando utilitários compartilhados
 * 
 * Este arquivo foi refatorado para usar os utilitários compartilhados
 * em vez de duplicar código entre modos.
 */

// ============================================================================
// FUNÇÕES DE VALIDAÇÃO ESPECÍFICAS DO MODO BAIRROS
// ============================================================================

/**
 * Valida clique em um bairro específico
 */
export const validateNeighborhoodClick = (
  clickedPoint: L.LatLng,
  targetNeighborhood: string,
  geoJsonData: any,
  timeLeft: number
): NeighborhoodValidation => {
  // Encontrar o bairro alvo no GeoJSON
  const targetFeature = geoJsonData.features.find((feature: any) => 
    feature.properties.name === targetNeighborhood
  );
  
  if (!targetFeature) {
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
  
  if (isInside) {
    // Clique dentro do bairro - acerto perfeito
    return {
      isValid: true,
      distance: 0,
      message: `Perfeito! Você acertou o bairro ${targetNeighborhood}!`,
      score: 0, // Será calculado pelo sistema de pontuação
      isPerfect: true,
      isCorrectNeighborhood: true,
      isNearBorder: false,
      neighborhoodName: targetNeighborhood
    };
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
    
    return {
      isValid: true,
      distance: borderDistance.distance,
      message,
      score: 0, // Será calculado pelo sistema de pontuação
      isPerfect: false,
      isCorrectNeighborhood: false,
      isNearBorder,
      neighborhoodName: targetNeighborhood
    };
  }
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
        return {
          name: feature.properties.name,
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
  
  return {
    name: nearestNeighborhood.properties.name,
    distance: nearestDistance
  };
};

/**
 * Valida se um ponto está dentro de um polígono específico
 */
export const validatePolygonClick = (
  point: L.LatLng,
  polygon: L.LatLng[],
  polygonName: string
): PolygonValidation => {
  const isInside = isPointInsidePolygon(point, polygon);
  
  if (isInside) {
    return {
      isInside: true,
      distanceToBorder: 0,
      closestPoint: point,
      neighborhoodName: polygonName
    };
  } else {
    const borderDistance = calculateDistanceToBorder(point, polygon);
    return {
      isInside: false,
      distanceToBorder: borderDistance.distance,
      closestPoint: borderDistance.closestPoint,
      neighborhoodName: polygonName
    };
  }
};

/**
 * Calcula estatísticas de precisão para um conjunto de cliques
 */
export const calculateNeighborhoodAccuracy = (
  clicks: Array<{ latlng: L.LatLng; timestamp: number; isCorrect: boolean }>
): {
  totalClicks: number;
  correctClicks: number;
  accuracy: number;
  averageTime: number;
  consecutiveCorrect: number;
} => {
  if (clicks.length === 0) {
    return {
      totalClicks: 0,
      correctClicks: 0,
      accuracy: 0,
      averageTime: 0,
      consecutiveCorrect: 0
    };
  }
  
  const correctClicks = clicks.filter(click => click.isCorrect).length;
  const accuracy = correctClicks / clicks.length;
  
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
    averageTime,
    consecutiveCorrect: maxConsecutive
  };
};

// ============================================================================
// FUNÇÕES AUXILIARES ESPECÍFICAS DO MODO BAIRROS
// ============================================================================

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

/**
 * Gera dicas baseadas na distância e direção para bairros
 */
export const getNeighborhoodHints = (
  distance: number,
  direction: string,
  neighborhoodName: string
): string[] => {
  const hints: string[] = [];
  
  if (distance < 100) {
    hints.push(`Você está muito próximo do bairro ${neighborhoodName}!`);
    hints.push(`Continue procurando na área!`);
  } else if (distance < 500) {
    hints.push(`Você está próximo do bairro ${neighborhoodName}`);
    hints.push(`Procure na direção ${getDirectionText(direction)}`);
  } else if (distance < 1000) {
    hints.push(`Você está a uma distância média do bairro ${neighborhoodName}`);
    hints.push(`Mova-se na direção ${getDirectionText(direction)}`);
  } else {
    hints.push(`Você está longe do bairro ${neighborhoodName}`);
    hints.push(`Comece se movendo na direção ${getDirectionText(direction)}`);
  }
  
  return hints;
};

/**
 * Valida se um conjunto de coordenadas forma um polígono válido
 */
export const validatePolygonCoordinates = (
  coordinates: number[][]
): boolean => {
  if (coordinates.length < 3) {
    return false; // Polígono precisa de pelo menos 3 pontos
  }
  
  // Verificar se as coordenadas são válidas
  for (const coord of coordinates) {
    if (coord.length !== 2 || 
        typeof coord[0] !== 'number' || 
        typeof coord[1] !== 'number' ||
        isNaN(coord[0]) || 
        isNaN(coord[1])) {
      return false;
    }
  }
  
  return true;
}; 