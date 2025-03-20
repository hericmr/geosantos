import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FeedbackMessage } from '../FeedbackMessage';

describe('FeedbackMessage', () => {
  it('renders time bonus when provided', () => {
    const { getByText } = render(
      <FeedbackMessage
        message=""
        timeBonus={1.5}
        isSuccess={true}
      />
    );
    expect(getByText('⚡ +1.50s')).toBeInTheDocument();
  });

  it('does not render time bonus when zero', () => {
    const { queryByText } = render(
      <FeedbackMessage
        message=""
        timeBonus={0}
        isSuccess={true}
      />
    );
    expect(queryByText(/⚡/)).not.toBeInTheDocument();
  });

  it('renders feedback message when provided', () => {
    const testMessage = 'Great job!';
    const { getByText } = render(
      <FeedbackMessage
        message={testMessage}
        timeBonus={0}
        isSuccess={true}
      />
    );
    expect(getByText(testMessage)).toBeInTheDocument();
  });

  it('does not render feedback message when empty', () => {
    const { container } = render(
      <FeedbackMessage
        message=""
        timeBonus={0}
        isSuccess={true}
      />
    );
    expect(container.textContent).toBe('');
  });
}); 