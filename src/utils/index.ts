/**
 * Índice de utilitários do jogo GeoSantos
 * Centraliza todas as exportações para facilitar importações
 */

// Sistema de timers
export { GameTimerManager } from './GameTimerManager';

// Sistema de animações
export { GameAnimationSystem, type Animation } from './GameAnimationSystem';

// Máquina de estados
export { GameStateMachine, GamePhase, type GameState } from './GameStateMachine';

// Utilitários existentes (sem conflitos)
export * from './gameUtils';
export * from './feedbackUtils';
export * from './performanceUtils';
export * from './textUtils'; 