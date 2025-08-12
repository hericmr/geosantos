import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as L from 'leaflet';
import { BaseGameMode } from '../../common/BaseGameMode';
import { 
  NeighborhoodValidation, 
  NeighborhoodGameState, 
  NeighborhoodConfig,
  NeighborhoodVisualFeedback 
} from '../../../../types/modes/neighborhood';
// CORREÇÃO: Usar validação específica para modo Neighborhood
import { validateNeighborhoodClickForMode } from '../../../../utils/shared/validation';
import { calculateNeighborhoodScore } from '../../../../utils/shared';
import { FEEDBACK_BAR_DURATION } from '../../../../constants/game';

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

  // Estado para feedback visual
  const [visualFeedback, setVisualFeedback] = useState<NeighborhoodVisualFeedback>({
    highlightNeighborhood: false,
    neighborhoodColor: '#00ff00',
    showDistanceCircle: false,
    showArrow: false,
    arrowPath: null,
    distanceCircleCenter: null,
    distanceCircleRadius: 0
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
      // CORREÇÃO: Usar normalização para extrair nomes consistentemente
      const neighborhoods = geoJsonData.features
        .map((feature: any) => {
          // Usar função de normalização compartilhada
          if (feature.properties?.NOME) return feature.properties.NOME;
          if (feature.properties?.name) return feature.properties.name;
          if (feature.properties?.NOME_BAIRRO) return feature.properties.NOME_BAIRRO;
          return null;
        })
        .filter((name: string | null): name is string => name !== null);
      
      setGameState(prev => ({
        ...prev,
        availableNeighborhoods: neighborhoods,
        totalRounds: Math.min(neighborhoods.length, defaultConfig.maxRounds)
      }));
    }
  }, [geoJsonData, defaultConfig.maxRounds]);

  // Selecionar bairro aleatório para a rodada
  const selectRandomNeighborhood = useCallback(() => {
    console.log('[NeighborhoodMode] selectRandomNeighborhood chamado - Stack trace:', new Error().stack);
    
    if (gameState.availableNeighborhoods.length === 0) {
      console.log('[NeighborhoodMode] Nenhum bairro disponível');
      return;
    }

    const availableNeighborhoods = gameState.availableNeighborhoods.filter(
      name => !gameState.revealedNeighborhoods.has(name)
    );

    if (availableNeighborhoods.length === 0) {
      // Todos os bairros foram revelados, resetar
      console.log('[NeighborhoodMode] Todos os bairros revelados - resetando');
      setGameState(prev => ({
        ...prev,
        revealedNeighborhoods: new Set(),
        roundNumber: 1
      }));
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableNeighborhoods.length);
    const selectedNeighborhood = availableNeighborhoods[randomIndex];

    console.log('[NeighborhoodMode] Selecionando bairro:', selectedNeighborhood);

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
    
    console.log('[NeighborhoodMode] Bairro selecionado com sucesso:', selectedNeighborhood);
  }, [gameState.availableNeighborhoods, gameState.revealedNeighborhoods, gameState.roundNumber, onStateChange, defaultConfig.roundTime]);

  // Iniciar nova rodada
  const startNewRound = useCallback(() => {
    console.log('[NeighborhoodMode] startNewRound chamado');
    
    if (gameState.roundNumber >= gameState.totalRounds) {
      // Jogo terminou
      console.log('[NeighborhoodMode] Jogo terminou - todas as rodadas completas');
      setGameState(prev => ({ ...prev, isActive: false }));
      onRoundComplete();
      return;
    }

    console.log('[NeighborhoodMode] Iniciando nova rodada:', gameState.roundNumber + 1);
    
    setGameState(prev => ({
      ...prev,
      roundNumber: prev.roundNumber + 1,
      feedback: null
    }));

    // CORREÇÃO: Limpar feedback visual MAS preservar destaque do bairro se ainda estiver em delay
    setVisualFeedback(prev => {
      // NOVA ABORDAGEM: Sempre limpar o destaque no início de uma nova rodada
      console.log('[NeighborhoodMode] Limpando destaque do bairro para nova rodada');
      
      return {
        ...prev,
        highlightNeighborhood: false,
        neighborhoodColor: '#00ff00',
        showDistanceCircle: false,
        showArrow: false,
        arrowPath: null,
        distanceCircleCenter: null,
        distanceCircleRadius: 0
      };
    });

    // Selecionar novo bairro
    selectRandomNeighborhood();
    
    console.log('[NeighborhoodMode] Nova rodada iniciada com sucesso');
  }, [gameState.roundNumber, gameState.totalRounds, onRoundComplete, selectRandomNeighborhood]);

  // Validar clique do jogador
  const handleMapClick = useCallback((latlng: L.LatLng) => {
    if (!gameState.isActive || !gameState.currentNeighborhood) return;

    const validation = validateNeighborhoodClickForMode(
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
      // NOVA ABORDAGEM: Delay simples de 1 segundo após o clique
      console.log('[NeighborhoodMode] Acerto detectado - destacando bairro em 1s');
      
      // Primeiro, limpar feedback visual imediatamente (SEM destaque)
      setVisualFeedback(prev => ({
        ...prev,
        highlightNeighborhood: false, // Inicialmente false
        neighborhoodColor: '#00ff00',
        showDistanceCircle: false,
        showArrow: false
      }));
      
      // NOVA ABORDAGEM: Delay simples de 1 segundo após o clique
      setTimeout(() => {
        console.log('[NeighborhoodMode] Ativando destaque do bairro após 1s do clique');
        setVisualFeedback(prev => ({
          ...prev,
          highlightNeighborhood: true, // Agora ativa o destaque
          neighborhoodColor: '#00ff00'
        }));
      }, 3000); // 1000ms = 1 segundo após o clique

      // Avançar automaticamente após delay
      if (defaultConfig.autoAdvance) {
        // CORREÇÃO: Executar startNewRound automaticamente após 2 segundos
        console.log('[NeighborhoodMode] Executando startNewRound automaticamente após 2 segundos');
        setTimeout(() => {
          startNewRound();
        }, FEEDBACK_BAR_DURATION);
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
        // CORREÇÃO: Avançar imediatamente quando tempo esgota
        console.log('[NeighborhoodMode] Tempo esgotado - avançando automaticamente');
        startNewRound();
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
        highlightNeighborhood: false,
        neighborhoodColor: '#00ff00',
        showDistanceCircle: false,
        showArrow: false,
        arrowPath: null,
        distanceCircleCenter: null,
        distanceCircleRadius: 0
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