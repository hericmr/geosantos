import React from 'react';

export interface GameRoundStatsProps {
  roundNumber: number;
  totalScore: number;
  bestStreak: number;
}

export const GameRoundStats: React.FC<GameRoundStatsProps> = ({
  roundNumber,
  totalScore,
  bestStreak
}) => {
  return (
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
  );
}; 