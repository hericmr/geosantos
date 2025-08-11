import { NeighborhoodScoreCalculation } from '../../../types/modes/neighborhood';
import {
  calculateNeighborhoodScore,
  calculateTotalScore,
  calculateScoreMultiplier,
  calculateScoreStats,
  calculatePlayerRanking,
  formatScore,
  formatTime,
  formatDistance
} from '../../shared';

/**
 * Sistema de pontuação para o modo de bairros usando utilitários compartilhados
 * 
 * Este arquivo foi refatorado para usar os utilitários compartilhados
 * em vez de duplicar código entre modos.
 */

// ============================================================================
// FUNÇÕES DE PONTUAÇÃO ESPECÍFICAS DO MODO BAIRROS
// ============================================================================

/**
 * Calcula pontuação para modo de bairros
 */
export const calculateNeighborhoodScoreRefactored = (
  distance: number,
  timeLeft: number,
  isCorrectNeighborhood: boolean,
  isNearBorder: boolean = false
): NeighborhoodScoreCalculation => {
  return calculateNeighborhoodScore(distance, timeLeft, isCorrectNeighborhood, isNearBorder);
};

/**
 * Calcula pontuação total com fatores adicionais
 */
export const calculateTotalNeighborhoodScore = (
  distance: number,
  timeLeft: number,
  isCorrectNeighborhood: boolean,
  isNearBorder: boolean = false,
  additionalFactors: {
    consecutiveCorrect?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    specialBonus?: boolean;
    neighborhoodType?: 'residential' | 'commercial' | 'industrial' | 'mixed';
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  } = {}
): number => {
  const baseScore = calculateNeighborhoodScore(distance, timeLeft, isCorrectNeighborhood, isNearBorder).total;
  return calculateTotalScore(baseScore, {
    consecutiveCorrect: additionalFactors.consecutiveCorrect,
    difficulty: additionalFactors.difficulty,
    specialBonus: additionalFactors.specialBonus,
    timeOfDay: additionalFactors.timeOfDay
  });
};

/**
 * Calcula multiplicador de pontuação baseado em performance
 */
export const calculateNeighborhoodScoreMultiplier = (
  consecutiveCorrect: number,
  averageAccuracy: number
): number => {
  return calculateScoreMultiplier(consecutiveCorrect, averageAccuracy);
};

/**
 * Calcula estatísticas de pontuação para bairros
 */
export const calculateNeighborhoodScoreStats = (scores: number[]): {
  total: number;
  average: number;
  highest: number;
  lowest: number;
  count: number;
  perfectScores: number;
  averageAccuracy: number;
} => {
  const baseStats = calculateScoreStats(scores);
  
  // Calcular acertos perfeitos (pontuação >= 3000)
  const perfectScores = scores.filter(score => score >= 3000).length;
  
  // Calcular precisão média baseada na pontuação
  const averageAccuracy = baseStats.average / 3000; // Normalizar para 0-1
  
  return {
    ...baseStats,
    perfectScores,
    averageAccuracy: Math.round(averageAccuracy * 100) / 100
  };
};

/**
 * Calcula ranking de jogadores para bairros
 */
export const calculateNeighborhoodPlayerRanking = (
  players: Array<{ name: string; score: number; accuracy: number; time: number; neighborhoodsFound: number }>
): Array<{ 
  rank: number; 
  name: string; 
  score: number; 
  accuracy: number; 
  time: number; 
  bonus: number;
  neighborhoodsFound: number;
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
 * Calcula conquistas para bairros
 */
export const calculateNeighborhoodAchievements = (
  totalScore: number,
  perfectNeighborhoods: number,
  consecutiveCorrect: number,
  totalNeighborhoods: number
): Array<{ name: string; description: string; unlocked: boolean; icon: string }> => {
  const achievements = [];
  
  // Conquista por pontuação total
  if (totalScore >= 15000) {
    achievements.push({
      name: 'Conhecedor da Cidade',
      description: 'Alcançou 15.000 pontos',
      unlocked: true,
      icon: '🏆'
    });
  } else if (totalScore >= 10000) {
    achievements.push({
      name: 'Morador Experiente',
      description: 'Alcançou 10.000 pontos',
      unlocked: true,
      icon: '🥈'
    });
  } else if (totalScore >= 5000) {
    achievements.push({
      name: 'Morador Intermediário',
      description: 'Alcançou 5.000 pontos',
      unlocked: true,
      icon: '🥉'
    });
  }
  
  // Conquista por acertos perfeitos
  if (perfectNeighborhoods >= 15) {
    achievements.push({
      name: 'Mestre dos Bairros',
      description: '15 acertos perfeitos',
      unlocked: true,
      icon: '🎯'
    });
  } else if (perfectNeighborhoods >= 10) {
    achievements.push({
      name: 'Especialista Local',
      description: '10 acertos perfeitos',
      unlocked: true,
      icon: '🎯'
    });
  } else if (perfectNeighborhoods >= 5) {
    achievements.push({
      name: 'Conhecedor Local',
      description: '5 acertos perfeitos',
      unlocked: true,
      icon: '🎯'
    });
  }
  
  // Conquista por acertos consecutivos
  if (consecutiveCorrect >= 5) {
    achievements.push({
      name: 'Sequência Perfeita',
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
  
  // Conquista por quantidade de bairros
  if (totalNeighborhoods >= 30) {
    achievements.push({
      name: 'Explorador Urbano',
      description: 'Explorou 30 bairros',
      unlocked: true,
      icon: '🗺️'
    });
  } else if (totalNeighborhoods >= 20) {
    achievements.push({
      name: 'Viajante Urbano',
      description: 'Explorou 20 bairros',
      unlocked: true,
      icon: '🗺️'
    });
  } else if (totalNeighborhoods >= 10) {
    achievements.push({
      name: 'Morador Ativo',
      description: 'Explorou 10 bairros',
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
export const formatNeighborhoodScore = (score: number): string => {
  return formatScore(score);
};

/**
 * Formata tempo para exibição
 */
export const formatNeighborhoodTime = (seconds: number): string => {
  return formatTime(seconds);
};

/**
 * Formata distância para exibição
 */
export const formatNeighborhoodDistance = (meters: number): string => {
  return formatDistance(meters);
};

/**
 * Formata precisão para exibição
 */
export const formatNeighborhoodPrecision = (precision: number): string => {
  return `${Math.round(precision * 100)}%`;
};

/**
 * Formata direção para exibição
 */
export const formatNeighborhoodDirection = (direction: string): string => {
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
 * Analisa performance de um jogador no modo bairros
 */
export const analyzeNeighborhoodPerformance = (
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
  
  if (averageDistance > 1000) {
    recommendations.push('Tente clicar mais próximo dos bairros para melhorar sua pontuação');
  }
  
  if (averageTime > 5) {
    recommendations.push('Tente responder mais rapidamente para ganhar bônus de tempo');
  }
  
  if (consistency > 1500) {
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
export const calculateNeighborhoodDifficultyLevel = (
  averageScore: number,
  averageTime: number,
  averageDistance: number
): 'beginner' | 'intermediate' | 'advanced' | 'expert' => {
  let points = 0;
  
  // Pontos por pontuação
  if (averageScore >= 2000) points += 3;
  else if (averageScore >= 1500) points += 2;
  else if (averageScore >= 1000) points += 1;
  
  // Pontos por tempo
  if (averageTime <= 2) points += 3;
  else if (averageTime <= 4) points += 2;
  else if (averageTime <= 6) points += 1;
  
  // Pontos por precisão
  if (averageDistance <= 200) points += 3;
  else if (averageDistance <= 500) points += 2;
  else if (averageDistance <= 1000) points += 1;
  
  if (points >= 8) return 'expert';
  if (points >= 6) return 'advanced';
  if (points >= 4) return 'intermediate';
  return 'beginner';
};

/**
 * Calcula bônus de proximidade da borda
 */
export const calculateBorderProximityBonus = (
  distance: number,
  threshold: number = 500,
  bonus: number = 500
): number => {
  if (distance <= threshold) {
    return bonus;
  }
  return 0;
};

/**
 * Calcula bônus de tempo para modo bairros
 */
export const calculateNeighborhoodTimeBonus = (
  timeLeft: number,
  isCorrect: boolean,
  maxBonus: number = 1000
): number => {
  if (!isCorrect) return 0;
  
  if (timeLeft <= 1) {
    return maxBonus; // Muito rápido
  } else if (timeLeft <= 2) {
    return Math.round(maxBonus * 0.75); // Rápido
  } else if (timeLeft <= 3) {
    return Math.round(maxBonus * 0.5); // Moderado
  } else if (timeLeft <= 5) {
    return Math.round(maxBonus * 0.25); // Lento
  }
  
  return 0; // Muito lento
}; 