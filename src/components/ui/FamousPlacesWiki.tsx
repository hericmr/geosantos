import React, { useState } from 'react';
import { useFamousPlaces } from '../../hooks/useFamousPlaces';
import { FamousPlace } from '../../types/famousPlaces';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PlaceSuggestionForm } from './PlaceSuggestionForm';

export const FamousPlacesWiki: React.FC = () => {
  const { places, isLoading, error } = useFamousPlaces();
  const [selectedPlace, setSelectedPlace] = useState<FamousPlace | null>(null);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);

  // Ícone customizado para o marcador
  const markerIcon = new L.Icon({
    iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -48],
  });

  const handleVoltar = () => {
    window.history.back();
  };

  const handlePlaceSelect = (place: FamousPlace) => {
    setSelectedPlace(place);
  };

  const handleShowSuggestionForm = () => {
    setShowSuggestionForm(true);
  };

  const handleCloseSuggestionForm = () => {
    setShowSuggestionForm(false);
  };

  return (
    <div style={{
      maxWidth: 1400,
      minWidth: 320,
      width: '100%',
      margin: '40px auto',
      background: 'var(--bg-secondary)',
      border: '4px solid var(--accent-green)',
      borderRadius: 0,
      boxShadow: '8px 8px 0 #222, 0 0 0 4px #fff',
      padding: 24,
      fontFamily: "'Press Start 2P', monospace",
      color: 'var(--text-primary)',
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      flexDirection: 'row',
      gap: 32,
      flexWrap: 'wrap',
    }}>
      {/* Botão Voltar */}
      <button
        onClick={handleVoltar}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 10,
          background: '#1a4d2e',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '12px 20px',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#2d6a4f';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#1a4d2e';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        ← Voltar ao Jogo
      </button>

      {/* Coluna da lista de lugares */}
      <div style={{
        flex: '1 1 300px',
        minWidth: 280,
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        height: 'calc(100vh - 120px)',
        overflowY: 'auto',
        background: '#fff',
        border: '2px solid #222',
        borderRadius: 0,
        boxShadow: '4px 4px 0 #222',
        padding: 16,
      }}>
        <h2 style={{ 
          fontSize: '1.2rem', 
          color: '#222', 
          marginBottom: 16, 
          fontFamily: "'Press Start 2P', monospace", 
          textTransform: 'uppercase',
          textAlign: 'center',
          fontWeight: 700,
          textShadow: '2px 2px 0 #ccc'
        }}>
          Lugares Famosos
        </h2>
        
        {isLoading && (
          <div style={{ 
            color: '#888', 
            fontSize: '0.9rem', 
            textAlign: 'center',
            fontFamily: "'VT323', monospace"
          }}>
            Carregando lugares...
          </div>
        )}
        
        {error && (
          <div style={{ 
            color: 'red', 
            fontSize: '0.9rem', 
            textAlign: 'center',
            fontFamily: "'VT323', monospace"
          }}>
            Erro ao carregar lugares: {error}
          </div>
        )}
        
        {places.length === 0 && !isLoading && (
          <div style={{ 
            color: '#888', 
            fontSize: '0.9rem',
            textAlign: 'center',
            fontFamily: "'VT323', monospace"
          }}>
            Nenhum lugar encontrado.
          </div>
        )}
        
        {places.map(place => (
          <div 
            key={place.id} 
            onClick={() => handlePlaceSelect(place)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              borderBottom: '1px dashed #ccc', 
              padding: '12px 8px',
              cursor: 'pointer',
              background: selectedPlace?.id === place.id ? '#f0f8f0' : 'transparent',
              border: selectedPlace?.id === place.id ? '2px solid var(--accent-green)' : 'none',
              borderRadius: selectedPlace?.id === place.id ? '4px' : '0',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (selectedPlace?.id !== place.id) {
                e.currentTarget.style.background = '#f5f5f5';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedPlace?.id !== place.id) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <img 
              src={place.imageUrl || 'https://via.placeholder.com/48x48?text=?'} 
              alt={place.name} 
              style={{ 
                width: 48, 
                height: 48, 
                objectFit: 'cover', 
                border: '2px solid #222', 
                background: '#fff', 
                borderRadius: 0 
              }} 
            />
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: 700, 
                fontSize: '0.8rem', 
                color: '#222', 
                fontFamily: "'Press Start 2P', monospace",
                lineHeight: 1.2,
                marginBottom: '4px'
              }}>
                {place.name}
              </div>
              <div style={{ 
                fontSize: '0.7rem', 
                color: '#444', 
                fontFamily: "'VT323', monospace",
                fontStyle: 'italic'
              }}>
                {place.category}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coluna dos detalhes do lugar selecionado */}
      <div style={{
        flex: '2 1 500px',
        minWidth: 320,
        maxWidth: 900,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        background: '#fff',
        border: '2px solid #222',
        borderRadius: 0,
        boxShadow: '4px 4px 0 #222',
        padding: 24,
        height: 'calc(100vh - 120px)',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {selectedPlace ? (
          <>
            <h1 style={{
              fontFamily: "'Press Start 2P', monospace",
              color: 'var(--accent-green)',
              fontSize: '1.4rem',
              textAlign: 'center',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '1px',
              textShadow: '2px 2px 0 #222',
              marginBottom: 16
            }}>
              {selectedPlace.name}
            </h1>
            
            <div style={{
              fontSize: '1rem',
              color: '#444',
              textAlign: 'center',
              fontFamily: "'VT323', monospace",
              fontStyle: 'italic',
              marginBottom: 20,
              padding: '8px 16px',
              background: '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}>
              {selectedPlace.category}
            </div>

            <img 
              src={selectedPlace.imageUrl || 'https://via.placeholder.com/400x250?text=Sem+Imagem'} 
              alt={selectedPlace.name} 
              style={{
                width: '100%',
                maxWidth: 400,
                height: 250,
                objectFit: 'cover',
                borderRadius: '8px',
                margin: '0 auto 20px auto',
                border: '3px solid #222',
                boxShadow: '4px 4px 0 #222',
                background: '#eee'
              }} 
            />

            <div style={{
              fontSize: '1rem',
              color: '#222',
              lineHeight: 1.6,
              textAlign: 'justify',
              fontFamily: "'Georgia', serif",
              marginBottom: 20,
              padding: '16px',
              background: '#f9f9f9',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}>
              {selectedPlace.description}
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '16px',
              background: '#f0f8f0',
              border: '1px solid var(--accent-green)',
              borderRadius: '4px'
            }}>
              <div style={{
                fontSize: '0.9rem',
                color: '#222',
                fontFamily: "'VT323', monospace"
              }}>
                <strong>📍 Endereço:</strong> {selectedPlace.address}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#222',
                fontFamily: "'VT323', monospace"
              }}>
                <strong>🌍 Coordenadas:</strong> {selectedPlace.latitude}, {selectedPlace.longitude}
              </div>
            </div>

            {/* Mapa do local */}
            <div style={{
              width: '100%',
              minHeight: 350,
              height: 'auto',
              marginTop: '20px',
              border: '3px solid #222',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '4px 4px 0 #222',
              flexShrink: 0
            }}>
              <MapContainer
                center={[selectedPlace.latitude, selectedPlace.longitude]}
                zoom={15}
                style={{ width: '100%', height: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <Marker 
                  position={[selectedPlace.latitude, selectedPlace.longitude]} 
                  icon={markerIcon}
                >
                  <Popup>
                    <div style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: '0.8rem',
                      textAlign: 'center'
                    }}>
                      <strong>{selectedPlace.name}</strong>
                      <br />
                      <span style={{
                        fontFamily: "'VT323', monospace",
                        fontSize: '0.9rem',
                        fontStyle: 'italic'
                      }}>
                        {selectedPlace.category}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#888',
            fontFamily: "'VT323', monospace",
            fontSize: '1.2rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '16px'
            }}>
              📍
            </div>
            <div style={{
              marginBottom: '8px',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '1rem',
              color: '#222'
            }}>
              Selecione um lugar
            </div>
            <div style={{ marginBottom: '20px' }}>
              Clique em um lugar na lista ao lado para ver seus detalhes
            </div>

            {/* Mapa geral com todos os lugares */}
            <div style={{
              width: '100%',
              minHeight: 450,
              height: 'auto',
              border: '3px solid #222',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '4px 4px 0 #222',
              flexShrink: 0
            }}>
              <MapContainer
                center={[-23.9618, -46.3322]} // Coordenadas de Santos
                zoom={12}
                style={{ width: '100%', height: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {places.map(place => (
                  <Marker 
                    key={place.id}
                    position={[place.latitude, place.longitude]} 
                    icon={markerIcon}
                  >
                    <Popup>
                      <div style={{
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: '0.7rem',
                        textAlign: 'center',
                        maxWidth: '200px'
                      }}>
                        <strong>{place.name}</strong>
                        <br />
                        <span style={{
                          fontFamily: "'VT323', monospace",
                          fontSize: '0.8rem',
                          fontStyle: 'italic'
                        }}>
                          {place.category}
                        </span>
                        <br />
                        <span style={{
                          fontFamily: "'VT323', monospace",
                          fontSize: '0.7rem',
                          color: '#666'
                        }}>
                          {place.address}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* Botão de sugestão */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '20px'
            }}>
              <button
                onClick={handleShowSuggestionForm}
                style={{
                  background: 'var(--accent-green)',
                  color: 'var(--bg-primary)',
                  border: '3px solid #222',
                  borderRadius: '4px',
                  padding: '12px 20px',
                  fontSize: '0.9rem',
                  fontFamily: "'Press Start 2P', monospace",
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: '4px 4px 0 #222',
                  transition: 'all 0.1s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-2px, -2px)';
                  e.currentTarget.style.boxShadow = '6px 6px 0 #222';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = '4px 4px 0 #222';
                }}
              >
                💡 Sentiu falta de algum lugar? Envie uma sugestão!
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de sugestão */}
      {showSuggestionForm && (
        <PlaceSuggestionForm onClose={handleCloseSuggestionForm} />
      )}
    </div>
  );
}; 