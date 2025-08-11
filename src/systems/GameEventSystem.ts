/**
 * Sistema de eventos para comunicação entre modos de jogo
 * 
 * Este sistema permite que os modos se comuniquem através de eventos
 * sem conhecer os detalhes de implementação uns dos outros
 */

import { GameEvent, GameEventSystem as IGameEventSystem } from '../types/modes/unified/unified.types';

export class GameEventSystem implements IGameEventSystem {
  private listeners: Map<GameEvent['type'], Set<(event: GameEvent) => void>> = new Map();
  private eventHistory: GameEvent[] = [];
  private maxHistorySize: number = 100;

  constructor() {
    console.log('[GameEventSystem] Sistema de eventos inicializado');
  }

  /**
   * Emitir um evento
   */
  emit(event: GameEvent): void {
    try {
      // Adicionar timestamp se não fornecido
      if (!event.timestamp) {
        event.timestamp = Date.now();
      }

      // Adicionar à história
      this.addToHistory(event);

      // Notificar listeners
      const eventListeners = this.listeners.get(event.type);
      if (eventListeners) {
        eventListeners.forEach(callback => {
          try {
            callback(event);
          } catch (error) {
            console.error(`[GameEventSystem] Erro no callback do evento ${event.type}:`, error);
          }
        });
      }

      // Log do evento
      console.log(`[GameEventSystem] Evento emitido:`, {
        type: event.type,
        mode: event.mode,
        timestamp: new Date(event.timestamp).toISOString(),
        data: event.data
      });
    } catch (error) {
      console.error('[GameEventSystem] Erro ao emitir evento:', error);
    }
  }

  /**
   * Escutar um tipo de evento
   */
  on(eventType: GameEvent['type'], callback: (event: GameEvent) => void): void {
    try {
      if (!this.listeners.has(eventType)) {
        this.listeners.set(eventType, new Set());
      }

      const eventListeners = this.listeners.get(eventType)!;
      eventListeners.add(callback);

      console.log(`[GameEventSystem] Listener adicionado para evento ${eventType}`);
    } catch (error) {
      console.error(`[GameEventSystem] Erro ao adicionar listener para ${eventType}:`, error);
    }
  }

  /**
   * Remover listener de um tipo de evento
   */
  off(eventType: GameEvent['type'], callback: (event: GameEvent) => void): void {
    try {
      const eventListeners = this.listeners.get(eventType);
      if (eventListeners) {
        eventListeners.delete(callback);
        
        // Remover o tipo se não houver mais listeners
        if (eventListeners.size === 0) {
          this.listeners.delete(eventType);
        }

        console.log(`[GameEventSystem] Listener removido para evento ${eventType}`);
      }
    } catch (error) {
      console.error(`[GameEventSystem] Erro ao remover listener para ${eventType}:`, error);
    }
  }

  /**
   * Limpar todos os listeners
   */
  clear(): void {
    try {
      this.listeners.clear();
      this.eventHistory = [];
      console.log('[GameEventSystem] Todos os listeners e histórico limpos');
    } catch (error) {
      console.error('[GameEventSystem] Erro ao limpar sistema:', error);
    }
  }

  /**
   * Adicionar evento à história
   */
  private addToHistory(event: GameEvent): void {
    this.eventHistory.push(event);
    
    // Manter apenas os eventos mais recentes
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Obter histórico de eventos
   */
  getEventHistory(): GameEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Obter histórico de eventos por tipo
   */
  getEventsByType(eventType: GameEvent['type']): GameEvent[] {
    return this.eventHistory.filter(event => event.type === eventType);
  }

  /**
   * Obter histórico de eventos por modo
   */
  getEventsByMode(mode: string): GameEvent[] {
    return this.eventHistory.filter(event => event.mode === mode);
  }

  /**
   * Obter estatísticas do sistema
   */
  getStats(): {
    totalListeners: number;
    eventTypes: string[];
    totalEvents: number;
    recentEvents: number;
  } {
    const totalListeners = Array.from(this.listeners.values())
      .reduce((total, set) => total + set.size, 0);

    return {
      totalListeners,
      eventTypes: Array.from(this.listeners.keys()),
      totalEvents: this.eventHistory.length,
      recentEvents: this.eventHistory.slice(-10).length
    };
  }

  /**
   * Emitir evento de início de jogo
   */
  emitGameStart(mode: string, data: any = {}): void {
    this.emit({
      type: 'gameStart',
      mode: mode as any,
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Emitir evento de pausa do jogo
   */
  emitGamePause(mode: string, data: any = {}): void {
    this.emit({
      type: 'gamePause',
      mode: mode as any,
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Emitir evento de retomada do jogo
   */
  emitGameResume(mode: string, data: any = {}): void {
    this.emit({
      type: 'gameResume',
      mode: mode as any,
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Emitir evento de fim de jogo
   */
  emitGameEnd(mode: string, data: any = {}): void {
    this.emit({
      type: 'gameEnd',
      mode: mode as any,
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Emitir evento de conclusão de rodada
   */
  emitRoundComplete(mode: string, data: any = {}): void {
    this.emit({
      type: 'roundComplete',
      mode: mode as any,
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Emitir evento de atualização de pontuação
   */
  emitScoreUpdate(mode: string, data: any = {}): void {
    this.emit({
      type: 'scoreUpdate',
      mode: mode as any,
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Emitir evento de feedback
   */
  emitFeedback(mode: string, data: any = {}): void {
    this.emit({
      type: 'feedback',
      mode: mode as any,
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Verificar se há listeners para um tipo de evento
   */
  hasListeners(eventType: GameEvent['type']): boolean {
    const eventListeners = this.listeners.get(eventType);
    return eventListeners ? eventListeners.size > 0 : false;
  }

  /**
   * Obter número de listeners para um tipo de evento
   */
  getListenerCount(eventType: GameEvent['type']): number {
    const eventListeners = this.listeners.get(eventType);
    return eventListeners ? eventListeners.size : 0;
  }

  /**
   * Destruir o sistema
   */
  destroy(): void {
    try {
      this.clear();
      console.log('[GameEventSystem] Sistema destruído');
    } catch (error) {
      console.error('[GameEventSystem] Erro ao destruir sistema:', error);
    }
  }
}

// Exportar instância singleton
export const gameEventSystem = new GameEventSystem();

// Log inicial
console.log('[GameEventSystem] Instância singleton criada'); 