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
      padding: '20px',
      borderRadius: '10px',
      textAlign: 'center',
      width: '80%',
      maxWidth: '600px',
      zIndex: 1000
    }}>
      {!gameStarted ? (
        <div>
          <h2>O Caiçara</h2>
          <p>Aprenda a geografia de Santos. Encontre os bairros da cidade!</p>
          <p>Quanto mais perto você clicar do bairro e quanto mais rápido for, mais pontos você ganha!</p>
          <button 
            onClick={onStartGame}
            style={{
              padding: '10px 20px',
              fontSize: '1.2em',
              background: '#32CD32',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Iniciar Jogo
          </button>
        </div>
      ) : (
        <div>
          <h2>Encontre o bairro: {currentNeighborhood}!</h2>
          <div style={{
            width: '100%',
            height: '20px',
            background: '#444',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '10px'
          }}>
            <div style={{
              width: `${(timeLeft / 45) * 100}%`,
              height: '100%',
              background: getProgressBarColor(timeLeft),
              transition: 'width 0.1s linear, background-color 0.5s ease'
            }} />
          </div>
          <p>Tempo restante: {Math.round(timeLeft * 10) / 10}s</p>
          <p>Pontuação: {Math.round(score)}</p>
        </div>
      )}
    </div>
  );
}; 