import { FamousPlacesScoreCalculation } from '../../../types/modes/famousPlaces';
import {
  calculateFamousPlacesScore,
  calculateTotalScore,
  calculateScoreMultiplier,
  calculateScoreStats,
  calculatePlayerRanking,
  formatScore,
  formatTime,
  formatDistance
} from '../../shared';

/**
 * Sistema de pontuação para o modo de lugares famosos usando utilitários compartilhados
 * 
 * Este arquivo foi refatorado para usar os utilitários compartilhados
 * em vez de duplicar código entre modos.
 */

// ============================================================================
// FUNÇÕES DE PONTUAÇÃO ESPECÍFICAS DO MODO LUGARES FAMOSOS
// ============================================================================

/**
 * Calcula pontuação para modo de lugares famosos
 */
export const calculateFamousPlacesScoreRefactored = (
  distance: number,
  timeLeft: number,
  precision: number = 0,
  consecutiveCorrect: number = 0
): FamousPlacesScoreCalculation => {
  return calculateFamousPlacesScore(distance, timeLeft, precision, consecutiveCorrect);
};

/**
 * Calcula pontuação total com fatores adicionais
 */
export const calculateTotalFamousPlacesScore = (
  distance: number,
  timeLeft: number,
  precision: number = 0,
  consecutiveCorrect: number = 0,
  additionalFactors: {
    difficulty?: 'easy' | 'medium' | 'hard';
    specialBonus?: boolean;
    placeType?: 'monument' | 'museum' | 'park' | 'beach' | 'other';
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  } = {}
): number => {
  const baseScore = calculateFamousPlacesScore(distance, timeLeft, precision, consecutiveCorrect).total;
  return calculateTotalScore(baseScore, {
    consecutiveCorrect,
    ...additionalFactors
  });
};

/**
 * Calcula multiplicador de pontuação baseado em performance
 */
export const calculateFamousPlacesScoreMultiplier = (
  consecutiveCorrect: number,
  averageAccuracy: number,
  totalPlaces: number
): number => {
  return calculateScoreMultiplier(consecutiveCorrect, averageAccuracy, totalPlaces);
};

/**
 * Calcula estatísticas de pontuação para lugares famosos
 */
export const calculateFamousPlacesScoreStats = (scores: number[]): {
  total: number;
  average: number;
  highest: number;
  lowest: number;
  count: number;
  perfectScores: number;
  averageAccuracy: number;
} => {
  const baseStats = calculateScoreStats(scores);
  
  // Calcular acertos perfeitos (pontuação >= 2000)
  const perfectScores = scores.filter(score => score >= 2000).length;
  
  // Calcular precisão média baseada na pontuação
  const averageAccuracy = baseStats.average / 2000; // Normalizar para 0-1
  
  return {
    ...baseStats,
    perfectScores,
    averageAccuracy: Math.round(averageAccuracy * 100) / 100
  };
};

/**
 * Calcula ranking de jogadores para lugares famosos
 */
export const calculateFamousPlacesPlayerRanking = (
  players: Array<{ name: string; score: number; accuracy: number; time: number; placesFound: number }>
): Array<{ 
  rank: number; 
  name: string; 
  score: number; 
  accuracy: number; 
  time: number; 
  bonus: number;
  placesFound: number;
}> => {
  return players
    .map(player => ({
      ...player,
      bonus: Math.round(player.score * 0.1) // Bônus de 10% da pontuação
    }))
    .sort((a, b) => b.score - a.score)
    .map((player, index) => ({
      ...player,
      rank: index + 1
    }));
};

/**
 * Calcula conquistas para lugares famosos
 */
export const calculateFamousPlacesAchievements = (
  totalScore: number,
  perfectPlaces: number,
  consecutiveCorrect: number,
  totalPlaces: number
): Array<{ name: string; description: string; unlocked: boolean; icon: string }> => {
  const achievements = [];
  
  // Conquista por pontuação total
  if (totalScore >= 10000) {
    achievements.push({
      name: 'Explorador Experiente',
      description: 'Alcançou 10.000 pontos',
      unlocked: true,
      icon: '🏆'
    });
  } else if (totalScore >= 5000) {
    achievements.push({
      name: 'Explorador Intermediário',
      description: 'Alcançou 5.000 pontos',
      unlocked: true,
      icon: '🥈'
    });
  } else if (totalScore >= 1000) {
    achievements.push({
      name: 'Explorador Iniciante',
      description: 'Alcançou 1.000 pontos',
      unlocked: true,
      icon: '🥉'
    });
  }
  
  // Conquista por acertos perfeitos
  if (perfectPlaces >= 10) {
    achievements.push({
      name: 'Precisão Absoluta',
      description: '10 acertos perfeitos',
      unlocked: true,
      icon: '🎯'
    });
  } else if (perfectPlaces >= 5) {
    achievements.push({
      name: 'Precisão Alta',
      description: '5 acertos perfeitos',
      unlocked: true,
      icon: '🎯'
    });
  }
  
  // Conquista por acertos consecutivos
  if (consecutiveCorrect >= 5) {
    achievements.push({
      name: 'Sequência Imparável',
      description: '5 acertos consecutivos',
      unlocked: true,
      icon: '🔥'
    });
  } else if (consecutiveCorrect >= 3) {
    achievements.push({
      name: 'Sequência Quente',
      description: '3 acertos consecutivos',
      unlocked: true,
      icon: '🔥'
    });
  }
  
  // Conquista por quantidade de lugares
  if (totalPlaces >= 20) {
    achievements.push({
      name: 'Colecionador',
      description: 'Explorou 20 lugares',
      unlocked: true,
      icon: '🗺️'
    });
  } else if (totalPlaces >= 10) {
    achievements.push({
      name: 'Viajante',
      description: 'Explorou 10 lugares',
      unlocked: true,
      icon: '🗺️'
    });
  }
  
  return achievements;
};

// ============================================================================
// FUNÇÕES DE FORMATAÇÃO ESPECÍFICAS
// ============================================================================

/**
 * Formata pontuação para exibição
 */
export const formatFamousPlacesScore = (score: number): string => {
  return formatScore(score);
};

/**
 * Formata tempo para exibição
 */
export const formatFamousPlacesTime = (seconds: number): string => {
  return formatTime(seconds);
};

/**
 * Formata distância para exibição
 */
export const formatFamousPlacesDistance = (meters: number): string => {
  return formatDistance(meters);
};

/**
 * Formata precisão para exibição
 */
export const formatPrecision = (precision: number): string => {
  return `${Math.round(precision * 100)}%`;
};

/**
 * Formata direção para exibição
 */
export const formatDirection = (direction: string): string => {
  const directionMap: Record<string, string> = {
    'north': 'Norte',
    'south': 'Sul',
    'east': 'Leste',
    'west': 'Oeste',
    'northeast': 'Nordeste',
    'northwest': 'Noroeste',
    'southeast': 'Sudeste',
    'southwest': 'Sudoeste'
  };
  
  return directionMap[direction] || direction;
};

// ============================================================================
// FUNÇÕES DE ANÁLISE DE PERFORMANCE
// ============================================================================

/**
 * Analisa performance de um jogador
 */
export const analyzeFamousPlacesPerformance = (
  scores: number[],
  times: number[],
  distances: number[]
): {
  overallScore: number;
  averageTime: number;
  averageDistance: number;
  consistency: number;
  improvement: number;
  recommendations: string[];
} => {
  if (scores.length === 0) {
    return {
      overallScore: 0,
      averageTime: 0,
      averageDistance: 0,
      consistency: 0,
      improvement: 0,
      recommendations: []
    };
  }
  
  const overallScore = scores.reduce((sum, score) => sum + score, 0);
  const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
  const averageDistance = distances.reduce((sum, distance) => sum + distance, 0) / distances.length;
  
  // Calcular consistência (desvio padrão dos scores)
  const meanScore = overallScore / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - meanScore, 2), 0) / scores.length;
  const consistency = Math.sqrt(variance);
  
  // Calcular melhoria (tendência dos scores)
  let improvement = 0;
  if (scores.length > 1) {
    const firstHalf = scores.slice(0, Math.ceil(scores.length / 2));
    const secondHalf = scores.slice(Math.ceil(scores.length / 2));
    const firstHalfAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    improvement = secondHalfAvg - firstHalfAvg;
  }
  
  // Gerar recomendações
  const recommendations: string[] = [];
  
  if (averageDistance > 500) {
    recommendations.push('Tente clicar mais próximo dos lugares famosos para melhorar sua pontuação');
  }
  
  if (averageTime > 10) {
    recommendations.push('Tente responder mais rapidamente para ganhar bônus de tempo');
  }
  
  if (consistency > 1000) {
    recommendations.push('Tente manter uma performance mais consistente entre as rodadas');
  }
  
  if (improvement < 0) {
    recommendations.push('Continue praticando para melhorar sua performance');
  }
  
  return {
    overallScore,
    averageTime,
    averageDistance,
    consistency,
    improvement,
    recommendations
  };
};

/**
 * Calcula nível de dificuldade baseado na performance
 */
export const calculateDifficultyLevel = (
  averageScore: number,
  averageTime: number,
  averageDistance: number
): 'beginner' | 'intermediate' | 'advanced' | 'expert' => {
  let points = 0;
  
  // Pontos por pontuação
  if (averageScore >= 1500) points += 3;
  else if (averageScore >= 1000) points += 2;
  else if (averageScore >= 500) points += 1;
  
  // Pontos por tempo
  if (averageTime <= 3) points += 3;
  else if (averageTime <= 6) points += 2;
  else if (averageTime <= 10) points += 1;
  
  // Pontos por precisão
  if (averageDistance <= 100) points += 3;
  else if (averageDistance <= 250) points += 2;
  else if (averageDistance <= 500) points += 1;
  
  if (points >= 8) return 'expert';
  if (points >= 6) return 'advanced';
  if (points >= 4) return 'intermediate';
  return 'beginner';
}; 