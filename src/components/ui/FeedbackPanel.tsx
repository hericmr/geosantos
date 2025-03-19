import React, { useEffect, useState } from 'react';
import { FeedbackPanelProps } from '../../types/game';
import { getFeedbackMessage, TIME_BONUS_THRESHOLDS, TIME_BONUS_AMOUNTS } from '../../utils/gameConstants';

const DigitRoller: React.FC<{ targetDigit: string; delay: number }> = ({ targetDigit, delay }) => {
  const [isRolling, setIsRolling] = useState(true);
  const digitHeight = 40; // Altura fixa para cada dígito

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRolling(false);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.3)',
      padding: 'clamp(2px, 1vw, 4px) clamp(1px, 0.5vw, 2px)',
      borderRadius: '4px',
      width: 'clamp(30px, 8vw, 40px)',
      height: `${digitHeight}px`,
      overflow: 'hidden',
      position: 'relative',
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        animation: isRolling ? 'rollDigits 0.15s linear infinite' : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: !isRolling ? `translateY(${-digitHeight * parseInt(targetDigit)}px)` : undefined,
        transition: !isRolling ? 'transform 0.2s ease-out' : undefined
      }}>
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{
            height: `${digitHeight}px`,
            fontSize: 'clamp(24px, 6vw, 32px)',
            fontWeight: 700,
            color: '#fff',
            fontFamily: "'Inter', monospace",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}>
            {i}
          </div>
        ))}
        {[0,1,2,3,4,5,6,7,8,9].map((n) => (
          <div key={`repeat-${n}`} style={{
            height: `${digitHeight}px`,
            fontSize: 'clamp(24px, 6vw, 32px)',
            fontWeight: 700,
            color: '#fff',
            fontFamily: "'Inter', monospace",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}>
            {n}
          </div>
        ))}
      </div>
    </div>
  );
};

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
  currentNeighborhood
}) => {
  const [displayedDistance, setDisplayedDistance] = useState(0);
  const [displayedTime, setDisplayedTime] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [popupPosition, setPopupPosition] = useState({ top: '20px', left: '20px' });
  const [timeBonus, setTimeBonus] = useState(0);

  useEffect(() => {
    if (showFeedback && clickedPosition) {
      const distance = arrowPath ? calculateDistance(clickedPosition, arrowPath[1]) : 0;
      const score = calculateScore(distance, clickTime);
      
      setIsAnimating(true);
      setDisplayedDistance(0);
      setDisplayedTime(0);
      setFeedbackMessage(getFeedbackMessage(distance));

      // Calcula o bônus de tempo baseado na pontuação
      let bonus = 0;
      if (score.total >= TIME_BONUS_THRESHOLDS.EXCELLENT) {
        bonus = TIME_BONUS_AMOUNTS.EXCELLENT;
      } else if (score.total >= TIME_BONUS_THRESHOLDS.GOOD) {
        bonus = TIME_BONUS_AMOUNTS.GOOD;
      } else if (score.total >= TIME_BONUS_THRESHOLDS.FAIR) {
        bonus = TIME_BONUS_AMOUNTS.FAIR;
      }
      setTimeBonus(bonus);

      const duration = 2000; // 2 segundos de animação
      const steps = 60; // 60 passos para animação suave
      const stepDuration = duration / steps;
      const distanceStep = distance / steps;
      const timeStep = clickTime / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        setDisplayedDistance(prev => Math.min(prev + distanceStep, distance));
        setDisplayedTime(prev => Math.min(prev + timeStep, clickTime));
        
        if (currentStep >= steps) {
          clearInterval(interval);
          setIsAnimating(false);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [showFeedback, clickedPosition, arrowPath, clickTime, calculateDistance, calculateScore]);

  useEffect(() => {
    if (clickedPosition) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Converte as coordenadas do mapa para coordenadas da viewport
      const clickX = (clickedPosition.lng + 180) * (viewportWidth / 360);
      const clickY = (90 - clickedPosition.lat) * (viewportHeight / 180);
      
      // Se tiver o ponto correto (arrowPath), calcula sua posição na viewport
      let targetX = 0, targetY = 0;
      if (arrowPath) {
        targetX = (arrowPath[1].lng + 180) * (viewportWidth / 360);
        targetY = (90 - arrowPath[1].lat) * (viewportHeight / 180);
      }
      
      // Calcula a direção do vetor entre os pontos
      const dx = arrowPath ? targetX - clickX : 0;
      const dy = arrowPath ? targetY - clickY : 0;
      const angle = Math.atan2(dy, dx);
      
      // Define a distância do popup em relação ao ponto clicado
      const distance = 20; // pixels
      
      // Calcula a posição do popup perpendicular à linha entre os pontos
      let popupX = clickX + Math.cos(angle + Math.PI/2) * distance;
      let popupY = clickY + Math.sin(angle + Math.PI/2) * distance;
      
      // Ajusta a posição para garantir que o popup fique visível
      popupX = Math.min(Math.max(popupX, 200), viewportWidth - 200);
      popupY = Math.min(Math.max(popupY, 100), viewportHeight - 200);
      
      setPopupPosition({
        top: `${popupY}px`,
        left: `${popupX}px`
      });
    }
  }, [clickedPosition, arrowPath]);

  if (!showFeedback) return null;

  // Verifica se o clique foi dentro do bairro correto (quando não há seta)
  const isCorrectNeighborhood = !arrowPath;

  return (
    <div style={{
      position: 'fixed',
      top: popupPosition.top,
      left: popupPosition.left,
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '400px',
      background: 'rgba(0, 25, 0, 0.95)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      color: 'white',
      zIndex: 1001,
      padding: 'clamp(20px, 4vw, 30px)',
      borderRadius: '15px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      margin: '10px'
    }}>
      {!gameOver && clickedPosition && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(20px, 4vw, 30px)',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {isCorrectNeighborhood ? (
            // Layout para quando acerta o bairro
            <>
              <div style={{
                textAlign: 'left',
                color: '#fff',
                fontSize: 'clamp(1.1rem, 2.8vw, 1.4rem)',
                fontFamily: "'Inter', sans-serif",
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                opacity: 0.95
              }}>
                <div style={{ 
                  fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', 
                  color: '#FFD700', 
                  fontWeight: 600,
                  textAlign: 'center'
                }}>
                   INCRÍVEL! Em {clickTime.toFixed(2)} seg você acertou na mosca o bairro <span style={{ color: '#32CD32', fontWeight: 600 }}>{currentNeighborhood}</span>!
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: 'clamp(20px, 4vw, 30px)',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '2px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ 
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                    fontFamily: "'Inter', sans-serif",
                    marginRight: 'clamp(8px, 2vw, 12px)',
                    opacity: 0.9
                  }}>🎯</div>
                  <div style={{ 
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    color: '#fff',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}>
                    {Math.round(score)}
                  </div>
                  <div style={{ 
                    fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    marginLeft: 'clamp(4px, 1vw, 8px)',
                    opacity: 0.9
                  }}>pts</div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '2px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ 
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                    fontFamily: "'Inter', sans-serif",
                    marginRight: 'clamp(8px, 2vw, 12px)',
                    opacity: 0.9
                  }}>⏱️</div>
                  <div style={{ 
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    color: '#fff',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}>
                    {Math.round(1000 - (clickTime * 100))}
                  </div>
                  <div style={{ 
                    fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    marginLeft: 'clamp(4px, 1vw, 8px)',
                    opacity: 0.9
                  }}>pts</div>
                </div>
              </div>
            </>
          ) : (
            // Layout para quando erra o bairro
            <>
              <div style={{ 
                fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                textAlign: 'center',
                fontFamily: "'Inter', sans-serif",
                opacity: 0.9
              }}>
                Em {displayedTime.toFixed(2)} seg você clicou
              </div>
              <div style={{
                display: 'flex',
                gap: '2px',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap'
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
                  marginLeft: 'clamp(8px, 2vw, 12px)',
                  opacity: 0.9
                }}>metros do bairro <span style={{ color: '#32CD32', fontWeight: 600 }}>{currentNeighborhood}</span></div>
              </div>
              <div style={{
                display: 'flex',
                gap: 'clamp(20px, 4vw, 30px)',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '2px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ 
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                    fontFamily: "'Inter', sans-serif",
                    marginRight: 'clamp(8px, 2vw, 12px)',
                    opacity: 0.9
                  }}>📍</div>
                  <div style={{ 
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    color: '#fff',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}>
                    {Math.round(displayedDistance / 1000 * 10) / 10}
                  </div>
                  <div style={{ 
                    fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    marginLeft: 'clamp(4px, 1vw, 8px)',
                    opacity: 0.9
                  }}>km</div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '2px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ 
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                    fontFamily: "'Inter', sans-serif",
                    marginRight: 'clamp(8px, 2vw, 12px)',
                    opacity: 0.9
                  }}>⏱️</div>
                  <div style={{ 
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    color: '#fff',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}>
                    {Math.round(1000 - (clickTime * 100))}
                  </div>
                  <div style={{ 
                    fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    marginLeft: 'clamp(4px, 1vw, 8px)',
                    opacity: 0.9
                  }}>pts</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {timeBonus > 0 && !gameOver && (
        <div style={{
          marginTop: 'clamp(12px, 3vw, 20px)',
          color: '#FFD700',
          fontWeight: 600,
          fontSize: 'clamp(1.1rem, 2.8vw, 1.4rem)',
          textAlign: 'center',
          fontFamily: "'Inter', sans-serif",
          animation: 'pulseText 1s infinite',
          opacity: 0.95
        }}>
          ⚡ +{timeBonus.toFixed(2)}s
        </div>
      )}

      {feedbackMessage && !gameOver && (
        <div style={{
          marginTop: 'clamp(12px, 3vw, 20px)',
          color: feedbackMessage.includes("Muito bem") ? '#FFD700' : '#FFD700',
          fontWeight: 600,
          fontSize: 'clamp(1.1rem, 2.8vw, 1.4rem)',
          textAlign: 'center',
          fontFamily: "'Inter', sans-serif",
          animation: feedbackMessage.includes("Muito bem") ? 'pulseText 1s infinite' : 'none',
          opacity: 0.95
        }}>
          {feedbackMessage}
        </div>
      )}

      {gameOver && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(20px, 4vw, 30px)',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <h2 style={{ 
            color: 'white', 
            marginBottom: 'clamp(15px, 3vw, 25px)', 
            fontSize: 'clamp(1.8rem, 4.5vw, 2.5rem)',
            textAlign: 'center',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            opacity: 0.95
          }}>
            {score >= 10000 ? "LENDÁRIO! 🏆" :
             score >= 5000 ? "IMPRESSIONANTE! 🌟" :
             score >= 2000 ? "MUITO BOM! 👏" :
             score >= 1000 ? "BOM JOGO! 👍" :
             "Game Over!"}
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'clamp(10px, 2vw, 15px)',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: 'clamp(20px, 4vw, 30px)',
            borderRadius: '10px',
            border: '2px solid #32CD32'
          }}>
            <span style={{
              fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
              color: '#FFD700',
              fontWeight: 600,
              textAlign: 'center',
              fontFamily: "'Inter', sans-serif"
            }}>
              Pontuação Final
            </span>
            <span style={{
              fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
              color: '#32CD32',
              fontWeight: 700,
              textAlign: 'center',
              fontFamily: "'Inter', sans-serif",
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              {score}
            </span>
            <span style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: '#FFD700',
              fontWeight: 500,
              textAlign: 'center',
              fontFamily: "'Inter', sans-serif",
              opacity: 0.9
            }}>
              {score >= 10000 ? "Você é um verdadeiro mestre do jogo! Conseguiu uma pontuação lendária!" :
               score >= 5000 ? "Você dominou o jogo! Uma performance impressionante!" :
               score >= 2000 ? "Você jogou muito bem! Continue praticando para melhorar ainda mais!" :
               score >= 1000 ? "Você tem potencial! Tente novamente para melhorar sua pontuação!" :
               "Não desanime! Pratique mais para melhorar sua pontuação!"}
            </span>
          </div>

          <div style={{
            display: 'flex',
            gap: 'clamp(10px, 2vw, 15px)',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => {
                const shareText = score >= 10000 ? 
                  `🏆 LENDÁRIO! Joguei O Caiçara e fiz ${score} pontos! Quem consegue superar essa pontuação?` :
                  score >= 5000 ?
                  `🌟 IMPRESSIONANTE! Joguei O Caiçara e fiz ${score} pontos! Quanto você consegue fazer?` :
                  `🎮 Joguei O Caiçara e fiz ${score} pontos! Quanto você consegue fazer?`;

                if (navigator.share) {
                  navigator.share({
                    title: 'O Caiçara',
                    text: shareText,
                    url: window.location.href
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(shareText);
                  alert('Texto copiado para a área de transferência!');
                }
              }}
              style={{
                padding: 'clamp(8px, 2vw, 12px) clamp(16px, 3vw, 24px)',
                fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
                background: '#FFA500',
                color: '#000000',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#FF8C00'}
              onMouseOut={(e) => e.currentTarget.style.background = '#FFA500'}
            >
              <span>📱</span> Compartilhar
            </button>
          </div>
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: 'clamp(8px, 2vw, 12px)',
        justifyContent: 'center',
        marginTop: 'clamp(12px, 3vw, 20px)',
        flexWrap: 'wrap'
      }}>
        {!gameOver && (
          <button
            onClick={onPauseGame}
            style={{
              padding: 'clamp(8px, 2vw, 12px) clamp(16px, 3vw, 24px)',
              fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
              background: '#FFA500',
              color: '#000000',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#FF8C00'}
            onMouseOut={(e) => e.currentTarget.style.background = '#FFA500'}
          >
            Pausar
          </button>
        )}
        <button
          onClick={() => {
            if (gameOver) {
              window.location.reload();
            } else if (geoJsonData) {
              onNextRound(geoJsonData);
            }
          }}
          style={{
            padding: 'clamp(8px, 2vw, 12px) clamp(16px, 3vw, 24px)',
            fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
            background: gameOver ? '#FF4444' : '#32CD32',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            overflow: 'hidden',
            width: 'clamp(120px, 25vw, 150px)',
            height: 'clamp(40px, 8vw, 50px)'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = gameOver ? '#FF0000' : '#28a745'}
          onMouseOut={(e) => e.currentTarget.style.background = gameOver ? '#FF4444' : '#32CD32'}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: `${100 - feedbackProgress}%`,
            height: '100%',
            background: 'rgba(255, 0, 0, 0.5)',
            transition: 'width 0.1s linear',
            zIndex: 1
          }} />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${feedbackProgress}%`,
            height: '100%',
            background: 'rgba(50, 205, 50, 0.3)',
            transition: 'width 0.1s linear',
            zIndex: 1,
            transform: 'translateX(0)',
            transformOrigin: 'left'
          }} />
          <span style={{
            position: 'relative',
            zIndex: 2
          }}>{gameOver ? 'Jogar Novamente' : 'Próximo'}</span>
        </button>
      </div>

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
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}; 