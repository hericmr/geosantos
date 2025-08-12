import React, { useEffect, useState, useCallback } from 'react';
import { ActionButtons } from './ActionButtons';
import { styles } from './FeedbackPanel.styles';
import { GameMode } from '../../types/famousPlaces';
import { ContextualTip } from './ContextualTip';
import { GameIcon } from './GameIcons'; // CORREÇÃO: Adicionar import do GameIcon
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
  onResumeGame?: () => void;
  score: number;
  currentNeighborhood: string;
  currentMode?: GameMode;
  currentFamousPlace?: { name: string; description?: string };
  totalScore?: number;
  roundNumber?: number;
  consecutiveCorrect?: number;
  bestStreak?: number;
  isPaused?: boolean;
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
  onResumeGame,
  score,
  currentNeighborhood,
  currentMode = 'neighborhoods',
  currentFamousPlace,
  totalScore = 0,
  roundNumber = 1,
  consecutiveCorrect = 0,
  bestStreak = 0,
  isPaused,
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
        zIndex: 10020,
        maxWidth: isMobile ? '95%' : '360px', // smaller width
        padding: '12px',
        borderRadius: '8px'
      }}
    >
      {clickedPosition && (
        <div style={styles.contentContainer}>
          {/* Subtitle (no green outline) */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '10px',
              padding: '8px',
              background: 'transparent',
              borderRadius: '6px'
            }}
          >
            <div
              style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                fontFamily: "'LaCartoonerie', sans-serif",
                color: '#32CD32',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              {achievementData?.subtitle || "Mandou bem demais! E foi super rápido também!"}
            </div>
          </div>

          {/* Place description */}
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <PlaceDescription
              currentMode={currentMode}
              currentNeighborhood={currentNeighborhood}
              currentFamousPlace={currentFamousPlace}
              displayedDistance={displayedDistance}
              clickTime={clickTime}
              isCorrectNeighborhood={isCorrectNeighborhood}
            />
          </div>

              {/* Score grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginBottom: '10px',
                  width: '100%'
                }}
              >
                {/* Target points */}
                <div
                  style={{
                    textAlign: 'center',
                    padding: '10px',
                    background: 'var(--bg-primary)',
                    borderRadius: '6px',
                    lineHeight: '1.1'
                  }}
                >
                  <GameIcon name="target" size={22} color="var(--accent-green)" />
                  <div
                    style={{
                      marginTop: '2px',
                      fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                      fontFamily: "'VT323', monospace",
                      color: 'var(--text-primary)',
                      fontWeight: 'bold'
                    }}
                  >
                    {Math.round(score * 0.9)} pts
                  </div>
                </div>

                {/* Time points */}
                <div
                  style={{
                    textAlign: 'center',
                    padding: '10px',
                    background: 'var(--bg-primary)',
                    borderRadius: '6px',
                    lineHeight: '1.1'
                  }}
                >
                  <GameIcon name="clock" size={22} color="var(--accent-orange)" />
                  <div
                    style={{
                      marginTop: '2px',
                      fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                      fontFamily: "'VT323', monospace",
                      color: 'var(--text-primary)',
                      fontWeight: 'bold'
                    }}
                  >
                    {Math.round(score * 0.1)} pts
                  </div>
                </div>
              </div>

              {/* Total score */}
              <div
                style={{
                  textAlign: 'center',
                  marginBottom: '14px',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #064d2e, #0a7b4b)',
                  borderRadius: '8px',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.25)',
                  width: '100%',
                  lineHeight: '1.1'
                }}
              >
                <div
                  style={{
                    fontSize: 'clamp(2rem, 5vw, 2.8rem)',
                    fontFamily: "'VT323', monospace",
                    color: '#fff',
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                    textShadow: '1px 1px 4px rgba(0,0,0,0.5)'
                  }}
                >
                  {score} PTS
                </div>
              </div>


          {/* Action buttons */}
          <ActionButtons
            gameOver={gameOver}
            onPauseGame={onPauseGame}
            onNextRound={() => {
              if (geoJsonData) onNextRound(geoJsonData);
            }}
            feedbackProgress={feedbackProgress}
            currentMode={currentMode}
            onResumeGame={onResumeGame}
            isPaused={isPaused}
          />
        </div>
      )}

      {/* Contextual tip */}
      <ContextualTip
        currentMode={currentMode}
        currentNeighborhood={currentNeighborhood}
        currentFamousPlace={currentFamousPlace}
        isVisible={true}
      />
    </div>
  );
}; 