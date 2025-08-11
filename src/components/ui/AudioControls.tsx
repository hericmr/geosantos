import React from 'react';
import { Volume2Icon, Volume1Icon, VolumeXIcon } from './GameIcons';
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
      background: 'var(--bg-secondary)',
      border: 'none',
      color: 'var(--text-primary)',
      padding: 'clamp(8px, 1.5vw, 12px)',
      borderRadius: '2px',
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(5px, 1vw, 10px)',
      zIndex: 1000,
      touchAction: 'manipulation',
      boxShadow: 'var(--shadow-md)'
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
          <VolumeXIcon size={24} color="var(--text-primary)" />
        ) : volume > 0.3 ? (
          <Volume2Icon size={24} color="var(--text-primary)" />
        ) : volume > 0 ? (
          <Volume1Icon size={24} color="var(--text-primary)" />
        ) : (
          <Volume1Icon size={24} color="var(--text-primary)" />
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
          accentColor: 'var(--accent-green)',
          touchAction: 'manipulation'
        }}
      />
    </div>
  );
}; 