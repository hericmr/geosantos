import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  PlayIcon, 
  TrophyIcon, 
  LandmarkIcon
} from './GameIcons';
import { GameRanking } from './GameRanking';
import { GameMode } from '../../types/famousPlaces';
import { BookOpenIcon } from 'lucide-react';
import bgImage from '../../../public/assets/images/bg.png';

interface StartScreenProps {
  onStartGame: () => void;
  onShowLeaderboard?: () => void;
  highScore?: number;
  totalGames?: number;
  averageScore?: number;
  onSelectMode?: (mode: GameMode) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  onShowLeaderboard,
  highScore = 0,
  totalGames = 0,
  averageScore = 0,
  onSelectMode
}) => {
  const [selectedOption, setSelectedOption] = useState(0);



  const menuOptions = useMemo(() => [
    { id: 'famous_places', label: 'LUGARES FAMOSOS', icon: LandmarkIcon, action: () => { onSelectMode?.('famous_places'); onStartGame(); }, isMode: true },
    { id: 'play', label: 'JOGAR', icon: PlayIcon, action: onStartGame },
    { id: 'leaderboard', label: 'RANKING', icon: TrophyIcon, action: onShowLeaderboard },
    { id: 'wiki', label: 'CONHEÇA OS LUGARES', icon: BookOpenIcon, action: () => { window.location.href = '/jogocaicara/lugares-famosos'; } }
  ], [onStartGame, onShowLeaderboard, onSelectMode]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedOption(prev => {
        let newOption = prev > 0 ? prev - 1 : menuOptions.length - 1;
        return newOption;
      });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedOption(prev => {
        let newOption = prev < menuOptions.length - 1 ? prev + 1 : 0;
        return newOption;
      });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      menuOptions[selectedOption].action?.();
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
      background: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
      boxSizing: 'border-box'
    }}>


      {/* Container principal */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0px',
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
            fontSize: 'clamp(4.5rem, 10vw, 8rem)',
            margin: '0',
            fontFamily: "'LaCartoonerie', sans-serif",
            fontWeight: 800,
            color: '#000000',
            lineHeight: 1.2,
            textTransform: 'uppercase',
            letterSpacing: '0px',
            textShadow: '3px 3px 0px #fff, -3px -3px 0px #fff, 3px -3px 0px #fff, -3px 3px 0px #fff'
          }}>
            O CAIÇARA
          </h1>
          
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
            margin: '10px 0 40px 0',
            fontFamily: "'VT323', monospace",
            color: '#FFFFFF',
            textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000'
          }}>
            DESAFIO GEOGRÁFICO DE SANTOS
          </p>
        </div>

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
            // const isDisabled = option.disabled; // REMOVIDO
            return (
              <button
                key={option.id}
                onClick={option.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 24px',
                  background: isSelected ? 'var(--accent-green)' : 'var(--bg-secondary)',
                  border: '3px solid var(--text-primary)',
                  borderRadius: '4px',
                  color: isSelected ? 'var(--bg-primary)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.1s steps(1)',
                  fontFamily: "'LaCartoonerie', sans-serif",
                  fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: isSelected ? 'var(--shadow-lg)' : 'var(--shadow-md)',
                  transform: isSelected ? 'translate(-2px, -2px)' : 'translate(0, 0)',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: 1
                }}
                onMouseEnter={() => setSelectedOption(index)}
                onMouseLeave={() => setSelectedOption(0)}
              >
                <IconComponent 
                  size={24} 
                  color={isSelected ? 'var(--bg-primary)' : 'var(--text-primary)'} 
                />
                {option.label}
                {isSelected && (
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
          boxShadow: 'var(--shadow-md)',
          marginTop: '40px'
        }}>
          <h3 style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
            margin: '0 0 12px 0',
            fontFamily: "'LaCartoonerie', sans-serif",
            color: 'var(--accent-yellow)',
            textTransform: 'uppercase'
          }}>
            COMO JOGAR
          </h3>
          <div style={{
            fontSize: 'clamp(1rem, 2vw, 1.1rem)',
            fontFamily: "'LaCartoonerie', sans-serif",
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

        <GameRanking 
          variant="startScreen" 
        />

        {/* Créditos */}
        <div style={{
          textAlign: 'center',
          fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
          fontFamily: "'LaCartoonerie', sans-serif",
          color: '#000000',
          marginTop: '20px'
        }}>
          <p style={{ 
            margin: '4px 0',
            textShadow: '2px 2px 0px #fff, -2px -2px 0px #fff, 2px -2px 0px #fff, -2px 2px 0px #fff'
          }}>
            Desenvolvido por{' '}
            <a 
              href="https://hericmr.github.io/me/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: '#000000',
                textDecoration: 'none',
                textShadow: '2px 2px 0px #fff, -2px -2px 0px #fff, 2px -2px 0px #fff, -2px 2px 0px #fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0066CC';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#000000';
              }}
            >
              hericmr
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}; 