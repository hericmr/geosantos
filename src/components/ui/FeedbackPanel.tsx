import React, { useEffect, useState, useCallback } from 'react';
import { ActionButtons } from './ActionButtons';
import { styles } from './FeedbackPanel.styles';
import { GameMode } from '../../types/famousPlaces';
import { ContextualTip } from './ContextualTip';
import { 
  AchievementHeader, 
  PlaceDescription, 
  StatsDisplay 
} from './feedback';
import { 
  getAchievementData, 
  calculateTimeBonus, 
  calculateOptimalPosition, 
  animateTime, 
  shouldShowStreakAnimation,
  generateFeedbackMessage,
  type AchievementData
} from '../../utils/feedbackUtils';
import { LatLng } from 'leaflet';

export interface FeedbackPanelProps {
  showFeedback: boolean;
  clickedPosition: LatLng | null;
  arrowPath: LatLng[] | null;
  clickTime: number;
  feedbackProgress: number;
  onNextRound: (geoJsonData: any) => void;
  calculateDistance: (pos1: LatLng, pos2: LatLng) => number;
  calculateScore: (distance: number, time: number) => { total: number };
  getProgressBarColor: (...args: any[]) => any;
  geoJsonData: any;
  gameOver: boolean;
  onPauseGame: () => void;
  score: number;
  currentNeighborhood: string;
  currentMode?: GameMode;
  currentFamousPlace?: { name: string; description?: string };
  totalScore?: number;
  roundNumber?: number;
  consecutiveCorrect?: number;
  bestStreak?: number;
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
  currentNeighborhood,
  currentMode = 'neighborhoods',
  currentFamousPlace,
  totalScore = 0,
  roundNumber = 1,
  consecutiveCorrect = 0,
  bestStreak = 0,
}) => {
  const [displayedDistance, setDisplayedDistance] = useState(0);
  const [displayedTime, setDisplayedTime] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [popupPosition, setPopupPosition] = useState({ top: '50%', left: '50%' });
  const [timeBonus, setTimeBonus] = useState(0);
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    if (showFeedback && clickedPosition) {
      const distance = arrowPath ? calculateDistance(clickedPosition, arrowPath[1]) : 0;
      const score = calculateScore(distance, clickTime);
      
      setIsAnimating(true);
      setDisplayedDistance(distance);
      setDisplayedTime(0);
      setFeedbackMessage(generateFeedbackMessage(distance, clickTime, consecutiveCorrect));

      // Mostrar animação de streak se aplicável
      if (shouldShowStreakAnimation(distance, consecutiveCorrect)) {
        setShowStreakAnimation(true);
        setTimeout(() => setShowStreakAnimation(false), 3000);
      }

      const bonus = calculateTimeBonus(score.total);
      setTimeBonus(bonus);

      // Usar requestAnimationFrame para animação mais fluida
      const cancelAnimation = animateTime(
        0,
        clickTime,
        2000,
        (time) => setDisplayedTime(time),
        () => setIsAnimating(false)
      );

      return () => cancelAnimation();
    }
  }, [showFeedback, clickedPosition, arrowPath, clickTime, calculateScore, calculateDistance, consecutiveCorrect]);



  useEffect(() => {
    if (clickedPosition) {
      const optimalPosition = calculateOptimalPosition(clickedPosition, arrowPath, isMobile);
      setPopupPosition(optimalPosition);
    }
  }, [clickedPosition, arrowPath, isMobile]);



  const isCorrectNeighborhood = displayedDistance === 0;
  const achievementData = getAchievementData(displayedDistance, clickTime, consecutiveCorrect);

  // Não renderizar o FeedbackPanel quando gameOver é true
  if (gameOver) {
    return null;
  }

  return (
    <div 
      className="feedback-panel-container"
      style={{
        ...styles.container(false, isMobile, popupPosition),
        zIndex: 10020
      }}
    >
      {clickedPosition && (
        <div style={styles.contentContainer}>
          <AchievementHeader 
            achievementData={achievementData}
            showStreakAnimation={showStreakAnimation}
          />
          
          <PlaceDescription
            currentMode={currentMode}
            currentNeighborhood={currentNeighborhood}
            currentFamousPlace={currentFamousPlace}
            displayedDistance={displayedDistance}
            clickTime={clickTime}
            isCorrectNeighborhood={isCorrectNeighborhood}
          />
          
          <StatsDisplay
            score={score}
            timeBonus={timeBonus}
            clickTime={clickTime}
          />


        </div>
      )}



      <ActionButtons
        gameOver={false}
        onPauseGame={onPauseGame}
        onNextRound={() => {
          if (geoJsonData) {
            onNextRound(geoJsonData);
          }
        }}
        feedbackProgress={feedbackProgress}
        currentMode={currentMode}
      />

      {/* Dica contextual melhorada */}
      <ContextualTip
        currentMode={currentMode}
        currentNeighborhood={currentNeighborhood}
        currentFamousPlace={currentFamousPlace}
        isVisible={true}
      />

      <style>
        {`
          @keyframes rollDigits {
            0% {
              transform: translateY(-400px);
            }
            100% {
              transform: translateY(0);
            }
          }
          @keyframes pulseText {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes fadeInScale {
            0% { 
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.95);
            }
            100% { 
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }
          @keyframes pulseScore {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes slideIn {
            0% {
              opacity: 0;
              transform: translate(-50%, -20px);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
          @keyframes slideInLeft {
            0% {
              opacity: 0;
              transform: translateX(-100%);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes slideUp {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes streakGlow {
            0% { 
              box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
            }
            50% { 
              box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
            }
            100% { 
              box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
            }
          }

          /* Estilos responsivos para o modal */
          @media (max-width: 1200px) {
            .feedback-panel-container {
              width: clamp(300px, 30vw, 400px) !important;
              max-width: 400px !important;
            }
          }
          
          @media (max-width: 768px) {
            .feedback-panel-container {
              width: 100% !important;
              max-width: 100% !important;
              left: 0 !important;
              right: 0 !important;
            }
          }
          
          @media (max-width: 480px) {
            .feedback-panel-container {
              padding: 12px !important;
              gap: 8px !important;
            }
          }

          button {
            -webkit-tap-highlight-color: transparent;
          }
          
          button:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
          }
        `}
      </style>
    </div>
  );
}; 