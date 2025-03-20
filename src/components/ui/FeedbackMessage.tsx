import React from 'react';
import { styles } from './FeedbackPanel.styles';

interface FeedbackMessageProps {
  message: string;
  isExcellent?: boolean;
}

export const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  message,
  isExcellent = false
}) => {
  if (!message) return null;

  return (
    <div style={styles.feedbackMessage(isExcellent)}>
      {message}
    </div>
  );
}; 