import React from 'react';
import { MapPinIcon } from './GameIcons';

interface DistanceDisplayProps {
  totalDistance: number;
  maxDistance: number;
}

export const DistanceDisplay: React.FC<DistanceDisplayProps> = ({ totalDistance, maxDistance }) => {
  const distanceKm = (totalDistance / 1000).toFixed(1);
  const progress = (totalDistance / maxDistance) * 100;
  
  const getProgressBarColor = (progress: number) => {
    if (progress >= 90) return 'var(--accent-red)';
    if (progress >= 70) return 'var(--accent-orange)';
    return 'var(--accent-green)';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2px',
      background: 'var(--bg-secondary)',
      border: '2px solid var(--text-primary)',
      padding: '4px 8px',
      borderRadius: '2px',
      color: 'var(--text-primary)',
      fontFamily: "'VT323', monospace",
      fontSize: '14px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <MapPinIcon size={16} color="var(--accent-green)" />
        <span>{distanceKm}km</span>
      </div>
      <div style={{
        width: '100%',
        height: '2px',
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '1px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${Math.min(progress, 100)}%`,
          height: '100%',
          background: getProgressBarColor(progress),
          transition: 'width 0.3s ease-in-out'
        }} />
      </div>
    </div>
  );
}; 