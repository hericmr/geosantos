import React, { useEffect, useState } from 'react';

interface AchievementAnimationProps {
  achievement: string;
  isVisible: boolean;
  onComplete: () => void;
}

const achievementConfigs = {
  BULLSEYE: {
    title: "🎯 BULLSEYE!",
    subtitle: "Acerto Perfeito!",
    color: "#FFD700",
    animation: "bullseye",
    duration: 3000
  },
  STREAK_3: {
    title: "🔥 STREAK!",
    subtitle: "3 acertos seguidos!",
    color: "#FF6B35",
    animation: "streak",
    duration: 2500
  },
  STREAK_5: {
    title: "🔥🔥 STREAK!",
    subtitle: "5 acertos seguidos!",
    color: "#FF4500",
    animation: "streak",
    duration: 3000
  },
  STREAK_10: {
    title: "🔥🔥🔥 LEGEND!",
    subtitle: "10 acertos seguidos!",
    color: "#FF0000",
    animation: "legend",
    duration: 4000
  },
  PERFECT_ROUND: {
    title: "⭐ PERFEITO!",
    subtitle: "Rodada sem erros!",
    color: "#FFD700",
    animation: "perfect",
    duration: 3000
  }
};

export const AchievementAnimation: React.FC<AchievementAnimationProps> = ({
  achievement,
  isVisible,
  onComplete
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const config = achievementConfigs[achievement as keyof typeof achievementConfigs];

  useEffect(() => {
    if (isVisible && config) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onComplete();
      }, config.duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, config, onComplete]);

  if (!isVisible || !config) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 10030,
      pointerEvents: 'none'
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.9)',
        border: `3px solid ${config.color}`,
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
        animation: `${config.animation} ${config.duration}ms ease-out`,
        boxShadow: `0 0 30px ${config.color}`,
        minWidth: '300px'
      }}>
        <div style={{
          fontSize: '2rem',
          color: config.color,
          fontWeight: 700,
          marginBottom: '8px',
          textShadow: `0 0 10px ${config.color}`,
          animation: 'pulse 0.5s infinite'
        }}>
          {config.title}
        </div>
        <div style={{
          fontSize: '1.2rem',
          color: '#fff',
          fontWeight: 500
        }}>
          {config.subtitle}
        </div>
      </div>

      <style>
        {`
          @keyframes bullseye {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.5) rotate(-10deg);
            }
            20% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1.1) rotate(5deg);
            }
            40% {
              transform: translate(-50%, -50%) scale(1) rotate(0deg);
            }
            80% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1) rotate(0deg);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(1.2) rotate(0deg);
            }
          }

          @keyframes streak {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.3);
            }
            20% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1.2);
            }
            40% {
              transform: translate(-50%, -50%) scale(1);
            }
            60% {
              transform: translate(-50%, -50%) scale(1.05);
            }
            80% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(1.1);
            }
          }

          @keyframes legend {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.1) rotate(-180deg);
            }
            30% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1.3) rotate(0deg);
            }
            50% {
              transform: translate(-50%, -50%) scale(1) rotate(0deg);
            }
            70% {
              transform: translate(-50%, -50%) scale(1.1) rotate(0deg);
            }
            90% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1) rotate(0deg);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(1.2) rotate(0deg);
            }
          }

          @keyframes perfect {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.8);
            }
            25% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1.1);
            }
            50% {
              transform: translate(-50%, -50%) scale(1);
            }
            75% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1.05);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(1.1);
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