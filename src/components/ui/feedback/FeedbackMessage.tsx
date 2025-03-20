import React from 'react';
import { styles } from './styles';

interface FeedbackMessageProps {
  message: string;
  timeBonus: number;
  isSuccess: boolean;
}

export const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  message,
  timeBonus,
  isSuccess
}) => {
  return (
    <>
      {timeBonus > 0 && (
        <div style={styles.timeBonusContainer}>
          ⚡ +{timeBonus.toFixed(2)}s
        </div>
      )}
      {message && (
        <div style={styles.feedbackMessage(isSuccess)}>
          {message}
        </div>
      )}
    </>
  );
}; 