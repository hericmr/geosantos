import React from 'react';
import { FamousPlace } from '../../types/famousPlaces';
import { XIcon } from './GameIcons';

interface FamousPlaceModalProps {
  open: boolean;
  onClose: () => void;
  famousPlace: FamousPlace | null;
}

export const FamousPlaceModal: React.FC<FamousPlaceModalProps> = ({ open, onClose, famousPlace }) => {
  if (!open || !famousPlace) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      transform: 'none',
      height: 'auto',
      width: 'min(380px, 92vw)',
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      zIndex: 10010,
      padding: 'clamp(16px, 3vw, 24px)',
      borderRadius: '4px',
      boxShadow: 'var(--shadow-xl)',
      border: '3px solid var(--text-primary)',
      margin: '10px',
      animation: 'fadeInScale 0.3s ease-out',
      maxHeight: '90vh',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(12px, 2vw, 16px)',
      fontFamily: "'VT323', monospace"
    }}>
      <style>{`
        @keyframes fadeInScale {
          0% { 
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          100% { 
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'var(--accent-green)',
          border: '3px solid #222',
          borderRadius: 0,
          cursor: 'pointer',
          zIndex: 10011,
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Press Start 2P', monospace",
          color: 'var(--bg-primary)',
          boxShadow: '2px 2px 0 #222',
          padding: 0
        }}
        aria-label="Fechar"
      >
        <XIcon size={18} color="var(--bg-primary)" />
      </button>
      <img
        src={famousPlace.imageUrl}
        alt={famousPlace.name}
        style={{
          width: '100%',
          maxWidth: 360,
          borderRadius: '4px',
          boxShadow: 'var(--shadow-xl)',
          marginBottom: 24,
          border: '3px solid var(--text-primary)',
          background: '#fff'
        }}
      />
      <h2 style={{
        margin: '12px 0 4px 0',
        fontFamily: "'VT323', monospace",
        color: 'var(--accent-green)',
        fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)',
        textAlign: 'center',
        textTransform: 'uppercase',
        fontWeight: 400,
        letterSpacing: '1px',
        textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)'
      }}>{famousPlace.name}</h2>
      <span style={{
        color: 'var(--text-primary)',
        fontWeight: 500,
        fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
        marginBottom: 8,
        fontFamily: "'Inter', sans-serif",
        textTransform: 'uppercase',
        opacity: 0.9
      }}>{famousPlace.category}</span>
    </div>
  );
};
