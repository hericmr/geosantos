import { CSSProperties } from 'react';

export interface FeedbackPanelStyles {
  container: (gameOver: boolean, isMobile: boolean, popupPosition: { top: string; left: string }) => CSSProperties;
  contentContainer: CSSProperties;
  scoreDisplay: CSSProperties;
  scoreValue: CSSProperties;
  scoreUnit: CSSProperties;
  timeBonus: CSSProperties;
  feedbackMessage: (isExcellent: boolean) => CSSProperties;
  buttonContainer: CSSProperties;
  button: (variant: 'pause' | 'resume' | 'next' | 'retry') => CSSProperties;
  progressBar: (progress: number, color: string) => CSSProperties;
}

export const styles: FeedbackPanelStyles = {
  container: (gameOver, isMobile, popupPosition) => ({
    position: 'fixed',
    top: gameOver ? 'auto' : isMobile ? 'auto' : popupPosition.top,
    bottom: isMobile ? 0 : gameOver ? 0 : 'auto',
    left: gameOver ? 0 : isMobile ? 0 : popupPosition.left,
    right: isMobile ? 0 : 'auto',
    transform: gameOver ? 'none' : isMobile ? 'none' : 'none', // Removido translate para posicionamento absoluto
    width: isMobile ? '100%' : 'clamp(320px, 25vw, 450px)', // Largura responsiva
    maxWidth: gameOver ? '100%' : '450px',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    zIndex: 9999,
    padding: 'clamp(16px, 3vw, 24px)',
    borderRadius: isMobile ? '4px 4px 0 0' : '8px',
    boxShadow: 'var(--shadow-xl)',
    border: 'none',
    margin: isMobile ? '0' : '0',
    animation: gameOver ? 'slideUp 0.3s ease-out' : isMobile ? 'slideUp 0.3s ease-out' : 'slideInLeft 0.3s ease-out',
    maxHeight: isMobile ? '90vh' : '85vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(12px, 2vw, 16px)',
    fontFamily: "'VT323', monospace",
    // Garantir que não sobreponha a área do clique
    pointerEvents: 'auto',
    // Melhorar responsividade
    '@media (max-width: 1200px)': {
      width: 'clamp(300px, 30vw, 400px)',
      maxWidth: '400px'
    },
    '@media (max-width: 768px)': {
      width: '100%',
      maxWidth: '100%'
    }
  }),

  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'clamp(12px, 2vw, 20px)',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },

  scoreDisplay: {
    display: 'flex',
    gap: '2px',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },

  scoreValue: {
    fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)',
    fontFamily: "'VT323', monospace",
    fontWeight: 400,
    color: 'var(--text-primary)',
    textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)'
  },

  scoreUnit: {
    fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
    fontFamily: "'LaCartoonerie', sans-serif",
    fontWeight: 400,
    marginLeft: 'clamp(1px, 0.3vw, 2px)',
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },

  timeBonus: {
    fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
    fontFamily: "'LaCartoonerie', sans-serif",
    fontWeight: 400,
    marginLeft: 'clamp(4px, 1vw, 8px)',
    color: '#FFD700',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    background: 'rgba(255, 215, 0, 0.1)',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid rgba(255, 215, 0, 0.2)',
    animation: 'pulseText 1s infinite',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },

  feedbackMessage: (isExcellent) => ({
    marginTop: 'clamp(4px, 1vw, 8px)',
    color: '#FFD700',
    fontWeight: 400,
    fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
    textAlign: 'center',
    fontFamily: "'LaCartoonerie', sans-serif",
    animation: isExcellent ? 'pulseText 1s infinite' : 'none',
    opacity: 0.95,
    background: 'rgba(255, 215, 0, 0.1)',
    padding: 'clamp(4px, 1vw, 8px)',
    borderRadius: '6px',
    border: '1px solid rgba(255, 215, 0, 0.2)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  }),

  buttonContainer: {
    display: 'flex',
    gap: 'clamp(8px, 2vw, 12px)',
    justifyContent: 'center',
    marginTop: 'clamp(12px, 3vw, 20px)',
    flexWrap: 'nowrap',
    width: '100%'
  },

  button: (variant) => ({
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
    position: 'relative',
    overflow: 'hidden',
    textTransform: 'uppercase',
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

  progressBar: (progress, color) => ({
    position: 'absolute',
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