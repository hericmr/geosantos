import React, { useState, useEffect } from 'react';
import { FamousPlace } from '../../types/famousPlaces';
import { HelpCircleIcon } from './GameIcons';

interface FamousPlaceModalProps {
  open: boolean;
  onClose: () => void;
  famousPlace: FamousPlace | null;
  isCentered?: boolean;
  onTransitionComplete?: () => void;
  timeProgress?: number;
}

export const FamousPlaceModal: React.FC<FamousPlaceModalProps> = ({ 
  open, 
  onClose, 
  famousPlace,
  isCentered = true,
  onTransitionComplete,
  timeProgress = 0
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
        </div>

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