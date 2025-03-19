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
        
        // Dimensões do popup
        const popupHeight = 300; // altura estimada do popup
        const popupWidth = 400; // largura estimada do popup
        
        // Deslocamento padrão para a direita e para cima
        const offsetX = 50; // pixels para a direita
        const offsetY = -100; // pixels para cima
        
        // Calcula a posição inicial do popup próximo ao clique
        let popupX = clickX + offsetX;
        let popupY = clickY + offsetY;
        
        // Verifica se o popup ficaria por cima de algum ponto importante
        if (arrowPath) {
          // Verifica se o popup está sobrepondo o ponto de clique
          const isOverClick = (
            popupX < clickX + 50 && 
            popupX + popupWidth > clickX - 50 && 
            popupY < clickY + 50 && 
            popupY + popupHeight > clickY - 50
          );
          
          // Verifica se o popup está sobrepondo o ponto correto
          const isOverTarget = (
            popupX < targetX + 50 && 
            popupX + popupWidth > targetX - 50 && 
            popupY < targetY + 50 && 
            popupY + popupHeight > targetY - 50
          );
          
          // Se estiver sobrepondo algum ponto, ajusta a posição
          if (isOverClick || isOverTarget) {
            // Tenta posicionar à direita do ponto de clique
            popupX = clickX + popupWidth/2;
            popupY = clickY - popupHeight/2;
            
            // Se ainda estiver sobrepondo, tenta posicionar à esquerda
            if (isOverClick || isOverTarget) {
              popupX = clickX - popupWidth - popupWidth/2;
            }
          }
        }
        
        // Ajusta a posição para evitar que o popup saia da tela
        popupX = Math.min(Math.max(popupX, 20), viewportWidth - popupWidth - 20);
        popupY = Math.max(20, Math.min(popupY, viewportHeight - popupHeight - 20));
        
        setPopupPosition({
          top: `${popupY}px`,
          left: `${popupX}px`
        });
      } else {
        // Em desktop, calcula a posição baseada no clique
        const clickX = (clickedPosition.lng + 180) * (viewportWidth / 360);
        const clickY = (90 - clickedPosition.lat) * (viewportHeight / 180);
        
        // Se tiver o ponto correto (arrowPath), calcula sua posição na viewport
        let targetX = 0, targetY = 0;
        if (arrowPath) {
          targetX = (arrowPath[1].lng + 180) * (viewportWidth / 360);
          targetY = (90 - arrowPath[1].lat) * (viewportHeight / 180);
        }
        
        // Dimensões do popup
        const popupHeight = 300; // altura estimada do popup
        const popupWidth = 400; // largura estimada do popup
        
        // Calcula a posição inicial do popup (canto superior direito da tela)
        let popupX = viewportWidth - popupWidth - 20; // 20px de margem da borda
        let popupY = viewportHeight - popupHeight - 100; // 100px do fundo da tela
        
        // Verifica se o popup ficaria por cima de algum ponto importante
        if (arrowPath) {
          // Verifica se o popup está sobrepondo o ponto de clique
          const isOverClick = (
            popupX < clickX + 50 && 
            popupX + popupWidth > clickX - 50 && 
            popupY < clickY + 50 && 
            popupY + popupHeight > clickY - 50
          );
          
          // Verifica se o popup está sobrepondo o ponto correto
          const isOverTarget = (
            popupX < targetX + 50 && 
            popupX + popupWidth > targetX - 50 && 
            popupY < targetY + 50 && 
            popupY + popupHeight > targetY - 50
          );
          
          // Se estiver sobrepondo algum ponto, move para o canto inferior esquerdo
          if (isOverClick || isOverTarget) {
            popupX = 20; // 20px da borda esquerda
          }
        }
        
        setPopupPosition({
          top: `${popupY}px`,
          left: `${popupX}px`
        });
      }
    }
  }, [clickedPosition, arrowPath]);

  if (!showFeedback) return null;

  // Verifica se o clique foi dentro do bairro correto (quando não há seta)
  const isCorrectNeighborhood = !arrowPath;

  return (
    <div style={{
      position: 'fixed',
      top: gameOver ? '50%' : popupPosition.top,
      left: gameOver ? '50%' : popupPosition.left,
      transform: gameOver ? 'translate(-50%, -50%)' : window.innerWidth <= 768 ? 'translate(-50%, 0)' : 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: gameOver ? '600px' : '400px',
      background: gameOver ? 'rgba(0, 25, 0, 0.98)' : 'rgba(0, 25, 0, 0.95)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: 'white',
      zIndex: gameOver ? 9999 : 1001,
      padding: gameOver ? 'clamp(35px, 7vw, 45px)' : 'clamp(20px, 4vw, 30px)',
      borderRadius: '20px',
      boxShadow: gameOver ? 
        '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 0 2px rgba(50, 205, 50, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.1)' :
        '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
      border: gameOver ? '2px solid rgba(50, 205, 50, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
      margin: '10px',
      animation: gameOver ? 'fadeInScale 0.3s ease-out' : 'none'
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
                   INCRÍVEL! Em {clickTime.toFixed(2)} seg você acertou na mosca o bairro <span style={{ color: '#32CD32', fontWeight: 600 }}>{capitalizeWords(currentNeighborhood)}</span>!
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
                }}>metros do bairro <span style={{ color: '#32CD32', fontWeight: 600 }}>{capitalizeWords(currentNeighborhood)}</span></div>
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
          gap: 'clamp(25px, 5vw, 35px)',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <h2 style={{ 
            color: 'white', 
            marginBottom: '10px', 
            fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
            textAlign: 'center',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            opacity: 0.95,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            lineHeight: 1.2
          }}>
            {score >= 20000 ? "REI DA GEOGRAFIA! Você conhece Santos!" :
             score >= 15000 ? "MITO SANTISTA! Até as ondas do mar te aplaudem!" :
             score >= 10000 ? "LENDÁRIO! Você é um Pelé da geografia santista!" :
             score >= 8000 ? "MESTRE DOS BAIRROS! 🧠 Você é um GPS ambulante!" :
             score >= 5000 ? "IMPRESSIONANTE! 🌟 Quase um GPS humano!!" :
             score >= 4000 ? "VC É MAIS SANTISTA QUE PASTEL DE VENTO NA FEIRA! 🥟" :
             score >= 3000 ? "SANTISTA DE CORAÇÃO! ❤️ Você manja dos bairros!" :
             score >= 2000 ? "MUITO BOM! 👏 Você é deve ter ido em algumas aulas de geografia!" :
             score >= 1000 ? "BOM JOGO! 👍 Mas ainda precisa andar mais na zona noroeste!" :
             score >= 500 ? "QUASE LÁ! 🎯 Dá um role no bondinho pra pegar mais dicas!" :
             score >= 100 ? "MAIS PERDIDO QUE DOIDO NA PONTA DA PRAIA! 🏖️" :
             "Game Over! 🚨 Eita! Parece que você não sabe nada de Santos!"}
          </h2>
          
          {score >= 20000 && (
            <h3 style={{ 
              color: 'white', 
              marginBottom: 'clamp(15px, 3vw, 25px)', 
              fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
              textAlign: 'center',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              opacity: 0.9,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              lineHeight: 1.2
            }}>
              Todos se curvam ao mestre.
            </h3>
          )}

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'clamp(15px, 3vw, 20px)',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: 'clamp(25px, 5vw, 35px)',
            borderRadius: '15px',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            width: '100%',
            maxWidth: '400px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%'
            }}>
              <span style={{
                fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                color: '#FFD700',
                fontWeight: 600,
                textAlign: 'center',
                fontFamily: "'Inter', sans-serif",
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                Pontuação Final
              </span>
              <span style={{
                fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
                color: '#32CD32',
                fontWeight: 700,
                textAlign: 'center',
                fontFamily: "'Inter', sans-serif",
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                animation: 'pulseScore 2s infinite'
              }}>
                {score}
              </span>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'rgba(255, 255, 255, 0.2)', margin: '10px 0' }}></div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
                  color: '#FFD700',
                  fontWeight: 600,
                  textAlign: 'center',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Seu Nível Final
                </span>
                <span style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.2rem)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  textAlign: 'center',
                  fontFamily: "'Inter', sans-serif",
                  marginTop: '5px'
                }}>
                  {score >= 20000 ? 12 :
                   score >= 16000 ? 10 :
                   score >= 12000 ? 8 :
                   score >= 8000 ? 6 :
                   score >= 5000 ? 4 :
                   score >= 3000 ? 3 :
                   score >= 1000 ? 2 : 1}
                </span>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
                  color: '#FFD700',
                  fontWeight: 600,
                  textAlign: 'center',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Sua Nota:
                </span>
                <span style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.2rem)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  textAlign: 'center',
                  fontFamily: "'Inter', sans-serif",
                  marginTop: '5px'
                }}>
                  {score >= 20000 ? 150 :
                   score >= 16000 ? 135 :
                   score >= 12000 ? 120 :
                   score >= 8000 ? 110 :
                   score >= 5000 ? 102 :
                   score >= 3000 ? 95 :
                   score >= 1000 ? 85 : 70}
                </span>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: 'clamp(15px, 3vw, 20px)',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: 'clamp(10px, 2vw, 15px)'
          }}>
            <button
              onClick={() => {
                // Obtém a mensagem personalizada com base na pontuação
                const mensagem = score >= 20000 ? "REI DA GEOGRAFIA! Você conhece Santos!" :
                  score >= 15000 ? "MITO SANTISTA! Até as ondas do mar te aplaudem!" :
                  score >= 10000 ? "LENDÁRIO! Você é um Pelé da geografia santista!" :
                  score >= 8000 ? "MESTRE DOS BAIRROS! 🧠 Você é um GPS ambulante!" :
                  score >= 5000 ? "IMPRESSIONANTE! 🌟 Quase um GPS humano!!" :
                  score >= 4000 ? "VC É MAIS SANTISTA QUE PASTEL DE VENTO NA FEIRA! 🥟" :
                  score >= 3000 ? "SANTISTA DE CORAÇÃO! ❤️ Você manja dos bairros!" :
                  score >= 2000 ? "MUITO BOM! 👏 Você é deve ter ido em algumas aulas de geografia!" :
                  score >= 1000 ? "BOM JOGO! 👍 Mas ainda precisa andar mais na zona noroeste!" :
                  score >= 500 ? "QUASE LÁ! 🎯 Dá um role no bondinho pra pegar mais dicas!" :
                  score >= 100 ? "MAIS PERDIDO QUE DOIDO NA PONTA DA PRAIA! 🏖️" :
                  "Game Over! 🚨 Eita! Parece que você não sabe nada de Santos!";
                  
                const shareText = `${score >= 100 ? '🏆' : '🎮'} ${mensagem} Joguei O Caiçara e fiz ${score} pontos - Nível ${score >= 20000 ? 12 : score >= 16000 ? 10 : score >= 12000 ? 8 : score >= 8000 ? 6 : score >= 5000 ? 4 : score >= 3000 ? 3 : score >= 1000 ? 2 : 1}! Jogue agora em https://caicara.app e veja quanto você consegue fazer!`;

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
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transform: 'translateY(0)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#FF8C00';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#FFA500';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
              }}
            >
              <span>📱</span> Compartilhar
            </button>
            
            <button
              onClick={() => {
                window.open('https://hericmr.github.io/me', '_blank');
              }}
              style={{
                padding: 'clamp(8px, 2vw, 12px) clamp(16px, 3vw, 24px)',
                fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#45a049';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#4CAF50';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
              }}
            >
              <span>📝</span> Héric Moura
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
            width: gameOver ? 'clamp(150px, 30vw, 180px)' : 'clamp(120px, 25vw, 150px)',
            height: gameOver ? 'clamp(50px, 10vw, 60px)' : 'clamp(40px, 8vw, 50px)'
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
            50% { transform: scale(1.1); }
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
        `}
      </style>
    </div>
  );
}; 