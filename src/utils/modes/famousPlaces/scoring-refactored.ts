import { FamousPlacesScoreCalculation } from '../../../types/modes/famousPlaces';

// Configurações de pontuação para o modo lugares famosos
export const FAMOUS_PLACES_SCORING_CONFIG = {
  PERFECT_SCORE: 2000,           // Pontuação base para acerto perfeito
  MAX_DISTANCE_SCORE: 1500,      // Pontuação máxima baseada na distância
  PRECISION_BONUS_MAX: 1000,     // Bônus máximo por precisão
  TIME_BONUS_MAX: 1000,          // Bônus máximo de tempo
  TIME_BONUS_THRESHOLD: 5,       // Tempo limite para bônus (segundos)
  DISTANCE_PENALTY_FACTOR: 3,    // Fator de penalidade por distância (km)
  DISTANCE_THRESHOLD: 100,       // Distância para considerar acerto (metros)
  CONSECUTIVE_BONUS: 200,        // Bônus por acertos consecutivos
  MAX_CONSECUTIVE_BONUS: 1000    // Máximo de bônus por acertos consecutivos
};

// Função principal para calcular pontuação de lugares famosos
export const calculateFamousPlacesScore = (
  distance: number,
  timeLeft: number,
  precision: number = 0,
  consecutiveCorrect: number = 0
): FamousPlacesScoreCalculation => {
  let baseScore = 0;
  let placeBonus = 0;
  let precisionBonus = 0;
  let timeAccuracyBonus = 0;
  let distancePenalty = 0;

  // Verificar se acertou o lugar
  if (distance <= FAMOUS_PLACES_SCORING_CONFIG.DISTANCE_THRESHOLD) {
    // Acerto: pontuação base máxima
    baseScore = FAMOUS_PLACES_SCORING_CONFIG.PERFECT_SCORE;
    placeBonus = FAMOUS_PLACES_SCORING_CONFIG.PERFECT_SCORE;
    
    // Bônus de precisão: até 1000 pontos baseado na distância
    precisionBonus = Math.round(
      (1 - (distance / FAMOUS_PLACES_SCORING_CONFIG.DISTANCE_THRESHOLD)) * 
      FAMOUS_PLACES_SCORING_CONFIG.PRECISION_BONUS_MAX
    );
    
    // Bônus de tempo: até 1000 pontos se tempo < 5s
    if (timeLeft <= FAMOUS_PLACES_SCORING_CONFIG.TIME_BONUS_THRESHOLD) {
      timeAccuracyBonus = Math.round(
        (timeLeft / FAMOUS_PLACES_SCORING_CONFIG.TIME_BONUS_THRESHOLD) * 
        FAMOUS_PLACES_SCORING_CONFIG.TIME_BONUS_MAX
      );
    }
  } else {
    // Erro: pontuação baseada na distância
    const distanceKm = distance / 1000;
    const distanceScore = Math.max(
      0, 
      FAMOUS_PLACES_SCORING_CONFIG.MAX_DISTANCE_SCORE * 
      (1 - (distanceKm / FAMOUS_PLACES_SCORING_CONFIG.DISTANCE_PENALTY_FACTOR))
    );
    
    baseScore = Math.round(distanceScore);
    distancePenalty = FAMOUS_PLACES_SCORING_CONFIG.MAX_DISTANCE_SCORE - baseScore;
    
    // Bônus de tempo reduzido para erros
    if (timeLeft <= FAMOUS_PLACES_SCORING_CONFIG.TIME_BONUS_THRESHOLD) {
      timeAccuracyBonus = Math.round(
        (timeLeft / FAMOUS_PLACES_SCORING_CONFIG.TIME_BONUS_THRESHOLD) * 
        (FAMOUS_PLACES_SCORING_CONFIG.TIME_BONUS_MAX / 2)
      );
    }
  }

  // Bônus por acertos consecutivos
  let consecutiveBonus = 0;
  if (consecutiveCorrect > 1 && distance <= FAMOUS_PLACES_SCORING_CONFIG.DISTANCE_THRESHOLD) {
    consecutiveBonus = Math.min(
      consecutiveCorrect * FAMOUS_PLACES_SCORING_CONFIG.CONSECUTIVE_BONUS,
      FAMOUS_PLACES_SCORING_CONFIG.MAX_CONSECUTIVE_BONUS
    );
  }

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

// Função para calcular bônus de precisão baseado na distância
export const calculatePrecisionBonus = (distance: number, threshold: number = 100): number => {
  if (distance <= threshold) {
    const precision = 1 - (distance / threshold);
    return Math.round(precision * FAMOUS_PLACES_SCORING_CONFIG.PRECISION_BONUS_MAX);
  }
  return 0;
};

// Função para calcular bônus de tempo baseado na precisão
export const calculateTimeBonus = (timeLeft: number, isCorrect: boolean): number => {
  if (!isCorrect) return 0;
  
  if (timeLeft <= 1) {
    return 1000; // Muito rápido
  } else if (timeLeft <= 2) {
    return 800; // Rápido
  } else if (timeLeft <= 3) {
    return 600; // Moderado
  } else if (timeLeft <= 5) {
    return 400; // Lento
  }
  return 0; // Muito lento
};

// Função para calcular pontuação total com todos os bônus
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
  // Pontuação base
  const baseCalculation = calculateFamousPlacesScore(
    distance, 
    timeLeft, 
    precision, 
    consecutiveCorrect
  );
  
  let totalScore = baseCalculation.total;
  
  // Bônus por dificuldade
  if (additionalFactors.difficulty) {
    switch (additionalFactors.difficulty) {
      case 'hard':
        totalScore += 500;
        break;
      case 'medium':
        totalScore += 250;
        break;
      case 'easy':
        totalScore += 100;
        break;
    }
  }
  
  // Bônus por tipo de lugar
  if (additionalFactors.placeType) {
    switch (additionalFactors.placeType) {
      case 'monument':
        totalScore += 300;
        break;
      case 'museum':
        totalScore += 250;
        break;
      case 'park':
        totalScore += 200;
        break;
      case 'beach':
        totalScore += 150;
        break;
      default:
        totalScore += 100;
    }
  }
  
  // Bônus por horário do dia
  if (additionalFactors.timeOfDay) {
    switch (additionalFactors.timeOfDay) {
      case 'morning':
        totalScore += 100;
        break;
      case 'afternoon':
        totalScore += 50;
        break;
      case 'evening':
        totalScore += 150;
        break;
      case 'night':
        totalScore += 200;
        break;
    }
  }
  
  // Bônus especial (eventos, conquistas, etc.)
  if (additionalFactors.specialBonus) {
    totalScore += 1000;
  }
  
  return Math.round(totalScore);
};

// Função para calcular multiplicador de pontuação baseado no desempenho
export const calculateScoreMultiplier = (
  consecutiveCorrect: number,
  averageAccuracy: number,
  totalPlaces: number
): number => {
  let multiplier = 1.0;
  
  // Multiplicador por acertos consecutivos
  if (consecutiveCorrect >= 10) {
    multiplier += 1.0; // +100%
  } else if (consecutiveCorrect >= 7) {
    multiplier += 0.75; // +75%
  } else if (consecutiveCorrect >= 5) {
    multiplier += 0.5; // +50%
  } else if (consecutiveCorrect >= 3) {
    multiplier += 0.25; // +25%
  } else if (consecutiveCorrect >= 2) {
    multiplier += 0.1; // +10%
  }
  
  // Multiplicador por precisão média
  if (averageAccuracy >= 0.95) {
    multiplier += 0.5; // +50%
  } else if (averageAccuracy >= 0.9) {
    multiplier += 0.3; // +30%
  } else if (averageAccuracy >= 0.8) {
    multiplier += 0.2; // +20%
  } else if (averageAccuracy >= 0.7) {
    multiplier += 0.1; // +10%
  }
  
  // Multiplicador por quantidade de lugares encontrados
  if (totalPlaces >= 20) {
    multiplier += 0.3; // +30%
  } else if (totalPlaces >= 15) {
    multiplier += 0.2; // +20%
  } else if (totalPlaces >= 10) {
    multiplier += 0.1; // +10%
  }
  
  return Math.min(multiplier, 3.0); // Máximo de 3x
};

// Função para formatar pontuação com separadores
export const formatScore = (score: number): string => {
  return score.toLocaleString('pt-BR');
};

// Função para calcular estatísticas de pontuação
export const calculateScoreStats = (scores: number[]): {
  total: number;
  average: number;
  highest: number;
  lowest: number;
  count: number;
  perfectScores: number;
  averageAccuracy: number;
} => {
  if (scores.length === 0) {
    return {
      total: 0,
      average: 0,
      highest: 0,
      lowest: 0,
      count: 0,
      perfectScores: 0,
      averageAccuracy: 0
    };
  }
  
  const total = scores.reduce((sum, score) => sum + score, 0);
  const average = total / scores.length;
  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);
  const perfectScores = scores.filter(score => score >= FAMOUS_PLACES_SCORING_CONFIG.PERFECT_SCORE).length;
  const averageAccuracy = perfectScores / scores.length;
  
  return {
    total,
    average: Math.round(average),
    highest,
    lowest,
    count: scores.length,
    perfectScores,
    averageAccuracy
  };
};

// Função para calcular ranking de jogadores
export const calculatePlayerRanking = (
  players: Array<{ name: string; score: number; accuracy: number; time: number }>
): Array<{ rank: number; name: string; score: number; accuracy: number; time: number; bonus: number }> => {
  return players
    .map(player => ({
      ...player,
      bonus: Math.round(player.score * (player.accuracy * 0.5 + (1 / player.time) * 0.5))
    }))
    .sort((a, b) => (b.score + b.bonus) - (a.score + a.bonus))
    .map((player, index) => ({
      ...player,
      rank: index + 1
    }));
};

// Função para calcular conquistas baseadas na pontuação
export const calculateAchievements = (
  totalScore: number,
  perfectPlaces: number,
  consecutiveCorrect: number,
  totalPlaces: number
): Array<{ name: string; description: string; unlocked: boolean; icon: string }> => {
  const achievements = [
    {
      name: 'Primeiro Passo',
      description: 'Encontre seu primeiro lugar famoso',
      unlocked: perfectPlaces >= 1,
      icon: '🎯'
    },
    {
      name: 'Explorador',
      description: 'Encontre 5 lugares famosos',
      unlocked: perfectPlaces >= 5,
      icon: '🗺️'
    },
    {
      name: 'Conquistador',
      description: 'Encontre 10 lugares famosos',
      unlocked: perfectPlaces >= 10,
      icon: '🏆'
    },
    {
      name: 'Mestre da Precisão',
      description: 'Acertou 3 lugares consecutivos',
      unlocked: consecutiveCorrect >= 3,
      icon: '🎯'
    },
    {
      name: 'Lenda',
      description: 'Acertou 10 lugares consecutivos',
      unlocked: consecutiveCorrect >= 10,
      icon: '👑'
    },
    {
      name: 'Pontuação Alta',
      description: 'Alcance 50.000 pontos',
      unlocked: totalScore >= 50000,
      icon: '⭐'
    },
    {
      name: 'Completista',
      description: 'Encontre todos os lugares disponíveis',
      unlocked: perfectPlaces >= totalPlaces,
      icon: '💎'
    }
  ];
  
  return achievements;
}; 