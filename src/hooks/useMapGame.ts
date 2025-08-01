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
  setTargetIconPosition: React.Dispatch<React.SetStateAction<L.LatLng | null>>
) => {
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
  } = useGameState();

  const handleMapClick = (latlng: L.LatLng) => {
    if (!gameState.gameStarted || !gameState.isCountingDown) return;

    const clickDuration = gameState.roundInitialTime - gameState.roundTimeLeft;

    // Pausa a barra de tempo imediatamente após o clique
    updateGameState({
      isCountingDown: false,
      isPaused: true
    });

    // Primeiro, apenas atualiza a posição da bandeira
    setTargetIconPosition(latlng);

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
      const timeBonus = calculateTimeBonus(score);
      const newGlobalTime = Math.max(gameState.globalTimeLeft - timeSpent, 0);
      const isGameOver = newGlobalTime <= 0;
      
      // Atualizar estado do jogo
      setTimeout(() => {
        setTargetIconPosition(null);
        updateGameState({
          clickedPosition: latlng,
          clickTime: clickDuration,
          score: newScore,
          globalTimeLeft: newGlobalTime,
          timeBonus: timeBonus, // Armazenar bônus para próxima rodada
          gameOver: isGameOver,
          showFeedback: true,
          feedbackOpacity: 1,
          feedbackProgress: 100,
          feedbackMessage: feedbackMessage,
          revealedNeighborhoods: isCorrectPlace ? new Set([...gameState.revealedNeighborhoods, currentFamousPlace.name]) : gameState.revealedNeighborhoods,
          arrowPath: arrowPath,
          totalDistance: gameState.totalDistance + distance
        });
        
        // Tocar som de sucesso se acertou OU se a distância for <= 500m
        if (successSoundRef.current && (isCorrectPlace || distance <= 500)) {
          successSoundRef.current.currentTime = 0;
          successSoundRef.current.volume = 0.7; // Definir volume adequado
          successSoundRef.current.play().catch((error) => {
            console.log('Erro ao tocar som de sucesso:', error);
          });
        }
        
        // Tocar som de erro se não acertou E a distância for >= 700m
        if (errorSoundRef.current && !isCorrectPlace && distance >= 700) {
          errorSoundRef.current.currentTime = 0;
          errorSoundRef.current.volume = 0.7; // Definir volume adequado
          errorSoundRef.current.play().catch((error) => {
            console.log('Erro ao tocar som de erro:', error);
          });
        }
        
        // Mostrar círculo de distância se não acertou
        if (!isCorrectPlace) {
          setTimeout(() => {
            setDistanceCircle({
              center: latlng,
              radius: distance
            });
          }, 200);
        }
        
        // Lógica de próxima rodada
        setTimeout(() => {
          const duration = 4000;
          const interval = 100;
          let timeElapsed = 0;
          
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          
          // Se acertou, verificar o modo de jogo
          if (isCorrectPlace) {
            if (gameMode === 'famous_places') {
              // Modo lugares famosos: manter progresso em 100 e aguardar clique do botão
              console.log('[useMapGame] Modo lugares famosos - aguardando clique do botão próximo');
              updateGameState({
                feedbackProgress: 100,
                feedbackOpacity: 1
              });
            } else {
              // Modo bairros: avançar automaticamente
              progressIntervalRef.current = setInterval(() => {
                timeElapsed += interval;
                const remainingProgress = Math.max(0, 100 * (1 - timeElapsed / duration));
                updateGameState({ 
                  feedbackProgress: remainingProgress,
                  feedbackOpacity: remainingProgress / 100
                });
                
                if (timeElapsed >= duration) {
                  console.log('[useMapGame] Modo bairros - avançando automaticamente');
                  if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                  }
                  startNextRound(geoJsonData!);
                  return;
                }
              }, interval);
              
              feedbackTimerRef.current = setTimeout(() => {
                if (progressIntervalRef.current) {
                  clearInterval(progressIntervalRef.current);
                  progressIntervalRef.current = null;
                }
                startNextRound(geoJsonData!);
              }, duration);
            }
          } else {
            // Se não acertou, verificar o modo de jogo
            if (gameMode === 'famous_places') {
              // Modo lugares famosos: manter progresso em 100 e aguardar clique do botão
              console.log('[useMapGame] Modo lugares famosos - erro, aguardando clique do botão próximo');
              updateGameState({
                feedbackProgress: 100,
                feedbackOpacity: 1
              });
            } else {
              // Modo bairros: permitir mais tentativas até o tempo acabar
              progressIntervalRef.current = setInterval(() => {
                timeElapsed += interval;
                const remainingProgress = Math.max(0, 100 * (1 - timeElapsed / duration));
                updateGameState({ 
                  feedbackProgress: remainingProgress,
                  feedbackOpacity: remainingProgress / 100
                });
                
                if (timeElapsed >= duration) {
                  console.log('[useMapGame] Progresso chegou a 0 (erro), verificando se deve avançar ou permitir nova tentativa');
                  if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                  }
                  // Verificar se o tempo da rodada acabou
                  if (gameState.roundTimeLeft <= 0) {
                    console.log('[useMapGame] Tempo da rodada acabou, avançando para próxima rodada');
                    startNextRound(geoJsonData!);
                  } else {
                    console.log('[useMapGame] Permitindo nova tentativa');
                    // Resetar feedback para permitir nova tentativa
                    updateGameState({
                      showFeedback: false,
                      feedbackOpacity: 0,
                      arrowPath: null
                    });
                  }
                  return;
                }
              }, interval);
              
              feedbackTimerRef.current = setTimeout(() => {
                if (progressIntervalRef.current) {
                  clearInterval(progressIntervalRef.current);
                  progressIntervalRef.current = null;
                }
                // Verificar se o tempo da rodada acabou
                if (gameState.roundTimeLeft <= 0) {
                  startNextRound(geoJsonData!);
                } else {
                  // Resetar feedback para permitir nova tentativa
                  updateGameState({
                    showFeedback: false,
                    feedbackOpacity: 0,
                    arrowPath: null
                  });
                }
              }, duration);
            }
          }
        }, 1000);
      }, 200);
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
        const timeBonus = calculateTimeBonus(score);
        const newGlobalTime = Math.max(gameState.globalTimeLeft - timeSpent, 0);
        const isGameOver = newGlobalTime <= 0;
        
        setTimeout(() => {
          setTargetIconPosition(null); // Clear target icon after delay
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
          
          if (successSoundRef.current) {
            successSoundRef.current.currentTime = 0;
            successSoundRef.current.volume = 0.7; // Definir volume adequado
            successSoundRef.current.play().catch((error) => {
              console.log('Erro ao tocar som de sucesso:', error);
            });
          }
          
          setTimeout(() => {
            const duration = 4000;
            const interval = 100;
            let timeElapsed = 0;
            
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
            }
            
            progressIntervalRef.current = setInterval(() => {
              timeElapsed += interval;
              const progress = 100 - (timeElapsed / duration * 100);
              
              if (progress <= 0) {
                console.log('[useMapGame] Progresso chegou a 0 (modo bairros), avançando automaticamente para próxima rodada');
                if (progressIntervalRef.current) {
                  clearInterval(progressIntervalRef.current);
                }
                
                handleNextRound(geoJsonData!);
                return;
              }
              
              updateGameState({
                feedbackProgress: progress,
                feedbackOpacity: progress / 100
              });
            }, interval);
          }, 1000);
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
        const timeBonus = calculateTimeBonus(score);
        const newGlobalTime = Math.max(gameState.globalTimeLeft - timeSpent, 0);
        const newTotalDistance = gameState.totalDistance + distance;
        const isGameOverByTime = newGlobalTime <= 0;
        const isGameOverByScore = newNegativeSum > 60 || newTotalDistance > 6000;
        const isGameOver = isGameOverByTime || isGameOverByScore;
        
        setTimeout(() => {
          setTargetIconPosition(null); // Clear target icon after delay
          
          updateGameState({
            clickedPosition: latlng, // Set clickedPosition here
            clickTime: clickDuration,
            score: newScore,
            globalTimeLeft: newGlobalTime,
            timeBonus: timeBonus, // Armazenar bônus para próxima rodada
            showFeedback: true,
            feedbackOpacity: 1,
            feedbackProgress: 100,
            feedbackMessage: feedbackMessage,
            gameOver: isGameOver,
            revealedNeighborhoods: new Set([...gameState.revealedNeighborhoods, gameState.currentNeighborhood]),
            arrowPath: (!isCorrectNeighborhood && !isNearBorder) ? [latlng, closestPoint] : null,
            totalDistance: newTotalDistance
          });

          // Tocar som de erro se o jogo terminou
          if (isGameOver && errorSoundRef.current) {
            errorSoundRef.current.currentTime = 0;
            errorSoundRef.current.volume = 0.7; // Definir volume adequado
            errorSoundRef.current.play().catch((error) => {
              console.log('Erro ao tocar som de game over:', error);
            });
          }

          if (newNegativeSum > 50) {
            return;
          }
          
          setTimeout(() => {
            const duration = 4000;
            const interval = 100;
            let timeElapsed = 0;
            
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
            }
            
            progressIntervalRef.current = setInterval(() => {
              timeElapsed += interval;
              const remainingProgress = Math.max(0, 100 * (1 - timeElapsed / duration));
              updateGameState({ feedbackProgress: remainingProgress });
              
              if (timeElapsed >= duration) {
                console.log('[useMapGame] Progresso chegou a 0 (modo bairros - erro), avançando automaticamente para próxima rodada');
                if (progressIntervalRef.current) {
                  clearInterval(progressIntervalRef.current);
                  progressIntervalRef.current = null;
                }
                startNextRound(geoJsonData!);
              }
            }, interval);
            
            feedbackTimerRef.current = setTimeout(() => {
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
              }
              startNextRound(geoJsonData!);
            }, duration);
          }, 300);

          setTimeout(() => {
            setDistanceCircle(circleToShow);
          }, 200);
        }, 200);
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

    updateGameState({
      roundInitialTime: ROUND_TIME,
      roundTimeLeft: ROUND_TIME,
      isPaused: false,
      showFeedback: false,
      feedbackOpacity: 0,
      feedbackProgress: 100,
      clickedPosition: null,
      arrowPath: null,
      revealedNeighborhoods: new Set()
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