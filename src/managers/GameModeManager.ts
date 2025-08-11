/**
 * Gerenciador de modos de jogo
 * 
 * Este gerenciador coordena os diferentes modos de jogo através
 * do sistema de eventos, mantendo-os isolados
 */

import { 
  GameModeManager as IGameModeManager, 
  UnifiedGameConfig, 
  UnifiedGameStats, 
  GameModeType,
  BaseGameHookInterface 
} from '../types/modes/unified/unified.types';
import { GameModeFactory } from '../factories/GameModeFactory';
import { gameEventSystem } from '../systems/GameEventSystem';

export class GameModeManager implements IGameModeManager {
  public config: UnifiedGameConfig;
  public activeMode: GameModeType;
  public neighborhoodHook: BaseGameHookInterface | null = null;
  public famousPlacesHook: BaseGameHookInterface | null = null;
  public eventSystem = gameEventSystem;

  constructor(config: UnifiedGameConfig) {
    this.config = config;
    this.activeMode = config.mode;
    
    console.log('[GameModeManager] Gerenciador inicializado com configuração:', {
      mode: this.activeMode,
      hasNeighborhoodConfig: !!config.neighborhood,
      hasFamousPlacesConfig: !!config.famousPlaces
    });
  }

  /**
   * Inicializar o gerenciador
   */
  async initialize(): Promise<void> {
    try {
      console.log('[GameModeManager] Inicializando gerenciador...');

      // Carregar hooks para ambos os modos
      await this.loadAllHooks();

      // Configurar listeners de eventos
      this.setupEventListeners();

      console.log('[GameModeManager] Gerenciador inicializado com sucesso');
    } catch (error) {
      console.error('[GameModeManager] Erro na inicialização:', error);
      throw error;
    }
  }

  /**
   * Carregar todos os hooks
   */
  private async loadAllHooks(): Promise<void> {
    try {
      // Carregar hook de bairros
      if (this.config.neighborhood) {
        this.neighborhoodHook = await GameModeFactory.createHook('neighborhoods', this.config.neighborhood);
        console.log('[GameModeManager] Hook de bairros carregado');
      }

      // Carregar hook de lugares famosos
      if (this.config.famousPlaces) {
        this.famousPlacesHook = await GameModeFactory.createHook('famous_places', this.config.famousPlaces);
        console.log('[GameModeManager] Hook de lugares famosos carregado');
      }
    } catch (error) {
      console.error('[GameModeManager] Erro ao carregar hooks:', error);
      throw error;
    }
  }

  /**
   * Configurar listeners de eventos
   */
  private setupEventListeners(): void {
    // Listener para eventos de início de jogo
    this.eventSystem.on('gameStart', (event) => {
      console.log(`[GameModeManager] Jogo iniciado no modo ${event.mode}`);
    });

    // Listener para eventos de fim de jogo
    this.eventSystem.on('gameEnd', (event) => {
      console.log(`[GameModeManager] Jogo finalizado no modo ${event.mode}`);
    });

    // Listener para eventos de conclusão de rodada
    this.eventSystem.on('roundComplete', (event) => {
      console.log(`[GameModeManager] Rodada completada no modo ${event.mode}`);
    });

    // Listener para eventos de atualização de pontuação
    this.eventSystem.on('scoreUpdate', (event) => {
      console.log(`[GameModeManager] Pontuação atualizada no modo ${event.mode}:`, event.data);
    });

    // Listener para eventos de feedback
    this.eventSystem.on('feedback', (event) => {
      console.log(`[GameModeManager] Feedback recebido no modo ${event.mode}:`, event.data);
    });
  }

  /**
   * Trocar para um modo específico
   */
  async switchMode(mode: GameModeType): Promise<void> {
    try {
      console.log(`[GameModeManager] Trocando para modo ${mode}`);

      // Pausar modo atual se estiver ativo
      if (this.activeMode !== mode) {
        await this.pauseCurrentMode();
      }

      // Atualizar modo ativo
      this.activeMode = mode;

      // Emitir evento de mudança de modo
      this.eventSystem.emit({
        type: 'gameStart',
        mode,
        data: { previousMode: this.activeMode },
        timestamp: Date.now()
      });

      console.log(`[GameModeManager] Modo alterado para ${mode}`);
    } catch (error) {
      console.error(`[GameModeManager] Erro ao trocar para modo ${mode}:`, error);
      throw error;
    }
  }

  /**
   * Obter hook ativo
   */
  getActiveHook(): BaseGameHookInterface | null {
    switch (this.activeMode) {
      case GameModeType.NEIGHBORHOODS:
        return this.neighborhoodHook;
      case GameModeType.FAMOUS_PLACES:
        return this.famousPlacesHook;
      default:
        console.warn(`[GameModeManager] Modo desconhecido: ${this.activeMode}`);
        return null;
    }
  }

  /**
   * Obter estatísticas do modo ativo
   */
  getModeStats(): UnifiedGameStats | null {
    try {
      const activeHook = this.getActiveHook();
      if (!activeHook) {
        console.warn('[GameModeManager] Nenhum hook ativo para obter estatísticas');
        return null;
      }

      const state = activeHook.getCurrentState();
      
      const baseStats: UnifiedGameStats = {
        mode: this.activeMode,
        score: state.score || 0,
        roundNumber: state.roundNumber || 1,
        totalRounds: state.totalRounds || 10,
        isActive: state.isActive || false
      };

      // Adicionar estatísticas específicas do modo
      if (this.activeMode === GameModeType.NEIGHBORHOODS && this.neighborhoodHook) {
        const neighborhoodState = this.neighborhoodHook.getCurrentState() as any;
        baseStats.neighborhoodStats = {
          currentNeighborhood: neighborhoodState.currentNeighborhood || '',
          revealedNeighborhoods: neighborhoodState.revealedNeighborhoods || new Set()
        };
      } else if (this.activeMode === GameModeType.FAMOUS_PLACES && this.famousPlacesHook) {
        const famousPlacesState = this.famousPlacesHook.getCurrentState() as any;
        baseStats.famousPlacesStats = {
          currentPlace: famousPlacesState.currentPlace || null,
          roundPlaces: famousPlacesState.roundPlaces || [],
          usedPlaces: famousPlacesState.usedPlaces || new Set()
        };
      }

      return baseStats;
    } catch (error) {
      console.error('[GameModeManager] Erro ao obter estatísticas:', error);
      return null;
    }
  }

  /**
   * Pausar modo atual
   */
  async pauseCurrentMode(): Promise<void> {
    try {
      const activeHook = this.getActiveHook();
      if (activeHook) {
        activeHook.pauseGame();
        this.eventSystem.emitGamePause(this.activeMode);
        console.log(`[GameModeManager] Modo ${this.activeMode} pausado`);
      }
    } catch (error) {
      console.error('[GameModeManager] Erro ao pausar modo atual:', error);
    }
  }

  /**
   * Retomar modo atual
   */
  async resumeCurrentMode(): Promise<void> {
    try {
      const activeHook = this.getActiveHook();
      if (activeHook) {
        activeHook.resumeGame();
        this.eventSystem.emitGameResume(this.activeMode);
        console.log(`[GameModeManager] Modo ${this.activeMode} retomado`);
      }
    } catch (error) {
      console.error('[GameModeManager] Erro ao retomar modo atual:', error);
    }
  }

  /**
   * Finalizar modo atual
   */
  async endCurrentMode(): Promise<void> {
    try {
      const activeHook = this.getActiveHook();
      if (activeHook) {
        activeHook.endGame();
        this.eventSystem.emitGameEnd(this.activeMode);
        console.log(`[GameModeManager] Modo ${this.activeMode} finalizado`);
      }
    } catch (error) {
      console.error('[GameModeManager] Erro ao finalizar modo atual:', error);
    }
  }

  /**
   * Executar ação no modo ativo
   */
  async executeAction(action: string, data: any = {}): Promise<any> {
    try {
      const activeHook = this.getActiveHook();
      if (!activeHook) {
        throw new Error(`Nenhum hook ativo para executar ação ${action}`);
      }

      console.log(`[GameModeManager] Executando ação ${action} no modo ${this.activeMode}`);

      switch (action) {
        case 'startGame':
          activeHook.startGame();
          this.eventSystem.emitGameStart(this.activeMode, data);
          break;
        case 'pauseGame':
          activeHook.pauseGame();
          this.eventSystem.emitGamePause(this.activeMode, data);
          break;
        case 'resumeGame':
          activeHook.resumeGame();
          this.eventSystem.emitGameResume(this.activeMode, data);
          break;
        case 'endGame':
          activeHook.endGame();
          this.eventSystem.emitGameEnd(this.activeMode, data);
          break;
        case 'handleMapClick':
          activeHook.handleMapClick(data.latlng);
          break;
        case 'updateTimer':
          activeHook.updateTimer(data.timeLeft);
          break;
        case 'startNewRound':
          activeHook.startNewRound();
          break;
        case 'selectRandomTarget':
          activeHook.selectRandomTarget();
          break;
        default:
          throw new Error(`Ação desconhecida: ${action}`);
      }

      return { success: true, action, mode: this.activeMode };
    } catch (error) {
      console.error(`[GameModeManager] Erro ao executar ação ${action}:`, error);
      throw error;
    }
  }

  /**
   * Obter informações de debug
   */
  getDebugInfo(): any {
    return {
      activeMode: this.activeMode,
      config: this.config,
      hooks: {
        neighborhood: !!this.neighborhoodHook,
        famousPlaces: !!this.famousPlacesHook
      },
      eventSystem: this.eventSystem.getStats(),
      activeHookState: this.getActiveHook()?.getCurrentState() || null
    };
  }

  /**
   * Limpar recursos
   */
  cleanup(): void {
    try {
      console.log('[GameModeManager] Limpando recursos...');

      // Finalizar modo atual
      this.endCurrentMode();

      // Limpar sistema de eventos
      this.eventSystem.clear();

      // Limpar hooks
      this.neighborhoodHook = null;
      this.famousPlacesHook = null;

      console.log('[GameModeManager] Recursos limpos');
    } catch (error) {
      console.error('[GameModeManager] Erro na limpeza:', error);
    }
  }

  /**
   * Destruir o gerenciador
   */
  destroy(): void {
    try {
      this.cleanup();
      console.log('[GameModeManager] Gerenciador destruído');
    } catch (error) {
      console.error('[GameModeManager] Erro ao destruir gerenciador:', error);
    }
  }
}

// Exportar instância singleton
export const gameModeManager = new GameModeManager({
  mode: GameModeType.NEIGHBORHOODS,
  neighborhood: {
    roundTime: 10,
    maxRounds: 10,
    autoAdvance: true,
    showDistanceCircle: true,
    showArrow: true,
    soundEffects: true,
    perfectScoreThreshold: 3000,
    timeBonusThreshold: 2,
    distancePenaltyFactor: 10
  },
  famousPlaces: {
    roundTime: 15,
    maxRounds: 10,
    autoAdvance: false,
    showDistanceCircle: true,
    showArrow: true,
    soundEffects: true,
    distanceThreshold: 100,
    precisionBonusThreshold: 100,
    timeBonusThreshold: 5,
    maxPlacesPerRound: 5
  }
});

// Log inicial
console.log('[GameModeManager] Instância singleton criada'); 