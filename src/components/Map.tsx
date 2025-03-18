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
import { calculateDistance, calculateScore } from '../utils/gameUtils';
import { getProgressBarColor, getFeedbackMessage, FASE_1_BAIRROS, PHASE_TWO_TIME } from '../utils/gameConstants';

import { AudioControls } from './ui/AudioControls';
import { GameControls } from './ui/GameControls';
import { FeedbackPanel } from './ui/FeedbackPanel';
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
  const PHASE_TWO_SCORE = 5000;
  
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
      .catch(error => {
        console.error('Error loading GeoJSON:', error);
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
      audioRef.current.play().catch(e => console.log('Erro ao tocar música:', e));
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

    const clickDuration = 10 - gameState.timeLeft; // Tempo total (10s) menos o tempo restante
    updateGameState({ clickedPosition: latlng });

    if (geoJsonRef.current) {
      let targetNeighborhoodCenter: L.LatLng | null = null;
      let clickedFeature: any = null;
      let clickedNeighborhood: string | null = null;

      // Primeiro, encontramos o bairro alvo e seu centro
      const layers = geoJsonRef.current.getLayers();
      layers.forEach((layer: L.Layer) => {
        const feature = (layer as any).feature;
        const polygon = layer as L.Polygon;
        
        try {
          if (feature.properties?.NOME === gameState.currentNeighborhood) {
            targetNeighborhoodCenter = polygon.getBounds().getCenter();
          }
        } catch (error) {
          console.error('Error checking target neighborhood:', error);
        }
      });

      // Depois, verificamos se o clique foi dentro de algum bairro
      layers.forEach((layer: L.Layer) => {
        const feature = (layer as any).feature;
        const polygon = layer as L.Polygon;
        
        try {
          if (polygon.getBounds().contains(latlng)) {
            clickedFeature = feature;
            clickedNeighborhood = feature.properties?.NOME;
          }
        } catch (error) {
          console.error('Error checking clicked neighborhood:', error);
        }
      });

      // Se encontramos o centro do bairro alvo, calculamos a distância e atualizamos o estado
      if (targetNeighborhoodCenter) {
        const distance = calculateDistance(latlng, targetNeighborhoodCenter);
        
        // Se o clique estiver muito próximo ao centro (menos de 100 metros), considera como acerto
        const isNearCenter = distance < 100;
        const isCorrectNeighborhood = clickedNeighborhood === gameState.currentNeighborhood;
        
        // Toca o som de feedback apropriado
        if (successSoundRef.current && errorSoundRef.current) {
          if (isCorrectNeighborhood || isNearCenter) {
            successSoundRef.current.currentTime = 0;
            successSoundRef.current.play().catch(e => console.log('Erro ao tocar som de sucesso:', e));
          } else {
            errorSoundRef.current.currentTime = 0;
            errorSoundRef.current.play().catch(e => console.log('Erro ao tocar som de erro:', e));
          }
        }
        
        // Se acertou o bairro correto ou está muito próximo ao centro, dá pontuação máxima
        const score = (isCorrectNeighborhood || isNearCenter)
          ? (isNearCenter ? 2000 : 1000) // Pontuação extra por acertar muito próximo ao centro
          : calculateScore(distance, gameState.timeLeft).total;
        
        const newScore = gameState.score + score;
        
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
        
        updateGameState({
          clickTime: clickDuration,
          arrowPath: (isCorrectNeighborhood || isNearCenter) ? [latlng, targetNeighborhoodCenter] : [latlng, targetNeighborhoodCenter],
          score: newScore,
          showFeedback: true,
          feedbackOpacity: 1,
          feedbackProgress: 100,
          feedbackMessage: (isCorrectNeighborhood || isNearCenter) 
            ? "Acertou em cheio! Você é um verdadeiro caiçara!" 
            : getFeedbackMessage(calculateDistance(latlng, targetNeighborhoodCenter)),
          gameOver: newNegativeSum > 40
        });

        if (newNegativeSum > 40) {
          // Se for game over, não inicia próxima rodada
          return;
        }
        
        setTimeout(() => {
          const duration = 6000;
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
        }, 500);
        
        if (clickedFeature) {
          updateGameState({
            revealedNeighborhoods: new Set([...gameState.revealedNeighborhoods, clickedFeature.properties?.NOME])
          });
        }

        updateGameState({
          revealedNeighborhoods: new Set([...gameState.revealedNeighborhoods, gameState.currentNeighborhood])
        });

        updateGameState({ isCountingDown: false });
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
  };

  const handleNextRound = (geoJsonData: FeatureCollection) => {
    // Reseta o estado de pausa ao iniciar nova rodada
    setIsPaused(false);
    if (audioRef.current && gameState.gameStarted && !gameState.gameOver && !gameState.isMuted) {
      audioRef.current.play().catch(e => console.log('Erro ao tocar música:', e));
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

    // Reseta o estado do feedback
    updateGameState({
      showFeedback: false,
      feedbackOpacity: 0,
      feedbackProgress: 0,
      clickedPosition: null,
      arrowPath: null,
      isCountingDown: false,
      timeLeft: isPhaseTwo ? PHASE_TWO_TIME : 10 // Define o tempo baseado na fase
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
            animation: plantBandeira 0.5s ease-out;
            transform-origin: bottom center;
          }
          
          @keyframes plantBandeira {
            0% {
              transform: scale(0.1) translateY(100px);
              opacity: 0;
            }
            50% {
              transform: scale(1.2) translateY(-10px);
              opacity: 1;
            }
            100% {
              transform: scale(1) translateY(0);
              opacity: 1;
            }
          }

          .arrow-path {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
            animation: drawArrow 1s ease-out forwards;
            animation-delay: 0.5s;
          }

          @keyframes drawArrow {
            to {
              stroke-dashoffset: 0;
            }
          }

          /* Forçar cursor crosshair em todos os elementos do mapa */
          .leaflet-container,
          .leaflet-container *,
          .leaflet-interactive,
          .leaflet-interactive * {
            cursor: crosshair !important;
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

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <MapEvents onClick={handleMapClick} />
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        {geoJsonData && (
          <GeoJSONLayer
            geoJsonData={geoJsonData}
            revealedNeighborhoods={gameState.revealedNeighborhoods}
            currentNeighborhood={gameState.currentNeighborhood}
            onMapClick={handleMapClick}
            geoJsonRef={geoJsonRef}
          />
        )}
        {gameState.clickedPosition && gameState.arrowPath && (
          <>
            <Marker
              position={gameState.clickedPosition}
              icon={bandeira2Icon}
            />
            <Polyline
              positions={gameState.arrowPath}
              color="#FF0000"
              weight={3}
              opacity={0.8}
              dashArray="10, 10"
              className="arrow-path"
            />
          </>
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

      {!gameState.showFeedback && (
        <GameControls
          gameStarted={gameState.gameStarted}
          currentNeighborhood={gameState.currentNeighborhood}
          timeLeft={gameState.timeLeft}
          score={gameState.score}
          onStartGame={handleStartGame}
          getProgressBarColor={getProgressBarColor}
        />
      )}

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
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '20px',
          borderRadius: '10px',
          zIndex: 2000,
          textAlign: 'center',
          color: 'white',
          animation: 'fadeInOut 3s forwards'
        }}>
          <h2 style={{
            fontSize: window.innerWidth < 768 ? '1.2em' : '1.5em',
            color: '#32CD32',
            marginBottom: '10px'
          }}>
            Fase 1: Bairros mais conhecidos
          </h2>
          <p style={{
            fontSize: window.innerWidth < 768 ? '1em' : '1.2em',
            margin: 0
          }}>
            Faça 5000 pontos para desbloquear a fase 2!
          </p>
        </div>
      )}
    </div>
  );
};

export default Map; 