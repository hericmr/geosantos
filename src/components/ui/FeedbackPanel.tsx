import React, { useEffect, useState } from 'react';
import { getFeedbackMessage, TIME_BONUS_THRESHOLDS, TIME_BONUS_AMOUNTS } from '../../utils/gameConstants';
import { DigitRoller } from './DigitRoller';
import { ScoreDisplay } from './ScoreDisplay';
import { FeedbackMessage } from './FeedbackMessage';
import { ActionButtons } from './ActionButtons';
import { styles } from './FeedbackPanel.styles';
import { capitalizeWords } from '../../utils/textUtils';
import { GameMode } from '../../types/famousPlaces';

export interface FeedbackPanelProps {
  showFeedback: boolean;
  clickedPosition: any;
  arrowPath: any;
  clickTime: number;
  feedbackProgress: number;
  onNextRound: (geoJsonData: any) => void;
  calculateDistance: (...args: any[]) => number;
  calculateScore: (...args: any[]) => any;
  getProgressBarColor: (...args: any[]) => any;
  geoJsonData: any;
  gameOver: boolean;
  onPauseGame: () => void;
  score: number;
  currentNeighborhood: string;
  currentMode?: GameMode;
  currentFamousPlace?: any;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  showFeedback,
  clickedPosition,
  arrowPath,
  clickTime,
  feedbackProgress,
  onNextRound,
  calculateDistance,
  calculateScore,
  getProgressBarColor,
  geoJsonData,
  gameOver,
  onPauseGame,
  score,
  currentNeighborhood,
  currentMode = 'neighborhoods',
  currentFamousPlace,
}) => {
  const [displayedDistance, setDisplayedDistance] = useState(0);
  const [displayedTime, setDisplayedTime] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [popupPosition, setPopupPosition] = useState({ top: '50%', left: '50%' });
  const [timeBonus, setTimeBonus] = useState(0);
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    if (showFeedback && clickedPosition) {
      const distance = arrowPath ? calculateDistance(clickedPosition, arrowPath[1]) : 0;
      const score = calculateScore(distance, clickTime);
      
      setIsAnimating(true);
      setDisplayedDistance(distance);
      setDisplayedTime(0);
      setFeedbackMessage(getFeedbackMessage(distance));

      let bonus = 0;
      if (score.total >= TIME_BONUS_THRESHOLDS.PERFECT) {
        bonus = TIME_BONUS_AMOUNTS.PERFECT;
      } else if (score.total >= TIME_BONUS_THRESHOLDS.EXCELLENT) {
        bonus = TIME_BONUS_AMOUNTS.EXCELLENT;
      } else if (score.total >= TIME_BONUS_THRESHOLDS.GREAT) {
        bonus = TIME_BONUS_AMOUNTS.GREAT;
      } else if (score.total >= TIME_BONUS_THRESHOLDS.GOOD) {
        bonus = TIME_BONUS_AMOUNTS.GOOD;
      } else if (score.total >= TIME_BONUS_THRESHOLDS.DECENT) {
        bonus = TIME_BONUS_AMOUNTS.DECENT;
      } else if (score.total >= TIME_BONUS_THRESHOLDS.FAIR) {
        bonus = TIME_BONUS_AMOUNTS.FAIR;
      } else if (score.total >= TIME_BONUS_THRESHOLDS.CLOSE) {
        bonus = TIME_BONUS_AMOUNTS.CLOSE;
      }
      setTimeBonus(bonus);

      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;
      const timeStep = clickTime / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        setDisplayedTime(prev => Math.min(prev + timeStep, clickTime));
        
        if (currentStep >= steps) {
          clearInterval(interval);
          setIsAnimating(false);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [showFeedback, clickedPosition, arrowPath, clickTime, calculateScore, calculateDistance]);

  // Esta função determina a melhor posição para o painel de feedback
  const calculateOptimalPosition = () => {
    if (!clickedPosition || !arrowPath) {
      // Se não temos as coordenadas necessárias, posiciona no centro
      return { top: '50%', left: '50%' };
    }

    // Obter tamanho da viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (isMobile) {
      // Em dispositivos móveis, mantemos o painel na parte inferior
      return { top: 'auto', left: '0' };
    }

    // Coordenadas do clique e do bairro alvo (fim da seta)
    const clickX = clickedPosition.lng;
    const clickY = clickedPosition.lat;
    const targetX = arrowPath[1].lng;
    const targetY = arrowPath[1].lat;
    
    // Calcular o centro da linha entre o clique e o alvo
    const centerX = (clickX + targetX) / 2;
    const centerY = (clickY + targetY) / 2;
    
    // Abordagem simplificada: Dividir a tela em quatro quadrantes e posicionar 
    // o painel no quadrante oposto ao clique
    
    // Verificar em qual quadrante está o clique
    const mapInstance = (window as any).mapInstance;
    if (!mapInstance) {
      // Fallback se o mapa não estiver disponível
      return { top: '50%', left: '50%' };
    }
    
    // Vamos usar uma abordagem mais simples - se o clique está na metade direita,
    // colocamos o feedback à esquerda e vice-versa
    if (clickX > centerX) {
      // Clique está mais à direita, posiciona o painel à esquerda
      return { top: '40%', left: '20%' };
    } else {
      // Clique está mais à esquerda, posiciona o painel à direita
      return { top: '40%', left: '80%' };
    }
  };

  useEffect(() => {
    if (clickedPosition) {
      const optimalPosition = calculateOptimalPosition();
      setPopupPosition(optimalPosition);
    }
  }, [clickedPosition, arrowPath, isMobile]);

  useEffect(() => {
    if (showFeedback) {
      console.log('[FeedbackPanel] showFeedback TRUE. currentMode:', currentMode, 'currentNeighborhood:', currentNeighborhood);
    }
  }, [showFeedback, currentMode, currentNeighborhood]);

  useEffect(() => {
    console.log('[FeedbackPanel] Renderizou. currentMode:', currentMode, 'currentNeighborhood:', currentNeighborhood);
  }, [currentMode, currentNeighborhood]);

  const isCorrectNeighborhood = displayedDistance === 0;

  // Não renderizar o FeedbackPanel quando gameOver é true
  if (gameOver) {
    return null;
  }

  return (
    <div style={{
      ...styles.container(false, isMobile, popupPosition),
      zIndex: 10020 // Maior que o modal do lugar famoso (10010)
    }}>
      {clickedPosition && (
        <div style={styles.contentContainer}>
          {isCorrectNeighborhood ? (
            <>
              <div style={{
                textAlign: 'center',
                color: '#fff',
                fontSize: 'clamp(1.1rem, 2.8vw, 1.4rem)',
                fontFamily: "'Inter', sans-serif",
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                opacity: 0.95,
                marginBottom: '4px'
              }}>
                <div style={{ 
                  fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', 
                  color: '#FFD700', 
                  fontWeight: 700,
                  textAlign: 'center',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }}>
                   INCRÍVEL!
                </div>
                <div style={{
                  fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                  color: '#fff',
                  lineHeight: 1.1
                }}>
                  {currentMode === 'famous_places'
                    ? `Em ${clickTime.toFixed(2)} seg você acertou o lugar famoso!`
                    : `Em ${clickTime.toFixed(2)} seg você acertou na mosca o bairro `}
                  {currentMode === 'neighborhoods' && (
                    <span style={{ color: '#32CD32', fontWeight: 600 }}>{capitalizeWords(currentNeighborhood)}</span>
                  )}
                  {currentMode === 'neighborhoods' && '!' }
                </div>
              </div>
              
              {/* Remover a descrição que estava aqui, pois agora ela aparece abaixo do botão Próximo */}

              <div style={{
                display: 'flex',
                gap: 'clamp(10px, 2vw, 20px)',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <ScoreDisplay
                  icon="target"
                  value={score}
                  unit="pts"
                />
                <ScoreDisplay
                  icon="clock"
                  value={1000 - (clickTime * 100)}
                  unit="pts"
                  timeBonus={timeBonus}
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ 
                fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                textAlign: 'center',
                fontFamily: "'Inter', sans-serif",
                opacity: 0.9,
                marginBottom: '2px'
              }}>
                {currentMode === 'famous_places'
                  ? `Em ${displayedTime.toFixed(2)} seg você clicou`
                  : `Em ${displayedTime.toFixed(2)} seg você clicou`}
              </div>
              <div style={{
                display: 'flex',
                gap: '2px',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: '4px'
              }}>
                {Math.round(displayedDistance)
                  .toString()
                  .padStart(5, '0')
                  .split('')
                  .map((digit, index) => (
                    <DigitRoller 
                      key={index} 
                      targetDigit={digit} 
                      delay={200 + (index * 150)} 
                    />
                  ))}
                <div style={{ 
                  fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  marginLeft: 'clamp(4px, 1vw, 8px)',
                  opacity: 0.9
                }}>{currentMode === 'famous_places'
                  ? 'metros até'
                  : `metros até o bairro `}
                  {currentMode === 'neighborhoods' && (
                    <span style={{ color: '#32CD32', fontWeight: 600 }}>{capitalizeWords(currentNeighborhood)}</span>
                  )}
                  {currentMode === 'famous_places' && currentFamousPlace && (
                    <span style={{ color: '#32CD32', fontWeight: 600 }}> {currentFamousPlace.name}</span>
                  )}
                  {currentMode === 'neighborhoods' && '!' }
                </div>
              </div>
              <div style={{
                display: 'flex',
                gap: 'clamp(10px, 2vw, 20px)',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                width: '100%'
              }}>
                <ScoreDisplay
                  icon="target"
                  value={displayedDistance / 1000}
                  unit="km"
                />
                <ScoreDisplay
                  icon="clock"
                  value={1000 - (clickTime * 100)}
                  unit="pts"
                  timeBonus={timeBonus}
                />
              </div>
            </>
          )}
        </div>
      )}

      {feedbackMessage && (
        <FeedbackMessage
          message={feedbackMessage}
          isExcellent={feedbackMessage.includes("Muito bem")}
        />
      )}



      <ActionButtons
        gameOver={false}
        onPauseGame={onPauseGame}
        onNextRound={() => {
          console.log('[FeedbackPanel] Botão Próximo clicado manualmente. Modo:', currentMode, 'Chamando onNextRound.');
          if (geoJsonData) {
            onNextRound(geoJsonData);
          }
        }}
        feedbackProgress={feedbackProgress}
        currentMode={currentMode}
      />

      {/* Descrição do lugar famoso abaixo do botão Próximo */}
      {currentMode === 'famous_places' && currentFamousPlace && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '8px',
          padding: '12px',
          margin: '12px 0 0 0'
        }}>
          <div style={{
            fontSize: 'clamp(0.8rem, 2vw, 1rem)',
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
            lineHeight: 1.4,
            textAlign: 'center'
          }}>
            {currentFamousPlace.description}
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes rollDigits {
            0% {
              transform: translateY(-400px);
            }
            100% {
              transform: translateY(0);
            }
          }
          @keyframes pulseText {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes fadeInScale {
            0% { 
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.95);
            }
            100% { 
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }
          @keyframes pulseScore {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes slideIn {
            0% {
              opacity: 0;
              transform: translate(-50%, -20px);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
          @keyframes slideUp {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          button {
            -webkit-tap-highlight-color: transparent;
          }
          
          button:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
          }
        `}
      </style>
    </div>
  );
}; 