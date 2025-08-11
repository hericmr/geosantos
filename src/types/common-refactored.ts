import * as L from 'leaflet';

// Tipos base para validação de cliques
export interface ClickValidation {
  isValid: boolean;
  distance: number;
  message: string;
  score: number;
  isPerfect: boolean;
  additionalData?: any;
}

// Tipos para cálculo de pontuação
export interface ScoreCalculation {
  total: number;
  distancePoints: number;
  timePoints: number;
  bonus: number;
}

// Tipos para feedback do jogo
export interface GameFeedback {
  message: string;
  score: number;
  distance: number;
  timeLeft: number;
  isCorrect: boolean;
  showDistanceCircle?: boolean;
  showArrow?: boolean;
  arrowPath?: [L.LatLng, L.LatLng];
}

// Interface base para modos de jogo
export interface GameModeInterface {
  readonly mode: string;
  validateClick(latlng: L.LatLng): ClickValidation;
  calculateScore(distance: number, timeLeft: number): ScoreCalculation;
  handleFeedback(validation: ClickValidation): void;
  advanceRound(): void;
  cleanup(): void;
}

// Tipos para configuração de modos
export interface GameModeConfig {
  roundTime: number;
  maxRounds: number;
  autoAdvance: boolean;
  showDistanceCircle: boolean;
  showArrow: boolean;
  soundEffects: boolean;
}

// Tipos para estado do jogo
export interface GameModeState {
  currentRound: number;
  totalRounds: number;
  roundTimeLeft: number;
  isActive: boolean;
  score: number;
  feedback: GameFeedback | null;
} 