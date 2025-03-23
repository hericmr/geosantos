import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useMapGame } from '../useMapGame';
import { useGameState } from '../useGameState';
import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import * as L from 'leaflet';

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
    const { result } = renderHook(() => useMapGame(mockGeoJsonData));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.isPhaseTwo).toBe(false);
    expect(result.current.showPhaseTwoIntro).toBe(false);
    expect(result.current.showPhaseOneMessage).toBe(false);
    expect(result.current.distanceCircle).toBe(null);
  });

  it('should handle start game correctly', async () => {
    const { result } = renderHook(() => useMapGame(mockGeoJsonData));

    await act(async () => {
      result.current.handleStartGame();
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.showPhaseOneMessage).toBe(false);
    expect(mockStartGame).toHaveBeenCalled();
  });

  it('should handle volume change correctly', async () => {
    const { result } = renderHook(() => useMapGame(mockGeoJsonData));

    await act(async () => {
      result.current.handleVolumeChange({
        target: { value: '0.5' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(mockUpdateGameState).toHaveBeenCalledWith({ volume: 0.5 });
    expect(mockUpdateGameState).toHaveBeenCalledWith({ isMuted: false });
  });

  it('should handle toggle mute correctly', async () => {
    const { result } = renderHook(() => useMapGame(mockGeoJsonData));

    await act(async () => {
      result.current.handleToggleMute();
    });

    expect(mockUpdateGameState).toHaveBeenCalledWith({ isMuted: true });
  });

  it('should handle pause game correctly', async () => {
    const { result } = renderHook(() => useMapGame(mockGeoJsonData));

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
    const { result } = renderHook(() => useMapGame(mockGeoJsonData));

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

  it('should handle phase two next round correctly', async () => {
    const { result } = renderHook(() => useMapGame(mockGeoJsonData));

    // Configurar o estado inicial para simular um jogo em andamento
    mockGameState.gameStarted = true;
    mockGameState.isCountingDown = true;
    mockGameState.score = 9900; // Pontuação próxima do limite
    mockGameState.timeLeft = 10; // Tempo máximo para maximizar a pontuação

    // Configurar o geoJsonRef com um bairro diferente do atual
    const mockGeoJsonLayerWithDifferentNeighborhood = {
      getLayers: vi.fn().mockReturnValue([{
        feature: {
          properties: {
            NOME: 'Different Neighborhood'
          }
        },
        getBounds: vi.fn().mockReturnValue({
          contains: vi.fn().mockReturnValue(true)
        }),
        getLatLngs: vi.fn().mockReturnValue([[
          { lat: 0, lng: 0 },
          { lat: 1, lng: 1 },
          { lat: 0, lng: 1 }
        ]]),
        instanceof: vi.fn().mockReturnValue(true)
      }])
    };

    Object.defineProperty(result.current.geoJsonRef, 'current', {
      value: mockGeoJsonLayerWithDifferentNeighborhood,
      writable: true
    });

    // Simular um clique no mapa que vai ativar a fase 2
    await act(async () => {
      result.current.handleMapClick({ lat: 0, lng: 0 } as L.LatLng);
    });

    // Simular o tempo necessário para a transição da fase 2
    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    // Simular a atualização do estado após o clique
    const lastCall = mockUpdateGameState.mock.calls[mockUpdateGameState.mock.calls.length - 1][0];
    const newScore = lastCall.score;
    mockGameState.score = newScore;

    // Simular a próxima rodada na fase 2
    await act(async () => {
      // Forçar a fase 2
      result.current.isPhaseTwo = true;
      result.current.handleNextRound(mockGeoJsonData);
    });

    // Verificar se a próxima rodada foi configurada com o tempo da fase 2
    const nextRoundCall = mockUpdateGameState.mock.calls[mockUpdateGameState.mock.calls.length - 1][0];
    expect(nextRoundCall.roundInitialTime).toBe(5);
    expect(nextRoundCall.timeLeft).toBe(5);
    expect(nextRoundCall.isCountingDown).toBe(true);
    expect(nextRoundCall.isPaused).toBe(false);
  });

  it('should handle map click correctly when game is not started', async () => {
    const { result } = renderHook(() => useMapGame(mockGeoJsonData));

    // Garantir que o jogo não está iniciado
    mockGameState.gameStarted = false;
    mockGameState.isCountingDown = false;

    await act(async () => {
      result.current.handleMapClick({ lat: 0, lng: 0 } as L.LatLng);
    });

    expect(mockUpdateGameState).not.toHaveBeenCalled();
  });

  it('should handle map click correctly when game is paused', async () => {
    const { result } = renderHook(() => useMapGame(mockGeoJsonData));

    await act(async () => {
      result.current.isPaused = true;
      result.current.handleMapClick({ lat: 0, lng: 0 } as L.LatLng);
    });

    expect(mockUpdateGameState).not.toHaveBeenCalled();
  });

  it('should handle setShowPhaseTwoIntro correctly', async () => {
    const { result } = renderHook(() => useMapGame(mockGeoJsonData));

    await act(async () => {
      result.current.setShowPhaseTwoIntro(true);
    });

    expect(result.current.showPhaseTwoIntro).toBe(true);
  });

  it('should handle setDistanceCircle correctly', async () => {
    const { result } = renderHook(() => useMapGame(mockGeoJsonData));

    await act(async () => {
      result.current.setDistanceCircle({ center: { lat: 0, lng: 0 } as L.LatLng, radius: 100 });
    });

    expect(result.current.distanceCircle).toEqual({
      center: { lat: 0, lng: 0 },
      radius: 100
    });
  });
}); 