import React from 'react';
import { PauseIcon, NextIcon, RetryIcon, PlayIcon } from './GameIcons';

interface ActionButtonsProps {
  gameOver: boolean;
  onPauseGame: () => void;
  onResumeGame?: () => void;
  onNextRound: () => void;
  feedbackProgress: number;
  currentMode?: string;
  isPaused?: boolean;
}

const buttonStyles = {
  buttonContainer: {
    display: 'flex',
    gap: 'clamp(8px, 2vw, 12px)',
    justifyContent: 'center',
    marginTop: 'clamp(12px, 3vw, 20px)',
    flexWrap: 'nowrap' as const,
    width: '100%'
  },
  
  button: (variant: 'pause' | 'resume' | 'next' | 'retry') => ({
    padding: 'clamp(8px, 2vw, 12px) clamp(16px, 3vw, 24px)',
    fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
    background: variant === 'pause' ? 'var(--accent-orange)' : 
                variant === 'resume' ? 'var(--accent-green)' :
                variant === 'next' ? 'var(--accent-green)' : 'var(--accent-red)',
    color: variant === 'pause' ? '#000000' : '#ffffff',
    border: 'none',
    borderRadius: '2px',
    cursor: 'pointer',
    transition: 'all 0.1s steps(1)',
    fontWeight: 400,
    fontFamily: "'Press Start 2P', monospace",
    boxShadow: 'var(--shadow-md)',
    flex: variant === 'pause' || variant === 'resume' ? '0.4' : '0.6',
    maxWidth: variant === 'retry' ? '100%' : 'none',
    position: 'relative' as const,
    overflow: 'hidden',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    minWidth: variant === 'pause' || variant === 'resume' ? '100px' : '120px',
    zIndex: 1,
    '&:hover': {
      transform: 'translate(-1px, -1px)',
      boxShadow: 'var(--shadow-lg)'
    },
    '&:active': {
      transform: 'translate(1px, 1px)',
      boxShadow: 'var(--shadow-sm)'
    }
  }),

  progressBar: (progress: number, color: string) => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: `${progress}%`,
    height: '100%',
    background: color,
    transition: 'width 0.1s linear',
    zIndex: 1,
    transform: 'translateX(0)',
    transformOrigin: 'left'
  })
};

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  gameOver,
  onPauseGame,
  onResumeGame,
  onNextRound,
  feedbackProgress,
  currentMode = 'neighborhoods',
  isPaused = false
}) => {
  return (
    <div style={buttonStyles.buttonContainer}>
      {!gameOver && currentMode !== 'famous_places' && (
        <>
          {!isPaused ? (
            <button
              onClick={onPauseGame}
              className="pixel-btn pixel-btn--warning"
              style={buttonStyles.button('pause')}
            >
              <PauseIcon size={16} color="var(--text-primary)" />
              Pausar
            </button>
          ) : (
            <button
              onClick={() => onResumeGame?.()}
              className="pixel-btn pixel-btn--success"
              style={buttonStyles.button('resume')}
            >
              <PlayIcon size={16} color="var(--text-primary)" />
              Retomar
            </button>
          )}
        </>
      )}
      {/* Botão Próximo - sempre visível quando não é game over */}
      {!gameOver && (
        <button
          onClick={onNextRound}
          className="pixel-btn pixel-btn--success"
          style={buttonStyles.button('next')}
        >
          <div style={buttonStyles.progressBar(feedbackProgress, 'rgba(50, 205, 50, 0.3)')} />
          <div style={buttonStyles.progressBar(100 - feedbackProgress, 'rgba(255, 0, 0, 0.5)')} />
          <span style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <NextIcon size={16} color="var(--text-primary)" />
            Próximo
          </span>
        </button>
      )}
      
      {/* Botão Tente Outra Vez - apenas quando game over */}
      {gameOver && (
        <button
          onClick={onNextRound}
          className="pixel-btn pixel-btn--danger"
          style={buttonStyles.button('retry')}
        >
          <span style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <RetryIcon size={16} color="var(--text-primary)" />
            Tente Outra Vez
          </span>
        </button>
      )}
    </div>
  );
}; 