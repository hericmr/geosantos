import { CSSProperties } from 'react';

export const styles = {
  container: {
    position: 'fixed' as const,
    bottom: '0',
    left: '0',
    width: '100%',
    background: 'rgba(20, 83, 45, 0.85)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    color: 'white',
    padding: 'clamp(20px, 4vw, 30px)',
    textAlign: 'center' as const,
    zIndex: 1002,
    boxSizing: 'border-box' as const,
  },

  gameOverContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 'clamp(12px, 2vw, 20px)',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },

  gameOverTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    color: '#FF0000',
    margin: '0',
    fontWeight: 800,
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
  },

  scoreContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 'clamp(4px, 1vw, 8px)',
  },

  scoreLabel: {
    fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
    color: '#FFD700',
    fontWeight: 600,
  },

  scoreValue: {
    fontSize: 'clamp(2rem, 5vw, 2.5rem)',
    color: '#32CD32',
    fontWeight: 800,
  },

  buttonContainer: {
    display: 'flex',
    gap: 'clamp(8px, 2vw, 12px)',
    justifyContent: 'center',
    marginTop: 'clamp(12px, 3vw, 20px)',
    flexWrap: 'nowrap' as const,
    width: '100%',
  },

  pauseButton: {
    padding: 'clamp(8px, 2vw, 12px) clamp(16px, 3vw, 24px)',
    fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
    background: '#FFA500',
    color: '#000000',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    flex: 1,
    maxWidth: '45%',
  },

  nextButton: (gameOver: boolean): CSSProperties => ({
    padding: 'clamp(8px, 2vw, 12px) clamp(16px, 3vw, 24px)',
    fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
    background: gameOver ? '#FF0000' : '#32CD32',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: 'bold',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    position: 'relative',
    overflow: 'hidden',
    flex: 1,
    maxWidth: gameOver ? '100%' : '45%',
    height: 'auto',
  }),

  progressBar: (feedbackProgress: number): CSSProperties => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: `${feedbackProgress}%`,
    height: '100%',
    background: 'rgba(50, 205, 50, 0.3)',
    transition: 'width 0.1s linear',
    zIndex: 1,
    transform: 'translateX(0)',
    transformOrigin: 'left',
  }),

  buttonText: {
    position: 'relative',
    zIndex: 2,
  },

  timeBonusContainer: {
    marginTop: 'clamp(4px, 1vw, 8px)',
    color: '#FFD700',
    fontWeight: 600,
    fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
    textAlign: 'center' as const,
    fontFamily: "'Inter', sans-serif",
    animation: 'pulseText 1s infinite',
    opacity: 0.95,
    background: 'rgba(255, 215, 0, 0.1)',
    padding: 'clamp(4px, 1vw, 8px)',
    borderRadius: '6px',
    border: '1px solid rgba(255, 215, 0, 0.2)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },

  feedbackMessage: (isSuccess: boolean): CSSProperties => ({
    marginTop: 'clamp(4px, 1vw, 8px)',
    color: '#FFD700',
    fontWeight: 600,
    fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
    textAlign: 'center',
    fontFamily: "'Inter', sans-serif",
    animation: isSuccess ? 'pulseText 1s infinite' : 'none',
    opacity: 0.95,
    background: 'rgba(255, 215, 0, 0.1)',
    padding: 'clamp(4px, 1vw, 8px)',
    borderRadius: '6px',
    border: '1px solid rgba(255, 215, 0, 0.2)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  }),
}; 