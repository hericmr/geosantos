import React, { useEffect, useState } from 'react';
import { getSpriteUrl } from '../../utils/assetUtils';
import { IDEAL_SPRITE_CONFIG } from '../../constants/spriteAnimation';
import './SpriteAnimation.css';

interface SpriteAnimationProps {
  position: [number, number];
  onAnimationComplete?: () => void;
  className?: string;
}

const SpriteAnimation: React.FC<SpriteAnimationProps> = ({ 
  position, 
  onAnimationComplete,
  className = ''
}) => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isAnimating, setIsAnimating] = useState(true);

  // Array com os 16 frames da animação
  const spriteFrames = Array.from({ length: 16 }, (_, i) => i + 1);

  useEffect(() => {
    if (!isAnimating) return;

    const frameInterval = setInterval(() => {
      setCurrentFrame((prevFrame: number) => {
        if (prevFrame >= 16) {
          // Animação completa
          setIsAnimating(false);
          onAnimationComplete?.();
          return 16;
        }
        return prevFrame + 1;
      });
    }, IDEAL_SPRITE_CONFIG.frameDelay); // Usar o frameDelay do config

    return () => clearInterval(frameInterval);
  }, [isAnimating, onAnimationComplete]);

  // Função para obter a URL da imagem do sprite
  const getSpriteFrameUrl = (frameNumber: number) => {
    return getSpriteUrl(`${frameNumber}.png`);
  };

  if (!isAnimating) {
    return null; // Remove o componente após a animação
  }

  return (
    <div
      className={`sprite-animation ${className}`}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${IDEAL_SPRITE_CONFIG.size}px`,
        height: `${IDEAL_SPRITE_CONFIG.size}px`,
        zIndex: 1000,
        pointerEvents: 'none'
      }}
    >
      <img
        src={getSpriteFrameUrl(currentFrame)}
        alt={`Sprite frame ${currentFrame}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)) contrast(1.3) saturate(1.4)'
        }}
      />
    </div>
  );
};

export default SpriteAnimation; 