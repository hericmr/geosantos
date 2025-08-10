import React from 'react';
import { styles } from './FeedbackPanel.styles';
import { PauseIcon, NextIcon, RetryIcon } from './GameIcons';
import { GameMode } from '../../types/famousPlaces';

interface ActionButtonsProps {
  gameOver: boolean;
  onPauseGame: () => void;
  onNextRound: () => void;
  feedbackProgress: number;
  currentMode?: GameMode;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  gameOver,
  onPauseGame,
  onNextRound,
  feedbackProgress,
  currentMode = 'neighborhoods'
}) => {
  return (
    <div style={styles.buttonContainer}>
      {!gameOver && currentMode !== 'famous_places' && (
        <button
          onClick={onPauseGame}
          className="pixel-btn pixel-btn--warning"
          style={styles.button('pause')}
        >
          <PauseIcon size={16} color="var(--text-primary)" />
          Pausar
        </button>
      )}
      {/* Botão Próximo - sempre visível quando não é game over */}
      {!gameOver && (
        <button
          onClick={onNextRound}
          className="pixel-btn pixel-btn--success"
          style={styles.button('next')}
        >
          <div style={styles.progressBar(feedbackProgress, 'rgba(50, 205, 50, 0.3)')} />
          <div style={styles.progressBar(100 - feedbackProgress, 'rgba(255, 0, 0, 0.5)')} />
          <span style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <NextIcon size={16} color="var(--text-primary)" />
            Próximo
          </span>
        </button>
      )}
      
      {/* Botão Tente Outra Vez - apenas quando game over */}
      {gameOver && (
        <button
          onClick={onNextRound}
          className="pixel-btn pixel-btn--danger"
          style={styles.button('retry')}
        >
          <span style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <RetryIcon size={16} color="var(--text-primary)" />
            Tente Outra Vez
          </span>
        </button>
      )}
    </div>
  );
}; 