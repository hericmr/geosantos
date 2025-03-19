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
      background: 'rgba(0, 25, 0, 0.95)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      color: 'white',
      padding: 'clamp(20px, 4vw, 30px)',
      textAlign: 'center',
      zIndex: 1000,
      boxSizing: 'border-box'
    }}>
      {!gameStarted ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(15px, 3vw, 25px)'
        }}>
          <h2 style={{ 
            fontSize: 'clamp(2.2rem, 6vw, 3rem)', 
            marginBottom: '0.5rem',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.4)',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            letterSpacing: '0.5px',
            color: '#32CD32',
            lineHeight: 1.2
          }}>O Caiçara</h2>
          <p style={{ 
            fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', 
            marginBottom: '0.5rem',
            opacity: 0.95,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
            lineHeight: 1.4,
            maxWidth: '90%'
          }}>
            Quão bem você conhece Santos?!
          </p>
          <button 
            onClick={onStartGame}
            style={{
              padding: 'clamp(15px, 3vw, 20px) clamp(30px, 7vw, 40px)',
              fontSize: 'clamp(1.3rem, 4vw, 1.6rem)',
              background: 'linear-gradient(145deg, #38E54D, #2EBD41)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              touchAction: 'manipulation',
              boxShadow: '0 4px 15px rgba(46, 189, 65, 0.3)',
              minWidth: 'clamp(200px, 60vw, 300px)',
              minHeight: 'clamp(60px, 12vw, 80px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(46, 189, 65, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(46, 189, 65, 0.3)';
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(46, 189, 65, 0.2)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(46, 189, 65, 0.3)';
            }}
          >
            Iniciar Jogo
          </button>
        </div>
      ) : (
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(10px, 2vw, 15px)'
        }}>
          <div style={{
            width: '100%',
            height: 'clamp(70px, 14vw, 90px)',
            background: '#2A2A2A',
            overflow: 'hidden',
            position: 'relative',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              width: `${(timeLeft / 10) * 100}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${getProgressBarColor(timeLeft)}, ${getProgressBarColor(timeLeft)}CC)`,
              transition: 'width 0.1s linear, background-color 0.5s ease',
              position: 'absolute',
              left: 0,
              top: 0,
              borderRadius: '12px'
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
              padding: '0 clamp(15px, 3vw, 25px)',
              zIndex: 2
            }}>
              <span style={{ 
                fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
                color: '#FFD700',
                fontWeight: 600,
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
              }}>
                {Math.round(timeLeft * 10) / 10}s
              </span>
              <span style={{
                color: 'white',
                fontWeight: 700,
                fontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontFamily: "'Inter', sans-serif",
                lineHeight: 1.2
              }}>
                {currentNeighborhood}!
              </span>
              <span style={{ 
                fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
                color: '#FFD700',
                fontWeight: 600,
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
                opacity: 0
              }}>
                {Math.round(timeLeft * 10) / 10}s
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 