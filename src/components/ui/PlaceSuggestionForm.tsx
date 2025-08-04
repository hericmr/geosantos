import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { LatLng } from 'leaflet';
import { MapEvents } from '../game/MapEvents';
import { ArrowLeft } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface PlaceSuggestionFormProps {
  onClose: () => void;
}

const initialState = {
  name: '',
  description: '',
  latitude: '',
  longitude: '',
  category: '',
  address: '',
  imageUrl: '',
  suggestedBy: '',
  email: '',
  reason: ''
};

// Ícone customizado para o marcador
const markerIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
});

export const PlaceSuggestionForm: React.FC<PlaceSuggestionFormProps> = ({ onClose }) => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<LatLng | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handler para clique no mapa
  const handleMapClick = (latlng: LatLng) => {
    setSelectedPosition(latlng);
    setForm(f => ({ ...f, latitude: latlng.lat.toString(), longitude: latlng.lng.toString() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      if (!form.name || !form.latitude || !form.longitude) {
        setError('Preencha pelo menos nome, latitude e longitude!');
        setLoading(false);
        return;
      }

      // Criar o corpo do email
      const emailBody = `
Nova sugestão de lugar famoso para o GeoSantos!

Dados do lugar:
- Nome: ${form.name}
- Descrição: ${form.description}
- Categoria: ${form.category}
- Endereço: ${form.address}
- Coordenadas: ${form.latitude}, ${form.longitude}
- URL da imagem: ${form.imageUrl}

Dados de quem sugeriu:
- Nome: ${form.suggestedBy}
- Email: ${form.email}
- Motivo da sugestão: ${form.reason}

---
Enviado automaticamente pelo formulário de sugestões do GeoSantos
      `;

      // Enviar email usando mailto
      const mailtoLink = `mailto:heric.moura@unifesp.br?subject=Sugestão de lugar famoso: ${form.name}&body=${encodeURIComponent(emailBody)}`;
      
      // Abrir o cliente de email padrão
      window.open(mailtoLink, '_blank');
      
      setSuccess('Sugestão enviada com sucesso! Obrigado por contribuir com o GeoSantos!');
      setForm(initialState);
      setSelectedPosition(null);
      
      // Fechar o formulário após 3 segundos
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (err: any) {
      setError('Erro inesperado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm(initialState);
    setSelectedPosition(null);
    setSuccess(null);
    setError(null);
    onClose();
  };

  // Coordenadas iniciais do mapa (Santos)
  const mapLat = form.latitude ? parseFloat(form.latitude) : -23.9618;
  const mapLng = form.longitude ? parseFloat(form.longitude) : -46.3322;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: 1200,
        width: '100%',
        maxHeight: '90vh',
        background: 'var(--bg-secondary)',
        border: '4px solid var(--accent-blue)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        padding: 32,
        fontFamily: "'LaCartoonerie', sans-serif",
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'row',
        gap: 32,
        flexWrap: 'wrap',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Coluna do formulário */}
        <div style={{
          flex: '1 1 400px',
          minWidth: 320,
          maxWidth: 600,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}>
          {/* Header com botão de voltar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
            gap: 16
          }}>
            <button
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'var(--bg-accent)',
                border: '2px solid var(--text-primary)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontFamily: "'LaCartoonerie', sans-serif",
                fontSize: '0.9rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease',
                boxShadow: '2px 2px 0 #222'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-blue)';
                e.currentTarget.style.color = 'var(--bg-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-accent)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
            
                      <h1 style={{
            fontFamily: "'LaCartoonerie', sans-serif",
            color: 'var(--accent-green)',
            fontSize: '1.3rem',
            textAlign: 'center',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            letterSpacing: '1px',
            textShadow: '2px 2px 0 #222',
            margin: 0,
            flex: 1
          }}>
            Sugerir Novo Lugar
          </h1>
          
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            fontFamily: "'LaCartoonerie', sans-serif",
            lineHeight: 1.5,
            margin: '16px 0 0 0',
            maxWidth: '600px'
          }}>
            Conhece um lugar interessante em Santos que deveria estar no jogo? 
            Sugira novos pontos turísticos, locais históricos ou lugares especiais 
            para que outros jogadores possam descobrir!
          </p>
            
            {/* Espaçador para manter o título centralizado */}
            <div style={{ width: '80px' }}></div>
          </div>

          {/* Mapa interativo para selecionar coordenadas */}
          <div style={{ 
            width: '100%', 
            height: 300, 
            marginBottom: 16, 
            border: '2px solid var(--text-primary)', 
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden'
          }}>
            <MapContainer
              center={selectedPosition ? [selectedPosition.lat, selectedPosition.lng] : [-23.9676, -46.3287]}
              zoom={13}
              style={{ width: '100%', height: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <MapEvents onClick={handleMapClick} />
              {selectedPosition && (
                <Marker position={selectedPosition} icon={markerIcon} />
              )}
            </MapContainer>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Nome do lugar" style={inputStyle} required />
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descrição do lugar" style={{ ...inputStyle, minHeight: 60 }} />
            <input name="latitude" value={form.latitude} onChange={handleChange} placeholder="Latitude (clique no mapa)" style={inputStyle} type="number" step="any" required />
            <input name="longitude" value={form.longitude} onChange={handleChange} placeholder="Longitude (clique no mapa)" style={inputStyle} type="number" step="any" required />
            <input name="category" value={form.category} onChange={handleChange} placeholder="Categoria (ex: Turístico, Histórico, Cultural)" style={inputStyle} />
            <input name="address" value={form.address} onChange={handleChange} placeholder="Endereço completo" style={inputStyle} />
            <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="URL da imagem (opcional)" style={inputStyle} />
            
            <div style={{ 
              borderTop: '2px solid var(--accent-blue)', 
              paddingTop: 20, 
              marginTop: 16,
              borderRadius: 'var(--radius-sm)'
            }}>
              <input name="suggestedBy" value={form.suggestedBy} onChange={handleChange} placeholder="Seu nome" style={inputStyle} required />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Seu email" style={inputStyle} type="email" required />
              <textarea name="reason" value={form.reason} onChange={handleChange} placeholder="Por que você sugere este lugar? (opcional)" style={{ ...inputStyle, minHeight: 60 }} />
            </div>

            {error && (
              <div style={{ 
                color: 'var(--accent-red)', 
                fontSize: '0.9rem', 
                fontFamily: "'LaCartoonerie', sans-serif", 
                padding: '12px', 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '2px solid var(--accent-red)',
                borderRadius: 'var(--radius-md)',
                marginTop: 8
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ 
                color: 'var(--accent-green)', 
                fontSize: '0.9rem', 
                fontFamily: "'LaCartoonerie', sans-serif", 
                padding: '12px', 
                background: 'rgba(16, 185, 129, 0.1)', 
                border: '2px solid var(--accent-green)',
                borderRadius: 'var(--radius-md)',
                marginTop: 8
              }}>
                {success}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={loading} style={{
                ...inputStyle,
                background: 'var(--accent-green)',
                color: 'var(--bg-primary)',
                border: '3px solid #222',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: 14,
                marginTop: 8,
                flex: 1,
                fontFamily: "'LaCartoonerie', sans-serif",
                textTransform: 'uppercase',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '4px 4px 0 #222';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '2px 2px 0 #222';
                }
              }}
              >
                {loading ? 'Enviando...' : 'Enviar Sugestão'}
              </button>
              <button type="button" onClick={handleCancel} style={{
                ...inputStyle,
                background: 'var(--bg-accent)',
                color: 'var(--text-primary)',
                border: '2px solid var(--text-primary)',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: 14,
                marginTop: 8,
                fontFamily: "'LaCartoonerie', sans-serif",
                textTransform: 'uppercase',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-red)';
                e.currentTarget.style.color = 'var(--bg-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-accent)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        {/* Coluna de instruções */}
        <div style={{
          flex: '1 1 300px',
          minWidth: 280,
          maxWidth: 500,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: 'var(--bg-accent)',
          border: '2px solid var(--accent-orange)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          padding: 24,
        }}>
          <h2 style={{
            fontSize: '1.2rem',
            color: 'var(--accent-orange)',
            fontFamily: "'LaCartoonerie', sans-serif",
            textTransform: 'uppercase',
            textAlign: 'center',
            fontWeight: 'bold',
            letterSpacing: '1px',
            marginBottom: 8
          }}>
            Como Sugerir
          </h2>

          <div style={{
            fontSize: '1rem',
            color: 'var(--text-primary)',
            fontFamily: "'LaCartoonerie', sans-serif",
            lineHeight: 1.6
          }}>
            <p style={{ marginBottom: '16px' }}>
              <strong>1. Clique no mapa</strong> para selecionar a localização exata do lugar
            </p>
            <p style={{ marginBottom: '16px' }}>
              <strong>2. Preencha os dados</strong> do lugar (nome, descrição, categoria, etc.)
            </p>
            <p style={{ marginBottom: '16px' }}>
              <strong>3. Adicione seus dados</strong> para que possamos entrar em contato
            </p>
            <p style={{ marginBottom: '16px' }}>
              <strong>4. Clique em "Enviar Sugestão"</strong> para abrir seu cliente de email
            </p>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '2px solid var(--accent-green)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            fontSize: '0.9rem',
            fontFamily: "'LaCartoonerie', sans-serif",
            color: 'var(--text-primary)'
          }}>
            <strong style={{ color: 'var(--accent-green)' }}>💡 Dicas:</strong>
            <ul style={{ margin: '12px 0 0 20px', padding: 0, lineHeight: 1.5 }}>
              <li>Lugares históricos e culturais são prioridade</li>
              <li>Inclua uma imagem se possível</li>
              <li>Descreva por que o lugar é importante</li>
              <li>Verifique se as coordenadas estão corretas</li>
            </ul>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '2px solid var(--accent-orange)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            fontSize: '0.9rem',
            fontFamily: "'LaCartoonerie', sans-serif",
            color: 'var(--text-primary)'
          }}>
            <strong style={{ color: 'var(--accent-orange)' }}>⚠️ Importante:</strong>
            <br />
            Sua sugestão será analisada pela equipe do GeoSantos. Lugares aprovados serão adicionados ao jogo em futuras atualizações.
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  fontFamily: "'LaCartoonerie', sans-serif",
  fontSize: '1rem',
  border: '2px solid var(--text-primary)',
  borderRadius: 'var(--radius-md)',
  padding: '12px 16px',
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  boxShadow: 'var(--shadow-md)',
  outline: 'none',
  transition: 'all 0.2s ease',
  width: '100%',
  boxSizing: 'border-box'
}; 