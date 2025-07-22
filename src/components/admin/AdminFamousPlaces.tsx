import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { LatLng } from 'leaflet';
import { MapEvents } from '../game/MapEvents';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const initialState = {
  id: undefined,
  name: '',
  description: '',
  latitude: '',
  longitude: '',
  category: '',
  address: '',
  imageUrl: '',
};

// Ícone customizado para o marcador
const markerIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
});

export const AdminFamousPlaces: React.FC = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [selectedPosition, setSelectedPosition] = useState<LatLng | null>(null);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('famous_places')
        .select('*')
        .order('name', { ascending: true });
      if (error) setError('Erro ao buscar lugares: ' + error.message);
      else setPlaces(data || []);
    } catch (err: any) {
      setError('Erro inesperado ao buscar lugares: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMapPick = (lat: number, lng: number) => {
    setForm(f => ({ ...f, latitude: lat.toString(), longitude: lng.toString() }));
  };

  // Handler para clique no mapa
  const handleMapClick = (latlng: LatLng) => {
    setSelectedPosition(latlng);
    setForm(f => ({ ...f, latitude: latlng.lat.toString(), longitude: latlng.lng.toString() }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('famous-places-images')
        .upload(fileName, file, { upsert: false });
      if (error) {
        setError('Erro ao fazer upload da imagem: ' + error.message);
        setUploading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage
        .from('famous-places-images')
        .getPublicUrl(fileName);
      const publicUrl = publicUrlData?.publicUrl;
      if (publicUrl) {
        setForm(f => ({ ...f, imageUrl: publicUrl }));
        setImagePreview(publicUrl);
        setSuccess('Imagem enviada com sucesso!');
      } else {
        setError('Não foi possível obter a URL da imagem.');
      }
    } catch (err: any) {
      setError('Erro inesperado no upload: ' + err.message);
    } finally {
      setUploading(false);
    }
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
      if (editingId) {
        // Update
        const { error } = await supabase
          .from('famous_places')
          .update({
            name: form.name,
            description: form.description,
            latitude: parseFloat(form.latitude),
            longitude: parseFloat(form.longitude),
            category: form.category,
            address: form.address,
            image_url: form.imageUrl,
          })
          .eq('id', editingId);
        if (error) setError('Erro ao atualizar: ' + error.message);
        else setSuccess('Lugar atualizado com sucesso!');
      } else {
        // Insert
        const { error } = await supabase
          .from('famous_places')
          .insert([
            {
              name: form.name,
              description: form.description,
              latitude: parseFloat(form.latitude),
              longitude: parseFloat(form.longitude),
              category: form.category,
              address: form.address,
              image_url: form.imageUrl,
            },
          ]);
        if (error) setError('Erro ao cadastrar: ' + error.message);
        else setSuccess('Lugar cadastrado com sucesso!');
      }
      setForm(initialState);
      setImagePreview(null);
      setEditingId(undefined);
      fetchPlaces();
    } catch (err: any) {
      setError('Erro inesperado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (place: any) => {
    setForm({
      id: place.id,
      name: place.name || '',
      description: place.description || '',
      latitude: place.latitude?.toString() || '',
      longitude: place.longitude?.toString() || '',
      category: place.category || '',
      address: place.address || '',
      imageUrl: place.image_url || '',
    });
    setImagePreview(place.image_url || null);
    setEditingId(place.id);
    setSuccess(null);
    setError(null);
  };

  const handleCancelEdit = () => {
    setForm(initialState);
    setImagePreview(null);
    setEditingId(undefined);
    setSuccess(null);
    setError(null);
  };

  // Coordenadas iniciais do mapa (Santos)
  const mapLat = form.latitude ? parseFloat(form.latitude) : -23.9618;
  const mapLng = form.longitude ? parseFloat(form.longitude) : -46.3322;

  return (
    <div style={{
      maxWidth: 520,
      margin: '40px auto',
      background: 'var(--bg-secondary)',
      border: '4px solid var(--accent-green)',
      borderRadius: 0,
      boxShadow: '8px 8px 0 #222, 0 0 0 4px #fff',
      padding: 32,
      fontFamily: "'Press Start 2P', monospace",
      color: 'var(--text-primary)'
    }}>
      <h1 style={{
        fontFamily: "'Press Start 2P', monospace",
        color: 'var(--accent-green)',
        fontSize: '1.1rem',
        textAlign: 'center',
        textTransform: 'uppercase',
        fontWeight: 700,
        letterSpacing: '1px',
        textShadow: '2px 2px 0 #222',
        marginBottom: 24
      }}>{editingId ? 'Editar Lugar Famoso' : 'Cadastrar Lugar Famoso'}</h1>
      {/* Mapa interativo para selecionar coordenadas */}
      <div style={{ width: '100%', height: 300, marginBottom: 16, border: '2px solid #222', boxShadow: '2px 2px 0 #222' }}>
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
            <Marker position={selectedPosition} />
          )}
        </MapContainer>
      </div>
      {/* Fim do mapa */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nome" style={inputStyle} />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descrição" style={{ ...inputStyle, minHeight: 60 }} />
        <input name="latitude" value={form.latitude} onChange={handleChange} placeholder="Latitude" style={inputStyle} type="number" step="any" />
        <input name="longitude" value={form.longitude} onChange={handleChange} placeholder="Longitude" style={inputStyle} type="number" step="any" />
        <input name="category" value={form.category} onChange={handleChange} placeholder="Categoria" style={inputStyle} />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Endereço" style={inputStyle} />
        <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="URL da Imagem (ou use upload)" style={inputStyle} />
        <label style={{ fontSize: 12, color: '#222', fontFamily: "'Press Start 2P', monospace" }}>
          Upload de Imagem:
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginTop: 6, fontFamily: "'Press Start 2P', monospace" }} />
        </label>
        {uploading && <div style={{ color: '#888', fontSize: 12 }}>Enviando imagem...</div>}
        {imagePreview && (
          <img src={imagePreview} alt="Preview" style={{ width: '100%', maxWidth: 180, margin: '8px auto', border: '2px solid #222', boxShadow: '2px 2px 0 #222', background: '#fff' }} />
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading} style={{
            ...inputStyle,
            background: 'var(--accent-green)',
            color: 'var(--bg-primary)',
            border: '3px solid #222',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 14,
            marginTop: 8
          }}>{loading ? (editingId ? 'Salvando...' : 'Cadastrando...') : (editingId ? 'Salvar' : 'Cadastrar')}</button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit} style={{
              ...inputStyle,
              background: 'var(--accent-red)',
              color: 'var(--bg-primary)',
              border: '3px solid #222',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
              marginTop: 8
            }}>Cancelar</button>
          )}
        </div>
      </form>
      <hr style={{ margin: '32px 0', border: 0, borderTop: '2px dashed #222' }} />
      <h2 style={{ fontSize: 15, color: '#222', marginBottom: 12, fontFamily: "'Press Start 2P', monospace", textTransform: 'uppercase' }}>Lugares já cadastrados</h2>
      <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid #222', background: '#fff', borderRadius: 0, boxShadow: '2px 2px 0 #222', padding: 8 }}>
        {places.length === 0 && <div style={{ color: '#888', fontSize: 13 }}>Nenhum lugar cadastrado ainda.</div>}
        {places.map(place => (
          <div key={place.id} style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px dashed #ccc', padding: '8px 0' }}>
            <img src={place.image_url} alt={place.name} style={{ width: 48, height: 48, objectFit: 'cover', border: '2px solid #222', background: '#fff', borderRadius: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#222', fontFamily: "'Press Start 2P', monospace" }}>{place.name}</div>
              <div style={{ fontSize: 12, color: '#444', fontFamily: "'VT323', monospace" }}>{place.category}</div>
              <div style={{ fontSize: 11, color: '#888', fontFamily: "'VT323', monospace" }}>{place.latitude}, {place.longitude}</div>
            </div>
            <button onClick={() => handleEdit(place)} style={{
              ...inputStyle,
              background: 'var(--accent-yellow)',
              color: '#222',
              border: '2px solid #222',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              padding: '6px 12px',
              minWidth: 60
            }}>Editar</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', monospace",
  fontSize: 13,
  border: '2px solid #222',
  borderRadius: 0,
  padding: '10px 8px',
  background: '#fff',
  color: '#222',
  boxShadow: '2px 2px 0 #222',
  outline: 'none',
}; 