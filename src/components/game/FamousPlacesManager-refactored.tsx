import React, { useEffect, useRef } from 'react';
import { FamousPlacesMode } from './modes/FamousPlacesMode';
import { 
  FamousPlacesGameState, 
  FamousPlacesValidation,
  FamousPlacesRound
} from '../../types/modes/famousPlaces';
import { FamousPlace } from '../../types/famousPlaces';

interface FamousPlacesManagerRefactoredProps {
  onPlaceChange: (place: FamousPlace) => void;
  currentPlace: FamousPlace | null;
  isGameActive: boolean;
  roundNumber?: number;
  onRoundComplete?: () => void;
  onStateChange?: (state: Partial<FamousPlacesGameState>) => void;
  onFeedback?: (feedback: FamousPlacesValidation) => void;
  config?: any;
}

export const FamousPlacesManagerRefactored: React.FC<FamousPlacesManagerRefactoredProps> = ({
  onPlaceChange,
  currentPlace,
  isGameActive,
  roundNumber = 1,
  onRoundComplete,
  onStateChange,
  onFeedback,
  config = {}
}) => {
  interface FamousPlacesModeMethods {
    startGame: () => void;
    pauseGame: () => void;
    resumeGame: () => void;
    endGame: () => void;
    advanceToNextPlace: () => void;
    forceNextRound: () => void;
    selectPlaceFromRound: (index: number) => void;
    getCurrentState: () => FamousPlacesGameState;
    getVisualFeedback: () => any;
    getCurrentRound: () => FamousPlacesRound | null;
    cleanup: () => void;
  }

  const famousPlacesModeRef = useRef<FamousPlacesModeMethods | null>(null);

  // Callbacks para comunicação com o modo
  const handleStateChange = (state: Partial<FamousPlacesGameState>) => {
    // Notificar mudança de estado se callback fornecido
    if (onStateChange) {
      onStateChange(state);
    }
  };

  const handleFeedback = (feedback: FamousPlacesValidation) => {
    // Notificar feedback se callback fornecido
    if (onFeedback) {
      onFeedback(feedback);
    }
  };

  const handleRoundComplete = () => {
    console.log('[FamousPlacesManagerRefactored] Rodada completada');
    
    // Notificar conclusão da rodada se callback fornecido
    if (onRoundComplete) {
      onRoundComplete();
    }
  };

  const handlePlaceChange = (place: FamousPlace) => {
    // Notificar mudança de lugar
    onPlaceChange(place);
  };

  // Inicializar modo quando o jogo estiver ativo
  useEffect(() => {
    if (isGameActive && !famousPlacesModeRef.current) {
      console.log('[FamousPlacesManagerRefactored] Inicializando modo de lugares famosos');
      
      // Criar instância do modo (mock para compatibilidade)
      const mode: FamousPlacesModeMethods = {
        startGame: () => console.log('Mock startGame'),
        pauseGame: () => console.log('Mock pauseGame'),
        resumeGame: () => console.log('Mock resumeGame'),
        endGame: () => console.log('Mock endGame'),
        advanceToNextPlace: () => console.log('Mock advanceToNextPlace'),
        forceNextRound: () => console.log('Mock forceNextRound'),
        selectPlaceFromRound: (index: number) => console.log('Mock selectPlaceFromRound', index),
        getCurrentState: () => ({
          currentPlace: null,
          roundPlaces: [],
          usedPlaces: new Set(),
          currentRoundIndex: 0,
          roundNumber: 1,
          totalRounds: 10,
          roundTimeLeft: 15,
          isActive: false,
          score: 0,
          feedback: null
        }),
        getVisualFeedback: () => ({}),
        getCurrentRound: () => null,
        cleanup: () => console.log('Mock cleanup')
      };
      
      famousPlacesModeRef.current = mode;
    }
  }, [isGameActive]);

  // Limpar recursos quando componente for desmontado
  useEffect(() => {
    return () => {
      if (famousPlacesModeRef.current) {
        famousPlacesModeRef.current.cleanup();
        famousPlacesModeRef.current = null;
      }
    };
  }, []);

  // Expor métodos para uso externo
  const famousPlacesManagerRef = React.useRef<{
    startGame: () => void;
    pauseGame: () => void;
    resumeGame: () => void;
    endGame: () => void;
    advanceToNextPlace: () => void;
    forceNextRound: () => void;
    selectPlaceFromRound: (index: number) => void;
    getCurrentState: () => FamousPlacesGameState | null;
    getVisualFeedback: () => any;
    getCurrentRound: () => FamousPlacesRound | null;
  }>(null);

  React.useImperativeHandle(famousPlacesManagerRef, () => ({
    startGame: () => {
      if (famousPlacesModeRef.current) {
        famousPlacesModeRef.current.startGame();
      }
    },
    pauseGame: () => {
      if (famousPlacesModeRef.current) {
        famousPlacesModeRef.current.pauseGame();
      }
    },
    resumeGame: () => {
      if (famousPlacesModeRef.current) {
        famousPlacesModeRef.current.resumeGame();
      }
    },
    endGame: () => {
      if (famousPlacesModeRef.current) {
        famousPlacesModeRef.current.endGame();
      }
    },
    advanceToNextPlace: () => {
      if (famousPlacesModeRef.current) {
        famousPlacesModeRef.current.advanceToNextPlace();
      }
    },
    forceNextRound: () => {
      if (famousPlacesModeRef.current) {
        famousPlacesModeRef.current.forceNextRound();
      }
    },
    selectPlaceFromRound: (index: number) => {
      if (famousPlacesModeRef.current) {
        famousPlacesModeRef.current.selectPlaceFromRound(index);
      }
    },
    getCurrentState: () => {
      if (famousPlacesModeRef.current) {
        return famousPlacesModeRef.current.getCurrentState();
      }
      return null;
    },
    getVisualFeedback: () => {
      if (famousPlacesModeRef.current) {
        return famousPlacesModeRef.current.getVisualFeedback();
      }
      return null;
    },
    getCurrentRound: () => {
      if (famousPlacesModeRef.current) {
        return famousPlacesModeRef.current.getCurrentRound();
      }
      return null;
    }
  }));

  // Renderização mínima (lógica principal)
  return null;
}; 