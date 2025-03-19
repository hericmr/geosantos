export const ROUND_TIME = 10; // 10 seconds per round
export const PHASE_TWO_TIME = 5; // 5 seconds per round in phase 2
export const TIME_BONUS = 1.5; // Time bonus for correct neighborhood
export const MAX_DISTANCE_METERS = 2000; // Maximum distance considered for scoring

// Constantes para o sistema de bônus de tempo
export const TIME_BONUS_THRESHOLDS = {
  EXCELLENT: 2000, // Pontuação excelente
  GOOD: 1500,      // Pontuação boa
  FAIR: 1000       // Pontuação razoável
};

export const TIME_BONUS_AMOUNTS = {
  EXCELLENT: 2.0,  // 2 segundos de bônus
  GOOD: 1.5,       // 1.5 segundos de bônus
  FAIR: 1.0        // 1 segundo de bônus
};

// Função para calcular o bônus de tempo baseado na pontuação
export const calculateTimeBonus = (score: number): number => {
  // Pontuação máxima possível é 1500 (1000 de distância + 500 de tempo)
  const maxScore = 1500;
  const maxBonus = 2.0; // Máximo de 2 segundos de bônus
  
  // Calcula o bônus proporcional à pontuação
  // Quanto maior a pontuação, maior o bônus
  // Pontuação mínima para receber bônus é 500
  if (score < 500) return 0;
  
  // Normaliza a pontuação entre 0 e 1, considerando 500 como mínimo
  const normalizedScore = (score - 500) / (maxScore - 500);
  
  // Calcula o bônus proporcional
  return Math.min(maxBonus, normalizedScore * maxBonus);
};

export const getProgressBarColor = (timeLeft: number, roundInitialTime: number): string => {
  const percentage = (timeLeft / roundInitialTime) * 100;
  if (percentage > 60) return '#00FF66';
  if (percentage > 30) return '#FFD700';
  return '#FF4444';
};

export const getFeedbackMessage = (distance: number): string => {
  const distanceKm = distance / 1000;
  
  if (distanceKm < 0.5) {
    return "";
  } else if (distanceKm < 1) {
    return "";
  } else if (distanceKm < 2) {
    return "";
  } else if (distanceKm < 5) {
    return "";
  } else {
    return "";
  }
};

export const FASE_1_BAIRROS = [
  // Orla
  "Gonzaga",
  "Ponta da Praia",
  "José Menino",
  "Embaré",
  "Aparecida",
  "Boqueirão",
  
  // Região Central e Histórica
  "Centro",
  "Valongo",
  "Paquetá",
  "Vila Nova",
  
  // Região Intermediária
  "Vila Mathias",
  "Campo Grande",
  "Marapé",
  "Vila Belmiro",
  "Encruzilhada",
  "Macuco",
  "Estuário",
  
  // Zona Noroeste mais conhecida
  "Rádio Clube",
  "Castelo",
  "Areia Branca",
  
  // Morros mais conhecidos
  "Morro do José Menino",
  "Morro da Nova Cintra",
  "Morro do Marapé",
  "Morro da Penha"
];
