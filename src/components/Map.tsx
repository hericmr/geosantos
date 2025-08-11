import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { FeatureCollection } from 'geojson';
import { renderToStaticMarkup } from 'react-dom/server';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

import { MapProps } from '../types/game';
import { useMapGame } from '../hooks/useMapGame';
import { getProgressBarColor } from '../utils/gameConstants';
import { calculateDistance, calculateScore } from '../utils/gameUtils';
import { GameMode, FamousPlace } from '../types/famousPlaces';
import { getImageUrl, getSpriteUrl, getBandeiraCorretaSpriteUrl } from '../utils/assetUtils';
import { IDEAL_SPRITE_CONFIG, LAST_FRAME_DURATIONS } from '../constants/spriteAnimation';

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
import { useCursorStyle } from '../hooks/useCursorStyle';
import SpriteAnimation from './ui/SpriteAnimation';

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
  iconUrl: getImageUrl('bandeira2.png'),
  iconSize: [70, 70],
  iconAnchor: [30, 60],
  popupAnchor: [0, -50],
  className: 'bandeira-marker'
});

// Create custom icon for bandeira1
const bandeira1Icon = new L.Icon({
  iconUrl: getImageUrl('bandeira1.png'),
  iconSize: [70, 70],
  iconAnchor: [30, 60],
  popupAnchor: [0, -50],
  className: 'bandeira-marker'
});

// Componente para animação da bandeira correta no modo lugares famosos
const BandeiraCorretaAnimation: React.FC<{ position: [number, number]; gameState: any }> = ({ position, gameState }) => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false); // Começa como false
  const [shouldRender, setShouldRender] = useState(true);
  const [shouldStartAnimation, setShouldStartAnimation] = useState(false); // Novo estado para controlar quando iniciar
  const spriteIdRef = useRef<string>('');

  // Monitorar quando showFeedback se torna false para remover o componente
  useEffect(() => {
    if (!gameState.showFeedback) {
      console.log('🏁 showFeedback é false, removendo animação da bandeira correta');
      setShouldRender(false);
    }
  }, [gameState.showFeedback]);

  // Aguardar o evento da primeira animação antes de iniciar
  useEffect(() => {
    const handleMarkerClickComplete = (event: CustomEvent) => {
      console.log('📡 Evento markerClickAnimationComplete recebido, iniciando segunda animação em 0.5s');
      
      // Aguardar 0.5 segundos antes de iniciar
      setTimeout(() => {
        console.log('🎬 Iniciando segunda animação (bandeira correta)');
        setShouldStartAnimation(true);
        setIsAnimating(true);
      }, 200); // 0.5 segundos = 500ms
    };

    // Adicionar listener para o evento
    window.addEventListener('markerClickAnimationComplete', handleMarkerClickComplete as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('markerClickAnimationComplete', handleMarkerClickComplete as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!isAnimating || !shouldRender || !shouldStartAnimation) return;

    spriteIdRef.current = `bandeira-correta-${Date.now()}-${Math.random()}`;
    let currentFrame = 1;
    const totalFrames = 16;
    const frameDelay = 1000 / IDEAL_SPRITE_CONFIG.fps;

    const animate = () => {
      if (currentFrame <= totalFrames && shouldRender) {
        setCurrentFrame(currentFrame);
        currentFrame++;

        if (currentFrame <= totalFrames) {
          setTimeout(animate, frameDelay);
        } else {
          // Animação terminou, sprite final permanece até o fim do round
          console.log('🏁 Animação da bandeira correta terminou, último frame permanecerá até o fim do round');
          setIsAnimating(false);
        }
      }
    };

    setTimeout(animate, frameDelay);
  }, [isAnimating, shouldRender, shouldStartAnimation]);

  // Não renderizar se shouldRender for false
  if (!shouldRender) {
    return null;
  }

  // Criar ícone customizado com a animação
  const animatedIcon = new L.DivIcon({
    html: `
      <div class="bandeira-correta-marker" style="width: ${IDEAL_SPRITE_CONFIG.size}px; height: ${IDEAL_SPRITE_CONFIG.size}px; position: relative;">
        <img id="${spriteIdRef.current}" src="${getBandeiraCorretaSpriteUrl(`${currentFrame}.png`)}"
             style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)) contrast(1.3) saturate(1.4);" />
      </div>
    `,
    className: 'bandeira-correta-marker-icon',
    iconSize: [IDEAL_SPRITE_CONFIG.size, IDEAL_SPRITE_CONFIG.size],
    iconAnchor: [85, IDEAL_SPRITE_CONFIG.anchorY] // anchorX = 85px para bandeira correta
  });

  return (
    <Marker
      position={position}
      icon={animatedIcon}
    />
  );
};

// Função utilitária para criar um ícone customizado para lugares famosos
const createFamousPlaceIcon = (imageUrl: string) => new L.Icon({
  iconUrl: imageUrl || 'https://via.placeholder.com/56', // Use placeholder if imageUrl is empty
  iconSize: [56, 56],
  iconAnchor: [28, 54],
  popupAnchor: [0, -50],
  className: 'famous-place-marker'
});

const Map: React.FC<MapProps> = ({ center, zoom }) => {
  // Aplicar cursor personalizado
  useCursorStyle();

  // Pré-carregar as imagens das bandeiras e sprites
  useEffect(() => {
    const preloadImages = () => {
      // Pré-carregar bandeiras
      const bandeira1 = new Image();
      const bandeira2 = new Image();
      bandeira1.src = getImageUrl('bandeira1.png');
      bandeira2.src = getImageUrl('bandeira2.png');

      // Pré-carregar todos os 16 sprites
      const sprites = [];
      for (let i = 1; i <= 16; i++) {
        const sprite = new Image();
        sprite.src = getSpriteUrl(`${i}.png`);
        sprites.push(sprite);
      }

      console.log('🖼️ Pré-carregamento iniciado: 2 bandeiras + 16 sprites');

      // Aguardar todas as imagens carregarem
      Promise.all([
        new Promise((resolve) => {
          bandeira1.onload = () => resolve('bandeira1');
          bandeira1.onerror = () => console.warn('❌ Erro ao carregar bandeira1');
        }),
        new Promise((resolve) => {
          bandeira2.onload = () => resolve('bandeira2');
          bandeira2.onerror = () => console.warn('❌ Erro ao carregar bandeira2');
        }),
        ...sprites.map((sprite, index) =>
          new Promise((resolve) => {
            sprite.onload = () => resolve(`sprite${index + 1}`);
            sprite.onerror = () => console.warn(`❌ Erro ao carregar sprite${index + 1}`);
          })
        )
      ]).then(() => {
        console.log('✅ Todas as imagens foram pré-carregadas com sucesso!');
      }).catch((error) => {
        console.error('❌ Erro durante o pré-carregamento:', error);
      });
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
  const { playerName, initializePlayerName } = usePlayerName();
  const gameStartAudioRef = useRef<HTMLAudioElement>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement>(null);

  const [currentMode, setCurrentMode] = useState<GameMode>('neighborhoods');
  const [currentFamousPlace, setCurrentFamousPlace] = useState<FamousPlace | null>(null);
  const [showFamousPlaceModal, setShowFamousPlaceModal] = useState(false);
  const [isModalCentered, setIsModalCentered] = useState(true);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [modalTimeProgress, setModalTimeProgress] = useState(0);
  const spriteIdRef = useRef<string>('');
  // Controle de lugares famosos já usados
  const { places: famousPlaces, isLoading: famousPlacesLoading, error: famousPlacesError, getRandomPlace } = useFamousPlaces();
  const lastFamousPlaceId = useRef<string | null>(null);

  // Controle de zoom e movimento do mapa
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [mapCenter, setMapCenter] = useState(center);
  const spriteContainerRef = useRef<HTMLDivElement | null>(null);

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
  } = useMapGame(geoJsonData, currentMode, currentFamousPlace, isTimerPaused);

  // DEBUG: Log para verificar se o handleMapClick está sendo chamado
  const debugHandleMapClick = useCallback((latlng: L.LatLng) => {
    console.log('🔍 [Map.tsx] handleMapClick chamado com:', latlng);
    console.log('🔍 [Map.tsx] Estado do jogo:', {
      gameStarted: gameState.gameStarted,
      isCountingDown: gameState.isCountingDown,
      showFeedback: gameState.showFeedback
    });
    
    // Chamar o handler original
    handleMapClick(latlng);
  }, [handleMapClick, gameState.gameStarted, gameState.isCountingDown, gameState.showFeedback]);

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

  // Monitorar quando clickedPosition se torna null para remover o sprite
  useEffect(() => {
    if (!gameState.clickedPosition && spriteContainerRef.current && spriteContainerRef.current.parentNode) {
      console.log('🏁 clickedPosition é null, removendo sprite do clique');
      spriteContainerRef.current.parentNode.removeChild(spriteContainerRef.current);
      spriteContainerRef.current = null;
    }
  }, [gameState.clickedPosition]);

  // Quando iniciar o jogo ou trocar para modo lugares famosos, seleciona o primeiro lugar
  useEffect(() => {
    if (currentMode === 'famous_places' && gameState.gameStarted && famousPlaces.length > 0 && !currentFamousPlace) {
      selectNextFamousPlace();
    }
    if (currentMode !== 'famous_places') {
      setCurrentFamousPlace(null);
    }
  }, [currentMode, gameState.gameStarted, famousPlaces, selectNextFamousPlace]);

  // Animação de sprite quando clickedPosition muda
    useEffect(() => {
    if (gameState.clickedPosition) {
      console.log('🎯 Clique detectado! Posição:', gameState.clickedPosition);
      console.log('⚙️ Configuração do sprite:', IDEAL_SPRITE_CONFIG);

      spriteIdRef.current = `sprite-frame-${Date.now()}-${Math.random()}`;
      console.log('🆔 ID do sprite gerado:', spriteIdRef.current);

      let currentFrame = 1;
      const totalFrames = 16;

      // Criar o elemento HTML do sprite dinamicamente
      const spriteContainer = document.createElement('div');
      spriteContainer.id = spriteIdRef.current;
      spriteContainer.className = 'sprite-animation-container';
      
      // Armazenar na ref para poder removê-lo depois
      spriteContainerRef.current = spriteContainer;

      // Calcular posição baseada no clique e ancoragem
      const clickX = gameState.clickedPosition.lng;
      const clickY = gameState.clickedPosition.lat;

      // Converter coordenadas geográficas para pixels da tela
      const mapElement = mapRef.current;
      if (mapElement) {
        const point = mapElement.latLngToContainerPoint([clickY, clickX]);

        spriteContainer.style.cssText = `
          position: absolute;
          left: ${point.x - IDEAL_SPRITE_CONFIG.anchorX}px;
          top: ${point.y - IDEAL_SPRITE_CONFIG.anchorY}px;
          width: ${IDEAL_SPRITE_CONFIG.size}px;
          height: ${IDEAL_SPRITE_CONFIG.size}px;
          z-index: 10000;
          pointer-events: none;
          background: transparent;
        `;

        console.log(`📍 Posição do clique: ${clickX}, ${clickY}`);
        console.log(`🖥️ Posição na tela: ${point.x}, ${point.y}`);
        console.log(`🎯 Posição final com ancoragem: ${point.x - IDEAL_SPRITE_CONFIG.anchorX}, ${point.y - IDEAL_SPRITE_CONFIG.anchorY}`);
      } else {
        // Fallback para posição central se o mapa não estiver disponível
        spriteContainer.style.cssText = `
          position: fixed;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: ${IDEAL_SPRITE_CONFIG.size}px;
          height: ${IDEAL_SPRITE_CONFIG.size}px;
          z-index: 10000;
          pointer-events: none;
          background: transparent;
        `;
      }

      const spriteImg = document.createElement('img');
      spriteImg.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)) contrast(1.3) saturate(1.4);
      `;
      spriteImg.src = getSpriteUrl('1.png');

      spriteContainer.appendChild(spriteImg);

      // Adicionar ao container do mapa para posicionamento correto
      const mapContainer = mapRef.current?.getContainer();
      if (mapContainer) {
        mapContainer.appendChild(spriteContainer);
        console.log('🖼️ Sprite adicionado ao container do mapa');
      } else {
        // Fallback para o body se o mapa não estiver disponível
        document.body.appendChild(spriteContainer);
        console.log('🖼️ Sprite adicionado ao body (fallback)');
      }

      console.log('🖼️ Elemento HTML do sprite criado e adicionado ao DOM');
      console.log(`📏 Tamanho: ${IDEAL_SPRITE_CONFIG.size}px`);
      console.log(`⏱️ Frame delay: ${IDEAL_SPRITE_CONFIG.frameDelay}ms`);
      console.log(`🎬 FPS: ${IDEAL_SPRITE_CONFIG.fps}`);

      const animateSprite = () => {
        console.log(`🖼️ Frame ${currentFrame}:`, getSpriteUrl(`${currentFrame}.png`));

        if (currentFrame <= totalFrames) {
          spriteImg.src = getSpriteUrl(`${currentFrame}.png`);
          currentFrame++;

          if (currentFrame <= totalFrames) {
            // Continuar animação
            console.log(`⏰ Próximo frame em ${IDEAL_SPRITE_CONFIG.frameDelay}ms`);
            setTimeout(animateSprite, IDEAL_SPRITE_CONFIG.frameDelay);
          } else {
            // Animação terminou, sprite final permanece até o fim do round
            console.log('🏁 Animação do clique terminou, último frame permanecerá até o fim do round');
            
            // Emitir evento customizado para sincronizar com a segunda animação
            const animationCompleteEvent = new CustomEvent('markerClickAnimationComplete', {
              detail: { 
                timestamp: Date.now(),
                position: gameState.clickedPosition 
              }
            });
            window.dispatchEvent(animationCompleteEvent);
            console.log('📡 Evento markerClickAnimationComplete disparado');
            
            // Não remover imediatamente - deixar até o round terminar
          }
        } else {
          console.log('❌ Animação finalizada');
        }
      };

      // Iniciar animação após um pequeno delay para garantir que o DOM esteja pronto
      console.log(`⏰ Iniciando animação em ${IDEAL_SPRITE_CONFIG.frameDelay}ms...`);
      setTimeout(animateSprite, IDEAL_SPRITE_CONFIG.frameDelay);
    }
  }, [gameState.clickedPosition]);

  // Controle de zoom e movimento com teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Só processar se o jogo estiver ativo e o mapa estiver visível
      if (!gameState.gameStarted || !mapRef.current) return;

      // Prevenir comportamento padrão para evitar scroll da página
      event.preventDefault();

      const map = mapRef.current;
      const currentMapZoom = map.getZoom();
      const currentCenter = map.getCenter();

      switch (event.key.toLowerCase()) {
        case 'z':
          // Zoom in
          if (currentMapZoom < 18) {
            map.setZoom(currentMapZoom + 1);
            setCurrentZoom(currentMapZoom + 1);
          }
          break;
        case 'x':
          // Zoom out
          if (currentMapZoom > 10) {
            map.setZoom(currentMapZoom - 1);
            setCurrentZoom(currentMapZoom - 1);
          }
          break;
        case 'arrowup':
        case 'arrowdown':
        case 'arrowleft':
        case 'arrowright':
          // Movimento do mapa
          const panDistance = 0.01; // Distância de movimento em graus
          let newLat = currentCenter.lat;
          let newLng = currentCenter.lng;

          switch (event.key.toLowerCase()) {
            case 'arrowup':
              newLat += panDistance;
              break;
            case 'arrowdown':
              newLat -= panDistance;
              break;
            case 'arrowleft':
              newLng -= panDistance;
              break;
            case 'arrowright':
              newLng += panDistance;
              break;
          }

          // Limitar o movimento para não sair muito da área de Santos
          const newCenter = L.latLng(
            Math.max(-24.1, Math.min(-23.8, newLat)), // Limites de latitude para Santos
            Math.max(-46.5, Math.min(-46.2, newLng))  // Limites de longitude para Santos
          );

          map.panTo(newCenter, { animate: true });
          setMapCenter([newCenter.lat, newCenter.lng]);
          break;
      }
    };

    // Adicionar event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState.gameStarted]);

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
            z-index: 2000;
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

          @keyframes plantSprite {
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
          center={mapCenter}
          zoom={currentZoom}
          style={{ width: '100%', height: '100%', zIndex: 1 }}
          zoomControl={false}
          attributionControl={false}
          ref={mapRef}
        >
          <MapEvents onClick={debugHandleMapClick} />
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          {/* Marcador do local correto do lugar famoso (bandeira1) */}
          {currentMode === 'famous_places' && gameState.showFeedback && currentFamousPlace && (
            <BandeiraCorretaAnimation position={[currentFamousPlace.latitude, currentFamousPlace.longitude]} gameState={gameState} />
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
              onMapClick={debugHandleMapClick}
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

      {/* Indicador de controles do mapa */}
      {gameState.gameStarted && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'var(--text-primary)',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '0.8rem',
          fontFamily: "'LaCartoonerie', sans-serif",
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent-green)' }}>Z</span>
            <span>Zoom In</span>
            <span style={{ marginLeft: '8px', color: 'var(--accent-green)' }}>X</span>
            <span>Zoom Out</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent-blue)' }}>↑↓←→</span>
            <span>Mover Mapa</span>
          </div>
        </div>
      )}

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