import { useState, useCallback, useEffect } from 'react';
import * as L from 'leaflet';
import { 
  NeighborhoodGameState, 
  NeighborhoodValidation, 
  NeighborhoodConfig,
  NeighborhoodVisualFeedback 
} from '../../types/modes/neighborhood';
import { validateNeighborhoodClick } from '../../utils/modes/neighborhood/validation';
import { calculateNeighborhoodScore } from '../../utils/shared';

export const useNeighborhoodGame = (
  geoJsonData: any,
  config: Partial<NeighborhoodConfig> = {}
) => {
  // Configuração padrão
  const defaultConfig: NeighborhoodConfig = {
    roundTime: 10,
    maxRounds: 10,
    autoAdvance: true,
    showDistanceCircle: true,
    showArrow: true,
    soundEffects: true,
    perfectScoreThreshold: 3000,
    timeBonusThreshold: 2,
    distancePenaltyFactor: 10,
    ...config
  };

  const [gameState, setGameState] = useState<NeighborhoodGameState>({
    currentNeighborhood: '',
    revealedNeighborhoods: new Set(),
    availableNeighborhoods: [],
    roundNumber: 1,
    totalRounds: 10,
    roundTimeLeft: 10,
    isActive: false,
    score: 0,
    feedback: null
  });

  const [visualFeedback, setVisualFeedback] = useState<NeighborhoodVisualFeedback>({
    showDistanceCircle: false,
    showArrow: false,
    arrowPath: null,
    distanceCircleCenter: null,
    distanceCircleRadius: 0,
    highlightNeighborhood: false,
    neighborhoodColor: '#00ff00'
  });

  // Inicializar bairros disponíveis
  useEffect(() => {
    if (geoJsonData && geoJsonData.features) {
      const neighborhoods = geoJsonData.features.map((feature: any) => feature.properties.NOME);
      setGameState(prev => ({
        ...prev,
        availableNeighborhoods: neighborhoods,
        totalRounds: Math.min(neighborhoods.length, defaultConfig.maxRounds)
      }));
    }
  }, [geoJsonData, defaultConfig.maxRounds]);

  // Selecionar bairro aleatório para a rodada
  const selectRandomNeighborhood = useCallback(() => {
    if (gameState.availableNeighborhoods.length === 0) return;

    const availableNeighborhoods = gameState.availableNeighborhoods.filter(
      name => !gameState.revealedNeighborhoods.has(name)
    );

    if (availableNeighborhoods.length === 0) {
      // Todos os bairros foram revelados, resetar
      setGameState(prev => ({
        ...prev,
        revealedNeighborhoods: new Set(),
        roundNumber: 1
      }));
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableNeighborhoods.length);
    const selectedNeighborhood = availableNeighborhoods[randomIndex];

    setGameState(prev => ({
      ...prev,
      currentNeighborhood: selectedNeighborhood,
      roundTimeLeft: defaultConfig.roundTime
    }));

    console.log(`[useNeighborhoodGame] Bairro selecionado: ${selectedNeighborhood}`);
  }, [gameState.availableNeighborhoods, gameState.revealedNeighborhoods, defaultConfig.roundTime]);

  // Iniciar nova rodada
  const startNewRound = useCallback(() => {
    if (gameState.roundNumber >= gameState.totalRounds) {
      // Jogo terminou
      setGameState(prev => ({ ...prev, isActive: false }));
      return;
    }

    selectRandomNeighborhood();
    setGameState(prev => ({
      ...prev,
      roundNumber: prev.roundNumber + 1,
      roundTimeLeft: defaultConfig.roundTime,
      feedback: null
    }));

    // Limpar feedback visual
    setVisualFeedback(prev => ({
      ...prev,
      showDistanceCircle: false,
      showArrow: false,
      arrowPath: null,
      distanceCircleCenter: null,
      distanceCircleRadius: 0,
      highlightNeighborhood: false
    }));
  }, [gameState.roundNumber, gameState.totalRounds, selectRandomNeighborhood, defaultConfig.roundTime]);

  // Lidar com clique no mapa
  const handleMapClick = useCallback((latlng: L.LatLng) => {
    if (!gameState.isActive || !gameState.currentNeighborhood || !geoJsonData) {
      console.log('[useNeighborhoodGame] Clique ignorado - jogo não ativo ou sem bairro selecionado');
      return;
    }

    console.log(`[useNeighborhoodGame] Clique em: ${latlng.lat}, ${latlng.lng}`);
    console.log(`[useNeighborhoodGame] Bairro alvo: ${gameState.currentNeighborhood}`);

    try {
      // Validar o clique
      const validation = validateNeighborhoodClick(
        latlng,
        gameState.currentNeighborhood,
        geoJsonData,
        gameState.roundTimeLeft
      );

      console.log('[useNeighborhoodGame] Validação:', validation);

      // Calcular pontuação
      const scoreCalculation = calculateNeighborhoodScore(
        validation.distance,
        gameState.roundTimeLeft,
        validation.isCorrectNeighborhood,
        validation.isNearBorder
      );

      console.log('[useNeighborhoodGame] Pontuação:', scoreCalculation);

      // Atualizar estado do jogo
      setGameState(prev => ({
        ...prev,
        score: prev.score + scoreCalculation.total,
        feedback: validation
      }));

      // Atualizar feedback visual
      setVisualFeedback(prev => ({
        ...prev,
        showDistanceCircle: defaultConfig.showDistanceCircle,
        distanceCircleCenter: latlng,
        distanceCircleRadius: validation.distance,
        showArrow: defaultConfig.showArrow && !validation.isCorrectNeighborhood,
        arrowPath: validation.isCorrectNeighborhood ? null : [latlng, latlng] as [L.LatLng, L.LatLng],
        highlightNeighborhood: validation.isCorrectNeighborhood,
        neighborhoodColor: validation.isCorrectNeighborhood ? '#00ff00' : '#ff0000'
      }));

      // Se acertou, marcar como revelado
      if (validation.isCorrectNeighborhood) {
        setGameState(prev => ({
          ...prev,
          revealedNeighborhoods: new Set([...prev.revealedNeighborhoods, gameState.currentNeighborhood])
        }));

        // Avançar para próxima rodada se configurado
        if (defaultConfig.autoAdvance) {
          setTimeout(() => {
            startNewRound();
          }, 2000);
        }
      }

    } catch (error) {
      console.error('[useNeighborhoodGame] Erro ao processar clique:', error);
    }
  }, [gameState.isActive, gameState.currentNeighborhood, gameState.roundTimeLeft, geoJsonData, defaultConfig, startNewRound]);

  // Atualizar timer
  const updateTimer = useCallback((timeLeft: number) => {
    setGameState(prev => ({
      ...prev,
      roundTimeLeft: timeLeft
    }));

    // Se o tempo acabou, avançar para próxima rodada
    if (timeLeft <= 0 && defaultConfig.autoAdvance) {
      startNewRound();
    }
  }, [startNewRound, defaultConfig.autoAdvance]);

  // Iniciar jogo
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isActive: true,
      roundNumber: 1,
      score: 0,
      revealedNeighborhoods: new Set()
    }));
    selectRandomNeighborhood();
  }, [selectRandomNeighborhood]);

  // Pausar jogo
  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isActive: false }));
  }, []);

  // Resumir jogo
  const resumeGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isActive: true }));
  }, []);

  // Terminar jogo
  const endGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isActive: false }));
    setVisualFeedback(prev => ({
      ...prev,
      showDistanceCircle: false,
      showArrow: false,
      arrowPath: null,
      distanceCircleCenter: null,
      distanceCircleRadius: 0,
      highlightNeighborhood: false
    }));
  }, []);

  // Obter estado atual
  const getCurrentState = useCallback(() => {
    return gameState;
  }, [gameState]);

  // Obter feedback visual
  const getVisualFeedback = useCallback(() => {
    return visualFeedback;
  }, [visualFeedback]);

  // Verificar se está ativo
  const isGameActive = useCallback(() => {
    return gameState.isActive;
  }, [gameState.isActive]);

  // Obter pontuação atual
  const getCurrentScore = useCallback(() => {
    return gameState.score;
  }, [gameState.score]);

  // Obter rodada atual
  const getCurrentRound = useCallback(() => {
    return gameState.roundNumber;
  }, [gameState.roundNumber]);

  // Obter tempo restante
  const getRoundTimeLeft = useCallback(() => {
    return gameState.roundTimeLeft;
  }, [gameState.roundTimeLeft]);

  // Obter feedback atual
  const getCurrentFeedback = useCallback(() => {
    return gameState.feedback;
  }, [gameState.feedback]);

  return {
    // Estados
    gameState,
    visualFeedback,
    
    // Métodos principais
    handleMapClick,
    updateTimer,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    startNewRound,
    selectRandomNeighborhood,
    
    // Métodos de consulta
    getCurrentState,
    getVisualFeedback,
    isGameActive,
    getCurrentScore,
    getCurrentRound,
    getRoundTimeLeft,
    getCurrentFeedback
  };
}; 