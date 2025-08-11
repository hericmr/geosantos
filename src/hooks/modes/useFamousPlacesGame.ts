import { useState, useCallback, useEffect } from 'react';
import * as L from 'leaflet';
import { FamousPlace } from '../../types/famousPlaces';
import { 
  FamousPlacesGameState, 
  FamousPlacesValidation, 
  FamousPlacesConfig,
  FamousPlacesVisualFeedback,
  FamousPlacesRound
} from '../../types/modes/famousPlaces';
import { validateFamousPlaceClick } from '../../utils/modes/famousPlaces/validation';
import { calculateFamousPlacesScore } from '../../utils/modes/famousPlaces/scoring';

export const useFamousPlacesGame = (
  famousPlaces: FamousPlace[],
  config: Partial<FamousPlacesConfig> = {}
) => {
  // Configuração padrão
  const defaultConfig: FamousPlacesConfig = {
    roundTime: 15,
    maxRounds: 10,
    autoAdvance: false,
    showDistanceCircle: true,
    showArrow: true,
    soundEffects: true,
    distanceThreshold: 100,
    maxPlacesPerRound: 5,
    precisionBonusThreshold: 3,
    timeBonusThreshold: 3
  };

  const [gameState, setGameState] = useState<FamousPlacesGameState>({
    currentPlace: null,
    roundPlaces: [],
    usedPlaces: new Set<string>(),
    currentRoundIndex: 0,
    roundNumber: 1,
    totalRounds: 10,
    roundTimeLeft: 15,
    isActive: false,
    score: 0,
    feedback: null
  });

  const [visualFeedback, setVisualFeedback] = useState<FamousPlacesVisualFeedback>({
    showDistanceCircle: false,
    showArrow: false,
    arrowPath: null,
    distanceCircleCenter: null,
    distanceCircleRadius: 0,
    highlightPlace: false,
    placeMarker: null,
    showModal: false,
    modalPosition: 'center'
  });

  const [currentRound, setCurrentRound] = useState<FamousPlacesRound>({
    places: [],
    currentIndex: 0,
    roundNumber: 1,
    startTime: Date.now(),
    score: 0,
    placesFound: new Set<string>()
  });

  // Inicializar rodada quando o jogo começar
  useEffect(() => {
    if (gameState.isActive && famousPlaces.length > 0) {
      generateNewRound();
    }
  }, [gameState.isActive, famousPlaces]);

  // Gerar nova rodada
  const generateNewRound = useCallback(() => {
    if (famousPlaces.length === 0) return;

    const shuffledPlaces = [...famousPlaces].sort(() => Math.random() - 0.5);
    const roundPlaces = shuffledPlaces.slice(0, Math.min(defaultConfig.maxPlacesPerRound, famousPlaces.length));

    setCurrentRound(prev => ({
      places: roundPlaces,
      currentIndex: 0,
      roundNumber: prev.roundNumber + 1,
      startTime: Date.now(),
      score: 0,
      placesFound: new Set<string>()
    }));

    console.log(`[useFamousPlacesGame] Nova rodada gerada com ${roundPlaces.length} lugares`);
  }, [famousPlaces, defaultConfig.maxPlacesPerRound]);

  // Selecionar lugar da rodada atual
  const selectPlaceFromRound = useCallback(() => {
    if (currentRound.places.length === 0) return null;
    
    const place = currentRound.places[currentRound.currentIndex];
    console.log(`[useFamousPlacesGame] Lugar selecionado: ${place.name}`);
    return place;
  }, [currentRound.places, currentRound.currentIndex]);

  // Avançar para próximo lugar
  const advanceToNextPlace = useCallback(() => {
    setCurrentRound(prev => ({
      ...prev,
      currentIndex: prev.currentIndex + 1
    }));
  }, []);

  // Completar rodada atual
  const completeCurrentRound = useCallback(() => {
    if (currentRound.currentIndex >= currentRound.places.length) {
      // Rodada completada
      setGameState(prev => ({
        ...prev,
        roundNumber: prev.roundNumber + 1,
        roundTimeLeft: defaultConfig.roundTime
      }));
      
      // Gerar nova rodada se não terminou o jogo
      if (gameState.roundNumber < gameState.totalRounds) {
        generateNewRound();
      } else {
        // Jogo terminou
        setGameState(prev => ({ ...prev, isActive: false }));
      }
    }
  }, [currentRound, gameState.roundNumber, gameState.totalRounds, defaultConfig.roundTime, generateNewRound]);

  // Lidar com clique no mapa
  const handleMapClick = useCallback((latlng: L.LatLng) => {
    if (!gameState.isActive || !currentRound.targetPlaces.length) {
      console.log('[useFamousPlacesGame] Clique ignorado - jogo não ativo ou sem lugares selecionados');
      return;
    }

    const currentPlace = selectPlaceFromRound();
    if (!currentPlace) {
      console.log('[useFamousPlacesGame] Nenhum lugar selecionado para esta rodada');
      return;
    }

    console.log(`[useFamousPlacesGame] Clique em: ${latlng.lat}, ${latlng.lng}`);
    console.log(`[useFamousPlacesGame] Lugar alvo: ${currentPlace.name}`);

    try {
      // Validar o clique
      const validation = validateFamousPlaceClick(
        latlng,
        currentPlace,
        gameState.roundTimeLeft,
        defaultConfig.distanceThreshold
      );

      console.log('[useFamousPlacesGame] Validação:', validation);

      // Calcular pontuação
      const scoreCalculation = calculateFamousPlacesScore(
        validation.distance,
        gameState.roundTimeLeft,
        validation.precision || 0,
        gameState.consecutiveCorrect
      );

      console.log('[useFamousPlacesGame] Pontuação:', scoreCalculation);

      // Atualizar estado do jogo
      setGameState(prev => ({
        ...prev,
        score: prev.score + scoreCalculation.total,
        feedback: validation,
        consecutiveCorrect: validation.isCorrect ? prev.consecutiveCorrect + 1 : 0,
        totalPlacesFound: validation.isCorrect ? prev.totalPlacesFound + 1 : prev.totalPlacesFound
      }));

      // Atualizar rodada atual
      if (validation.isCorrect) {
        setCurrentRound(prev => ({
          ...prev,
          placesFound: [...prev.placesFound, currentPlace],
          roundScore: prev.roundScore + scoreCalculation.total
        }));
      }

      // Atualizar feedback visual
      setVisualFeedback(prev => ({
        ...prev,
        showDistanceCircle: defaultConfig.showDistanceCircle,
        distanceCircleCenter: latlng,
        distanceCircleRadius: validation.distance,
        showArrow: defaultConfig.showArrow && !validation.isCorrect,
        arrowPath: validation.isCorrect ? null : [latlng, { lat: currentPlace.latitude, lng: currentPlace.longitude }] as [L.LatLng, L.LatLng],
        highlightPlace: validation.isCorrect,
        placeColor: validation.isCorrect ? '#00ff00' : '#ff0000'
      }));

      // Se acertou, avançar para próximo lugar
      if (validation.isCorrect) {
        setTimeout(() => {
          advanceToNextPlace();
          completeCurrentRound();
        }, 2000);
      }

    } catch (error) {
      console.error('[useFamousPlacesGame] Erro ao processar clique:', error);
    }
  }, [gameState.isActive, gameState.roundTimeLeft, gameState.consecutiveCorrect, currentRound, defaultConfig, selectPlaceFromRound, advanceToNextPlace, completeCurrentRound]);

  // Atualizar timer
  const updateTimer = useCallback((timeLeft: number) => {
    setGameState(prev => ({
      ...prev,
      roundTimeLeft: timeLeft
    }));

    // Se o tempo acabou, avançar para próxima rodada
    if (timeLeft <= 0 && defaultConfig.autoAdvance) {
      completeCurrentRound();
    }
  }, [completeCurrentRound, defaultConfig.autoAdvance]);

  // Iniciar jogo
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isActive: true,
      currentRound: 1,
      score: 0,
      consecutiveCorrect: 0,
      totalPlacesFound: 0
    }));
    generateNewRound();
  }, [generateNewRound]);

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
      highlightPlace: false
    }));
  }, []);

  // Forçar próxima rodada (para modo manual)
  const forceNextRound = useCallback(() => {
    completeCurrentRound();
  }, [completeCurrentRound]);

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
    return gameState.currentRound;
  }, [gameState.currentRound]);

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
    currentRound,
    
    // Métodos principais
    handleMapClick,
    updateTimer,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    forceNextRound,
    advanceToNextPlace,
    
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