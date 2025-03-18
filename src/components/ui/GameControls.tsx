import React from 'react';
import { GameControlsProps } from '../../types/game';

export const GameControls: React.FC<GameControlsProps> = ({
  gameStarted,
  currentNeighborhood,
  timeLeft,
  score,
  onStartGame,
  getProgressBarColor
}) => {
  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      background: 'rgba(0, 25, 0, 0.9)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      color: 'white',
      padding: 'clamp(15px, 3vw, 25px)',
      textAlign: 'center',
      zIndex: 1000
    }}>
      {!gameStarted ? (
        <div>
          <h2 style={{ 
            fontSize: 'clamp(2rem, 5vw, 2.5rem)', 
            marginBottom: '1.2rem',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
          }}>O Caiçara</h2>
          <p style={{ 
            fontSize: 'clamp(1rem, 2.2vw, 1.2rem)', 
            marginBottom: '1.5rem',
            opacity: 0.9
          }}>
            Aprenda a geografia de Santos. Encontre os bairros da cidade!
          </p>
          <button 
            onClick={onStartGame}
            style={{
              padding: 'clamp(10px, 2.5vw, 15px) clamp(20px, 5vw, 30px)',
              fontSize: 'clamp(1.1rem, 3.2vw, 1.3rem)',
              background: 'linear-gradient(145deg, #38E54D, #2EBD41)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              touchAction: 'manipulation'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Iniciar Jogo
          </button>
        </div>
      ) : (
        <div>
          <div style={{
            width: '100%',
            height: 'clamp(60px, 12vw, 80px)',
            background: '#2A2A2A',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: `${(timeLeft / 10) * 100}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${getProgressBarColor(timeLeft)}, ${getProgressBarColor(timeLeft)}CC)`,
              transition: 'width 0.1s linear, background-color 0.5s ease',
              position: 'absolute',
              left: 0,
              top: 0
            }} />
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 20px',
              zIndex: 2
            }}>
              <span style={{ 
                fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
                color: '#FFD700'
              }}>
                {Math.round(timeLeft * 10) / 10}s
              </span>
              <span style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: 'clamp(1.4rem, 3.5vw, 2.4rem)',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {currentNeighborhood}!
              </span>
              <span style={{ 
                fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
                color: '#FFD700'
              }}>
                {Math.round(score)} pts
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 