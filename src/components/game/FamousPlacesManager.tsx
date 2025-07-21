import React, { useState, useEffect } from 'react';
import { FamousPlace } from '../../types/famousPlaces';
import { useFamousPlaces } from '../../hooks/useFamousPlaces';

interface FamousPlacesManagerProps {
  onPlaceChange: (place: FamousPlace) => void;
  currentPlace: FamousPlace | null;
  isGameActive: boolean;
}

export const FamousPlacesManager: React.FC<FamousPlacesManagerProps> = ({
  onPlaceChange,
  currentPlace,
  isGameActive
}) => {
  const { places, isLoading, error, getRandomPlace } = useFamousPlaces();
  const [usedPlaces, setUsedPlaces] = useState<Set<string>>(new Set());

  // Selecionar um novo lugar aleatório
  const selectNewPlace = () => {
    if (places.length === 0) return;

    let newPlace: FamousPlace | null = null;
    let attempts = 0;
    const maxAttempts = places.length * 2; // Evitar loop infinito

    // Tentar encontrar um lugar não usado recentemente
    while (!newPlace && attempts < maxAttempts) {
      const randomPlace = getRandomPlace();
      if (randomPlace && !usedPlaces.has(randomPlace.id)) {
        newPlace = randomPlace;
      }
      attempts++;
    }

    // Se não encontrar um lugar não usado, usar qualquer um
    if (!newPlace) {
      newPlace = getRandomPlace();
      setUsedPlaces(new Set()); // Resetar lugares usados
    }

    if (newPlace) {
      onPlaceChange(newPlace);
      setUsedPlaces(prev => new Set([...prev, newPlace!.id]));
    }
  };

  // Selecionar novo lugar quando o jogo inicia
  useEffect(() => {
    if (isGameActive && places.length > 0 && !currentPlace) {
      selectNewPlace();
    }
  }, [isGameActive, places, currentPlace]);

  // Resetar quando o jogo termina
  useEffect(() => {
    if (!isGameActive) {
      setUsedPlaces(new Set());
    }
  }, [isGameActive]);

  if (isLoading) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'var(--text-primary)',
        fontFamily: "'VT323', monospace",
        fontSize: '1.2rem'
      }}>
        Carregando lugares famosos...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'var(--accent-red)',
        fontFamily: "'VT323', monospace",
        fontSize: '1.2rem',
        textAlign: 'center'
      }}>
        Erro ao carregar lugares famosos:<br/>
        {error}
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'var(--text-primary)',
        fontFamily: "'VT323', monospace",
        fontSize: '1.2rem'
      }}>
        Nenhum lugar famoso encontrado.
      </div>
    );
  }

  return null; // Este componente não renderiza nada visualmente
}; 