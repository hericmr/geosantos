import React from 'react';
import { styles } from './styles';

interface GameOverPanelProps {
  score: number;
  onRestart: () => void;
}

export const GameOverPanel: React.FC<GameOverPanelProps> = ({
  score,
  onRestart
}) => {
  return (
    <div style={styles.gameOverContainer}>
      <h2 style={styles.gameOverTitle}>
        Game Over
      </h2>
      <div style={styles.scoreContainer}>
        <span style={styles.scoreLabel}>Pontuação Final</span>
        <span style={styles.scoreValue}>{score}</span>
      </div>
      <div style={styles.buttonContainer}>
        <button
          onClick={onRestart}
          style={styles.nextButton(true)}
        >
          <span style={styles.buttonText}>Tente Outra Vez</span>
        </button>
      </div>
    </div>
  );
}; 