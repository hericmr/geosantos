import { Feature, FeatureCollection } from 'geojson';
import { LatLng } from 'leaflet';
import { GeoJSON as ReactGeoJSON } from 'react-leaflet';

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
  clickedPosition: LatLng | null;
  lastClickTime: number;
  feedbackMessage: string;
  revealedNeighborhoods: Set<string>;
  wrongNeighborhood: string;
  arrowPath: [LatLng, LatLng] | null;
  isMuted: boolean;
  volume: number;
  showFeedback: boolean;
  clickTime: number;
  feedbackOpacity: number;
  feedbackProgress: number;
  timeBonus: number;
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