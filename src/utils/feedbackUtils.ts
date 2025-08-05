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
 */
export const calculateOptimalPosition = (
  clickedPosition: LatLng | null,
  arrowPath: LatLng[] | null,
  isMobile: boolean
): PopupPosition => {
  if (!clickedPosition || !arrowPath || isMobile) {
    return { top: '50%', left: '50%' };
  }

  const clickX = clickedPosition.lng;
  const targetX = arrowPath[1].lng;
  const centerX = (clickX + targetX) / 2;
  
  if (clickX > centerX) {
    return { top: '40%', left: '20%' };
  } else {
    return { top: '40%', left: '80%' };
  }
};

/**
 * Anima o tempo usando requestAnimationFrame para maior fluidez
 */
export const animateTime = (
  startTime: number,
  endTime: number,
  duration: number,
  onUpdate: (time: number) => void,
  onComplete: () => void
): (() => void) => {
  const startTimestamp = performance.now();
  let animationId: number;

  const animate = (currentTimestamp: number) => {
    const elapsed = currentTimestamp - startTimestamp;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function para suavizar a animação
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentTime = startTime + (endTime - startTime) * easedProgress;
    
    onUpdate(currentTime);
    
    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else {
      onComplete();
    }
  };

  animationId = requestAnimationFrame(animate);

  // Retorna função para cancelar a animação
  return () => {
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