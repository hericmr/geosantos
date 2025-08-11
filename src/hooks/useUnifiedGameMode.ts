/**
 * Hook unificado para gerenciamento de modos de jogo
 * 
 * Este hook usa o GameModeManager para coordenar os modos
 * através do sistema de eventos, mantendo-os isolados
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameModeType } from '../types/modes/unified/unified.types';
import { gameModeManager } from '../managers/GameModeManager';
import { gameEventSystem } from '../systems/GameEventSystem';

export const useUnifiedGameMode = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<GameModeType>(GameModeType.NEIGHBORHOODS);
  const [gameStats, setGameStats] = useState<any>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  
  const managerRef = useRef(gameModeManager);
  const eventSystemRef = useRef(gameEventSystem);

  // Inicializar o gerenciador
  useEffect(() => {
    const initializeManager = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('[useUnifiedGameMode] Inicializando gerenciador...');
        
        await managerRef.current.initialize();
        
        // Configurar listeners de eventos
        setupEventListeners();
        
        // Obter estatísticas iniciais
        updateGameStats();
        
        setIsLoading(false);
        console.log('[useUnifiedGameMode] Gerenciador inicializado com sucesso');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        setIsLoading(false);
        console.error('[useUnifiedGameMode] Erro na inicialização:', errorMessage);
      }
    };

    initializeManager();

    // Cleanup na desmontagem
    return () => {
      console.log('[useUnifiedGameMode] Cleanup do hook');
      // Não destruir o gerenciador aqui, pois é singleton
    };
  }, []);

  // Configurar listeners de eventos
  const setupEventListeners = useCallback(() => {
    const eventSystem = eventSystemRef.current;

    // Listener para mudanças de estado do jogo
    eventSystem.on('gameStart', (event) => {
      console.log('[useUnifiedGameMode] Jogo iniciado:', event);
      setIsGameActive(true);
      updateGameStats();
    });

    eventSystem.on('gameEnd', (event) => {
      console.log('[useUnifiedGameMode] Jogo finalizado:', event);
      setIsGameActive(false);
      updateGameStats();
    });

    eventSystem.on('gamePause', (event) => {
      console.log('[useUnifiedGameMode] Jogo pausado:', event);
      setIsGameActive(false);
    });

    eventSystem.on('gameResume', (event) => {
      console.log('[useUnifiedGameMode] Jogo retomado:', event);
      setIsGameActive(true);
    });

    eventSystem.on('roundComplete', (event) => {
      console.log('[useUnifiedGameMode] Rodada completada:', event);
      updateGameStats();
    });

    eventSystem.on('scoreUpdate', (event) => {
      console.log('[useUnifiedGameMode] Pontuação atualizada:', event);
      updateGameStats();
    });

    eventSystem.on('feedback', (event) => {
      console.log('[useUnifiedGameMode] Feedback recebido:', event);
    });
  }, []);

  // Atualizar estatísticas do jogo
  const updateGameStats = useCallback(async () => {
    try {
      const stats = managerRef.current.getModeStats();
      setGameStats(stats);
      
      if (stats) {
        setActiveMode(stats.mode);
        setIsGameActive(stats.isActive);
      }
    } catch (error) {
      console.error('[useUnifiedGameMode] Erro ao atualizar estatísticas:', error);
    }
  }, []);

  // Trocar para um modo específico
  const switchMode = useCallback(async (mode: GameModeType) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`[useUnifiedGameMode] Trocando para modo ${mode}`);
      
      await managerRef.current.switchMode(mode);
      
      // Atualizar estatísticas após a troca
      updateGameStats();
      
      console.log(`[useUnifiedGameMode] Modo alterado para ${mode}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error(`[useUnifiedGameMode] Erro ao trocar para modo ${mode}:`, errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [updateGameStats]);

  // Executar ação no modo ativo
  const executeAction = useCallback(async (action: string, data: any = {}) => {
    try {
      console.log(`[useUnifiedGameMode] Executando ação ${action}`);
      
      const result = await managerRef.current.executeAction(action, data);
      
      // Atualizar estatísticas após a ação
      updateGameStats();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error(`[useUnifiedGameMode] Erro ao executar ação ${action}:`, errorMessage);
      throw err;
    }
  }, [updateGameStats]);

  // Métodos de controle do jogo
  const startGame = useCallback(async () => {
    return executeAction('startGame');
  }, [executeAction]);

  const pauseGame = useCallback(async () => {
    return executeAction('pauseGame');
  }, [executeAction]);

  const resumeGame = useCallback(async () => {
    return executeAction('resumeGame');
  }, [executeAction]);

  const endGame = useCallback(async () => {
    return executeAction('endGame');
  }, [executeAction]);

  // Métodos de jogo
  const handleMapClick = useCallback(async (latlng: any) => {
    return executeAction('handleMapClick', { latlng });
  }, [executeAction]);

  const updateTimer = useCallback(async (timeLeft: number) => {
    return executeAction('updateTimer', { timeLeft });
  }, [executeAction]);

  const startNewRound = useCallback(async () => {
    return executeAction('startNewRound');
  }, [executeAction]);

  const selectRandomTarget = useCallback(async () => {
    return executeAction('selectRandomTarget');
  }, [executeAction]);

  // Obter informações de debug
  const getDebugInfo = useCallback(() => {
    return managerRef.current.getDebugInfo();
  }, []);

  // Limpar recursos
  const cleanup = useCallback(() => {
    try {
      console.log('[useUnifiedGameMode] Limpando recursos...');
      managerRef.current.cleanup();
    } catch (error) {
      console.error('[useUnifiedGameMode] Erro na limpeza:', error);
    }
  }, []);

  // Obter estatísticas do sistema de eventos
  const getEventSystemStats = useCallback(() => {
    return eventSystemRef.current.getStats();
  }, []);

  // Obter histórico de eventos
  const getEventHistory = useCallback(() => {
    return eventSystemRef.current.getEventHistory();
  }, []);

  // Obter eventos por tipo
  const getEventsByType = useCallback((eventType: string) => {
    return eventSystemRef.current.getEventsByType(eventType as any);
  }, []);

  // Obter eventos por modo
  const getEventsByMode = useCallback((mode: string) => {
    return eventSystemRef.current.getEventsByMode(mode);
  }, []);

  return {
    // Estados
    isLoading,
    error,
    activeMode,
    gameStats,
    isGameActive,
    
    // Métodos de controle
    switchMode,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    
    // Métodos de jogo
    handleMapClick,
    updateTimer,
    startNewRound,
    selectRandomTarget,
    
    // Métodos de consulta
    getDebugInfo,
    getEventSystemStats,
    getEventHistory,
    getEventsByType,
    getEventsByMode,
    
    // Métodos de limpeza
    cleanup,
    
    // Utilitários
    updateGameStats
  };
}; 