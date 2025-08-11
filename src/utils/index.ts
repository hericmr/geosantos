/**
 * Índice de utilitários do jogo GeoSantos
 * Centraliza todas as exportações para facilitar importações
 */

// Sistema de timers
export { GameTimerManager } from './GameTimerManager';

// Sistema de animações
export { GameAnimationSystem, type Animation } from './GameAnimationSystem';

// Máquina de estados
export { GameStateMachine, GamePhase, type GameState } from './GameStateMachine';

// Utilitários existentes (sem conflitos)
export * from './gameUtils';
export * from './feedbackUtils';
export * from './performanceUtils';
export * from './textUtils';

// Utilitários compartilhados entre modos de jogo
export {
  // Funções geométricas únicas
  pointToSegmentDistance,
  isPointInsidePolygon,
  calculateDistanceToBorder,
  getClosestPointOnSegment,
  calculateDirection,
  getDirectionText,
  findNearestElement,
  calculateSearchArea,
  isPointInSearchArea,
  
  // Funções de pontuação únicas
  BASE_SCORING_CONFIG,
  calculateBaseDistanceScore,
  calculateConsecutiveBonus,
  calculateBorderProximityBonus,
  calculateNeighborhoodScore,
  calculateFamousPlacesScore,
  calculateTotalScore,
  calculateScoreMultiplier,
  calculatePlayerRanking,
  formatTime,
  formatDistance,
  
  // Funções de validação únicas
  validateClickSequence,
  validateFamousPlaceClick,
  validateNeighborhoodClick,
  findNearestFamousPlace,
  findNearestNeighborhood,
  getPlaceHints,
  generatePrecisionFeedback
} from './shared';

// Re-exportar tipos dos utilitários compartilhados
export type {
  BaseValidationResult,
  DistanceValidation,
  ClickValidation
} from './shared'; 