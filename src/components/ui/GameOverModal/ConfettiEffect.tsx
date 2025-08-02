import React from 'react';
import styles from '../GameOverModal.module.css';

interface ConfettiEffectProps {
  isVisible: boolean;
}

const confettiColors = [
  'var(--accent-yellow)', 
  'var(--accent-green)', 
  'var(--accent-blue)', 
  'var(--accent-orange)', 
  'var(--accent-red)'
];

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.confetti}>
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className={styles.confettiPiece}
          style={{
            left: `${Math.random() * 100}%`,
            background: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 3}s`
          }}
        />
      ))}
    </div>
  );
}; 