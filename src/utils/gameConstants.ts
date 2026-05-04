import { GameMode } from '../types/famousPlaces';

export const INITIAL_TIME = 15; // Tempo total inicial do jogo
export const ROUND_TIME = 15; // 15 seconds per round
export const PHASE_TWO_TIME = 8; // 8 seconds per round in phase 2
export const TIME_BONUS = 1.5; // Time bonus for correct neighborhood
export const MAX_DISTANCE_METERS = 2000; // Maximum distance considered for scoring

// Scoring constants
export const SCORE_CORRECT_BASE = 1000;       // Pontos mínimos por acertar o bairro
export const SCORE_CORRECT_TIME_BONUS = 2000; // Bônus máximo de tempo (acerto)
export const SCORE_NEAR_BORDER_BASE = 600;    // Pontos mínimos por clique na borda
export const SCORE_NEAR_BORDER_TIME_BONUS = 1400; // Bônus máximo de tempo (borda)
export const SCORE_FAMOUS_PLACE_BASE = 1000;  // Pontos mínimos por acertar lugar famoso
export const SCORE_FAMOUS_PLACE_TIME_BONUS = 2000; // Bônus máximo de tempo (lugar famoso)
export const FAMOUS_PLACE_HIT_RADIUS_KM = 0.3; // Raio de acerto: 300m
export const STREAK_MULTIPLIER_PER_LEVEL = 0.1; // +10% por acerto consecutivo
export const MAX_STREAK_LEVELS = 5;             // Máximo de 5 níveis (+50%)

// Constantes para o sistema de bônus de tempo
export const TIME_BONUS_THRESHOLDS = {
  PERFECT: 3000,    // Acerto perfeito (clique no bairro)
  EXCELLENT: 2000,  // Pontuação excelente
  GREAT: 1750,      // Pontuação ótima
  GOOD: 1500,       // Pontuação boa
  DECENT: 1250,     // Pontuação decente
  FAIR: 1000,       // Pontuação razoável
  CLOSE: 750        // Pontuação próxima
};

export const TIME_BONUS_AMOUNTS = {
  PERFECT: 4.0,     // 4 segundos de bônus para acerto perfeito (mais fácil)
  EXCELLENT: 3.5,   // 3.5 segundos de bônus
  GREAT: 3.0,       // 3 segundos de bônus
  GOOD: 2.5,        // 2.5 segundos de bônus
  DECENT: 2.0,      // 2 segundos de bônus
  FAIR: 1.5,        // 1.5 segundos de bônus
  CLOSE: 1.0        // 1 segundo de bônus
};

// Função para calcular o bônus de tempo baseado na pontuação
export const calculateTimeBonus = (score: number, gameMode: 'neighborhoods' | 'famous_places' = 'neighborhoods'): number => {
  if (score <= 0) return 0;

  const maxBonus = gameMode === 'famous_places' ? 5.0 : 4.0;
  const normalized = Math.min(score, 3000) / 3000;
  return parseFloat((normalized * maxBonus).toFixed(1));
};

export const getProgressBarColor = (timeLeft: number, roundInitialTime: number): string => {
  const percentage = (timeLeft / roundInitialTime) * 100;
  if (percentage > 60) return '#00FF66';
  if (percentage > 30) return '#FFD700';
  return '#FF4444';
};

export const getFeedbackMessage = (distance: number, clickTime: number = 0, consecutiveCorrect: number = 0): string => {
  const distanceKm = distance / 1000;
  
  // Mensagens para acertos perfeitos
  if (distance === 0) {
    const messages = [
      "ACERTO PERFEITO!",
      "BULLSEYE!",
      "INCRÍVEL!",
      "PERFEIÇÃO!",
      "FANTÁSTICO!"
    ];
    
    // Adicionar bônus de streak se aplicável
    if (consecutiveCorrect >= 3) {
      return `${messages[Math.floor(Math.random() * messages.length)]} ${consecutiveCorrect} acertos seguidos!`;
    }
    
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  // Mensagens para acertos muito próximos
  if (distanceKm < 0.5) {
    const messages = [
      "QUASE PERFEITO!",
      "INCRÍVEL!",
      "EXCELENTE!",
      "FANTÁSTICO!",
      "IMPRESSIONANTE!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  // Mensagens para acertos bons
  if (distanceKm < 1) {
    const messages = [
      "MUITO BOM!",
      "EXCELENTE!",
      "ÓTIMO!",
      "FANTÁSTICO!",
      "IMPRESSIONANTE!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  // Mensagens para acertos razoáveis
  if (distanceKm < 2) {
    const messages = [
      "BOM!",
      "LEGAL!",
      "OK!",
      "ACEITÁVEL!",
      "RAZOÁVEL!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  // Mensagens para acertos distantes
  if (distanceKm < 5) {
    const messages = [
      "QUASE LÁ!",
      "HMMM!",
      "OPS!",
      "QUASE!",
      "TENTE NOVAMENTE!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  // Mensagens para acertos muito distantes
  const messages = [
    "OPS!",
    "EITA!",
    "UAU!",
    "VENDADO?",
    "CONFUSÃO!"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

export interface GamePhase {
  id: string;
  label: string;
  mode: GameMode;
  category: string | null;
  rounds: number;
}

export const GAME_PHASES: GamePhase[] = [
  { id: 'neighborhoods', label: 'Bairro',       mode: 'neighborhoods', category: null,                    rounds: 7 },
  { id: 'historico',     label: 'Histórico',    mode: 'famous_places', category: 'Patrimônio Histórico', rounds: 5 },
  { id: 'cultura',       label: 'Cultural',     mode: 'famous_places', category: 'Cultura',              rounds: 5 },
  { id: 'saude',         label: 'Saúde',        mode: 'famous_places', category: 'Saúde',                rounds: 7 },
  { id: 'lazer',         label: 'Lazer',        mode: 'famous_places', category: 'Lazer',                rounds: 5 },
  { id: 'educacao',      label: 'Educação',     mode: 'famous_places', category: 'Educação',             rounds: 5 },
  { id: 'religiao',      label: 'Religião',     mode: 'famous_places', category: 'Religião',             rounds: 5 },
  { id: 'assistencia',   label: 'Assistência',  mode: 'famous_places', category: 'Assistência Social',   rounds: 5 },
];

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
