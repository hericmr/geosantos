/**
 * Índice dos utilitários compartilhados entre modos de jogo
 * 
 * Este módulo centraliza todas as funções utilitárias que eram duplicadas
 * entre os modos neighborhood e famousPlaces.
 */

// ============================================================================
// UTILITÁRIOS GEOMÉTRICOS
// ============================================================================
export {
  calculateDistance,
  pointToSegmentDistance,
  isPointInsidePolygon,
  calculateDistanceToBorder,
  getClosestPointOnSegment,
  calculateDirection,
  getDirectionText,
  findNearestElement,
  calculateSearchArea,
  isPointInSearchArea,
  calculatePrecisionBonus,
  calculateTimeBonus,
  formatScore,
  calculateScoreStats
} from './geometry';

// ============================================================================
// UTILITÁRIOS DE PONTUAÇÃO
// ============================================================================
export {
  BASE_SCORING_CONFIG,
  calculateBaseDistanceScore,
  calculatePrecisionBonus as calculatePrecisionBonusScoring,
  calculateTimeBonus as calculateTimeBonusScoring,
  calculateConsecutiveBonus,
  calculateBorderProximityBonus,
  calculateNeighborhoodScore,
  calculateFamousPlacesScore,
  calculateTotalScore,
  calculateScoreMultiplier,
  calculateScoreStats as calculateScoreStatsScoring,
  calculatePlayerRanking,
  formatScore as formatScoreScoring,
  formatTime,
  formatDistance
} from './scoring';

// ============================================================================
// UTILITÁRIOS DE VALIDAÇÃO
// ============================================================================
export type {
  BaseValidationResult,
  DistanceValidation,
  ClickValidation
} from './validation';

export {
  validateDistance,
  calculateClickPrecision,
  validateClickSequence,
  validateFamousPlaceClick,
  validateNeighborhoodClick,
  validateNeighborhoodClickForMode,
  normalizeNeighborhoodName,
  findNeighborhoodByName,
  findNearestFamousPlace,
  findNearestNeighborhood,
  getPlaceHints,
  generatePrecisionFeedback
} from './validation'; 