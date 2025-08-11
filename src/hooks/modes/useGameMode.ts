import { useMemo, useCallback, useEffect, useState } from 'react';
import { GameMode } from '../../types/famousPlaces';
import { shouldUseRefactored } from '../../config/gameModeConfig';
import { GameModeFactory } from '../../factories/GameModeFactory';

interface UseGameModeProps {
  gameMode: GameMode;
  geoJsonData: any;
  famousPlaces: any[];
  config?: {
    neighborhood?: any;
    famousPlaces?: any;
  };
}

export const useGameMode = ({
  gameMode,
  geoJsonData,
  famousPlaces,
  config = {}
}: UseGameModeProps) => {
  // Estado para os hooks carregados dinamicamente
  const [neighborhoodGame, setNeighborhoodGame] = useState<any>(null);
  const [famousPlacesGame, setFamousPlacesGame] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar hooks dinamicamente baseado na configuração
  useEffect(() => {
    const loadHooks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('[useGameMode] Carregando hooks dinamicamente...');

        // Carregar hook do modo bairros
        const neighborhoodHook = await GameModeFactory.createHook('neighborhoods', {
          geoJsonData,
          ...config.neighborhood
        });
        setNeighborhoodGame(neighborhoodHook);

        // Carregar hook do modo lugares famosos
        const famousPlacesHook = await GameModeFactory.createHook('famous_places', {
          famousPlaces,
          ...config.famousPlaces
        });
        setFamousPlacesGame(famousPlacesHook);

        console.log('[useGameMode] Hooks carregados com sucesso');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        console.error('[useGameMode] Erro ao carregar hooks:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHooks();
  }, [geoJsonData, famousPlaces, config.neighborhood, config.famousPlaces]);

  // Modo ativo baseado na seleção
  const activeMode = useMemo(() => {
    return gameMode;
  }, [gameMode]);

  // Selecionar o hook ativo baseado no modo
  const activeGameHook = useMemo(() => {
    if (isLoading || !neighborhoodGame || !famousPlacesGame) {
      console.log('[useGameMode] Hooks ainda não carregados:', { isLoading, neighborhoodGame: !!neighborhoodGame, famousPlacesGame: !!famousPlacesGame });
      return null;
    }

    switch (gameMode) {
      case 'neighborhoods':
        return neighborhoodGame;
      case 'famous_places':
        return famousPlacesGame;
      default:
        return neighborhoodGame; // Fallback para bairros
    }
  }, [gameMode, neighborhoodGame, famousPlacesGame, isLoading]);

  // Métodos unificados que delegam para o modo ativo
  const handleMapClick = useCallback((latlng: any) => {
    if (!activeGameHook) {
      console.warn('[useGameMode] Hook ativo não disponível para handleMapClick');
      return;
    }
    activeGameHook.handleMapClick(latlng);
  }, [activeGameHook]);

  const updateTimer = useCallback((timeLeft: number) => {
    if (!activeGameHook) {
      console.warn('[useGameMode] Hook ativo não disponível para updateTimer');
      return;
    }
    activeGameHook.updateTimer(timeLeft);
  }, [activeGameHook]);

  const startGame = useCallback(() => {
    if (!activeGameHook) {
      console.warn('[useGameMode] Hook ativo não disponível para startGame');
      return;
    }
    activeGameHook.startGame();
  }, [activeGameHook]);

  const pauseGame = useCallback(() => {
    if (!activeGameHook) {
      console.warn('[useGameMode] Hook ativo não disponível para pauseGame');
      return;
    }
    activeGameHook.pauseGame();
  }, [activeGameHook]);

  const resumeGame = useCallback(() => {
    if (!activeGameHook) {
      console.warn('[useGameMode] Hook ativo não disponível para resumeGame');
      return;
    }
    activeGameHook.resumeGame();
  }, [activeGameHook]);

  const endGame = useCallback(() => {
    if (!activeGameHook) {
      console.warn('[useGameMode] Hook ativo não disponível para endGame');
      return;
    }
    activeGameHook.endGame();
  }, [activeGameHook]);

  // Métodos específicos para cada modo
  const startNewRound = useCallback(() => {
    if (gameMode === 'neighborhoods') {
      if (!neighborhoodGame) {
        console.warn('[useGameMode] Hook de bairros não disponível para startNewRound');
        return;
      }
      neighborhoodGame.startNewRound();
    } else if (gameMode === 'famous_places') {
      if (!famousPlacesGame) {
        console.warn('[useGameMode] Hook de lugares famosos não disponível para startNewRound');
        return;
      }
      famousPlacesGame.forceNextRound();
    }
  }, [gameMode, neighborhoodGame, famousPlacesGame]);

  const selectRandomTarget = useCallback(() => {
    if (gameMode === 'neighborhoods') {
      if (!neighborhoodGame) {
        console.warn('[useGameMode] Hook de bairros não disponível para selectRandomTarget');
        return;
      }
      neighborhoodGame.selectRandomNeighborhood();
    } else if (gameMode === 'famous_places') {
      if (!famousPlacesGame) {
        console.warn('[useGameMode] Hook de lugares famosos não disponível para selectRandomTarget');
        return;
      }
      // Para lugares famosos, o próximo lugar é selecionado automaticamente
      famousPlacesGame.advanceToNextPlace();
    }
  }, [gameMode, neighborhoodGame, famousPlacesGame]);

  // Obter estado atual do modo ativo
  const getCurrentGameState = useCallback(() => {
    if (!activeGameHook) {
      console.warn('[useGameMode] Hook ativo não disponível para getCurrentGameState');
      return null;
    }
    return activeGameHook.getCurrentState();
  }, [activeGameHook]);

  // Obter feedback visual do modo ativo
  const getCurrentVisualFeedback = useCallback(() => {
    if (!activeGameHook) {
      console.warn('[useGameMode] Hook ativo não disponível para getCurrentVisualFeedback');
      return null;
    }
    return activeGameHook.getVisualFeedback();
  }, [activeGameHook]);

  // Verificar se o modo atual está ativo
  const isGameActive = useCallback(() => {
    const state = getCurrentGameState();
    return state?.isActive || false;
  }, [getCurrentGameState]);

  // Obter pontuação atual
  const getCurrentScore = useCallback(() => {
    const state = getCurrentGameState();
    return state?.score || 0;
  }, [getCurrentGameState]);

  // Obter rodada atual
  const getCurrentRound = useCallback(() => {
    const state = getCurrentGameState();
    return state?.roundNumber || 1;
  }, [getCurrentGameState]);

  // Obter tempo restante da rodada
  const getRoundTimeLeft = useCallback(() => {
    const state = getCurrentGameState();
    return state?.roundTimeLeft || 0;
  }, [getCurrentGameState]);

  // Obter feedback atual
  const getCurrentFeedback = useCallback(() => {
    const state = getCurrentGameState();
    return state?.feedback || null;
  }, [getCurrentGameState]);

  // Métodos para configuração e controle
  const switchGameMode = useCallback((newMode: GameMode) => {
    // Pausar jogo atual se estiver ativo
    if (isGameActive()) {
      pauseGame();
    }
    
    // Limpar estado anterior
    if (gameMode === 'neighborhoods') {
      if (neighborhoodGame) {
        neighborhoodGame.endGame();
      }
    } else if (gameMode === 'famous_places') {
      if (famousPlacesGame) {
        famousPlacesGame.endGame();
      }
    }
    
    // Retornar novo modo (será usado pelo componente pai)
    return newMode;
  }, [gameMode, isGameActive, pauseGame, neighborhoodGame, famousPlacesGame]);

  // Obter estatísticas do modo atual
  const getGameStats = useCallback(() => {
    const state = getCurrentGameState();
    
    if (!state) {
      console.warn('[useGameMode] Estado não disponível para getGameStats');
      return null;
    }
    
    if (gameMode === 'neighborhoods') {
      return {
        mode: 'neighborhoods',
        score: state.score || 0,
        roundNumber: state.roundNumber || 1,
        totalRounds: state.totalRounds || 10,
        currentNeighborhood: (state as any).currentNeighborhood || '',
        revealedNeighborhoods: (state as any).revealedNeighborhoods || new Set(),
        isActive: state.isActive || false
      };
    } else if (gameMode === 'famous_places') {
      return {
        mode: 'famous_places',
        score: state.score || 0,
        roundNumber: state.roundNumber || 1,
        totalRounds: state.totalRounds || 10,
        currentPlace: (state as any).currentPlace || null,
        roundPlaces: (state as any).roundPlaces || [],
        usedPlaces: (state as any).usedPlaces || new Set(),
        isActive: state.isActive || false
      };
    }
    
    return null;
  }, [gameMode, getCurrentGameState]);

  // Obter configuração do modo atual
  const getCurrentConfig = useCallback(() => {
    if (gameMode === 'neighborhoods') {
      return {
        roundTime: 10,
        maxRounds: 10,
        autoAdvance: true,
        showDistanceCircle: true,
        showArrow: true,
        soundEffects: true
      };
    } else if (gameMode === 'famous_places') {
      return {
        roundTime: 15,
        maxRounds: 10,
        autoAdvance: false,
        showDistanceCircle: true,
        showArrow: true,
        soundEffects: true,
        distanceThreshold: 100,
        maxPlacesPerRound: 5
      };
    }
    
    return null;
  }, [gameMode]);

  return {
    // Estado e configuração
    activeMode,
    activeGameHook,
    gameMode,
    
    // Estados de carregamento
    isLoading,
    error,
    
    // Métodos unificados
    handleMapClick,
    updateTimer,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    startNewRound,
    selectRandomTarget,
    
    // Métodos de consulta
    getCurrentGameState,
    getCurrentVisualFeedback,
    isGameActive,
    getCurrentScore,
    getCurrentRound,
    getRoundTimeLeft,
    getCurrentFeedback,
    getGameStats,
    getCurrentConfig,
    
    // Controle de modo
    switchGameMode,
    
    // Hooks específicos (para uso avançado)
    neighborhoodGame,
    famousPlacesGame
  };
}; 