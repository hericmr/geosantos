import React, { useEffect, useState, useCallback } from 'react';
import * as L from 'leaflet';
import { BaseGameMode } from '../../common/BaseGameMode';
import { 
  FamousPlacesValidation, 
  FamousPlacesGameState, 
  FamousPlacesConfig,
  FamousPlacesVisualFeedback,
  FamousPlacesRound
} from '../../../../types/modes/famousPlaces';
import { validateFamousPlaceClick } from '../../../../utils/modes/famousPlaces/validation';
import { calculateFamousPlacesScore } from '../../../../utils/modes/famousPlaces/scoring';
import { FamousPlace } from '../../../../types/famousPlaces';

interface FamousPlacesModeProps {
  famousPlaces: FamousPlace[];
  onStateChange: (state: Partial<FamousPlacesGameState>) => void;
  onFeedback: (feedback: FamousPlacesValidation) => void;
  onRoundComplete: () => void;
  onPlaceChange: (place: FamousPlace) => void;
  config?: Partial<FamousPlacesConfig>;
}

export const FamousPlacesMode: React.FC<FamousPlacesModeProps> = ({
  famousPlaces,
  onStateChange,
  onFeedback,
  onRoundComplete,
  onPlaceChange,
  config = {}
}) => {
  const [gameState, setGameState] = useState<FamousPlacesGameState>({
    currentPlace: null,
    roundPlaces: [],
    usedPlaces: new Set(),
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
    showModal: true,
    modalPosition: 'center'
  });

  const [currentRound, setCurrentRound] = useState<FamousPlacesRound | null>(null);

  // Configuração padrão do modo lugares famosos
  const defaultConfig: FamousPlacesConfig = {
    roundTime: 15,
    maxRounds: 10,
    autoAdvance: false, // Lugares famosos não avançam automaticamente
    showDistanceCircle: true,
    showArrow: true,
    soundEffects: true,
    distanceThreshold: 100,
    precisionBonusThreshold: 100,
    timeBonusThreshold: 5,
    maxPlacesPerRound: 5,
    ...config
  };

  // Inicializar primeira rodada quando o jogo inicia
  useEffect(() => {
    if (famousPlaces.length > 0 && gameState.roundPlaces.length === 0) {
      generateNewRound();
    }
  }, [famousPlaces]);

  // Gerar nova rodada de lugares
  const generateNewRound = useCallback(() => {
    if (famousPlaces.length === 0) return;

    const roundSize = Math.min(defaultConfig.maxPlacesPerRound, famousPlaces.length);
    const availablePlaces = famousPlaces.filter(place => !gameState.usedPlaces.has(place.id));
    
    // Se não há lugares suficientes, resetar lugares usados
    if (availablePlaces.length < roundSize) {
      setGameState(prev => ({ 
        ...prev, 
        usedPlaces: new Set(),
        roundPlaces: famousPlaces.slice(0, roundSize)
      }));
      return;
    }
    
    // Selecionar lugares aleatórios para a rodada
    const selectedPlaces: FamousPlace[] = [];
    const shuffled = [...availablePlaces].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < roundSize; i++) {
      if (shuffled[i]) {
        selectedPlaces.push(shuffled[i]);
      }
    }
    
    setGameState(prev => ({
      ...prev,
      roundPlaces: selectedPlaces,
      currentRoundIndex: 0
    }));

    // Configurar rodada atual
    const newRound: FamousPlacesRound = {
      places: selectedPlaces,
      currentIndex: 0,
      roundNumber: gameState.roundNumber,
      startTime: Date.now(),
      score: 0,
      placesFound: new Set()
    };
    
    setCurrentRound(newRound);
    
    // Selecionar primeiro lugar da rodada
    if (selectedPlaces.length > 0) {
      selectPlaceFromRound(0);
    }
  }, [famousPlaces, gameState.usedPlaces, gameState.roundNumber, defaultConfig.maxPlacesPerRound]);

  // Selecionar lugar específico da rodada atual
  const selectPlaceFromRound = useCallback((index: number) => {
    if (gameState.roundPlaces.length === 0 || index < 0 || index >= gameState.roundPlaces.length) {
      return;
    }

    const selectedPlace = gameState.roundPlaces[index];
    
    setGameState(prev => ({
      ...prev,
      currentPlace: selectedPlace,
      currentRoundIndex: index,
      roundTimeLeft: defaultConfig.roundTime
    }));

    // Notificar mudança de lugar
    onPlaceChange(selectedPlace);
    
    // Atualizar rodada atual
    if (currentRound) {
      setCurrentRound(prev => prev ? {
        ...prev,
        currentIndex: index
      } : null);
    }
  }, [gameState.roundPlaces, defaultConfig.roundTime, onPlaceChange, currentRound]);

  // Avançar para o próximo lugar da rodada
  const advanceToNextPlace = useCallback(() => {
    if (!currentRound) return;

    const nextIndex = currentRound.currentIndex + 1;
    
    if (nextIndex < currentRound.places.length) {
      // Ainda há lugares na rodada atual
      selectPlaceFromRound(nextIndex);
    } else {
      // Rodada terminou, gerar nova rodada
      completeCurrentRound();
    }
  }, [currentRound, selectPlaceFromRound]);

  // Completar rodada atual
  const completeCurrentRound = useCallback(() => {
    if (!currentRound) return;

    // Marcar lugares da rodada como usados
    const newUsedPlaces = new Set(gameState.usedPlaces);
    currentRound.places.forEach(place => newUsedPlaces.add(place.id));

    setGameState(prev => ({
      ...prev,
      usedPlaces: newUsedPlaces,
      roundNumber: prev.roundNumber + 1,
      roundPlaces: [],
      currentRoundIndex: 0
    }));

    // Notificar que a rodada foi completada
    onRoundComplete();

    // Gerar nova rodada
    generateNewRound();
  }, [currentRound, gameState.usedPlaces, onRoundComplete, generateNewRound]);

  // Validar clique do jogador
  const handleMapClick = useCallback((latlng: L.LatLng) => {
    if (!gameState.isActive || !gameState.currentPlace) return;

    const validation = validateFamousPlaceClick(
      latlng,
      gameState.currentPlace,
      gameState.roundTimeLeft,
      defaultConfig.distanceThreshold
    );

    // Calcular pontuação
    const consecutiveCorrect = currentRound?.placesFound.size || 0;
    const scoreCalculation = calculateFamousPlacesScore(
      validation.distance,
      gameState.roundTimeLeft,
      validation.precisionBonus / 1000, // Converter para decimal
      consecutiveCorrect
    );

    // Atualizar estado do jogo
    const newScore = gameState.score + scoreCalculation.total;
    
    // Atualizar rodada atual
    if (currentRound && validation.isCorrectPlace) {
      const newPlacesFound = new Set(currentRound.placesFound);
      newPlacesFound.add(gameState.currentPlace.id);
      
      setCurrentRound(prev => prev ? {
        ...prev,
        placesFound: newPlacesFound,
        score: prev.score + scoreCalculation.total
      } : null);
    }

    const newGameState: FamousPlacesGameState = {
      ...gameState,
      score: newScore,
      feedback: validation
    };

    setGameState(newGameState);

    // Notificar mudanças
    onStateChange({
      score: newScore,
      feedback: validation
    });

    onFeedback(validation);

    // Configurar feedback visual
    if (validation.isCorrectPlace) {
      // Acerto: destacar lugar e aguardar confirmação manual
      setVisualFeedback(prev => ({
        ...prev,
        highlightPlace: true,
        placeMarker: validation.targetLatLng,
        showDistanceCircle: false,
        showArrow: false,
        showModal: true,
        modalPosition: 'center'
      }));

      // Não avançar automaticamente - aguardar confirmação do jogador
    } else {
      // Erro: mostrar círculo de distância e seta
      setVisualFeedback(prev => ({
        ...prev,
        showDistanceCircle: true,
        distanceCircleCenter: latlng,
        distanceCircleRadius: validation.distance,
        showArrow: true,
        arrowPath: [latlng, validation.targetLatLng],
        showModal: false
      }));
    }
  }, [gameState, defaultConfig.distanceThreshold, currentRound, onStateChange, onFeedback]);

  // Atualizar timer
  const updateTimer = useCallback((timeLeft: number) => {
    setGameState(prev => ({
      ...prev,
      roundTimeLeft: timeLeft
    }));

    onStateChange({ roundTimeLeft: timeLeft });

    // Tempo esgotado
    if (timeLeft <= 0) {
      // Marcar como erro e aguardar confirmação manual
      const timeUpValidation: FamousPlacesValidation = {
        isValid: false,
        distance: 0,
        message: 'Tempo esgotado!',
        score: 0,
        isPerfect: false,
        isCorrectPlace: false,
        placeName: gameState.currentPlace?.name || '',
        targetLatLng: L.latLng(0, 0),
        clickedLatLng: L.latLng(0, 0),
        distanceThreshold: defaultConfig.distanceThreshold,
        precisionBonus: 0
      };

      setGameState(prev => ({
        ...prev,
        feedback: timeUpValidation
      }));

      onFeedback(timeUpValidation);

      // Mostrar modal de tempo esgotado
      setVisualFeedback(prev => ({
        ...prev,
        showModal: true,
        modalPosition: 'center'
      }));
    }
  }, [gameState.currentPlace, onStateChange, onFeedback, defaultConfig.distanceThreshold]);

  // Iniciar jogo
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isActive: true,
      roundNumber: 1,
      score: 0,
      usedPlaces: new Set()
    }));

    onStateChange({
      isActive: true,
      roundNumber: 1,
      score: 0,
      usedPlaces: new Set()
    });

    // Gerar primeira rodada
    generateNewRound();
  }, [onStateChange, generateNewRound]);

  // Pausar jogo
  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isActive: false }));
    onStateChange({ isActive: false });
  }, [onStateChange]);

  // Retomar jogo
  const resumeGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isActive: true }));
    onStateChange({ isActive: true });
  }, [onStateChange]);

  // Finalizar jogo
  const endGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isActive: false }));
    onStateChange({ isActive: false });
    onRoundComplete();
  }, [onStateChange, onRoundComplete]);

  // Forçar próxima rodada (para uso externo)
  const forceNextRound = useCallback(() => {
    if (gameState.currentPlace) {
      // Marcar lugar atual como encontrado se não foi marcado
      if (currentRound && !currentRound.placesFound.has(gameState.currentPlace.id)) {
        const newPlacesFound = new Set(currentRound.placesFound);
        newPlacesFound.add(gameState.currentPlace.id);
        
        setCurrentRound(prev => prev ? {
          ...prev,
          placesFound: newPlacesFound
        } : null);
      }
      
      // Avançar para próximo lugar
      advanceToNextPlace();
    }
  }, [gameState.currentPlace, currentRound, advanceToNextPlace]);

  // Limpar recursos
  useEffect(() => {
    return () => {
      setVisualFeedback({
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
    };
  }, []);

  // Expor métodos para uso externo
  const famousPlacesModeRef = React.useRef<{
    handleMapClick: (latlng: L.LatLng) => void;
    updateTimer: (timeLeft: number) => void;
    startGame: () => void;
    pauseGame: () => void;
    resumeGame: () => void;
    endGame: () => void;
    advanceToNextPlace: () => void;
    forceNextRound: () => void;
    selectPlaceFromRound: (index: number) => void;
    getCurrentState: () => FamousPlacesGameState;
    getVisualFeedback: () => FamousPlacesVisualFeedback;
    getCurrentRound: () => FamousPlacesRound | null;
  }>(null);

  React.useImperativeHandle(famousPlacesModeRef, () => ({
    handleMapClick,
    updateTimer,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    advanceToNextPlace,
    forceNextRound,
    selectPlaceFromRound,
    getCurrentState: () => gameState,
    getVisualFeedback: () => visualFeedback,
    getCurrentRound: () => currentRound
  }));

  // Renderização mínima (lógica principal)
  return null;
}; 