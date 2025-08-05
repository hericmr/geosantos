import React, { useState, useEffect } from 'react';
import { FamousPlace } from '../../types/famousPlaces';
import { XIcon, MapPinIcon, ClockIcon, HelpCircleIcon } from './GameIcons';

interface FamousPlaceModalProps {
  open: boolean;
  onClose: () => void;
  famousPlace: FamousPlace | null;
  isCentered?: boolean; // Novo: controla se está centralizado ou no canto
  onTransitionComplete?: () => void; // Novo: callback quando transição termina
  timeProgress?: number; // Novo: progresso da barra de tempo (0-100)
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

  // Controla animação de entrada/saída
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

  // Estilos baseados no estado (centralizado ou no canto)
  const modalStyles = isCentered ? {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: open ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.95)',
    width: 'min(480px, 95vw)',
    maxHeight: '90vh',
    zIndex: 10010,
  } : {
    position: 'fixed' as const,
    top: '20px',
    right: '20px',
    transform: 'none',
    width: 'min(380px, 92vw)',
    maxHeight: '80vh',
    zIndex: 10010,
  };

  return (
    <>
      {/* Backdrop com blur - só aparece quando centralizado */}
      {isCentered && (
        <div 
          onClick={handleBackdropClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 10009,
            animation: open ? 'fadeIn 0.3s ease-out' : 'fadeOut 0.3s ease-out'
          }}
        />
      )}
      
      {/* Modal */}
      <div style={{
        ...modalStyles,
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        borderRadius: isCentered ? '12px' : '8px',
        boxShadow: isCentered ? '0 20px 60px rgba(0, 0, 0, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: 'none',
        overflow: 'hidden',
        animation: open ? 'modalSlideIn 0.3s ease-out' : 'modalSlideOut 0.3s ease-out',
        transition: 'all 0.3s ease-out',
        margin: isCentered ? '0' : '10px'
      }}>
        
        {/* Header com barra de tempo e botão de fechar */}
        <div style={{
          position: 'relative',
          padding: isCentered ? '16px 20px 12px' : '12px 16px 8px',
          background: 'var(--accent-green)',
          borderBottom: '2px solid var(--text-primary)',
          overflow: 'hidden'
        }}>
          {/* Barra de tempo no fundo */}
          {isCentered && (
            <>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${timeProgress}%`,
                height: '100%',
                background: 'rgba(255, 255, 255, 0.2)',
                transition: 'width 0.1s linear',
                zIndex: 1
              }} />
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${100 - timeProgress}%`,
                height: '100%',
                background: 'rgba(255, 0, 0, 0.3)',
                transition: 'width 0.1s linear',
                zIndex: 1,
                transform: 'translateX(0)',
                transformOrigin: 'left'
              }} />
            </>
          )}
          

          
          <h2 style={{
            margin: 0,
            fontFamily: "'LaCartoonerie', sans-serif",
            color: '#ffffff',
            fontSize: isCentered ? 'clamp(1.3rem, 3.2vw, 1.6rem)' : 'clamp(1.1rem, 2.8vw, 1.3rem)',
            textAlign: 'center',
            textTransform: 'uppercase',
            fontWeight: 800,
            letterSpacing: '2px',
            textShadow: 'none',
            lineHeight: 1.2,
            position: 'relative',
            zIndex: 2
          }}>
            {famousPlace.name}
          </h2>
        </div>

        {/* Conteúdo do modal */}
        <div style={{
          padding: isCentered ? '20px' : '12px',
          maxHeight: isCentered ? 'calc(90vh - 80px)' : 'calc(80vh - 60px)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: isCentered ? '16px' : '12px'
        }}>
          
          {/* Imagem com loading state */}
          <div style={{
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            border: 'none',
            background: '#f0f0f0',
            minHeight: isCentered ? '200px' : '150px',
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
                Carregando imagem...
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
                <HelpCircleIcon size={32} color="#666" />
                Imagem não disponível
              </div>
            ) : (
              <img
                src={famousPlace.imageUrl}
                alt={famousPlace.name}
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: imageLoaded ? 'block' : 'none',
                  transition: 'opacity 0.3s ease'
                }}
              />
            )}
          </div>

          {/* Informações do lugar - só mostra categoria quando centralizado */}
          {isCentered && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              
              {/* Categoria */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'rgba(255, 215, 0, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}>
                <span style={{
                  color: '#FFD700',
                  fontWeight: 600,
                  fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                  fontFamily: "'LaCartoonerie', sans-serif",
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {famousPlace.category}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Estilos CSS */}
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
          
          /* Scrollbar personalizada */
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: var(--accent-green);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #2d5a2d;
          }
        `}</style>
      </div>
    </>
  );
};
