import React, { useState, useEffect } from 'react';
import { GameControlsProps } from '../../types/game';

export const GameControls: React.FC<GameControlsProps> = ({
  gameStarted,
  currentNeighborhood,
  timeLeft,
  totalTimeLeft,
  roundNumber,
  roundInitialTime,
  score,
  onStartGame,
  getProgressBarColor
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      background: 'rgba(20, 83, 45, 0.85)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      color: 'white',
      padding: gameStarted ? '0' : 'clamp(20px, 4vw, 30px)',
      textAlign: 'center',
      zIndex: 1002,
      boxSizing: 'border-box'
    }}>
      {!gameStarted ? (
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'clamp(8px, 1.5vw, 15px)',
          padding: 'clamp(8px, 1.5vw, 12px)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}>
            <h2 style={{ 
              fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', 
              margin: '0',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.4)',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              color: '#32CD32',
              lineHeight: 1.1
            }}>
              O Caiçara
            </h2>
            
            <p style={{ 
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', 
              margin: '3px 0 0 0',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              color: '#FFD700',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
              lineHeight: 1.2
            }}>
              Quão bem você conhece a sua cidade?
            </p>
          </div>
          
          <button 
            onClick={onStartGame}
            style={{
              padding: 'clamp(6px, 1.5vw, 10px) clamp(12px, 3vw, 20px)',
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              background: '#32CD32',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#28a745';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#32CD32';
            }}
          >
            Iniciar
          </button>
        </div>
      ) : (
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            width: '100vw',
            height: isMobile ? 'clamp(110px, 22vw, 130px)' : 'clamp(90px, 18vw, 110px)',
            background: '#2A2A2A',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            marginLeft: 'calc(-50vw + 50%)',
            marginRight: 'calc(-50vw + 50%)',
            bottom: 0
          }}>
            <div style={{
              width: `${(timeLeft / roundInitialTime) * 100}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${getProgressBarColor(timeLeft, roundInitialTime)}, ${getProgressBarColor(timeLeft, roundInitialTime)}CC)`,
              transition: 'width 0.1s linear',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              backgroundColor: '#1B4D3E',
              boxShadow: timeLeft <= 3 ? '0 0 20px rgba(255, 0, 0, 0.3)' : '0 0 15px rgba(255, 255, 255, 0.1)',
              animation: timeLeft <= 3 ? 'pulse 1s infinite' : 'none'
            }} />
            <style>
              {`
                @keyframes pulse {
                  0% { opacity: 1; }
                  50% { opacity: 0.8; }
                  100% { opacity: 1; }
                }
              `}
            </style>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '0 clamp(15px, 3vw, 25px)',
              zIndex: 2,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(20px, 4vw, 40px)',
                justifyContent: 'center',
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto'
              }}>
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ 
                    fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                    color: '#000000',
                    fontWeight: 600,
                    textShadow: '1px 1px 2px rgba(255, 255, 255, 0.8)',
                  }}>
                    Rodada {roundNumber}
                  </span>
                  <span style={{ 
                    fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)',
                    color: '#000000',
                    fontWeight: 700,
                    textShadow: '1px 1px 2px rgba(255, 255, 255, 0.8)',
                    whiteSpace: 'nowrap'
                  }}>
                    {Math.round(timeLeft * 10) / 10}s
                  </span>
                </div>
                <span style={{
                  color: 'white',
                  fontWeight: 800,
                  fontSize: 'clamp(2.2rem, 5.5vw, 3.2rem)',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
                  letterSpacing: '0.5px',
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1.2,
                  textAlign: 'center',
                  flex: 1
                }}>
                  {currentNeighborhood.charAt(0).toUpperCase() + currentNeighborhood.slice(1).toLowerCase()}!
                </span>
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ 
                    fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                    color: '#000000',
                    fontWeight: 600,
                    textShadow: '1px 1px 2px rgba(255, 255, 255, 0.8)',
                  }}>
                    Tempo Total
                  </span>
                  <span style={{ 
                    fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)',
                    color: '#000000',
                    fontWeight: 700,
                    textShadow: '1px 1px 2px rgba(255, 255, 255, 0.8)',
                    whiteSpace: 'nowrap'
                  }}>
                    {Math.round(totalTimeLeft * 10) / 10}s
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{
            width: '100%',
            padding: '10px 0',
            textAlign: 'center',
            background: 'rgba(20, 83, 45, 0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}>
            <p style={{ 
              fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)', 
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              color: '#FFD700',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              lineHeight: 1.2,
              margin: 0
            }}>
              Quão bem você conhece a sua cidade?
            </p>
          </div>
        </div>
      )}
    </div>
  );
}; 