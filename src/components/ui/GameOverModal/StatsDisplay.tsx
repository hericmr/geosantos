import React from 'react';
import { ClockIcon, TargetIcon, ZapIcon } from '../GameIcons';
import styles from '../GameOverModal.module.css';

interface StatsDisplayProps {
  playTime: number;
  roundsPlayed: number;
  accuracy: number;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatAccuracy = (acc: number): string => {
  return `${Math.round(acc * 100)}%`;
};

export const StatsDisplay: React.FC<StatsDisplayProps> = ({
  playTime,
  roundsPlayed,
  accuracy
}) => {
  return (
    <div className={styles.statsGrid}>
      <div className={`${styles.statItem} ${styles.blue}`} data-testid="play-time-stat">
        <ClockIcon size={20} color="var(--accent-blue)" />
        <div className={styles.statValue}>
          {formatTime(playTime)}
        </div>
      </div>
      
      <div className={`${styles.statItem} ${styles.green}`} data-testid="rounds-stat">
        <TargetIcon size={20} color="var(--accent-green)" />
        <div className={styles.statValue}>
          {roundsPlayed} rodadas
        </div>
      </div>
      
      <div className={`${styles.statItem} ${styles.orange}`} data-testid="accuracy-stat">
        <ZapIcon size={20} color="var(--accent-orange)" />
        <div className={styles.statValue}>
          {formatAccuracy(accuracy)}
        </div>
      </div>
    </div>
  );
}; 