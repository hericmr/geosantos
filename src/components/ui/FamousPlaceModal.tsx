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
      top: 20, // alinhado ao topo
      right: 20, // alinhado à direita
      transform: 'none', // remover centralização vertical
      height: 'auto',
      maxHeight: '84vh',
      width: 'min(380px, 92vw)',
      background: 'var(--bg-secondary)',
      border: '4px solid var(--accent-green)',
      boxShadow: '8px 8px 0px 0px #222, 0 0 0 4px #fff',
      zIndex: 10010,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 20px 22px 20px',
      borderRadius: 0,
      fontFamily: "'Press Start 2P', monospace",
      animation: 'modalSlideInRight 0.3s ease-out',
    }}>
      <style>{`
        @keyframes modalSlideInRight {
          0% { transform: translateY(-50%) translateX(100%); opacity: 0; }
          100% { transform: translateY(-50%) translateX(0); opacity: 1; }
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
          maxWidth: 360, // aumentado de 300 para 360
          borderRadius: 0,
          boxShadow: '4px 4px 0 #222',
          marginBottom: 24, // aumentado de 18 para 24
          border: '3px solid #222',
          background: '#fff'
        }}
      />
      <h2 style={{
        margin: '12px 0 4px 0',
        fontFamily: "'Press Start 2P', monospace",
        color: 'var(--accent-green)',
        fontSize: '1.25rem',
        textAlign: 'center',
        textTransform: 'uppercase',
        fontWeight: 700,
        letterSpacing: '1px',
        textShadow: '2px 2px 0 #222'
      }}>{famousPlace.name}</h2>
      <span style={{
        color: '#222',
        fontWeight: 600,
        fontSize: 14,
        marginBottom: 8,
        fontFamily: "'Press Start 2P', monospace",
        textTransform: 'uppercase',
        textShadow: '1px 1px 0 #fff'
      }}>{famousPlace.category}</span>
      {/* Removido o campo de descrição */}
    </div>
  );
};
