import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlayIcon, 
  TrophyIcon, 
  LandmarkIcon
} from './GameIcons';
import { GameRanking } from './GameRanking';
import { GameMode } from '../../types/famousPlaces';
import { BookOpenIcon, PlusIcon, MapPin } from 'lucide-react';
import { PlaceSuggestionForm } from './PlaceSuggestionForm';
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
  const [showRanking, setShowRanking] = useState(true);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);


  const mainMenuOptions = useMemo(() => [
    { 
      id: 'play_neighborhoods', 
      label: 'BAIRROS', 
      icon: MapPin, 
      action: () => {
        console.log('[StartScreen] Modo Bairros selecionado');
        console.log('[StartScreen] Chamando onSelectMode com neighborhoods');
        onSelectMode?.('neighborhoods');
        console.log('[StartScreen] Chamando onStartGame');
        onStartGame();
      },
      description: 'Clique no mapa onde você acha que está o bairro. Quanto mais próximo da localização correta, mais pontos você ganha!'
    },
    { 
      id: 'play_famous_places', 
      label: 'LUGARES FAMOSOS', 
      icon: LandmarkIcon, 
      action: () => { 
        console.log('[StartScreen] Modo Lugares Famosos selecionado');
        console.log('[StartScreen] Chamando onSelectMode com famous_places');
        onSelectMode?.('famous_places'); 
        console.log('[StartScreen] Chamando onStartGame');
        onStartGame(); 
      },
      description: 'Localize pontos turísticos e lugares históricos de Santos. Teste seus conhecimentos sobre a cidade!'
    },
    { 
      id: 'leaderboard', 
      label: 'VER RANKING', 
      icon: TrophyIcon, 
      action: onShowLeaderboard,
      description: 'Veja as maiores pontuações e descubra sua posição no ranking dos melhores jogadores.'
    }
  ], [onStartGame, onShowLeaderboard, onSelectMode]);

  const secondaryMenuOptions = useMemo(() => [
    { 
      id: 'wiki', 
      label: 'WIKI-GEOSANTOS', 
      icon: BookOpenIcon, 
      action: () => { window.location.href = '/geosantos/lugares-famosos'; },
      description: 'Explore informações e curiosidades sobre os lugares do jogo.',
      as: Link, // Renderiza como um componente Link
      to: '/lugares-famosos' // O destino do Link
    },
    { 
      id: 'suggest_place', 
      label: 'SUGERIR NOVO LOCAL', 
      icon: PlusIcon, 
      action: () => { 
        setShowSuggestionForm(true);
      },
      description: 'Sugira novos lugares para serem adicionados ao jogo.',
      as: 'button' // Renderiza como um botão normal
    },
    { 
      id: 'controls', 
      label: 'CONTROLES', 
      icon: () => <span style={{ fontSize: '16px' }}>🎮</span>, 
      action: () => {}, // Ação vazia, só para hover
      description: 'Veja os controles do mapa.',
      as: 'button', // Renderiza como um botão normal
      onMouseEnter: () => setShowControls(true),
      onMouseLeave: () => setShowControls(false)
    }
  ], []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const totalOptions = mainMenuOptions.length + secondaryMenuOptions.length;
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedOption(prev => {
        let newOption = prev > 0 ? prev - 1 : totalOptions - 1;
        return newOption;
      });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedOption(prev => {
        let newOption = prev < totalOptions - 1 ? prev + 1 : 0;
        return newOption;
      });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Determinar se é um botão principal ou secundário
      if (selectedOption < mainMenuOptions.length) {
        mainMenuOptions[selectedOption].action?.();
      } else {
        const secondaryIndex = selectedOption - mainMenuOptions.length;
        secondaryMenuOptions[secondaryIndex].action?.();
      }
    }
  }, [mainMenuOptions, secondaryMenuOptions, selectedOption]);

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

      {/* Container principal que engloba tudo */}
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

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <h1 style={{
            fontSize: 'clamp(6.5rem, 26vw, 12rem)',
            fontFamily: "'LaCartoonerie', sans-serif",
            margin: '0',
            animation: 'titleFloat 5s ease-in-out infinite',
            filter: 'drop-shadow(3px 3px 0px #fff) drop-shadow(-3px -3px 0px #fff) drop-shadow(3px -3px 0px #fff) drop-shadow(-3px 3px 0px #fff)',
            fontWeight: 'bold',
            lineHeight: 1.2
          }}>
            <span style={{ color: '#22c55e' }}>Geo</span>
            <span style={{ color: '#3b82f6' }}>Santos</span>
          </h1>
        </div>

        {/* Estatísticas do jogador */}
        {(highScore > 0 || totalGames > 0) && (
          <div style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '-50px'
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
          minWidth: '300px',
          alignItems: 'center',
          marginTop: '-20px'
        }}>
          {mainMenuOptions.map((option, index) => {
            const IconComponent = option.icon;
            const isSelected = index === selectedOption;

            const buttonStyle = {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              padding: '16px 24px',
              background: isSelected ? 'var(--accent-blue)' : 'var(--bg-secondary)',
              border: 'none',
              borderRadius: '4px',
              color: isSelected ? 'var(--bg-primary)' : 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: "'LaCartoonerie', sans-serif",
              fontWeight: 400,
              textTransform: 'uppercase' as const,
              letterSpacing: '1px',
              boxShadow: isSelected ? 'var(--shadow-lg)' : 'var(--shadow-md)',
              transform: isSelected ? 'translate(-2px, -2px)' : 'translate(0, 0)',
              position: 'relative' as const,
              overflow: 'hidden',
              opacity: 1,
              textDecoration: 'none',
              width: '100%'
            };

            return (
              <button
                key={option.id}
                style={buttonStyle}
                onClick={option.action}
                onMouseEnter={() => setSelectedOption(index)}
                onMouseLeave={() => setSelectedOption(0)}
              >
                <IconComponent 
                  size={24} 
                  color={isSelected ? 'var(--bg-primary)' : 'var(--text-primary)'} 
                />
                <div style={{ 
                  fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
                  fontWeight: 'bold',
                  lineHeight: 1.2
                }}>
                  {option.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Menu secundário - botões menores */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '20px',
          justifyContent: 'center'
        }}>
          {secondaryMenuOptions.map((option, index) => {
            const IconComponent = option.icon;
            const Component = option.as || 'button';
            const isSelected = selectedOption === (mainMenuOptions.length + index);

            const smallButtonStyle = {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: isSelected ? 'var(--accent-blue)' : 'var(--bg-accent)',
              border: 'none',
              borderRadius: '4px',
              color: isSelected ? 'var(--bg-primary)' : 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: "'LaCartoonerie', sans-serif",
              fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
              fontWeight: 400,
              textTransform: 'uppercase' as const,
              letterSpacing: '1px',
              boxShadow: isSelected ? 'var(--shadow-lg)' : 'var(--shadow-md)',
              textDecoration: 'none',
              transform: isSelected ? 'translateY(-2px)' : 'translateY(0)'
            };

            const children = (
              <>
                <IconComponent size={16} color="var(--text-primary)" />
                {option.label}
              </>
            );

            if (Component === Link) {
              return (
                <Link
                  key={option.id}
                  style={smallButtonStyle}
                  to={option.to!}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--accent-blue)';
                    e.currentTarget.style.color = 'var(--bg-primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-accent)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {children}
                </Link>
              );
            }

            return (
              <button
                key={option.id}
                style={smallButtonStyle}
                onClick={option.action}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent-blue)';
                  e.currentTarget.style.color = 'var(--bg-primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  setSelectedOption(mainMenuOptions.length + index);
                  option.onMouseEnter?.();
                }}
                onMouseLeave={(e) => {
                  if (selectedOption !== (mainMenuOptions.length + index)) {
                    e.currentTarget.style.background = 'var(--bg-accent)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                  option.onMouseLeave?.();
                }}
              >
                {children}
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
            
            {/* Controles do mapa (aparece no hover) */}
            {showControls && (
              <div style={{
                position: 'fixed',
                bottom: '80px',
                right: '20px',
                padding: '15px',
                background: 'var(--bg-secondary)',
                borderRadius: '4px',
                border: '2px solid var(--accent-green)',
                boxShadow: 'var(--shadow-xl)',
                animation: 'fadeIn 0.3s ease-in',
                zIndex: 1000,
                minWidth: '280px'
              }}>
                <h4 style={{
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                  margin: '0 0 10px 0',
                  fontFamily: "'LaCartoonerie', sans-serif",
                  color: 'var(--accent-green)',
                  textTransform: 'uppercase',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  🎮 CONTROLES DO MAPA
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '6px',
                  fontSize: 'clamp(0.75rem, 1.6vw, 0.85rem)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ 
                      color: 'var(--accent-green)', 
                      fontWeight: 'bold',
                      fontSize: '1.1em'
                    }}>Z</span>
                    <span>Zoom In</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ 
                      color: 'var(--accent-green)', 
                      fontWeight: 'bold',
                      fontSize: '1.1em'
                    }}>X</span>
                    <span>Zoom Out</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ 
                      color: 'var(--accent-blue)', 
                      fontWeight: 'bold',
                      fontSize: '1.1em'
                    }}>↑</span>
                    <span>Mover ↑</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ 
                      color: 'var(--accent-blue)', 
                      fontWeight: 'bold',
                      fontSize: '1.1em'
                    }}>↓</span>
                    <span>Mover ↓</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ 
                      color: 'var(--accent-blue)', 
                      fontWeight: 'bold',
                      fontSize: '1.1em'
                    }}>←</span>
                    <span>Mover ←</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ 
                      color: 'var(--accent-blue)', 
                      fontWeight: 'bold',
                      fontSize: '1.1em'
                    }}>→</span>
                    <span>Mover →</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

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
              onMouseEnter={(e) => { e.currentTarget.style.color = '#0066CC'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#000000'; }}
            >
              hericmr
            </a>
          </p>
        </div>

        {/* Container para elementos nos cantos inferiores */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          width: 'calc(100% - 40px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          pointerEvents: 'none'
        }}>
          {/* Ranking no canto esquerdo */}
          <div style={{ pointerEvents: 'auto' }}>
            {showRanking && (
              <GameRanking 
                variant="startScreen" 
                onClose={() => setShowRanking(false)}
              />
            )}
          </div>

          {/* Caixa de Descrição no canto direito */}
          <div style={{
            pointerEvents: 'auto',
            width: '320px',
            padding: '20px',
            background: 'var(--bg-secondary)',
            border: 'none',
            borderRadius: '4px',
            boxShadow: 'var(--shadow-md)',
            fontFamily: "'LaCartoonerie', sans-serif",
            color: 'var(--text-primary)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            opacity: selectedOption >= 0 ? 1 : 0,
            transform: selectedOption >= 0 ? 'translateY(0)' : 'translateY(20px)',
            visibility: selectedOption >= 0 ? 'visible' : 'hidden'
          }}>
            <h3 style={{
              margin: '0 0 10px 0',
              fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
              color: 'var(--accent-yellow)',
              textTransform: 'uppercase'
            }}>
              {selectedOption < mainMenuOptions.length 
                ? mainMenuOptions[selectedOption].label 
                : secondaryMenuOptions[selectedOption - mainMenuOptions.length].label}
            </h3>
            <p style={{
              margin: 0,
              fontSize: 'clamp(1rem, 2vw, 1.1rem)',
              lineHeight: 1.4
            }}>
              {selectedOption < mainMenuOptions.length 
                ? mainMenuOptions[selectedOption].description 
                : secondaryMenuOptions[selectedOption - mainMenuOptions.length].description}
            </p>
          </div>
        </div>
      </div>

      {/* Formulário de Sugestão */}
      {showSuggestionForm && (
        <PlaceSuggestionForm onClose={() => setShowSuggestionForm(false)} />
      )}

      <style>
        {`
          @keyframes titleFloat {
            0%, 100% {
              transform: translateY(0) rotate(-1deg);
            }
            50% {
              transform: translateY(-8px) rotate(1deg);
            }
          }
          
          @keyframes titleGlow {
            0%, 100% {
              filter: drop-shadow(0 0 5px var(--accent-yellow));
            }
            50% {
              filter: drop-shadow(0 0 15px var(--accent-yellow)) drop-shadow(0 0 25px var(--accent-yellow));
            }
          }
        `}
      </style>
    </>
  );
}; 