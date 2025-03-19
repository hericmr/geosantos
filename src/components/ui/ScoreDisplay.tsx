import React from 'react';

interface ScoreDisplayProps {
  score: number;
  targetScore?: number;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, targetScore = 5000 }) => {
  const remainingPoints = Math.max(0, targetScore - score);
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#000000',
      padding: '8px',
      color: '#32CD32',
      fontFamily: "'Inter', sans-serif",
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      minWidth: '200px',
      border: '2px solid #32CD32'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(50, 205, 50, 0.3)',
        paddingBottom: '4px'
      }}>
        <span style={{
          fontSize: '0.9rem',
          fontWeight: 500,
          opacity: 0.9
        }}>
          Fase 1
        </span>
        <span style={{
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          Pontos para avançar
        </span>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{
          fontSize: '1.1rem',
          fontWeight: 600
        }}>
          {score}
        </span>
        <span style={{
          fontSize: '1.1rem',
          fontWeight: 600
        }}>
          {remainingPoints}
        </span>
      </div>
    </div>
  );
}; 