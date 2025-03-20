import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedbackPanel } from '../FeedbackPanel';
import { LatLng } from 'leaflet';

describe('FeedbackPanel', () => {
  const mockProps = {
    showFeedback: true,
    clickedPosition: { lat: 0, lng: 0 } as LatLng,
    arrowPath: null,
    clickTime: 5,
    feedbackProgress: 50,
    onNextRound: jest.fn(),
    calculateDistance: jest.fn(),
    calculateScore: jest.fn(() => ({ total: 1000, distance: 500, time: 500 })),
    getProgressBarColor: jest.fn(),
    geoJsonData: null,
    gameOver: false,
    onPauseGame: jest.fn(),
    score: 1000,
    currentNeighborhood: 'Test Neighborhood'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correct neighborhood message when distance is 0', () => {
    const props = {
      ...mockProps,
      clickedPosition: { lat: 0, lng: 0 } as LatLng,
      arrowPath: null,
      calculateDistance: jest.fn(() => 0)
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
      ],
      calculateDistance: jest.fn(() => 1000)
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
      geoJsonData: { type: 'FeatureCollection', features: [] }
    };

    render(<FeedbackPanel {...props} />);
    fireEvent.click(screen.getByText('Próximo'));
    expect(mockProps.onNextRound).toHaveBeenCalled();
  });
}); 