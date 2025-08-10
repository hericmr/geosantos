import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { getSpriteUrl, getBandeiraCorretaSpriteUrl } from '../../utils/assetUtils';
import { IDEAL_SPRITE_CONFIG, LAST_FRAME_DURATIONS } from '../../constants/spriteAnimation';
import 'leaflet/dist/leaflet.css';

interface AnimationSettings {
  size: number;
  anchorX: number;
  anchorY: number;
  fps: number;
}

type AnimationType = 'markerclick' | 'bandeira_correta';

const SpriteTestPage: React.FC = () => {
  const [clickedPosition, setClickedPosition] = useState<[number, number] | null>(null);
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationType>('markerclick');
  
  // Função para obter configurações padrão baseadas no tipo de animação
  const getDefaultSettings = (type: AnimationType): AnimationSettings => {
    const baseSettings = {
      size: IDEAL_SPRITE_CONFIG.size,
      anchorY: IDEAL_SPRITE_CONFIG.anchorY,
      fps: IDEAL_SPRITE_CONFIG.fps
    };
    
    // anchorX padrão diferente para cada tipo de animação
    const anchorX = type === 'bandeira_correta' ? 85 : 25;
    
    return {
      ...baseSettings,
      anchorX
    };
  };

  const [animationSettings, setAnimationSettings] = useState<AnimationSettings>(() => 
    getDefaultSettings(selectedAnimation)
  );
  
  const [isAnimating, setIsAnimating] = useState(false);
  const spriteIdRef = useRef<string>('');

  // Componente para capturar cliques no mapa
  const MapClickHandler: React.FC = () => {
    useMapEvents({
      click: (e) => {
        if (!isAnimating) {
          setClickedPosition([e.latlng.lat, e.latlng.lng]);
        }
      },
    });
    return null;
  };

  // Função para obter URL do sprite baseado no tipo de animação
  const getSpriteUrlByType = (frame: number, type: AnimationType): string => {
    let url: string;
    if (type === 'bandeira_correta') {
      url = getBandeiraCorretaSpriteUrl(`${frame}.png`);
      console.log('🏁 Bandeira Correta - Frame:', frame, 'URL:', url);
    } else {
      url = getSpriteUrl(`${frame}.png`);
      console.log('🎯 Marker Click - Frame:', frame, 'URL:', url);
    }
    return url;
  };

  // Função para animar o sprite
  const animateSprite = (position: [number, number]) => {
    if (isAnimating) return;
    
    console.log('🎬 Iniciando animação:', { position, type: selectedAnimation });
    setIsAnimating(true);
    spriteIdRef.current = `sprite-frame-${Date.now()}-${Math.random()}`;
    
    let currentFrame = 1;
    const totalFrames = 16;
    const frameDelay = 1000 / animationSettings.fps;

    const animate = () => {
      const spriteImg = document.getElementById(spriteIdRef.current);
      if (spriteImg && currentFrame <= totalFrames) {
        const spriteUrl = getSpriteUrlByType(currentFrame, selectedAnimation);
        console.log(`🖼️ Frame ${currentFrame}:`, spriteUrl);
        spriteImg.setAttribute('src', spriteUrl);
        currentFrame++;
        
        if (currentFrame <= totalFrames) {
          // Continuar animação
          setTimeout(animate, frameDelay);
        } else {
          // Animação terminou, sprite final permanece na tela
          const lastFrameDuration = selectedAnimation === 'bandeira_correta' 
            ? LAST_FRAME_DURATIONS.bandeira_correta 
            : LAST_FRAME_DURATIONS.markerclick;
          
          console.log(`🎯 Animação terminou! Sprite final permanecerá por ${lastFrameDuration}ms`);
          setTimeout(() => {
            console.log('🗑️ Removendo sprite final');
            setIsAnimating(false);
            setClickedPosition(null);
          }, lastFrameDuration);
        }
      } else {
        console.log('❌ Sprite não encontrado ou frame inválido');
        setIsAnimating(false);
        setClickedPosition(null);
      }
    };

    setTimeout(animate, frameDelay);
  };

  // Efeito para iniciar animação quando posição muda
  useEffect(() => {
    console.log('🔄 useEffect chamado:', { clickedPosition, selectedAnimation });
    if (clickedPosition) {
      console.log('🎯 Posição clicada, iniciando animação...');
      animateSprite(clickedPosition);
    }
  }, [clickedPosition, selectedAnimation]);

  // Efeito para atualizar configurações quando o tipo de animação muda
  useEffect(() => {
    console.log('🔄 Mudando tipo de animação para:', selectedAnimation);
    const newSettings = getDefaultSettings(selectedAnimation);
    setAnimationSettings(newSettings);
    console.log('⚙️ Novas configurações aplicadas:', newSettings);
  }, [selectedAnimation]);

  const handleSettingChange = (setting: keyof AnimationSettings, value: number) => {
    setAnimationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Controles de Customização */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        minWidth: '300px'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>🎮 Configurações da Animação</h2>
        
        {/* Seletor de Tipo de Animação */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>
            🎬 Tipo de Animação:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="animationType"
                value="markerclick"
                checked={selectedAnimation === 'markerclick'}
                onChange={(e) => {
                  console.log('🎯 Mudando para Marker Click');
                  setSelectedAnimation(e.target.value as AnimationType);
                }}
              />
              <span style={{ fontSize: '14px' }}>🎯 Marker Click</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="animationType"
                value="bandeira_correta"
                checked={selectedAnimation === 'bandeira_correta'}
                onChange={(e) => {
                  console.log('🏁 Mudando para Bandeira Correta');
                  setSelectedAnimation(e.target.value as AnimationType);
                }}
              />
              <span style={{ fontSize: '14px' }}>🏁 Bandeira Correta</span>
            </label>
          </div>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Tamanho: {animationSettings.size}px
          </label>
          <input
            type="range"
            min="30"
            max="150"
            value={animationSettings.size}
            onChange={(e) => handleSettingChange('size', parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Âncora X: {animationSettings.anchorX}px
          </label>
          <input
            type="range"
            min="0"
            max={animationSettings.size}
            value={animationSettings.anchorX}
            onChange={(e) => handleSettingChange('anchorX', parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Âncora Y: {animationSettings.anchorY}px
          </label>
          <input
            type="range"
            min="0"
            max={animationSettings.size}
            value={animationSettings.anchorY}
            onChange={(e) => handleSettingChange('anchorY', parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            FPS: {animationSettings.fps}
          </label>
          <input
            type="range"
            min="5"
            max="30"
            value={animationSettings.fps}
            onChange={(e) => handleSettingChange('fps', parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ 
          padding: '10px', 
          backgroundColor: isAnimating ? '#ffeb3b' : '#e8f5e8',
          borderRadius: '5px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {isAnimating ? '🎬 Animando...' : '✅ Pronto para clicar'}
        </div>

        <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
          <p><strong>Instruções:</strong></p>
          <p>• Escolha o tipo de animação acima</p>
          <p>• Clique em qualquer lugar do mapa para ativar</p>
          <p>• Ajuste as configurações para personalizar</p>
          <p>• A animação só funciona quando não está rodando</p>
        </div>
      </div>

      {/* Painel de Informações em Tempo Real */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        minWidth: '280px',
        fontFamily: 'monospace'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#00ff88', textAlign: 'center' }}>📊 Dados em Tempo Real</h3>
        
        <div style={{ marginBottom: '10px' }}>
          <span style={{ color: '#ffaa00' }}>🎬 Tipo:</span>
          <span style={{ float: 'right', color: '#00ff88' }}>
            {selectedAnimation === 'markerclick' ? '🎯 Marker Click' : '🏁 Bandeira Correta'}
          </span>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <span style={{ color: '#ffaa00' }}>🎯 Tamanho:</span>
          <span style={{ float: 'right', color: '#00ff88' }}>{animationSettings.size}px</span>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <span style={{ color: '#ffaa00' }}>📍 Âncora X:</span>
          <span style={{ float: 'right', color: '#00ff88' }}>{animationSettings.anchorX}px</span>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <span style={{ color: '#ffaa00' }}>📍 Âncora Y:</span>
          <span style={{ float: 'right', color: '#00ff88' }}>{animationSettings.anchorY}px</span>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <span style={{ color: '#ffaa00' }}>🎬 FPS:</span>
          <span style={{ float: 'right', color: '#00ff88' }}>{animationSettings.fps}</span>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <span style={{ color: '#ffaa00' }}>⏱️ Delay:</span>
          <span style={{ float: 'right', color: '#00ff88' }}>{Math.round(1000 / animationSettings.fps)}ms</span>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <span style={{ color: '#ffaa00' }}>🔄 Duração Total:</span>
          <span style={{ float: 'right', color: '#00ff88' }}>{Math.round((16 * 1000) / animationSettings.fps)}ms</span>
        </div>
        
        <div style={{ 
          marginTop: '15px', 
          padding: '8px', 
          backgroundColor: isAnimating ? '#ff4444' : '#00aa44',
          borderRadius: '5px',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {isAnimating ? '🎬 ANIMANDO' : '✅ PRONTO'}
        </div>
        
        {clickedPosition && (
          <div style={{ 
            marginTop: '10px', 
            padding: '8px', 
            backgroundColor: '#4444ff',
            borderRadius: '5px',
            fontSize: '11px',
            textAlign: 'center'
          }}>
            📍 Lat: {clickedPosition[0].toFixed(6)}<br/>
            📍 Lng: {clickedPosition[1].toFixed(6)}
          </div>
        )}
      </div>

      {/* Mapa */}
      <MapContainer
        center={[-23.9618, -46.3322]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapClickHandler />

        {/* Marcador com sprite animado */}
        {clickedPosition && (
          <Marker
            position={clickedPosition}
            icon={new L.DivIcon({
              html: `
                <div class="sprite-marker" style="width: ${animationSettings.size}px; height: ${animationSettings.size}px; position: relative;">
                  <img id="${spriteIdRef.current}" src="${getSpriteUrlByType(1, selectedAnimation)}" 
                       style="width: 100%; height: 100%; object-fit: contain; animation: plantSprite 0.3s ease-out; filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)) contrast(1.3) saturate(1.4);" />
                </div>
              `,
              className: 'sprite-marker-icon',
              iconSize: [animationSettings.size, animationSettings.size],
              iconAnchor: [animationSettings.anchorX, animationSettings.anchorY]
            })}
          />
        )}
      </MapContainer>

      {/* Estilos CSS */}
      <style>{`
        .sprite-marker-icon {
          background: transparent !important;
          border: none !important;
        }
        
        @keyframes plantSprite {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 0.8;
          }
          100% {
            transform: scale(1) rotate(360deg);
            opacity: 1;
          }
        }
        
        .leaflet-control-zoom {
          margin-right: 20px !important;
        }
      `}</style>
    </div>
  );
};

export default SpriteTestPage; 