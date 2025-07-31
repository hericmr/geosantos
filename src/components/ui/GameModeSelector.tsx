import React from 'react';
import { GameMode } from '../../types/famousPlaces';
import { MapIcon, LandmarkIcon } from './GameIcons';

interface GameModeSelectorProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  isVisible: boolean;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  currentMode,
  onModeChange,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      marginBottom: '30px',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <h3 style={{
        fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
        margin: '0 0 12px 0',
        fontFamily: "'Press Start 2P', monospace",
        color: 'var(--accent-yellow)',
        textAlign: 'center',
        textTransform: 'uppercase',
        textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)'
      }}>
        ESCOLHA O MODO
      </h3>
      
      <div style={{
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => onModeChange('neighborhoods')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            padding: '20px 24px',
            background: currentMode === 'neighborhoods' ? 'var(--accent-blue)' : 'var(--bg-secondary)',
            border: '3px solid var(--text-primary)',
            borderRadius: '8px',
            color: currentMode === 'neighborhoods' ? 'var(--bg-primary)' : 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 'clamp(0.8rem, 2vw, 1rem)',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: currentMode === 'neighborhoods' ? 'var(--shadow-lg)' : 'var(--shadow-md)',
            transform: currentMode === 'neighborhoods' ? 'translate(-2px, -2px)' : 'translate(0, 0)',
            minWidth: '160px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <MapIcon 
            size={32} 
            color={currentMode === 'neighborhoods' ? 'var(--bg-primary)' : 'var(--text-primary)'} 
          />
          <span>Bairros</span>
          <div style={{
            fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)',
            fontFamily: "'VT323', monospace",
            textAlign: 'center',
            opacity: 0.8
          }}>
            Teste seu conhecimento<br/>dos bairros de Santos
          </div>
        </button>

        <button
          onClick={() => onModeChange('famous_places')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            padding: '20px 24px',
            background: currentMode === 'famous_places' ? 'var(--accent-blue)' : 'var(--bg-secondary)',
            border: '3px solid var(--text-primary)',
            borderRadius: '8px',
            color: currentMode === 'famous_places' ? 'var(--bg-primary)' : 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 'clamp(0.8rem, 2vw, 1rem)',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: currentMode === 'famous_places' ? 'var(--shadow-lg)' : 'var(--shadow-md)',
            transform: currentMode === 'famous_places' ? 'translate(-2px, -2px)' : 'translate(0, 0)',
            minWidth: '160px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <LandmarkIcon 
            size={32} 
            color={currentMode === 'famous_places' ? 'var(--bg-primary)' : 'var(--text-primary)'} 
          />
          <span>Lugares Famosos</span>
          <div style={{
            fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)',
            fontFamily: "'VT323', monospace",
            textAlign: 'center',
            opacity: 0.8
          }}>
            Descubra pontos icônicos<br/>e monumentos de Santos
          </div>
        </button>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}; 