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
      top: '20px',
      left: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      zIndex: 1000
    }}>
      <button
        onClick={onToggleMute}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '5px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {isMuted ? (
          <span style={{ fontSize: '24px' }}>🔇</span>
        ) : volume > 0.5 ? (
          <span style={{ fontSize: '24px' }}>🔊</span>
        ) : volume > 0 ? (
          <span style={{ fontSize: '24px' }}>🔉</span>
        ) : (
          <span style={{ fontSize: '24px' }}>🔈</span>
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
          width: '100px',
          accentColor: '#32CD32'
        }}
      />
    </div>
  );
}; 