import React from 'react';
import { FeedbackPanelProps } from '../../types/game';
import { getFeedbackMessage } from '../../utils/gameConstants';

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  showFeedback,
  clickedPosition,
  arrowPath,
  clickTime,
  feedbackProgress,
  onNextRound,
  calculateDistance,
  calculateScore,
  getProgressBarColor
}) => {
  if (!showFeedback || !clickedPosition || !arrowPath) return null;

  const distance = calculateDistance(clickedPosition, arrowPath[1]);
  const scores = calculateScore(distance, 45); // Using default time for display

  return (
    <div style={{
      position: 'absolute',
      top: '80px',
      right: '20px',
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '20px',
      borderRadius: '15px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      zIndex: 2000,
      minWidth: '300px',
      maxWidth: '350px',
      opacity: 1,
      transition: 'opacity 0.5s ease-in-out'
    }}>
      <h2 style={{ color: '#32CD32', marginBottom: '10px', fontSize: '1.2em' }}>
        {getFeedbackMessage(distance)}
      </h2>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '15px'
      }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
            {Math.round(distance)}
          </div>
          <div style={{ color: '#666', fontSize: '0.9em' }}>metros</div>
        </div>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
            {clickTime.toFixed(2)}
          </div>
          <div style={{ color: '#666', fontSize: '0.9em' }}>segundos</div>
        </div>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <div style={{ 
          fontSize: '16px', 
          color: '#4CAF50', 
          marginBottom: '5px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Por distância:</span>
          <span style={{ fontWeight: 'bold' }}>
            +{scores.distancePoints}
          </span>
        </div>
        <div style={{ 
          fontSize: '16px', 
          color: '#FFA500',
          marginBottom: '5px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Por tempo:</span>
          <span style={{ fontWeight: 'bold' }}>
            +{scores.timePoints}
          </span>
        </div>
        <div style={{ 
          fontSize: '18px', 
          color: '#333',
          fontWeight: 'bold',
          borderTop: '1px solid #ddd',
          paddingTop: '5px',
          marginTop: '5px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Total:</span>
          <span style={{ color: '#FF6B6B' }}>
            +{scores.total}
          </span>
        </div>
      </div>
      
      <div style={{
        width: '100%',
        height: '4px',
        background: '#ddd',
        borderRadius: '2px',
        marginBottom: '15px'
      }}>
        <div style={{
          width: `${feedbackProgress}%`,
          height: '100%',
          background: getProgressBarColor(feedbackProgress / 100 * 45),
          borderRadius: '2px',
          transition: 'width 0.1s linear, background-color 0.3s ease'
        }} />
      </div>

      <button
        onClick={onNextRound}
        style={{
          padding: '6px 16px',
          fontSize: '0.9em',
          background: '#32CD32',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#28a745'}
        onMouseOut={(e) => e.currentTarget.style.background = '#32CD32'}
      >
        Próximo
      </button>
    </div>
  );
}; 