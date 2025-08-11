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
  validateDistance,
  calculateClickPrecision,
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
  validateDistance as validateDistanceValidation,
  calculateClickPrecision as calculateClickPrecisionValidation,
  validateClickSequence,
  validateFamousPlaceClick,
  validateNeighborhoodClick,
  findNearestFamousPlace,
  findNearestNeighborhood,
  getPlaceHints,
  generatePrecisionFeedback
} from './validation';

// ============================================================================
// RE-EXPORTS PARA COMPATIBILIDADE
// ============================================================================

// Re-exportar funções comuns com nomes diferentes para evitar conflitos
export {
  calculateDistance as calculateDistanceShared,
  calculateDirection as calculateDirectionShared,
  getDirectionText as getDirectionTextShared,
  formatScore as formatScoreShared
} from './geometry'; 