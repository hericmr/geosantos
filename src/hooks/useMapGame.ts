import { useRef, useState } from 'react';
import * as L from 'leaflet';
import { FeatureCollection } from 'geojson';
import { calculateDistance, calculateScore, closestPointOnSegment } from '../utils/gameUtils';
import { calculateTimeBonus } from '../utils/gameConstants';
import { useGameState } from './useGameState';
import { getFeedbackMessage, ROUND_TIME } from '../utils/gameConstants';
import { GameMode, FamousPlace } from '../types/famousPlaces';

// Função para verificar se um ponto está dentro de um polígono
const isPointInsidePolygon = (point: L.LatLng, polygon: L.LatLng[]): boolean => {
  const x = point.lng;
  const y = point.lat;
  
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    
    const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
};

export const useMapGame = (
  geoJsonData: FeatureCollection | null,
  gameMode: GameMode = 'neighborhoods',
  currentFamousPlace: FamousPlace | null = null,
  externalPause: boolean = false
) => {
  // SISTEMA DE DEBOUNCE PARA MELHORAR PERFORMANCE
  const clickDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingClickRef = useRef(false);
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonRef = useRef<L.GeoJSON>(null) as React.RefObject<L.GeoJSON>;
  const audioRef = useRef<HTMLAudioElement>(null);
  const successSoundRef = useRef<HTMLAudioElement>(null);
  const errorSoundRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [negativeScoreSum, setNegativeScoreSum] = useState(0);
  const [showPhaseOneMessage, setShowPhaseOneMessage] = useState(false);
  const [distanceCircle, setDistanceCircle] = useState<{ center: L.LatLng; radius: number } | null>(null);
  
  const {
    gameState,
    updateGameState,
    startGame,
    startNextRound,
    clearFeedbackTimer,
    feedbackTimerRef
  } = useGameState(externalPause);

  const handleMapClick = (latlng: L.LatLng) => {
    // DEBOUNCE: Evitar múltiplos cliques simultâneos
    if (clickDebounceRef.current) {
      clearTimeout(clickDebounceRef.current);
    }
    
    if (isProcessingClickRef.current) {
      console.log('[useMapGame] Clique ignorado - ainda processando clique anterior');
      return;
    }
    
    // DEBUG: Log do estado atual para facilitar debug
    console.log('[useMapGame] Clique recebido:', {
      gameStarted: gameState.gameStarted,
      isCountingDown: gameState.isCountingDown,
      roundNumber: gameState.roundNumber,
      gameMode: gameState.gameMode,
      showFeedback: gameState.showFeedback,
      isPaused: gameState.isPaused
    });
    
    if (!gameState.gameStarted || !gameState.isCountingDown) {
      console.log('[useMapGame] Clique ignorado - jogo não iniciado ou não contando');
      return;
    }

    // Marcar como processando
    isProcessingClickRef.current = true;
    
    const clickDuration = gameState.roundInitialTime - gameState.roundTimeLeft;

    // FUNÇÃO PARA LIMPAR TODOS OS TIMERS ANTES DE INICIAR NOVOS
    const clearAllTimers = () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
    };

    // Limpar todos os timers existentes antes de iniciar novos
    clearAllTimers();

    // Pausa a barra de tempo imediatamente após o clique
    updateGameState({
      isCountingDown: false,
      isPaused: true
    });

    // Primeiro, apenas atualiza a posição da bandeira
    // setTargetIconPosition(latlng); // REMOVIDO

    // NOVA LÓGICA PARA MODO LUGARES FAMOSOS
    if (gameMode === 'famous_places' && currentFamousPlace) {
      const targetLatLng = L.latLng(currentFamousPlace.latitude, currentFamousPlace.longitude);
      const distance = calculateDistance(latlng, targetLatLng);
      
      // Sistema de pontuação competitivo similar ao modo bairros
      const distanceKm = distance / 1000;
      let score = 0;
      let feedbackMessage = '';
      let arrowPath: [L.LatLng, L.LatLng] | null = null;
      let isCorrectPlace = false;
      
      // Critérios de acerto: dentro de 100 metros (0.1km)
      if (distanceKm <= 0.1) {
        isCorrectPlace = true;
        // Pontuação base para acerto: 2000 pontos
        const baseScore = 2000;
        // Bônus de tempo: até 1000 pontos se tempo < 5s
        const timeBonus = gameState.roundTimeLeft <= 5 ? Math.round((gameState.roundTimeLeft / 5) * 1000) : 0;
        score = baseScore + timeBonus;
        feedbackMessage = `Acertou! ${currentFamousPlace.name}`;
      } else {
        // Pontuação baseada na distância (máx 1500 pontos para 0.1km, 0 pontos para >=3km)
        const distanceScore = Math.max(0, 1500 * (1 - (distanceKm / 3)));
        // Bônus de tempo: até 500 pontos se tempo < 5s
        const timeBonus = gameState.roundTimeLeft <= 5 ? Math.round((gameState.roundTimeLeft / 5) * 500) : 0;
        score = distanceScore + timeBonus;
        
        // Feedback baseado na distância
        if (distanceKm < 0.5) {
          feedbackMessage = 'Quase lá! Continue tentando!';
        } else if (distanceKm < 1) {
          feedbackMessage = 'Está no caminho certo!';
        } else if (distanceKm < 2) {
          feedbackMessage = 'Ainda longe, mas continue!';
        } else {
          feedbackMessage = 'Muito longe! Tente novamente!';
        }
        
        // Mostrar seta para o local correto
        arrowPath = [latlng, targetLatLng];
      }
      
      const newScore = gameState.score + Math.round(score);
      
      // Calcular tempo gasto na rodada e bônus de tempo para próxima rodada
      const timeSpent = clickDuration;
      const timeBonus = calculateTimeBonus(score, gameMode);
      const newGlobalTime = Math.max(gameState.globalTimeLeft - timeSpent, 0);
      const isGameOver = newGlobalTime <= 0;
      
      // NOVA LÓGICA SIMPLIFICADA PARA FEEDBACK
      const handleFeedbackSequence = () => {
        // 1. ÁUDIO + ESTADO (imediato)
        if (successSoundRef.current && (isCorrectPlace || distance <= 500)) {
          successSoundRef.current.currentTime = 0;
          successSoundRef.current.volume = 0.7;
          successSoundRef.current.play().catch((error) => {
            console.log('Erro ao tocar som de sucesso:', error);
          });
        }
        
        if (errorSoundRef.current && !isCorrectPlace && distance >= 700) {
          errorSoundRef.current.currentTime = 0;
          errorSoundRef.current.volume = 0.7;
          errorSoundRef.current.play().catch((error) => {
            console.log('Erro ao tocar som de erro:', error);
          });
        }
        
        // Atualizar estado do jogo imediatamente
        updateGameState({
          clickedPosition: latlng,
          clickTime: clickDuration,
          score: newScore,
          globalTimeLeft: newGlobalTime,
          timeBonus: timeBonus,
          gameOver: isGameOver,
          showFeedback: true,
          feedbackOpacity: 1,
          feedbackProgress: 100,
          feedbackMessage: feedbackMessage,
          revealedNeighborhoods: isCorrectPlace ? new Set([...gameState.revealedNeighborhoods, currentFamousPlace.name]) : gameState.revealedNeighborhoods,
          arrowPath: arrowPath,
          totalDistance: gameState.totalDistance + distance
        });
        
        // 2. DISTANCE CIRCLE (CORREÇÃO: Reduzir tempo para 400ms para sincronizar melhor)
        if (!isCorrectPlace) {
          setTimeout(() => {
            setDistanceCircle({
              center: latlng,
              radius: distance
            });
          }, 400); // CORREÇÃO: Reduzido de 727ms para 400ms
        }
        
        // 3. PRÓXIMA RODADA (CORREÇÃO: Ajustar tempo para 800ms para ser mais consistente)
        setTimeout(() => {
          // CORREÇÃO: Restaurar isCountingDown para true automaticamente
          // para permitir cliques na nova rodada sem aguardar botão
          console.log('[useMapGame] Restaurando isCountingDown para true (modo lugares famosos)');
          updateGameState({
            isCountingDown: true, // CORREÇÃO: Restaurar estado de clique
            feedbackProgress: 100,
            feedbackOpacity: 1
          });
          
          // Modo lugares famosos sempre aguarda clique do botão
          console.log('[useMapGame] Modo lugares famosos - aguardando clique do botão próximo');
        }, 800); // CORREÇÃO: Ajustado de 500ms para 800ms para ser mais consistente
      };
      
              // Executar sequência de feedback
        handleFeedbackSequence();
        
        // Reset do flag de processamento após delay
        setTimeout(() => {
          isProcessingClickRef.current = false;
        }, 100);
        
        return;
      }

    if (geoJsonRef.current) {
      let targetLayer: L.Layer | null = null;
      let clickedFeature: any = null;
      let clickedNeighborhood: string | null = null;

      // Primeiro, encontramos o bairro alvo
      const layers = geoJsonRef.current.getLayers();
      layers.forEach((layer: L.Layer) => {
        const feature = (layer as any).feature;
        
        try {
          if (feature.properties?.NOME === gameState.currentNeighborhood) {
            targetLayer = layer;
          }
        } catch (error) {
          // Silently handle error
        }
      });

      // Depois, verificamos se o clique foi dentro de algum bairro
      layers.forEach((layer: L.Layer) => {
        const feature = (layer as any).feature;
        const polygon = layer as L.Polygon;
        
        try {
          if (polygon.getBounds().contains(latlng)) {
            if (feature.properties?.NOME === gameState.currentNeighborhood) {
              clickedNeighborhood = feature.properties?.NOME;
              if (layer instanceof L.Polygon) {
                const containsPoint = isPointInsidePolygon(latlng, (layer as L.Polygon).getLatLngs()[0] as L.LatLng[]);
                if (containsPoint) {
                  clickedNeighborhood = feature.properties?.NOME;
                }
              }
            } else {
              if (!clickedNeighborhood) {
                clickedNeighborhood = feature.properties?.NOME;
              }
            }
          }
        } catch (error) {
          // Silently handle error
        }
      });

      const isCorrectNeighborhood = clickedNeighborhood === gameState.currentNeighborhood;
      
      if (isCorrectNeighborhood) {
        const distance = 0;
        const score = 3000 * Math.pow(gameState.roundTimeLeft / 10, 2);
        const newScore = gameState.score + Math.round(score);
        
        // Calcular tempo gasto na rodada e bônus de tempo para próxima rodada
        const timeSpent = clickDuration;
        const timeBonus = calculateTimeBonus(score, gameMode);
        const newGlobalTime = Math.max(gameState.globalTimeLeft - timeSpent, 0);
        const isGameOver = newGlobalTime <= 0;
        
        setTimeout(() => {
          // setTargetIconPosition(null); // REMOVIDO
          
          if (successSoundRef.current) {
            successSoundRef.current.currentTime = 0;
            successSoundRef.current.volume = 0.7; // Definir volume adequado
            successSoundRef.current.play().catch((error) => {
              console.log('Erro ao tocar som de sucesso:', error);
            });
          }
          
          // ATUALIZAR ESTADO DO JOGO EXATAMENTE NO MESMO MOMENTO DO ÁUDIO
          updateGameState({
            clickedPosition: latlng, // Set clickedPosition here
            clickTime: clickDuration,
            score: newScore,
            globalTimeLeft: newGlobalTime,
            timeBonus: timeBonus, // Armazenar bônus para próxima rodada
            gameOver: isGameOver,
            showFeedback: true,
            feedbackOpacity: 1,
            feedbackProgress: 100,
            feedbackMessage: "",
            revealedNeighborhoods: new Set([...gameState.revealedNeighborhoods, gameState.currentNeighborhood]),
            arrowPath: null,
            totalDistance: gameState.totalDistance
          });
          
          // CORREÇÃO: Removido progressInterval conflitante
          // O progresso agora é gerenciado de forma unificada acima
        }, 0);
        
        return;
      }
      
      if (targetLayer) {
        const polygon = targetLayer as L.Polygon;
        const latLngs = polygon.getLatLngs()[0] as L.LatLng[];
        
        let minDistance = Infinity;
        let closestPoint: L.LatLng = latlng;
        
        for (let i = 0; i < latLngs.length; i++) {
          const p1 = latLngs[i];
          const p2 = latLngs[(i + 1) % latLngs.length];
          
          const point = closestPointOnSegment(latlng, p1 as L.LatLng, p2 as L.LatLng);
          const distance = calculateDistance(latlng, point);
          
          if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
          }
        }
        
        const distance = minDistance;
        const isNearBorder = distance < 10;
        
        const score = isNearBorder
          ? 2500 * Math.pow(gameState.roundTimeLeft / 15, 2)
          : calculateScore(distance, gameState.roundTimeLeft).total;
        
        const newScore = gameState.score + Math.round(score);
        
        const newNegativeSum = score < 0 ? negativeScoreSum + Math.abs(score) : negativeScoreSum;
        setNegativeScoreSum(newNegativeSum);
        
        const circleToShow = (!isCorrectNeighborhood && !isNearBorder) ? {
          center: latlng,
          radius: distance
        } : null;
        
        let feedbackMessage = "";
        if (!isNearBorder) {
          feedbackMessage = getFeedbackMessage(distance);
        }

        // Tocar som de erro se não acertou o bairro E a distância for >= 700m
        if (errorSoundRef.current && !isCorrectNeighborhood && distance >= 700) {
          errorSoundRef.current.currentTime = 0;
          errorSoundRef.current.volume = 0.7; // Definir volume adequado
          errorSoundRef.current.play().catch((error) => {
            console.log('Erro ao tocar som de erro:', error);
          });
        }

        // Tocar som de sucesso se a distância for <= 500m (mesmo que não tenha acertado o bairro)
        if (successSoundRef.current && distance <= 500) {
          successSoundRef.current.currentTime = 0;
          successSoundRef.current.volume = 0.7; // Definir volume adequado
          successSoundRef.current.play().catch((error) => {
            console.log('Erro ao tocar som de sucesso:', error);
          });
        }

        // Calcular tempo gasto na rodada e bônus de tempo para próxima rodada
        const timeSpent = clickDuration;
        const timeBonus = calculateTimeBonus(score, gameMode);
        const newGlobalTime = Math.max(gameState.globalTimeLeft - timeSpent, 0);
        const newTotalDistance = gameState.totalDistance + distance;
        const isGameOverByTime = newGlobalTime <= 0;
        const isGameOverByScore = newNegativeSum > 60 || newTotalDistance > 6000;
        const isGameOver = isGameOverByTime || isGameOverByScore;
        
        // NOVA LÓGICA SIMPLIFICADA PARA MODO BAIRROS
        const handleNeighborhoodFeedback = () => {
          // 1. ÁUDIO + ESTADO (imediato)
          if (isGameOver && errorSoundRef.current) {
            errorSoundRef.current.currentTime = 0;
            errorSoundRef.current.volume = 0.7;
            errorSoundRef.current.play().catch((error) => {
              console.log('Erro ao tocar game over:', error);
            });
          }
          
          // Atualizar estado do jogo imediatamente
          updateGameState({
            clickedPosition: latlng,
            clickTime: clickDuration,
            score: newScore,
            globalTimeLeft: newGlobalTime,
            timeBonus: timeBonus,
            showFeedback: true,
            feedbackOpacity: 1,
            feedbackProgress: 100,
            feedbackMessage: feedbackMessage,
            gameOver: isGameOver,
            revealedNeighborhoods: new Set([...gameState.revealedNeighborhoods, gameState.currentNeighborhood]),
            arrowPath: (!isCorrectNeighborhood && !isNearBorder) ? [latlng, closestPoint] : null,
            totalDistance: newTotalDistance
          });

          if (newNegativeSum > 50) {
            return;
          }
          
          // 2. DISTANCE CIRCLE (CORREÇÃO: Reduzir tempo para 400ms para sincronizar melhor)
          if (circleToShow) {
            setTimeout(() => {
              setDistanceCircle(circleToShow);
            }, 400); // CORREÇÃO: Reduzido de 727ms para 400ms
          }
          
          // 3. PROGRESS BAR UNIFICADO (CORREÇÃO: Lógica simplificada sem conflitos)
          setTimeout(() => {
            // CORREÇÃO: Restaurar isCountingDown para true automaticamente
            // para permitir cliques na nova rodada
            console.log('[useMapGame] Restaurando isCountingDown para true (modo bairros)');
            updateGameState({
              isCountingDown: true // CORREÇÃO: Restaurar estado de clique
            });
            
            // CORREÇÃO: Aguardar clique do botão "Próximo" em vez de avançar automaticamente
            // Isso evita conflitos com handleNextRound
            console.log('[useMapGame] Modo bairros - aguardando clique do botão próximo');
          }, 300); // CORREÇÃO: Reduzido de 1000ms para 300ms
        };
        
        // Executar sequência de feedback para modo bairros
        handleNeighborhoodFeedback();
        
        // Reset do flag de processamento após delay
        setTimeout(() => {
          isProcessingClickRef.current = false;
        }, 100);
      }
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    updateGameState({ volume: newVolume });
    if (newVolume > 0) {
      updateGameState({ isMuted: false });
    }
  };

  const handleToggleMute = () => {
    updateGameState({ isMuted: !gameState.isMuted });
  };

  const handlePauseGame = () => {
    setIsPaused(true);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    updateGameState({
      isCountingDown: false,
      isPaused: true
    });
  };

  const handleNextRound = (geoJsonData: FeatureCollection) => {
    console.log('[handleNextRound] Iniciando próxima rodada, estado atual:', {
      isCountingDown: gameState.isCountingDown,
      gameStarted: gameState.gameStarted,
      gameOver: gameState.gameOver,
      roundNumber: gameState.roundNumber
    });
    
    setIsPaused(false);
    if (audioRef.current && gameState.gameStarted && !gameState.gameOver && !gameState.isMuted) {
      audioRef.current.play();
    }

    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // CORREÇÃO: Restaurar isCountingDown para true imediatamente
    // para permitir cliques na nova rodada
    console.log('[useMapGame] Restaurando isCountingDown para true (handleNextRound)');
    updateGameState({
      isPaused: false,
      isCountingDown: true, // CORREÇÃO: Restaurar estado de clique
      showFeedback: false,
      feedbackOpacity: 0,
      feedbackProgress: 0, // CORREÇÃO: Resetar para 0 para nova rodada
      clickedPosition: null,
      arrowPath: null,
      revealedNeighborhoods: new Set()
    });

    console.log('[handleNextRound] Estado após updateGameState:', {
      isCountingDown: gameState.isCountingDown,
      showFeedback: gameState.showFeedback
    });

    startNextRound(geoJsonData);
  };

  const handleStartGame = () => {
    console.log('[handleStartGame] Função chamada');
    if (geoJsonData) {
      console.log('[handleStartGame] GeoJSON data disponível, iniciando jogo');
      setShowPhaseOneMessage(true);
      setTimeout(() => {
        setShowPhaseOneMessage(false);
        startGame();
      }, 1000);
    } else {
      console.log('[handleStartGame] GeoJSON data não disponível');
    }
  };

  return {
    mapRef,
    geoJsonRef,
    audioRef,
    successSoundRef,
    errorSoundRef,
    isLoading,
    isPaused,
    showPhaseOneMessage,
    distanceCircle,
    gameState,
    handleMapClick,
    handleVolumeChange,
    handleToggleMute,
    handlePauseGame,
    handleNextRound,
    handleStartGame,
    setDistanceCircle,
    updateGameState,
    gameMode
  };
}; 