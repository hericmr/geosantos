import React, { useState, useEffect } from 'react';
import { FamousPlace } from '../../types/famousPlaces';
import { HelpCircleIcon } from './GameIcons';
import { ActionButtons } from './ActionButtons';

interface FamousPlaceModalProps {
  open: boolean;
  onClose: () => void;
  famousPlace: FamousPlace | null;
  isCentered?: boolean;
  onTransitionComplete?: () => void;
  timeProgress?: number;
  // Novas props para controle do jogo
  onPauseGame?: () => void;
  onResumeGame?: () => void;
  onNextRound?: () => void;
  isPaused?: boolean;
  gameOver?: boolean;
  feedbackProgress?: number;
  geoJsonData?: any;
}

export const FamousPlaceModal: React.FC<FamousPlaceModalProps> = ({ 
  open, 
  onClose, 
  famousPlace,
  isCentered = true,
  onTransitionComplete,
  timeProgress = 0,
  onPauseGame,
  onResumeGame,
  onNextRound,
  isPaused = false,
  gameOver = false,
  feedbackProgress = 0,
  geoJsonData
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setImageLoaded(false);
      setImageError(false);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!isVisible || !famousPlace) return null;

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Estilos simplificados baseados no pixel art
  const modalStyles = isCentered ? {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: open ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.95)',
    width: 'min(400px, 90vw)',
    maxHeight: '85vh',
    zIndex: 10010,
  } : {
    position: 'fixed' as const,
    top: '20px',
    right: '20px',
    transform: 'none',
    width: 'min(320px, 85vw)',
    maxHeight: '75vh',
    zIndex: 10010,
  };

  return (
    <>
      {/* Backdrop simples */}
      {isCentered && (
        <div 
          onClick={handleBackdropClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 10009,
            animation: open ? 'fadeIn 0.3s ease-out' : 'fadeOut 0.3s ease-out'
          }}
        />
      )}
      
      {/* Modal simplificado */}
      <div style={{
        ...modalStyles,
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        border: 'none',
        borderRadius: '4px',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        animation: open ? 'modalSlideIn 0.3s ease-out' : 'modalSlideOut 0.3s ease-out',
        transition: 'all 0.3s ease-out',
        margin: isCentered ? '0' : '10px'
      }}>
        
        {/* Header simples */}
        <div style={{
          position: 'relative',
          padding: isCentered ? '12px 16px' : '8px 12px',
          background: 'var(--accent-green)',
          borderBottom: '2px solid var(--text-primary)',
          overflow: 'hidden'
        }}>
          {/* Barra de tempo simples */}
          {isCentered && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${timeProgress}%`,
              height: '100%',
              background: 'rgba(255, 255, 255, 0.3)',
              transition: 'width 0.1s linear',
              zIndex: 1
            }} />
          )}
          
          <h2 style={{
            margin: 0,
            fontFamily: "'LaCartoonerie', sans-serif",
            color: '#000000',
            fontSize: isCentered ? 'clamp(2.1rem, 2.8vw, 1.4rem)' : 'clamp(0.9rem, 2.4vw, 1.1rem)',
            textAlign: 'center',
            textTransform: 'none',
            fontWeight: 800,
            letterSpacing: '1px',
            textShadow: 'none',
            lineHeight: 1.2,
            position: 'relative',
            zIndex: 2
          }}>
            {famousPlace.name}
          </h2>
        </div>

        {/* Conteúdo simplificado */}
        <div style={{
          padding: isCentered ? '16px' : '8px',
          maxHeight: isCentered ? 'calc(85vh - 80px)' : 'calc(75vh - 60px)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: isCentered ? '12px' : '8px'
        }}>
          
          {/* Imagem simplificada */}
          <div style={{
            position: 'relative',
            border: 'none',
            borderRadius: '2px',
            overflow: 'hidden',
            background: '#f0f0f0',
            minHeight: isCentered ? '120px' : '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {!imageLoaded && !imageError && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f0f0f0',
                color: '#666',
                fontSize: '14px',
                fontFamily: "'VT323', monospace"
              }}>
                Carregando...
              </div>
            )}
            
            {imageError ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '8px',
                color: '#666',
                fontSize: '14px',
                fontFamily: "'VT323', monospace"
              }}>
                <HelpCircleIcon size={24} color="#666" />
                Sem imagem
              </div>
            ) : (
              <img
                src={famousPlace.imageUrl}
                alt={famousPlace.name}
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{
                  width: '100%',
                  height: '100%',
                  display: imageLoaded ? 'block' : 'none',
                  transition: 'opacity 0.3s ease'
                }}
              />
            )}
          </div>

          {/* Categoria simplificada */}
          {isCentered && (
            <div style={{
              padding: '8px 12px',
              background: 'var(--bg-primary)',
              border: 'none',
              borderRadius: '2px',
              textAlign: 'center'
            }}>
              <span style={{
                color: 'var(--accent-green)',
                fontWeight: 600,
                fontSize: 'clamp(0.7rem, 1.8vw, 0.9rem)',
                fontFamily: "'LaCartoonerie', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                textShadow: '1px 1px 0px #000'
              }}>
                {famousPlace.category}
              </span>
            </div>
          )}

          {/* Descrição do lugar famoso */}
          {isCentered && famousPlace.description && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.85)',
              borderRadius: '12px',
              padding: '16px',
              margin: '12px 0 0 0',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              animation: '0.5s ease-out fadeInUp'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 18v-7"></path>
                  <path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z"></path>
                  <path d="M14 18v-7"></path>
                  <path d="M18 18v-7"></path>
                  <path d="M3 22h18"></path>
                  <path d="M6 18v-7"></path>
                </svg>
                <div style={{
                  fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                  color: '#FFD700',
                  fontFamily: "'LaCartoonerie', sans-serif",
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {famousPlace.name.toUpperCase()}
                </div>
              </div>
              <div style={{
                fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
                color: '#ffffff',
                fontFamily: "'LaCartoonerie', sans-serif",
                lineHeight: 1.4,
                marginBottom: '12px',
                textAlign: 'left'
              }}>
                {famousPlace.description}
              </div>
            </div>
          )}
        </div>

        {/* Botões de ação - apenas quando centralizado */}
        {isCentered && onPauseGame && onNextRound && (
          <div style={{
            padding: '16px',
            borderTop: '2px solid var(--text-primary)',
            background: 'var(--bg-primary)'
          }}>
            <ActionButtons
              gameOver={gameOver}
              onPauseGame={onPauseGame}
              onResumeGame={onResumeGame}
              onNextRound={() => {
                if (onNextRound) {
                  onNextRound();
                }
              }}
              feedbackProgress={feedbackProgress}
              currentMode="famous_places"
              isPaused={isPaused}
            />
          </div>
        )}

        {/* Estilos CSS simplificados */}
        <style>{`
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          
          @keyframes fadeOut {
            0% { opacity: 1; }
            100% { opacity: 0; }
          }
          
          @keyframes modalSlideIn {
            0% { 
              opacity: 0;
              transform: ${isCentered ? 'translate(-50%, -50%) scale(0.9)' : 'translateX(100%)'};
            }
            100% { 
              opacity: 1;
              transform: ${isCentered ? 'translate(-50%, -50%) scale(1)' : 'translateX(0)'};
            }
          }
          
          @keyframes modalSlideOut {
            0% { 
              opacity: 1;
              transform: ${isCentered ? 'translate(-50%, -50%) scale(1)' : 'translateX(0)'};
            }
            100% { 
              opacity: 0;
              transform: ${isCentered ? 'translate(-50%, -50%) scale(0.9)' : 'translateX(100%)'};
            }
          }

          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          /* Scrollbar simplificada */
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: var(--bg-primary);
          }
          
          ::-webkit-scrollbar-thumb {
            background: var(--accent-green);
            border: 'none';
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #2d5a2d;
          }
        `}</style>
      </div>
    </>
  );
};