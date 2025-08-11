/**
 * Máquina de estados para o jogo GeoSantos
 * Gerencia transições entre estados de forma consistente
 */

export enum GamePhase {
  IDLE = 'idle',
  WAITING_CLICK = 'waiting_click',
  PROCESSING_CLICK = 'processing_click',
  SHOWING_SPRITE = 'showing_sprite',
  SHOWING_FEEDBACK = 'showing_feedback',
  TRANSITIONING = 'transitioning',
  NEXT_ROUND = 'next_round',
  GAME_OVER = 'game_over'
}

export interface GameState {
  currentPhase: GamePhase;
  phaseStartTime: number;
  phaseDuration: number;
  previousPhase: GamePhase | null;
  isTransitioning: boolean;
}

export class GameStateMachine {
  private currentState: GameState;
  private transitions: Map<GamePhase, GamePhase[]>;
  private phaseHandlers: Map<GamePhase, () => void>;
  private onPhaseChange: ((from: GamePhase, to: GamePhase) => void) | null = null;

  constructor() {
    this.currentState = {
      currentPhase: GamePhase.IDLE,
      phaseStartTime: Date.now(),
      phaseDuration: 0,
      previousPhase: null,
      isTransitioning: false
    };

    this.transitions = new Map();
    this.phaseHandlers = new Map();
    this.setupTransitions();
    this.setupPhaseHandlers();
  }

  private setupTransitions(): void {
    // Definir transições permitidas
    this.transitions.set(GamePhase.IDLE, [GamePhase.WAITING_CLICK]);
    this.transitions.set(GamePhase.WAITING_CLICK, [GamePhase.PROCESSING_CLICK]);
    this.transitions.set(GamePhase.PROCESSING_CLICK, [GamePhase.SHOWING_SPRITE]);
    this.transitions.set(GamePhase.SHOWING_SPRITE, [GamePhase.SHOWING_FEEDBACK]);
    this.transitions.set(GamePhase.SHOWING_FEEDBACK, [GamePhase.TRANSITIONING]);
    this.transitions.set(GamePhase.TRANSITIONING, [GamePhase.NEXT_ROUND, GamePhase.GAME_OVER]);
    this.transitions.set(GamePhase.NEXT_ROUND, [GamePhase.WAITING_CLICK]);
    this.transitions.set(GamePhase.GAME_OVER, [GamePhase.IDLE]);
  }

  private setupPhaseHandlers(): void {
    // Handlers para cada fase
    this.phaseHandlers.set(GamePhase.IDLE, () => {
      console.log('[GameStateMachine] Entrando em IDLE');
    });

    this.phaseHandlers.set(GamePhase.WAITING_CLICK, () => {
      console.log('[GameStateMachine] Aguardando clique do usuário');
    });

    this.phaseHandlers.set(GamePhase.PROCESSING_CLICK, () => {
      console.log('[GameStateMachine] Processando clique do usuário');
    });

    this.phaseHandlers.set(GamePhase.SHOWING_SPRITE, () => {
      console.log('[GameStateMachine] Mostrando animação de sprite');
    });

    this.phaseHandlers.set(GamePhase.SHOWING_FEEDBACK, () => {
      console.log('[GameStateMachine] Mostrando painel de feedback');
    });

    this.phaseHandlers.set(GamePhase.TRANSITIONING, () => {
      console.log('[GameStateMachine] Transicionando para próxima fase');
    });

    this.phaseHandlers.set(GamePhase.NEXT_ROUND, () => {
      console.log('[GameStateMachine] Iniciando próxima rodada');
    });

    this.phaseHandlers.set(GamePhase.GAME_OVER, () => {
      console.log('[GameStateMachine] Fim de jogo');
    });
  }

  /**
   * Transiciona para um novo estado
   */
  transitionTo(newPhase: GamePhase): boolean {
    const allowedTransitions = this.transitions.get(this.currentState.currentPhase) || [];
    
    if (allowedTransitions.includes(newPhase)) {
      const previousPhase = this.currentState.currentPhase;
      
      // Atualizar estado
      this.currentState = {
        ...this.currentState,
        previousPhase,
        currentPhase: newPhase,
        phaseStartTime: Date.now(),
        isTransitioning: true
      };

      console.log(`[GameStateMachine] Transição: ${previousPhase} → ${newPhase}`);

      // Executar handler da nova fase
      const handler = this.phaseHandlers.get(newPhase);
      if (handler) {
        handler();
      }

      // Notificar mudança de fase
      if (this.onPhaseChange) {
        this.onPhaseChange(previousPhase, newPhase);
      }

      // Marcar transição como concluída
      setTimeout(() => {
        this.currentState.isTransitioning = false;
      }, 100);

      return true;
    } else {
      console.warn(`[GameStateMachine] Transição inválida: ${this.currentState.currentPhase} → ${newPhase}`);
      return false;
    }
  }

  /**
   * Verifica se uma transição é válida
   */
  canTransitionTo(phase: GamePhase): boolean {
    const allowedTransitions = this.transitions.get(this.currentState.currentPhase) || [];
    return allowedTransitions.includes(phase);
  }

  /**
   * Retorna o estado atual
   */
  getCurrentState(): GameState {
    return { ...this.currentState };
  }

  /**
   * Retorna a fase atual
   */
  getCurrentPhase(): GamePhase {
    return this.currentState.currentPhase;
  }

  /**
   * Retorna o tempo decorrido na fase atual
   */
  getPhaseElapsedTime(): number {
    return Date.now() - this.currentState.phaseStartTime;
  }

  /**
   * Verifica se está em transição
   */
  isTransitioning(): boolean {
    return this.currentState.isTransitioning;
  }

  /**
   * Define callback para mudanças de fase
   */
  onPhaseChangeCallback(callback: (from: GamePhase, to: GamePhase) => void): void {
    this.onPhaseChange = callback;
  }

  /**
   * Força transição para um estado (ignora validações)
   */
  forceTransitionTo(phase: GamePhase): void {
    const previousPhase = this.currentState.currentPhase;
    
    this.currentState = {
      ...this.currentState,
      previousPhase,
      currentPhase: phase,
      phaseStartTime: Date.now(),
      isTransitioning: false
    };

    console.log(`[GameStateMachine] Transição forçada: ${previousPhase} → ${phase}`);

    if (this.onPhaseChange) {
      this.onPhaseChange(previousPhase, phase);
    }
  }

  /**
   * Reseta a máquina de estados
   */
  reset(): void {
    this.currentState = {
      currentPhase: GamePhase.IDLE,
      phaseStartTime: Date.now(),
      phaseDuration: 0,
      previousPhase: null,
      isTransitioning: false
    };
    
    console.log('[GameStateMachine] Estado resetado para IDLE');
  }

  /**
   * Retorna todas as transições possíveis do estado atual
   */
  getPossibleTransitions(): GamePhase[] {
    return this.transitions.get(this.currentState.currentPhase) || [];
  }
} 