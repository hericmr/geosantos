/**
 * Tipos específicos para o modo FamousPlaces (Lugares Famosos)
 * 
 * Esta interface é completamente isolada e não depende de outros modos
 */

import * as L from 'leaflet';

// Tipo para lugar famoso (isolado do tipo compartilhado)
export interface FamousPlace {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  category?: string;
  historicalInfo?: string;
  visitTips?: string;
}

// Tipos para validação de lugares famosos
export interface FamousPlacesClickValidation {
  isValid: boolean;
  distance: number;
  message: string;
  score: number;
  isPerfect: boolean;
  isCorrectPlace: boolean;
  placeName: string;
  targetLatLng: L.LatLng;
  clickedLatLng: L.LatLng;
  distanceThreshold: number;
  precisionBonus: number;
  additionalData?: any;
}

// Tipos para cálculo de pontuação de lugares famosos
export interface FamousPlacesScoreCalculation {
  total: number;
  distancePoints: number;
  timePoints: number;
  bonus: number;
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
  feedback: FamousPlacesClickValidation | null;
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

// Interface para o hook do modo famousPlaces
export interface FamousPlacesGameHook {
  // Estados
  gameState: FamousPlacesGameState;
  visualFeedback: FamousPlacesVisualFeedback;
  
  // Métodos de controle
  startGame(): void;
  pauseGame(): void;
  resumeGame(): void;
  endGame(): void;
  
  // Métodos de jogo
  handleMapClick(latlng: L.LatLng): void;
  updateTimer(timeLeft: number): void;
  startNewRound(): void;
  advanceToNextPlace(): void;
  forceNextRound(): void;
  
  // Métodos de consulta
  getCurrentState(): FamousPlacesGameState;
  getVisualFeedback(): FamousPlacesVisualFeedback;
  
  // Métodos de configuração
  updateConfig(config: Partial<FamousPlacesConfig>): void;
}

// Interface para o componente do modo famousPlaces
export interface FamousPlacesModeComponent {
  // Props
  famousPlaces: FamousPlace[];
  onStateChange: (state: Partial<FamousPlacesGameState>) => void;
  onFeedback: (feedback: FamousPlacesClickValidation) => void;
  onRoundComplete: () => void;
  onPlaceChange: (place: FamousPlace) => void;
  config?: Partial<FamousPlacesConfig>;
  
  // Estados internos
  gameState: FamousPlacesGameState;
  visualFeedback: FamousPlacesVisualFeedback;
  
  // Métodos
  generateNewRound(): void;
  selectPlaceFromRound(index: number): void;
  advanceToNextPlace(): void;
  completeCurrentRound(): void;
  handleMapClick(latlng: L.LatLng): void;
  updateTimer(timeLeft: number): void;
} 