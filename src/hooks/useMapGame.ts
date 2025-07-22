import { useRef, useState } from 'react';
import * as L from 'leaflet';
import { FeatureCollection } from 'geojson';
import { calculateDistance, calculateScore, closestPointOnSegment } from '../utils/gameUtils';
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
  } = useGameState(gameMode);

  const handleMapClick = (latlng: L.LatLng) => {
    if (!gameState.gameStarted || !gameState.isCountingDown) return;

    const clickDuration = gameState.roundInitialTime - gameState.timeLeft;

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
      const acerto = distance <= 25; // raio de 25 metros para considerar acerto
      let feedbackMessage = '';
      let arrowPath: [L.LatLng, L.LatLng] | null = null;
      let score = 0;
      if (acerto) {
        score = 3000 * Math.pow(gameState.timeLeft / 10, 2); // bônus de acerto rápido
        feedbackMessage = 'Acertou!';
      } else {
        score = calculateScore(distance, gameState.timeLeft, 'famous_places').total;
        feedbackMessage = distance < 200 ? 'Quase lá!' : 'Tente novamente!';
        arrowPath = [latlng, targetLatLng];
      }
      const newScore = gameState.score + Math.round(score);
      setTimeout(() => {
        setTargetIconPosition(null); // Clear target icon after delay
        updateGameState({
          clickedPosition: latlng, // Set clickedPosition here
          clickTime: clickDuration,
          score: newScore,
          showFeedback: true,
          feedbackOpacity: 1,
          feedbackProgress: 100,
          feedbackMessage: feedbackMessage,
          gameOver: false,
          revealedNeighborhoods: acerto ? new Set([...gameState.revealedNeighborhoods, currentFamousPlace.name]) : gameState.revealedNeighborhoods,
          arrowPath: arrowPath,
          totalDistance: gameState.totalDistance + distance
        });
        if (successSoundRef.current && acerto) {
          successSoundRef.current.currentTime = 0;
          successSoundRef.current.play().catch(() => {});
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
        const score = 3000 * Math.pow(gameState.timeLeft / 10, 2);
        const newScore = gameState.score + Math.round(score);
        
        setTimeout(() => {
          setTargetIconPosition(null); // Clear target icon after delay
          updateGameState({
            clickedPosition: latlng, // Set clickedPosition here
            clickTime: clickDuration,
            score: newScore,
            showFeedback: true,
            feedbackOpacity: 1,
            feedbackProgress: 100,
            feedbackMessage: "",
            gameOver: false,
            revealedNeighborhoods: new Set([...gameState.revealedNeighborhoods, gameState.currentNeighborhood]),
            arrowPath: null,
            totalDistance: gameState.totalDistance
          });
          
          if (successSoundRef.current) {
            successSoundRef.current.currentTime = 0;
            successSoundRef.current.play().catch(() => {});
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
          ? 2500 * Math.pow(gameState.timeLeft / 15, 2)
          : calculateScore(distance, gameState.timeLeft).total;
        
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

        setTimeout(() => {
          setTargetIconPosition(null); // Clear target icon after delay
          const newTotalDistance = gameState.totalDistance + distance;
          updateGameState({
            clickedPosition: latlng, // Set clickedPosition here
            clickTime: clickDuration,
            score: newScore,
            showFeedback: true,
            feedbackOpacity: 1,
            feedbackProgress: 100,
            feedbackMessage: feedbackMessage,
            gameOver: newNegativeSum > 60 || newTotalDistance > 6000,
            revealedNeighborhoods: new Set([...gameState.revealedNeighborhoods, gameState.currentNeighborhood]),
            arrowPath: (!isCorrectNeighborhood && !isNearBorder) ? [latlng, closestPoint] : null,
            totalDistance: newTotalDistance
          });

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
      timeLeft: ROUND_TIME,
      isCountingDown: true,
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

  const handleStartGame = (selectedGameMode: GameMode) => {
    if (geoJsonData) {
      setShowPhaseOneMessage(true);
      setTimeout(() => {
        setShowPhaseOneMessage(false);
        startGame(selectedGameMode);
      }, 1000);
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