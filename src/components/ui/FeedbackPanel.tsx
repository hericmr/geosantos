import React, { useEffect, useState } from 'react';
import { getFeedbackMessage, TIME_BONUS_THRESHOLDS, TIME_BONUS_AMOUNTS } from '../../utils/gameConstants';
import { DigitRoller } from './DigitRoller';
import { ScoreDisplay } from './ScoreDisplay';
import { FeedbackMessage } from './FeedbackMessage';
import { ActionButtons } from './ActionButtons';
import { styles } from './FeedbackPanel.styles';
import { capitalizeWords } from '../../utils/textUtils';
import { GameMode } from '../../types/famousPlaces';
import { ContextualTip } from './ContextualTip';
import { CheckCircleIcon, SparklesIcon, ThumbsUpIcon, HelpCircleIcon, FrownIcon, FlameIcon, GameIcon } from './GameIcons';

export interface FeedbackPanelProps {
  showFeedback: boolean;
  clickedPosition: any;
  arrowPath: any;
  clickTime: number;
  feedbackProgress: number;
  onNextRound: (geoJsonData: any) => void;
  calculateDistance: (...args: any[]) => number;
  calculateScore: (...args: any[]) => any;
  getProgressBarColor: (...args: any[]) => any;
  geoJsonData: any;
  gameOver: boolean;
  onPauseGame: () => void;
  score: number;
  currentNeighborhood: string;
  currentMode?: GameMode;
  currentFamousPlace?: any;
  totalScore?: number;
  roundNumber?: number;
  consecutiveCorrect?: number;
  bestStreak?: number;
}

// Sistema de conquistas e feedback dinâmico
const getAchievementData = (distance: number, clickTime: number, consecutiveCorrect: number = 0) => {
  const distanceKm = distance / 1000;
  
  // Conquistas baseadas na distância
  if (distance === 0) {
    return {
      title: "ACERTO PERFEITO!",
      subtitle: "",
      icon: "checkcircle",
      color: "#FFD700",
      achievement: "BULLSEYE",
      streakBonus: consecutiveCorrect >= 3 ? `${consecutiveCorrect} acertos seguidos!` : null
    };
  } else if (distanceKm < 0.5) {
    return {
      title: "INCRÍVEL!",
      subtitle: "",
      icon: "sparkles",
      color: "#FFA500",
      achievement: "NEAR_PERFECT",
      streakBonus: consecutiveCorrect >= 2 ? `${consecutiveCorrect} acertos seguidos!` : null
    };
  } else if (distanceKm < 1) {
    return {
      title: "EXCELENTE!",
      subtitle: "",
      icon: "sparkles",
      color: "#32CD32",
      achievement: "EXCELLENT",
      streakBonus: null
    };
  } else if (distanceKm < 2) {
    return {
      title: "MUITO BOM!",
      subtitle: "",
      icon: "thumbsup",
      color: "#00CED1",
      achievement: "GOOD",
      streakBonus: null
    };
  } else if (distanceKm < 5) {
    return {
      title: "QUASE LÁ!",
      subtitle: "",
      icon: "helpcircle",
      color: "#FFD700",
      achievement: "CLOSE",
      streakBonus: null
    };
  } else {
    return {
      title: "OPS!",
      subtitle: "",
      icon: "frown",
      color: "#FF6B6B",
      achievement: "FAR",
      streakBonus: null
    };
  }
};



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
      setFeedbackMessage(getFeedbackMessage(distance, clickTime, consecutiveCorrect));

      // Mostrar animação de streak se aplicável
      if (distance === 0 && consecutiveCorrect >= 2) {
        setShowStreakAnimation(true);
        setTimeout(() => setShowStreakAnimation(false), 3000);
      }

      let bonus = 0;
      if (score.total >= TIME_BONUS_THRESHOLDS.PERFECT) {
        bonus = TIME_BONUS_AMOUNTS.PERFECT;
      } else if (score.total >= TIME_BONUS_THRESHOLDS.EXCELLENT) {
        bonus = TIME_BONUS_AMOUNTS.EXCELLENT;
      } else if (score.total >= TIME_BONUS_THRESHOLDS.GREAT) {
        bonus = TIME_BONUS_AMOUNTS.GREAT;
      } else if (score.total >= TIME_BONUS_THRESHOLDS.GOOD) {
        bonus = TIME_BONUS_AMOUNTS.GOOD;
      } else if (score.total >= TIME_BONUS_THRESHOLDS.DECENT) {
        bonus = TIME_BONUS_AMOUNTS.DECENT;
      } else if (score.total >= TIME_BONUS_THRESHOLDS.FAIR) {
        bonus = TIME_BONUS_AMOUNTS.FAIR;
      } else if (score.total >= TIME_BONUS_THRESHOLDS.CLOSE) {
        bonus = TIME_BONUS_AMOUNTS.CLOSE;
      }
      setTimeBonus(bonus);

      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;
      const timeStep = clickTime / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        setDisplayedTime(prev => Math.min(prev + timeStep, clickTime));
        
        if (currentStep >= steps) {
          clearInterval(interval);
          setIsAnimating(false);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [showFeedback, clickedPosition, arrowPath, clickTime, calculateScore, calculateDistance, consecutiveCorrect]);

  // Esta função determina a melhor posição para o painel de feedback
  const calculateOptimalPosition = () => {
    if (!clickedPosition || !arrowPath) {
      return { top: '50%', left: '50%' };
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (isMobile) {
      return { top: 'auto', left: '0' };
    }

    const clickX = clickedPosition.lng;
    const clickY = clickedPosition.lat;
    const targetX = arrowPath[1].lng;
    const targetY = arrowPath[1].lat;
    
    const centerX = (clickX + targetX) / 2;
    const centerY = (clickY + targetY) / 2;
    
    const mapInstance = (window as any).mapInstance;
    if (!mapInstance) {
      return { top: '50%', left: '50%' };
    }
    
    if (clickX > centerX) {
      return { top: '40%', left: '20%' };
    } else {
      return { top: '40%', left: '80%' };
    }
  };

  useEffect(() => {
    if (clickedPosition) {
      const optimalPosition = calculateOptimalPosition();
      setPopupPosition(optimalPosition);
    }
  }, [clickedPosition, arrowPath, isMobile]);

  useEffect(() => {
    if (showFeedback) {
      console.log('[FeedbackPanel] showFeedback TRUE. currentMode:', currentMode, 'currentNeighborhood:', currentNeighborhood);
    }
  }, [showFeedback, currentMode, currentNeighborhood]);

  useEffect(() => {
    console.log('[FeedbackPanel] Renderizou. currentMode:', currentMode, 'currentNeighborhood:', currentNeighborhood);
  }, [currentMode, currentNeighborhood]);

  const isCorrectNeighborhood = displayedDistance === 0;
  const achievementData = getAchievementData(displayedDistance, clickTime, consecutiveCorrect);

  // Não renderizar o FeedbackPanel quando gameOver é true
  if (gameOver) {
    return null;
  }

  return (
    <div style={{
      ...styles.container(false, isMobile, popupPosition),
      zIndex: 10020
    }}>
      {clickedPosition && (
        <div style={styles.contentContainer}>
          {/* Header com conquista e streak */}
          <div style={{
            textAlign: 'center',
            color: '#fff',
            fontSize: 'clamp(1.1rem, 2.8vw, 1.4rem)',
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            opacity: 0.95,
            marginBottom: '8px'
          }}>
            {/* Título da conquista */}
            <div style={{ 
              fontSize: 'clamp(1.3rem, 3.2vw, 1.6rem)', 
              color: achievementData.color, 
              fontFamily: "'LaCartoonerie', sans-serif",
              fontWeight: 400,
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <GameIcon name={achievementData.icon} size={32} color={achievementData.color} />
              {achievementData.title}
            </div>
            


            {/* Informações de tempo e distância */}
            <div style={{
              fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
              fontFamily: "'LaCartoonerie', sans-serif",
              color: '#fff',
              opacity: 0.9,
              textAlign: 'center',
              marginTop: '4px',
              lineHeight: 1.4
            }}>
              {isCorrectNeighborhood ? (
                // Acerto na mosca
                <>
                  {currentMode === 'famous_places'
                    ? `Em ${clickTime.toFixed(2)} seg você acertou ${currentFamousPlace?.name || 'o lugar famoso'}!`
                    : `Em ${clickTime.toFixed(2)} seg você acertou na mosca o bairro `}
                  {currentMode === 'neighborhoods' && (
                    <span style={{ color: '#32CD32', fontWeight: 600 }}>{capitalizeWords(currentNeighborhood)}</span>
                  )}
                  {currentMode === 'neighborhoods' && '!' }
                </>
              ) : (
                // Erro - mostrar distância
                <>
                  {currentMode === 'famous_places'
                    ? `Em ${clickTime.toFixed(2)} seg você clicou a ${Math.round(displayedDistance)}m de ${currentFamousPlace?.name || 'o lugar famoso'}`
                    : `Em ${clickTime.toFixed(2)} seg você clicou a ${Math.round(displayedDistance)}m do bairro `}
                  {currentMode === 'neighborhoods' && (
                    <span style={{ color: '#32CD32', fontWeight: 600 }}>{capitalizeWords(currentNeighborhood)}</span>
                  )}
                  {currentMode === 'neighborhoods' && '!' }
                </>
              )}
            </div>

            {/* Streak bonus */}
            {achievementData.streakBonus && (
              <div style={{
                fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
                fontFamily: "'LaCartoonerie', sans-serif",
                color: '#FFD700',
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
                animation: showStreakAnimation ? 'pulseText 0.5s infinite' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                justifyContent: 'center',
                marginTop: '4px'
              }}>
                <FlameIcon size={16} color="#FFD700" />
                {achievementData.streakBonus}
              </div>
            )}


          </div>
          
          {/* Display de pontuação */}
          <div style={{
            display: 'flex',
            gap: 'clamp(10px, 2vw, 20px)',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <ScoreDisplay
              icon="target"
              value={score}
              unit="pts"
            />
            <ScoreDisplay
              icon="clock"
              value={1000 - (clickTime * 100)}
              unit="pts"
              timeBonus={timeBonus}
            />
          </div>

                    {/* Estatísticas do jogo */}
          <div style={{
            display: 'flex',
            gap: 'clamp(8px, 2vw, 12px)',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '8px'
          }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: 'clamp(0.8rem, 2vw, 1rem)',
              color: '#fff',
              fontFamily: "'LaCartoonerie', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              🎮 Rodada {roundNumber}
            </div>
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: 'clamp(0.8rem, 2vw, 1rem)',
              color: '#fff',
              fontFamily: "'LaCartoonerie', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              💰 Total: {totalScore.toLocaleString()}
            </div>
            {bestStreak > 0 && (
              <div style={{
                background: 'rgba(255, 215, 0, 0.2)',
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 215, 0, 0.4)',
                fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                color: '#FFD700',
                fontFamily: "'LaCartoonerie', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                🔥 Melhor: {bestStreak}
              </div>
            )}
          </div>
        </div>
      )}



      <ActionButtons
        gameOver={false}
        onPauseGame={onPauseGame}
        onNextRound={() => {
          console.log('[FeedbackPanel] Botão Próximo clicado manualmente. Modo:', currentMode, 'Chamando onNextRound.');
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