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
      padding: gameStarted ? '0' : 'clamp(10px, 2vw, 15px)',
      textAlign: 'center',
      zIndex: 1002,
      boxSizing: 'border-box'
    }}>
      <style>
        {`
          @keyframes pulseText {
            0% { transform: scale(1); }
            50% { transform: scale(1.03); }
            100% { transform: scale(1); }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .game-title { animation: pulseText 1.5s infinite; }
          .game-description { animation: fadeIn 0.3s ease-out; }
          .start-button { animation: fadeIn 0.3s ease-out 0.2s both; }
        `}
      </style>
      
      {!gameStarted ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(4px, 1vw, 8px)',
          padding: 'clamp(5px, 1vw, 10px)',
          maxWidth: '600px',
          margin: '0 auto',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <style>
            {`
              @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-10px); }
              }
              .fade-out { animation: fadeOut 0.3s ease-out forwards; }
            `}
          </style>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'clamp(2px, 0.5vw, 4px)',
            textAlign: 'center',
            width: '100%',
            padding: '0 10px'
          }}>
            <h2 className="game-title" style={{ 
              fontSize: 'clamp(1.8rem, 3.5vw, 2.2rem)', 
              margin: '0',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              color: '#32CD32',
              lineHeight: 1
            }}>
              O Caiçara
            </h2>
            
            <p className="game-description" style={{ 
              fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)', 
              margin: '0',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              color: '#FFFFFF',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
              lineHeight: 1.2
            }}>
              Prepare-se!<br/>
              Clique o mais próximo possível dos bairros no mapa. Velocidade importa, quanto mais rápido melhor!
            </p>
          </div>
          
          <button 
            className="start-button"
            onClick={(e) => {
              const parent = e.currentTarget.closest('div');
              if (parent) {
                parent.classList.add('fade-out');
                setTimeout(() => {
                  onStartGame();
                }, 300);
              }
            }}
            style={{
              padding: 'clamp(8px, 1.5vw, 12px) clamp(30px, 4vw, 40px)',
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              background: '#32CD32',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              marginTop: '8px',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.background = '#28a745';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = '#32CD32';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
            }}
          >
            Jogar
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
              padding: '0',
              zIndex: 2,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%)'
            }}>
              <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ 
                  position: 'absolute',
                  left: 'clamp(15px, 3vw, 25px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ 
                    fontSize: isMobile ? 'clamp(0.7rem, 1.8vw, 0.8rem)' : 'clamp(1rem, 2.5vw, 1.2rem)',
                    color: '#000000',
                    fontWeight: 600,
                    textShadow: '1px 1px 2px rgba(255, 255, 255, 0.8)',
                  }}>
                    Rodada {roundNumber}
                  </span>
                  <span style={{ 
                    fontSize: isMobile ? 'clamp(0.9rem, 2vw, 1rem)' : 'clamp(1.4rem, 3.5vw, 1.8rem)',
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
                  maxWidth: '80%'
                }}>
                  {currentNeighborhood.charAt(0).toUpperCase() + currentNeighborhood.slice(1).toLowerCase()}!
                </span>
              </div>
            </div>
          </div>
          
          <div style={{
            width: '100%',
            padding: '4px 0',
            textAlign: 'center',
            background: 'rgba(20, 83, 45, 0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}>
            <p style={{ 
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', 
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              color: '#FFFFFF',
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