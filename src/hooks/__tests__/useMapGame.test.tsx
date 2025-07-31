import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useMapGame } from '../useMapGame';
import { useGameState } from '../useGameState';
import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import * as L from 'leaflet';
import { calculateDistance } from '../../utils/gameUtils';

// Mock do useGameState
vi.mock('../useGameState', () => ({
  useGameState: vi.fn()
}));

// Mock do Leaflet
vi.mock('leaflet', () => ({
  Map: vi.fn(),
  GeoJSON: vi.fn(),
  Polygon: vi.fn(),
  Layer: vi.fn(),
  LatLng: vi.fn(),
  Icon: {
    Default: {
      mergeOptions: vi.fn(),
      prototype: {}
    }
  }
}));

// Mock das funções utilitárias
jest.mock('../../utils/gameUtils', () => ({
  calculateDistance: jest.fn(),
  calculateScore: jest.fn(() => ({ total: 100, distance: 50, time: 50 }))
}));

// Mock do HTMLAudioElement
const mockAudioElement = {
  currentTime: 0,
  volume: 1,
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

describe('useMapGame', () => {
  const mockGeoJsonData: FeatureCollection<Geometry, GeoJsonProperties> = {
    type: 'FeatureCollection',
    features: []
  };

  const mockGameState = {
    gameStarted: false,
    isCountingDown: false,
    timeLeft: 10,
    score: 0,
    currentNeighborhood: 'Test Neighborhood',
    revealedNeighborhoods: new Set(),
    totalDistance: 0,
    isMuted: false,
    volume: 1
  };

  const mockUpdateGameState = vi.fn();
  const mockStartGame = vi.fn();
  const mockStartNextRound = vi.fn();
  const mockClearFeedbackTimer = vi.fn();

  // Mock do GeoJSON Layer
  const mockGeoJsonLayer = {
    getLayers: vi.fn().mockReturnValue([{
      feature: {
        properties: {
          NOME: 'Test Neighborhood'
        }
      },
      getBounds: vi.fn().mockReturnValue({
        contains: vi.fn().mockReturnValue(true)
      }),
      getLatLngs: vi.fn().mockReturnValue([[
        { lat: 0, lng: 0 },
        { lat: 1, lng: 1 },
        { lat: 0, lng: 1 }
      ]])
    }])
  };

  beforeEach(() => {
    vi.useFakeTimers();
    (useGameState as any).mockReturnValue({
      gameState: mockGameState,
      updateGameState: mockUpdateGameState,
      startGame: mockStartGame,
      startNextRound: mockStartNextRound,
      clearFeedbackTimer: mockClearFeedbackTimer,
      feedbackTimerRef: { current: null }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useMapGame(mockGeoJsonData, 'neighborhoods', null, vi.fn()));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.showPhaseOneMessage).toBe(false);
    expect(result.current.distanceCircle).toBe(null);
  });

  it('should handle start game correctly', async () => {
    const { result } = renderHook(() => useMapGame(mockGeoJsonData, 'neighborhoods', null, vi.fn()));

    await act(async () => {
      result.current.handleStartGame();
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.showPhaseOneMessage).toBe(false);
    expect(mockStartGame).toHaveBeenCalled();
  });

  it('should handle volume change correctly', async () => {
    const { result } = renderHook(() => useMapGame(mockGeoJsonData, 'neighborhoods', null, vi.fn()));

    await act(async () => {
      result.current.handleVolumeChange({
        target: { value: '0.5' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(mockUpdateGameState).toHaveBeenCalledWith({ volume: 0.5 });
    expect(mockUpdateGameState).toHaveBeenCalledWith({ isMuted: false });
  });

  it('should handle toggle mute correctly', async () => {
    const { result } = renderHook(() => useMapGame(mockGeoJsonData, 'neighborhoods', null, vi.fn()));

    await act(async () => {
      result.current.handleToggleMute();
    });

    expect(mockUpdateGameState).toHaveBeenCalledWith({ isMuted: true });
  });

  it('should handle pause game correctly', async () => {
    const { result } = renderHook(() => useMapGame(mockGeoJsonData, 'neighborhoods', null, vi.fn()));

    await act(async () => {
      result.current.handlePauseGame();
    });

    expect(result.current.isPaused).toBe(true);
    expect(mockUpdateGameState).toHaveBeenCalledWith({
      isCountingDown: false,
      isPaused: true
    });
  });

  it('should handle next round correctly', async () => {
    const { result } = renderHook(() => useMapGame(mockGeoJsonData, 'neighborhoods', null, vi.fn()));

    await act(async () => {
      result.current.handleNextRound(mockGeoJsonData);
    });

    expect(result.current.isPaused).toBe(false);
    expect(mockUpdateGameState).toHaveBeenCalledWith({
      roundInitialTime: 10,
      timeLeft: 10,
      isCountingDown: true,
      isPaused: false,
      showFeedback: false,
      feedbackOpacity: 0,
      feedbackProgress: 100,
      clickedPosition: null,
      arrowPath: null,
      revealedNeighborhoods: new Set()
    });
    expect(mockStartNextRound).toHaveBeenCalledWith(mockGeoJsonData);
  });



  it('should handle map click correctly when game is not started', async () => {
    const { result } = renderHook(() => useMapGame(mockGeoJsonData, 'neighborhoods', null, vi.fn()));

    // Garantir que o jogo não está iniciado
    mockGameState.gameStarted = false;
    mockGameState.isCountingDown = false;

    await act(async () => {
      result.current.handleMapClick({ lat: 0, lng: 0 } as L.LatLng);
    });

    expect(mockUpdateGameState).not.toHaveBeenCalled();
  });

  it('should handle map click correctly when game is paused', async () => {
    const { result } = renderHook(() => useMapGame(mockGeoJsonData, 'neighborhoods', null, vi.fn()));

    await act(async () => {
      result.current.isPaused = true;
      result.current.handleMapClick({ lat: 0, lng: 0 } as L.LatLng);
    });

    expect(mockUpdateGameState).not.toHaveBeenCalled();
  });



  it('should handle setDistanceCircle correctly', async () => {
    const { result } = renderHook(() => useMapGame(mockGeoJsonData, 'neighborhoods', null, vi.fn()));

    await act(async () => {
      result.current.setDistanceCircle({ center: { lat: 0, lng: 0 } as L.LatLng, radius: 100 });
    });

    expect(result.current.distanceCircle).toEqual({
      center: { lat: 0, lng: 0 },
      radius: 100
    });
  });
});

describe('useMapGame - Som de Erro', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not play error sound when distance is less than 500m', () => {
    const mockCalculateDistance = calculateDistance as jest.MockedFunction<typeof calculateDistance>;
    mockCalculateDistance.mockReturnValue(300); // 300m

    const { result } = renderHook(() => 
      useMapGame(mockGeoJsonData, 'famous_places', mockFamousPlace, jest.fn())
    );

    // Simular clique no mapa
    act(() => {
      result.current.handleMapClick({ lat: -23.9618, lng: -46.3322 } as any);
    });

    // Verificar se o som de erro não foi tocado
    expect(mockAudioElement.play).not.toHaveBeenCalled();
  });

  it('should play error sound when distance is greater than 500m', () => {
    const mockCalculateDistance = calculateDistance as jest.MockedFunction<typeof calculateDistance>;
    mockCalculateDistance.mockReturnValue(800); // 800m

    const { result } = renderHook(() => 
      useMapGame(mockGeoJsonData, 'famous_places', mockFamousPlace, jest.fn())
    );

    // Simular clique no mapa
    act(() => {
      result.current.handleMapClick({ lat: -23.9618, lng: -46.3322 } as any);
    });

    // Verificar se o som de erro foi tocado
    expect(mockAudioElement.play).toHaveBeenCalled();
  });

  it('should play error sound when distance is exactly 500m', () => {
    const mockCalculateDistance = calculateDistance as jest.MockedFunction<typeof calculateDistance>;
    mockCalculateDistance.mockReturnValue(500); // 500m

    const { result } = renderHook(() => 
      useMapGame(mockGeoJsonData, 'famous_places', mockFamousPlace, jest.fn())
    );

    // Simular clique no mapa
    act(() => {
      result.current.handleMapClick({ lat: -23.9618, lng: -46.3322 } as any);
    });

    // Verificar se o som de erro foi tocado (500m é maior que 500m)
    expect(mockAudioElement.play).toHaveBeenCalled();
  });

  // Dados mock necessários
  const mockGeoJsonData = {
    type: 'FeatureCollection',
    features: []
  } as any;

  const mockFamousPlace = {
    id: '1',
    name: 'Test Place',
    latitude: -23.9618,
    longitude: -46.3322,
    category: 'Test',
    description: 'Test description',
    address: 'Test address',
    imageUrl: 'test.jpg'
  };
}); 