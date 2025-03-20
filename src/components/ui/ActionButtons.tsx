import React from 'react';
import { styles } from './FeedbackPanel.styles';

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
          style={styles.button('pause')}
          onMouseOver={(e) => e.currentTarget.style.background = '#FF8C00'}
          onMouseOut={(e) => e.currentTarget.style.background = '#FFA500'}
        >
          Pausar
        </button>
      )}
      <button
        onClick={onNextRound}
        style={styles.button(gameOver ? 'retry' : 'next')}
        onMouseOver={(e) => e.currentTarget.style.background = gameOver ? '#CC0000' : '#28a745'}
        onMouseOut={(e) => e.currentTarget.style.background = gameOver ? '#FF0000' : '#32CD32'}
      >
        <div style={styles.progressBar(feedbackProgress, 'rgba(50, 205, 50, 0.3)')} />
        <div style={styles.progressBar(100 - feedbackProgress, 'rgba(255, 0, 0, 0.5)')} />
        <span style={{
          position: 'relative',
          zIndex: 2
        }}>
          {gameOver ? 'Tente Outra Vez' : 'Próximo'}
        </span>
      </button>
    </div>
  );
}; 