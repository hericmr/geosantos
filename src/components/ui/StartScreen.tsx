import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  PlayIcon,
  TrophyIcon,
} from './GameIcons';
import { GameRanking } from './GameRanking';
import { GameMode } from '../../types/famousPlaces';
import { BookOpenIcon, PlusIcon } from 'lucide-react';
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
  onSelectMode,
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
      id: 'play',
      label: 'JOGAR',
      icon: PlayIcon,
      action: () => { onSelectMode?.('neighborhoods'); onStartGame(); },
      description: 'Teste seu conhecimento sobre os bairros de Santos!',
      color: '#34d399',
      gradient: 'linear-gradient(135deg, #34d399, #059669)'
    },
    {
      id: 'leaderboard',
      label: 'VER RANKING',
      icon: TrophyIcon,
      action: onShowLeaderboard,
      description: 'Veja as maiores pontuações e descubra sua posição no ranking dos melhores jogadores.',
      color: '#fbbf24',
      gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)'
    }
  ], [onShowLeaderboard]);

  const secondaryMenuOptions = useMemo(() => [
    {
      id: 'wiki',
      label: 'WIKI-GEOSANTOS',
      icon: BookOpenIcon,
      action: () => { window.location.href = '/geosantos/lugares-famosos'; },
      description: 'Explore informações e curiosidades sobre os lugares do jogo.',
      as: Link,
      to: '/lugares-famosos'
    },
    {
      id: 'suggest_place',
      label: 'SUGERIR NOVO LOCAL',
      icon: PlusIcon,
      action: () => {
        setShowSuggestionForm(true);
      },
      description: 'Sugira novos lugares para serem adicionados ao jogo.',
      as: 'button'
    },
    {
      id: 'controls',
      label: 'CONTROLES',
      icon: () => <span style={{ fontSize: '14px' }}>🎮</span>,
      action: () => {},
      description: 'Veja os controles do mapa.',
      as: 'button',
      onMouseEnter: () => setShowControls(true),
      onMouseLeave: () => setShowControls(false)
    }
  ], []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const totalOptions = mainMenuOptions.length + secondaryMenuOptions.length;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedOption(prev => prev > 0 ? prev - 1 : totalOptions - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedOption(prev => prev < totalOptions - 1 ? prev + 1 : 0);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
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
        setFirstFrameDataUrl(canvas.toDataURL('image/jpeg', 0.8));
      }
    }
  }, []);

  const handleVideoLoad = useCallback(() => {
    captureFirstFrame();
    setVideoLoaded(true);
  }, [captureFirstFrame]);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
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

  const selectedItem = selectedOption < mainMenuOptions.length
    ? mainMenuOptions[selectedOption]
    : secondaryMenuOptions[selectedOption - mainMenuOptions.length];

  return (
    <>
      {/* Background Video */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: 1, height: 1 }} />

        {firstFrameDataUrl && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${firstFrameDataUrl})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: videoLoaded && !videoError ? 0 : 1,
            transition: 'opacity 0.5s ease',
            zIndex: 1
          }} />
        )}

        <video
          ref={videoRef}
          autoPlay loop muted playsInline
          style={{
            width: '100vw', height: '100vh', objectFit: 'cover',
            position: 'absolute', inset: 0,
            opacity: videoLoaded && !videoError ? 1 : 0,
            transition: 'opacity 0.5s ease', zIndex: 2
          }}
        >
          <source src={backgroundVideo} type="video/webm" />
        </video>

        {/* Dark overlay gradient */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3,
          background: 'linear-gradient(to bottom, rgba(13,15,26,0.6) 0%, rgba(13,15,26,0.75) 100%)'
        }} />
      </div>

      {/* Main content */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 4,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '20px', boxSizing: 'border-box',
        gap: '24px'
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '4px' }}>
          <h1 style={{
            fontSize: 'clamp(5rem, 22vw, 10rem)',
            fontFamily: "'LaCartoonerie', sans-serif",
            margin: 0,
            animation: 'titleFloat 5s ease-in-out infinite',
            lineHeight: 1.1,
            letterSpacing: '-2px'
          }}>
            <span style={{
              color: '#34d399',
              filter: 'drop-shadow(0 0 20px rgba(52,211,153,0.5))'
            }}>Geo</span>
            <span style={{
              color: '#4fc3d4',
              filter: 'drop-shadow(0 0 20px rgba(79,195,212,0.5))'
            }}>Santos</span>
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 'clamp(0.75rem, 1.8vw, 0.95rem)',
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginTop: '4px'
          }}>
            Quão bem você conhece Santos?
          </p>
        </div>

        {/* Stats row */}
        {(highScore > 0 || totalGames > 0) && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {highScore > 0 && (
              <div style={statCardStyle('#34d399')}>
                <div style={statLabelStyle}>Melhor</div>
                <div style={{ ...statValueStyle, color: '#34d399' }}>{highScore.toLocaleString()}</div>
              </div>
            )}
            {totalGames > 0 && (
              <div style={statCardStyle('#4fc3d4')}>
                <div style={statLabelStyle}>Jogos</div>
                <div style={{ ...statValueStyle, color: '#4fc3d4' }}>{totalGames}</div>
              </div>
            )}
            {averageScore > 0 && (
              <div style={statCardStyle('#fbbf24')}>
                <div style={statLabelStyle}>Média</div>
                <div style={{ ...statValueStyle, color: '#fbbf24' }}>{Math.round(averageScore)}</div>
              </div>
            )}
          </div>
        )}

        {/* Main menu */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '10px',
          width: '100%', maxWidth: '340px'
        }}>
          {mainMenuOptions.map((option, index) => {
            const IconComponent = option.icon;
            const isSelected = index === selectedOption;

            return (
              <button
                key={option.id}
                onClick={option.action}
                onMouseEnter={() => setSelectedOption(index)}
                onMouseLeave={() => setSelectedOption(0)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 20px',
                  background: isSelected
                    ? option.gradient
                    : 'rgba(255,255,255,0.07)',
                  border: `1px solid ${isSelected ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '12px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                  letterSpacing: '0.3px',
                  boxShadow: isSelected
                    ? `0 8px 24px ${option.color}40`
                    : '0 2px 8px rgba(0,0,0,0.2)',
                  transform: isSelected ? 'translateY(-1px)' : 'none',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  textAlign: 'left',
                  width: '100%',
                  outline: 'none'
                }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: isSelected ? 'rgba(255,255,255,0.2)' : `${option.color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <IconComponent size={18} color={isSelected ? '#fff' : option.color} />
                </div>
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Secondary menu */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {secondaryMenuOptions.map((option, index) => {
            const IconComponent = option.icon;
            const Component = option.as || 'button';
            const isSelected = selectedOption === (mainMenuOptions.length + index);

            const style: React.CSSProperties = {
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px',
              background: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px',
              color: isSelected ? '#fff' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.8rem',
              fontWeight: 500,
              textDecoration: 'none',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              outline: 'none'
            };

            const children = (
              <>
                <IconComponent size={14} />
                {option.label}
              </>
            );

            if (Component === Link) {
              return (
                <Link key={option.id} style={style} to={option.to!}
                  onMouseEnter={() => setSelectedOption(mainMenuOptions.length + index)}
                  onMouseLeave={() => setSelectedOption(0)}
                >
                  {children}
                </Link>
              );
            }

            return (
              <button
                key={option.id}
                style={style}
                onClick={option.action}
                onMouseEnter={() => {
                  setSelectedOption(mainMenuOptions.length + index);
                  option.onMouseEnter?.();
                }}
                onMouseLeave={() => {
                  setSelectedOption(0);
                  option.onMouseLeave?.();
                }}
              >
                {children}
              </button>
            );
          })}
        </div>

        {/* Credits */}
        <p style={{
          color: 'rgba(255,255,255,0.3)',
          fontSize: '0.75rem',
          fontFamily: "'Inter', sans-serif",
          marginTop: '-8px'
        }}>
          Desenvolvido por{' '}
          <a
            href="https://hericmr.github.io/me/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#4fc3d4'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          >
            hericmr
          </a>
        </p>

        {/* Bottom corners */}
        <div style={{
          position: 'absolute', bottom: '20px', left: '20px', right: '20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          pointerEvents: 'none'
        }}>
          {/* Ranking */}
          <div style={{ pointerEvents: 'auto' }}>
            {showRanking && (
              <GameRanking variant="startScreen" onClose={() => setShowRanking(false)} />
            )}
          </div>

          {/* Description card */}
          <div style={{
            pointerEvents: 'auto',
            width: '280px',
            padding: '16px 20px',
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            opacity: selectedOption >= 0 ? 1 : 0,
            transform: selectedOption >= 0 ? 'translateY(0)' : 'translateY(12px)',
          }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '0.8rem',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              color: selectedItem && 'color' in selectedItem ? (selectedItem as any).color : '#4fc3d4',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {selectedItem?.label}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.82rem',
              fontFamily: "'Inter', sans-serif",
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.5
            }}>
              {selectedItem?.description}
            </p>
          </div>
        </div>

        {/* Controls tooltip */}
        {showControls && (
          <div style={{
            position: 'fixed', bottom: '80px', right: '20px',
            padding: '16px 20px',
            background: 'rgba(13,15,26,0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.2s ease',
            zIndex: 1000, minWidth: '260px'
          }}>
            <h4 style={{
              fontSize: '0.75rem', fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              color: '#34d399', textTransform: 'uppercase',
              letterSpacing: '1px', margin: '0 0 12px 0', textAlign: 'center'
            }}>
              Controles do Mapa
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
              {[
                ['Z', 'Zoom In'], ['X', 'Zoom Out'],
                ['↑', 'Mover ↑'], ['↓', 'Mover ↓'],
                ['←', 'Mover ←'], ['→', 'Mover →']
              ].map(([key, label]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    background: 'rgba(255,255,255,0.1)', borderRadius: '6px',
                    padding: '2px 8px', fontFamily: 'monospace', fontWeight: 700,
                    color: '#4fc3d4', fontSize: '0.85rem'
                  }}>{key}</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showSuggestionForm && (
        <PlaceSuggestionForm onClose={() => setShowSuggestionForm(false)} />
      )}

      <style>{`
        @keyframes titleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

const statCardStyle = (color: string): React.CSSProperties => ({
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: `1px solid ${color}33`,
  borderRadius: '12px',
  padding: '10px 18px',
  textAlign: 'center',
  minWidth: '80px'
});

const statLabelStyle: React.CSSProperties = {
  fontSize: '0.65rem',
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  color: 'rgba(255,255,255,0.45)',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: '4px'
};

const statValueStyle: React.CSSProperties = {
  fontSize: '1.4rem',
  fontFamily: "'Inter', sans-serif",
  fontWeight: 800,
  lineHeight: 1
};
