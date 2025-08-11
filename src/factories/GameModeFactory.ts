/**
 * Factory Pattern para criação de modos de jogo
 * 
 * Este factory permite carregar dinamicamente versões antigas ou refatoradas
 * dos módulos baseado na configuração, facilitando a transição durante a refatoração.
 */

import { shouldUseRefactored, getModulePath } from '../config/gameModeConfig';

// Interfaces base para os modos
export interface BaseGameModeInterface {
  readonly mode: string;
  startGame(): void;
  pauseGame(): void;
  resumeGame(): void;
  endGame(): void;
  handleMapClick(latlng: any): void;
  updateTimer(timeLeft: number): void;
  getCurrentState(): any;
  getVisualFeedback(): any;
}

export interface BaseGameHookInterface {
  startGame(): void;
  pauseGame(): void;
  resumeGame(): void;
  endGame(): void;
  handleMapClick(latlng: any): void;
  updateTimer(timeLeft: number): void;
  getCurrentState(): any;
  getVisualFeedback(): any;
  startNewRound(): void;
  selectRandomTarget(): void;
}

/**
 * Factory para criar modos de jogo
 */
export class GameModeFactory {
  private static moduleCache = new Map<string, any>();

  /**
   * Carregar módulo dinamicamente baseado na configuração
   */
  private static async loadModule<T>(originalPath: string): Promise<T> {
    const cacheKey = originalPath;
    
    // Verificar cache primeiro
    if (this.moduleCache.has(cacheKey)) {
      return this.moduleCache.get(cacheKey);
    }

    try {
      let modulePath = originalPath;
      
      // Se deve usar versão refatorada, ajustar caminho
      if (shouldUseRefactored(originalPath)) {
        modulePath = getModulePath(originalPath);
        console.log(`[GameModeFactory] Carregando versão refatorada: ${modulePath}`);
      } else {
        console.log(`[GameModeFactory] Carregando versão original: ${modulePath}`);
      }

      // Importar módulo dinamicamente
      const module = await import(modulePath);
      
      // Cachear módulo
      this.moduleCache.set(cacheKey, module);
      
      return module;
    } catch (error) {
      console.error(`[GameModeFactory] Erro ao carregar módulo ${originalPath}:`, error);
      
      // Fallback para versão original se versão refatorada falhar
      if (shouldUseRefactored(originalPath)) {
        console.log(`[GameModeFactory] Fallback para versão original: ${originalPath}`);
        try {
          const fallbackModule = await import(originalPath);
          this.moduleCache.set(cacheKey, fallbackModule);
          return fallbackModule;
        } catch (fallbackError) {
          console.error(`[GameModeFactory] Fallback também falhou:`, fallbackError);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  }

  /**
   * Criar modo de jogo baseado no tipo
   */
  static async createMode(mode: 'neighborhoods' | 'famous_places', config: any = {}): Promise<BaseGameModeInterface> {
    try {
      let modulePath: string;
      let componentName: string;
      
      if (mode === 'neighborhoods') {
        modulePath = '../components/game/modes/NeighborhoodMode/NeighborhoodMode';
        componentName = 'NeighborhoodMode';
      } else {
        modulePath = '../components/game/modes/FamousPlacesMode/FamousPlacesMode';
        componentName = 'FamousPlacesMode';
      }

      const module = await this.loadModule(modulePath);
      const ModeComponent = (module as any)[componentName];
      
      if (!ModeComponent) {
        throw new Error(`Componente ${componentName} não encontrado no módulo`);
      }

      console.log(`[GameModeFactory] Modo ${mode} criado com sucesso`);
      return new ModeComponent(config);
    } catch (error) {
      console.error(`[GameModeFactory] Erro ao criar modo ${mode}:`, error);
      throw error;
    }
  }

  /**
   * Criar hook de jogo baseado no tipo
   */
  static async createHook(mode: 'neighborhoods' | 'famous_places', config: any = {}): Promise<BaseGameHookInterface> {
    try {
      let modulePath: string;
      let hookName: string;
      
      if (mode === 'neighborhoods') {
        modulePath = '../hooks/modes/useNeighborhoodGame';
        hookName = 'useNeighborhoodGame';
      } else {
        modulePath = '../hooks/modes/useFamousPlacesGame';
        hookName = 'useFamousPlacesGame';
      }

      const module = await this.loadModule(modulePath);
      const HookFunction = (module as any)[hookName];
      
      if (!HookFunction) {
        throw new Error(`Hook ${hookName} não encontrado no módulo`);
      }

      console.log(`[GameModeFactory] Hook ${mode} criado com sucesso`);
      return HookFunction(config);
    } catch (error) {
      console.error(`[GameModeFactory] Erro ao criar hook ${mode}:`, error);
      throw error;
    }
  }

  /**
   * Criar hook principal de gerenciamento de modos
   */
  static async createGameModeHook(config: any = {}): Promise<BaseGameHookInterface> {
    try {
      const modulePath = '../hooks/modes/useGameMode';
      const hookName = 'useGameMode';
      
      const module = await this.loadModule(modulePath);
      const HookFunction = (module as any)[hookName];
      
      if (!HookFunction) {
        throw new Error(`Hook ${hookName} não encontrado no módulo`);
      }

      console.log(`[GameModeFactory] Hook principal criado com sucesso`);
      return HookFunction(config);
    } catch (error) {
      console.error(`[GameModeFactory] Erro ao criar hook principal:`, error);
      throw error;
    }
  }

  /**
   * Carregar utilitários de validação
   */
  static async loadValidationUtils(mode: 'neighborhoods' | 'famous_places'): Promise<any> {
    try {
      let modulePath: string;
      
      if (mode === 'neighborhoods') {
        modulePath = '../utils/modes/neighborhood/validation';
      } else {
        modulePath = '../utils/modes/famousPlaces/validation';
      }

      const module = await this.loadModule(modulePath);
      console.log(`[GameModeFactory] Utilitários de validação ${mode} carregados`);
      return module;
    } catch (error) {
      console.error(`[GameModeFactory] Erro ao carregar utilitários de validação ${mode}:`, error);
      throw error;
    }
  }

  /**
   * Carregar utilitários de pontuação
   */
  static async loadScoringUtils(mode: 'neighborhoods' | 'famous_places'): Promise<any> {
    try {
      let modulePath: string;
      
      if (mode === 'neighborhoods') {
        modulePath = '../utils/modes/neighborhood/scoring';
      } else {
        modulePath = '../utils/modes/famousPlaces/scoring';
      }

      const module = await this.loadModule(modulePath);
      console.log(`[GameModeFactory] Utilitários de pontuação ${mode} carregados`);
      return module;
    } catch (error) {
      console.error(`[GameModeFactory] Erro ao carregar utilitários de pontuação ${mode}:`, error);
      throw error;
    }
  }

  /**
   * Limpar cache de módulos
   */
  static clearCache(): void {
    this.moduleCache.clear();
    console.log('[GameModeFactory] Cache limpo');
  }

  /**
   * Obter status do cache
   */
  static getCacheStatus(): { size: number; keys: string[] } {
    return {
      size: this.moduleCache.size,
      keys: Array.from(this.moduleCache.keys())
    };
  }
}

// Exportar instância singleton
export const gameModeFactory = new GameModeFactory();

// Log inicial
console.log('[GameModeFactory] Factory inicializado'); 