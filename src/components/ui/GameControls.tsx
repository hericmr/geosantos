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
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: 'clamp(10px, 2vw, 20px)',
      borderRadius: '10px',
      textAlign: 'center',
      width: '90%',
      maxWidth: '600px',
      zIndex: 1000
    }}>
      {!gameStarted ? (
        <div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '1rem' }}>O Caiçara</h2>
          <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', marginBottom: '1rem' }}>
            Aprenda a geografia de Santos. Encontre os bairros da cidade!
          </p>
          <button 
            onClick={onStartGame}
            style={{
              padding: 'clamp(8px, 2vw, 12px) clamp(16px, 4vw, 24px)',
              fontSize: 'clamp(1rem, 3vw, 1.2rem)',
              background: '#32CD32',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              touchAction: 'manipulation'
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
            height: 'clamp(40px, 8vw, 60px)',
            background: '#444',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: 'clamp(8px, 2vw, 12px)',
            position: 'relative'
          }}>
            <div style={{
              width: `${(timeLeft / 10) * 100}%`,
              height: '100%',
              background: getProgressBarColor(timeLeft),
              transition: 'width 0.1s linear, background-color 0.5s ease',
              position: 'absolute',
              left: 0,
              top: 0
            }} />
            <span style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#000000',
              fontWeight: 'bold',
              fontSize: 'clamp(1.2rem, 3vw, 2.2rem)',
              textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
              zIndex: 2,
              width: '100%',
              textAlign: 'center',
              textTransform: 'uppercase'
            }}>
              {currentNeighborhood}!
            </span>
          </div>
          <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', marginBottom: '0.5rem' }}>
            Tempo restante: {Math.round(timeLeft * 10) / 10}s
          </p>
          <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
            Pontuação: {Math.round(score)}
          </p>
        </div>
      )}
    </div>
  );
}; 