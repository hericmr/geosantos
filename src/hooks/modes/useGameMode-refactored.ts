import { useMemo, useCallback } from 'react';
import { GameMode } from '../../types/famousPlaces';
import { useNeighborhoodGame } from './useNeighborhoodGame';
import { useFamousPlacesGame } from './useFamousPlacesGame';
import { NeighborhoodMode } from '../../components/game/modes/NeighborhoodMode';
import { FamousPlacesMode } from '../../components/game/modes/FamousPlacesMode';

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
  // Hook para modo bairros
  const neighborhoodGame = useNeighborhoodGame(geoJsonData, config.neighborhood);
  
  // Hook para modo lugares famosos
  const famousPlacesGame = useFamousPlacesGame(famousPlaces, config.famousPlaces);

  // Modo ativo baseado na seleção
  const activeMode = useMemo(() => {
    return gameMode;
  }, [gameMode]);

  // Selecionar o hook ativo baseado no modo
  const activeGameHook = useMemo(() => {
    switch (gameMode) {
      case 'neighborhoods':
        return neighborhoodGame;
      case 'famous_places':
        return famousPlacesGame;
      default:
        return neighborhoodGame; // Fallback para bairros
    }
  }, [gameMode, neighborhoodGame, famousPlacesGame]);

  // Métodos unificados que delegam para o modo ativo
  const handleMapClick = useCallback((latlng: any) => {
    activeGameHook.handleMapClick(latlng);
  }, [activeGameHook]);

  const updateTimer = useCallback((timeLeft: number) => {
    activeGameHook.updateTimer(timeLeft);
  }, [activeGameHook]);

  const startGame = useCallback(() => {
    activeGameHook.startGame();
  }, [activeGameHook]);

  const pauseGame = useCallback(() => {
    activeGameHook.pauseGame();
  }, [activeGameHook]);

  const resumeGame = useCallback(() => {
    activeGameHook.resumeGame();
  }, [activeGameHook]);

  const endGame = useCallback(() => {
    activeGameHook.endGame();
  }, [activeGameHook]);

  // Métodos específicos para cada modo
  const startNewRound = useCallback(() => {
    if (gameMode === 'neighborhoods') {
      neighborhoodGame.startNewRound();
    } else if (gameMode === 'famous_places') {
      famousPlacesGame.forceNextRound();
    }
  }, [gameMode, neighborhoodGame, famousPlacesGame]);

  const selectRandomTarget = useCallback(() => {
    if (gameMode === 'neighborhoods') {
      neighborhoodGame.selectRandomNeighborhood();
    } else if (gameMode === 'famous_places') {
      // Para lugares famosos, o próximo lugar é selecionado automaticamente
      famousPlacesGame.advanceToNextPlace();
    }
  }, [gameMode, neighborhoodGame, famousPlacesGame]);

  // Obter estado atual do modo ativo
  const getCurrentGameState = useCallback(() => {
    return activeGameHook.getCurrentState();
  }, [activeGameHook]);

  // Obter feedback visual do modo ativo
  const getCurrentVisualFeedback = useCallback(() => {
    return activeGameHook.getVisualFeedback();
  }, [activeGameHook]);

  // Verificar se o modo atual está ativo
  const isGameActive = useCallback(() => {
    const state = getCurrentGameState();
    return state.isActive;
  }, [getCurrentGameState]);

  // Obter pontuação atual
  const getCurrentScore = useCallback(() => {
    const state = getCurrentGameState();
    return state.score;
  }, [getCurrentGameState]);

  // Obter rodada atual
  const getCurrentRound = useCallback(() => {
    const state = getCurrentGameState();
    return state.roundNumber;
  }, [getCurrentGameState]);

  // Obter tempo restante da rodada
  const getRoundTimeLeft = useCallback(() => {
    const state = getCurrentGameState();
    return state.roundTimeLeft;
  }, [getCurrentGameState]);

  // Obter feedback atual
  const getCurrentFeedback = useCallback(() => {
    const state = getCurrentGameState();
    return state.feedback;
  }, [getCurrentGameState]);

  // Métodos para configuração e controle
  const switchGameMode = useCallback((newMode: GameMode) => {
    // Pausar jogo atual se estiver ativo
    if (isGameActive()) {
      pauseGame();
    }
    
    // Limpar estado anterior
    if (gameMode === 'neighborhoods') {
      neighborhoodGame.endGame();
    } else if (gameMode === 'famous_places') {
      famousPlacesGame.endGame();
    }
    
    // Retornar novo modo (será usado pelo componente pai)
    return newMode;
  }, [gameMode, isGameActive, pauseGame, neighborhoodGame, famousPlacesGame]);

  // Obter estatísticas do modo atual
  const getGameStats = useCallback(() => {
    const state = getCurrentGameState();
    
    if (gameMode === 'neighborhoods') {
      return {
        mode: 'neighborhoods',
        score: state.score,
        roundNumber: state.roundNumber,
        totalRounds: state.totalRounds,
        currentNeighborhood: (state as any).currentNeighborhood,
        revealedNeighborhoods: (state as any).revealedNeighborhoods,
        isActive: state.isActive
      };
    } else if (gameMode === 'famous_places') {
      return {
        mode: 'famous_places',
        score: state.score,
        roundNumber: state.roundNumber,
        totalRounds: state.totalRounds,
        currentPlace: (state as any).currentPlace,
        roundPlaces: (state as any).roundPlaces,
        usedPlaces: (state as any).usedPlaces,
        isActive: state.isActive
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