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
import { Home, Landmark } from 'lucide-react';

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
  iconUrl: `${import.meta.env.BASE_URL || ''}/assets/images/bandeira2.png`,
  iconSize: [70, 70],
  iconAnchor: [30, 60],
  popupAnchor: [0, -50],
  className: 'bandeira-marker'
});

// Create custom icon for bandeira1
const bandeira1Icon = new L.Icon({
  iconUrl: `${import.meta.env.BASE_URL || ''}/assets/images/bandeira1.png`, // Corrigido para usar o caminho público
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
  // Pré-carregar as imagens das bandeiras
  useEffect(() => {
    const preloadImages = () => {
      const bandeira1 = new Image();
      const bandeira2 = new Image();
      bandeira1.src = `${import.meta.env.BASE_URL || ''}/assets/images/bandeira1.png`;
      bandeira2.src = `${import.meta.env.BASE_URL || ''}/assets/images/bandeira2.png`;
    };
    preloadImages();
  }, []);

  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameStats, setGameStats] = useState({
    playTime: 0,
    roundsPlayed: 0,
    accuracy: 0
  });
  const [targetIconPosition, setTargetIconPosition] = useState<L.LatLng | null>(null);
  const { playerName, initializePlayerName } = usePlayerName();
  const gameStartAudioRef = useRef<HTMLAudioElement>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement>(null);
  
  const [currentMode, setCurrentMode] = useState<GameMode>('neighborhoods');
  const [currentFamousPlace, setCurrentFamousPlace] = useState<FamousPlace | null>(null);
  const [showFamousPlaceModal, setShowFamousPlaceModal] = useState(false);
  const [isModalCentered, setIsModalCentered] = useState(true);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [modalTimeProgress, setModalTimeProgress] = useState(0);
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
  } = useMapGame(geoJsonData, currentMode, currentFamousPlace, setTargetIconPosition, isTimerPaused);

  // Quando iniciar o jogo ou trocar para modo lugares famosos, seleciona o primeiro lugar
  useEffect(() => {
    if (currentMode === 'famous_places' && gameState.gameStarted && famousPlaces.length > 0 && !currentFamousPlace) {
      selectNextFamousPlace();
    }
    if (currentMode !== 'famous_places') {
      setCurrentFamousPlace(null);
    }
  }, [currentMode, gameState.gameStarted, famousPlaces, selectNextFamousPlace]);

  // Lógica de timing do modal de lugares famosos
  useEffect(() => {
    if (currentMode === 'famous_places' && currentFamousPlace && gameState.gameStarted) {
      console.log('[useEffect] Iniciando sequência do modal do lugar famoso:', currentFamousPlace);
      
      // 1. Mostra modal centralizado
      setIsModalCentered(true);
      setShowFamousPlaceModal(true);
      setIsTimerPaused(true);
      setModalTimeProgress(0);
      
      // Barra de tempo de 2 segundos
      const startTime = Date.now();
      const duration = 2000;
      
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setModalTimeProgress(progress);
      }, 50); // Atualiza a cada 50ms para suavidade
      
      // 2. Após 2 segundos, move para o canto
      const moveToCornerTimer = setTimeout(() => {
        console.log('[Modal] Movendo para o canto após 2 segundos');
        setIsModalCentered(false);
        setModalTimeProgress(0);
        clearInterval(progressInterval);
      }, 2000);
      
      // 3. Após 2.3 segundos (tempo da animação), inicia o timer
      const startTimerTimer = setTimeout(() => {
        console.log('[Modal] Iniciando timer após transição');
        setIsTimerPaused(false);
      }, 2300);
      
      return () => {
        clearTimeout(moveToCornerTimer);
        clearTimeout(startTimerTimer);
        clearInterval(progressInterval);
      };
    } else if (currentMode !== 'famous_places') {
      setShowFamousPlaceModal(false);
      setIsModalCentered(true);
      setIsTimerPaused(false);
      setModalTimeProgress(0);
    }
  }, [currentMode, currentFamousPlace, gameState.gameStarted]);

  useEffect(() => {
    const fetchGeoJson = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL || ''}/data/bairros.geojson`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: FeatureCollection = await response.json();
        setGeoJsonData(data);
      } catch (error) {
        console.error('Error fetching geojson data:', error);
        setGeoJsonData(null);
      }
    };
    fetchGeoJson();
  }, []);

  // Disponibilizar a referência do mapa para outros componentes
  useEffect(() => {
    if (mapRef.current) {
      (window as any).mapInstance = mapRef.current;
    }
  }, [mapRef.current]);

  // Controlar música de fundo baseado no estado do jogo
  useEffect(() => {
    if (backgroundMusicRef.current) {
      if (gameState.gameStarted && !gameState.gameOver && !gameState.isMuted) {
        // Iniciar música quando o jogo começa
        backgroundMusicRef.current.volume = gameState.volume * 0.3; // Volume mais baixo para música de fundo
        backgroundMusicRef.current.play().catch((error) => {
          console.log('Erro ao tocar música de fundo:', error);
        });
      } else if (gameState.gameOver || gameState.isMuted) {
        // Parar música quando o jogo termina ou está mutado
        backgroundMusicRef.current.pause();
      }
    }
  }, [gameState.gameStarted, gameState.gameOver, gameState.isMuted, gameState.volume]);

  // Atualizar volume da música de fundo quando o volume muda
  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = gameState.volume * 0.3; // Volume mais baixo para música de fundo
    }
  }, [gameState.volume]);

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
      <audio ref={audioRef} preload="auto" />
      <audio ref={successSoundRef} src={`${import.meta.env.BASE_URL || ''}/assets/audio/sucess.mp3`} preload="auto" />
      <audio ref={errorSoundRef} src={`${import.meta.env.BASE_URL || ''}/assets/audio/error.mp3`} preload="auto" />
      <audio ref={gameStartAudioRef} src={`${import.meta.env.BASE_URL || ''}/assets/audio/game-start.mp3`} preload="auto" />
      <audio 
        ref={backgroundMusicRef} 
        src={`${import.meta.env.BASE_URL || ''}/assets/audio/game_music.mp3`} 
        preload="auto" 
        loop 
        onError={(e) => {
          console.error('Erro ao carregar game_music.mp3:', e);
        }}
        onLoadStart={() => {
          console.log('Iniciando carregamento de game_music.mp3');
        }}
        onCanPlay={() => {
          console.log('game_music.mp3 carregado com sucesso');
        }}
      />
      
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

          @keyframes fadeInOut {
            0% { opacity: 0; }
            10% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; }
          }

          @keyframes slideInUp {
            0% { 
              opacity: 0; 
              transform: translateY(30px);
            }
            100% { 
              opacity: 1; 
              transform: translateY(0);
            }
          }

          @keyframes bounceIn {
            0% { 
              opacity: 0; 
              transform: scale(0.3);
            }
            50% { 
              opacity: 1; 
              transform: scale(1.05);
            }
            70% { 
              transform: scale(0.9);
            }
            100% { 
              opacity: 1; 
              transform: scale(1);
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
        gameStartAudioRef={gameStartAudioRef}
        gameState={gameState}
        playSuccess={false}
        playError={false}
        showPhaseOneMessage={showPhaseOneMessage}
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

      {gameState.gameStarted && (
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

          {mapRef.current && distanceCircle && (
            <DistanceCircle
              map={mapRef.current}
              distanceCircle={distanceCircle}
              onAnimationComplete={() => setDistanceCircle(null)}
            />
          )}
        </MapContainer>
      )}

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
        globalTimeLeft={gameState.globalTimeLeft}
        roundTimeLeft={gameState.roundTimeLeft}
        roundNumber={gameState.roundNumber}
        roundInitialTime={gameState.roundInitialTime}
        score={gameState.score}
        onStartGame={() => handleStartGame()}
        getProgressBarColor={getProgressBarColor}
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        currentFamousPlace={currentFamousPlace || undefined}
      />

      {gameState.showFeedback && !showGameOver && (
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
          currentFamousPlace={currentFamousPlace || undefined}
        />
      )}

      {showPhaseOneMessage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeInOut 3s forwards',
          zIndex: 2000
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '90%',
            animation: 'slideInUp 0.8s ease-out 0.3s both'
          }}>
            <div style={{
              fontSize: window.innerWidth < 768 ? '3rem' : '4rem',
              marginBottom: '20px',
              animation: 'bounceIn 1s ease-out 0.5s both'
            }}>
              {currentMode === 'neighborhoods' 
                ? <Home size={window.innerWidth < 768 ? 48 : 64} color="var(--accent-green)" />
                : <Landmark size={window.innerWidth < 768 ? 48 : 64} color="var(--accent-green)" />}
            </div>
            
            <h1 style={{
              fontSize: window.innerWidth < 768 ? '2rem' : '3rem',
              color: 'var(--accent-green)',
              marginBottom: '15px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              animation: 'slideInUp 0.8s ease-out 0.7s both',
              fontFamily: "'LaCartoonerie', cursive"
            }}>
              {currentMode === 'neighborhoods' ? 'Nível 1: Bairros Conhecidos' : 'Lugares Famosos'}
            </h1>
            
            <p style={{
              fontSize: window.innerWidth < 768 ? '1rem' : '1.3rem',
              color: 'var(--text-primary)',
              marginBottom: '25px',
              fontWeight: 600,
              animation: 'slideInUp 0.8s ease-out 0.9s both',
              fontFamily: "'LaCartoonerie', cursive"
            }}>
              {currentMode === 'neighborhoods'
                ? 'Clique no mapa onde você acha que está o bairro!'
                : 'Encontre o lugar famoso no mapa!'
              }
            </p>
          </div>
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
        isCentered={isModalCentered}
        timeProgress={modalTimeProgress}
      />
    </div>
  );
};

export default Map; 