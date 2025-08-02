import React from 'react';
import styles from '../GameOverModal.module.css';

interface RankingEntry {
  player_name: string;
  score: number;
}

interface TopRankingProps {
  rankingData: RankingEntry[];
}

export const TopRanking: React.FC<TopRankingProps> = ({ rankingData }) => {
  if (rankingData.length === 0) {
    return (
      <div className={styles.topRanking} data-testid="top-ranking">
        <h3 className={styles.topRankingTitle}>
          TOP 3 DO RANKING
        </h3>
        <p className={styles.emptyRanking}>
          Seja o primeiro a entrar para o ranking!
        </p>
      </div>
    );
  }

  return (
    <div className={styles.topRanking} data-testid="top-ranking">
      <h3 className={styles.topRankingTitle}>
        TOP 3 DO RANKING
      </h3>
      {rankingData.map((entry, index) => (
        <p 
          key={index} 
          className={styles.rankingEntry}
          data-testid={`ranking-entry-${index}`}
        >
          {index + 1}. {entry.player_name} - {entry.score.toLocaleString()} pontos
        </p>
      ))}
    </div>
  );
}; 