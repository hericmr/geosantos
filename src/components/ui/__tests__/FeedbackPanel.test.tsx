import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedbackPanel } from '../FeedbackPanel';
import { LatLng } from 'leaflet';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('FeedbackPanel', () => {
  const mockProps = {
    showFeedback: true,
    clickedPosition: { lat: 0, lng: 0 } as LatLng,
    arrowPath: null,
    clickTime: 5,
    feedbackProgress: 50,
    onNextRound: vi.fn(),
    calculateDistance: vi.fn(),
    calculateScore: vi.fn(() => ({ total: 1000, distancePoints: 500, timePoints: 500 })),
    getProgressBarColor: vi.fn(),
    geoJsonData: null,
    gameOver: false,
    onPauseGame: vi.fn(),
    score: 1000,
    currentNeighborhood: 'Test Neighborhood'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correct neighborhood message when distance is 0', () => {
    const props = {
      ...mockProps,
      clickedPosition: { lat: 0, lng: 0 } as LatLng,
      arrowPath: null,
      calculateDistance: vi.fn(() => 0)
    };

    render(<FeedbackPanel {...props} />);
    expect(screen.getByText(/INCRÍVEL!/)).toBeInTheDocument();
    expect(screen.getByText(/Test Neighborhood/)).toBeInTheDocument();
  });

  it('renders distance when not correct neighborhood', () => {
    const props = {
      ...mockProps,
      clickedPosition: { lat: 0, lng: 0 } as LatLng,
      arrowPath: [
        { lat: 0, lng: 0 } as LatLng,
        { lat: 1, lng: 1 } as LatLng
      ] as [LatLng, LatLng],
      calculateDistance: vi.fn(() => 1000)
    };

    render(<FeedbackPanel {...props} />);
    expect(screen.getByText(/metros/)).toBeInTheDocument();
  });

  it('shows game over screen when game is over', () => {
    const props = {
      ...mockProps,
      gameOver: true
    };

    render(<FeedbackPanel {...props} />);
    expect(screen.getByText('Game Over!')).toBeInTheDocument();
    expect(screen.getByText('Tente Outra Vez')).toBeInTheDocument();
  });

  it('calls onPauseGame when pause button is clicked', () => {
    render(<FeedbackPanel {...mockProps} />);
    fireEvent.click(screen.getByText('Pausar'));
    expect(mockProps.onPauseGame).toHaveBeenCalled();
  });

  it('calls onNextRound when next button is clicked', () => {
    const props = {
      ...mockProps,
      geoJsonData: { type: 'FeatureCollection' as const, features: [] }
    };

    render(<FeedbackPanel {...props} />);
    fireEvent.click(screen.getByText('Próximo'));
    expect(mockProps.onNextRound).toHaveBeenCalled();
  });
}); 