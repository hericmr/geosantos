import * as L from 'leaflet';
import { ClickValidation, ScoreCalculation } from '../common';
import { FamousPlace } from '../famousPlaces';

// Tipos específicos para validação de lugares famosos
export interface FamousPlacesValidation extends ClickValidation {
  isCorrectPlace: boolean;
  placeName: string;
  targetLatLng: L.LatLng;
  clickedLatLng: L.LatLng;
  distanceThreshold: number;
  precisionBonus: number;
}

// Tipos para cálculo de pontuação de lugares famosos
export interface FamousPlacesScoreCalculation extends ScoreCalculation {
  placeBonus: number;
  precisionBonus: number;
  timeAccuracyBonus: number;
  distancePenalty: number;
}

// Tipos para estado do modo lugares famosos
export interface FamousPlacesGameState {
  currentPlace: FamousPlace | null;
  roundPlaces: FamousPlace[];
  usedPlaces: Set<string>;
  currentRoundIndex: number;
  roundNumber: number;
  totalRounds: number;
  roundTimeLeft: number;
  isActive: boolean;
  score: number;
  feedback: FamousPlacesValidation | null;
}

// Tipos para configuração do modo lugares famosos
export interface FamousPlacesConfig {
  roundTime: number;
  maxRounds: number;
  autoAdvance: boolean;
  showDistanceCircle: boolean;
  showArrow: boolean;
  soundEffects: boolean;
  distanceThreshold: number;
  precisionBonusThreshold: number;
  timeBonusThreshold: number;
  maxPlacesPerRound: number;
}

// Tipos para rodadas de lugares famosos
export interface FamousPlacesRound {
  places: FamousPlace[];
  currentIndex: number;
  roundNumber: number;
  startTime: number;
  endTime?: number;
  score: number;
  placesFound: Set<string>;
}

// Tipos para feedback visual de lugares famosos
export interface FamousPlacesVisualFeedback {
  showDistanceCircle: boolean;
  showArrow: boolean;
  arrowPath: [L.LatLng, L.LatLng] | null;
  distanceCircleCenter: L.LatLng | null;
  distanceCircleRadius: number;
  highlightPlace: boolean;
  placeMarker: L.LatLng | null;
  showModal: boolean;
  modalPosition: 'center' | 'corner';
}

// Tipos para validação de distância
export interface DistanceValidation {
  distance: number;
  isWithinThreshold: boolean;
  threshold: number;
  precision: number;
  direction: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';
}

// Tipos para dicas e sugestões
export interface PlaceHint {
  type: 'text' | 'image' | 'audio';
  content: string;
  isVisible: boolean;
  showTime: number;
  hideTime?: number;
}

// Tipos para estatísticas do modo
export interface FamousPlacesStats {
  totalPlaces: number;
  placesFound: number;
  averageDistance: number;
  bestScore: number;
  totalRounds: number;
  averageTime: number;
  precisionBonus: number;
} 