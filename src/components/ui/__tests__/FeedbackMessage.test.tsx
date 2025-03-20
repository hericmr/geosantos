import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeedbackMessage } from '../FeedbackMessage';

describe('FeedbackMessage', () => {
  it('renders message correctly', () => {
    render(<FeedbackMessage message="Great job!" />);
    expect(screen.getByText('Great job!')).toBeInTheDocument();
  });

  it('does not render when message is empty', () => {
    const { container } = render(<FeedbackMessage message="" />);
    expect(container.firstChild).toBeNull();
  });

  it('applies excellent styles when isExcellent is true', () => {
    render(<FeedbackMessage message="Perfect!" isExcellent={true} />);
    const messageElement = screen.getByText('Perfect!');
    expect(messageElement).toHaveStyle({ animation: 'pulseText 1s infinite' });
  });

  it('applies normal styles when isExcellent is false', () => {
    render(<FeedbackMessage message="Good try!" isExcellent={false} />);
    const messageElement = screen.getByText('Good try!');
    expect(messageElement).toHaveStyle({ animation: 'none' });
  });
}); 