import { useState, useEffect, useRef } from 'react';
import { LatLng } from 'leaflet';
import { GameState } from '../types/game';
import { ROUND_TIME, TIME_BONUS_THRESHOLDS, TIME_BONUS_AMOUNTS, calculateTimeBonus } from '../utils/gameConstants';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentNeighborhood: '',
    score: 0,
    timeLeft: ROUND_TIME,
    totalTimeLeft: 300,
    roundInitialTime: ROUND_TIME,
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
    if (gameState.gameStarted && !gameState.gameOver && gameState.timeLeft > 0 && gameState.isCountingDown && !gameState.isPaused) {
      const timer = setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 0) {
            return { ...prev, gameOver: true, timeLeft: 0, showFeedback: true };
          }
          return { 
            ...prev, 
            timeLeft: prev.timeLeft - 0.1,
            totalTimeLeft: prev.totalTimeLeft - 0.1
          };
        });
      }, 100);

      return () => clearInterval(timer);
    }
  }, [gameState.gameStarted, gameState.gameOver, gameState.isCountingDown, gameState.isPaused]);

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
        timeLeft: ROUND_TIME,
        totalTimeLeft: ROUND_TIME,
        roundInitialTime: ROUND_TIME,
        roundNumber: 1,
        isCountingDown: false,
        isPaused: false,
        revealedNeighborhoods: new Set(),
        totalDistance: 0,
        gameMode: prev.gameMode || 'neighborhoods',
        currentNeighborhood: isFamousPlaces ? '' : prev.currentNeighborhood,
      };
    });
    // O controle do lugar famoso é feito pelo FamousPlacesManager
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        isCountingDown: true,
      }));
    }, 100);
  };

  const startNextRound = (geoJsonData: any) => {
    setGameState(prev => {
      const nextRoundNumber = prev.roundNumber + 1;
      if (prev.gameMode === 'famous_places') {
        // O controle do lugar famoso é feito pelo FamousPlacesManager
        return {
          ...prev,
          clickedPosition: null,
          arrowPath: null,
          showFeedback: false,
          feedbackOpacity: 0,
          timeLeft: ROUND_TIME,
          roundInitialTime: ROUND_TIME,
          roundNumber: nextRoundNumber,
          isCountingDown: false,
          currentNeighborhood: '',
          revealedNeighborhoods: new Set(),
          timeBonus: 0
        };
      } else {
        const features = geoJsonData.features;
        const randomIndex = Math.floor(Math.random() * features.length);
        const neighborhood = features[randomIndex].properties?.NOME;
        return {
          ...prev,
          clickedPosition: null,
          arrowPath: null,
          showFeedback: false,
          feedbackOpacity: 0,
          timeLeft: ROUND_TIME,
          roundInitialTime: ROUND_TIME,
          roundNumber: nextRoundNumber,
          isCountingDown: false,
          currentNeighborhood: neighborhood,
          revealedNeighborhoods: new Set(),
          timeBonus: 0
        };
      }
    });
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        isCountingDown: true
      }));
    }, 100);
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