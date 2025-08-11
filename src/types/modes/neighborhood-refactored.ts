import { FeatureCollection } from 'geojson';
import * as L from 'leaflet';
import { ClickValidation, ScoreCalculation } from '../common';

// Tipos específicos para validação de bairros
export interface NeighborhoodValidation extends ClickValidation {
  isCorrectNeighborhood: boolean;
  neighborhoodName: string;
  clickedNeighborhood?: string;
  distanceToBorder?: number;
  isNearBorder: boolean;
}

// Tipos para cálculo de pontuação de bairros
export interface NeighborhoodScoreCalculation extends ScoreCalculation {
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
  feedback: NeighborhoodValidation | null;
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
} 