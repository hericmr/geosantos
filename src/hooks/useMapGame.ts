import { useRef, useState } from 'react';
import * as L from 'leaflet';
import { FeatureCollection } from 'geojson';
import { calculateDistance, calculateScore, closestPointOnSegment } from '../utils/gameUtils';
import { getFeedbackMessage, ROUND_TIME, calculateTimeBonus } from '../utils/gameConstants';
import { 
  FEEDBACK_BAR_DURATION, 
  FEEDBACK_BAR_UPDATE_INTERVAL, 
  FEEDBACK_BAR_PROGRESS_INCREMENT 
} from '../constants/game';
import { GameMode, FamousPlace } from '../types/famousPlaces';
import { useGameState } from './useGameState';

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
  // DEBUG: Verificar se geoJsonData está sendo passado corretamente
  console.log('[useMapGame] DEBUG - Hook inicializado com:', {
    geoJsonData: !!geoJsonData,
    gameMode,
    currentFamousPlace: !!currentFamousPlace,
    externalPause
  });
  // SISTEMA DE DEBOUNCE PARA MELHORAR PERFORMANCE
  const clickDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingClickRef = useRef(false);
  const isAutoAdvancingRef = useRef(false); // CORREÇÃO: Proteção contra avanço automático duplo
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonRef = useRef<L.GeoJSON>(null) as React.RefObject<L.GeoJSON>;
  const audioRef = useRef<HTMLAudioElement>(null);
  const successSoundRef = useRef<HTMLAudioElement>(null);
  const errorSoundRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackProgressIntervalRef = useRef<NodeJS.Timeout | null>(null); // NOVA REF para controlar a barra de progresso
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
    console.log('[useMapGame]  CLIQUE NO MAPA DETECTADO - Iniciando processamento...');
    console.log('[useMapGame] 📍 Coordenadas do clique:', latlng.lat, latlng.lng);
    console.log('[useMapGame] 🎮 Estado atual do jogo:', {
      gameStarted: gameState.gameStarted,
      isCountingDown: gameState.isCountingDown,
      showFeedback: gameState.showFeedback,
      gameMode,
      currentFamousPlace: !!currentFamousPlace
    });
    
    // NOVA PROTEÇÃO: Evitar múltiplos cliques simultâneos
    if (isProcessingClickRef.current) {
      console.log('[useMapGame] ⚠️ Clique ignorado - já processando clique anterior');
      return;
    }
    
    if (!gameState.gameStarted || !gameState.isCountingDown) {
      console.log('[useMapGame] ❌ Clique ignorado - jogo não iniciado ou não contando');
      console.log('[useMapGame] DEBUG - Condições não atendidas:', {
        gameStarted: gameState.gameStarted,
        isCountingDown: gameState.isCountingDown,
        showFeedback: gameState.showFeedback
      });
      return;
    }

    console.log('[useMapGame] ✅ Clique processado - condições atendidas, iniciando processamento');
    
    // Marcar como processando
    isProcessingClickRef.current = true;
    
    // DEBOUNCE: Definir timeout para resetar o flag após um delay
    clickDebounceRef.current = setTimeout(() => {
      isProcessingClickRef.current = false;
    }, 100);

    // CORREÇÃO: Sempre resetar a flag de avanço automático no início de cada clique
    isAutoAdvancingRef.current = false;
    console.log('[useMapGame] DEBUG - Flag isAutoAdvancing resetada para false no início do clique');

    // Calcular tempo gasto na rodada
    const clickDuration = Math.max(0, gameState.roundInitialTime - gameState.roundTimeLeft);
    
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
      // CORREÇÃO: Limpar também os intervalos de progresso locais
      // Isso será feito automaticamente quando as funções de feedback terminarem
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
    console.log('[useMapGame] 🔍 VERIFICANDO MODO DE JOGO:', {
      gameMode,
      currentFamousPlace: !!currentFamousPlace,
      condition: gameMode === 'famous_places' && currentFamousPlace
    });
    
    if (gameMode === 'famous_places' && currentFamousPlace) {
      console.log('[useMapGame] 🏛️ MODO LUGARES FAMOSOS - Executando handleFeedbackSequence');
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
          feedbackProgress: 0, // CORREÇÃO: Iniciar em 0 para animação progressiva
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
        
        // 3. BARRA DE PROGRESSO + PRÓXIMA RODADA AUTOMÁTICA
        // CORREÇÃO: Implementar barra de progresso regressiva de 100% a 0%
        let progress = 100; // CORREÇÃO: Começar em 100%
        console.log('[useMapGame]  INICIANDO BARRA DE PROGRESSO - Progresso inicial:', progress, '%');
        
        // CORREÇÃO: Garantir que o feedbackProgress comece em 100
        updateGameState({
          feedbackProgress: 100
        });
        console.log('[useMapGame] ✅ Estado inicial definido - feedbackProgress: 100%');
        
        // CORREÇÃO: Armazenar referência do intervalo para limpeza adequada
        feedbackProgressIntervalRef.current = setInterval(() => {
          console.log('[useMapGame] 🔄 INTERVALO EXECUTANDO - Estado atual:', {
            progress,
            isPaused: gameState.isPaused,
            showFeedback: gameState.showFeedback,
            feedbackProgress: gameState.feedbackProgress
          });
          
          // NOVA FUNCIONALIDADE: Verificar se o jogo está pausado
          if (gameState.isPaused) {
            console.log('[useMapGame] ⏸️ BARRA PAUSADA - Jogo está pausado, retornando...');
            return;
          }
          
          progress -= 3.33; // CORREÇÃO: Decrementar 3.33% a cada 100ms = 0% em 3 segundos
          console.log('[useMapGame] 📉 PROGRESSO DECREMENTADO - Novo valor:', progress.toFixed(2), '%');
          
          if (progress <= 0) {
            progress = 0;
            console.log('[useMapGame]  PROGRESSO CHEGOU A 0% - Iniciando sequência de avanço automático');
            
            // CORREÇÃO: Atualizar o estado para 0% antes de limpar o intervalo
            updateGameState({
              feedbackProgress: 0
            });
            console.log('[useMapGame] ✅ Estado atualizado para 0%');
            
            if (feedbackProgressIntervalRef.current) {
              clearInterval(feedbackProgressIntervalRef.current);
              feedbackProgressIntervalRef.current = null;
              console.log('[useMapGame] 🧹 INTERVALO LIMPO - setInterval removido');
            }
            console.log('[useMapGame] DEBUG - setInterval limpo, progresso chegou a 0%');
            
            // CORREÇÃO: Avançar automaticamente para próxima rodada após 3 segundos
            console.log('[useMapGame] 🚀 BARRA COMPLETA - Executando startNextRound automaticamente');
            console.log('[useMapGame] DEBUG - geoJsonData:', !!geoJsonData, 'isAutoAdvancing:', isAutoAdvancingRef.current);
            
            // NOVA PROTEÇÃO: Verificar se já não está avançando automaticamente
            if (isAutoAdvancingRef.current) {
              console.log('[useMapGame] ⚠️ JÁ ESTÁ AVANÇANDO - Flag isAutoAdvancing ativa, ignorando chamada');
              return;
            }
            
            // NOVA PROTEÇÃO: Verificar se o estado visual ainda está ativo
            // CORREÇÃO: A verificação estava incorreta, bloqueando o avanço automático
            // if (!gameState.showFeedback && gameState.feedbackProgress === 0) {
            //   console.log('[useMapGame] ⚠️ ESTADO VISUAL LIMPO - showFeedback false e feedbackProgress 0, ignorando avanço');
            //   return;
            // }
            
            console.log('[useMapGame] ✅ Estado visual ativo - permitindo avanço automático');
            
            // Marcar como avançando automaticamente
            isAutoAdvancingRef.current = true;
            console.log('[useMapGame] 🚩 FLAG ATIVADA - isAutoAdvancing definido como true');
            
            // CORREÇÃO: Remover delay de 500ms para avançar em exatamente 3 segundos
            // Avançar imediatamente quando a barra chegar a 0%
            console.log('[useMapGame] 🚀 EXECUTANDO AVANÇO IMEDIATO - Chamando startNextRound...');
            // CORREÇÃO: Sempre verificar se geoJsonData está disponível e avançar
            if (geoJsonData) {
              console.log('[useMapGame] ✅ geoJsonData DISPONÍVEL - Iniciando próxima rodada automaticamente');
              startNextRound(geoJsonData);
            } else {
              console.log('[useMapGame] ❌ geoJsonData NÃO DISPONÍVEL - Resetando flag isAutoAdvancing');
              // Resetar flag se não conseguir avançar
              isAutoAdvancingRef.current = false;
            }
          } else {
            console.log('[useMapGame]  ATUALIZANDO ESTADO - Progresso:', progress.toFixed(2), '%');
            updateGameState({
              feedbackProgress: progress
            });
            console.log('[useMapGame] ✅ Estado atualizado com sucesso');
          }
        }, 100); // Atualizar a cada 100ms para animação suave
        
        console.log('[useMapGame]  INTERVALO CRIADO - setInterval configurado para executar a cada 100ms');
      };
      
      // Executar sequência de feedback
      handleFeedbackSequence();
      
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
            feedbackProgress: 0, // CORREÇÃO: Iniciar em 0 para animação progressiva
            feedbackMessage: "",
            revealedNeighborhoods: new Set([...gameState.revealedNeighborhoods, gameState.currentNeighborhood]),
            arrowPath: null,
            totalDistance: gameState.totalDistance
          });
          
          // CORREÇÃO: Implementar barra de progresso para quando acerta o bairro
          let progress = 100; // CORREÇÃO: Começar em 100% para contagem regressiva
          console.log('[useMapGame] 🏘️ INICIANDO BARRA DE PROGRESSO (BAIRROS) - Progresso inicial:', progress, '%');
          
          // CORREÇÃO: Garantir que o feedbackProgress comece em 100
          updateGameState({
            feedbackProgress: 100
          });
          console.log('[useMapGame] ✅ Estado inicial definido (BAIRROS) - feedbackProgress: 100%');
          
          feedbackProgressIntervalRef.current = setInterval(() => {
            console.log('[useMapGame] 🔄 INTERVALO EXECUTANDO (BAIRROS) - Estado atual:', {
              progress,
              isPaused: gameState.isPaused,
              showFeedback: gameState.showFeedback,
              feedbackProgress: gameState.feedbackProgress
            });
            
            // NOVA FUNCIONALIDADE: Verificar se o jogo está pausado
            if (gameState.isPaused) {
              console.log('[useMapGame] ⏸️ BARRA PAUSADA (BAIRROS) - Jogo está pausado, retornando...');
              return;
            }
            
            progress -= 3.33; // CORREÇÃO: Decrementar 3.33% a cada 100ms = 0% em 3 segundos
            console.log('[useMapGame] 📉 PROGRESSO DECREMENTADO (BAIRROS) - Novo valor:', progress.toFixed(2), '%');
            
            if (progress <= 0) {
              progress = 0;
              console.log('[useMapGame]  PROGRESSO CHEGOU A 0% (BAIRROS) - Iniciando sequência de avanço automático');
              
              // CORREÇÃO: Atualizar o estado para 0% antes de limpar o intervalo
              updateGameState({
                feedbackProgress: 0
              });
              console.log('[useMapGame] ✅ Estado atualizado para 0% (BAIRROS)');
              
              if (feedbackProgressIntervalRef.current) {
                clearInterval(feedbackProgressIntervalRef.current);
                feedbackProgressIntervalRef.current = null;
                console.log('[useMapGame] 🧹 INTERVALO LIMPO (BAIRROS) - setInterval removido');
              }
              console.log('[useMapGame] DEBUG - setInterval limpo, progresso chegou a 0% (acertou bairro)');
              
              // CORREÇÃO: Executar startNextRound automaticamente quando barra chega ao fim
              console.log('[useMapGame]  BARRA COMPLETA (BAIRROS) - Executando startNextRound automaticamente');
              
              // NOVA PROTEÇÃO: Verificar se já não está avançando automaticamente
              if (isAutoAdvancingRef.current) {
                console.log('[useMapGame] ⚠️ JÁ ESTÁ AVANÇANDO (BAIRROS) - Flag isAutoAdvancing ativa, ignorando chamada');
                return;
              }
              
              // CORREÇÃO: Remover verificação problemática que estava bloqueando o avanço
              console.log('[useMapGame] ✅ Estado visual ativo - permitindo avanço automático');
              
              // Marcar como avançando automaticamente
              isAutoAdvancingRef.current = true;
              console.log('[useMapGame]  FLAG ATIVADA (BAIRROS) - isAutoAdvancing definido como true');
              
              // CORREÇÃO: Executar startNextRound imediatamente quando barra chega a 0%
              if (geoJsonData) {
                console.log('[useMapGame] ✅ geoJsonData DISPONÍVEL (BAIRROS) - Iniciando próxima rodada automaticamente');
                startNextRound(geoJsonData);
              } else {
                console.log('[useMapGame] ❌ geoJsonData NÃO DISPONÍVEL (BAIRROS) - Resetando flag isAutoAdvancing');
                // Resetar flag se não conseguir avançar
                isAutoAdvancingRef.current = false;
              }
            } else {
              console.log('[useMapGame]  ATUALIZANDO ESTADO (BAIRROS) - Progresso:', progress.toFixed(2), '%');
              updateGameState({
                feedbackProgress: progress
              });
              console.log('[useMapGame] ✅ Estado atualizado com sucesso (BAIRROS)');
            }
          }, 100); // CORREÇÃO: Usar 100ms ao invés de FEEDBACK_BAR_UPDATE_INTERVAL para consistência
          
          console.log('[useMapGame]  INTERVALO CRIADO (BAIRROS) - setInterval configurado para executar a cada 100ms');
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
        
        // NOVA LÓGICA UNIFICADA PARA MODO BAIRROS (acertos e erros)
        const handleNeighborhoodFeedback = () => {
          console.log('[useMapGame] 🏘️ INICIANDO FEEDBACK UNIFICADO (BAIRROS) - Acerto:', isCorrectNeighborhood);
          
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
            feedbackProgress: 100, // CORREÇÃO: Sempre começar em 100% para contagem regressiva
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
          
          // 3. BARRA DE PROGRESSO UNIFICADA + PRÓXIMA RODADA AUTOMÁTICA
          // CORREÇÃO: Barra de progresso regressiva de 100% a 0% em 3 segundos
          let progress = 100; // CORREÇÃO: Sempre começar em 100%
          console.log('[useMapGame] 🏘️ INICIANDO BARRA DE PROGRESSO UNIFICADA (BAIRROS) - Progresso inicial:', progress, '%');
          
          // CORREÇÃO: Armazenar referência do intervalo para limpeza adequada
          feedbackProgressIntervalRef.current = setInterval(() => {
            console.log('[useMapGame] 🔄 INTERVALO EXECUTANDO (BAIRROS) - Estado atual:', {
              progress,
              isPaused: gameState.isPaused,
              showFeedback: gameState.showFeedback,
              feedbackProgress: gameState.feedbackProgress
            });
            
            // NOVA FUNCIONALIDADE: Verificar se o jogo está pausado
            if (gameState.isPaused) {
              console.log('[useMapGame] ⏸️ BARRA PAUSADA (BAIRROS) - Jogo está pausado, retornando...');
              return;
            }
            
            progress -= 3.33; // CORREÇÃO: Decrementar 3.33% a cada 100ms = 0% em 3 segundos
            console.log('[useMapGame] 📉 PROGRESSO DECREMENTADO (BAIRROS) - Novo valor:', progress.toFixed(2), '%');
            
            if (progress <= 0) {
              progress = 0;
              console.log('[useMapGame] PROGRESSO CHEGOU A 0% (BAIRROS) - Iniciando sequência de avanço automático');
              
              // CORREÇÃO: Atualizar o estado para 0% antes de limpar o intervalo
              updateGameState({
                feedbackProgress: 0
              });
              console.log('[useMapGame] ✅ Estado atualizado para 0% (BAIRROS)');
              
              if (feedbackProgressIntervalRef.current) {
                clearInterval(feedbackProgressIntervalRef.current);
                feedbackProgressIntervalRef.current = null;
                console.log('[useMapGame] 🧹 INTERVALO LIMPO (BAIRROS) - setInterval removido');
              }
              console.log('[useMapGame] DEBUG - setInterval limpo, progresso chegou a 0% (modo bairros)');
              
              // CORREÇÃO: Executar startNextRound automaticamente quando barra chega ao fim
              console.log('[useMapGame] BARRA COMPLETA (BAIRROS) - Executando startNextRound automaticamente');
              
              // NOVA PROTEÇÃO: Verificar se já não está avançando automaticamente
              if (isAutoAdvancingRef.current) {
                console.log('[useMapGame] ⚠️ JÁ ESTÁ AVANÇANDO (BAIRROS) - Flag isAutoAdvancing ativa, ignorando chamada');
                return;
              }
              
              // CORREÇÃO: Remover verificação problemática que estava bloqueando o avanço
              console.log('[useMapGame] ✅ Estado visual ativo - permitindo avanço automático');
              
              // Marcar como avançando automaticamente
              isAutoAdvancingRef.current = true;
              console.log('[useMapGame] FLAG ATIVADA (BAIRROS) - isAutoAdvancing definido como true');
              
              // CORREÇÃO: Executar startNextRound imediatamente quando barra chega a 0%
              if (geoJsonData) {
                console.log('[useMapGame] ✅ geoJsonData DISPONÍVEL (BAIRROS) - Iniciando próxima rodada automaticamente');
                startNextRound(geoJsonData);
              } else {
                console.log('[useMapGame] ❌ geoJsonData NÃO DISPONÍVEL (BAIRROS) - Resetando flag isAutoAdvancing');
                // Resetar flag se não conseguir avançar
                isAutoAdvancingRef.current = false;
              }
            } else {
              console.log('[useMapGame] ATUALIZANDO ESTADO (BAIRROS) - Progresso:', progress.toFixed(2), '%');
              updateGameState({
                feedbackProgress: progress
              });
              console.log('[useMapGame] ✅ Estado atualizado com sucesso (BAIRROS)');
            }
          }, 100); // CORREÇÃO: Usar 100ms para consistência
          
          console.log('[useMapGame] INTERVALO CRIADO (BAIRROS) - setInterval configurado para executar a cada 100ms');
        };
        
        // Executar sequência de feedback para modo bairros
        handleNeighborhoodFeedback();
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
    console.log('[handlePauseGame] Pausando jogo...');
    setIsPaused(true);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    // NOVA FUNCIONALIDADE: Pausar a barra de progresso do feedback
    if (feedbackProgressIntervalRef.current) {
      console.log('[handlePauseGame] Pausando barra de progresso do feedback');
      clearInterval(feedbackProgressIntervalRef.current);
      feedbackProgressIntervalRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    updateGameState({
      isCountingDown: false,
      isPaused: true
    });
    console.log('[handlePauseGame] Jogo pausado com sucesso');
  };

  const handleResumeGame = () => {
    console.log('[handleResumeGame] Retomando jogo...');
    setIsPaused(false);
    if (audioRef.current && gameState.gameStarted && !gameState.gameOver && !gameState.isMuted) {
      audioRef.current.play();
    }
    updateGameState({
      isCountingDown: true,
      isPaused: false
    });
    
    // NOVA FUNCIONALIDADE: Retomar a barra de progresso do feedback
    if (gameState.showFeedback && gameState.feedbackProgress < 100) {
      console.log('[handleResumeGame] Retomando barra de progresso do feedback');
      resumeFeedbackProgress();
    }
    console.log('[handleResumeGame] Jogo retomado com sucesso');
  };

  // NOVA FUNÇÃO: Retomar a barra de progresso do feedback
  const resumeFeedbackProgress = () => {
    if (!gameState.showFeedback || gameState.feedbackProgress <= 0) return; // CORREÇÃO: <= 0 ao invés de >= 100
    
    // NOVA PROTEÇÃO: Evitar múltiplas execuções simultâneas
    if (feedbackProgressIntervalRef.current) {
      console.log('[resumeFeedbackProgress] Já existe um intervalo ativo, ignorando chamada');
      return;
    }
    
    const currentProgress = gameState.feedbackProgress;
    const remainingProgress = currentProgress; // CORREÇÃO: Não subtrair de 100
    const timePerIncrement = FEEDBACK_BAR_UPDATE_INTERVAL;
    const increment = FEEDBACK_BAR_PROGRESS_INCREMENT;
    
    console.log('[resumeFeedbackProgress] Retomando barra de progresso regressiva:', {
      currentProgress,
      remainingProgress,
      increment
    });
    
    // Recriar o intervalo para continuar de onde parou
    feedbackProgressIntervalRef.current = setInterval(() => {
      if (gameState.isPaused) {
        // Se o jogo foi pausado novamente, parar
        if (feedbackProgressIntervalRef.current) {
          clearInterval(feedbackProgressIntervalRef.current);
          feedbackProgressIntervalRef.current = null;
        }
        return;
      }
      
      const newProgress = Math.max(gameState.feedbackProgress - increment, 0); // CORREÇÃO: Decrementar ao invés de incrementar
      
      if (newProgress <= 0) { // CORREÇÃO: <= 0 ao invés de >= 100
        // Progresso completo (chegou a 0%)
        if (feedbackProgressIntervalRef.current) {
          clearInterval(feedbackProgressIntervalRef.current);
          feedbackProgressIntervalRef.current = null;
        }
        
        console.log('[resumeFeedbackProgress] Progresso completo (0%) - avançando para próxima rodada');
        
        // Avançar para próxima rodada
        if (geoJsonData) {
          startNextRound(geoJsonData);
        }
      } else {
        updateGameState({
          feedbackProgress: newProgress
        });
      }
    }, timePerIncrement);
  };

  const handleNextRound = (geoJsonData: FeatureCollection) => {
    // NOVA PROTEÇÃO: Evitar execuções múltiplas simultâneas
    if (isAutoAdvancingRef.current) {
      console.log('[handleNextRound] Já está processando próxima rodada, ignorando chamada');
      return;
    }
    
    // Marcar como processando
    isAutoAdvancingRef.current = true;
    
    console.log('[handleNextRound] Iniciando próxima rodada, estado atual:', {
      isCountingDown: gameState.isCountingDown,
      gameStarted: gameState.gameStarted,
      gameOver: gameState.gameOver,
      roundNumber: gameState.roundNumber
    });
    
    // CORREÇÃO CRÍTICA: Resetar flag de avanço automático
    isAutoAdvancingRef.current = false;
    console.log('[handleNextRound] DEBUG - Flag isAutoAdvancing resetada para false');
    
    // CORREÇÃO CRÍTICA: Pausar áudio e limpar todos os timers ANTES de qualquer mudança
    setIsPaused(false);
    if (audioRef.current && gameState.gameStarted && !gameState.gameOver && !gameState.isMuted) {
      audioRef.current.play();
    }

    // CORREÇÃO CRÍTICA: Limpar TODOS os timers e intervalos ANTES de mudar o estado
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // NOVA FUNCIONALIDADE: Limpar a barra de progresso do feedback
    if (feedbackProgressIntervalRef.current) {
      clearInterval(feedbackProgressIntervalRef.current);
      feedbackProgressIntervalRef.current = null;
    }

    // CORREÇÃO CRÍTICA: Sincronização COMPLETA do estado visual
    // Atualizar TODOS os elementos visuais simultaneamente
    console.log('[handleNextRound] CORREÇÃO CRÍTICA - Sincronizando estado visual completo');
    
    // CORREÇÃO: Garantir que o estado visual seja limpo completamente
    const cleanStateUpdate = {
      isPaused: false,
      isCountingDown: true, // CORREÇÃO: Restaurar estado de clique
      showFeedback: false, // CORREÇÃO CRÍTICA: Remover feedback imediatamente
      feedbackOpacity: 0, // CORREÇÃO CRÍTICA: Resetar opacidade
      feedbackProgress: 0, // CORREÇÃO CRÍTICA: Resetar progresso para 0
      clickedPosition: null, // CORREÇÃO CRÍTICA: Limpar posição clicada
      arrowPath: null, // CORREÇÃO CRÍTICA: Limpar seta
      revealedNeighborhoods: new Set<string>() // CORREÇÃO CRÍTICA: Resetar bairros revelados
    };
    
    console.log('[handleNextRound] Estado a ser aplicado:', cleanStateUpdate);
    
    updateGameState(cleanStateUpdate);

    console.log('[handleNextRound] Estado visual sincronizado - aguardando startNextRound');

    // CORREÇÃO CRÍTICA: Aguardar um frame para garantir que o estado visual seja atualizado
    // antes de chamar startNextRound
    requestAnimationFrame(() => {
      console.log('[handleNextRound] Executando startNextRound após sincronização visual');
      
      // Chamar startNextRound do useGameState para iniciar nova rodada
      startNextRound(geoJsonData);
      
      console.log('[handleNextRound] Nova rodada iniciada - timer deve estar rodando');
    });
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
    handleResumeGame,
    handleNextRound,
    handleStartGame,
    setDistanceCircle,
    updateGameState,
    gameMode
  };
}; 