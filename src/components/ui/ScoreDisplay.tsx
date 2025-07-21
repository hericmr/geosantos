import React from 'react';
import { TargetIcon, ClockIcon, ZapIcon } from './GameIcons';
import { styles } from './FeedbackPanel.styles';

interface ScoreDisplayProps {
  icon: 'target' | 'clock';
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
    if (bonus >= 3.0) return 'var(--accent-yellow)'; // Dourado
    if (bonus >= 2.0) return 'var(--accent-green)'; // Verde limão
    if (bonus >= 1.0) return 'var(--accent-blue)'; // Azul claro
    return 'var(--accent-yellow)'; // Amarelo para valores menores
  };

  // Função para renderizar o ícone correto
  const renderIcon = () => {
    switch (icon) {
      case 'target':
        return <TargetIcon size={24} color="var(--accent-green)" />;
      case 'clock':
        return <ClockIcon size={24} color="var(--accent-orange)" />;
      default:
        return <TargetIcon size={24} color="var(--accent-green)" />;
    }
  };

  return (
    <div style={styles.scoreDisplay}>
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 'clamp(2px, 0.5vw, 4px)',
        opacity: 0.9
      }}>
        {renderIcon()}
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
          fontFamily: "'VT323', monospace",
          fontWeight: 400,
          marginLeft: 'clamp(4px, 1vw, 8px)',
          color: getBonusColor(timeBonus),
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          background: `rgba(${timeBonus >= 2.0 ? '255, 215, 0' : '0, 255, 125'}, 0.15)`,
          padding: '3px 8px',
          borderRadius: '2px',
          border: `2px solid rgba(${timeBonus >= 2.0 ? '255, 215, 0' : '0, 255, 125'}, 0.3)`,
          animation: 'pulseText 1s infinite',
          boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)'
        }}>
          <ZapIcon size={16} color="var(--accent-yellow)" /> +{timeBonus.toFixed(1)}s
        </div>
      )}
    </div>
  );
}; 