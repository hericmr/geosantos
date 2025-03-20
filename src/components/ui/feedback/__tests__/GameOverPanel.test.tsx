import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameOverPanel } from '../GameOverPanel';

describe('GameOverPanel', () => {
  const mockOnRestart = vi.fn();
  const testScore = 1000;

  beforeEach(() => {
    mockOnRestart.mockClear();
  });

  it('renders game over title', () => {
    const { getByText } = render(
      <GameOverPanel score={testScore} onRestart={mockOnRestart} />
    );
    expect(getByText('Game Over')).toBeInTheDocument();
  });

  it('displays the final score', () => {
    const { getByText } = render(
      <GameOverPanel score={testScore} onRestart={mockOnRestart} />
    );
    expect(getByText('Pontuação Final')).toBeInTheDocument();
    expect(getByText('1000')).toBeInTheDocument();
  });

  it('calls onRestart when restart button is clicked', () => {
    const { getByText } = render(
      <GameOverPanel score={testScore} onRestart={mockOnRestart} />
    );
    fireEvent.click(getByText('Tente Outra Vez'));
    expect(mockOnRestart).toHaveBeenCalledTimes(1);
  });
}); 