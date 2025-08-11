import * as L from 'leaflet';
import { NeighborhoodValidation, PolygonValidation, NeighborhoodFeature } from '../../../types/modes/neighborhood';

// Função para verificar se um ponto está dentro de um polígono
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

// Função para calcular a distância até a borda mais próxima do polígono
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

// Função para calcular distância de um ponto até um segmento de linha
const pointToSegmentDistance = (point: L.LatLng, start: L.LatLng, end: L.LatLng): number => {
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

// Função para obter o ponto mais próximo em um segmento de linha
const getClosestPointOnSegment = (point: L.LatLng, start: L.LatLng, end: L.LatLng): L.LatLng => {
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

// Função para validar clique em um bairro específico
export const validateNeighborhoodClick = (
  clickedPoint: L.LatLng,
  targetNeighborhood: string,
  geoJsonData: any,
  timeLeft: number
): NeighborhoodValidation => {
  // Encontrar o feature do bairro alvo
  const targetFeature = geoJsonData.features.find((feature: NeighborhoodFeature) => 
    feature.properties.NOME === targetNeighborhood
  );
  
  if (!targetFeature) {
    return {
      isValid: false,
      distance: 0,
      message: 'Bairro não encontrado',
      score: 0,
      isPerfect: false,
      isCorrectNeighborhood: false,
      neighborhoodName: targetNeighborhood,
      isNearBorder: false
    };
  }
  
  // Converter coordenadas para LatLng
  const coordinates = targetFeature.geometry.coordinates;
  let polygon: L.LatLng[] = [];
  
  if (targetFeature.geometry.type === 'Polygon') {
    polygon = (coordinates[0] as number[][]).map((coord: number[]) => L.latLng(coord[1], coord[0]));
  } else if (targetFeature.geometry.type === 'MultiPolygon') {
    // Para MultiPolygon, usar o primeiro polígono
    polygon = (coordinates[0][0] as number[][]).map((coord: number[]) => L.latLng(coord[1], coord[0]));
  }
  
  // Verificar se o clique está dentro do polígono
  const isInside = isPointInsidePolygon(clickedPoint, polygon);
  
  if (isInside) {
    // Clique dentro do bairro correto
    return {
      isValid: true,
      distance: 0,
      message: `Perfeito! Você acertou o bairro ${targetNeighborhood}!`,
      score: 3000, // Pontuação base para acerto
      isPerfect: true,
      isCorrectNeighborhood: true,
      neighborhoodName: targetNeighborhood,
      isNearBorder: false
    };
  } else {
    // Clique fora do bairro - calcular distância até a borda
    const borderInfo = calculateDistanceToBorder(clickedPoint, polygon);
    const distance = borderInfo.distance;
    const isNearBorder = distance <= 500; // Considerar "próximo" se estiver a 500m ou menos
    
    // Calcular pontuação baseada na distância
    const distanceKm = distance / 1000;
    const distanceScore = Math.max(0, 1000 * (1 - (distanceKm / 10)));
    
    // Bônus de tempo se estiver próximo da borda
    const timeBonus = isNearBorder && timeLeft <= 2 ? Math.round((timeLeft / 2) * 500) : 0;
    const totalScore = Math.round(distanceScore + timeBonus);
    
    // Gerar mensagem baseada na distância
    let message = '';
    if (distance < 100) {
      message = 'Quase lá! Você está muito perto do bairro!';
    } else if (distance < 500) {
      message = 'Continue tentando! Você está no caminho certo!';
    } else if (distance < 1000) {
      message = 'Ainda longe, mas continue tentando!';
    } else {
      message = 'Muito longe! Tente novamente!';
    }
    
    return {
      isValid: true,
      distance: distance,
      message: message,
      score: totalScore,
      isPerfect: false,
      isCorrectNeighborhood: false,
      neighborhoodName: targetNeighborhood,
      distanceToBorder: distance,
      isNearBorder: isNearBorder,
      additionalData: {
        closestPoint: borderInfo.closestPoint
      }
    };
  }
};

// Função para encontrar o bairro mais próximo de um ponto
export const findNearestNeighborhood = (point: L.LatLng, geoJsonData: any): { name: string; distance: number } => {
  let nearestName = '';
  let nearestDistance = Infinity;
  
  geoJsonData.features.forEach((feature: NeighborhoodFeature) => {
    const coordinates = feature.geometry.coordinates;
    let polygon: L.LatLng[] = [];
    
    if (feature.geometry.type === 'Polygon') {
      polygon = (coordinates[0] as number[][]).map((coord: number[]) => L.latLng(coord[1], coord[0]));
    } else if (feature.geometry.type === 'MultiPolygon') {
      polygon = (coordinates[0][0] as number[][]).map((coord: number[]) => L.latLng(coord[1], coord[0]));
    }
    
    const borderInfo = calculateDistanceToBorder(point, polygon);
    if (borderInfo.distance < nearestDistance) {
      nearestDistance = borderInfo.distance;
      nearestName = feature.properties.NOME;
    }
  });
  
  return {
    name: nearestName,
    distance: nearestDistance
  };
}; 