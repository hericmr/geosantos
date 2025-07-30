import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  PlayIcon, 
  TrophyIcon, 
  LandmarkIcon
} from './GameIcons';
import { GameRanking } from './GameRanking';
import { GameMode } from '../../types/famousPlaces';
import { BookOpenIcon } from 'lucide-react';
import backgroundVideo from '../../assets/images/background.webm';


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
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [firstFrameDataUrl, setFirstFrameDataUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);


  const menuOptions = useMemo(() => [
    { id: 'famous_places', label: 'LUGARES FAMOSOS', icon: LandmarkIcon, action: () => { 
      console.log('[StartScreen] Lugares famosos selecionado');
      onSelectMode?.('famous_places'); 
      onStartGame(); 
    }, isMode: true },
    { id: 'play', label: 'JOGAR', icon: PlayIcon, action: () => {
      console.log('[StartScreen] Jogar selecionado');
      onStartGame();
    } },
    { id: 'leaderboard', label: 'RANKING', icon: TrophyIcon, action: onShowLeaderboard },
    { id: 'wiki', label: 'CONHEÇA OS LUGARES', icon: BookOpenIcon, action: () => { window.location.href = '/geosantos/lugares-famosos'; } }
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

  const captureFirstFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas && video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setFirstFrameDataUrl(dataUrl);
      }
    }
  }, []);

  const handleVideoLoad = useCallback(() => {
    // Captura o primeiro frame quando o vídeo carrega
    captureFirstFrame();
    setVideoLoaded(true);
  }, [captureFirstFrame]);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
    console.warn('Erro ao carregar vídeo de background');
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadeddata', handleVideoLoad);
      video.addEventListener('error', handleVideoError);
      video.addEventListener('canplay', captureFirstFrame);
      
      return () => {
        video.removeEventListener('loadeddata', handleVideoLoad);
        video.removeEventListener('error', handleVideoError);
        video.removeEventListener('canplay', captureFirstFrame);
      };
    }
  }, [handleVideoLoad, handleVideoError, captureFirstFrame]);

  return (
    <>
      {/* Background Video with Fallback */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 0
      }}>
        {/* Hidden canvas for capturing first frame */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: '-9999px',
            left: '-9999px',
            width: '1px',
            height: '1px'
          }}
        />
        
        {/* First Frame Fallback - visible until video loads */}
        {firstFrameDataUrl && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundImage: `url(${firstFrameDataUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: videoLoaded && !videoError ? 0 : 1,
            transition: 'opacity 0.5s ease-in-out',
            zIndex: 1
          }} />
        )}
        
        {/* Video - overlays the image when loaded */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: videoLoaded && !videoError ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            zIndex: 2
          }}
        >
          <source src={backgroundVideo} type="video/webm" />
          Seu navegador não suporta vídeo em background.
        </video>
      </div>

      {/* Container principal */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 4,
        padding: '20px',
        boxSizing: 'border-box'
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
            GEOSANTOS
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
                  fontFamily: "'LaCartoonerie', sans-serif",
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
                  fontFamily: "'LaCartoonerie', sans-serif",
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
                  fontFamily: "'LaCartoonerie', sans-serif",
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
    </>
  );
}; 