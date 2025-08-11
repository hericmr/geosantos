import React from 'react';

interface GameStatsProps {
  totalScore: number;
  roundNumber: number;
  consecutiveCorrect: number;
  bestStreak: number;
  averageScore: number;
  isVisible: boolean;
}

export const GameStats: React.FC<GameStatsProps> = ({
  totalScore,
  roundNumber,
  consecutiveCorrect,
  bestStreak,
  averageScore,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      border: 'none',
      borderRadius: '8px',
      padding: '12px',
      zIndex: 1000,
      fontFamily: "'VT323', monospace",
      fontSize: '0.9rem',
      color: '#fff',
      minWidth: '200px',
      backdropFilter: 'blur(10px)',
      animation: 'slideInRight 0.3s ease-out'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* Título */}
        <div style={{
          textAlign: 'center',
          fontWeight: 700,
          color: '#FFD700',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          paddingBottom: '4px',
          marginBottom: '4px'
        }}>
          📊 ESTATÍSTICAS
        </div>

        {/* Pontuação Total */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>💰 Total:</span>
          <span style={{ color: '#32CD32', fontWeight: 600 }}>
            {totalScore.toLocaleString()}
          </span>
        </div>

        {/* Rodada Atual */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>🎮 Rodada:</span>
          <span style={{ color: '#FFD700', fontWeight: 600 }}>
            {roundNumber}
          </span>
        </div>

        {/* Streak Atual */}
        {consecutiveCorrect > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: consecutiveCorrect >= 3 ? 'rgba(255, 107, 53, 0.2)' : 'rgba(255, 215, 0, 0.1)',
            padding: '4px 8px',
            borderRadius: '4px',
            border: consecutiveCorrect >= 3 ? '1px solid rgba(255, 107, 53, 0.5)' : '1px solid rgba(255, 215, 0, 0.3)'
          }}>
            <span>🔥 Streak:</span>
            <span style={{ 
              color: consecutiveCorrect >= 3 ? '#FF6B35' : '#FFD700', 
              fontWeight: 600,
              animation: consecutiveCorrect >= 3 ? 'pulse 1s infinite' : 'none'
            }}>
              {consecutiveCorrect}
            </span>
          </div>
        )}

        {/* Melhor Streak */}
        {bestStreak > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>🏆 Melhor:</span>
            <span style={{ color: '#FFD700', fontWeight: 600 }}>
              {bestStreak}
            </span>
          </div>
        )}

        {/* Média de Pontuação */}
        {averageScore > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>📈 Média:</span>
            <span style={{ color: '#00CED1', fontWeight: 600 }}>
              {Math.round(averageScore)}
            </span>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes slideInRight {
            0% {
              opacity: 0;
              transform: translateX(100%);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}; 