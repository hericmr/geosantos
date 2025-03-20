import React, { useEffect, useState } from 'react';
import { FeedbackPanelProps } from '../../types/game';
import { getFeedbackMessage, TIME_BONUS_THRESHOLDS, TIME_BONUS_AMOUNTS } from '../../utils/gameConstants';
import { DigitRoller } from './DigitRoller';
import { ScoreDisplay } from './ScoreDisplay';
import { FeedbackMessage } from './FeedbackMessage';
import { ActionButtons } from './ActionButtons';
import { styles } from './FeedbackPanel.styles';
import { capitalizeWords } from '../../utils/textUtils';

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
  const [displayedDistance, setDisplayedDistance] = useState(0);
  const [displayedTime, setDisplayedTime] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [popupPosition, setPopupPosition] = useState({ top: '50%', left: '50%' });
  const [timeBonus, setTimeBonus] = useState(0);
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    if (showFeedback && clickedPosition) {
      const distance = arrowPath ? calculateDistance(clickedPosition, arrowPath[1]) : 0;
      const score = calculateScore(distance, clickTime);
      
      setIsAnimating(true);
      setDisplayedDistance(distance);
      setDisplayedTime(0);
      setFeedbackMessage(getFeedbackMessage(distance));

      let bonus = 0;
      if (score.total >= TIME_BONUS_THRESHOLDS.EXCELLENT) {
        bonus = TIME_BONUS_AMOUNTS.EXCELLENT;
      } else if (score.total >= TIME_BONUS_THRESHOLDS.GOOD) {
        bonus = TIME_BONUS_AMOUNTS.GOOD;
      } else if (score.total >= TIME_BONUS_THRESHOLDS.FAIR) {
        bonus = TIME_BONUS_AMOUNTS.FAIR;
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
  }, [showFeedback, clickedPosition, arrowPath, clickTime, calculateScore, calculateDistance]);

  useEffect(() => {
    if (clickedPosition) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      if (isMobile) {
        setPopupPosition({ top: 'auto', left: '0' });
      } else {
        setPopupPosition({ 
          top: '50%',
          left: '50%'
        });
      }
    }
  }, [clickedPosition, arrowPath, isMobile]);

  const isCorrectNeighborhood = displayedDistance === 0;

  return (
    <div style={styles.container(gameOver, isMobile, popupPosition)}>
      {!gameOver && clickedPosition && (
        <div style={styles.contentContainer}>
          {isCorrectNeighborhood ? (
            <>
              <div style={{
                textAlign: 'center',
                color: '#fff',
                fontSize: 'clamp(1.1rem, 2.8vw, 1.4rem)',
                fontFamily: "'Inter', sans-serif",
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                opacity: 0.95,
                marginBottom: '4px'
              }}>
                <div style={{ 
                  fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', 
                  color: '#FFD700', 
                  fontWeight: 700,
                  textAlign: 'center',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }}>
                   INCRÍVEL! 🎯
                </div>
                <div style={{
                  fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                  color: '#fff',
                  lineHeight: 1.1
                }}>
                  Em {clickTime.toFixed(2)} seg você acertou na mosca o bairro <span style={{ color: '#32CD32', fontWeight: 600 }}>{capitalizeWords(currentNeighborhood)}</span>!
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: 'clamp(10px, 2vw, 20px)',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <ScoreDisplay
                  icon="🎯"
                  value={score}
                  unit="pts"
                />
                <ScoreDisplay
                  icon="⏱️"
                  value={1000 - (clickTime * 100)}
                  unit="pts"
                  timeBonus={timeBonus}
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ 
                fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                textAlign: 'center',
                fontFamily: "'Inter', sans-serif",
                opacity: 0.9,
                marginBottom: '2px'
              }}>
                Em {displayedTime.toFixed(2)} seg você clicou
              </div>
              <div style={{
                display: 'flex',
                gap: '2px',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: '4px'
              }}>
                {Math.round(displayedDistance)
                  .toString()
                  .padStart(5, '0')
                  .split('')
                  .map((digit, index) => (
                    <DigitRoller 
                      key={index} 
                      targetDigit={digit} 
                      delay={200 + (index * 150)} 
                    />
                  ))}
                <div style={{ 
                  fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  marginLeft: 'clamp(4px, 1vw, 8px)',
                  opacity: 0.9
                }}>metros até a intersecção com o bairro <span style={{ color: '#32CD32', fontWeight: 600 }}>{capitalizeWords(currentNeighborhood)}</span></div>
              </div>
              <div style={{
                display: 'flex',
                gap: 'clamp(10px, 2vw, 20px)',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                width: '100%'
              }}>
                <ScoreDisplay
                  icon="📍"
                  value={displayedDistance / 1000}
                  unit="km"
                />
                <ScoreDisplay
                  icon="⏱️"
                  value={1000 - (clickTime * 100)}
                  unit="pts"
                  timeBonus={timeBonus}
                />
              </div>
            </>
          )}
        </div>
      )}

      {timeBonus > 0 && !gameOver && (
        <FeedbackMessage
          message={`⚡ +${timeBonus.toFixed(2)}s`}
          isExcellent={true}
        />
      )}

      {feedbackMessage && !gameOver && (
        <FeedbackMessage
          message={feedbackMessage}
          isExcellent={feedbackMessage.includes("Muito bem")}
        />
      )}

      {gameOver && (
        <div style={styles.contentContainer}>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            color: '#FF0000',
            margin: '0',
            fontWeight: 800,
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            Game Over!
          </h2>
          <div style={{
            textAlign: 'center',
            color: '#fff',
            fontSize: 'clamp(1.1rem, 2.8vw, 1.4rem)',
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            opacity: 0.95,
            marginBottom: '4px'
          }}>
            <div style={{ 
              fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', 
              color: '#FFD700', 
              fontWeight: 700,
              textAlign: 'center',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}>
              {score >= 20000 ? "REI DA GEOGRAFIA! Você conhece Santos!" :
               score >= 15000 ? "MITO SANTISTA! Até as ondas do mar te aplaudem!" :
               score >= 10000 ? "LENDÁRIO! Você é um Pelé da geografia santista!" :
               score >= 8000 ? "MESTRE DOS BAIRROS!  Você é um GPS ambulante!" :
               score >= 5000 ? "IMPRESSIONANTE!  Quase um GPS humano!!" :
               score >= 4000 ? "VC É MAIS SANTISTA QUE PASTEL DE VENTO NA FEIRA! 🥟" :
               score >= 3000 ? "SANTISTA DE CORAÇÃO!  Você manja dos bairros!" :
               score >= 2000 ? "MUITO BOM!  Você é deve ter ido em algumas aulas de geografia!" :
               score >= 1000 ? "BOM JOGO!  Mas ainda precisa andar mais pela zona noroeste!" :
               score >= 500 ? "QUASE LÁ!  Dá um role no bondinho pra pegar umas dicas!" :
               score >= 100 ? "MAIS PERDIDO QUE DOIDO NA PONTA DA PRAIA! " :
               "Eita! Parece que você não sabe nada de Santos!"}
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: 'clamp(10px, 2vw, 20px)',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <ScoreDisplay
              icon="🏆"
              value={score}
              unit="pts"
            />
          </div>
        </div>
      )}

      <ActionButtons
        gameOver={gameOver}
        onPauseGame={onPauseGame}
        onNextRound={() => {
          if (gameOver) {
            window.location.reload();
          } else if (geoJsonData) {
            onNextRound(geoJsonData);
          }
        }}
        feedbackProgress={feedbackProgress}
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