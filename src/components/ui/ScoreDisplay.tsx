import React from 'react';
import { styles } from './FeedbackPanel.styles';

interface ScoreDisplayProps {
  icon: string;
  value: number;
  unit: string;
  timeBonus?: number;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  icon,
  value,
  unit,
  timeBonus
}) => {
  // Determinar a cor do bônus de tempo com base no valor
  const getBonusColor = (bonus: number): string => {
    if (bonus >= 3.0) return '#FFDF00'; // Dourado
    if (bonus >= 2.0) return '#32CD32'; // Verde limão
    if (bonus >= 1.0) return '#00BFFF'; // Azul claro
    return '#FFD700'; // Amarelo para valores menores
  };

  return (
    <div style={styles.scoreDisplay}>
      <div style={{ 
        fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)',
        fontFamily: "'Inter', sans-serif",
        marginRight: 'clamp(2px, 0.5vw, 4px)',
        opacity: 0.9
      }}>
        {icon}
      </div>
      <div style={styles.scoreValue}>
        {Math.round(value)}
      </div>
      <div style={styles.scoreUnit}>
        {unit}
      </div>
      {timeBonus && timeBonus > 0 && (
        <div style={{
          fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          marginLeft: 'clamp(4px, 1vw, 8px)',
          color: getBonusColor(timeBonus),
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          background: `rgba(${timeBonus >= 2.0 ? '255, 215, 0' : '0, 255, 125'}, 0.15)`,
          padding: '3px 8px',
          borderRadius: '4px',
          border: `1px solid rgba(${timeBonus >= 2.0 ? '255, 215, 0' : '0, 255, 125'}, 0.3)`,
          animation: 'pulseText 1s infinite',
          boxShadow: '0 0 8px rgba(255, 215, 0, 0.3)'
        }}>
          <span style={{ fontSize: '120%' }}>⚡</span> +{timeBonus.toFixed(1)}s
        </div>
      )}
    </div>
  );
}; 