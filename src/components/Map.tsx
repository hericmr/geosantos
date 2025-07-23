import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import { GameMode, FamousPlace } from '../types/famousPlaces';

import { AudioControls } from './ui/AudioControls';
import { GameControls } from './ui/GameControls';
import { FeedbackPanel } from './ui/FeedbackPanel';
import { ScoreDisplay } from './ui/ScoreDisplay';
import { MapEvents } from './game/MapEvents';
import { GeoJSONLayer } from './game/GeoJSONLayer';
import { DistanceCircle } from './game/DistanceCircle';
import { NeighborhoodManager } from './game/NeighborhoodManager';
import { FamousPlacesManager } from './game/FamousPlacesManager';
import { GameAudioManager } from './game/GameAudioManager';
import { DistanceDisplay } from './ui/DistanceDisplay';
import { GameOverModal } from './ui/GameOverModal';
import { usePlayerName } from '../hooks/usePlayerName';
import { XIcon } from './ui/GameIcons';
import { FamousPlaceModal } from './ui/FamousPlaceModal';
import { useFamousPlaces } from '../hooks/useFamousPlaces';

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

// Create custom icon for bandeira1
const bandeira1Icon = new L.Icon({
  iconUrl: 'https://github.com/hericmr/jogocaicara/raw/refs/heads/main/public/assets/images/bandeira1.png', // Corrigido para usar o caminho público
  iconSize: [70, 70],
  iconAnchor: [30, 60],
  popupAnchor: [0, -50],
  className: 'bandeira-marker'
});

import { renderToStaticMarkup } from 'react-dom/server';
import { TargetIcon } from './ui/GameIcons';

// Função utilitária para criar um ícone customizado para lugares famosos
const createFamousPlaceIcon = (imageUrl: string) => new L.Icon({
  iconUrl: imageUrl || 'https://via.placeholder.com/56', // Use placeholder if imageUrl is empty
  iconSize: [56, 56],
  iconAnchor: [28, 54],
  popupAnchor: [0, -50],
  className: 'famous-place-marker'
});

// Create custom icon for the target marker using Lucide Target icon
const targetIcon = new L.DivIcon({
  html: renderToStaticMarkup(
    <div style={{ animation: 'pulse 1s infinite' }}>
      <TargetIcon size={30} color="var(--accent-green)" />
    </div>
  ),
  className: 'target-marker-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const Map: React.FC<MapProps> = ({ center, zoom }) => {
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameStats, setGameStats] = useState({
    playTime: 0,
    roundsPlayed: 0,
    accuracy: 0
  });
  const [targetIconPosition, setTargetIconPosition] = useState<L.LatLng | null>(null);
  const { playerName, initializePlayerName } = usePlayerName();
  
  const [currentMode, setCurrentMode] = useState<GameMode>('neighborhoods');
  const [currentFamousPlace, setCurrentFamousPlace] = useState<FamousPlace | null>(null);
  const [showFamousPlaceModal, setShowFamousPlaceModal] = useState(false);
  // Controle de lugares famosos já usados
  const { places: famousPlaces, isLoading: famousPlacesLoading, error: famousPlacesError, getRandomPlace } = useFamousPlaces();
  const lastFamousPlaceId = useRef<string | null>(null);

  // Função para selecionar próximo lugar famoso (pode repetir, sempre aleatório)
  const selectNextFamousPlace = useCallback(() => {
    if (!famousPlaces || famousPlaces.length === 0) return;
    let idx = Math.floor(Math.random() * famousPlaces.length);
    // Evita repetir o mesmo lugar imediatamente usando o estado atual
    if (famousPlaces.length > 1 && currentFamousPlace) {
      let tentativas = 0;
      while (famousPlaces[idx].id === currentFamousPlace.id && tentativas < 10) {
        idx = Math.floor(Math.random() * famousPlaces.length);
        tentativas++;
      }
    }
    console.log('[selectNextFamousPlace] currentFamousPlace antes:', currentFamousPlace);
    setCurrentFamousPlace(famousPlaces[idx]);
    setTimeout(() => {
      console.log('[selectNextFamousPlace] currentFamousPlace depois:', famousPlaces[idx]);
    }, 0);
  }, [famousPlaces, currentFamousPlace]);

  // Atualiza a ref sempre que currentFamousPlace mudar
  useEffect(() => {
    lastFamousPlaceId.current = currentFamousPlace?.id ?? null;
  }, [currentFamousPlace]);

  // Desestruturação do useMapGame deve vir antes do useEffect que usa gameState
  const {
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
  } = useMapGame(geoJsonData, currentMode, currentFamousPlace, setTargetIconPosition);

  // Quando iniciar o jogo ou trocar para modo lugares famosos, seleciona o primeiro lugar
  useEffect(() => {
    if (currentMode === 'famous_places' && gameState.gameStarted && famousPlaces.length > 0 && !currentFamousPlace) {
      selectNextFamousPlace();
    }
    if (currentMode !== 'famous_places') {
      setCurrentFamousPlace(null);
    }
  }, [currentMode, gameState.gameStarted, famousPlaces, selectNextFamousPlace]);

  useEffect(() => {
    if (currentMode === 'famous_places' && currentFamousPlace) {
      console.log('[useEffect] Abrindo modal do lugar famoso:', currentFamousPlace);
      setShowFamousPlaceModal(true);
    } else {
      setShowFamousPlaceModal(false);
    }
  }, [currentMode, currentFamousPlace]);

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

  // Detectar game over e calcular estatísticas
  useEffect(() => {
    if (gameState.gameOver && !showGameOver) {
      const startTime = Date.now();
      const playTime = Math.floor((startTime - (gameState.lastClickTime || startTime)) / 1000);
      
      // Calcular precisão baseada na distância total
      const accuracy = Math.max(0, Math.min(1, 1 - (gameState.totalDistance / 6000)));
      
      setGameStats({
        playTime: Math.max(1, playTime), // Mínimo 1 segundo
        roundsPlayed: gameState.roundNumber,
        accuracy
      });
      
      setShowGameOver(true);
    }
  }, [gameState.gameOver, showGameOver, gameState.lastClickTime, gameState.totalDistance, gameState.roundNumber]);

  // Função para avançar rodada e trocar lugar famoso
  const handleNextRoundWithFamousPlaceReset = useCallback((geoJsonData: any) => {
    console.log('[handleNextRoundWithFamousPlaceReset] chamada. currentFamousPlace:', currentFamousPlace);
    handleNextRound(geoJsonData);
    if (currentMode === 'famous_places') {
      setTimeout(() => {
        console.log('[handleNextRoundWithFamousPlaceReset] chamando selectNextFamousPlace');
        selectNextFamousPlace();
      }, 0);
    }
  }, [currentMode, handleNextRound, selectNextFamousPlace, currentFamousPlace]);

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
            text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.8);
            font-family: 'VT323', monospace;
          }

          /* Indicador de foco melhorado */
          *:focus {
            outline: 3px solid var(--accent-green);
            outline-offset: 2px;
          }

          /* Loading spinner */
          .loading-spinner {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2000;
            background: var(--bg-secondary);
            border: 2px solid var(--text-primary);
            padding: 20px;
            border-radius: 2px;
            color: var(--text-primary);
            text-align: center;
            box-shadow: var(--shadow-md);
            font-family: 'VT323', monospace;
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
              icon="target"
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
        {targetIconPosition && (
          <Marker
            position={targetIconPosition}
            icon={targetIcon}
          />
        )}
        {gameState.clickedPosition && (
          <Marker
            position={gameState.clickedPosition}
            icon={bandeira2Icon}
          />
        )}
        {/* Marcador do local correto do lugar famoso (bandeira1) */}
        {currentMode === 'famous_places' && gameState.showFeedback && currentFamousPlace && (
          <Marker
            position={[currentFamousPlace.latitude, currentFamousPlace.longitude]}
            icon={bandeira1Icon}
          />
        )}
        {/* Marcador do lugar famoso */}
        {/* Removido o marcador do lugar famoso do mapa, pois agora a referência visual é apenas o modal */}
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
        
        {currentMode === 'neighborhoods' ? (
          <NeighborhoodManager
            geoJsonData={geoJsonData}
            geoJsonRef={geoJsonRef}
            updateGameState={updateGameState}
          />
        ) : (
          <FamousPlacesManager
            onPlaceChange={setCurrentFamousPlace}
            currentPlace={currentFamousPlace}
            isGameActive={gameState.gameStarted}
          />
        )}

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
        onStartGame={() => handleStartGame()}
        getProgressBarColor={getProgressBarColor}
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        currentFamousPlace={currentFamousPlace || undefined}
      />

      {gameState.showFeedback && (
        <FeedbackPanel
          showFeedback={gameState.showFeedback}
          clickedPosition={gameState.clickedPosition}
          arrowPath={gameState.arrowPath}
          clickTime={gameState.clickTime}
          feedbackProgress={gameState.feedbackProgress}
          onNextRound={handleNextRoundWithFamousPlaceReset}
          calculateDistance={calculateDistance}
          calculateScore={calculateScore}
          getProgressBarColor={getProgressBarColor}
          geoJsonData={geoJsonData}
          gameOver={gameState.gameOver}
          onPauseGame={handlePauseGame}
          score={gameState.score}
          currentNeighborhood={gameState.currentNeighborhood}
          currentMode={currentMode}
          currentFamousPlace={currentFamousPlace}
        />
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
            {currentMode === 'neighborhoods' ? 'Nível 1: Bairros Conhecidos' : 'Modo: Lugares Famosos'}
          </h2>
        </div>
      )}



      {/* Modal de Game Over */}
      <GameOverModal
        isOpen={showGameOver}
        onClose={() => {
          setShowGameOver(false);
          window.location.reload();
        }}
        onPlayAgain={() => {
          setShowGameOver(false);
          window.location.reload();
        }}
        score={gameState.score}
        playTime={gameStats.playTime}
        roundsPlayed={gameStats.roundsPlayed}
        accuracy={gameStats.accuracy}
        currentPlayerName={playerName || initializePlayerName()}
      />

      {/* Modal do Lugar Famoso */}
      <FamousPlaceModal
        open={showFamousPlaceModal}
        onClose={() => setShowFamousPlaceModal(false)}
        famousPlace={currentFamousPlace}
      />
    </div>
  );
};

export default Map; 