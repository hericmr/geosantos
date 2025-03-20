import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameControls } from '../GameControls';
import { FeatureCollection } from 'geojson';

describe('GameControls', () => {
  const mockOnPauseGame = vi.fn();
  const mockOnNextRound = vi.fn();
  const mockGeoJsonData = { type: 'FeatureCollection', features: [] } as FeatureCollection;

  beforeEach(() => {
    mockOnPauseGame.mockClear();
    mockOnNextRound.mockClear();
  });

  it('renders pause button when not game over', () => {
    const { getByText } = render(
      <GameControls
        gameOver={false}
        onPauseGame={mockOnPauseGame}
        onNextRound={mockOnNextRound}
        geoJsonData={mockGeoJsonData}
        feedbackProgress={0}
      />
    );
    expect(getByText('Pausar')).toBeInTheDocument();
  });

  it('does not render pause button when game over', () => {
    const { queryByText } = render(
      <GameControls
        gameOver={true}
        onPauseGame={mockOnPauseGame}
        onNextRound={mockOnNextRound}
        geoJsonData={mockGeoJsonData}
        feedbackProgress={0}
      />
    );
    expect(queryByText('Pausar')).not.toBeInTheDocument();
  });

  it('shows "Próximo" button when not game over', () => {
    const { getByText } = render(
      <GameControls
        gameOver={false}
        onPauseGame={mockOnPauseGame}
        onNextRound={mockOnNextRound}
        geoJsonData={mockGeoJsonData}
        feedbackProgress={0}
      />
    );
    expect(getByText('Próximo')).toBeInTheDocument();
  });

  it('shows "Tente Outra Vez" button when game over', () => {
    const { getByText } = render(
      <GameControls
        gameOver={true}
        onPauseGame={mockOnPauseGame}
        onNextRound={mockOnNextRound}
        geoJsonData={mockGeoJsonData}
        feedbackProgress={0}
      />
    );
    expect(getByText('Tente Outra Vez')).toBeInTheDocument();
  });

  it('calls onPauseGame when pause button is clicked', () => {
    const { getByText } = render(
      <GameControls
        gameOver={false}
        onPauseGame={mockOnPauseGame}
        onNextRound={mockOnNextRound}
        geoJsonData={mockGeoJsonData}
        feedbackProgress={0}
      />
    );
    fireEvent.click(getByText('Pausar'));
    expect(mockOnPauseGame).toHaveBeenCalledTimes(1);
  });

  it('calls onNextRound when next button is clicked and not game over', () => {
    const { getByText } = render(
      <GameControls
        gameOver={false}
        onPauseGame={mockOnPauseGame}
        onNextRound={mockOnNextRound}
        geoJsonData={mockGeoJsonData}
        feedbackProgress={0}
      />
    );
    fireEvent.click(getByText('Próximo'));
    expect(mockOnNextRound).toHaveBeenCalledWith(mockGeoJsonData);
  });
}); 