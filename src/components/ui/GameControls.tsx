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
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(15px, 3vw, 25px)',
          padding: 'clamp(20px, 4vw, 40px) 0'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: 'clamp(15px, 4vw, 25px)',
            borderRadius: '15px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            width: '90%',
            maxWidth: '600px',
            marginBottom: 'clamp(10px, 2vw, 20px)'
          }}>
            <h2 style={{ 
              fontSize: 'clamp(2.5rem, 7vw, 3.5rem)', 
              marginBottom: '10px',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 800,
              letterSpacing: '0.5px',
              color: '#32CD32',
              lineHeight: 1.2,
              textAlign: 'center',
              animation: 'titlePulse 2s infinite'
            }}>
              <span style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', verticalAlign: 'middle', marginRight: '8px' }}>🌊</span>
              O Caiçara
              <span style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', verticalAlign: 'middle', marginLeft: '8px' }}>🗺️</span>
            </h2>
            
            <p style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              color: '#FFFFFF',
              opacity: 0.9,
              textAlign: 'center',
              margin: '0 0 15px 0'
            }}>
              Desafie seus conhecimentos geográficos!
            </p>
            
            <p style={{ 
              fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)', 
              marginBottom: '20px',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              color: '#FFD700',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              lineHeight: 1.4,
              maxWidth: '90%',
              textAlign: 'center'
            }}>
              Quão bem você conhece a sua cidade?
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'clamp(10px, 2vw, 15px)',
            width: '90%',
            maxWidth: '600px'
          }}>
            <div style={{
              display: 'flex',
              gap: 'clamp(15px, 3vw, 25px)',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: 'clamp(15px, 3vw, 25px)'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: 'clamp(10px, 2vw, 15px)',
                borderRadius: '10px',
                maxWidth: '160px'
              }}>
                <span style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', marginBottom: '5px' }}>🎯</span>
                <span style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', textAlign: 'center', fontWeight: 600 }}>Localize os bairros</span>
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: 'clamp(10px, 2vw, 15px)',
                borderRadius: '10px',
                maxWidth: '160px'
              }}>
                <span style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', marginBottom: '5px' }}>⏱️</span>
                <span style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', textAlign: 'center', fontWeight: 600 }}>Contra o relógio</span>
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: 'clamp(10px, 2vw, 15px)',
                borderRadius: '10px',
                maxWidth: '160px'
              }}>
                <span style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', marginBottom: '5px' }}>🏆</span>
                <span style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', textAlign: 'center', fontWeight: 600 }}>Ganhe pontos</span>
              </div>
            </div>
            
            <button 
              onClick={onStartGame}
              style={{
                padding: 'clamp(15px, 3vw, 20px) clamp(30px, 7vw, 40px)',
                fontSize: 'clamp(1.3rem, 4vw, 1.6rem)',
                background: 'linear-gradient(145deg, #38E54D, #2EBD41)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                touchAction: 'manipulation',
                boxShadow: '0 4px 15px rgba(46, 189, 65, 0.3)',
                minWidth: 'clamp(200px, 60vw, 300px)',
                minHeight: 'clamp(60px, 12vw, 80px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                animation: 'float 3s ease-in-out infinite'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(46, 189, 65, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(46, 189, 65, 0.3)';
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(46, 189, 65, 0.2)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(46, 189, 65, 0.3)';
              }}
            >
              <span style={{ marginRight: '10px', fontSize: 'clamp(1.5rem, 3.5vw, 1.8rem)' }}>🎮</span> Iniciar Jogo
            </button>
          </div>
          
          <style>
            {`
              @keyframes float {
                0% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
                100% { transform: translateY(0); }
              }
              @keyframes titlePulse {
                0% { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6); }
                50% { text-shadow: 2px 2px 15px rgba(50, 205, 50, 0.5); }
                100% { text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6); }
              }
            `}
          </style>
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