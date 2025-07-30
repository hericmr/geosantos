import React, { useState, useEffect } from 'react';
import { FamousPlace } from '../../types/famousPlaces';
import { useFamousPlaces } from '../../hooks/useFamousPlaces';

interface FamousPlacesManagerProps {
  onPlaceChange: (place: FamousPlace) => void;
  currentPlace: FamousPlace | null;
  isGameActive: boolean;
  roundNumber?: number;
  onRoundComplete?: () => void;
}

export const FamousPlacesManager: React.FC<FamousPlacesManagerProps> = ({
  onPlaceChange,
  currentPlace,
  isGameActive,
  roundNumber = 1,
  onRoundComplete
}) => {
  const { places, isLoading, error, getRandomPlace } = useFamousPlaces();
  const [usedPlaces, setUsedPlaces] = useState<Set<string>>(new Set());
  const [roundPlaces, setRoundPlaces] = useState<FamousPlace[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);

  // Gerar lista de lugares para a rodada atual
  const generateRoundPlaces = () => {
    if (places.length === 0) return [];

    const roundSize = Math.min(5, places.length); // Máximo 5 lugares por rodada
    const availablePlaces = places.filter(place => !usedPlaces.has(place.id));
    
    // Se não há lugares suficientes, resetar lugares usados
    if (availablePlaces.length < roundSize) {
      setUsedPlaces(new Set());
      return places.slice(0, roundSize);
    }
    
    // Selecionar lugares aleatórios para a rodada
    const selectedPlaces: FamousPlace[] = [];
    const shuffled = [...availablePlaces].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < roundSize; i++) {
      if (shuffled[i]) {
        selectedPlaces.push(shuffled[i]);
      }
    }
    
    return selectedPlaces;
  };

  // Selecionar próximo lugar da rodada
  const selectNextPlace = () => {
    if (roundPlaces.length === 0) return;

    const nextIndex = currentRoundIndex + 1;
    
    if (nextIndex < roundPlaces.length) {
      // Ainda há lugares na rodada atual
      const nextPlace = roundPlaces[nextIndex];
      setCurrentRoundIndex(nextIndex);
      onPlaceChange(nextPlace);
    } else {
      // Rodada terminou, gerar nova rodada
      const newRoundPlaces = generateRoundPlaces();
      if (newRoundPlaces.length > 0) {
        setRoundPlaces(newRoundPlaces);
        setCurrentRoundIndex(0);
        onPlaceChange(newRoundPlaces[0]);
        
        // Marcar lugares da rodada anterior como usados
        setUsedPlaces(prev => {
          const newUsed = new Set(prev);
          roundPlaces.forEach(place => newUsed.add(place.id));
          return newUsed;
        });
        
        // Notificar que a rodada foi completada
        if (onRoundComplete) {
          onRoundComplete();
        }
      }
    }
  };

  // Selecionar lugar específico da rodada atual
  const selectPlaceFromRound = (index: number) => {
    if (index >= 0 && index < roundPlaces.length) {
      setCurrentRoundIndex(index);
      onPlaceChange(roundPlaces[index]);
    }
  };

  // Inicializar primeira rodada quando o jogo inicia
  useEffect(() => {
    if (isGameActive && places.length > 0 && roundPlaces.length === 0) {
      const initialRoundPlaces = generateRoundPlaces();
      if (initialRoundPlaces.length > 0) {
        setRoundPlaces(initialRoundPlaces);
        setCurrentRoundIndex(0);
        onPlaceChange(initialRoundPlaces[0]);
      }
    }
  }, [isGameActive, places]);

  // Resetar quando o jogo termina
  useEffect(() => {
    if (!isGameActive) {
      setUsedPlaces(new Set());
      setRoundPlaces([]);
      setCurrentRoundIndex(0);
    }
  }, [isGameActive]);

  // Função para forçar próxima rodada (usada quando acerta)
  const forceNextRound = () => {
    selectNextPlace();
  };

  // Expor função para uso externo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).famousPlacesManager = {
        forceNextRound,
        selectNextPlace,
        selectPlaceFromRound,
        getCurrentRoundInfo: () => ({
          currentIndex: currentRoundIndex,
          totalPlaces: roundPlaces.length,
          currentPlace: roundPlaces[currentRoundIndex],
          roundPlaces
        })
      };
    }
  }, [currentRoundIndex, roundPlaces]);

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