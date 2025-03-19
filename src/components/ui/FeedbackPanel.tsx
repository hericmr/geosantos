import React, { useEffect, useState } from 'react';
import { FeedbackPanelProps } from '../../types/game';
import { getFeedbackMessage } from '../../utils/gameConstants';

const DigitRoller: React.FC<{ targetDigit: string; delay: number }> = ({ targetDigit, delay }) => {
  const [isRolling, setIsRolling] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRolling(false);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div style={{
      background: '#000',
      padding: '4px 2px',
      borderRadius: '4px',
      width: '40px',
      height: '50px',
      overflow: 'hidden',
      position: 'relative',
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        animation: isRolling ? 'rollDigits 0.3s linear infinite' : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: !isRolling ? `translateY(${-40 * parseInt(targetDigit)}px)` : undefined,
        transition: !isRolling ? 'transform 0.3s ease-out' : undefined
      }}>
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{
            height: '40px',
            fontSize: '32px',
            fontWeight: 700,
            color: '#fff',
            fontFamily: "'Inter', monospace",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {i}
          </div>
        ))}
        {[0,1,2,3,4,5,6,7,8,9].map((n) => (
          <div key={`repeat-${n}`} style={{
            height: '40px',
            fontSize: '32px',
            fontWeight: 700,
            color: '#fff',
            fontFamily: "'Inter', monospace",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {n}
          </div>
        ))}
      </div>
    </div>
  );
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
  currentNeighborhood
}) => {
  const [displayedDistance, setDisplayedDistance] = useState(0);
  const [displayedTime, setDisplayedTime] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    if (showFeedback && clickedPosition && arrowPath) {
      const distance = calculateDistance(clickedPosition, arrowPath[1]);
      const score = calculateScore(distance, clickTime);
      
      setIsAnimating(true);
      setDisplayedDistance(0);
      setDisplayedTime(0);
      setFeedbackMessage(getFeedbackMessage(distance));

      const duration = 2000; // 2 segundos de animação
      const steps = 60; // 60 passos para animação suave
      const stepDuration = duration / steps;
      const distanceStep = distance / steps;
      const timeStep = clickTime / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        setDisplayedDistance(prev => Math.min(prev + distanceStep, distance));
        setDisplayedTime(prev => Math.min(prev + timeStep, clickTime));
        
        if (currentStep >= steps) {
          clearInterval(interval);
          setIsAnimating(false);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [showFeedback, clickedPosition, arrowPath, clickTime, calculateDistance, calculateScore]);

  if (!showFeedback) return null;

  // Verifica se o clique foi dentro do bairro correto (quando não há seta)
  const isCorrectNeighborhood = !arrowPath;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      background: 'rgba(0, 25, 0, 0.9)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      color: 'white',
      zIndex: 1001,
      padding: '20px'
    }}>
      {!gameOver && clickedPosition && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '30px',
          justifyContent: 'center'
        }}>
          {!isCorrectNeighborhood && (
            <div>
              <div style={{
                display: 'flex',
                gap: '2px',
                marginBottom: '5px'
              }}>
                {Math.round(displayedDistance)
                  .toString()
                  .padStart(5, '0')
                  .split('')
                  .map((digit, index) => (
                    <DigitRoller 
                      key={index} 
                      targetDigit={digit} 
                      delay={500 + (index * 300)} 
                    />
                  ))}
              </div>
              <div style={{ 
                fontSize: '1rem',
                textAlign: 'center',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500
              }}>metros</div>
            </div>
          )}

          <div style={{
            textAlign: 'left',
            color: '#fff',
            fontSize: '1.2rem',
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            {!isCorrectNeighborhood ? (
              <>
                <div>Em {displayedTime.toFixed(2)} seg você clicou</div>
                <div>{Math.round(displayedDistance)} metros</div>
                <div>do bairro <span style={{ color: '#32CD32' }}>{currentNeighborhood}</span></div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '1.4rem', color: '#FFD700' }}>🎯 INCRÍVEL! Em {displayedTime.toFixed(2)} segundos</div>
                <div style={{ fontSize: '1.4rem' }}>você acertou o bairro</div>
                <div style={{ fontSize: '1.6rem', color: '#32CD32', fontWeight: 'bold' }}>{currentNeighborhood}!</div>
              </>
            )}
          </div>
        </div>
      )}

      {feedbackMessage && !gameOver && (
        <div style={{
          marginTop: '15px',
          color: feedbackMessage.includes("Muito bem") ? '#FFD700' : '#FFD700',
          fontWeight: 600,
          fontSize: '1.3rem',
          textAlign: 'center',
          fontFamily: "'Inter', sans-serif",
          animation: feedbackMessage.includes("Muito bem") ? 'pulseText 1s infinite' : 'none'
        }}>
          {feedbackMessage}
        </div>
      )}

      {gameOver && (
        <h2 style={{ 
          color: 'white', 
          marginBottom: '20px', 
          fontSize: '2rem',
          textAlign: 'center',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700
        }}>
          {feedbackMessage === "Tempo esgotado!" 
            ? "Acabou o tempo! Tá mals!"
            : "Vocẽ perdeu... Tá mais perdido que saci andando de skate na Palmares!"}
        </h2>
      )}

      <div style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        marginTop: '15px'
      }}>
        {!gameOver && (
          <button
            onClick={onPauseGame}
            style={{
              padding: '8px 20px',
              fontSize: '1rem',
              background: '#FFA500',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              fontWeight: 'bold'
            }}
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
          style={{
            padding: '8px 20px',
            fontSize: '1rem',
            background: gameOver ? '#FF4444' : '#32CD32',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            fontWeight: 'bold'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = gameOver ? '#FF0000' : '#28a745'}
          onMouseOut={(e) => e.currentTarget.style.background = gameOver ? '#FF4444' : '#32CD32'}
        >
          {gameOver ? 'Jogar Novamente' : 'Próximo'}
        </button>
      </div>

      <div style={{
        width: '100%',
        height: '4px',
        background: '#2A2A2A',
        overflow: 'hidden',
        position: 'relative',
        marginTop: '15px'
      }}>
        <div style={{
          width: `${feedbackProgress}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${getProgressBarColor(10 - clickTime)}, ${getProgressBarColor(10 - clickTime)}CC)`,
          transition: 'width 0.1s linear, background-color 0.5s ease',
          position: 'absolute',
          left: 0,
          top: 0
        }} />
      </div>

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
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}; 