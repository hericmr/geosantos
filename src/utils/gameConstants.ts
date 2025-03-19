export const ROUND_TIME = 10; // 10 seconds per round
export const PHASE_TWO_TIME = 5; // 5 seconds per round in phase 2
export const TIME_BONUS = 1.5; // Time bonus for correct neighborhood
export const MAX_DISTANCE_METERS = 2000; // Maximum distance considered for scoring

export const getProgressBarColor = (timeLeft: number): string => {
  const percentage = (timeLeft / ROUND_TIME) * 100;
  if (percentage > 60) return '#00FF66';
  if (percentage > 30) return '#FFD700';
  return '#FF4444';
};

export const getFeedbackMessage = (distance: number) => {
  if (distance < 50) {
    return "Muito bem! Você já é praticamente um guia turístico de Santos!";
  } else if (distance < 100) {
    return "Parabéns! Você conhece Santos como a palma da sua mão!";
  } else if (distance < 200) {
    return "Boa! Você manja dos paranauê de Santos!";
  } else if (distance < 500) {
    return "Legal! Continue explorando a cidade!";
  } else if (distance < 1000) {
    return "Quase lá! Tente se aproximar mais do bairro.";
  } else {
    return "Tá mais perdido que turista na feira do Gonzaga!";
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
