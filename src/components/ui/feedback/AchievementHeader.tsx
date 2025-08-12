import React from 'react';
import { GameIcon } from '../GameIcons';

export interface AchievementData {
  title: string;
  icon: string;
  color: string;
  streakBonus: string | null;
}

export interface AchievementHeaderProps {
  achievementData: AchievementData;
  showStreakAnimation: boolean;
}

export const AchievementHeader: React.FC<AchievementHeaderProps> = ({
  achievementData,
  showStreakAnimation
}) => {
  return (
    <div style={{
      textAlign: 'center',
      color: '#fff',
      fontSize: 'clamp(1.1rem, 2.8vw, 1.4rem)',
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      opacity: 0.95,
      marginBottom: '8px'
    }}>
      {/* Título da conquista */}
      <div style={{ 
        fontSize: 'clamp(1.3rem, 3.2vw, 1.6rem)', 
        color: achievementData.color, 
        fontFamily: "'LaCartoonerie', sans-serif",
        fontWeight: 400,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <GameIcon name={achievementData.icon} size={32} color={achievementData.color} />
        {achievementData.title}
      </div>

      {/* Streak bonus */}
      {achievementData.streakBonus && (
        <div style={{
          fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
          fontFamily: "'LaCartoonerie', sans-serif",
          color: '#FFD700',
          fontWeight: 400,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
          animation: showStreakAnimation ? 'pulseText 0.5s infinite' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          justifyContent: 'center',
          marginTop: '4px'
        }}>
          <span style={{ fontSize: '16px' }}>🔥</span>
          {achievementData.streakBonus}
        </div>
      )}
    </div>
  );
}; 