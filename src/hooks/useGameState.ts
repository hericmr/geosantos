import { useState, useEffect, useRef } from 'react';
import { LatLng } from 'leaflet';
import { GameState } from '../types/game';
import { INITIAL_TIME, ROUND_TIME, TIME_BONUS_THRESHOLDS, TIME_BONUS_AMOUNTS, calculateTimeBonus } from '../utils/gameConstants';

export const useGameState = (externalPause: boolean = false) => {
  const [gameState, setGameState] = useState<GameState>({
    currentNeighborhood: '',
    score: 0,
    globalTimeLeft: INITIAL_TIME,
    roundTimeLeft: INITIAL_TIME, // Usar INITIAL_TIME em vez de ROUND_TIME
    roundInitialTime: INITIAL_TIME, // Usar INITIAL_TIME em vez de ROUND_TIME
    roundNumber: 1,
    gameOver: false,
    gameStarted: false,
    isCountingDown: false,
    isPaused: false,
    clickedPosition: null,
    showFeedback: false,
    feedbackOpacity: 0,
    feedbackProgress: 0,
    feedbackMessage: '',
    revealedNeighborhoods: new Set(),
    clickTime: 0,
    timeBonus: 0,
    isMuted: false,
    volume: 0.5,
    arrowPath: null,
    lastClickTime: 0,
    totalDistance: 0,
    gameMode: 'neighborhoods', // valor padrão
  });

  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver && gameState.roundTimeLeft > 0 && gameState.globalTimeLeft > 0 && gameState.isCountingDown && !gameState.isPaused && !externalPause) {
      const timer = setInterval(() => {
        setGameState(prev => {
          if (prev.roundTimeLeft <= 0 || prev.globalTimeLeft <= 0) {
            return { ...prev, gameOver: true, roundTimeLeft: 0, globalTimeLeft: 0, showFeedback: true };
          }
          return { 
            ...prev, 
            roundTimeLeft: prev.roundTimeLeft - 0.1,
            globalTimeLeft: prev.globalTimeLeft - 0.1
          };
        });
      }, 100);

      return () => clearInterval(timer);
    }
  }, [gameState.gameStarted, gameState.gameOver, gameState.isCountingDown, gameState.isPaused, externalPause]);

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  const startGame = () => {
    setGameState(prev => {
      const isFamousPlaces = (prev.gameMode === 'famous_places');
      return {
        ...prev,
        gameStarted: true,
        score: 0,
        gameOver: false,
        globalTimeLeft: INITIAL_TIME,
        roundTimeLeft: INITIAL_TIME, // Usar o tempo inicial como tempo da rodada
        roundInitialTime: INITIAL_TIME, // Usar o tempo inicial como referência da barra
        roundNumber: 1,
        isCountingDown: true, // CORREÇÃO: Definir como true imediatamente
        isPaused: false,
        revealedNeighborhoods: new Set(),
        totalDistance: 0,
        gameMode: prev.gameMode || 'neighborhoods',
        currentNeighborhood: isFamousPlaces ? '' : prev.currentNeighborhood,
      };
    });
    // REMOVIDO: Não precisamos mais do delay para isCountingDown
    // O isCountingDown já é definido como true imediatamente acima
  };

  const startNextRound = (geoJsonData: any) => {
    // OTIMIZAÇÃO: Usar requestIdleCallback para melhor performance
    const scheduleNextRound = () => {
      setGameState(prev => {
        const nextRoundNumber = prev.roundNumber + 1;
        const timeBonus = prev.timeBonus || 0;
        const newGlobalTime = Math.max(prev.globalTimeLeft + timeBonus, 0);
        
        // ESTADO BASE COMUM (evita duplicação)
        const baseState = {
          clickedPosition: null,
          arrowPath: null,
          showFeedback: false,
          feedbackOpacity: 0,
          globalTimeLeft: newGlobalTime,
          roundTimeLeft: newGlobalTime,
          roundInitialTime: newGlobalTime,
          roundNumber: nextRoundNumber,
          isCountingDown: true, // CORREÇÃO: Definir como true imediatamente
          timeBonus: 0
        };
        
        if (prev.gameMode === 'famous_places') {
          return {
            ...prev,
            ...baseState,
            currentNeighborhood: '',
            revealedNeighborhoods: new Set()
          };
        } else {
          // OTIMIZAÇÃO: Seleção mais eficiente de bairro
          const features = geoJsonData.features;
          const randomIndex = Math.floor(Math.random() * features.length);
          const neighborhood = features[randomIndex].properties?.NOME;
          
          return {
            ...prev,
            ...baseState,
            currentNeighborhood: neighborhood,
            revealedNeighborhoods: new Set()
          };
        }
      });
      
      // REMOVIDO: Não precisamos mais do delay para isCountingDown
      // O isCountingDown já é definido como true imediatamente acima
    };
    
    // Usar requestIdleCallback se disponível, senão executar imediatamente
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(scheduleNextRound);
    } else {
      scheduleNextRound();
    }
  };

  const clearFeedbackTimer = () => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  };

  return {
    gameState,
    updateGameState,
    startGame,
    startNextRound,
    clearFeedbackTimer,
    feedbackTimerRef,
  };
}; 