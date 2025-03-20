import React from 'react';
import { styles } from './styles';
import { FeatureCollection } from 'geojson';

interface GameControlsProps {
  gameOver: boolean;
  onPauseGame: () => void;
  onNextRound: (geoJsonData: FeatureCollection) => void;
  geoJsonData: FeatureCollection | null;
  feedbackProgress: number;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameOver,
  onPauseGame,
  onNextRound,
  geoJsonData,
  feedbackProgress
}) => {
  return (
    <div style={styles.buttonContainer}>
      {!gameOver && (
        <button
          onClick={onPauseGame}
          style={styles.pauseButton}
          onMouseOver={(e) => e.currentTarget.style.background = '#FF8C00'}
          onMouseOut={(e) => e.currentTarget.style.background = '#FFA500'}
        >
          Pausar
        </button>
      )}
      <button
        onClick={() => {
          if (gameOver) {
            window.location.reload();
          } else if (geoJsonData) {
            onNextRound(geoJsonData);
          }
        }}
        style={styles.nextButton(gameOver)}
        onMouseOver={(e) => e.currentTarget.style.background = gameOver ? '#CC0000' : '#28a745'}
        onMouseOut={(e) => e.currentTarget.style.background = gameOver ? '#FF0000' : '#32CD32'}
      >
        <div style={styles.progressBar(feedbackProgress)} />
        <span style={styles.buttonText}>
          {gameOver ? 'Tente Outra Vez' : 'Próximo'}
        </span>
      </button>
    </div>
  );
}; 