import { useState, useCallback, useEffect } from 'react';
import * as L from 'leaflet';
import { FamousPlace } from '../../types/famousPlaces';
import { 
  FamousPlacesGameState, 
  FamousPlacesConfig,
  FamousPlacesVisualFeedback,
  FamousPlacesRound
} from '../../types/modes/famousPlaces';
import { ClickValidation } from '../../types/common';
import { validateFamousPlaceClick } from '../../utils/modes/famousPlaces/validation';
import { calculateFamousPlacesScore } from '../../utils/shared';

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
    if (!gameState.isActive || !currentRound.places.length) {
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
        validation.precisionBonus || 0,
        0 // consecutiveCorrect não existe no estado atual
      );

      console.log('[useFamousPlacesGame] Pontuação:', scoreCalculation);

      // Atualizar estado do jogo
      setGameState(prev => ({
        ...prev,
        score: prev.score + scoreCalculation.total,
        feedback: validation
      }));

      // Atualizar rodada atual
      if (validation.isPerfect) {
        const newPlacesFound = new Set(currentRound.placesFound);
        newPlacesFound.add(currentPlace.id);
        
        setCurrentRound(prev => ({
          ...prev,
          placesFound: newPlacesFound,
          score: prev.score + scoreCalculation.total
        }));
      }

      // Atualizar feedback visual
      setVisualFeedback(prev => ({
        ...prev,
        showDistanceCircle: defaultConfig.showDistanceCircle,
        distanceCircleCenter: latlng,
        distanceCircleRadius: validation.distance,
        showArrow: defaultConfig.showArrow && !validation.isPerfect,
        arrowPath: validation.isPerfect ? null : [latlng, { lat: currentPlace.latitude, lng: currentPlace.longitude }] as [L.LatLng, L.LatLng],
        highlightPlace: validation.isPerfect,
        placeMarker: validation.isPerfect ? L.latLng(currentPlace.latitude, currentPlace.longitude) : null
      }));

      // Se acertou, avançar para próximo lugar
      if (validation.isPerfect) {
        setTimeout(() => {
          advanceToNextPlace();
          completeCurrentRound();
        }, 2000);
      }

    } catch (error) {
      console.error('[useFamousPlacesGame] Erro ao processar clique:', error);
    }
  }, [gameState.isActive, gameState.roundTimeLeft, currentRound, defaultConfig, selectPlaceFromRound, advanceToNextPlace, completeCurrentRound]);

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
      roundNumber: 1,
      score: 0
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
    return currentRound;
  }, [currentRound]);

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