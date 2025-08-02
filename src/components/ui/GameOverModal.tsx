import React, { useState, useEffect } from 'react';
import { rankingService } from '../../lib/supabase';
import {
  ScoreDisplay,
  StatsDisplay,
  SaveScoreForm,
  RankingPosition,
  TopRanking,
  ConfettiEffect,
  ActionButtons
} from './GameOverModal/index';
import styles from './GameOverModal.module.css';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
  score: number;
  playTime: number;
  roundsPlayed: number;
  accuracy: number;
  currentPlayerName: string;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onClose,
  onPlayAgain,
  score,
  playTime,
  roundsPlayed,
  accuracy,
  currentPlayerName
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [rankingData, setRankingData] = useState<any[]>([]);
  const [playerPosition, setPlayerPosition] = useState<number | null>(null);
  const [showRankingPosition, setShowRankingPosition] = useState(false);

  const fetchRanking = async () => {
    try {
      const data = await rankingService.getTopPlayers(3);
      if (data) {
        setRankingData(data.slice(0, 3));
      }
    } catch (err) {
      console.error("Erro ao buscar ranking:", err);
    }
  };

  const fetchPlayerPosition = async () => {
    try {
      const position = await rankingService.getPlayerPosition(currentPlayerName, score);
      setPlayerPosition(position);
      setShowRankingPosition(true);
    } catch (err) {
      console.error("Erro ao buscar posição do jogador:", err);
    }
  };

  const handleScoreSaved = async () => {
    setShowConfetti(true);
    await fetchRanking();
    
    // Buscar posição do jogador após salvar
    await fetchPlayerPosition();
    
    // Parar confetti após 3 segundos
    setTimeout(() => setShowConfetti(false), 3000);
  };

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(false);
      setShowRankingPosition(false);
      setPlayerPosition(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      data-testid="game-over-modal"
    >
      <ConfettiEffect isVisible={showConfetti} />

      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h1 
            id="game-over-title"
            className={styles.title}
            data-testid="game-over-title"
          >
            GAME OVER
          </h1>
          <p className={styles.subtitle}>
            DESAFIO GEOGRÁFICO DE SANTOS
          </p>
        </div>

        {/* Pontuação */}
        <ScoreDisplay score={score} />

        {/* Estatísticas */}
        <StatsDisplay
          playTime={playTime}
          roundsPlayed={roundsPlayed}
          accuracy={accuracy}
        />

        {/* Formulário de salvamento */}
        <SaveScoreForm
          currentPlayerName={currentPlayerName}
          score={score}
          playTime={playTime}
          roundsPlayed={roundsPlayed}
          accuracy={accuracy}
          onScoreSaved={handleScoreSaved}
        />

        {/* Posição no Ranking */}
        <RankingPosition
          position={playerPosition}
          isVisible={showRankingPosition}
        />

        {/* Top 3 do Ranking */}
        {showRankingPosition && (
          <TopRanking rankingData={rankingData} />
        )}

        {/* Botões de ação */}
        <ActionButtons
          score={score}
          onPlayAgain={onPlayAgain}
          onClose={onClose}
        />
      </div>
    </div>
  );
}; 