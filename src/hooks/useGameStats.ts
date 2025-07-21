import { useState, useEffect } from 'react';
import { rankingService } from '../lib/supabase';

interface GameStats {
  highScore: number;
  totalGames: number;
  totalScore: number;
  averageScore: number;
  bestTime: number;
  totalPlayTime: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
}

const STORAGE_KEY = 'jogocaicara_stats';

export const useGameStats = () => {
  const [stats, setStats] = useState<GameStats>({
    highScore: 0,
    totalGames: 0,
    totalScore: 0,
    averageScore: 0,
    bestTime: 0,
    totalPlayTime: 0,
    gamesWon: 0,
    gamesLost: 0,
    winRate: 0
  });

  // Carregar estatísticas do localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem(STORAGE_KEY);
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats);
        setStats(parsedStats);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    }
  }, []);

  // Salvar estatísticas no localStorage
  const saveStats = (newStats: GameStats) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
      setStats(newStats);
    } catch (error) {
      console.error('Erro ao salvar estatísticas:', error);
    }
  };

  // Adicionar resultado de um jogo
  const addGameResult = async (score: number, playTime: number, won: boolean, playerName: string, roundsPlayed: number, accuracy: number) => {
    const newStats = { ...stats };
    
    // Atualizar pontuação máxima
    if (score > newStats.highScore) {
      newStats.highScore = score;
    }
    
    // Atualizar tempo máximo
    if (playTime > newStats.bestTime) {
      newStats.bestTime = playTime;
    }
    
    // Atualizar contadores
    newStats.totalGames += 1;
    newStats.totalScore += score;
    newStats.totalPlayTime += playTime;
    
    if (won) {
      newStats.gamesWon += 1;
    } else {
      newStats.gamesLost += 1;
    }
    
    // Calcular média e taxa de vitória
    newStats.averageScore = Math.round(newStats.totalScore / newStats.totalGames);
    newStats.winRate = Math.round((newStats.gamesWon / newStats.totalGames) * 100);
    
    saveStats(newStats);

    // Salvar no ranking global
    try {
      await rankingService.addScore({
        player_name: playerName,
        score,
        play_time: playTime,
        rounds_played: roundsPlayed,
        accuracy
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar no ranking:', error);
      return false;
    }
  };

  // Função para salvar apenas no ranking (sem atualizar estatísticas locais)
  const saveToRanking = async (playerName: string, score: number, playTime: number, roundsPlayed: number, accuracy: number) => {
    try {
      await rankingService.addScore({
        player_name: playerName,
        score,
        play_time: playTime,
        rounds_played: roundsPlayed,
        accuracy
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar no ranking:', error);
      return false;
    }
  };

  // Resetar estatísticas
  const resetStats = () => {
    const defaultStats: GameStats = {
      highScore: 0,
      totalGames: 0,
      totalScore: 0,
      averageScore: 0,
      bestTime: 0,
      totalPlayTime: 0,
      gamesWon: 0,
      gamesLost: 0,
      winRate: 0
    };
    saveStats(defaultStats);
  };

  // Obter estatísticas formatadas
  const getFormattedStats = () => ({
    highScore: stats.highScore.toLocaleString(),
    totalGames: stats.totalGames.toLocaleString(),
    averageScore: stats.averageScore.toLocaleString(),
    bestTime: formatTime(stats.bestTime),
    totalPlayTime: formatTime(stats.totalPlayTime),
    gamesWon: stats.gamesWon.toLocaleString(),
    gamesLost: stats.gamesLost.toLocaleString(),
    winRate: `${stats.winRate}%`
  });

  // Formatar tempo em segundos para mm:ss
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    stats,
    addGameResult,
    saveToRanking,
    resetStats,
    getFormattedStats
  };
}; 