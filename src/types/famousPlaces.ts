export interface FamousPlace {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  address: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface FamousPlaceGameState {
  currentPlace: FamousPlace | null;
  places: FamousPlace[];
  isLoading: boolean;
  error: string | null;
}

export type GameMode = 'neighborhoods' | 'famous_places';

export interface GameModeState {
  currentMode: GameMode;
  isModeSelectorVisible: boolean;
} 