import React, { useState, useEffect } from 'react';
import { GameControlsProps } from '../../types/game';
import { PlayIcon } from './GameIcons';
import { StartScreen } from './StartScreen';
import { useGameStats } from '../../hooks/useGameStats';
import { usePlayerName } from '../../hooks/usePlayerName';
import { GameMode } from '../../types/famousPlaces';

import { LeaderboardModal } from './LeaderboardModal';

export const GameControls: React.FC<GameControlsProps> = ({
  gameStarted,
  currentNeighborhood,
  timeLeft,
  totalTimeLeft,
  roundNumber,
  roundInitialTime,
  score,
  onStartGame,
  getProgressBarColor,
  currentMode,
  onModeChange,
  currentFamousPlace
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { stats, resetStats } = useGameStats();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { playerName, initializePlayerName } = usePlayerName();

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
      background: 'var(--bg-secondary)',
      border: '2px solid var(--text-primary)',
      borderBottom: 'none',
      color: 'var(--text-primary)',
      padding: gameStarted ? '0' : 'clamp(10px, 2vw, 15px)',
      textAlign: 'center',
      zIndex: 1002,
      boxSizing: 'border-box',
      boxShadow: 'var(--shadow-md)'
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
        <StartScreen
          onStartGame={onStartGame}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          
          highScore={stats.highScore}
          totalGames={stats.totalGames}
          averageScore={stats.averageScore}
          onSelectMode={onModeChange}
        />
      ) : (
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Removido bloco de resumo do lugar famoso, pois agora existe um modal dedicado */}
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
                  fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
                  letterSpacing: '1px',
                  fontFamily: "'Press Start 2P', monospace",
                  lineHeight: 1.2,
                  textAlign: 'center',
                  maxWidth: '80%',
                  textTransform: 'uppercase'
                }}>
                  {currentMode === 'neighborhoods' 
                    ? currentNeighborhood.charAt(0).toUpperCase() + currentNeighborhood.slice(1).toLowerCase()
                    : currentFamousPlace?.name || 'NOME INDISPONÍVEL'
                  }
                </span>
              </div>
            </div>
          </div>
          
          <div style={{
            width: '100%',
            padding: '6px 0',
            textAlign: 'center',
            background: 'rgba(20, 83, 45, 0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}>
            <p style={{ 
              fontSize: 'clamp(0.7rem, 1.8vw, 0.9rem)', 
              fontFamily: "'Press Start 2P', monospace",
              fontWeight: 400,
              color: '#FFFFFF',
              lineHeight: 1.4,
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
              animation: 'glowText 2s ease-in-out infinite alternate'
            }}>
              {currentMode === 'neighborhoods' 
                ? 'Encontre o bairro no mapa!'
                : currentMode === 'famous_places'
                ? 'Encontre o lugar famoso!'
                : 'Quão bem você conhece a sua cidade?'
              }
            </p>
            <style>
              {`
                @keyframes glowText {
                  0% { text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5), 0 0 5px rgba(255, 255, 255, 0.3); }
                  100% { text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 255, 255, 0.6); }
                }
              `}
            </style>
          </div>
        </div>
      )}

      {/* Modais */}
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        currentPlayerScore={score}
        currentPlayerName={playerName || initializePlayerName()}
      />
    </div>
  );
}; 