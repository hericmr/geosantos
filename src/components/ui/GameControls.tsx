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
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0, 0, 0, 0.85)',
      color: 'white',
      padding: 'clamp(15px, 3vw, 25px)',
      borderRadius: '15px',
      textAlign: 'center',
      width: '92%',
      maxWidth: '800px',
      zIndex: 1000,
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
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
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 15px rgba(46, 189, 65, 0.3)',
              touchAction: 'manipulation'
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
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: 'clamp(12px, 3vw, 18px)',
            position: 'relative',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              width: `${(timeLeft / 10) * 100}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${getProgressBarColor(timeLeft)}, ${getProgressBarColor(timeLeft)}CC)`,
              transition: 'width 0.1s linear, background-color 0.5s ease',
              position: 'absolute',
              left: 0,
              top: 0,
              boxShadow: '2px 0 10px rgba(255, 255, 255, 0.1)'
            }} />
            <span style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: 'clamp(1.4rem, 3.5vw, 2.4rem)',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              zIndex: 2,
              width: '100%',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {currentNeighborhood}!
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 10px'
          }}>
            <p style={{ 
              fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
              fontWeight: 'bold',
              color: '#FFD700'
            }}>
              Tempo: {Math.round(timeLeft * 10) / 10}s
            </p>
            <p style={{ 
              fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
              fontWeight: 'bold',
              color: '#FFD700'
            }}>
              Pontos: {Math.round(score)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}; 