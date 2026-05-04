import React, { useEffect, useRef, useState } from 'react';
import { styles } from './FeedbackPanel.styles';
import { GameMode } from '../../types/famousPlaces';
import { OdometerDisplay } from './OdometerDisplay';
import { capitalizeWords } from '../../utils/textUtils';
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
  const isMobile = window.innerWidth <= 768;

  // drain animation for next button
  const prevProgressRef = useRef(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (feedbackProgress >= 99 && prevProgressRef.current < 50) {
      setAnimKey(k => k + 1);
    }
    prevProgressRef.current = feedbackProgress;
  }, [feedbackProgress]);

  useEffect(() => {
    if (showFeedback && clickedPosition) {
      const d = arrowPath ? calculateDistance(clickedPosition, arrowPath[1]) : 0;
      setDistance(d);
    }
  }, [showFeedback, clickedPosition, arrowPath, calculateDistance]);

  if (gameOver || !showFeedback || !clickedPosition) return null;

  const isCorrect = distance === 0;
  const distanceKm = distance / 1000;
  const targetName = currentMode === 'famous_places'
    ? (currentFamousPlace?.name ?? '')
    : capitalizeWords(currentNeighborhood);

  const popupPosition = { top: '50%', left: '20px' };

  return (
    <div
      className="feedback-panel-container"
      style={{
        ...styles.container(false, isMobile, popupPosition),
        zIndex: 10020,
        bottom: isMobile ? 'clamp(118px, 24vw, 140px)' : 'auto',
        top: isMobile ? 'auto' : '50%',
        left: isMobile ? '50%' : '24px',
        transform: isMobile ? 'translateX(-50%)' : 'translateY(-50%)',
        width: isMobile ? 'calc(100% - 24px)' : '400px',
        maxWidth: isMobile ? '480px' : '400px',
        padding: '20px',
        borderRadius: '14px',
        gap: '0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        @keyframes drainBar {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>

      {/* ── Linha 1: tempo ───────────────────────── */}
      <div style={{
        fontSize: '0.85rem',
        fontFamily: "'LaCartoonerie', sans-serif",
        color: 'rgba(255,255,255,0.55)',
        marginBottom: '12px',
        fontWeight: 600,
      }}>
        {isCorrect
          ? `Em ${clickTime.toFixed(2)} seg você acertou`
          : `Em ${clickTime.toFixed(2)} seg você clicou`}
      </div>

      {/* ── Linha 2: odômetro ou acerto ──────────── */}
      {isCorrect ? (
        <div style={{
          fontSize: 'clamp(2rem, 6vw, 2.8rem)',
          fontFamily: "'LaCartoonerie', sans-serif",
          color: '#4ade80',
          fontWeight: 800,
          marginBottom: '10px',
          lineHeight: 1,
        }}>
          ✓ Na mosca!
        </div>
      ) : (
        <div style={{ marginBottom: '12px' }}>
          <OdometerDisplay valueKm={distanceKm} />
        </div>
      )}

      {/* ── Linha 3: "De [lugar]" ─────────────────── */}
      <div style={{
        fontSize: 'clamp(1rem, 2.8vw, 1.2rem)',
        fontFamily: "'LaCartoonerie', sans-serif",
        color: '#ffffff',
        fontWeight: 700,
        marginBottom: '14px',
        lineHeight: 1.3,
      }}>
        {isCorrect ? targetName : `De ${targetName}`}
      </div>

      {/* ── Streak ───────────────────────────────── */}
      {consecutiveCorrect >= 2 && (
        <div style={{
          fontSize: '0.95rem',
          color: '#ffa500',
          fontFamily: "'LaCartoonerie', sans-serif",
          fontWeight: 600,
          marginBottom: '10px',
        }}>
          🔥 {consecutiveCorrect} seguidos!
        </div>
      )}

      {/* ── Caixa de stats (cinza) ───────────────── */}
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '14px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '1.9rem',
            fontFamily: "'VT323', monospace",
            color: roundScore > 0 ? '#4ade80' : 'rgba(255,255,255,0.3)',
            lineHeight: 1,
          }}>
            +{roundScore}
          </div>
          <div style={{
            fontSize: '0.62rem',
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginTop: '3px',
          }}>
            pontos
          </div>
        </div>

        <div style={{
          width: '1px',
          height: '32px',
          background: 'rgba(255,255,255,0.1)',
        }} />

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '1.9rem',
            fontFamily: "'VT323', monospace",
            color: timeBonus > 0 ? '#ffa500' : 'rgba(255,255,255,0.3)',
            lineHeight: 1,
          }}>
            {timeBonus > 0 ? `+${timeBonus}s` : '—'}
          </div>
          <div style={{
            fontSize: '0.62rem',
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginTop: '3px',
          }}>
            bônus tempo
          </div>
        </div>
      </div>

      {/* ── Rodapé: pausar (esq) + Próximo (dir) ─── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '8px',
      }}>
        {/* Botão pausar / retomar */}
        <button
          onClick={isPaused ? onResumeGame : onPauseGame}
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: "'LaCartoonerie', sans-serif",
            fontSize: '0.85rem',
            padding: '9px 14px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            flexShrink: 0,
          }}
        >
          {isPaused ? '▶ Retomar' : '⏸ Pausar'}
        </button>

        {/* Botão Próximo — vermelho, com barra de drenagem */}
        <button
          onClick={() => { if (geoJsonData) onNextRound(geoJsonData); }}
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            background: '#e53e3e',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontFamily: "'LaCartoonerie', sans-serif",
            fontSize: '1.05rem',
            fontWeight: 700,
            padding: '11px 20px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: '0 4px 14px rgba(229,62,62,0.45)',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#c53030')}
          onMouseLeave={e => (e.currentTarget.style.background = '#e53e3e')}
        >
          {/* barra de drenagem */}
          <div
            key={animKey}
            style={{
              position: 'absolute',
              top: 0, left: 0, bottom: 0,
              width: animKey > 0 ? '100%' : '0%',
              background: 'rgba(0,0,0,0.25)',
              animation: animKey > 0 ? 'drainBar 3s linear forwards' : 'none',
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          />
          <span style={{ position: 'relative', zIndex: 1 }}>
            Próximo →
          </span>
        </button>
      </div>
    </div>
  );
};
