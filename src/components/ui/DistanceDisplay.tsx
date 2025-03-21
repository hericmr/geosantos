import React from 'react';

interface DistanceDisplayProps {
  totalDistance: number;
  maxDistance: number;
}

export const DistanceDisplay: React.FC<DistanceDisplayProps> = ({ totalDistance, maxDistance }) => {
  const distanceKm = (totalDistance / 1000).toFixed(1);
  const progress = (totalDistance / maxDistance) * 100;
  
  const getProgressBarColor = (progress: number) => {
    if (progress >= 90) return '#ff4444';
    if (progress >= 70) return '#ffbb33';
    return '#00C851';
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2px',
      background: 'rgba(0, 0, 0, 0.5)',
      padding: '4px 8px',
      borderRadius: '4px',
      color: 'white',
      fontFamily: 'Figtree',
      fontSize: '14px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontSize: '16px' }}>🚶</span>
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