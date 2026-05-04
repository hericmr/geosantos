import { useState, useEffect, useRef } from 'react';
import { GameState } from '../types/game';
import { INITIAL_TIME, ROUND_TIME, calculateTimeBonus } from '../utils/gameConstants';

export const useGameState = (externalPause: boolean = false) => {
  const [gameState, setGameState] = useState<GameState>({
    currentNeighborhood: '',
    score: 0,
    globalTimeLeft: INITIAL_TIME,
    roundTimeLeft: INITIAL_TIME,
    roundInitialTime: INITIAL_TIME,
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
    consecutiveCorrect: 0,
    roundScore: 0,
    gameMode: 'neighborhoods',
  });

  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const shouldTick =
      gameState.gameStarted &&
      !gameState.gameOver &&
      gameState.roundTimeLeft > 0 &&
      gameState.globalTimeLeft > 0 &&
      gameState.isCountingDown &&
      !gameState.isPaused &&
      !externalPause &&
      !gameState.showFeedback &&
      gameState.feedbackProgress === 0;

    if (!shouldTick) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.roundTimeLeft <= 0 || prev.globalTimeLeft <= 0)
          return { ...prev, gameOver: true, roundTimeLeft: 0, globalTimeLeft: 0, showFeedback: false };

        if (prev.showFeedback || prev.feedbackProgress > 0) return prev;

        return {
          ...prev,
          roundTimeLeft: prev.roundTimeLeft - 0.1,
          globalTimeLeft: prev.globalTimeLeft - 0.1
        };
      });
    }, 100);

    return () => clearInterval(timer);
  }, [
    gameState.gameStarted, gameState.gameOver, gameState.roundTimeLeft,
    gameState.globalTimeLeft, gameState.isCountingDown, gameState.isPaused,
    externalPause, gameState.showFeedback, gameState.feedbackProgress
  ]);

  const updateGameState = (updates: Partial<GameState>) =>
    setGameState(prev => ({ ...prev, ...updates }));

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      score: 0,
      gameOver: false,
      globalTimeLeft: INITIAL_TIME,
      roundTimeLeft: INITIAL_TIME,
      roundInitialTime: INITIAL_TIME,
      roundNumber: 1,
      isCountingDown: true,
      isPaused: false,
      revealedNeighborhoods: new Set(),
      totalDistance: 0,
      gameMode: prev.gameMode || 'neighborhoods',
      currentNeighborhood: prev.gameMode === 'famous_places' ? '' : prev.currentNeighborhood,
    }));
  };

  const startNextRound = (geoJsonData: any) => {
    setGameState(prev => {
      const base = {
        clickedPosition: null,
        arrowPath: null,
        showFeedback: false,
        feedbackOpacity: 0,
        feedbackProgress: 0,
        globalTimeLeft: Math.max(prev.globalTimeLeft + (prev.timeBonus || 0), 0),
        roundTimeLeft: Math.max(prev.globalTimeLeft + (prev.timeBonus || 0), 0),
        roundInitialTime: Math.max(prev.globalTimeLeft + (prev.timeBonus || 0), 0),
        roundNumber: prev.roundNumber + 1,
        isCountingDown: true,
        isPaused: false,
        timeBonus: 0,
        revealedNeighborhoods: new Set<string>()
      };

      if (prev.gameMode === 'famous_places') {
        return { ...prev, ...base, currentNeighborhood: '' };
      }

      if (geoJsonData?.features?.length > 0) {
        const available = geoJsonData.features.filter(
          (f: any) => f.properties?.NOME !== prev.currentNeighborhood
        );
        const pool = available.length > 0 ? available : geoJsonData.features;
        const newNeighborhood = pool[Math.floor(Math.random() * pool.length)].properties?.NOME ?? '';
        return { ...prev, ...base, currentNeighborhood: newNeighborhood };
      }

      return { ...prev, ...base };
    });
  };

  const clearFeedbackTimer = () => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  };

  return { gameState, updateGameState, startGame, startNextRound, clearFeedbackTimer, feedbackTimerRef };
};
