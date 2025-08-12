/**
 * Gerenciador de timers para o jogo
 * CORREÇÃO: Sistema de timer unificado para evitar conflitos
 */

export interface TimerConfig {
  interval: number;
  callback: () => void;
  autoStart?: boolean;
  maxDuration?: number;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  startTime: number;
  pauseTime: number;
  totalPausedTime: number;
  duration: number;
}

export class GameTimerManager {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private timerStates: Map<string, TimerState> = new Map();
  private configs: Map<string, TimerConfig> = new Map();

  /**
   * Criar um timer com configuração específica
   * CORREÇÃO: Sistema de timer mais robusto
   */
  createTimer(
    id: string, 
    config: TimerConfig
  ): void {
    // Limpar timer existente se houver
    this.clearTimer(id);
    
    // Armazenar configuração
    this.configs.set(id, config);
    
    // Inicializar estado
    this.timerStates.set(id, {
      isRunning: false,
      isPaused: false,
      startTime: 0,
      pauseTime: 0,
      totalPausedTime: 0,
      duration: 0
    });
    
    // Iniciar automaticamente se configurado
    if (config.autoStart) {
      this.startTimer(id);
    }
  }

  /**
   * Iniciar um timer específico
   * CORREÇÃO: Controle de estado mais preciso
   */
  startTimer(id: string): boolean {
    const config = this.configs.get(id);
    const state = this.timerStates.get(id);
    
    if (!config || !state) {
      console.warn(`[GameTimerManager] Timer ${id} não encontrado`);
      return false;
    }
    
    if (state.isRunning) {
      console.warn(`[GameTimerManager] Timer ${id} já está rodando`);
      return false;
    }
    
    // Atualizar estado
    state.isRunning = true;
    state.isPaused = false;
    state.startTime = Date.now();
    state.totalPausedTime = 0;
    
    // Criar intervalo
    const interval = setInterval(() => {
      try {
        config.callback();
      } catch (error) {
        console.error(`[GameTimerManager] Erro no callback do timer ${id}:`, error);
        this.clearTimer(id);
      }
    }, config.interval);
    
    // Armazenar referência
    this.timers.set(id, interval);
    
    console.log(`[GameTimerManager] Timer ${id} iniciado`);
    return true;
  }

  /**
   * Pausar um timer específico
   * CORREÇÃO: Pausa precisa com tracking de tempo
   */
  pauseTimer(id: string): boolean {
    const state = this.timerStates.get(id);
    const timer = this.timers.get(id);
    
    if (!state || !timer) {
      return false;
    }
    
    if (!state.isRunning || state.isPaused) {
      return false;
    }
    
    // Pausar
    clearInterval(timer);
    this.timers.delete(id);
    
    // Atualizar estado
    state.isPaused = true;
    state.pauseTime = Date.now();
    state.isRunning = false;
    
    console.log(`[GameTimerManager] Timer ${id} pausado`);
    return true;
  }

  /**
   * Retomar um timer pausado
   * CORREÇÃO: Retomada com compensação de tempo pausado
   */
  resumeTimer(id: string): boolean {
    const config = this.configs.get(id);
    const state = this.timerStates.get(id);
    
    if (!config || !state) {
      return false;
    }
    
    if (!state.isPaused) {
      return false;
    }
    
    // Calcular tempo pausado
    const pauseDuration = Date.now() - state.pauseTime;
    state.totalPausedTime += pauseDuration;
    
    // Retomar
    state.isPaused = false;
    state.isRunning = true;
    
    // Criar novo intervalo
    const interval = setInterval(() => {
      try {
        config.callback();
      } catch (error) {
        console.error(`[GameTimerManager] Erro no callback do timer ${id}:`, error);
        this.clearTimer(id);
      }
    }, config.interval);
    
    this.timers.set(id, interval);
    
    console.log(`[GameTimerManager] Timer ${id} retomado`);
    return true;
  }

  /**
   * Parar e limpar um timer
   * CORREÇÃO: Limpeza completa de recursos
   */
  clearTimer(id: string): boolean {
    const timer = this.timers.get(id);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(id);
    }
    
    this.timerStates.delete(id);
    this.configs.delete(id);
    
    console.log(`[GameTimerManager] Timer ${id} limpo`);
    return true;
  }

  /**
   * Verificar se um timer está rodando
   * CORREÇÃO: Verificação de estado mais precisa
   */
  isTimerRunning(id: string): boolean {
    const state = this.timerStates.get(id);
    return state ? state.isRunning && !state.isPaused : false;
  }

  /**
   * Obter estado de um timer
   * CORREÇÃO: Estado completo do timer
   */
  getTimerState(id: string): TimerState | null {
    return this.timerStates.get(id) || null;
  }

  /**
   * Obter tempo total rodando de um timer
   * CORREÇÃO: Cálculo preciso considerando pausas
   */
  getTimerElapsedTime(id: string): number {
    const state = this.timerStates.get(id);
    if (!state) return 0;
    
    if (state.isRunning) {
      return Date.now() - state.startTime - state.totalPausedTime;
    } else if (state.isPaused) {
      return state.pauseTime - state.startTime - state.totalPausedTime;
    }
    
    return 0;
  }

  /**
   * Limpar todos os timers
   * CORREÇÃO: Limpeza completa de todos os recursos
   */
  clearAllTimers(): void {
    console.log('[GameTimerManager] Limpando todos os timers...');
    
    for (const [id, timer] of this.timers) {
      clearInterval(timer);
    }
    
    this.timers.clear();
    this.timerStates.clear();
    this.configs.clear();
    
    console.log('[GameTimerManager] Todos os timers limpos');
  }

  /**
   * Obter estatísticas dos timers
   * CORREÇÃO: Informações de debug completas
   */
  getStats(): any {
    return {
      totalTimers: this.timers.size,
      runningTimers: Array.from(this.timerStates.values()).filter(s => s.isRunning).length,
      pausedTimers: Array.from(this.timerStates.values()).filter(s => s.isPaused).length,
      timerIds: Array.from(this.timers.keys()),
      states: Object.fromEntries(this.timerStates)
    };
  }
}

// Exportar instância singleton
export const gameTimerManager = new GameTimerManager(); 