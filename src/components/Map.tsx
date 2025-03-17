import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, GeoJSON as ReactGeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { FeatureCollection } from 'geojson';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import bandeira2Url from '../assets/images/bandeira2.png';

import { MapProps } from '../types/game';
import { useGameState } from '../hooks/useGameState';
import { calculateDistance, calculateScore } from '../utils/gameUtils';
import { getProgressBarColor } from '../utils/gameConstants';

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
  iconUrl: bandeira2Url,
  iconSize: [70, 70],
  iconAnchor: [30, 60],
  popupAnchor: [0, -50],
  className: 'bandeira-marker'
});

const Map: React.FC<MapProps> = ({ center, zoom }) => {
  const geoJsonRef = useRef<typeof ReactGeoJSON>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(null);
  
  const {
    gameState,
    updateGameState,
    startGame,
    startNextRound,
    clearFeedbackTimer,
    feedbackTimerRef
  } = useGameState();

  useEffect(() => {
    fetch('/data/bairros.geojson')
      .then(response => response.json())
      .then(data => {
        setGeoJsonData(data);
      })
      .catch(error => {
        console.error('Error loading GeoJSON:', error);
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

  const selectRandomNeighborhood = (data: FeatureCollection) => {
    const features = data.features;
    const randomIndex = Math.floor(Math.random() * features.length);
    const neighborhood = features[randomIndex].properties?.NOME;
    updateGameState({ currentNeighborhood: neighborhood });
  };

  const handleStartGame = () => {
    if (geoJsonData) {
      startGame();
      selectRandomNeighborhood(geoJsonData);
    }
  };

  const handleMapClick = (latlng: L.LatLng) => {
    if (!gameState.gameStarted || !gameState.isCountingDown) return;

    const clickStartTime = Date.now();
    updateGameState({ clickedPosition: latlng });

    if (geoJsonRef.current) {
      let targetNeighborhoodCenter: L.LatLng | null = null;
      let clickedFeature: any = null;

      geoJsonRef.current.eachLayer((layer: L.Layer) => {
        const feature = (layer as any).feature;
        const polygon = layer as L.Polygon;
        
        try {
          if (polygon.getBounds().contains(latlng)) {
            clickedFeature = feature;
          }
          
          if (feature.properties?.NOME === gameState.currentNeighborhood) {
            targetNeighborhoodCenter = polygon.getBounds().getCenter();
          }
        } catch (error) {
          console.error('Error checking polygon:', error);
        }
      });

      if (targetNeighborhoodCenter) {
        const distance = calculateDistance(latlng, targetNeighborhoodCenter);
        const clickDuration = (Date.now() - clickStartTime) / 1000;
        
        const clickedNeighborhood = clickedFeature?.properties?.NOME;
        const isCorrectNeighborhood = clickedNeighborhood === gameState.currentNeighborhood;
        
        updateGameState({
          clickTime: clickDuration,
          arrowPath: isCorrectNeighborhood ? null : [latlng, targetNeighborhoodCenter],
          score: gameState.score + calculateScore(distance, gameState.timeLeft).total
        });
        
        setTimeout(() => {
          updateGameState({
            showFeedback: true,
            feedbackOpacity: 1,
            feedbackProgress: 100
          });
          
          const duration = 6000;
          const interval = 100;
          let timeElapsed = 0;
          
          const progressTimer = setInterval(() => {
            timeElapsed += interval;
            const remainingProgress = Math.max(0, 100 * (1 - timeElapsed / duration));
            updateGameState({ feedbackProgress: remainingProgress });
            
            if (timeElapsed >= duration) {
              clearInterval(progressTimer);
              startNextRound(geoJsonData);
            }
          }, interval);
          
          feedbackTimerRef.current = setTimeout(() => {
            clearInterval(progressTimer);
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

  return (
    <div style={{ 
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden'
    }}>
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
          }
        `}
      </style>
      
      <audio ref={audioRef} src="/src/assets/audio/musica.ogg" />
      
      <AudioControls
        isMuted={gameState.isMuted}
        volume={gameState.volume}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
      />

      <MapContainer
        center={center as L.LatLngExpression}
        zoom={zoom}
        style={{ 
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          cursor: 'crosshair'
        }}
      >
        <MapEvents onClick={handleMapClick} />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        {geoJsonData && (
          <GeoJSONLayer
            geoJsonData={geoJsonData}
            revealedNeighborhoods={gameState.revealedNeighborhoods}
            currentNeighborhood={gameState.currentNeighborhood}
            onMapClick={handleMapClick}
            geoJsonRef={geoJsonRef}
          />
        )}
        {gameState.clickedPosition && (
          <Marker 
            position={gameState.clickedPosition}
            icon={bandeira2Icon}
          />
        )}
        {gameState.arrowPath && (
          <Polyline
            positions={gameState.arrowPath}
            pathOptions={{
              color: '#FFA500',
              weight: 3,
              opacity: 0.8,
              dashArray: '10, 10',
              lineCap: 'round',
              lineJoin: 'round',
              className: 'arrow-path'
            }}
          />
        )}
      </MapContainer>
      
      <GameControls
        gameStarted={gameState.gameStarted}
        currentNeighborhood={gameState.currentNeighborhood}
        timeLeft={gameState.timeLeft}
        score={gameState.score}
        onStartGame={handleStartGame}
        getProgressBarColor={getProgressBarColor}
      />

      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '10px',
        textAlign: 'center',
        zIndex: 1000
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>O Caiçara</h1>
      </div>

      {gameState.gameStarted && !gameState.gameOver && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '10px',
          textAlign: 'center',
          zIndex: 1000
        }}>
          <p style={{ margin: 0, fontSize: '18px' }}>Pontuação: {Math.round(gameState.score)}</p>
        </div>
      )}

      <FeedbackPanel
        showFeedback={gameState.showFeedback}
        clickedPosition={gameState.clickedPosition}
        arrowPath={gameState.arrowPath}
        clickTime={gameState.clickTime}
        feedbackProgress={gameState.feedbackProgress}
        onNextRound={startNextRound}
        calculateDistance={calculateDistance}
        calculateScore={calculateScore}
        getProgressBarColor={getProgressBarColor}
        geoJsonData={geoJsonData}
      />
    </div>
  );
};

export default Map; 