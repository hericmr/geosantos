import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  PlayIcon, 
  TrophyIcon, 
  LandmarkIcon
} from './GameIcons';
import { GameRanking } from './GameRanking';
import { GameMode } from '../../types/famousPlaces';

interface StartScreenProps {
  onStartGame: () => void;
  onShowLeaderboard?: () => void;
  highScore?: number;
  totalGames?: number;
  averageScore?: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  onShowLeaderboard,
  highScore = 0,
  totalGames = 0,
  averageScore = 0
}) => {
  const [selectedOption, setSelectedOption] = useState(0);



  const menuOptions = useMemo(() => [
    { id: 'famous_places', label: 'LUGARES FAMOSOS', icon: LandmarkIcon, action: () => {}, isMode: true, disabled: true },
    { id: 'play', label: 'JOGAR', icon: PlayIcon, action: onStartGame },
    { id: 'leaderboard', label: 'RANKING', icon: TrophyIcon, action: onShowLeaderboard }
  ], [onStartGame, onShowLeaderboard]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedOption(prev => {
        let newOption = prev > 0 ? prev - 1 : menuOptions.length - 1;
        // Pular opções desabilitadas
        while (menuOptions[newOption]?.disabled && newOption !== prev) {
          newOption = newOption > 0 ? newOption - 1 : menuOptions.length - 1;
        }
        return newOption;
      });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedOption(prev => {
        let newOption = prev < menuOptions.length - 1 ? prev + 1 : 0;
        // Pular opções desabilitadas
        while (menuOptions[newOption]?.disabled && newOption !== prev) {
          newOption = newOption < menuOptions.length - 1 ? newOption + 1 : 0;
        }
        return newOption;
      });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!menuOptions[selectedOption]?.disabled) {
        menuOptions[selectedOption].action?.();
      }
    }
  }, [menuOptions, selectedOption]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* Overlay escuro para melhorar legibilidade */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2,
        pointerEvents: 'none'
      }} />

      {/* Container principal */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '40px',
        maxWidth: '800px',
        width: '100%',
        position: 'relative',
        zIndex: 4
      }}>

        {/* Logo e título */}
        <div style={{
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            margin: '0',
            fontFamily: "'Press Start 2P', monospace",
            fontWeight: 400,
            color: 'var(--accent-green)',
            lineHeight: 1.2,
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            O CAIÇARA
          </h1>
          
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
            margin: '10px 0 0 0',
            fontFamily: "'VT323', monospace",
            color: 'var(--text-secondary)',
            textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)'
          }}>
            DESAFIO GEOGRÁFICO DE SANTOS
          </p>
        </div>

        <GameRanking 
          variant="startScreen" 
        />

        {/* Estatísticas do jogador */}
        {(highScore > 0 || totalGames > 0) && (
          <div style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {highScore > 0 && (
              <div style={{
                background: 'var(--bg-secondary)',
                border: '2px solid var(--accent-green)',
                borderRadius: '4px',
                padding: '12px 16px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-md)'
              }}>
                <div style={{
                  fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                  fontFamily: "'Press Start 2P', monospace",
                  color: 'var(--text-secondary)',
                  marginBottom: '4px'
                }}>
                  MELHOR PONTUAÇÃO
                </div>
                <div style={{
                  fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                  fontFamily: "'VT323', monospace",
                  color: 'var(--accent-green)',
                  fontWeight: 'bold'
                }}>
                  {highScore.toLocaleString()}
                </div>
              </div>
            )}
            
            {totalGames > 0 && (
              <div style={{
                background: 'var(--bg-secondary)',
                border: '2px solid var(--accent-blue)',
                borderRadius: '4px',
                padding: '12px 16px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-md)'
              }}>
                <div style={{
                  fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                  fontFamily: "'Press Start 2P', monospace",
                  color: 'var(--text-secondary)',
                  marginBottom: '4px'
                }}>
                  JOGOS JOGADOS
                </div>
                <div style={{
                  fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                  fontFamily: "'VT323', monospace",
                  color: 'var(--accent-blue)',
                  fontWeight: 'bold'
                }}>
                  {totalGames}
                </div>
              </div>
            )}
            
            {averageScore > 0 && (
              <div style={{
                background: 'var(--bg-secondary)',
                border: '2px solid var(--accent-orange)',
                borderRadius: '4px',
                padding: '12px 16px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-md)'
              }}>
                <div style={{
                  fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                  fontFamily: "'Press Start 2P', monospace",
                  color: 'var(--text-secondary)',
                  marginBottom: '4px'
                }}>
                  MÉDIA
                </div>
                <div style={{
                  fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                  fontFamily: "'VT323', monospace",
                  color: 'var(--accent-orange)',
                  fontWeight: 'bold'
                }}>
                  {Math.round(averageScore)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Menu principal */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minWidth: '300px'
        }}>
          {menuOptions.map((option, index) => {
            const IconComponent = option.icon;
            const isSelected = index === selectedOption;
            const isDisabled = option.disabled;
            
            return (
              <button
                key={option.id}
                onClick={isDisabled ? undefined : option.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 24px',
                  background: isDisabled ? 'var(--bg-muted)' : (isSelected ? 'var(--accent-green)' : 'var(--bg-secondary)'),
                  border: '3px solid var(--text-primary)',
                  borderRadius: '4px',
                  color: isDisabled ? 'var(--text-muted)' : (isSelected ? 'var(--bg-primary)' : 'var(--text-primary)'),
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.1s steps(1)',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: isSelected && !isDisabled ? 'var(--shadow-lg)' : 'var(--shadow-md)',
                  transform: isSelected && !isDisabled ? 'translate(-2px, -2px)' : 'translate(0, 0)',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: isDisabled ? 0.5 : 1
                }}
                onMouseEnter={() => !isDisabled && setSelectedOption(index)}
                onMouseLeave={() => setSelectedOption(0)}
              >
                <IconComponent 
                  size={24} 
                  color={isDisabled ? 'var(--text-muted)' : (isSelected ? 'var(--bg-primary)' : 'var(--text-primary)')} 
                />
                {option.label}
                
                {isDisabled && (
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: '0.7rem',
                    opacity: 0.8,
                    color: 'var(--accent-orange)',
                    fontFamily: "'VT323', monospace"
                  }}>
                    EM CONSTRUÇÃO
                  </span>
                )}
                
                {isSelected && !isDisabled && (
                  <div style={{
                    position: 'absolute',
                    right: '16px'
                  }}>
                    ▶
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Instruções */}
        <div style={{
          textAlign: 'center',
          maxWidth: '600px',
          padding: '20px',
          background: 'var(--bg-secondary)',
          border: '2px solid var(--text-primary)',
          borderRadius: '4px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <h3 style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
            margin: '0 0 12px 0',
            fontFamily: "'Press Start 2P', monospace",
            color: 'var(--accent-yellow)',
            textTransform: 'uppercase'
          }}>
            COMO JOGAR
          </h3>
          <div style={{
            fontSize: 'clamp(1rem, 2vw, 1.1rem)',
            fontFamily: "'VT323', monospace",
            color: 'var(--text-primary)',
            lineHeight: 1.4
          }}>
            <p style={{ margin: '15px 0' }}>
              • Clique no mapa onde você acha que está o bairro
            </p>
            <p style={{ margin: '15px 0' }}>
              • Quanto mais próximo, mais pontos você ganha
            </p>
            <p style={{ margin: '15px 0' }}>
              • Quanto mais rápido, mais bônus de tempo
            </p>
            <p style={{ margin: '15px 0' }}>
              • Use as setas do teclado para navegar no menu
            </p>
          </div>
        </div>

        {/* Créditos */}
        <div style={{
          textAlign: 'center',
          fontSize: 'clamp(0.8rem, 2vw, 1rem)',
          fontFamily: "'VT323', monospace",
          color: 'var(--text-muted)',
          marginTop: '20px'
        }}>
          <p style={{ margin: '4px 0' }}>
            Desenvolvido por hericmr
          </p>
        </div>
      </div>
    </div>
  );
}; 