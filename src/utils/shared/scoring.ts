/**
 * Utilitários de pontuação compartilhados entre modos de jogo
 * 
 * Este módulo contém funções de pontuação que eram duplicadas entre os modos
 * neighborhood e famousPlaces, agora centralizadas para reutilização.
 */

// ============================================================================
// CONFIGURAÇÕES DE PONTUAÇÃO
// ============================================================================

/**
 * Configurações base de pontuação para todos os modos
 */
export const BASE_SCORING_CONFIG = {
  // Pontuações base
  PERFECT_SCORE: 2000,           // Pontuação base para acerto perfeito
  MAX_DISTANCE_SCORE: 1500,      // Pontuação máxima baseada na distância
  PRECISION_BONUS_MAX: 1000,     // Bônus máximo por precisão
  TIME_BONUS_MAX: 1000,          // Bônus máximo de tempo
  TIME_BONUS_THRESHOLD: 5,       // Tempo limite para bônus (segundos)
  
  // Fatores de penalidade
  DISTANCE_PENALTY_FACTOR: 3,    // Fator de penalidade por distância (km)
  DISTANCE_THRESHOLD: 100,       // Distância para considerar acerto (metros)
  
  // Bônus especiais
  CONSECUTIVE_BONUS: 200,        // Bônus por acertos consecutivos
  MAX_CONSECUTIVE_BONUS: 1000,   // Máximo de bônus por acertos consecutivos
  
  // Bônus de proximidade
  BORDER_PROXIMITY_THRESHOLD: 500, // Distância para considerar "próximo da borda" (metros)
  BORDER_PROXIMITY_BONUS: 500    // Bônus por estar próximo da borda
};

// ============================================================================
// FUNÇÕES DE PONTUAÇÃO BASE
// ============================================================================

/**
 * Calcula pontuação base baseada na distância
 */
export const calculateBaseDistanceScore = (
  distance: number,
  maxScore: number,
  penaltyFactor: number
): number => {
  const distanceKm = distance / 1000;
  return Math.max(0, maxScore * (1 - (distanceKm / penaltyFactor)));
};

/**
 * Calcula bônus de precisão baseado na distância
 */
export const calculatePrecisionBonus = (
  distance: number, 
  threshold: number = BASE_SCORING_CONFIG.DISTANCE_THRESHOLD,
  maxBonus: number = BASE_SCORING_CONFIG.PRECISION_BONUS_MAX
): number => {
  if (distance <= threshold) {
    const precision = 1 - (distance / threshold);
    return Math.round(precision * maxBonus);
  }
  return 0;
};

/**
 * Calcula bônus de tempo baseado na precisão
 */
export const calculateTimeBonus = (
  timeLeft: number, 
  isCorrect: boolean, 
  maxBonus: number = BASE_SCORING_CONFIG.TIME_BONUS_MAX,
  threshold: number = BASE_SCORING_CONFIG.TIME_BONUS_THRESHOLD
): number => {
  if (!isCorrect) return 0;
  
  if (timeLeft <= 1) {
    return maxBonus; // Muito rápido
  } else if (timeLeft <= 2) {
    return Math.round(maxBonus * 0.75); // Rápido
  } else if (timeLeft <= 3) {
    return Math.round(maxBonus * 0.5); // Moderado
  } else if (timeLeft <= threshold) {
    return Math.round(maxBonus * 0.25); // Lento
  }
  
  return 0; // Muito lento
};

/**
 * Calcula bônus por acertos consecutivos
 */
export const calculateConsecutiveBonus = (
  consecutiveCorrect: number,
  baseBonus: number = BASE_SCORING_CONFIG.CONSECUTIVE_BONUS,
  maxBonus: number = BASE_SCORING_CONFIG.MAX_CONSECUTIVE_BONUS
): number => {
  if (consecutiveCorrect > 1) {
    return Math.min(consecutiveCorrect * baseBonus, maxBonus);
  }
  return 0;
};

/**
 * Calcula bônus de proximidade da borda
 */
export const calculateBorderProximityBonus = (
  distance: number,
  threshold: number = BASE_SCORING_CONFIG.BORDER_PROXIMITY_THRESHOLD,
  bonus: number = BASE_SCORING_CONFIG.BORDER_PROXIMITY_BONUS
): number => {
  if (distance <= threshold) {
    return bonus;
  }
  return 0;
};

// ============================================================================
// FUNÇÕES DE PONTUAÇÃO ESPECÍFICAS
// ============================================================================

/**
 * Calcula pontuação para modo de bairros
 */
export const calculateNeighborhoodScore = (
  distance: number,
  timeLeft: number,
  isCorrectNeighborhood: boolean,
  isNearBorder: boolean = false
): {
  total: number;
  distancePoints: number;
  timePoints: number;
  bonus: number;
  neighborhoodBonus: number;
  borderProximityBonus: number;
  timeAccuracyBonus: number;
} => {
  let baseScore = 0;
  let neighborhoodBonus = 0;
  let borderProximityBonus = 0;
  let timeAccuracyBonus = 0;

  if (isCorrectNeighborhood) {
    // Acerto perfeito: pontuação base máxima
    baseScore = BASE_SCORING_CONFIG.PERFECT_SCORE;
    neighborhoodBonus = BASE_SCORING_CONFIG.PERFECT_SCORE;
    
    // Bônus de tempo: até 1000 pontos se tempo < 2s
    timeAccuracyBonus = calculateTimeBonus(timeLeft, true, 1000, 2);
  } else {
    // Pontuação baseada na distância até a borda
    baseScore = Math.round(calculateBaseDistanceScore(distance, 1000, 10));
    
    // Bônus por estar próximo da borda
    if (isNearBorder) {
      borderProximityBonus = calculateBorderProximityBonus(distance, 500, 500);
      
      // Bônus de tempo adicional se estiver próximo da borda
      timeAccuracyBonus = calculateTimeBonus(timeLeft, true, 500, 2);
    }
  }

  const total = baseScore + borderProximityBonus + timeAccuracyBonus;

  return {
    total: Math.round(total),
    distancePoints: Math.round(baseScore * 0.7),
    timePoints: timeAccuracyBonus,
    bonus: neighborhoodBonus + borderProximityBonus,
    neighborhoodBonus,
    borderProximityBonus,
    timeAccuracyBonus
  };
};

/**
 * Calcula pontuação para modo de lugares famosos
 */
export const calculateFamousPlacesScore = (
  distance: number,
  timeLeft: number,
  precision: number = 0,
  consecutiveCorrect: number = 0
): {
  total: number;
  distancePoints: number;
  timePoints: number;
  bonus: number;
  placeBonus: number;
  precisionBonus: number;
  timeAccuracyBonus: number;
  distancePenalty: number;
} => {
  let baseScore = 0;
  let placeBonus = 0;
  let precisionBonus = 0;
  let timeAccuracyBonus = 0;
  let distancePenalty = 0;

  // Verificar se acertou o lugar
  if (distance <= BASE_SCORING_CONFIG.DISTANCE_THRESHOLD) {
    // Acerto: pontuação base máxima
    baseScore = BASE_SCORING_CONFIG.PERFECT_SCORE;
    placeBonus = BASE_SCORING_CONFIG.PERFECT_SCORE;
    
    // Bônus de precisão: até 1000 pontos baseado na distância
    precisionBonus = calculatePrecisionBonus(distance, BASE_SCORING_CONFIG.DISTANCE_THRESHOLD, BASE_SCORING_CONFIG.PRECISION_BONUS_MAX);
    
    // Bônus de tempo: até 1000 pontos se tempo < 5s
    timeAccuracyBonus = calculateTimeBonus(timeLeft, true, BASE_SCORING_CONFIG.TIME_BONUS_MAX, BASE_SCORING_CONFIG.TIME_BONUS_THRESHOLD);
  } else {
    // Erro: pontuação baseada na distância
    baseScore = Math.round(calculateBaseDistanceScore(distance, BASE_SCORING_CONFIG.MAX_DISTANCE_SCORE, BASE_SCORING_CONFIG.DISTANCE_PENALTY_FACTOR));
    distancePenalty = BASE_SCORING_CONFIG.MAX_DISTANCE_SCORE - baseScore;
    
    // Bônus de tempo reduzido para erros
    timeAccuracyBonus = calculateTimeBonus(timeLeft, true, BASE_SCORING_CONFIG.TIME_BONUS_MAX / 2, BASE_SCORING_CONFIG.TIME_BONUS_THRESHOLD);
  }

  // Bônus por acertos consecutivos
  const consecutiveBonus = calculateConsecutiveBonus(consecutiveCorrect);

  const total = baseScore + precisionBonus + timeAccuracyBonus + consecutiveBonus;

  return {
    total: Math.round(total),
    distancePoints: Math.round(baseScore * 0.6),
    timePoints: timeAccuracyBonus,
    bonus: placeBonus + precisionBonus + consecutiveBonus,
    placeBonus,
    precisionBonus,
    timeAccuracyBonus,
    distancePenalty
  };
};

// ============================================================================
// FUNÇÕES DE PONTUAÇÃO AVANÇADAS
// ============================================================================

/**
 * Calcula pontuação total com fatores adicionais
 */
export const calculateTotalScore = (
  baseScore: number,
  additionalFactors: {
    consecutiveCorrect?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    specialBonus?: boolean;
    placeType?: 'monument' | 'museum' | 'park' | 'beach' | 'other';
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  } = {}
): number => {
  let total = baseScore;
  
  // Bônus por acertos consecutivos
  if (additionalFactors.consecutiveCorrect && additionalFactors.consecutiveCorrect > 1) {
    total += calculateConsecutiveBonus(additionalFactors.consecutiveCorrect);
  }
  
  // Multiplicador por dificuldade
  if (additionalFactors.difficulty) {
    const difficultyMultipliers = {
      'easy': 1.0,
      'medium': 1.2,
      'hard': 1.5
    };
    total = Math.round(total * difficultyMultipliers[additionalFactors.difficulty]);
  }
  
  // Bônus especial
  if (additionalFactors.specialBonus) {
    total += 500;
  }
  
  // Bônus por tipo de lugar (apenas para lugares famosos)
  if (additionalFactors.placeType) {
    const placeTypeBonuses = {
      'monument': 200,
      'museum': 150,
      'park': 100,
      'beach': 300,
      'other': 50
    };
    total += placeTypeBonuses[additionalFactors.placeType];
  }
  
  // Bônus por horário do dia
  if (additionalFactors.timeOfDay) {
    const timeOfDayBonuses = {
      'morning': 100,
      'afternoon': 50,
      'evening': 150,
      'night': 200
    };
    total += timeOfDayBonuses[additionalFactors.timeOfDay];
  }
  
  return Math.max(0, total);
};

/**
 * Calcula multiplicador de pontuação baseado em performance
 */
export const calculateScoreMultiplier = (
  consecutiveCorrect: number,
  averageAccuracy: number,
  totalElements: number = 0
): number => {
  let multiplier = 1.0;
  
  // Multiplicador por acertos consecutivos
  if (consecutiveCorrect > 1) {
    multiplier += (consecutiveCorrect - 1) * 0.1; // +10% por acerto consecutivo
  }
  
  // Multiplicador por precisão
  if (averageAccuracy > 0.8) {
    multiplier += 0.3; // +30% para precisão alta
  } else if (averageAccuracy > 0.6) {
    multiplier += 0.2; // +20% para precisão média
  } else if (averageAccuracy > 0.4) {
    multiplier += 0.1; // +10% para precisão baixa
  }
  
  // Multiplicador por quantidade de elementos (para lugares famosos)
  if (totalElements > 0) {
    if (totalElements >= 20) {
      multiplier += 0.2; // +20% para muitos lugares
    } else if (totalElements >= 10) {
      multiplier += 0.1; // +10% para quantidade média
    }
  }
  
  return Math.min(multiplier, 3.0); // Máximo de 3x
};

// ============================================================================
// FUNÇÕES DE ESTATÍSTICAS
// ============================================================================

/**
 * Calcula estatísticas básicas de pontuação
 */
export const calculateScoreStats = (scores: number[]): {
  total: number;
  average: number;
  highest: number;
  lowest: number;
  count: number;
  perfectScores?: number;
  averageAccuracy?: number;
} => {
  if (scores.length === 0) {
    return { total: 0, average: 0, highest: 0, lowest: 0, count: 0 };
  }
  
  const total = scores.reduce((sum, score) => sum + score, 0);
  const average = total / scores.length;
  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);
  const perfectScores = scores.filter(score => score >= BASE_SCORING_CONFIG.PERFECT_SCORE).length;
  
  return {
    total,
    average: Math.round(average),
    highest,
    lowest,
    count: scores.length,
    perfectScores
  };
};

/**
 * Calcula ranking de jogadores
 */
export const calculatePlayerRanking = (
  players: Array<{ name: string; score: number; accuracy: number; time: number }>
): Array<{ rank: number; name: string; score: number; accuracy: number; time: number; bonus: number }> => {
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

// ============================================================================
// FUNÇÕES DE FORMATAÇÃO
// ============================================================================

/**
 * Formata pontuação para exibição
 */
export const formatScore = (score: number): string => {
  return score.toLocaleString('pt-BR');
};

/**
 * Formata tempo para exibição
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${remainingSeconds}s`;
};

/**
 * Formata distância para exibição
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  
  const kilometers = meters / 1000;
  return `${kilometers.toFixed(1)}km`;
}; 