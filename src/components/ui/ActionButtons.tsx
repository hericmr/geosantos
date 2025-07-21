import React from 'react';
import { styles } from './FeedbackPanel.styles';
import { PauseIcon, NextIcon, RetryIcon } from './GameIcons';

interface ActionButtonsProps {
  gameOver: boolean;
  onPauseGame: () => void;
  onNextRound: () => void;
  feedbackProgress: number;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  gameOver,
  onPauseGame,
  onNextRound,
  feedbackProgress
}) => {
  return (
    <div style={styles.buttonContainer}>
      {!gameOver && (
        <button
          onClick={onPauseGame}
          className="pixel-btn pixel-btn--warning"
          style={styles.button('pause')}
        >
          <PauseIcon size={16} color="var(--text-primary)" />
          Pausar
        </button>
      )}
      <button
        onClick={onNextRound}
        className={`pixel-btn ${gameOver ? 'pixel-btn--danger' : 'pixel-btn--success'}`}
        style={styles.button(gameOver ? 'retry' : 'next')}
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
          {gameOver ? (
            <>
              <RetryIcon size={16} color="var(--text-primary)" />
              Tente Outra Vez
            </>
          ) : (
            <>
              <NextIcon size={16} color="var(--text-primary)" />
              Próximo
            </>
          )}
        </span>
      </button>
    </div>
  );
}; 