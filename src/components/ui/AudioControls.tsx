import React from 'react';
import { AudioControlsProps } from '../../types/game';

export const AudioControls: React.FC<AudioControlsProps> = ({
  isMuted,
  volume,
  onVolumeChange,
  onToggleMute
}) => {
  return (
    <div style={{
      position: 'absolute',
      top: 'clamp(10px, 2vw, 20px)',
      left: 'clamp(10px, 2vw, 20px)',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: 'clamp(8px, 1.5vw, 12px)',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(5px, 1vw, 10px)',
      zIndex: 1000,
      touchAction: 'manipulation'
    }}>
      <button
        onClick={onToggleMute}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: 'clamp(3px, 1vw, 5px)',
          display: 'flex',
          alignItems: 'center',
          touchAction: 'manipulation'
        }}
      >
        {isMuted ? (
          <span style={{ fontSize: 'clamp(20px, 4vw, 24px)' }}>🔇</span>
        ) : volume > 0.5 ? (
          <span style={{ fontSize: 'clamp(20px, 4vw, 24px)' }}>🔊</span>
        ) : volume > 0 ? (
          <span style={{ fontSize: 'clamp(20px, 4vw, 24px)' }}>🔉</span>
        ) : (
          <span style={{ fontSize: 'clamp(20px, 4vw, 24px)' }}>🔈</span>
        )}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={isMuted ? 0 : volume}
        onChange={onVolumeChange}
        style={{
          width: 'clamp(60px, 15vw, 100px)',
          accentColor: '#32CD32',
          touchAction: 'manipulation'
        }}
      />
    </div>
  );
}; 