import { useState, useEffect, useRef } from 'react';
import { LatLng } from 'leaflet';
import { GameState } from '../types/game';
import { INITIAL_TIME, ROUND_TIME, TIME_BONUS_THRESHOLDS, TIME_BONUS_AMOUNTS, calculateTimeBonus } from '../utils/gameConstants';

export const useGameState = (externalPause: boolean = false) => {
  const [gameState, setGameState] = useState<GameState>({
    currentNeighborhood: '',
    score: 0,
    globalTimeLeft: INITIAL_TIME,
    roundTimeLeft: INITIAL_TIME, // Usar INITIAL_TIME em vez de ROUND_TIME
    roundInitialTime: INITIAL_TIME, // Usar INITIAL_TIME em vez de ROUND_TIME
    roundNumber: 1,
    gameOver: false,
    gameStarted: false,
    isCountingDown: false,
    isPaused: false,
    clickedPosition: null,
    showFeedback: false,
    feedbackOpacity: 0,
    feedbackProgress: 0,
    feedbackMessage: '',
    revealedNeighborhoods: new Set(),
    clickTime: 0,
    timeBonus: 0,
    isMuted: false,
    volume: 0.5,
    arrowPath: null,
    lastClickTime: 0,
    totalDistance: 0,
    gameMode: 'neighborhoods', // valor padrão
  });

  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  // NOVA PROTEÇÃO: Contador para evitar chamadas recursivas muito profundas
  const startNextRoundRecursionCount = useRef(0);

  useEffect(() => {
    console.log('[useGameState] useEffect do timer - condições:', {
      gameStarted: gameState.gameStarted,
      gameOver: gameState.gameOver,
      roundTimeLeft: gameState.roundTimeLeft,
      globalTimeLeft: gameState.globalTimeLeft,
      isCountingDown: gameState.isCountingDown,
      isPaused: gameState.isPaused,
      externalPause,
      showFeedback: gameState.showFeedback,
      feedbackProgress: gameState.feedbackProgress
    });
    
    // CORREÇÃO CRÍTICA: Timer só deve rodar se NÃO estiver mostrando feedback
    if (gameState.gameStarted && !gameState.gameOver && gameState.roundTimeLeft > 0 && gameState.globalTimeLeft > 0 && gameState.isCountingDown && !gameState.isPaused && !externalPause && !gameState.showFeedback && gameState.feedbackProgress === 0) {
      console.log('[useGameState] Timer iniciado - condições atendidas');
      
      const timer = setInterval(() => {
        setGameState(prev => {
          // CORREÇÃO: Verificar se o timer deve continuar rodando
          if (prev.roundTimeLeft <= 0 || prev.globalTimeLeft <= 0) {
            console.log('[useGameState] Timer parado - tempo esgotado');
            return { ...prev, gameOver: true, roundTimeLeft: 0, globalTimeLeft: 0, showFeedback: true };
          }
          
          // CORREÇÃO CRÍTICA: Timer NUNCA deve rodar durante feedback visual
          if (prev.showFeedback || prev.feedbackProgress > 0) {
            console.log('[useGameState] Timer pausado - mostrando feedback ou progresso ativo');
            return prev; // Não decrementar se estiver mostrando feedback
          }
          
          console.log('[useGameState] Timer rodando - decrementando tempo');
          return { 
            ...prev, 
            roundTimeLeft: prev.roundTimeLeft - 0.1,
            globalTimeLeft: prev.globalTimeLeft - 0.1
          };
        });
      }, 100);

      return () => {
        console.log('[useGameState] Timer limpo');
        clearInterval(timer);
      };
    } else {
      console.log('[useGameState] Timer não iniciado - condições não atendidas:', {
        reason: !gameState.gameStarted ? 'jogo não iniciado' :
                gameState.gameOver ? 'jogo terminado' :
                gameState.roundTimeLeft <= 0 ? 'tempo da rodada esgotado' :
                gameState.globalTimeLeft <= 0 ? 'tempo global esgotado' :
                !gameState.isCountingDown ? 'não contando' :
                gameState.isPaused ? 'pausado' :
                externalPause ? 'pausa externa' :
                gameState.showFeedback ? 'mostrando feedback' :
                gameState.feedbackProgress > 0 ? 'progresso ativo' :
                'condição desconhecida'
      });
    }
  }, [gameState.gameStarted, gameState.gameOver, gameState.roundTimeLeft, gameState.globalTimeLeft, gameState.isCountingDown, gameState.isPaused, externalPause, gameState.showFeedback, gameState.feedbackProgress]);

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  const startGame = () => {
    setGameState(prev => {
      const isFamousPlaces = (prev.gameMode === 'famous_places');
      return {
        ...prev,
        gameStarted: true,
        score: 0,
        gameOver: false,
        globalTimeLeft: INITIAL_TIME,
        roundTimeLeft: INITIAL_TIME, // Usar o tempo inicial como tempo da rodada
        roundInitialTime: INITIAL_TIME, // Usar o tempo inicial como referência da barra
        roundNumber: 1,
        isCountingDown: true, // CORREÇÃO: Definir como true imediatamente
        isPaused: false,
        revealedNeighborhoods: new Set(),
        totalDistance: 0,
        gameMode: prev.gameMode || 'neighborhoods',
        currentNeighborhood: isFamousPlaces ? '' : prev.currentNeighborhood,
      };
    });
    // REMOVIDO: Não precisamos mais do delay para isCountingDown
    // O isCountingDown já é definido como true imediatamente acima
  };

  const startNextRound = (geoJsonData: any) => {
    // NOVA PROTEÇÃO: Verificar se não estamos em recursão excessiva
    if (startNextRoundRecursionCount.current > 5) {
      console.error('[startNextRound] ERRO: Muitas chamadas recursivas detectadas, abortando para evitar loop infinito');
      startNextRoundRecursionCount.current = 0;
      return;
    }
    
    startNextRoundRecursionCount.current++;
    
    console.log('[startNextRound] Iniciando próxima rodada, estado atual:', {
      isCountingDown: gameState.isCountingDown,
      roundNumber: gameState.roundNumber,
      globalTimeLeft: gameState.globalTimeLeft,
      timeBonus: gameState.timeBonus,
      showFeedback: gameState.showFeedback,
      feedbackProgress: gameState.feedbackProgress,
      recursionCount: startNextRoundRecursionCount.current
    });
    
    // CORREÇÃO CRÍTICA: Verificar se o estado visual está limpo antes de prosseguir
    if (gameState.showFeedback || gameState.feedbackProgress > 0) {
      console.log('[startNextRound] CORREÇÃO CRÍTICA - Estado visual ainda não limpo, forçando limpeza...');
      
      // CORREÇÃO: Forçar limpeza do estado visual e continuar imediatamente
      setGameState(prev => {
        console.log('[startNextRound] Forçando limpeza do estado visual');
        return {
          ...prev,
          showFeedback: false,
          feedbackProgress: 0,
          feedbackOpacity: 0,
          clickedPosition: null,
          arrowPath: null
        };
      });
      
      // CORREÇÃO: Continuar imediatamente após limpeza forçada
      console.log('[startNextRound] Estado visual limpo forçadamente, continuando...');
    }
    
    // Resetar contador de recursão quando executar com sucesso
    startNextRoundRecursionCount.current = 0;
    
    // CORREÇÃO: Executar imediatamente para garantir que o timer comece a contar
    setGameState(prev => {
      // CORREÇÃO: Verificar novamente o estado atual após limpeza
      const currentState = {
        ...prev,
        showFeedback: false,
        feedbackProgress: 0,
        feedbackOpacity: 0,
        clickedPosition: null,
        arrowPath: null
      };
      
      const nextRoundNumber = currentState.roundNumber + 1;
      const timeBonus = currentState.timeBonus || 0;
      const newGlobalTime = Math.max(currentState.globalTimeLeft + timeBonus, 0);
      
      console.log('[startNextRound] Configurando nova rodada:', {
        nextRoundNumber,
        timeBonus,
        newGlobalTime,
        prevIsCountingDown: currentState.isCountingDown
      });
      
      // ESTADO BASE COMUM (evita duplicação)
      const baseState = {
        clickedPosition: null,
        arrowPath: null,
        showFeedback: false, // CORREÇÃO: Garantir que feedback seja false
        feedbackOpacity: 0,
        feedbackProgress: 0, // CORREÇÃO: Resetar progresso da barra
        globalTimeLeft: newGlobalTime,
        roundTimeLeft: newGlobalTime,
        roundInitialTime: newGlobalTime,
        roundNumber: nextRoundNumber,
        isCountingDown: true, // CORREÇÃO: Timer deve começar imediatamente
        isPaused: false, // CORREÇÃO: Garantir que não esteja pausado
        timeBonus: 0
      };
      
      if (prev.gameMode === 'famous_places') {
        return {
          ...prev,
          ...baseState,
          currentNeighborhood: '',
          revealedNeighborhoods: new Set()
        };
      } else {
        // CORREÇÃO: Para modo bairros, selecionar novo bairro diretamente
        // Isso garante que o bairro mude no início de cada round
        console.log('[startNextRound] Modo bairros - selecionando novo bairro');
        console.log('[startNextRound] Bairro atual:', prev.currentNeighborhood);
        console.log('[startNextRound] GeoJSON features disponíveis:', geoJsonData?.features?.length || 0);
        
        if (geoJsonData && geoJsonData.features && geoJsonData.features.length > 0) {
          // Selecionar bairro aleatório diferente do atual
          const availableFeatures = geoJsonData.features.filter(
            (feature: any) => feature.properties?.NOME !== prev.currentNeighborhood
          );
          
          console.log('[startNextRound] Features disponíveis (excluindo atual):', availableFeatures.length);
          console.log('[startNextRound] Features filtradas:', availableFeatures.map((f: any) => f.properties?.NOME));
          
          if (availableFeatures.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableFeatures.length);
            const newNeighborhood = availableFeatures[randomIndex].properties?.NOME;
            
            console.log('[startNextRound] Novo bairro selecionado para modo bairros:', newNeighborhood);
            console.log('[startNextRound] Índice aleatório usado:', randomIndex);
            
            return {
              ...prev,
              ...baseState,
              currentNeighborhood: newNeighborhood || '',
              revealedNeighborhoods: new Set()
            };
          } else {
            console.log('[startNextRound] Nenhum bairro disponível diferente do atual - resetando lista');
            // Se não há bairros diferentes, resetar a lista de revelados
            const randomIndex = Math.floor(Math.random() * geoJsonData.features.length);
            const newNeighborhood = geoJsonData.features[randomIndex].properties?.NOME;
            
            console.log('[startNextRound] Bairro selecionado após reset:', newNeighborhood);
            
            return {
              ...prev,
              ...baseState,
              currentNeighborhood: newNeighborhood || '',
              revealedNeighborhoods: new Set()
            };
          }
        }
        
        // Fallback: manter bairro atual se não conseguir selecionar novo
        console.log('[startNextRound] Fallback: mantendo bairro atual para modo bairros');
        return {
          ...prev,
          ...baseState,
          revealedNeighborhoods: new Set()
        };
      }
    });
    
    console.log('[startNextRound] Nova rodada configurada - timer deve estar rodando');
  };

  const clearFeedbackTimer = () => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  };

  return {
    gameState,
    updateGameState,
    startGame,
    startNextRound,
    clearFeedbackTimer,
    feedbackTimerRef,
  };
}; 