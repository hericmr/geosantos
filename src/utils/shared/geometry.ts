import * as L from 'leaflet';

/**
 * Utilitários geométricos compartilhados entre modos de jogo
 * 
 * Este módulo contém funções que eram duplicadas entre os modos
 * neighborhood e famousPlaces, agora centralizadas para reutilização.
 */

// ============================================================================
// FUNÇÕES DE DISTÂNCIA
// ============================================================================

/**
 * Calcula a distância entre dois pontos usando a fórmula de Haversine
 */
export const calculateDistance = (point1: L.LatLng, point2: L.LatLng): number => {
  return point1.distanceTo(point2);
};

/**
 * Calcula a distância de um ponto até um segmento de linha
 */
export const pointToSegmentDistance = (point: L.LatLng, start: L.LatLng, end: L.LatLng): number => {
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
};

// ============================================================================
// FUNÇÕES DE POLÍGONO
// ============================================================================

/**
 * Verifica se um ponto está dentro de um polígono usando o algoritmo ray casting
 */
export const isPointInsidePolygon = (point: L.LatLng, polygon: L.LatLng[]): boolean => {
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
};

/**
 * Calcula a distância até a borda mais próxima do polígono
 */
export const calculateDistanceToBorder = (point: L.LatLng, polygon: L.LatLng[]): { distance: number; closestPoint: L.LatLng } => {
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
};

/**
 * Obtém o ponto mais próximo em um segmento de linha
 */
export const getClosestPointOnSegment = (point: L.LatLng, start: L.LatLng, end: L.LatLng): L.LatLng => {
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
};

// ============================================================================
// FUNÇÕES DE DIREÇÃO
// ============================================================================

/**
 * Calcula a direção do clique em relação ao alvo
 */
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

/**
 * Converte direção em texto legível
 */
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

// ============================================================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================================================

/**
 * Valida se um ponto está dentro do threshold de distância
 */
export const validateDistance = (
  clickedPoint: L.LatLng,
  targetPoint: L.LatLng,
  threshold: number = 100
): { distance: number; isWithinThreshold: boolean; threshold: number; precision: number; direction: string } => {
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

// ============================================================================
// FUNÇÕES DE BUSCA
// ============================================================================

/**
 * Encontra o elemento mais próximo de um ponto
 */
export const findNearestElement = <T extends { latitude: number; longitude: number }>(
  clickedPoint: L.LatLng,
  elements: T[],
  getName: (element: T) => string = () => 'elemento'
): { element: T; distance: number; name: string } | null => {
  if (elements.length === 0) return null;
  
  let nearestElement = elements[0];
  let nearestDistance = calculateDistance(clickedPoint, L.latLng(nearestElement.latitude, nearestElement.longitude));
  
  for (let i = 1; i < elements.length; i++) {
    const element = elements[i];
    const distance = calculateDistance(clickedPoint, L.latLng(element.latitude, element.longitude));
    
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestElement = element;
    }
  }
  
  return {
    element: nearestElement,
    distance: nearestDistance,
    name: getName(nearestElement)
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

// ============================================================================
// FUNÇÕES DE PONTUAÇÃO BASE
// ============================================================================

/**
 * Calcula bônus de precisão baseado na distância
 */
export const calculatePrecisionBonus = (distance: number, threshold: number = 100): number => {
  if (distance <= threshold) {
    const precision = 1 - (distance / threshold);
    return Math.round(precision * 1000); // Máximo de 1000 pontos
  }
  return 0;
};

/**
 * Calcula bônus de tempo baseado na precisão
 */
export const calculateTimeBonus = (timeLeft: number, isCorrect: boolean, maxBonus: number = 1000): number => {
  if (!isCorrect) return 0;
  
  if (timeLeft <= 1) {
    return maxBonus; // Muito rápido
  } else if (timeLeft <= 2) {
    return Math.round(maxBonus * 0.75); // Rápido
  } else if (timeLeft <= 3) {
    return Math.round(maxBonus * 0.5); // Moderado
  } else if (timeLeft <= 5) {
    return Math.round(maxBonus * 0.25); // Lento
  }
  
  return 0; // Muito lento
};

/**
 * Formata pontuação para exibição
 */
export const formatScore = (score: number): string => {
  return score.toLocaleString('pt-BR');
};

/**
 * Calcula estatísticas básicas de pontuação
 */
export const calculateScoreStats = (scores: number[]): {
  total: number;
  average: number;
  highest: number;
  lowest: number;
  count: number;
} => {
  if (scores.length === 0) {
    return { total: 0, average: 0, highest: 0, lowest: 0, count: 0 };
  }
  
  const total = scores.reduce((sum, score) => sum + score, 0);
  const average = total / scores.length;
  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);
  
  return {
    total,
    average: Math.round(average),
    highest,
    lowest,
    count: scores.length
  };
}; 