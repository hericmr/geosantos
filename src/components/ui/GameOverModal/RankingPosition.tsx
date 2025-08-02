import React from 'react';
import styles from '../GameOverModal.module.css';

interface RankingPositionProps {
  position: number | null;
  isVisible: boolean;
}

const getRankingStatus = (position: number): string => {
  if (position === 1) return '🏆 CAMPEÃO ABSOLUTO! 🏆';
  if (position <= 3) return '🥇 TOP 3 - LENDÁRIO! 🥇';
  if (position <= 10) return '🥈 TOP 10 - IMPRESSIONANTE! 🥈';
  if (position <= 50) return '🥉 TOP 50 - MUITO BOM! 🥉';
  return '🎯 NO RANKING! 🎯';
};

export const RankingPosition: React.FC<RankingPositionProps> = ({ 
  position, 
  isVisible 
}) => {
  if (!isVisible || position === null) {
    return null;
  }

  return (
    <div className={styles.rankingPosition} data-testid="ranking-position">
      <div className={styles.rankingTitle}>
        POSIÇÃO NO RANKING
      </div>
      
      <div className={styles.rankingNumber} data-testid="ranking-number">
        #{position}
      </div>
      
      <div className={styles.rankingStatus}>
        {getRankingStatus(position)}
      </div>
    </div>
  );
}; 