import React from 'react';
import { capitalizeWords } from '../../../utils/textUtils';
import { GameMode } from '../../../types/famousPlaces';

export interface FamousPlace {
  name: string;
  description?: string;
}

export interface PlaceDescriptionProps {
  currentMode: GameMode;
  currentNeighborhood: string;
  currentFamousPlace?: FamousPlace;
  displayedDistance: number;
  clickTime: number;
  isCorrectNeighborhood: boolean;
}

export const PlaceDescription: React.FC<PlaceDescriptionProps> = ({
  currentMode,
  currentNeighborhood,
  currentFamousPlace,
  displayedDistance,
  clickTime,
  isCorrectNeighborhood
}) => {
  return (
    <div style={{
      fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
      fontFamily: "'LaCartoonerie', sans-serif",
      color: '#fff',
      opacity: 0.9,
      textAlign: 'center',
      marginTop: '4px',
      lineHeight: 1.4
    }}>
      {isCorrectNeighborhood ? (
        // Acerto na mosca
        <>
          {currentMode === 'famous_places'
            ? `Em ${clickTime.toFixed(2)} seg você acertou ${currentFamousPlace?.name || 'o lugar famoso'}!`
            : `Em ${clickTime.toFixed(2)} seg você acertou na mosca o bairro `}
          {currentMode === 'neighborhoods' && (
            <span style={{ color: '#32CD32', fontWeight: 600 }}>{capitalizeWords(currentNeighborhood)}</span>
          )}
          {currentMode === 'neighborhoods' && '!' }
        </>
      ) : (
        // Erro - mostrar distância
        <>
          {currentMode === 'famous_places'
            ? `Em ${clickTime.toFixed(2)} seg você clicou a ${Math.round(displayedDistance)}m de ${currentFamousPlace?.name || 'o lugar famoso'}`
            : `Em ${clickTime.toFixed(2)} seg você clicou a ${Math.round(displayedDistance)}m do bairro `}
          {currentMode === 'neighborhoods' && (
            <span style={{ color: '#32CD32', fontWeight: 600 }}>{capitalizeWords(currentNeighborhood)}</span>
          )}
          {currentMode === 'neighborhoods' && '!' }
        </>
      )}
    </div>
  );
}; 