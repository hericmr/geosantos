import React, { useEffect, useRef } from 'react';
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

export const NeighborhoodManagerRefactored: React.FC<NeighborhoodManagerRefactoredProps> = ({
  geoJsonData,
  geoJsonRef,
  updateGameState,
  onStateChange,
  onFeedback,
  onRoundComplete,
  config = {}
}) => {
  interface NeighborhoodModeMethods {
    startGame: () => void;
    pauseGame: () => void;
    resumeGame: () => void;
    endGame: () => void;
    startNewRound: () => void;
    selectRandomNeighborhood: () => void;
    getCurrentState: () => NeighborhoodGameState;
    getVisualFeedback: () => any;
    cleanup: () => void;
  }

  const neighborhoodModeRef = useRef<NeighborhoodModeMethods | null>(null);

  // Callbacks para comunicação com o modo
  const handleStateChange = (state: Partial<NeighborhoodGameState>) => {
    // Atualizar estado do jogo principal para compatibilidade
    updateGameState({
      currentNeighborhood: state.currentNeighborhood,
      roundNumber: state.roundNumber,
      score: state.score,
      roundTimeLeft: state.roundTimeLeft,
      isActive: state.isActive,
      revealedNeighborhoods: state.revealedNeighborhoods
    });

    // Notificar mudança de estado se callback fornecido
    if (onStateChange) {
      onStateChange(state);
    }
  };

  const handleFeedback = (feedback: NeighborhoodValidation) => {
    // Atualizar estado do jogo principal para compatibilidade
    updateGameState({
      showFeedback: true,
      feedbackMessage: feedback.message,
      score: feedback.score,
      isCorrect: feedback.isCorrectNeighborhood,
      distance: feedback.distance,
      arrowPath: feedback.additionalData?.closestPoint ? 
        [feedback.additionalData.closestPoint, feedback.additionalData.closestPoint] : null
    });

    // Notificar feedback se callback fornecido
    if (onFeedback) {
      onFeedback(feedback);
    }
  };

  const handleRoundComplete = () => {
    console.log('[NeighborhoodManagerRefactored] Rodada completada');
    
    // Notificar conclusão da rodada se callback fornecido
    if (onRoundComplete) {
      onRoundComplete();
    }
  };

  // Inicializar modo quando geoJsonData estiver disponível
  useEffect(() => {
    if (geoJsonData && !neighborhoodModeRef.current) {
      console.log('[NeighborhoodManagerRefactored] Inicializando modo de bairros');
      
      // Criar instância do modo (mock para compatibilidade)
      const mode: NeighborhoodModeMethods = {
        startGame: () => console.log('Mock startGame'),
        pauseGame: () => console.log('Mock pauseGame'),
        resumeGame: () => console.log('Mock resumeGame'),
        endGame: () => console.log('Mock endGame'),
        startNewRound: () => console.log('Mock startNewRound'),
        selectRandomNeighborhood: () => console.log('Mock selectRandomNeighborhood'),
        getCurrentState: () => ({
          currentNeighborhood: '',
          revealedNeighborhoods: new Set(),
          availableNeighborhoods: [],
          roundNumber: 1,
          totalRounds: 10,
          roundTimeLeft: 10,
          isActive: false,
          score: 0,
          feedback: null
        }),
        getVisualFeedback: () => ({}),
        cleanup: () => console.log('Mock cleanup')
      };
      
      neighborhoodModeRef.current = mode;
    }
  }, [geoJsonData, config]);

  // Limpar recursos quando componente for desmontado
  useEffect(() => {
    return () => {
      if (neighborhoodModeRef.current) {
        neighborhoodModeRef.current.cleanup();
        neighborhoodModeRef.current = null;
      }
    };
  }, []);

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
      if (neighborhoodModeRef.current) {
        neighborhoodModeRef.current.startGame();
      }
    },
    pauseGame: () => {
      if (neighborhoodModeRef.current) {
        neighborhoodModeRef.current.pauseGame();
      }
    },
    resumeGame: () => {
      if (neighborhoodModeRef.current) {
        neighborhoodModeRef.current.resumeGame();
      }
    },
    endGame: () => {
      if (neighborhoodModeRef.current) {
        neighborhoodModeRef.current.endGame();
      }
    },
    startNewRound: () => {
      if (neighborhoodModeRef.current) {
        neighborhoodModeRef.current.startNewRound();
      }
    },
    selectRandomNeighborhood: () => {
      if (neighborhoodModeRef.current) {
        neighborhoodModeRef.current.selectRandomNeighborhood();
      }
    },
    getCurrentState: () => {
      if (neighborhoodModeRef.current) {
        return neighborhoodModeRef.current.getCurrentState();
      }
      return null;
    },
    getVisualFeedback: () => {
      if (neighborhoodModeRef.current) {
        return neighborhoodModeRef.current.getVisualFeedback();
      }
      return null;
    }
  }));

  // Renderização mínima (lógica principal)
  return null;
}; 