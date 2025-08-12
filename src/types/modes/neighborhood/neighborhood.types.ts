/**
 * Tipos específicos para o modo Neighborhood (Bairros)
 * 
 * Esta interface é completamente isolada e não depende de outros modos
 */

import * as L from 'leaflet';

// Tipos base para validação
export interface NeighborhoodClickValidation {
  isValid: boolean;
  distance: number;
  message: string;
  score: number;
  isPerfect: boolean;
  isCorrectNeighborhood: boolean;
  neighborhoodName: string;
  clickedNeighborhood?: string;
  distanceToBorder?: number;
  isNearBorder: boolean;
  additionalData?: any;
}

// Tipos para cálculo de pontuação
export interface NeighborhoodScoreCalculation {
  total: number;
  distancePoints: number;
  timePoints: number;
  bonus: number;
  neighborhoodBonus: number;
  borderProximityBonus: number;
  timeAccuracyBonus: number;
}

// Tipos para estado do modo bairros
export interface NeighborhoodGameState {
  currentNeighborhood: string;
  revealedNeighborhoods: Set<string>;
  availableNeighborhoods: string[];
  roundNumber: number;
  totalRounds: number;
  roundTimeLeft: number;
  isActive: boolean;
  score: number;
  feedback: NeighborhoodClickValidation | null;
}

// Tipos para configuração do modo bairros
export interface NeighborhoodConfig {
  roundTime: number;
  maxRounds: number;
  autoAdvance: boolean;
  showDistanceCircle: boolean;
  showArrow: boolean;
  soundEffects: boolean;
  perfectScoreThreshold: number;
  timeBonusThreshold: number;
  distancePenaltyFactor: number;
}

// Tipos para dados GeoJSON de bairros
export interface NeighborhoodFeature {
  type: 'Feature';
  properties: {
    NOME: string;
    CODIGO?: string;
    AREA?: number;
    PERIMETRO?: number;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface NeighborhoodGeoJSON {
  type: 'FeatureCollection';
  features: NeighborhoodFeature[];
}

// Tipos para validação de polígonos
export interface PolygonValidation {
  isInside: boolean;
  distanceToBorder: number;
  closestPoint: L.LatLng;
  neighborhoodName: string;
}

// Tipos para feedback visual
export interface NeighborhoodVisualFeedback {
  showDistanceCircle: boolean;
  showArrow: boolean;
  arrowPath: [L.LatLng, L.LatLng] | null;
  distanceCircleCenter: L.LatLng | null;
  distanceCircleRadius: number;
  highlightNeighborhood: boolean;
  neighborhoodColor: string;
  // CORREÇÃO: Timestamp para controlar quando o destaque foi ativado
  highlightStartTime?: number;
}

// Interface para o hook do modo neighborhood
export interface NeighborhoodGameHook {
  // Estados
  gameState: NeighborhoodGameState;
  visualFeedback: NeighborhoodVisualFeedback;
  
  // Métodos de controle
  startGame(): void;
  pauseGame(): void;
  resumeGame(): void;
  endGame(): void;
  
  // Métodos de jogo
  handleMapClick(latlng: L.LatLng): void;
  updateTimer(timeLeft: number): void;
  startNewRound(): void;
  selectRandomNeighborhood(): void;
  
  // Métodos de consulta
  getCurrentState(): NeighborhoodGameState;
  getVisualFeedback(): NeighborhoodVisualFeedback;
  
  // Métodos de configuração
  updateConfig(config: Partial<NeighborhoodConfig>): void;
}

// Interface para o componente do modo neighborhood
export interface NeighborhoodModeComponent {
  // Props
  geoJsonData: NeighborhoodGeoJSON | null;
  onStateChange: (state: Partial<NeighborhoodGameState>) => void;
  onFeedback: (feedback: NeighborhoodClickValidation) => void;
  onRoundComplete: () => void;
  config?: Partial<NeighborhoodConfig>;
  
  // Estados internos
  gameState: NeighborhoodGameState;
  visualFeedback: NeighborhoodVisualFeedback;
  
  // Métodos
  selectRandomNeighborhood(): void;
  startNewRound(): void;
  handleMapClick(latlng: L.LatLng): void;
  updateTimer(timeLeft: number): void;
} 