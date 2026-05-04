import React, { useEffect, useState } from 'react';
import { ActionButtons } from './ActionButtons';
import { styles } from './FeedbackPanel.styles';
import { GameMode } from '../../types/famousPlaces';
import { PlaceDescription } from './feedback/PlaceDescription';
import { LatLng } from 'leaflet';

export interface FeedbackPanelProps {
  showFeedback: boolean;
  clickedPosition: LatLng | null;
  arrowPath: LatLng[] | null;
  clickTime: number;
  feedbackProgress: number;
  onNextRound: (geoJsonData: any) => void;
  calculateDistance: (pos1: LatLng, pos2: LatLng) => number;
  calculateScore: (distance: number, time: number) => { total: number };
  getProgressBarColor: (...args: any[]) => any;
  geoJsonData: any;
  gameOver: boolean;
  onPauseGame: () => void;
  onResumeGame?: () => void;
  score: number;
  roundScore?: number;
  currentNeighborhood: string;
  currentMode?: GameMode;
  currentFamousPlace?: { name: string; description?: string };
  isPaused?: boolean;
  timeBonus?: number;
  consecutiveCorrect?: number;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  showFeedback,
  clickedPosition,
  arrowPath,
  clickTime,
  feedbackProgress,
  onNextRound,
  calculateDistance,
  geoJsonData,
  gameOver,
  onPauseGame,
  onResumeGame,
  roundScore = 0,
  currentNeighborhood,
  currentMode = 'neighborhoods',
  currentFamousPlace,
  isPaused,
  timeBonus = 0,
  consecutiveCorrect = 0,
}) => {
  const [distance, setDistance] = useState(0);
  const [popupPosition, setPopupPosition] = useState({ top: '50%', left: '50%' });
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    if (showFeedback && clickedPosition) {
      const d = arrowPath ? calculateDistance(clickedPosition, arrowPath[1]) : 0;
      setDistance(d);
    }
  }, [showFeedback, clickedPosition, arrowPath, calculateDistance]);

  useEffect(() => {
    if (!clickedPosition) return;
    if (isMobile) return;
    // Simple position: prefer bottom-left of click
    setPopupPosition({ top: '50%', left: '20px' });
  }, [clickedPosition, isMobile]);

  if (gameOver || !showFeedback || !clickedPosition) return null;

  const isCorrect = distance === 0;
  const distanceKm = (distance / 1000).toFixed(1);
  const targetName = currentMode === 'famous_places'
    ? currentFamousPlace?.name ?? ''
    : currentNeighborhood;

  const resultColor = isCorrect ? '#32CD32' : distance < 500 ? '#ffd700' : '#ff6b6b';
  const resultText = isCorrect
    ? `✓ ${targetName}!`
    : `${distanceKm}km de ${targetName}`;

  return (
    <div
      className="feedback-panel-container"
      style={{
        ...styles.container(false, isMobile, popupPosition),
        zIndex: 10020,
        // Posicionar acima da barra de tempo (clamp(110px, 22vw, 130px))
        bottom: isMobile ? 'clamp(118px, 24vw, 140px)' : 'auto',
        top: isMobile ? 'auto' : '50%',
        left: isMobile ? '50%' : '24px',
        transform: isMobile ? 'translateX(-50%)' : 'translateY(-50%)',
        width: isMobile ? 'calc(100% - 24px)' : '400px',
        maxWidth: isMobile ? '480px' : '400px',
        padding: '20px',
        borderRadius: '12px',
      }}
    >
      {/* Result */}
      <div style={{
        fontSize: isMobile ? '1.5rem' : '1.3rem',
        fontFamily: "'LaCartoonerie', sans-serif",
        color: resultColor,
        fontWeight: 700,
        textAlign: 'center',
        letterSpacing: '0.5px',
      }}>
        {resultText}
      </div>

      {/* Distance + time description */}
      <PlaceDescription
        currentMode={currentMode}
        currentNeighborhood={currentNeighborhood}
        currentFamousPlace={currentFamousPlace}
        displayedDistance={distance}
        clickTime={clickTime}
        isCorrectNeighborhood={isCorrect}
      />

      {/* Streak */}
      {consecutiveCorrect >= 2 && (
        <div style={{
          textAlign: 'center',
          fontSize: isMobile ? '1.1rem' : '1rem',
          color: '#ffa500',
          fontFamily: "'LaCartoonerie', sans-serif",
          fontWeight: 600,
        }}>
          🔥 {consecutiveCorrect} seguidos!
        </div>
      )}

      {/* Stats row */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        marginTop: '4px',
      }}>
        {/* Points earned */}
        <div style={{
          flex: 1,
          textAlign: 'center',
          padding: '10px 8px',
          background: 'var(--bg-primary)',
          borderRadius: '8px',
        }}>
          <div style={{
            fontSize: '2rem',
            fontFamily: "'VT323', monospace",
            color: roundScore > 0 ? '#32CD32' : 'var(--text-primary)',
            fontWeight: 'bold',
            lineHeight: 1,
          }}>
            +{roundScore}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            pontos
          </div>
        </div>

        {/* Time bonus */}
        <div style={{
          flex: 1,
          textAlign: 'center',
          padding: '10px 8px',
          background: timeBonus > 0 ? 'rgba(255,165,0,0.12)' : 'var(--bg-primary)',
          borderRadius: '8px',
          border: timeBonus > 0 ? '1px solid rgba(255,165,0,0.35)' : '1px solid transparent',
        }}>
          <div style={{
            fontSize: '2rem',
            fontFamily: "'VT323', monospace",
            color: timeBonus > 0 ? '#ffa500' : 'var(--text-secondary)',
            fontWeight: 'bold',
            lineHeight: 1,
          }}>
            {timeBonus > 0 ? `+${timeBonus}s` : '—'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            bônus tempo
          </div>
        </div>
      </div>

      {/* Buttons */}
      <ActionButtons
        gameOver={gameOver}
        onPauseGame={onPauseGame}
        onNextRound={() => { if (geoJsonData) onNextRound(geoJsonData); }}
        feedbackProgress={feedbackProgress}
        currentMode={currentMode}
        onResumeGame={onResumeGame}
        isPaused={isPaused}
      />
    </div>
  );
};
