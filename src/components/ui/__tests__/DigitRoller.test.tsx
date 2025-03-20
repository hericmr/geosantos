import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { DigitRoller } from '../DigitRoller';

describe('DigitRoller', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with initial rolling state', () => {
    render(<DigitRoller targetDigit="5" delay={1000} />);
    
    // Check if all digits are rendered (0-9 twice)
    const digits = screen.getAllByText(/[0-9]/);
    expect(digits).toHaveLength(20); // 10 digits repeated twice
  });

  it('stops rolling after delay', () => {
    render(<DigitRoller targetDigit="5" delay={1000} />);
    
    // Initially the animation should be running
    const container = screen.getByText('5').parentElement;
    expect(container).toHaveStyle({ animation: 'rollDigits 0.15s linear infinite' });

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // After delay, animation should stop
    expect(container).toHaveStyle({ animation: 'none' });
  });

  it('positions to correct target digit after rolling', () => {
    render(<DigitRoller targetDigit="5" delay={1000} />);

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const digitContainer = screen.getByText('5').parentElement;
    expect(digitContainer).toHaveStyle({ transform: 'translateY(-200px)' }); // 5 * 40px height
  });
}); 