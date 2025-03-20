import React from 'react';
import { LatLng } from 'leaflet';
import { FeatureCollection } from 'geojson';
import { styles } from './styles';
import { GameOverPanel } from './GameOverPanel';
import { FeedbackMessage } from './FeedbackMessage';
import { GameControls } from './GameControls';

interface FeedbackPanelProps {
  showFeedback: boolean;
  clickedPosition: LatLng | null;
  arrowPath: [LatLng, LatLng] | null;
  clickTime: number;
  feedbackProgress: number;
  onNextRound: (geoJsonData: FeatureCollection) => void;
  calculateDistance: (point1: LatLng, point2: LatLng) => number;
  calculateScore: (distance: number, timeLeft: number) => { score: number; timeBonus: number };
  getProgressBarColor: (timeLeft: number, roundInitialTime: number) => string;
  geoJsonData: FeatureCollection | null;
  gameOver: boolean;
  onPauseGame: () => void;
  score: number;
  currentNeighborhood: string;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  showFeedback,
  clickedPosition,
  arrowPath,
  clickTime,
  feedbackProgress,
  onNextRound,
  calculateDistance,
  calculateScore,
  getProgressBarColor,
  geoJsonData,
  gameOver,
  onPauseGame,
  score,
  currentNeighborhood
}) => {
  if (!showFeedback) return null;

  const getFeedbackMessage = () => {
    if (!clickedPosition || !arrowPath) return '';
    const distance = calculateDistance(clickedPosition, arrowPath[1]);
    const { score: pointsEarned } = calculateScore(distance, clickTime);
    
    if (pointsEarned >= 800) return 'Muito bem! Você conhece mesmo Santos!';
    if (pointsEarned >= 500) return 'Boa! Continue assim!';
    if (pointsEarned >= 200) return 'Quase lá!';
    return 'Tente novamente!';
  };

  const getTimeBonus = () => {
    if (!clickedPosition || !arrowPath) return 0;
    const distance = calculateDistance(clickedPosition, arrowPath[1]);
    const { timeBonus } = calculateScore(distance, clickTime);
    return timeBonus;
  };

  const message = getFeedbackMessage();
  const timeBonus = getTimeBonus();
  const isSuccess = message.includes('Muito bem');

  return (
    <div style={styles.container}>
      {gameOver ? (
        <GameOverPanel
          score={score}
          onRestart={() => window.location.reload()}
        />
      ) : (
        <>
          <FeedbackMessage
            message={message}
            timeBonus={timeBonus}
            isSuccess={isSuccess}
          />
          <GameControls
            gameOver={gameOver}
            onPauseGame={onPauseGame}
            onNextRound={onNextRound}
            geoJsonData={geoJsonData}
            feedbackProgress={feedbackProgress}
          />
        </>
      )}
    </div>
  );
}; 