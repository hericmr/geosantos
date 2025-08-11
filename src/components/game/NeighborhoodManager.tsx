import React, { useEffect, useRef, useState } from 'react';
import { FeatureCollection } from 'geojson';
import * as L from 'leaflet';
import { NeighborhoodMode } from './modes/NeighborhoodMode';
import { NeighborhoodGameState, NeighborhoodValidation } from '../../types/modes/neighborhood';

interface NeighborhoodManagerRefactoredProps {
  geoJsonData: FeatureCollection | null;
  geoJsonRef: React.RefObject<L.GeoJSON>;
  updateGameState: (state: any) => void;
  onStateChange?: (state: Partial<NeighborhoodGameState>) => void;
  onFeedback?: (feedback: NeighborhoodValidation) => void;
  onRoundComplete?: () => void;
  config?: any;
}

export const NeighborhoodManager: React.FC<NeighborhoodManagerRefactoredProps> = ({
  geoJsonData,
  geoJsonRef,
  updateGameState,
  onStateChange,
  onFeedback,
  onRoundComplete,
  config = {}
}) => {
  const [currentNeighborhood, setCurrentNeighborhood] = useState<string>('');
  const [availableNeighborhoods, setAvailableNeighborhoods] = useState<string[]>([]);
  const [revealedNeighborhoods, setRevealedNeighborhoods] = useState<Set<string>>(new Set());

  // Extrair nomes dos bairros do GeoJSON
  useEffect(() => {
    if (geoJsonData && geoJsonData.features) {
      const neighborhoods = geoJsonData.features
        .map(feature => feature.properties?.NOME)
        .filter(name => name && typeof name === 'string');
      
      setAvailableNeighborhoods(neighborhoods);
      console.log('[NeighborhoodManager] Bairros disponíveis:', neighborhoods);
    }
  }, [geoJsonData]);

  // Selecionar bairro aleatório
  const selectRandomNeighborhood = () => {
    if (availableNeighborhoods.length === 0) return;
    
    // Filtrar bairros não revelados
    const unrevealedNeighborhoods = availableNeighborhoods.filter(
      name => !revealedNeighborhoods.has(name)
    );
    
    // Se todos os bairros foram revelados, resetar
    if (unrevealedNeighborhoods.length === 0) {
      setRevealedNeighborhoods(new Set());
      const randomNeighborhood = availableNeighborhoods[
        Math.floor(Math.random() * availableNeighborhoods.length)
      ];
      setCurrentNeighborhood(randomNeighborhood);
      updateGameState({ currentNeighborhood: randomNeighborhood });
      console.log('[NeighborhoodManager] Novo bairro selecionado (reset):', randomNeighborhood);
      return;
    }
    
    // Selecionar bairro aleatório não revelado
    const randomNeighborhood = unrevealedNeighborhoods[
      Math.floor(Math.random() * unrevealedNeighborhoods.length)
    ];
    
    setCurrentNeighborhood(randomNeighborhood);
    updateGameState({ currentNeighborhood: randomNeighborhood });
    console.log('[NeighborhoodManager] Novo bairro selecionado:', randomNeighborhood);
  };

  // Inicializar primeiro bairro quando o jogo começar
  useEffect(() => {
    if (availableNeighborhoods.length > 0 && !currentNeighborhood) {
      selectRandomNeighborhood();
    }
  }, [availableNeighborhoods, currentNeighborhood]);

  // Expor métodos para uso externo
  const neighborhoodManagerRef = React.useRef<{
    startGame: () => void;
    pauseGame: () => void;
    resumeGame: () => void;
    endGame: () => void;
    startNewRound: () => void;
    selectRandomNeighborhood: () => void;
    getCurrentState: () => NeighborhoodGameState | null;
    getVisualFeedback: () => any;
  }>(null);

  React.useImperativeHandle(neighborhoodManagerRef, () => ({
    startGame: () => {
      console.log('[NeighborhoodManager] Jogo iniciado');
      selectRandomNeighborhood();
    },
    pauseGame: () => {
      console.log('[NeighborhoodManager] Jogo pausado');
    },
    resumeGame: () => {
      console.log('[NeighborhoodManager] Jogo retomado');
    },
    endGame: () => {
      console.log('[NeighborhoodManager] Jogo terminado');
    },
    startNewRound: () => {
      console.log('[NeighborhoodManager] Nova rodada iniciada');
      selectRandomNeighborhood();
    },
    selectRandomNeighborhood: () => {
      selectRandomNeighborhood();
    },
    getCurrentState: () => ({
      currentNeighborhood,
      revealedNeighborhoods,
      availableNeighborhoods,
      roundNumber: 1,
      totalRounds: availableNeighborhoods.length,
      roundTimeLeft: 30,
      isActive: true,
      score: 0,
      feedback: null
    } as NeighborhoodGameState),
    getVisualFeedback: () => ({})
  }));

  // Renderização mínima (lógica principal)
  return null;
}; 