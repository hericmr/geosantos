import { Feature, FeatureCollection } from 'geojson';
import { LatLng } from 'leaflet';
import { GeoJSON as ReactGeoJSON } from 'react-leaflet';
import { GameMode, FamousPlace } from './famousPlaces';

export interface MapProps {
  center: [number, number];
  zoom: number;
}

export interface GameState {
  currentNeighborhood: string;
  score: number;
  timeLeft: number;
  totalTimeLeft: number;
  roundInitialTime: number;
  roundNumber: number;
  gameOver: boolean;
  gameStarted: boolean;
  isCountingDown: boolean;
  isPaused: boolean;
  clickedPosition: L.LatLng | null;
  showFeedback: boolean;
  feedbackOpacity: number;
  feedbackProgress: number;
  feedbackMessage: string;
  revealedNeighborhoods: Set<string>;
  clickTime: number;
  timeBonus: number;
  isMuted: boolean;
  volume: number;
  arrowPath: [LatLng, LatLng] | null;
  lastClickTime: number;
  totalDistance: number;
  gameMode?: GameMode; // novo campo opcional para modo de jogo
}

export interface ScoreCalculation {
  total: number;
  distancePoints: number;
  timePoints: number;
}

export interface AudioControlsProps {
  isMuted: boolean;
  volume: number;
  onVolumeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleMute: () => void;
}

export interface GameControlsProps {
  gameStarted: boolean;
  currentNeighborhood: string;
  timeLeft: number;
  totalTimeLeft: number;
  roundNumber: number;
  roundInitialTime: number;
  score: number;
  onStartGame: () => void;
  getProgressBarColor: (timeLeft: number, roundInitialTime: number) => string;
  currentMode?: GameMode;
  onModeChange?: (mode: GameMode) => void;
  currentFamousPlace?: FamousPlace;
}

export interface FeedbackPanelProps {
  showFeedback: boolean;
  clickedPosition: LatLng | null;
  arrowPath: [LatLng, LatLng] | null;
  clickTime: number;
  feedbackProgress: number;
  onNextRound: (geoJsonData: FeatureCollection) => void;
  calculateDistance: (point1: LatLng, point2: LatLng) => number;
  calculateScore: (distance: number, timeLeft: number) => ScoreCalculation;
  getProgressBarColor: (timeLeft: number, roundInitialTime: number) => string;
  geoJsonData: FeatureCollection | null;
  gameOver: boolean;
  onPauseGame: () => void;
  score: number;
  currentNeighborhood: string;
}

export interface MapEventsProps {
  onClick: (latlng: LatLng) => void;
}

export interface GeoJSONLayerProps {
  geoJsonData: FeatureCollection;
  revealedNeighborhoods: Set<string>;
  currentNeighborhood: string;
  onMapClick: (latlng: LatLng) => void;
  geoJsonRef: React.RefObject<L.GeoJSON>;
}

export interface Coordenada {
    x: number;
    y: number;
}

export interface BairroData {
    nome: string;
    coordenadas: Coordenada[];
    pontoCentral: Coordenada;
}

export interface ParticleConfig {
    speed: { min: number; max: number };
    angle: { min: number; max: number };
    scale: { start: number; end: number };
    alpha: { start: number; end: number };
    lifespan: number;
    quantity: number;
    blendMode: string;
    tint: number;
} 