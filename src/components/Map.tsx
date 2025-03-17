import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMapEvents, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { FeatureCollection, Feature } from 'geojson';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

interface MapProps {
  center: [number, number];
  zoom: number;
}

const ROUND_TIME = 45; // Aumentando para 45 segundos por rodada
const TIME_BONUS = 5; // Bônus de tempo ao acertar um bairro
const MAX_DISTANCE_METERS = 2000; // Distância máxima considerada para pontuação

// Componente para lidar com eventos do mapa
function MapEvents({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      onClick(e.latlng);
    },
  });
  return null;
}

interface GeoJSONEventParams {
  feature: Feature;
  layer: L.Layer;
}

const Map: React.FC<MapProps> = ({ center, zoom }) => {
  const geoJsonRef = useRef<L.GeoJSON | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [geoJsonData, setGeoJsonData] = useState<FeatureCollection | null>(null);
  const [currentNeighborhood, setCurrentNeighborhood] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_TIME);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [clickedPosition, setClickedPosition] = useState<L.LatLng | null>(null);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [revealedNeighborhoods, setRevealedNeighborhoods] = useState<Set<string>>(new Set());
  const [wrongNeighborhood, setWrongNeighborhood] = useState<string>('');
  const [arrowPath, setArrowPath] = useState<[L.LatLng, L.LatLng] | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [clickTime, setClickTime] = useState<number>(0);
  const [feedbackOpacity, setFeedbackOpacity] = useState<number>(0);
  const [feedbackProgress, setFeedbackProgress] = useState<number>(0);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    if (gameStarted && !gameOver && timeLeft > 0 && isCountingDown) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            setGameOver(true);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);

      return () => clearInterval(timer);
    }
  }, [gameStarted, gameOver, isCountingDown]);

  useEffect(() => {
    // Configurar o áudio
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.loop = true;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    // Controlar a música com base no estado do jogo
    if (gameStarted && !gameOver && audioRef.current) {
      audioRef.current.play().catch(e => console.log('Erro ao tocar música:', e));
    } else if (gameOver && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [gameStarted, gameOver]);

  const selectRandomNeighborhood = (data: FeatureCollection) => {
    const features = data.features;
    const randomIndex = Math.floor(Math.random() * features.length);
    const neighborhood = features[randomIndex].properties?.NOME;
    setCurrentNeighborhood(neighborhood);
    setTimeLeft(ROUND_TIME);
    setIsCountingDown(true);
  };

  const handleStartGame = () => {
    if (geoJsonData) {
      setGameStarted(true);
      setScore(0);
      setGameOver(false);
      setTimeLeft(ROUND_TIME);
      selectRandomNeighborhood(geoJsonData);
      // A música começará automaticamente pelo useEffect
    }
  };

  const calculateScore = (distance: number, timeLeft: number): { total: number, distancePoints: number, timePoints: number } => {
    // Calcula a precisão do clique (0 a 1)
    const distanceScore = Math.max(0, 1 - (distance / MAX_DISTANCE_METERS));
    
    // Calcula pontos por distância (máximo 700)
    const distancePoints = Math.round(distanceScore * 700);
    
    // Calcula pontos por tempo (máximo 300), multiplicado pela precisão do clique
    const timeScore = timeLeft / ROUND_TIME;
    const timePoints = Math.round(timeScore * 300 * distanceScore);
    
    return {
      total: distancePoints + timePoints,
      distancePoints,
      timePoints
    };
  };

  const getFeedbackMessage = (distance: number): string => {
    if (distance < 100) return "Incrível! Você é um verdadeiro Caiçara!";
    if (distance < 500) return "Muito bom! Você conhece bem Santos!";
    if (distance < 1000) return "Legal! Continue explorando a cidade!";
    return "Continue tentando! Você está aprendendo!";
  };

  const startNextRound = () => {
    if (geoJsonData) {
      selectRandomNeighborhood(geoJsonData);
      setClickedPosition(null);
      setArrowPath(null);
      setShowFeedback(false);
      setFeedbackProgress(0);
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    }
  };

  const handleMapClick = (latlng: L.LatLng) => {
    if (!gameStarted || !isCountingDown) return;

    const clickStartTime = Date.now();
    setClickedPosition(latlng);

    // Encontrar o bairro clicado e o bairro alvo
    if (geoJsonRef.current) {
      let targetNeighborhoodCenter: L.LatLng | null = null;
      let clickedFeature: Feature | null = null;

      geoJsonRef.current.eachLayer((layer) => {
        const feature = (layer as any).feature;
        const polygon = layer as L.Polygon;
        
        try {
          if (polygon.getBounds().contains(latlng)) {
            clickedFeature = feature;
          }
          
          if (feature.properties?.NOME === currentNeighborhood) {
            targetNeighborhoodCenter = polygon.getBounds().getCenter();
          }
        } catch (error) {
          console.error('Error checking polygon:', error);
        }
      });

      if (targetNeighborhoodCenter) {
        const distance = calculateDistance(latlng, targetNeighborhoodCenter);
        const distanceInMeters = Math.round(distance);
        const scores = calculateScore(distance, timeLeft);
        const clickDuration = (Date.now() - clickStartTime) / 1000;
        
        setClickTime(clickDuration);
        setArrowPath([latlng, targetNeighborhoodCenter]);
        
        // Delay inicial antes de mostrar o feedback
        setTimeout(() => {
          setShowFeedback(true);
          setFeedbackOpacity(1);
          setFeedbackProgress(100);
          
          // Iniciar a barra de progresso
          const duration = 6000; // 6 segundos total
          const interval = 100; // Atualizar a cada 100ms
          let timeElapsed = 0;
          
          const progressTimer = setInterval(() => {
            timeElapsed += interval;
            const remainingProgress = Math.max(0, 100 * (1 - timeElapsed / duration));
            setFeedbackProgress(remainingProgress);
            
            if (timeElapsed >= duration) {
              clearInterval(progressTimer);
              startNextRound();
            }
          }, interval);
          
          // Salvar o timer para poder cancelá-lo se necessário
          feedbackTimerRef.current = setTimeout(() => {
            clearInterval(progressTimer);
            startNextRound();
          }, duration);
        }, 500); // Meio segundo de delay inicial
        
        // Revelar o bairro clicado se houver
        if (clickedFeature) {
          setRevealedNeighborhoods(prev => {
            const newSet = new Set(prev);
            newSet.add(clickedFeature!.properties?.NOME);
            return newSet;
          });
        }

        // Atualizar pontuação
        setScore(prev => prev + scores.total);

        // Revelar o bairro correto após cada tentativa
        setRevealedNeighborhoods(prev => {
          const newSet = new Set(prev);
          newSet.add(currentNeighborhood);
          return newSet;
        });

        // Atualizar estilos
        if (geoJsonRef.current) {
          geoJsonRef.current.eachLayer((layer) => {
            const feature = (layer as any).feature;
            layer.setStyle(getNeighborhoodStyle(feature));
          });
        }

        setIsCountingDown(false);
      }
    }
  };

  const getNeighborhoodStyle = (feature: Feature): L.PathOptions => {
    const isRevealed = revealedNeighborhoods.has(feature.properties?.NOME);
    const isCurrent = feature.properties?.NOME === currentNeighborhood;

    if (isCurrent && isRevealed) {
      return {
        fillColor: '#00FF00',
        weight: 2,
        opacity: 1,
        color: '#000000',
        fillOpacity: 0.7,
        dashArray: '3'
      };
    }

    return {
      fillColor: '#32CD32',
      weight: 2,
      opacity: isRevealed ? 1 : 0,
      color: '#000000',
      fillOpacity: isRevealed ? 0.3 : 0,
      dashArray: '3'
    };
  };

  const mapStyle: L.PathOptions = {
    fillColor: '#32CD32',
    weight: 1,
    opacity: 0,
    color: '#000000',
    fillOpacity: 0
  };

  const getProgressBarColor = (timeLeft: number) => {
    const percentage = (timeLeft / ROUND_TIME) * 100;
    if (percentage > 60) return '#4CAF50';
    if (percentage > 30) return '#FFA500';
    return '#FF0000';
  };

  const calculateDistance = (point1: L.LatLng, point2: L.LatLng): number => {
    return point1.distanceTo(point2);
  };

  const handleGeoJSONFeature = (feature: Feature, layer: L.Layer) => {
    layer.on({
      click: (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e);
        handleMapClick(e.latlng);
      },
      mouseover: (e: L.LeafletMouseEvent) => {
        const path = e.target as L.Path;
        const feature = (path as any).feature as Feature;
        if (revealedNeighborhoods.has(feature.properties?.NOME)) {
          path.setStyle({
            fillOpacity: 0.7,
          });
        }
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        const path = e.target as L.Path;
        const feature = (path as any).feature as Feature;
        if (revealedNeighborhoods.has(feature.properties?.NOME)) {
          path.setStyle({
            fillOpacity: 0.3,
          });
        }
      }
    });
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume;
    }
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
      <audio ref={audioRef} src="/src/assets/audio/musica.ogg" />
      
      {/* Volume Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 1000
      }}>
        <button
          onClick={toggleMute}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '5px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {isMuted ? (
            <span style={{ fontSize: '24px' }}>🔇</span>
          ) : volume > 0.5 ? (
            <span style={{ fontSize: '24px' }}>🔊</span>
          ) : volume > 0 ? (
            <span style={{ fontSize: '24px' }}>🔉</span>
          ) : (
            <span style={{ fontSize: '24px' }}>🔈</span>
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          style={{
            width: '100px',
            accentColor: '#32CD32'
          }}
        />
      </div>

      <MapContainer
        center={center as L.LatLngExpression}
        zoom={zoom}
        style={{ 
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        <MapEvents onClick={handleMapClick} />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={getNeighborhoodStyle}
            eventHandlers={{
              click: (e: L.LeafletEvent) => {
                L.DomEvent.stopPropagation(e);
                handleMapClick((e as L.LeafletMouseEvent).latlng);
              },
              mouseover: (e: L.LeafletEvent) => {
                const layer = e.target as L.Path;
                const feature = (layer as any).feature as Feature;
                if (revealedNeighborhoods.has(feature.properties?.NOME)) {
                  layer.setStyle({
                    ...getNeighborhoodStyle(feature),
                    fillOpacity: 0.7
                  });
                }
              },
              mouseout: (e: L.LeafletEvent) => {
                const layer = e.target as L.Path;
                const feature = (layer as any).feature as Feature;
                layer.setStyle(getNeighborhoodStyle(feature));
              }
            }}
            ref={geoJsonRef}
          />
        )}
        {clickedPosition && (
          <Marker position={clickedPosition} />
        )}
        {arrowPath && (
          <Polyline
            positions={arrowPath}
            pathOptions={{
              color: '#FFA500',
              weight: 3,
              opacity: 0.8,
              dashArray: '10, 10',
              lineCap: 'round',
              lineJoin: 'round',
              animate: true
            }}
          />
        )}
      </MapContainer>
      
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
        width: '80%',
        maxWidth: '600px',
        zIndex: 1000
      }}>
        {!gameStarted ? (
          <div>
            <h2>O Caiçara</h2>
            <p>Aprenda a geografia de Santos. Encontre os bairros da cidade!</p>
            <p>Quanto mais perto você clicar do bairro e quanto mais rápido for, mais pontos você ganha!</p>
            <button 
              onClick={handleStartGame}
              style={{
                padding: '10px 20px',
                fontSize: '1.2em',
                background: '#32CD32',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Iniciar Jogo
            </button>
          </div>
        ) : (
          <div>
            <h2>Encontre o bairro: {currentNeighborhood}!</h2>
            <div style={{
              width: '100%',
              height: '20px',
              background: '#444',
              borderRadius: '10px',
              overflow: 'hidden',
              marginBottom: '10px'
            }}>
              <div style={{
                width: `${(timeLeft / ROUND_TIME) * 100}%`,
                height: '100%',
                background: getProgressBarColor(timeLeft),
                transition: 'width 0.1s linear, background-color 0.5s ease'
              }} />
            </div>
            <p>Tempo restante: {Math.round(timeLeft * 10) / 10}s</p>
            <p>Pontuação: {Math.round(score)}</p>
            {feedbackMessage && (
              <p style={{ color: '#FFA500' }}>{feedbackMessage}</p>
            )}
          </div>
        )}
      </div>
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
      {gameStarted && !gameOver && (
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
          <p style={{ margin: 0, fontSize: '18px' }}>Pontuação: {Math.round(score)}</p>
        </div>
      )}

      {showFeedback && clickedPosition && arrowPath && (
        <div style={{
          position: 'absolute',
          top: '80px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          zIndex: 2000,
          minWidth: '300px',
          maxWidth: '350px',
          opacity: feedbackOpacity,
          transition: 'opacity 0.5s ease-in-out'
        }}>
          <h2 style={{ color: '#32CD32', marginBottom: '10px', fontSize: '1.2em' }}>
            {getFeedbackMessage(calculateDistance(clickedPosition, arrowPath[1]))}
          </h2>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '15px'
          }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
                {Math.round(calculateDistance(clickedPosition, arrowPath[1]))}
              </div>
              <div style={{ color: '#666', fontSize: '0.9em' }}>metros</div>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
                {clickTime.toFixed(2)}
              </div>
              <div style={{ color: '#666', fontSize: '0.9em' }}>segundos</div>
            </div>
          </div>
          
          {/* Pontuação detalhada */}
          <div style={{ marginBottom: '15px' }}>
            <div style={{ 
              fontSize: '16px', 
              color: '#4CAF50', 
              marginBottom: '5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Por distância:</span>
              <span style={{ fontWeight: 'bold' }}>
                +{calculateScore(calculateDistance(clickedPosition, arrowPath[1]), timeLeft).distancePoints}
              </span>
            </div>
            <div style={{ 
              fontSize: '16px', 
              color: '#FFA500',
              marginBottom: '5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Por tempo:</span>
              <span style={{ fontWeight: 'bold' }}>
                +{calculateScore(calculateDistance(clickedPosition, arrowPath[1]), timeLeft).timePoints}
              </span>
            </div>
            <div style={{ 
              fontSize: '18px', 
              color: '#333',
              fontWeight: 'bold',
              borderTop: '1px solid #ddd',
              paddingTop: '5px',
              marginTop: '5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Total:</span>
              <span style={{ color: '#FF6B6B' }}>
                +{calculateScore(calculateDistance(clickedPosition, arrowPath[1]), timeLeft).total}
              </span>
            </div>
          </div>
          
          {/* Barra de progresso */}
          <div style={{
            width: '100%',
            height: '4px',
            background: '#ddd',
            borderRadius: '2px',
            marginBottom: '15px'
          }}>
            <div style={{
              width: `${feedbackProgress}%`,
              height: '100%',
              background: getProgressBarColor(feedbackProgress / 100 * ROUND_TIME),
              borderRadius: '2px',
              transition: 'width 0.1s linear, background-color 0.3s ease'
            }} />
          </div>

          {/* Botão Próximo */}
          <button
            onClick={startNextRound}
            style={{
              padding: '6px 16px',
              fontSize: '0.9em',
              background: '#32CD32',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#28a745'}
            onMouseOut={(e) => e.currentTarget.style.background = '#32CD32'}
          >
            Próximo
          </button>
        </div>
      )}
    </div>
  );
};

export default Map; 