import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock para o Leaflet
vi.mock('leaflet', () => ({
  Icon: {
    Default: {
      prototype: {
        _getIconUrl: vi.fn()
      },
      mergeOptions: vi.fn()
    }
  },
  icon: vi.fn(),
  marker: vi.fn(),
  map: vi.fn(),
  tileLayer: vi.fn(),
  circle: vi.fn(),
  latLng: vi.fn(),
  polygon: vi.fn()
}));

// Mock para react-leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: vi.fn(),
  TileLayer: vi.fn(),
  Marker: vi.fn(),
  Polyline: vi.fn(),
  GeoJSON: vi.fn(),
  useMap: vi.fn()
}));

// Mock para o L.LatLng do Leaflet
class LatLng {
  lat: number;
  lng: number;

  constructor(lat: number, lng: number) {
    this.lat = lat;
    this.lng = lng;
  }
}

// Mock para o módulo Leaflet
vi.mock('leaflet', () => ({
  LatLng: LatLng
})); 