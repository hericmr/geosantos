import { useRef, useState, useCallback, useEffect } from 'react';
import * as L from 'leaflet';
import { FeatureCollection } from 'geojson';
import { GameMode, FamousPlace } from '../types/famousPlaces';
import { useGameMode } from './modes/useGameMode';
import { useGameState } from './useGameState';

export const useMapGameRefactored = (
  geoJsonData: FeatureCollection | null,
  gameMode: GameMode = 'neighborhoods',
  currentFamousPlace: FamousPlace | null = null,
  externalPause: boolean = false
) => {
  // DEBUG: Verificar se geoJsonData está sendo passado corretamente
  console.log('[useMapGameRefactored] DEBUG - Hook inicializado com:', {
    geoJsonData: !!geoJsonData,
    gameMode,
    currentFamousPlace: !!currentFamousPlace,
    externalPause
  });

  // SISTEMA DE DEBOUNCE PARA MELHORAR PERFORMANCE
  const clickDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingClickRef = useRef(false);
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonRef = useRef<L.GeoJSON>(null) as React.RefObject<L.GeoJSON>;
  const audioRef = useRef<HTMLAudioElement>(null);
  const successSoundRef = useRef<HTMLAudioElement>(null);
  const errorSoundRef = useRef<HTMLAudioElement>(null);
  
  // Estados básicos
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [distanceCircle, setDistanceCircle] = useState<{ center: L.LatLng; radius: number } | null>(null);

  // Hook principal que gerencia os modos de jogo
  const {
    activeMode,
    activeGameHook,
    handleMapClick: modeHandleMapClick,
    updateTimer: modeUpdateTimer,
    startGame: modeStartGame,
    pauseGame: modePauseGame,
    resumeGame: modeResumeGame,
    endGame: modeEndGame,
    startNewRound: modeStartNewRound,
    selectRandomTarget: modeSelectRandomTarget,
    getCurrentGameState,
    getCurrentVisualFeedback,
    isGameActive,
    getCurrentScore,
    getCurrentRound,
    getRoundTimeLeft,
    getCurrentFeedback,
    getGameStats,
    getCurrentConfig
  } = useGameMode({
    gameMode,
    geoJsonData,
    famousPlaces: currentFamousPlace ? [currentFamousPlace] : [],
    config: {
      neighborhood: {
        roundTime: 10,
        maxRounds: 10,
        autoAdvance: true,
        showDistanceCircle: true,
        showArrow: true,
        soundEffects: true
      },
      famousPlaces: {
        roundTime: 15,
        maxRounds: 10,
        autoAdvance: false,
        showDistanceCircle: true,
        showArrow: true,
        soundEffects: true,
        distanceThreshold: 100,
        maxPlacesPerRound: 5
      }
    }
  });

  // Hook de estado do jogo (para compatibilidade)
  const {
    gameState,
    updateGameState,
    startGame: stateStartGame,
    startNextRound: stateStartNextRound,
    clearFeedbackTimer,
    feedbackTimerRef,
    timerManager,
    stateMachine,
    animationSystem
  } = useGameState(gameMode);

  // Função unificada para lidar com cliques no mapa
  const handleMapClick = useCallback((latlng: L.LatLng) => {
    // DEBOUNCE: Evitar múltiplos cliques simultâneos
    if (clickDebounceRef.current) {
      clearTimeout(clickDebounceRef.current);
    }
    
    if (isProcessingClickRef.current) {
      console.log('[useMapGameRefactored] Clique ignorado - ainda processando clique anterior');
      return;
    }
    
    // Marcar como processando
    isProcessingClickRef.current = true;
    
    // DEBUG: Log do estado atual para facilitar debug
    console.log('[useMapGameRefactored] Clique recebido:', {
      gameMode: activeMode,
      isActive: isGameActive(),
      roundNumber: getCurrentRound(),
      score: getCurrentScore()
    });
    
    try {
      // Delegar para o modo específico
      modeHandleMapClick(latlng);
      
      // Obter feedback visual do modo
      const visualFeedback = getCurrentVisualFeedback();
      
      // Configurar círculo de distância se necessário
      if (visualFeedback?.showDistanceCircle && visualFeedback.distanceCircleCenter) {
        setDistanceCircle({
          center: visualFeedback.distanceCircleCenter,
          radius: visualFeedback.distanceCircleRadius
        });
      } else {
        setDistanceCircle(null);
      }
      
      // Configurar seta se necessário
      if (visualFeedback?.showArrow && visualFeedback.arrowPath) {
        // Atualizar estado do jogo com a seta
        updateGameState({
          arrowPath: visualFeedback.arrowPath
        });
      }
      
      // Tocar sons baseado no feedback
      const feedback = getCurrentFeedback();
      if (feedback) {
        if (feedback.isPerfect && successSoundRef.current) {
          successSoundRef.current.currentTime = 0;
          successSoundRef.current.volume = 0.7;
          successSoundRef.current.play().catch(console.error);
        } else if (!feedback.isPerfect && errorSoundRef.current) {
          errorSoundRef.current.currentTime = 0;
          errorSoundRef.current.volume = 0.7;
          errorSoundRef.current.play().catch(console.error);
        }
      }
      
    } catch (error) {
      console.error('[useMapGameRefactored] Erro ao processar clique:', error);
    } finally {
      // Limpar flag de processamento após delay
      clickDebounceRef.current = setTimeout(() => {
        isProcessingClickRef.current = false;
      }, 100);
    }
  }, [
    activeMode,
    isGameActive,
    getCurrentRound,
    getCurrentScore,
    modeHandleMapClick,
    getCurrentVisualFeedback,
    getCurrentFeedback,
    updateGameState
  ]);

  // Função para atualizar timer
  const updateTimer = useCallback((timeLeft: number) => {
    // Delegar para o modo específico
    modeUpdateTimer(timeLeft);
    
    // Atualizar estado do jogo para compatibilidade
    updateGameState({
      roundTimeLeft: timeLeft
    });
  }, [modeUpdateTimer, updateGameState]);

  // Função para iniciar jogo
  const startGame = useCallback(() => {
    console.log('[useMapGameRefactored] Iniciando jogo no modo:', activeMode);
    
    // Delegar para o modo específico
    modeStartGame();
    
    // Atualizar estado do jogo para compatibilidade
    updateGameState({
      gameStarted: true,
      isCountingDown: true,
      roundNumber: 1,
      score: 0
    });
    
    // Iniciar estado do jogo
    stateStartGame();
  }, [activeMode, modeStartGame, updateGameState, stateStartGame]);

  // Função para pausar jogo
  const handlePauseGame = useCallback(() => {
    console.log('[useMapGameRefactored] Pausando jogo');
    
    // Delegar para o modo específico
    modePauseGame();
    
    // Atualizar estado do jogo para compatibilidade
    updateGameState({
      isPaused: true,
      isCountingDown: false
    });
    
    setIsPaused(true);
  }, [modePauseGame, updateGameState]);

  // Função para retomar jogo
  const handleResumeGame = useCallback(() => {
    console.log('[useMapGameRefactored] Retomando jogo');
    
    // Delegar para o modo específico
    modeResumeGame();
    
    // Atualizar estado do jogo para compatibilidade
    updateGameState({
      isPaused: false,
      isCountingDown: true
    });
    
    setIsPaused(false);
  }, [modeResumeGame, updateGameState]);

  // Função para próxima rodada
  const handleNextRound = useCallback((geoJsonData: FeatureCollection) => {
    console.log('[useMapGameRefactored] Próxima rodada');
    
    // Delegar para o modo específico
    modeStartNewRound();
    
    // Atualizar estado do jogo para compatibilidade
    stateStartNextRound(geoJsonData);
  }, [modeStartNewRound, stateStartNextRound]);

  // Função para iniciar jogo
  const handleStartGame = useCallback(() => {
    console.log('[useMapGameRefactored] Iniciando jogo');
    
    // Delegar para o modo específico
    modeStartGame();
    
    // Atualizar estado do jogo para compatibilidade
    stateStartGame();
  }, [modeStartGame, stateStartGame]);

  // Função para selecionar alvo aleatório
  const selectRandomTarget = useCallback(() => {
    console.log('[useMapGameRefactored] Selecionando alvo aleatório');
    
    // Delegar para o modo específico
    modeSelectRandomTarget();
  }, [modeSelectRandomTarget]);

  // Função para mudar volume
  const handleVolumeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.volume = parseFloat(event.target.value);
    }
  }, []);

  // Função para alternar mudo
  const handleToggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
    }
  }, []);

  // Efeito para sincronizar estados entre modo e estado do jogo
  useEffect(() => {
    if (isGameActive()) {
      const currentState = getCurrentGameState();
      const currentScore = getCurrentScore();
      const currentRound = getCurrentRound();
      const currentTimeLeft = getRoundTimeLeft();
      
      // Sincronizar estado do jogo
      updateGameState({
        score: currentScore,
        roundNumber: currentRound,
        roundTimeLeft: currentTimeLeft,
        isCountingDown: currentTimeLeft > 0
      });
    }
  }, [isGameActive, getCurrentGameState, getCurrentScore, getCurrentRound, getRoundTimeLeft, updateGameState]);

  // Efeito para lidar com pausa externa
  useEffect(() => {
    if (externalPause) {
      handlePauseGame();
    } else if (isGameActive()) {
      handleResumeGame();
    }
  }, [externalPause, handlePauseGame, handleResumeGame, isGameActive]);

  // Efeito para inicialização
  useEffect(() => {
    setIsLoading(false);
  }, []);

  return {
    // Referências
    mapRef,
    geoJsonRef,
    audioRef,
    successSoundRef,
    errorSoundRef,
    
    // Estados
    isLoading,
    isPaused,
    distanceCircle,
    
    // Estado do jogo (para compatibilidade)
    gameState,
    
    // Métodos principais
    handleMapClick,
    updateTimer,
    startGame,
    handlePauseGame,
    handleResumeGame,
    handleNextRound,
    handleStartGame,
    selectRandomTarget,
    
    // Métodos de áudio
    handleVolumeChange,
    handleToggleMute,
    
    // Métodos de estado
    updateGameState,
    clearFeedbackTimer,
    feedbackTimerRef,
    timerManager,
    stateMachine,
    animationSystem,
    
    // Métodos do modo ativo
    getCurrentGameState,
    getCurrentVisualFeedback,
    isGameActive,
    getCurrentScore,
    getCurrentRound,
    getRoundTimeLeft,
    getCurrentFeedback,
    getGameStats,
    getCurrentConfig,
    
    // Informações do modo
    activeMode,
    activeGameHook
  };
}; 