/**
 * Interface unificada para comunicação entre modos de jogo
 * 
 * Esta interface permite que os modos se comuniquem sem conhecer
 * os detalhes de implementação uns dos outros
 */

import * as L from 'leaflet';

// Enum para tipos de modo de jogo
export enum GameModeType {
  NEIGHBORHOODS = 'neighborhoods',
  FAMOUS_PLACES = 'famous_places'
}

// Interface base para validação de cliques
export interface BaseClickValidation {
  isValid: boolean;
  distance: number;
  message: string;
  score: number;
  isPerfect: boolean;
  additionalData?: any;
}

// Interface base para cálculo de pontuação
export interface BaseScoreCalculation {
  total: number;
  distancePoints: number;
  timePoints: number;
  bonus: number;
}

// Interface base para estado do jogo
export interface BaseGameState {
  roundNumber: number;
  totalRounds: number;
  roundTimeLeft: number;
  isActive: boolean;
  score: number;
  feedback: BaseClickValidation | null;
}

// Interface base para configuração
export interface BaseGameConfig {
  roundTime: number;
  maxRounds: number;
  autoAdvance: boolean;
  showDistanceCircle: boolean;
  showArrow: boolean;
  soundEffects: boolean;
}

// Interface base para feedback visual
export interface BaseVisualFeedback {
  showDistanceCircle: boolean;
  showArrow: boolean;
  arrowPath: [L.LatLng, L.LatLng] | null;
  distanceCircleCenter: L.LatLng | null;
  distanceCircleRadius: number;
}

// Interface base para hook de jogo
export interface BaseGameHook {
  // Estados
  gameState: BaseGameState;
  visualFeedback: BaseVisualFeedback;
  
  // Métodos de controle
  startGame(): void;
  pauseGame(): void;
  resumeGame(): void;
  endGame(): void;
  
  // Métodos de jogo
  handleMapClick(latlng: L.LatLng): void;
  updateTimer(timeLeft: number): void;
  
  // Métodos de consulta
  getCurrentState(): BaseGameState;
  getVisualFeedback(): BaseVisualFeedback;
  
  // Métodos específicos do modo
  startNewRound(): void;
  selectRandomTarget(): void;
}

// Interface alternativa para hooks que não expõem estados diretamente
export interface BaseGameHookInterface {
  // Métodos de controle
  startGame(): void;
  pauseGame(): void;
  resumeGame(): void;
  endGame(): void;
  
  // Métodos de jogo
  handleMapClick(latlng: L.LatLng): void;
  updateTimer(timeLeft: number): void;
  
  // Métodos de consulta
  getCurrentState(): BaseGameState;
  getVisualFeedback(): BaseVisualFeedback;
  
  // Métodos específicos do modo
  startNewRound(): void;
  selectRandomTarget(): void;
}

// Interface para comunicação entre modos
export interface GameModeCommunication {
  // Eventos de mudança de estado
  onStateChange: (state: Partial<BaseGameState>) => void;
  onFeedback: (feedback: BaseClickValidation) => void;
  onRoundComplete: () => void;
  
  // Eventos específicos de cada modo
  onNeighborhoodChange?: (neighborhood: string) => void;
  onPlaceChange?: (place: any) => void;
  
  // Métodos de controle
  pauseCurrentMode(): void;
  resumeCurrentMode(): void;
  endCurrentMode(): void;
}

// Interface para configuração unificada
export interface UnifiedGameConfig {
  mode: GameModeType;
  neighborhood?: {
    roundTime: number;
    maxRounds: number;
    autoAdvance: boolean;
    showDistanceCircle: boolean;
    showArrow: boolean;
    soundEffects: boolean;
    perfectScoreThreshold: number;
    timeBonusThreshold: number;
    distancePenaltyFactor: number;
  };
  famousPlaces?: {
    roundTime: number;
    maxRounds: number;
    autoAdvance: boolean;
    showDistanceCircle: boolean;
    showArrow: boolean;
    soundEffects: boolean;
    distanceThreshold: number;
    precisionBonusThreshold: number;
    timeBonusThreshold: number;
    maxPlacesPerRound: number;
  };
}

// Interface para estatísticas unificadas
export interface UnifiedGameStats {
  mode: GameModeType;
  score: number;
  roundNumber: number;
  totalRounds: number;
  isActive: boolean;
  
  // Estatísticas específicas de cada modo
  neighborhoodStats?: {
    currentNeighborhood: string;
    revealedNeighborhoods: Set<string>;
  };
  famousPlacesStats?: {
    currentPlace: any;
    roundPlaces: any[];
    usedPlaces: Set<string>;
  };
}

// Interface para eventos de jogo
export interface GameEvent {
  type: 'gameStart' | 'gamePause' | 'gameResume' | 'gameEnd' | 'roundComplete' | 'scoreUpdate' | 'feedback';
  mode: GameModeType;
  data: any;
  timestamp: number;
}

// Interface para sistema de eventos
export interface GameEventSystem {
  // Emitir eventos
  emit(event: GameEvent): void;
  
  // Escutar eventos
  on(eventType: GameEvent['type'], callback: (event: GameEvent) => void): void;
  
  // Remover listener
  off(eventType: GameEvent['type'], callback: (event: GameEvent) => void): void;
  
  // Limpar todos os listeners
  clear(): void;
}

// Interface para gerenciador de modos
export interface GameModeManager {
  // Configuração
  config: UnifiedGameConfig;
  
  // Modo ativo
  activeMode: GameModeType;
  
  // Hooks dos modos
  neighborhoodHook: BaseGameHookInterface | null;
  famousPlacesHook: BaseGameHookInterface | null;
  
  // Sistema de eventos
  eventSystem: GameEventSystem;
  
  // Métodos de controle
  switchMode(mode: GameModeType): Promise<void>;
  getActiveHook(): BaseGameHookInterface | null;
  getModeStats(): UnifiedGameStats | null;
  
  // Métodos de inicialização
  initialize(): Promise<void>;
  cleanup(): void;
}

// Interface para factory de modos
export interface GameModeFactoryInterface {
  // Criar hook para modo específico
  createHook(mode: GameModeType, config: any): Promise<BaseGameHook>;
  
  // Criar componente para modo específico
  createComponent(mode: GameModeType, props: any): Promise<any>;
  
  // Carregar utilitários para modo específico
  loadUtils(mode: GameModeType): Promise<any>;
  
  // Limpar cache
  clearCache(): void;
  
  // Obter status do cache
  getCacheStatus(): { size: number; keys: string[] };
} 