import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FeatureCollection } from 'geojson';
import * as L from 'leaflet';
import { NeighborhoodMode } from './modes/NeighborhoodMode';
import { NeighborhoodGameState, NeighborhoodValidation } from '../../types/modes/neighborhood';
// CORREÇÃO: Usar validação compartilhada
import { normalizeNeighborhoodName } from '../../utils/shared/validation';

interface NeighborhoodManagerRefactoredProps {
  geoJsonData: FeatureCollection | null;
  geoJsonRef: React.RefObject<L.GeoJSON>;
  updateGameState: (state: any) => void;
  onStateChange?: (state: Partial<NeighborhoodGameState>) => void;
  onFeedback?: (feedback: NeighborhoodValidation) => void;
  onRoundComplete?: () => void;
  config?: any;
  // CORREÇÃO: Callback para notificar quando deve selecionar novo bairro
  onShouldSelectNewNeighborhood?: () => void;
  // NOVA FUNCIONALIDADE: Callback para quando bairro é alterado externamente
  onNeighborhoodChanged?: (neighborhood: string) => void;
  // NOVA FUNCIONALIDADE: Bairro atual do estado externo
  externalCurrentNeighborhood?: string;
}

export const NeighborhoodManager: React.FC<NeighborhoodManagerRefactoredProps> = ({
  geoJsonData,
  geoJsonRef,
  updateGameState,
  onStateChange,
  onFeedback,
  onRoundComplete,
  config = {},
  onNeighborhoodChanged,
  externalCurrentNeighborhood
}) => {
  const [currentNeighborhood, setCurrentNeighborhood] = useState<string>('');
  const [availableNeighborhoods, setAvailableNeighborhoods] = useState<string[]>([]);
  const [revealedNeighborhoods, setRevealedNeighborhoods] = useState<Set<string>>(new Set());
  const [roundNumber, setRoundNumber] = useState(1);
  const [totalRounds, setTotalRounds] = useState(4);
  const [score, setScore] = useState(0);
  const [roundTimeLeft, setRoundTimeLeft] = useState(30); // Tempo da rodada atual
  const [isGameActive, setIsGameActive] = useState(false);
  
  // CORREÇÃO: Proteção contra múltiplas execuções simultâneas
  const isSelectingRef = useRef(false);
  const lastSelectionTimeRef = useRef(0);
  
  // CORREÇÃO: Timer para controlar o tempo da rodada
  const roundTimerRef = useRef<NodeJS.Timeout | null>(null);

  // CORREÇÃO: Callback para notificar quando deve selecionar novo bairro
  const onShouldSelectNewNeighborhood = useCallback(() => {
    console.log('[NeighborhoodManager] Callback onShouldSelectNewNeighborhood disparado');
    if (!isSelectingRef.current) {
      selectRandomNeighborhood();
    } else {
      console.log('[NeighborhoodManager] Ignorando callback - já selecionando');
    }
  }, []);

  // CORREÇÃO: Função para ativar game over por tempo esgotado
  const triggerGameOverByTime = useCallback(() => {
    console.log('[NeighborhoodManager] TEMPO ESGOTADO - Ativando game over');
    
    // Parar o timer da rodada
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    
    // Marcar jogo como inativo
    setIsGameActive(false);
    
    // Atualizar estado global para mostrar game over
    updateGameState({
      gameOver: true,
      roundNumber: roundNumber,
      score: score,
      currentNeighborhood: currentNeighborhood,
      roundTimeLeft: 0
    });
    
    // Notificar que o jogo terminou
    if (onRoundComplete) {
      onRoundComplete();
    }
  }, [roundNumber, score, currentNeighborhood, updateGameState, onRoundComplete]);

  // CORREÇÃO: Função para iniciar timer da rodada
  const startRoundTimer = useCallback(() => {
    console.log('[NeighborhoodManager] Iniciando timer da rodada - tempo restante:', roundTimeLeft);
    
    // Limpar timer anterior se existir
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
    }
    
    // Iniciar contagem regressiva
    roundTimerRef.current = setInterval(() => {
      setRoundTimeLeft(prev => {
        const newTime = prev - 1;
        console.log('[NeighborhoodManager] Timer rodada:', newTime, 'segundos restantes');
        
        // Atualizar estado global com tempo restante
        updateGameState({
          roundTimeLeft: newTime
        });
        
        // Verificar se tempo esgotou
        if (newTime <= 0) {
          console.log('[NeighborhoodManager] TEMPO ESGOTADO - Parando timer');
          if (roundTimerRef.current) {
            clearInterval(roundTimerRef.current);
            roundTimerRef.current = null;
          }
          triggerGameOverByTime();
          return 0;
        }
        
        return newTime;
      });
    }, 1000); // Atualizar a cada segundo
  }, [roundTimeLeft, updateGameState, triggerGameOverByTime]);

  // CORREÇÃO: Função para parar timer da rodada
  const stopRoundTimer = useCallback(() => {
    if (roundTimerRef.current) {
      console.log('[NeighborhoodManager] Parando timer da rodada');
      clearInterval(roundTimerRef.current);
      roundTimerRef.current = null;
    }
  }, []);

  // Extrair nomes dos bairros do GeoJSON
  useEffect(() => {
    if (geoJsonData && geoJsonData.features) {
      // CORREÇÃO: Usar normalização para extrair nomes consistentemente
      const neighborhoods = geoJsonData.features
        .map(feature => normalizeNeighborhoodName(feature))
        .filter((name): name is string => name !== null && typeof name === 'string');
      
      setAvailableNeighborhoods(neighborhoods);
      setTotalRounds(Math.min(neighborhoods.length, 4)); // Máximo 4 rodadas (conforme alteração do usuário)
      console.log('[NeighborhoodManager] Bairros disponíveis:', neighborhoods);
    }
  }, [geoJsonData]);

  // CORREÇÃO: Implementar lógica de fim de jogo
  const checkGameOver = useCallback(() => {
    if (roundNumber >= totalRounds) {
      console.log('[NeighborhoodManager] JOGO TERMINOU - Todas as rodadas completas');
      
      // Parar timer da rodada
      stopRoundTimer();
      
      // Marcar jogo como inativo
      setIsGameActive(false);
      
      // Atualizar estado global para mostrar game over
      updateGameState({
        gameOver: true,
        roundNumber: roundNumber,
        score: score,
        currentNeighborhood: currentNeighborhood
      });
      
      // Notificar que o jogo terminou
      if (onRoundComplete) {
        onRoundComplete();
      }
      
      return true;
    }
    return false;
  }, [roundNumber, totalRounds, score, currentNeighborhood, updateGameState, onRoundComplete, stopRoundTimer]);

  // Selecionar bairro aleatório
  const selectRandomNeighborhood = () => {
    console.log('[NeighborhoodManager] selectRandomNeighborhood chamado - Stack trace:', new Error().stack);
    
    // CORREÇÃO: Proteção contra múltiplas execuções simultâneas
    const now = Date.now();
    if (isSelectingRef.current) {
      console.log('[NeighborhoodManager] selectRandomNeighborhood ignorado - já selecionando');
      return;
    }
    
    if (now - lastSelectionTimeRef.current < 100) {
      console.log('[NeighborhoodManager] selectRandomNeighborhood ignorado - muito rápido (debounce)');
      return;
    }
    
    // Marcar como selecionando
    isSelectingRef.current = true;
    lastSelectionTimeRef.current = now;
    
    try {
      if (availableNeighborhoods.length === 0) {
        console.log('[NeighborhoodManager] Nenhum bairro disponível');
        return;
      }
      
      // Filtrar bairros não revelados
      const unrevealedNeighborhoods = availableNeighborhoods.filter(
        name => !revealedNeighborhoods.has(name)
      );
      
      // Se todos os bairros foram revelados, resetar
      if (unrevealedNeighborhoods.length === 0) {
        console.log('[NeighborhoodManager] Todos os bairros revelados - resetando');
        setRevealedNeighborhoods(new Set());
        setRoundNumber(1);
        setRoundTimeLeft(30); // Resetar tempo da rodada
        const randomNeighborhood = availableNeighborhoods[
          Math.floor(Math.random() * availableNeighborhoods.length)
        ];
        setCurrentNeighborhood(randomNeighborhood);
        updateGameState({ 
          currentNeighborhood: randomNeighborhood,
          roundNumber: 1,
          gameOver: false,
          roundTimeLeft: 30
        });
        console.log('[NeighborhoodManager] Novo bairro selecionado (reset):', randomNeighborhood);
        return;
      }
      
      // Selecionar bairro aleatório não revelado
      const randomNeighborhood = unrevealedNeighborhoods[
        Math.floor(Math.random() * unrevealedNeighborhoods.length)
      ];
      
      console.log('[NeighborhoodManager] Selecionando bairro:', randomNeighborhood);
      setCurrentNeighborhood(randomNeighborhood);
      setRoundTimeLeft(30); // Resetar tempo da rodada
      updateGameState({ 
        currentNeighborhood: randomNeighborhood,
        roundNumber: roundNumber,
        gameOver: false,
        roundTimeLeft: 30
      });
      console.log('[NeighborhoodManager] Novo bairro selecionado:', randomNeighborhood);
    } finally {
      // Sempre liberar o flag
      setTimeout(() => {
        isSelectingRef.current = false;
      }, 50); // Delay para evitar execuções muito rápidas
    }
  };

  // CORREÇÃO: Função para avançar para próxima rodada
  const startNewRound = useCallback(() => {
    console.log('[NeighborhoodManager] startNewRound chamado - rodada atual:', roundNumber);
    
    // Verificar se o jogo terminou
    if (checkGameOver()) {
      return;
    }
    
    // Parar timer da rodada atual
    stopRoundTimer();
    
    // Avançar para próxima rodada
    const newRoundNumber = roundNumber + 1;
    setRoundNumber(newRoundNumber);
    setRoundTimeLeft(30); // Resetar tempo para nova rodada
    
    console.log('[NeighborhoodManager] Avançando para rodada:', newRoundNumber);
    
    // Selecionar novo bairro para a próxima rodada
    selectRandomNeighborhood();
    
    // Atualizar estado global
    updateGameState({
      roundNumber: newRoundNumber,
      gameOver: false,
      roundTimeLeft: 30
    });
  }, [roundNumber, checkGameOver, updateGameState, stopRoundTimer]);

  // CORREÇÃO: Função para marcar bairro como encontrado
  const markNeighborhoodAsFound = useCallback((neighborhoodName: string, points: number) => {
    console.log('[NeighborhoodManager] Marcando bairro como encontrado:', neighborhoodName, 'pontos:', points);
    
    // Parar timer da rodada atual
    stopRoundTimer();
    
    // Adicionar aos bairros revelados
    setRevealedNeighborhoods(prev => new Set([...prev, neighborhoodName]));
    
    // Atualizar pontuação
    const newScore = score + points;
    setScore(newScore);
    
    // Atualizar estado global
    updateGameState({
      revealedNeighborhoods: new Set([...revealedNeighborhoods, neighborhoodName]),
      score: newScore
    });
    
    // Verificar se o jogo terminou
    checkGameOver();
  }, [score, revealedNeighborhoods, updateGameState, checkGameOver, stopRoundTimer]);

  // Inicializar primeiro bairro quando o jogo começar
  useEffect(() => {
    console.log('[NeighborhoodManager] useEffect disparado:', {
      availableNeighborhoodsLength: availableNeighborhoods.length,
      currentNeighborhood,
      isSelecting: isSelectingRef.current
    });
    
    if (availableNeighborhoods.length > 0 && !currentNeighborhood && !isSelectingRef.current) {
      console.log('[NeighborhoodManager] Inicializando primeiro bairro');
      selectRandomNeighborhood();
    } else {
      console.log('[NeighborhoodManager] useEffect ignorado:', {
        reason: availableNeighborhoods.length === 0 ? 'sem bairros disponíveis' : 
                currentNeighborhood ? 'bairro já selecionado' : 
                'já selecionando'
      });
    }
  }, [availableNeighborhoods, currentNeighborhood]);

  // NOVA FUNCIONALIDADE: Sincronizar com bairro externo quando mudar
  useEffect(() => {
    if (externalCurrentNeighborhood && externalCurrentNeighborhood !== currentNeighborhood) {
      console.log('[NeighborhoodManager] Bairro externo alterado:', {
        anterior: currentNeighborhood,
        novo: externalCurrentNeighborhood
      });
      
      // Sincronizar estado interno
      setCurrentNeighborhood(externalCurrentNeighborhood);
      
      // Notificar mudança
      if (onNeighborhoodChanged) {
        onNeighborhoodChanged(externalCurrentNeighborhood);
      }
      
      // Atualizar estado global
      updateGameState({
        currentNeighborhood: externalCurrentNeighborhood
      });
      
      console.log('[NeighborhoodManager] Bairro sincronizado com estado externo');
    }
  }, [externalCurrentNeighborhood, currentNeighborhood, onNeighborhoodChanged, updateGameState]);

  // CORREÇÃO: Iniciar timer quando bairro for selecionado
  useEffect(() => {
    if (currentNeighborhood && isGameActive && roundTimeLeft > 0) {
      console.log('[NeighborhoodManager] Iniciando timer para bairro:', currentNeighborhood);
      startRoundTimer();
    }
  }, [currentNeighborhood, isGameActive, roundTimeLeft, startRoundTimer]);

  // CORREÇÃO: Cleanup do timer quando componente for desmontado
  useEffect(() => {
    return () => {
      if (roundTimerRef.current) {
        clearInterval(roundTimerRef.current);
      }
    };
  }, []);

  // CORREÇÃO: Detectar quando deve selecionar novo bairro baseado na flag do useGameState
  useEffect(() => {
    // Este useEffect será disparado quando o componente receber atualizações do estado global
    // Ele detecta quando shouldSelectNewNeighborhood é true e seleciona um novo bairro
  }, []);

  // Expor métodos para uso externo
  const neighborhoodManagerRef = React.useRef<{
    startGame: () => void;
    pauseGame: () => void;
    resumeGame: () => void;
    endGame: () => void;
    startNewRound: () => void;
    selectRandomNeighborhood: () => void;
    markNeighborhoodAsFound: (name: string, points: number) => void;
    // CORREÇÃO: Callback para seleção de novo bairro
    onShouldSelectNewNeighborhood: () => void;
    getCurrentState: () => NeighborhoodGameState | null;
    getVisualFeedback: () => any;
  }>(null);

  React.useImperativeHandle(neighborhoodManagerRef, () => ({
    startGame: () => {
      console.log('[NeighborhoodManager] Jogo iniciado');
      setIsGameActive(true);
      setRoundNumber(1);
      setScore(0);
      setRevealedNeighborhoods(new Set());
      setRoundTimeLeft(30);
      selectRandomNeighborhood();
    },
    pauseGame: () => {
      console.log('[NeighborhoodManager] Jogo pausado');
      setIsGameActive(false);
      stopRoundTimer();
    },
    resumeGame: () => {
      console.log('[NeighborhoodManager] Jogo retomado');
      setIsGameActive(true);
      if (currentNeighborhood && roundTimeLeft > 0) {
        startRoundTimer();
      }
    },
    endGame: () => {
      console.log('[NeighborhoodManager] Jogo terminado');
      setIsGameActive(false);
      stopRoundTimer();
      updateGameState({ gameOver: true });
    },
    startNewRound: () => {
      console.log('[NeighborhoodManager] Nova rodada iniciada');
      startNewRound();
    },
    selectRandomNeighborhood: () => {
      selectRandomNeighborhood();
    },
    markNeighborhoodAsFound: (name: string, points: number) => {
      markNeighborhoodAsFound(name, points);
    },
    // CORREÇÃO: Expor callback para seleção de novo bairro
    onShouldSelectNewNeighborhood,
    getCurrentState: () => ({
      currentNeighborhood,
      revealedNeighborhoods,
      availableNeighborhoods,
      roundNumber,
      totalRounds,
      roundTimeLeft,
      isActive: isGameActive,
      score,
      feedback: null
    } as NeighborhoodGameState),
    getVisualFeedback: () => ({})
  }));

  // Renderização mínima (lógica principal)
  return null;
}; 