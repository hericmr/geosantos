import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionButtons } from '../ActionButtons';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ActionButtons', () => {
  const mockOnPauseGame = vi.fn();
  const mockOnNextRound = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders both buttons when not game over', () => {
    render(
      <ActionButtons
        gameOver={false}
        onPauseGame={mockOnPauseGame}
        onNextRound={mockOnNextRound}
        feedbackProgress={50}
      />
    );

    expect(screen.getByText('Pausar')).toBeInTheDocument();
    expect(screen.getByText('Próximo')).toBeInTheDocument();
  });

  it('renders only retry button when game over', () => {
    render(
      <ActionButtons
        gameOver={true}
        onPauseGame={mockOnPauseGame}
        onNextRound={mockOnNextRound}
        feedbackProgress={50}
      />
    );

    expect(screen.queryByText('Pausar')).not.toBeInTheDocument();
    expect(screen.getByText('Tente Outra Vez')).toBeInTheDocument();
  });

  it('calls onPauseGame when pause button is clicked', () => {
    render(
      <ActionButtons
        gameOver={false}
        onPauseGame={mockOnPauseGame}
        onNextRound={mockOnNextRound}
        feedbackProgress={50}
      />
    );

    fireEvent.click(screen.getByText('Pausar'));
    expect(mockOnPauseGame).toHaveBeenCalledTimes(1);
  });

  it('calls onNextRound when next/retry button is clicked', () => {
    render(
      <ActionButtons
        gameOver={false}
        onPauseGame={mockOnPauseGame}
        onNextRound={mockOnNextRound}
        feedbackProgress={50}
      />
    );

    fireEvent.click(screen.getByText('Próximo'));
    expect(mockOnNextRound).toHaveBeenCalledTimes(1);
  });

  it('shows progress bar with correct progress', () => {
    render(
      <ActionButtons
        gameOver={false}
        onPauseGame={mockOnPauseGame}
        onNextRound={mockOnNextRound}
        feedbackProgress={75}
      />
    );

    const progressBar = screen.getByText('Próximo').parentElement?.querySelector('div');
    expect(progressBar).toHaveStyle({ width: '75%' });
  });
}); 