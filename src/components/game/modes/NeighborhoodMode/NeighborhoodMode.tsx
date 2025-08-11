import React, { useEffect, useState, useCallback } from 'react';
import * as L from 'leaflet';
import { BaseGameMode } from '../../common/BaseGameMode';
import { 
  NeighborhoodValidation, 
  NeighborhoodGameState, 
  NeighborhoodConfig,
  NeighborhoodVisualFeedback 
} from '../../../../types/modes/neighborhood';
import { validateNeighborhoodClick } from '../../../../utils/modes/neighborhood/validation';
import { calculateNeighborhoodScore } from '../../../../utils/shared';

interface NeighborhoodModeProps {
  geoJsonData: any;
  onStateChange: (state: Partial<NeighborhoodGameState>) => void;
  onFeedback: (feedback: NeighborhoodValidation) => void;
  onRoundComplete: () => void;
  config?: Partial<NeighborhoodConfig>;
}

export const NeighborhoodMode: React.FC<NeighborhoodModeProps> = ({
  geoJsonData,
  onStateChange,
  onFeedback,
  onRoundComplete,
  config = {}
}) => {
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

  // Configuração padrão do modo bairros
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

    // Notificar mudança de estado
    onStateChange({
      currentNeighborhood: selectedNeighborhood,
      roundNumber: gameState.roundNumber
    });
  }, [gameState.availableNeighborhoods, gameState.revealedNeighborhoods, gameState.roundNumber, onStateChange, defaultConfig.roundTime]);

  // Iniciar nova rodada
  const startNewRound = useCallback(() => {
    if (gameState.roundNumber >= gameState.totalRounds) {
      // Jogo terminou
      setGameState(prev => ({ ...prev, isActive: false }));
      onRoundComplete();
      return;
    }

    setGameState(prev => ({
      ...prev,
      roundNumber: prev.roundNumber + 1,
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

    // Selecionar novo bairro
    selectRandomNeighborhood();
  }, [gameState.roundNumber, gameState.totalRounds, onRoundComplete, selectRandomNeighborhood]);

  // Validar clique do jogador
  const handleMapClick = useCallback((latlng: L.LatLng) => {
    if (!gameState.isActive || !gameState.currentNeighborhood) return;

    const validation = validateNeighborhoodClick(
      latlng,
      gameState.currentNeighborhood,
      geoJsonData,
      gameState.roundTimeLeft
    );

    // Calcular pontuação
    const scoreCalculation = calculateNeighborhoodScore(
      validation.distance,
      gameState.roundTimeLeft,
      validation.isCorrectNeighborhood,
      validation.isNearBorder
    );

    // Atualizar estado do jogo
    const newScore = gameState.score + scoreCalculation.total;
    const newRevealedNeighborhoods = new Set(gameState.revealedNeighborhoods);
    
    if (validation.isCorrectNeighborhood) {
      newRevealedNeighborhoods.add(gameState.currentNeighborhood);
    }

    const newGameState: NeighborhoodGameState = {
      ...gameState,
      score: newScore,
      feedback: validation,
      revealedNeighborhoods: newRevealedNeighborhoods
    };

    setGameState(newGameState);

    // Notificar mudanças
    onStateChange({
      score: newScore,
      feedback: validation,
      revealedNeighborhoods: newRevealedNeighborhoods
    });

    onFeedback(validation);

    // Configurar feedback visual
    if (validation.isCorrectNeighborhood) {
      // Acerto: destacar bairro e aguardar avanço automático
      setVisualFeedback(prev => ({
        ...prev,
        highlightNeighborhood: true,
        neighborhoodColor: '#00ff00',
        showDistanceCircle: false,
        showArrow: false
      }));

      // Avançar automaticamente após delay
      if (defaultConfig.autoAdvance) {
        setTimeout(() => {
          startNewRound();
        }, 3000); // 3 segundos para visualizar o acerto
      }
    } else {
      // Erro: mostrar círculo de distância e seta
      setVisualFeedback(prev => ({
        ...prev,
        showDistanceCircle: true,
        distanceCircleCenter: latlng,
        distanceCircleRadius: validation.distance,
        showArrow: true,
        arrowPath: validation.additionalData?.closestPoint ? 
          [latlng, validation.additionalData.closestPoint] : null
      }));
    }
  }, [gameState, geoJsonData, onStateChange, onFeedback, defaultConfig.autoAdvance, startNewRound]);

  // Atualizar timer
  const updateTimer = useCallback((timeLeft: number) => {
    setGameState(prev => ({
      ...prev,
      roundTimeLeft: timeLeft
    }));

    onStateChange({ roundTimeLeft: timeLeft });

    // Tempo esgotado
    if (timeLeft <= 0) {
      // Marcar como erro e avançar
      const timeUpValidation: NeighborhoodValidation = {
        isValid: false,
        distance: 0,
        message: 'Tempo esgotado!',
        score: 0,
        isPerfect: false,
        isCorrectNeighborhood: false,
        neighborhoodName: gameState.currentNeighborhood,
        isNearBorder: false
      };

      setGameState(prev => ({
        ...prev,
        feedback: timeUpValidation
      }));

      onFeedback(timeUpValidation);

      // Avançar automaticamente após delay
      if (defaultConfig.autoAdvance) {
        setTimeout(() => {
          startNewRound();
        }, 2000);
      }
    }
  }, [gameState.currentNeighborhood, onStateChange, onFeedback, defaultConfig.autoAdvance, startNewRound]);

  // Iniciar jogo
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isActive: true,
      roundNumber: 1,
      score: 0,
      revealedNeighborhoods: new Set()
    }));

    onStateChange({
      isActive: true,
      roundNumber: 1,
      score: 0,
      revealedNeighborhoods: new Set()
    });

    // Selecionar primeiro bairro
    selectRandomNeighborhood();
  }, [onStateChange, selectRandomNeighborhood]);

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

  // Limpar recursos
  useEffect(() => {
    return () => {
      setVisualFeedback({
        showDistanceCircle: false,
        showArrow: false,
        arrowPath: null,
        distanceCircleCenter: null,
        distanceCircleRadius: 0,
        highlightNeighborhood: false,
        neighborhoodColor: '#00ff00'
      });
    };
  }, []);

  // Expor métodos para uso externo
  const neighborhoodModeRef = React.useRef<{
    handleMapClick: (latlng: L.LatLng) => void;
    updateTimer: (timeLeft: number) => void;
    startGame: () => void;
    pauseGame: () => void;
    resumeGame: () => void;
    endGame: () => void;
    startNewRound: () => void;
    selectRandomNeighborhood: () => void;
    getCurrentState: () => NeighborhoodGameState;
    getVisualFeedback: () => NeighborhoodVisualFeedback;
  }>(null);

  React.useImperativeHandle(neighborhoodModeRef, () => ({
    handleMapClick,
    updateTimer,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    startNewRound,
    selectRandomNeighborhood,
    getCurrentState: () => gameState,
    getVisualFeedback: () => visualFeedback
  }));

  // Renderização mínima (lógica principal)
  return null;
}; 