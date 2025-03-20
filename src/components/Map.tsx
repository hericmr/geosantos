import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, GeoJSON as ReactGeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { FeatureCollection } from 'geojson';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

import { MapProps } from '../types/game';
import { useGameState } from '../hooks/useGameState';
import { calculateDistance, calculateScore, closestPointOnSegment } from '../utils/gameUtils';
import { getProgressBarColor, getFeedbackMessage, FASE_1_BAIRROS, PHASE_TWO_TIME } from '../utils/gameConstants';

import { AudioControls } from './ui/AudioControls';
import { GameControls } from './ui/GameControls';
import { FeedbackPanel } from './ui/FeedbackPanel';
import { ScoreDisplay } from './ui/ScoreDisplay';
import { MapEvents } from './game/MapEvents';
import { GeoJSONLayer } from './game/GeoJSONLayer';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Create custom icon for bandeira2
const bandeira2Icon = new L.Icon({
  iconUrl: 'https://github.com/hericmr/jogocaicara/raw/refs/heads/main/public/assets/images/bandeira2.png',
  iconSize: [70, 70],
  iconAnchor: [30, 60],
  popupAnchor: [0, -50],
  className: 'bandeira-marker'
});

const Map: React.FC<MapProps> = ({ center, zoom }) => {
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonRef = useRef<L.GeoJSON>(null) as React.RefObject<L.GeoJSON>;
  const audioRef = useRef<HTMLAudioElement>(null);
  const successSoundRef = useRef<HTMLAudioElement>(null);
  const errorSoundRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [negativeScoreSum, setNegativeScoreSum] = useState(0);
  const [isPhaseTwo, setIsPhaseTwo] = useState(false);
  const [showPhaseTwoIntro, setShowPhaseTwoIntro] = useState(false);
  const [showPhaseOneMessage, setShowPhaseOneMessage] = useState(false);
  const PHASE_TWO_SCORE = 10000;
  const [distanceCircle, setDistanceCircle] = useState<{ center: L.LatLng; radius: number } | null>(null);
  
  const {
    gameState,
    updateGameState,
    startGame,
    startNextRound,
    clearFeedbackTimer,
    feedbackTimerRef
  } = useGameState();

  useEffect(() => {
    setIsLoading(true);
    fetch('https://raw.githubusercontent.com/hericmr/jogocaicara/refs/heads/main/public/data/bairros.geojson')
      .then(response => response.json())
      .then(data => {
        setGeoJsonData(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = gameState.isMuted ? 0 : gameState.volume;
      audioRef.current.loop = true;
    }
  }, [gameState.volume, gameState.isMuted]);

  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver && audioRef.current) {
      audioRef.current.play();
    } else if (gameState.gameOver && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [gameState.gameStarted, gameState.gameOver]);

  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver && gameState.timeLeft <= 0) {
      updateGameState({
        gameOver: true,
        showFeedback: true,
        feedbackOpacity: 1,
        feedbackProgress: 100,
        feedbackMessage: "Tempo esgotado!"
      });
    }
  }, [gameState.timeLeft, gameState.gameStarted, gameState.gameOver]);

  useEffect(() => {
    if (mapRef.current && distanceCircle) {
      // Limpa círculos anteriores
      mapRef.current.eachLayer((layer: L.Layer) => {
        if (layer instanceof L.Circle) {
          mapRef.current?.removeLayer(layer);
        }
      });

      // Desenha o novo círculo
      const circle = L.circle(distanceCircle.center, {
        radius: 0, // Começa com raio 0
        color: '#ff6b6b', // Vermelho mais suave
        fillColor: '#ff6b6b',
        fillOpacity: 0.05, // Opacidade reduzida
        weight: 1.5, // Borda mais fina
        className: 'distance-circle'
      }).addTo(mapRef.current);

      // Espera a animação da bandeira terminar (0.3s) antes de começar a animação do círculo
      setTimeout(() => {
        // Animação do círculo
        const startTime = Date.now();
        const duration = 500; // 0.5 segundos
        const targetRadius = distanceCircle.radius;

        const animate = () => {
          const currentTime = Date.now();
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Função de easing para suavizar a animação
          const easeOutCubic = 1 - Math.pow(1 - progress, 3);
          const currentRadius = targetRadius * easeOutCubic;

          circle.setRadius(currentRadius);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // Remove o círculo após a animação
            setTimeout(() => {
              if (mapRef.current) {
                mapRef.current.removeLayer(circle);
                setDistanceCircle(null);
              }
            }, 500); // Espera 0.5 segundos antes de remover
          }
        };

        animate();
      }, 300); // Espera 0.3 segundos (duração da animação da bandeira)
    }
  }, [distanceCircle]);

  const selectRandomNeighborhood = (data: FeatureCollection) => {
    const features = data.features;
    let availableFeatures = features;

    // Se não estiver na fase 2, filtra apenas os bairros da fase 1
    if (!isPhaseTwo) {
      availableFeatures = features.filter(feature => 
        FASE_1_BAIRROS.includes(feature.properties?.NOME)
      );
    }

    const randomIndex = Math.floor(Math.random() * availableFeatures.length);
    const neighborhood = availableFeatures[randomIndex].properties?.NOME;
    updateGameState({ currentNeighborhood: neighborhood });
  };

  const handleStartGame = () => {
    if (geoJsonData) {
      setShowPhaseOneMessage(true);
      setTimeout(() => {
        setShowPhaseOneMessage(false);
        startGame();
        selectRandomNeighborhood(geoJsonData);
        setIsPhaseTwo(false);
      }, 3000); // Mensagem some após 3 segundos
    }
  };

  const handleMapClick = (latlng: L.LatLng) => {
    if (!gameState.gameStarted || !gameState.isCountingDown) return;

    const clickDuration = 10 - gameState.timeLeft;

    // Pausa a barra de tempo imediatamente após o clique
    updateGameState({
      isCountingDown: false,
      isPaused: true
    });

    // Primeiro, apenas atualiza a posição da bandeira
    updateGameState({ clickedPosition: latlng });

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
            clickedNeighborhood = feature.properties?.NOME;
          }
        } catch (error) {
          // Silently handle error
        }
      });

      // Se encontramos o bairro alvo, calculamos a distância até o ponto mais próximo
      if (targetLayer) {
        const polygon = targetLayer as L.Polygon;
        const latLngs = polygon.getLatLngs()[0] as L.LatLng[];
        
        // Encontra o ponto mais próximo do polígono
        let minDistance = Infinity;
        let closestPoint: L.LatLng = latlng;
        
        // Para cada segmento do polígono
        for (let i = 0; i < latLngs.length; i++) {
          const p1 = latLngs[i];
          const p2 = latLngs[(i + 1) % latLngs.length];
          
          // Calcula o ponto mais próximo no segmento
          const point = closestPointOnSegment(latlng, p1 as L.LatLng, p2 as L.LatLng);
          const distance = calculateDistance(latlng, point);
          
          if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
          }
        }
        
        const distance = minDistance;
        const isNearBorder = distance < 100;
        const isCorrectNeighborhood = clickedNeighborhood === gameState.currentNeighborhood;
        
        // Toca o som de feedback apropriado
        if (successSoundRef.current && errorSoundRef.current) {
          if (isCorrectNeighborhood || isNearBorder) {
            successSoundRef.current.currentTime = 0;
            successSoundRef.current.play();
          } else {
            errorSoundRef.current.currentTime = 0;
            errorSoundRef.current.play();
          }
        }
        
        // Se acertou o bairro correto ou está muito próximo da borda, dá pontuação máxima
        const score = (isCorrectNeighborhood || isNearBorder)
          ? (isNearBorder ? 2000 : 1000) * Math.pow(gameState.timeLeft / 10, 2) // Aplica multiplicador de tempo mesmo no acerto
          : calculateScore(distance, gameState.timeLeft).total;
        
        const newScore = gameState.score + Math.round(score);
        
        // Verifica se o jogador atingiu a pontuação para a fase 2
        if (newScore >= PHASE_TWO_SCORE && !isPhaseTwo) {
          setIsPhaseTwo(true);
          setShowPhaseTwoIntro(true);
          updateGameState({
            showFeedback: false,
            feedbackOpacity: 0,
            feedbackProgress: 0
          });
        }
        
        // Atualiza a soma de pontos negativos se o score for negativo
        const newNegativeSum = score < 0 ? negativeScoreSum + Math.abs(score) : negativeScoreSum;
        setNegativeScoreSum(newNegativeSum);
        
        // Desenha um círculo indicando a distância até o ponto correto
        const circleToShow = (!isCorrectNeighborhood && !isNearBorder) ? {
          center: latlng,
          radius: distance
        } : null;
        
        // Mensagem de feedback personalizada baseada no tipo de acerto
        let feedbackMessage = "";
        if (isNearBorder) {
          feedbackMessage = "";
        } else if (isCorrectNeighborhood) {
          feedbackMessage = "";
        } else {
          feedbackMessage = getFeedbackMessage(distance);
        }

        // Atualiza o resto do estado após um pequeno delay
        setTimeout(() => {
          updateGameState({
            clickTime: clickDuration,
            score: newScore,
            showFeedback: true,
            feedbackOpacity: 1,
            feedbackProgress: 100,
            feedbackMessage: feedbackMessage,
            gameOver: newNegativeSum > 40,
            revealedNeighborhoods: new Set([...gameState.revealedNeighborhoods, gameState.currentNeighborhood])
          });

          if (newNegativeSum > 40) {
            // Se for game over, não inicia próxima rodada
            return;
          }
          
          setTimeout(() => {
            const duration = 4000;
            const interval = 100;
            let timeElapsed = 0;
            
            // Limpa qualquer intervalo anterior
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
                startNextRound(geoJsonData);
              }
            }, interval);
            
            feedbackTimerRef.current = setTimeout(() => {
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
              }
              startNextRound(geoJsonData);
            }, duration);
          }, 300);

          // Mostra o círculo após um pequeno delay para garantir que a bandeira já foi fincada
          setTimeout(() => {
            setDistanceCircle(circleToShow);
          }, 100);
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
    // Pausa a barra de tempo
    updateGameState({
      isCountingDown: false,
      isPaused: true
    });
  };

  const handleNextRound = (geoJsonData: FeatureCollection) => {
    // Reseta o estado de pausa ao iniciar nova rodada
    setIsPaused(false);
    if (audioRef.current && gameState.gameStarted && !gameState.gameOver && !gameState.isMuted) {
      audioRef.current.play();
    }

    // Limpa o timer de feedback se existir
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }

    // Limpa o intervalo da barra de progresso se existir
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Define o tempo inicial da rodada
    const newInitialTime = isPhaseTwo ? PHASE_TWO_TIME : 10;
    updateGameState({
      roundInitialTime: newInitialTime,
      timeLeft: newInitialTime,
      isCountingDown: true,
      isPaused: false
    });

    // Reseta o estado do feedback
    updateGameState({
      showFeedback: false,
      feedbackOpacity: 0,
      feedbackProgress: 0,
      clickedPosition: null,
      arrowPath: null,
      revealedNeighborhoods: new Set()
    });

    // Pequeno delay para garantir que o estado foi limpo
    setTimeout(() => {
      // Inicia a próxima rodada
      startNextRound(geoJsonData);
    }, 100);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <style>
        {`
          .bandeira-marker {
            animation: plantBandeira 0.3s ease-out;
            transform-origin: bottom center;
            z-index: 1000;
          }
          
          @keyframes plantBandeira {
            0% {
              transform: scale(0.1) translateY(50px);
              opacity: 0;
            }
            50% {
              transform: scale(1.2) translateY(-5px);
              opacity: 1;
            }
            100% {
              transform: scale(1) translateY(0);
              opacity: 1;
            }
          }

          /* Forçar cursor crosshair em todos os elementos do mapa */
          .leaflet-container,
          .leaflet-container *,
          .leaflet-interactive,
          .leaflet-interactive * {
            cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='1' fill='%23000000'/%3E%3Cline x1='16' y1='2' x2='16' y2='8' stroke='%23000000' stroke-width='2'/%3E%3Cline x1='16' y1='24' x2='16' y2='30' stroke='%23000000' stroke-width='2'/%3E%3Cline x1='2' y1='16' x2='8' y2='16' stroke='%23000000' stroke-width='2'/%3E%3Cline x1='24' y1='16' x2='30' y2='16' stroke='%23000000' stroke-width='2'/%3E%3C/svg%3E") 16 16, crosshair !important;
            touch-action: none !important;
          }

          /* Ajustes para dispositivos móveis */
          @media (max-width: 768px) {
            .leaflet-container {
              touch-action: none !important;
            }

            .leaflet-control-container {
              display: none;
            }
          }

          /* Melhorias de acessibilidade */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          }

          /* Melhor contraste para textos */
          .game-text {
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
          }

          /* Indicador de foco melhorado */
          *:focus {
            outline: 3px solid #32CD32;
            outline-offset: 2px;
          }

          /* Loading spinner */
          .loading-spinner {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2000;
            background: rgba(0, 0, 0, 0.8);
            padding: 20px;
            border-radius: 10px;
            color: white;
            text-align: center;
          }

          @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          }

          @keyframes popInOut {
            0% { 
              opacity: 0; 
              transform: translate(-50%, -50%) scale(0.5);
            }
            20% { 
              opacity: 1; 
              transform: translate(-50%, -50%) scale(1.2);
            }
            40% { 
              opacity: 1; 
              transform: translate(-50%, -50%) scale(1);
            }
            60% { 
              opacity: 1; 
              transform: translate(-50%, -50%) scale(1);
            }
            80% { 
              opacity: 0.8; 
              transform: translate(-50%, -50%) scale(0.9);
            }
            100% { 
              opacity: 0; 
              transform: translate(-50%, -50%) scale(0.8);
            }
          }

          @keyframes pulseText {
            0% { 
              transform: scale(1);
            }
            50% { 
              transform: scale(1.03);
            }
            100% { 
              transform: scale(1);
            }
          }
        `}
      </style>
      
      <audio ref={audioRef} src="https://github.com/hericmr/jogocaicara/raw/refs/heads/main/public/assets/audio/musica.ogg" preload="auto" />
      <audio ref={successSoundRef} src="https://github.com/hericmr/jogocaicara/raw/refs/heads/main/public/assets/audio/success.mp3" preload="auto" />
      <audio ref={errorSoundRef} src="https://github.com/hericmr/jogocaicara/raw/refs/heads/main/public/assets/audio/error.mp3" preload="auto" />
      
      {isLoading && (
        <div className="loading-spinner" role="alert">
          <p>Carregando o jogo...</p>
        </div>
      )}

      {gameState.gameStarted && (
        <ScoreDisplay score={gameState.score} />
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
        ref={mapRef}
      >
        <MapEvents onClick={handleMapClick} />
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        {gameState.clickedPosition && (
          <Marker
            position={gameState.clickedPosition}
            icon={bandeira2Icon}
          />
        )}
        {gameState.arrowPath && (
          <Polyline
            positions={gameState.arrowPath}
            color="#FF0000"
            weight={3}
            opacity={0.8}
            dashArray="10, 10"
            className="arrow-path"
          />
        )}
        {geoJsonData && (
          <GeoJSONLayer
            geoJsonData={geoJsonData}
            revealedNeighborhoods={gameState.revealedNeighborhoods}
            currentNeighborhood={gameState.currentNeighborhood}
            onMapClick={handleMapClick}
            geoJsonRef={geoJsonRef}
          />
        )}
      </MapContainer>

      {gameState.gameStarted && (
        <AudioControls
          isMuted={gameState.isMuted}
          volume={gameState.volume}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
        />
      )}

      <GameControls
        gameStarted={gameState.gameStarted}
        currentNeighborhood={gameState.currentNeighborhood}
        timeLeft={gameState.timeLeft}
        totalTimeLeft={gameState.totalTimeLeft}
        roundNumber={gameState.roundNumber}
        roundInitialTime={gameState.roundInitialTime}
        score={gameState.score}
        onStartGame={handleStartGame}
        getProgressBarColor={getProgressBarColor}
      />

      {gameState.showFeedback && (
        <FeedbackPanel
          showFeedback={gameState.showFeedback}
          clickedPosition={gameState.clickedPosition}
          arrowPath={gameState.arrowPath}
          clickTime={gameState.clickTime}
          feedbackProgress={gameState.feedbackProgress}
          onNextRound={handleNextRound}
          calculateDistance={calculateDistance}
          calculateScore={calculateScore}
          getProgressBarColor={getProgressBarColor}
          geoJsonData={geoJsonData}
          gameOver={gameState.gameOver}
          onPauseGame={handlePauseGame}
          score={gameState.score}
          currentNeighborhood={gameState.currentNeighborhood}
        />
      )}

      {showPhaseTwoIntro && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          padding: '20px',
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: window.innerWidth < 768 ? '2em' : '3em',
            color: '#32CD32',
            marginBottom: '20px',
            animation: 'pulseText 1s infinite'
          }}>
            Fase 2 Desbloqueada!
          </h1>
          <p style={{
            fontSize: window.innerWidth < 768 ? '1.2em' : '1.5em',
            marginBottom: '30px',
            maxWidth: '600px',
            lineHeight: '1.4'
          }}>
            Parabéns, você é um verdadeiro caiçara! Agora as coisas vão ficar mais difíceis...
          </p>
          <ul style={{
            fontSize: window.innerWidth < 768 ? '1em' : '1.2em',
            marginBottom: '30px',
            textAlign: 'left',
            maxWidth: '500px'
          }}>
            <li style={{ marginBottom: '10px' }}>⚡ Tempo reduzido para {PHASE_TWO_TIME} segundos</li>
            <li style={{ marginBottom: '10px' }}>🎯 Todos os bairros de Santos agora!</li>
            <li style={{ marginBottom: '10px' }}>⚠️ Game over com 40 pontos negativos</li>
          </ul>
          <button
            onClick={() => {
              setShowPhaseTwoIntro(false);
              if (geoJsonData) {
                handleNextRound(geoJsonData);
              }
            }}
            style={{
              padding: '15px 30px',
              fontSize: window.innerWidth < 768 ? '1.2em' : '1.5em',
              background: '#32CD32',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Começar Fase 2
          </button>
        </div>
      )}

      {showPhaseOneMessage && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'white',
          animation: 'popInOut 2s forwards',
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '30px',
          borderRadius: '15px',
          zIndex: 2000
        }}>
          <h2 style={{
            fontSize: window.innerWidth < 768 ? '2.5em' : '3.5em',
            color: '#32CD32',
            marginBottom: '20px',
            fontWeight: 700,
            animation: 'pulseText 0.8s infinite'
          }}>
            Nível 1: Bairros Conhecidos
          </h2>
        </div>
      )}
    </div>
  );
};

export default Map; 