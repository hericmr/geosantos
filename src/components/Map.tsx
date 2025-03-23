import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { FeatureCollection } from 'geojson';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

import { MapProps } from '../types/game';
import { useMapGame } from '../hooks/useMapGame';
import { getProgressBarColor } from '../utils/gameConstants';
import { calculateDistance, calculateScore } from '../utils/gameUtils';

import { AudioControls } from './ui/AudioControls';
import { GameControls } from './ui/GameControls';
import { FeedbackPanel } from './ui/FeedbackPanel';
import { ScoreDisplay } from './ui/ScoreDisplay';
import { MapEvents } from './game/MapEvents';
import { GeoJSONLayer } from './game/GeoJSONLayer';
import { DistanceCircle } from './game/DistanceCircle';
import { NeighborhoodManager } from './game/NeighborhoodManager';
import { GameAudioManager } from './game/GameAudioManager';
import { DistanceDisplay } from './ui/DistanceDisplay';

// Função para verificar se um ponto está dentro de um polígono
// Implementação do algoritmo "ray casting" para determinar se um ponto está dentro de um polígono
const isPointInsidePolygon = (point: L.LatLng, polygon: L.LatLng[]): boolean => {
  // Implementação do algoritmo "point-in-polygon" usando ray casting
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
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(null);
  
  const {
    mapRef,
    geoJsonRef,
    audioRef,
    successSoundRef,
    errorSoundRef,
    isLoading,
    isPaused,
    isPhaseTwo,
    showPhaseTwoIntro,
    showPhaseOneMessage,
    distanceCircle,
    gameState,
    handleMapClick,
    handleVolumeChange,
    handleToggleMute,
    handlePauseGame,
    handleNextRound,
    handleStartGame,
    setShowPhaseTwoIntro,
    setDistanceCircle,
    updateGameState
  } = useMapGame(geoJsonData);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/hericmr/jogocaicara/refs/heads/main/public/data/bairros.geojson')
      .then(response => response.json())
      .then(data => {
        setGeoJsonData(data);
      })
      .catch(() => {
        // Handle error silently
      });
  }, []);

  // Disponibilizar a referência do mapa para outros componentes
  useEffect(() => {
    if (mapRef.current) {
      (window as any).mapInstance = mapRef.current;
    }
  }, [mapRef.current]);

  return (
    <div style={{
      margin: 0,
      padding: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <audio ref={audioRef} src="https://github.com/hericmr/jogocaicara/raw/refs/heads/main/public/assets/audio/musica.ogg" preload="auto" />
      <audio ref={successSoundRef} src="https://github.com/hericmr/jogocaicara/raw/refs/heads/main/public/assets/audio/success.mp3" preload="auto" />
      <audio ref={errorSoundRef} src="https://github.com/hericmr/jogocaicara/raw/refs/heads/main/public/assets/audio/error.mp3" preload="auto" />
      
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
      
      <GameAudioManager
        audioRef={audioRef}
        successSoundRef={successSoundRef}
        errorSoundRef={errorSoundRef}
        gameState={gameState}
        playSuccess={false}
        playError={false}
      />



      {gameState.gameStarted && (
        <>
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <ScoreDisplay 
              icon="🎯"
              value={gameState.score}
              unit="pts"
            />
          </div>
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000
          }}>
            <DistanceDisplay
              totalDistance={gameState.totalDistance}
              maxDistance={4000}
            />
          </div>
        </>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
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
        
        <NeighborhoodManager
          geoJsonData={geoJsonData}
          geoJsonRef={geoJsonRef}
          isPhaseTwo={isPhaseTwo}
          updateGameState={updateGameState}
        />

        {mapRef.current && (
          <DistanceCircle
            map={mapRef.current}
            distanceCircle={distanceCircle}
            onAnimationComplete={() => setDistanceCircle(null)}
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
            <li style={{ marginBottom: '10px' }}>⚡ Tempo reduzido para 5 segundos</li>
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