import React, { useEffect, useState } from 'react';
import { FeedbackPanelProps } from '../../types/game';
import { getFeedbackMessage, TIME_BONUS_THRESHOLDS, TIME_BONUS_AMOUNTS } from '../../utils/gameConstants';
import * as turf from '@turf/turf';
import { Feature, Polygon, MultiPolygon } from 'geojson';

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

// Adicionar uma função auxiliar para capitalizar cada palavra do nome do bairro
const capitalizeWords = (str: string) => {
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
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
      // Calcula a distância usando a função calculateDistance passada como prop
      const distance = arrowPath ? calculateDistance(clickedPosition, arrowPath[1]) : 0;
      console.log('Distância calculada:', distance); // Debug
      const score = calculateScore(distance, clickTime);
      
      setIsAnimating(true);
      setDisplayedDistance(distance); // Atualiza diretamente com a distância calculada
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
      console.log('Pontuação:', score.total); // Debug
      console.log('Bônus de tempo:', bonus); // Debug
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

  useEffect(() => {
    if (clickedPosition) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      if (viewportWidth <= 768) {
        // Em mobile, calcula a posição baseada no clique
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
        
        // Dimensões do popup
        const popupHeight = 300; // altura estimada do popup
        const popupWidth = Math.min(viewportWidth - 40, 400); // largura máxima do popup
        
        // Calcula a posição ideal do popup
        let popupX = viewportWidth / 2; // Centraliza horizontalmente
        let popupY = 20; // Começa no topo
        
        // Se houver seta ou bairro correto, ajusta a posição
        if (arrowPath) {
          // Calcula a distância entre o clique e o alvo
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Se o clique estiver na metade superior da tela
          if (clickY < viewportHeight / 2) {
            // Posiciona o popup abaixo do clique
            popupY = Math.min(clickY + 100, viewportHeight - popupHeight - 20);
          } else {
            // Posiciona o popup acima do clique
            popupY = Math.max(clickY - popupHeight - 100, 20);
          }
          
          // Ajusta horizontalmente para evitar sobreposição com a seta e o bairro
          if (Math.abs(clickX - targetX) < popupWidth / 2) {
            // Se o clique estiver na metade esquerda da tela
            if (clickX < viewportWidth / 2) {
              popupX = Math.min(clickX + popupWidth / 2, viewportWidth - popupWidth / 2);
            } else {
              // Se o clique estiver na metade direita da tela
              popupX = Math.max(clickX - popupWidth / 2, popupWidth / 2);
            }
          }
        }
        
        setPopupPosition({
          top: `${popupY}px`,
          left: `${popupX}px`
        });
      } else {
        // Lógica para desktop
        const clickX = (clickedPosition.lng + 180) * (viewportWidth / 360);
        const clickY = (90 - clickedPosition.lat) * (viewportHeight / 180);
        
        let targetX = 0, targetY = 0;
        if (arrowPath) {
          targetX = (arrowPath[1].lng + 180) * (viewportWidth / 360);
          targetY = (90 - arrowPath[1].lat) * (viewportHeight / 180);
        }
        
        const dx = arrowPath ? targetX - clickX : 0;
        const dy = arrowPath ? targetY - clickY : 0;
        
        // Dimensões do popup
        const popupHeight = 300;
        const popupWidth = 400;
        
        // Calcula a distância entre o clique e o alvo
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Define a direção do vetor entre os pontos
        const angle = Math.atan2(dy, dx);
        
        // Calcula uma posição segura baseada no ângulo e evitando o bairro correto
        let popupX, popupY;
        
        // Se o clique estiver na metade esquerda da tela
        if (clickX < viewportWidth / 2) {
          // Posiciona o popup à direita do clique
          popupX = clickX + popupWidth + 50;
        } else {
          // Posiciona o popup à esquerda do clique
          popupX = clickX - popupWidth - 50;
        }
        
        // Ajusta a posição vertical baseado no ângulo e evitando o bairro correto
        if (Math.abs(angle) < Math.PI / 2) {
          // Se o ângulo for menor que 90 graus, posiciona acima
          popupY = clickY - popupHeight - 50;
        } else {
          // Se o ângulo for maior que 90 graus, posiciona abaixo
          popupY = clickY + 50;
        }
        
        // Ajusta a posição para evitar o bairro correto
        if (arrowPath) {
          const targetY = (90 - arrowPath[1].lat) * (viewportHeight / 180);
          const targetX = (arrowPath[1].lng + 180) * (viewportWidth / 360);
          
          // Se o popup estiver muito próximo do bairro correto
          if (Math.abs(popupY - targetY) < popupHeight / 2) {
            // Move o popup para mais longe do bairro correto
            if (popupY < targetY) {
              popupY = targetY - popupHeight - 100;
            } else {
              popupY = targetY + 100;
            }
          }
          
          // Ajusta horizontalmente se necessário
          if (Math.abs(popupX - targetX) < popupWidth / 2) {
            if (popupX < targetX) {
              popupX = targetX - popupWidth - 100;
            } else {
              popupX = targetX + 100;
            }
          }
        }
        
        // Garante que o popup fique dentro da viewport
        popupX = Math.min(Math.max(popupX, popupWidth/2), viewportWidth - popupWidth/2);
        popupY = Math.max(20, Math.min(popupY, viewportHeight - popupHeight - 20));
        
        setPopupPosition({
          top: `${popupY}px`,
          left: `${popupX}px`
        });
      }
    }
  }, [clickedPosition, arrowPath]);

  if (!showFeedback) return null;

  // Verifica se o clique foi dentro do bairro correto
  const isCorrectNeighborhood = !arrowPath && clickedPosition && currentNeighborhood && 
    geoJsonData?.features.some(feature => 
      feature.properties?.name === currentNeighborhood &&
      (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') &&
      turf.booleanPointInPolygon([clickedPosition.lng, clickedPosition.lat], feature as Feature<Polygon | MultiPolygon>)
    );

  // Calcula a distância até o bairro correto
  const distance = arrowPath && clickedPosition ? calculateDistance(clickedPosition, arrowPath[1]) : 0;
  console.log('Distância atual:', distance); // Debug

  return (
    <div style={{
      position: 'fixed',
      top: gameOver ? 'auto' : window.innerWidth <= 768 ? 'auto' : popupPosition.top,
      bottom: window.innerWidth <= 768 ? 0 : gameOver ? 0 : 'auto',
      left: gameOver ? 0 : window.innerWidth <= 768 ? 0 : popupPosition.left,
      right: window.innerWidth <= 768 ? 0 : 'auto',
      transform: gameOver ? 'none' : window.innerWidth <= 768 ? 'none' : 'translate(-50%, -50%)',
      width: window.innerWidth <= 768 ? '100%' : '90%',
      maxWidth: gameOver ? '100%' : '600px',
      background: 'rgba(0, 25, 0, 0.95)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      color: 'white',
      zIndex: 9999,
      padding: gameOver ? 'clamp(25px, 5vw, 35px)' : 'clamp(25px, 5vw, 35px)',
      borderRadius: window.innerWidth <= 768 ? '24px 24px 0 0' : '24px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
      border: 'none',
      margin: window.innerWidth <= 768 ? '0' : '10px',
      animation: gameOver ? 'slideUp 0.3s ease-out' : window.innerWidth <= 768 ? 'slideUp 0.3s ease-out' : 'slideIn 0.3s ease-out',
      maxHeight: window.innerWidth <= 768 ? '90vh' : 'auto',
      overflowY: window.innerWidth <= 768 ? 'auto' : 'visible'
    }}>
      {!gameOver && clickedPosition && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(12px, 2vw, 20px)',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
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
                   INCRÍVEL! 🎯
                </div>
                <div style={{
                  fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                  color: '#fff',
                  lineHeight: 1.1
                }}>
                  Em {clickTime.toFixed(2)} seg você acertou na mosca o bairro <span style={{ color: '#32CD32', fontWeight: 600 }}>{capitalizeWords(currentNeighborhood)}</span>!
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: 'clamp(10px, 2vw, 20px)',
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
                    fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)',
                    fontFamily: "'Inter', sans-serif",
                    marginRight: 'clamp(2px, 0.5vw, 4px)',
                    opacity: 0.9
                  }}>🎯</div>
                  <div style={{ 
                    fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    color: '#fff',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}>
                    {Math.round(score)}
                  </div>
                  <div style={{ 
                    fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    marginLeft: 'clamp(1px, 0.3vw, 2px)',
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
                    fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)',
                    fontFamily: "'Inter', sans-serif",
                    marginRight: 'clamp(2px, 0.5vw, 4px)',
                    opacity: 0.9
                  }}>⏱️</div>
                  <div style={{ 
                    fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    color: '#fff',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}>
                    {Math.round(1000 - (clickTime * 100))}
                  </div>
                  <div style={{ 
                    fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    marginLeft: 'clamp(1px, 0.3vw, 2px)',
                    opacity: 0.9
                  }}>pts</div>
                  {timeBonus > 0 && (
                    <div style={{ 
                      fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 500,
                      marginLeft: 'clamp(4px, 1vw, 8px)',
                      color: '#FFD700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      background: 'rgba(255, 215, 0, 0.1)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid rgba(255, 215, 0, 0.2)',
                      animation: 'pulseText 1s infinite'
                    }}>
                      <span>⚡</span> +{timeBonus.toFixed(2)}s
                    </div>
                  )}
                </div>
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
                Em {displayedTime.toFixed(2)} seg você clicou
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
                }}>metros até a intersecção com o bairro <span style={{ color: '#32CD32', fontWeight: 600 }}>{capitalizeWords(currentNeighborhood)}</span></div>
              </div>
              <div style={{
                display: 'flex',
                gap: 'clamp(10px, 2vw, 20px)',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                width: '100%'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '2px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ 
                    fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)',
                    fontFamily: "'Inter', sans-serif",
                    marginRight: 'clamp(2px, 0.5vw, 4px)',
                    opacity: 0.9
                  }}>📍</div>
                  <div style={{ 
                    fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    color: '#fff',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}>
                    {(displayedDistance / 1000).toFixed(1)}
                  </div>
                  <div style={{ 
                    fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    marginLeft: 'clamp(1px, 0.3vw, 2px)',
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
                    fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)',
                    fontFamily: "'Inter', sans-serif",
                    marginRight: 'clamp(2px, 0.5vw, 4px)',
                    opacity: 0.9
                  }}>⏱️</div>
                  <div style={{ 
                    fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    color: '#fff',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }}>
                    {Math.round(1000 - (clickTime * 100))}
                  </div>
                  <div style={{ 
                    fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    marginLeft: 'clamp(1px, 0.3vw, 2px)',
                    opacity: 0.9
                  }}>pts</div>
                  {timeBonus > 0 && (
                    <div style={{ 
                      fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 500,
                      marginLeft: 'clamp(4px, 1vw, 8px)',
                      color: '#FFD700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      background: 'rgba(255, 215, 0, 0.1)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid rgba(255, 215, 0, 0.2)',
                      animation: 'pulseText 1s infinite'
                    }}>
                      <span>⚡</span> +{timeBonus.toFixed(2)}s
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {timeBonus > 0 && !gameOver && (
        <div style={{
          marginTop: 'clamp(4px, 1vw, 8px)',
          color: '#FFD700',
          fontWeight: 600,
          fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
          textAlign: 'center',
          fontFamily: "'Inter', sans-serif",
          animation: 'pulseText 1s infinite',
          opacity: 0.95,
          background: 'rgba(255, 215, 0, 0.1)',
          padding: 'clamp(4px, 1vw, 8px)',
          borderRadius: '6px',
          border: '1px solid rgba(255, 215, 0, 0.2)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          display: 'none'
        }}>
          ⚡ +{timeBonus.toFixed(2)}s
        </div>
      )}

      {feedbackMessage && !gameOver && (
        <div style={{
          marginTop: 'clamp(4px, 1vw, 8px)',
          color: feedbackMessage.includes("Muito bem") ? '#FFD700' : '#FFD700',
          fontWeight: 600,
          fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
          textAlign: 'center',
          fontFamily: "'Inter', sans-serif",
          animation: feedbackMessage.includes("Muito bem") ? 'pulseText 1s infinite' : 'none',
          opacity: 0.95,
          background: 'rgba(255, 215, 0, 0.1)',
          padding: 'clamp(4px, 1vw, 8px)',
          borderRadius: '6px',
          border: '1px solid rgba(255, 215, 0, 0.2)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          {feedbackMessage}
        </div>
      )}

      {gameOver && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(12px, 2vw, 20px)',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            color: '#FF0000',
            margin: '0',
            fontWeight: 800,
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            Game Over
          </h2>
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
              {score >= 20000 ? "REI DA GEOGRAFIA! Você conhece Santos!" :
               score >= 15000 ? "MITO SANTISTA! Até as ondas do mar te aplaudem!" :
               score >= 10000 ? "LENDÁRIO! Você é um Pelé da geografia santista!" :
               score >= 8000 ? "MESTRE DOS BAIRROS!  Você é um GPS ambulante!" :
               score >= 5000 ? "IMPRESSIONANTE!  Quase um GPS humano!!" :
               score >= 4000 ? "VC É MAIS SANTISTA QUE PASTEL DE VENTO NA FEIRA! 🥟" :
               score >= 3000 ? "SANTISTA DE CORAÇÃO!  Você manja dos bairros!" :
               score >= 2000 ? "MUITO BOM!  Você é deve ter ido em algumas aulas de geografia!" :
               score >= 1000 ? "BOM JOGO!  Mas ainda precisa andar mais pela zona noroeste!" :
               score >= 500 ? "QUASE LÁ!  Dá um role no bondinho pra pegar umas dicas!" :
               score >= 100 ? "MAIS PERDIDO QUE DOIDO NA PONTA DA PRAIA! " :
               "Eita! Parece que você não sabe nada de Santos!"}
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: 'clamp(10px, 2vw, 20px)',
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
                fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)',
                fontFamily: "'Inter', sans-serif",
                marginRight: 'clamp(2px, 0.5vw, 4px)',
                opacity: 0.9
              }}>🏆</div>
              <div style={{ 
                fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                color: '#fff',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}>
                {score.toLocaleString()}
              </div>
              <div style={{ 
                fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                marginLeft: 'clamp(1px, 0.3vw, 2px)',
                opacity: 0.9
              }}>pts</div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: 'clamp(15px, 3vw, 20px)',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%'
          }}>
            <button
              onClick={() => {
                const mensagem = score >= 20000 ? "REI DA GEOGRAFIA! Eu conheço Santos!" :
                score >= 15000 ? "MITO SANTISTA! Até as ondas do mar me aplaudem!" :
                score >= 10000 ? "LENDÁRIO! Eu sou um Pelé da geografia santista!" :
                score >= 8000 ? "MESTRE DOS BAIRROS! Eu sou um GPS ambulante!" :
                score >= 5000 ? "IMPRESSIONANTE! Quase um GPS humano!!" :
                score >= 4000 ? "SOU MAIS SANTISTA QUE PASTEL DE VENTO NA FEIRA! 🥟" :
                score >= 3000 ? "SANTISTA DE CORAÇÃO! Eu manjo dos bairros!" :
                score >= 2000 ? "MUITO BOM! Eu devo ter ido em algumas aulas de geografia!" :
                score >= 1000 ? "BOM JOGO! Mas ainda preciso andar mais na zona noroeste!" :
                score >= 500 ? "QUASE LÁ! Vou dar um rolê no bondinho pra pegar mais dicas!" :
                score >= 100 ? "MAIS PERDIDO QUE DOIDO NA PONTA DA PRAIA! " :
                "Eita! Parece que eu não sei nada de Santos!";
              
              const shareText = `${score >= 100 ? '🏆' : '🎮'} ${mensagem} Joguei O Caiçara e fiz ${score} pontos! Jogue agora em https://hericmr.github.io/jogocaicara e veja quanto você consegue fazer!`;
                
                if (navigator.share) {
                  navigator.share({
                    title: 'O Caiçara',
                    text: shareText,
                    url: 'https://hericmr.github.io/jogocaicara'
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(shareText).then(() => {
                    alert('Texto copiado para a área de transferência!');
                  }).catch(console.error);
                }
              }}
              style={{
                padding: 'clamp(8px, 2vw, 12px) clamp(16px, 3vw, 24px)',
                fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
                background: '#FFD700',
                color: '#000000',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#FFC000'}
              onMouseOut={(e) => e.currentTarget.style.background = '#FFD700'}
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
        flexWrap: 'nowrap',
        width: '100%'
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
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              flex: '1',
              maxWidth: '45%'
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
            background: gameOver ? '#FF0000' : '#32CD32',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            overflow: 'hidden',
            flex: '1',
            maxWidth: gameOver ? '100%' : '45%',
            height: 'auto'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = gameOver ? '#CC0000' : '#28a745'}
          onMouseOut={(e) => e.currentTarget.style.background = gameOver ? '#FF0000' : '#32CD32'}
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
          }}>{gameOver ? 'Tente Outra Vez' : 'Próximo'}</span>
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
              transform: translateY(100%);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}; 