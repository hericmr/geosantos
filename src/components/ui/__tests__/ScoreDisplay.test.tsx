import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScoreDisplay } from '../ScoreDisplay';

describe('ScoreDisplay', () => {
  it('renders basic score display correctly', () => {
    render(
      <ScoreDisplay
        icon="🎯"
        value={1000}
        unit="pts"
      />
    );

    expect(screen.getByText('🎯')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('pts')).toBeInTheDocument();
  });

  it('renders time bonus when provided', () => {
    render(
      <ScoreDisplay
        icon="⏱️"
        value={500}
        unit="pts"
        timeBonus={2.5}
      />
    );

    expect(screen.getByText('⏱️')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('pts')).toBeInTheDocument();
    expect(screen.getByText('+2.50s')).toBeInTheDocument();
  });

  it('does not render time bonus when zero', () => {
    render(
      <ScoreDisplay
        icon="⏱️"
        value={500}
        unit="pts"
        timeBonus={0}
      />
    );

    expect(screen.queryByText(/\+.*s/)).not.toBeInTheDocument();
  });

  it('rounds the value to nearest integer', () => {
    render(
      <ScoreDisplay
        icon="🎯"
        value={1000.6}
        unit="pts"
      />
    );

    expect(screen.getByText('1001')).toBeInTheDocument();
  });
}); 