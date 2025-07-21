import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { NeighborhoodManager } from '../NeighborhoodManager';
import { FASE_1_BAIRROS } from '../../../utils/gameConstants';

describe('NeighborhoodManager', () => {
  // Criando bairros que existem na FASE_1_BAIRROS
  const mockGeoJsonData = {
    type: 'FeatureCollection',
    features: FASE_1_BAIRROS.map(nome => ({
      type: 'Feature',
      properties: { NOME: nome },
      geometry: {
        type: 'Polygon',
        coordinates: [[]]
      }
    }))
  };

  const mockUpdateGameState = vi.fn();
  const mockGeoJsonRef = { current: { getLayers: vi.fn() } };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should select random neighborhood from available bairros', () => {
    render(
      <NeighborhoodManager
        geoJsonData={mockGeoJsonData as any}
        geoJsonRef={mockGeoJsonRef as any}
        updateGameState={mockUpdateGameState}
      />
    );

    expect(mockUpdateGameState).toHaveBeenCalledWith(
      expect.objectContaining({
        currentNeighborhood: expect.any(String)
      })
    );

    // Verificar se o bairro selecionado está na lista de FASE_1_BAIRROS
    const call = mockUpdateGameState.mock.calls[0][0];
    expect(FASE_1_BAIRROS).toContain(call.currentNeighborhood);
  });

  it('should not select neighborhood when geoJsonData is null', () => {
    render(
      <NeighborhoodManager
        geoJsonData={null}
        geoJsonRef={mockGeoJsonRef as any}
        updateGameState={mockUpdateGameState}
      />
    );

    expect(mockUpdateGameState).not.toHaveBeenCalled();
  });
}); 