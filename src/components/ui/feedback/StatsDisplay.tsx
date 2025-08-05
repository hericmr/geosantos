import React from 'react';
import { ScoreDisplay } from '../ScoreDisplay';

export interface StatsDisplayProps {
  score: number;
  timeBonus: number;
  clickTime: number;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({
  score,
  timeBonus,
  clickTime
}) => {
  return (
    <div style={{
      display: 'flex',
      gap: 'clamp(10px, 2vw, 20px)',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap'
    }}>
      <ScoreDisplay
        icon="target"
        value={score}
        unit="pts"
      />
      <ScoreDisplay
        icon="clock"
        value={1000 - (clickTime * 100)}
        unit="pts"
        timeBonus={timeBonus}
      />
    </div>
  );
}; 