import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FeedbackPanel } from '../FeedbackPanel';
import { LatLng } from 'leaflet';
import { FeatureCollection } from 'geojson';

describe('FeedbackPanel', () => {
  const mockProps = {
    showFeedback: true,
    clickedPosition: new LatLng(-23.9618, -46.3322),
    arrowPath: [new LatLng(-23.9618, -46.3322), new LatLng(-23.9619, -46.3323)] as [LatLng, LatLng],
    clickTime: 5,
    feedbackProgress: 50,
    onNextRound: vi.fn(),
    calculateDistance: vi.fn().mockReturnValue(100),
    calculateScore: vi.fn().mockReturnValue({ score: 800, timeBonus: 1.5 }),
    getProgressBarColor: vi.fn(),
    geoJsonData: { type: 'FeatureCollection', features: [] } as FeatureCollection,
    gameOver: false,
    onPauseGame: vi.fn(),
    score: 1000,
    currentNeighborhood: 'Test Neighborhood'
  };

  it('renders nothing when showFeedback is false', () => {
    const { container } = render(
      <FeedbackPanel
        {...mockProps}
        showFeedback={false}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders GameOverPanel when game is over', () => {
    const { getByText } = render(
      <FeedbackPanel
        {...mockProps}
        gameOver={true}
      />
    );
    expect(getByText('Game Over')).toBeInTheDocument();
  });

  it('renders FeedbackMessage with correct message for high score', () => {
    const { getByText } = render(
      <FeedbackPanel {...mockProps} />
    );
    expect(getByText('Muito bem! Você conhece mesmo Santos!')).toBeInTheDocument();
  });

  it('renders FeedbackMessage with time bonus', () => {
    const { getByText } = render(
      <FeedbackPanel {...mockProps} />
    );
    expect(getByText('⚡ +1.50s')).toBeInTheDocument();
  });

  it('renders GameControls with pause button when not game over', () => {
    const { getByText } = render(
      <FeedbackPanel {...mockProps} />
    );
    expect(getByText('Pausar')).toBeInTheDocument();
    expect(getByText('Próximo')).toBeInTheDocument();
  });

  it('calculates different feedback messages based on score', () => {
    const { rerender, getByText } = render(
      <FeedbackPanel
        {...mockProps}
        calculateScore={vi.fn().mockReturnValue({ score: 600, timeBonus: 1.0 })}
      />
    );
    expect(getByText('Boa! Continue assim!')).toBeInTheDocument();

    rerender(
      <FeedbackPanel
        {...mockProps}
        calculateScore={vi.fn().mockReturnValue({ score: 300, timeBonus: 0.5 })}
      />
    );
    expect(getByText('Quase lá!')).toBeInTheDocument();

    rerender(
      <FeedbackPanel
        {...mockProps}
        calculateScore={vi.fn().mockReturnValue({ score: 100, timeBonus: 0 })}
      />
    );
    expect(getByText('Tente novamente!')).toBeInTheDocument();
  });
}); 