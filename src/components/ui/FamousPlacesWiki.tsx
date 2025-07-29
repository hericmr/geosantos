import React from 'react';
import { useFamousPlaces } from '../../hooks/useFamousPlaces';

export const FamousPlacesWiki: React.FC = () => {
  const { places, isLoading, error } = useFamousPlaces();

  const handleVoltar = () => {
    window.history.back();
  };

  return (
    <div style={{
      maxWidth: 1100,
      margin: '40px auto',
      padding: 24,
      background: '#fff',
      borderRadius: 8,
      boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
      fontFamily: 'Georgia, serif',
      color: '#222',
      height: '80vh',
      overflowY: 'auto',
    }}>
      {/* Botão Voltar */}
      <button
        onClick={handleVoltar}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: '#1a4d2e',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '12px 20px',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: '20px',
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
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 700,
        textAlign: 'center',
        marginBottom: 32,
        color: '#1a4d2e',
        letterSpacing: 1
      }}>
        Conheça os Locais Importantes
      </h1>
      <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#444', marginBottom: 40 }}>
        Leia sobre os principais pontos históricos, culturais e turísticos de Santos, São Vicente e região.
      </p>
      {isLoading && <div style={{ textAlign: 'center', color: '#888' }}>Carregando lugares...</div>}
      {error && <div style={{ textAlign: 'center', color: 'red' }}>Erro ao carregar lugares: {error}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
        {places.map(place => (
          <article key={place.id} style={{
            background: '#f9f9f9',
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            maxWidth: 400,
            minWidth: 300,
            flex: '1 1 320px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            marginBottom: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 24
          }}>
            <img src={place.imageUrl || 'https://via.placeholder.com/320x180?text=Sem+Imagem'} alt={place.name} style={{
              width: '100%',
              maxWidth: 320,
              height: 180,
              objectFit: 'cover',
              borderRadius: 6,
              marginBottom: 16,
              border: '1px solid #ccc',
              background: '#eee'
            }} />
            <h2 style={{ fontSize: '1.4rem', color: '#1a4d2e', margin: '8px 0 8px 0', textAlign: 'center' }}>{place.name}</h2>
            <div style={{ fontSize: '1rem', color: '#555', marginBottom: 12, textAlign: 'center', fontStyle: 'italic' }}>{place.category}</div>
            <div style={{ fontSize: '1.05rem', color: '#222', marginBottom: 12, textAlign: 'justify' }}>{place.description}</div>
            <div style={{ fontSize: '0.95rem', color: '#444', marginBottom: 6 }}><b>Endereço:</b> {place.address}</div>
            <div style={{ fontSize: '0.95rem', color: '#444', marginBottom: 6 }}><b>Coordenadas:</b> {place.latitude}, {place.longitude}</div>
          </article>
        ))}
      </div>
    </div>
  );
}; 