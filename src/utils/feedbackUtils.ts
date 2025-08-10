import { TIME_BONUS_THRESHOLDS, TIME_BONUS_AMOUNTS } from './gameConstants';
import { getFeedbackMessage } from './gameConstants';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface AchievementData {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  achievement: string;
  streakBonus: string | null;
}

export interface PopupPosition {
  top: string;
  left: string;
}

/**
 * Calcula dados de conquista baseados na distância, tempo e sequência de acertos
 */
export const getAchievementData = (
  distance: number, 
  clickTime: number, 
  consecutiveCorrect: number = 0
): AchievementData => {
  const distanceKm = distance / 1000;
  
  // Conquistas baseadas na distância
  if (distance === 0) {
    return {
      title: "ACERTO PERFEITO!",
      subtitle: "",
      icon: "checkcircle",
      color: "#FFD700",
      achievement: "BULLSEYE",
      streakBonus: consecutiveCorrect >= 3 ? `${consecutiveCorrect} acertos seguidos!` : null
    };
  } else if (distanceKm < 0.5) {
    return {
      title: "INCRÍVEL!",
      subtitle: "",
      icon: "sparkles",
      color: "#FFA500",
      achievement: "NEAR_PERFECT",
      streakBonus: consecutiveCorrect >= 2 ? `${consecutiveCorrect} acertos seguidos!` : null
    };
  } else if (distanceKm < 1) {
    return {
      title: "EXCELENTE!",
      subtitle: "",
      icon: "sparkles",
      color: "#32CD32",
      achievement: "EXCELLENT",
      streakBonus: null
    };
  } else if (distanceKm < 2) {
    return {
      title: "MUITO BOM!",
      subtitle: "",
      icon: "thumbsup",
      color: "#00CED1",
      achievement: "GOOD",
      streakBonus: null
    };
  } else if (distanceKm < 5) {
    return {
      title: "QUASE LÁ!",
      subtitle: "",
      icon: "helpcircle",
      color: "#FFD700",
      achievement: "CLOSE",
      streakBonus: null
    };
  } else {
    return {
      title: "OPS!",
      subtitle: "",
      icon: "frown",
      color: "#FF6B6B",
      achievement: "FAR",
      streakBonus: null
    };
  }
};

/**
 * Calcula o bônus de tempo baseado na pontuação total
 */
export const calculateTimeBonus = (totalScore: number): number => {
  if (totalScore >= TIME_BONUS_THRESHOLDS.PERFECT) {
    return TIME_BONUS_AMOUNTS.PERFECT;
  } else if (totalScore >= TIME_BONUS_THRESHOLDS.EXCELLENT) {
    return TIME_BONUS_AMOUNTS.EXCELLENT;
  } else if (totalScore >= TIME_BONUS_THRESHOLDS.GREAT) {
    return TIME_BONUS_AMOUNTS.GREAT;
  } else if (totalScore >= TIME_BONUS_THRESHOLDS.GOOD) {
    return TIME_BONUS_AMOUNTS.GOOD;
  } else if (totalScore >= TIME_BONUS_THRESHOLDS.DECENT) {
    return TIME_BONUS_AMOUNTS.DECENT;
  } else if (totalScore >= TIME_BONUS_THRESHOLDS.FAIR) {
    return TIME_BONUS_AMOUNTS.FAIR;
  } else if (totalScore >= TIME_BONUS_THRESHOLDS.CLOSE) {
    return TIME_BONUS_AMOUNTS.CLOSE;
  }
  return 0;
};

/**
 * Calcula a posição ideal para o painel de feedback baseado na posição do clique
 * Garante que o modal sempre fique alinhado à esquerda e nunca na frente da área do clique
 */
export const calculateOptimalPosition = (
  clickedPosition: LatLng | null,
  arrowPath: LatLng[] | null,
  isMobile: boolean
): PopupPosition => {
  if (!clickedPosition || isMobile) {
    return { top: '20px', left: '20px' };
  }

  // Sempre alinhar à esquerda para evitar sobrepor a área do clique
  const leftPosition = '20px';
  
  // Calcular posição vertical baseada na posição do clique
  const clickY = clickedPosition.lat;
  const viewportHeight = window.innerHeight;
  
  // Converter coordenadas geográficas para posição vertical da tela
  // Assumindo que a latitude -23.9 (Santos) corresponde ao topo da tela
  // e -24.1 corresponde à parte inferior
  const latRange = 0.8; // -23.9 a -24.1
  const normalizedY = (clickY - (-24.1)) / latRange; // 0 = bottom, 1 = top
  
  // Calcular posição vertical em pixels, posicionando mais alto
  // Usar apenas 60% da altura da viewport para posicionar mais alto
  const topPosition = Math.max(20, Math.min(viewportHeight - 200, normalizedY * viewportHeight * 0.6));
  
  return { 
    top: `${topPosition}px`, 
    left: leftPosition 
  };
};

/**
 * Anima o tempo usando CSS transitions para melhor performance
 */
export const animateTime = (
  startTime: number,
  endTime: number,
  duration: number,
  onUpdate: (time: number) => void,
  onComplete: () => void
): (() => void) => {
  // OTIMIZAÇÃO: Usar CSS transitions em vez de requestAnimationFrame
  const startTimestamp = performance.now();
  let animationId: number;
  let isCancelled = false;

  const animate = (currentTimestamp: number) => {
    if (isCancelled) return;
    
    const elapsed = currentTimestamp - startTimestamp;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function otimizada (cubic-bezier)
    const easedProgress = progress < 0.5 
      ? 4 * progress * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    const currentTime = startTime + (endTime - startTime) * easedProgress;
    
    onUpdate(currentTime);
    
    if (progress < 1 && !isCancelled) {
      animationId = requestAnimationFrame(animate);
    } else if (!isCancelled) {
      onComplete();
    }
  };

  // Usar requestIdleCallback se disponível para melhor performance
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      if (!isCancelled) {
        animationId = requestAnimationFrame(animate);
      }
    });
  } else {
    animationId = requestAnimationFrame(animate);
  }

  // Retorna função para cancelar a animação
  return () => {
    isCancelled = true;
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
};

/**
 * Verifica se deve mostrar animação de streak
 */
export const shouldShowStreakAnimation = (
  distance: number, 
  consecutiveCorrect: number
): boolean => {
  return distance === 0 && consecutiveCorrect >= 2;
};

/**
 * Gera mensagem de feedback baseada no desempenho
 */
export const generateFeedbackMessage = (
  distance: number, 
  clickTime: number, 
  consecutiveCorrect: number
): string => {
  return getFeedbackMessage(distance, clickTime, consecutiveCorrect);
}; 