import React, { useEffect, useState } from 'react';
import { FeedbackPanelProps } from '../../types/game';
import { getFeedbackMessage } from '../../utils/gameConstants';

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
  score
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

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      background: gameOver ? 'rgba(255, 0, 0, 0.95)' : 'rgba(0, 25, 0, 0.9)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      color: 'white',
      textAlign: 'center',
      zIndex: 1001,
      padding: '15px'
    }}>
      {!gameOver && clickedPosition && arrowPath && (
        <div style={{
          fontSize: window.innerWidth < 768 ? '0.8em' : '1em',
          color: '#FFD700',
          marginBottom: '10px',
          opacity: 0.8
        }}>
          {calculateScore(calculateDistance(clickedPosition, arrowPath[1]), clickTime).total >= 0 
            ? `Faltam ${Math.max(0, 5000 - score)} pontos para a fase 2` 
            : null}
        </div>
      )}

      {gameOver && (
        <h2 style={{ 
          color: 'white', 
          marginBottom: '20px', 
          fontSize: window.innerWidth < 768 ? '1.5em' : '2em',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
          padding: window.innerWidth < 768 ? '0 10px' : '0'
        }}>
          {feedbackMessage === "Tempo esgotado!" 
            ? "Acabou o tempo! Tá mals!"
            : "Vocẽ perdeu... Tá mais perdido que saci andando de skate na Palmares!"}
        </h2>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '15px',
        padding: '10px',
        borderRadius: '10px'
      }}>
        <div>
          <div style={{ 
            fontSize: window.innerWidth < 768 ? '24px' : '32px', 
            fontWeight: 'bold', 
            color: '#32CD32',
            fontFamily: 'monospace',
            letterSpacing: '2px',
            textShadow: isAnimating ? '0 0 5px #32CD32' : 'none',
            transition: 'text-shadow 0.1s ease-in-out'
          }}>
            {Math.round(displayedDistance).toString().padStart(5, '0')}
          </div>
          <div style={{ color: '#32CD32', fontSize: window.innerWidth < 768 ? '0.8em' : '1em', marginTop: '5px' }}>metros</div>
        </div>

        {feedbackMessage && !gameOver && (
          <div style={{ 
            fontSize: window.innerWidth < 768 ? '1em' : (feedbackMessage.includes("fase 2") ? '2em' : '1.5em'),
            color: feedbackMessage.includes("fase 2") ? '#32CD32' : '#FFD700',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
            fontWeight: 'bold',
            animation: feedbackMessage.includes("fase 2") ? 'pulseText 1s infinite' : 'none',
            flex: '1',
            maxWidth: window.innerWidth < 768 ? '40%' : '50%',
            textAlign: 'center'
          }}>
            {feedbackMessage}
          </div>
        )}

        <div>
          <div style={{ 
            fontSize: window.innerWidth < 768 ? '24px' : '32px', 
            fontWeight: 'bold', 
            color: '#FFA500',
            fontFamily: 'monospace',
            letterSpacing: '2px',
            textShadow: isAnimating ? '0 0 5px #FFA500' : 'none',
            transition: 'text-shadow 0.1s ease-in-out'
          }}>
            {displayedTime.toFixed(2)}
          </div>
          <div style={{ color: '#FFA500', fontSize: window.innerWidth < 768 ? '0.8em' : '1em', marginTop: '5px' }}>segundos</div>
        </div>
      </div>

      {clickedPosition && arrowPath && (
        <div style={{ 
          fontSize: window.innerWidth < 768 ? '20px' : '24px', 
          color: gameOver ? '#FF4444' : '#FFD700',
          marginBottom: '15px',
          fontWeight: 'bold'
        }}>
          Pontuação: {calculateScore(calculateDistance(clickedPosition, arrowPath[1]), clickTime).total}
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: window.innerWidth < 768 ? '5px' : '10px',
        justifyContent: 'center',
        marginBottom: '15px'
      }}>
        {!gameOver && (
          <button
            onClick={onPauseGame}
            style={{
              padding: window.innerWidth < 768 ? '6px 15px' : '8px 20px',
              fontSize: window.innerWidth < 768 ? '0.9em' : '1em',
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
            padding: window.innerWidth < 768 ? '6px 15px' : '8px 20px',
            fontSize: window.innerWidth < 768 ? '0.9em' : '1em',
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
        position: 'relative'
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