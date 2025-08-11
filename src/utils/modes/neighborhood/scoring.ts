import { NeighborhoodScoreCalculation } from '../../../types/modes/neighborhood';

// Configurações de pontuação para o modo bairros
export const NEIGHBORHOOD_SCORING_CONFIG = {
  PERFECT_SCORE: 3000,           // Pontuação base para acerto perfeito
  MAX_DISTANCE_SCORE: 1000,      // Pontuação máxima baseada na distância
  TIME_BONUS_MAX: 1000,          // Bônus máximo de tempo
  TIME_BONUS_THRESHOLD: 2,       // Tempo limite para bônus (segundos)
  DISTANCE_PENALTY_FACTOR: 10,   // Fator de penalidade por distância (km)
  BORDER_PROXIMITY_THRESHOLD: 500, // Distância para considerar "próximo da borda" (metros)
  BORDER_PROXIMITY_BONUS: 500    // Bônus por estar próximo da borda
};

// Função principal para calcular pontuação de bairros
export const calculateNeighborhoodScore = (
  distance: number,
  timeLeft: number,
  isCorrectNeighborhood: boolean,
  isNearBorder: boolean = false
): NeighborhoodScoreCalculation => {
  let baseScore = 0;
  let neighborhoodBonus = 0;
  let borderProximityBonus = 0;
  let timeAccuracyBonus = 0;

  if (isCorrectNeighborhood) {
    // Acerto perfeito: pontuação base máxima
    baseScore = NEIGHBORHOOD_SCORING_CONFIG.PERFECT_SCORE;
    neighborhoodBonus = NEIGHBORHOOD_SCORING_CONFIG.PERFECT_SCORE;
    
    // Bônus de tempo: até 1000 pontos se tempo < 2s
    if (timeLeft <= NEIGHBORHOOD_SCORING_CONFIG.TIME_BONUS_THRESHOLD) {
      timeAccuracyBonus = Math.round(
        (timeLeft / NEIGHBORHOOD_SCORING_CONFIG.TIME_BONUS_THRESHOLD) * 
        NEIGHBORHOOD_SCORING_CONFIG.TIME_BONUS_MAX
      );
    }
  } else {
    // Pontuação baseada na distância até a borda
    const distanceKm = distance / 1000;
    const distanceScore = Math.max(
      0, 
      NEIGHBORHOOD_SCORING_CONFIG.MAX_DISTANCE_SCORE * 
      (1 - (distanceKm / NEIGHBORHOOD_SCORING_CONFIG.DISTANCE_PENALTY_FACTOR))
    );
    
    baseScore = Math.round(distanceScore);
    
    // Bônus por estar próximo da borda
    if (isNearBorder) {
      borderProximityBonus = NEIGHBORHOOD_SCORING_CONFIG.BORDER_PROXIMITY_BONUS;
      
      // Bônus de tempo adicional se estiver próximo da borda
      if (timeLeft <= NEIGHBORHOOD_SCORING_CONFIG.TIME_BONUS_THRESHOLD) {
        timeAccuracyBonus = Math.round(
          (timeLeft / NEIGHBORHOOD_SCORING_CONFIG.TIME_BONUS_THRESHOLD) * 
          (NEIGHBORHOOD_SCORING_CONFIG.TIME_BONUS_MAX / 2)
        );
      }
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

// Função para calcular bônus de precisão baseado na distância
export const calculatePrecisionBonus = (distance: number): number => {
  if (distance <= 100) {
    return 500; // Muito próximo
  } else if (distance <= 250) {
    return 300; // Próximo
  } else if (distance <= 500) {
    return 200; // Moderadamente próximo
  } else if (distance <= 1000) {
    return 100; // Longe
  }
  return 0; // Muito longe
};

// Função para calcular bônus de tempo baseado na precisão
export const calculateTimeBonus = (timeLeft: number, isCorrect: boolean): number => {
  if (!isCorrect) return 0;
  
  if (timeLeft <= 1) {
    return 1000; // Muito rápido
  } else if (timeLeft <= 2) {
    return 750; // Rápido
  } else if (timeLeft <= 3) {
    return 500; // Moderado
  } else if (timeLeft <= 5) {
    return 250; // Lento
  }
  return 0; // Muito lento
};

// Função para calcular pontuação total com todos os bônus
export const calculateTotalNeighborhoodScore = (
  distance: number,
  timeLeft: number,
  isCorrectNeighborhood: boolean,
  isNearBorder: boolean = false,
  additionalFactors: {
    consecutiveCorrect?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    specialBonus?: boolean;
  } = {}
): number => {
  // Pontuação base
  const baseCalculation = calculateNeighborhoodScore(
    distance, 
    timeLeft, 
    isCorrectNeighborhood, 
    isNearBorder
  );
  
  let totalScore = baseCalculation.total;
  
  // Bônus por acertos consecutivos
  if (additionalFactors.consecutiveCorrect && additionalFactors.consecutiveCorrect > 1) {
    const consecutiveBonus = Math.min(
      additionalFactors.consecutiveCorrect * 100, 
      1000
    );
    totalScore += consecutiveBonus;
  }
  
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
  
  // Bônus especial (eventos, conquistas, etc.)
  if (additionalFactors.specialBonus) {
    totalScore += 1000;
  }
  
  return Math.round(totalScore);
};

// Função para calcular multiplicador de pontuação baseado no desempenho
export const calculateScoreMultiplier = (
  consecutiveCorrect: number,
  averageAccuracy: number
): number => {
  let multiplier = 1.0;
  
  // Multiplicador por acertos consecutivos
  if (consecutiveCorrect >= 5) {
    multiplier += 0.5; // +50%
  } else if (consecutiveCorrect >= 3) {
    multiplier += 0.25; // +25%
  } else if (consecutiveCorrect >= 2) {
    multiplier += 0.1; // +10%
  }
  
  // Multiplicador por precisão média
  if (averageAccuracy >= 0.9) {
    multiplier += 0.3; // +30%
  } else if (averageAccuracy >= 0.7) {
    multiplier += 0.15; // +15%
  } else if (averageAccuracy >= 0.5) {
    multiplier += 0.05; // +5%
  }
  
  return Math.min(multiplier, 2.0); // Máximo de 2x
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
} => {
  if (scores.length === 0) {
    return {
      total: 0,
      average: 0,
      highest: 0,
      lowest: 0,
      count: 0
    };
  }
  
  const total = scores.reduce((sum, score) => sum + score, 0);
  const average = total / scores.length;
  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);
  
  return {
    total,
    average: Math.round(average),
    highest,
    lowest,
    count: scores.length
  };
}; 