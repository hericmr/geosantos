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
        <div style={styles.scoreUnit}>
          <span>⚡</span> +{timeBonus.toFixed(2)}s
        </div>
      )}
    </div>
  );
}; 