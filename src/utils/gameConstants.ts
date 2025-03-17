export const ROUND_TIME = 45; // 45 seconds per round
export const TIME_BONUS = 5; // Time bonus for correct neighborhood
export const MAX_DISTANCE_METERS = 2000; // Maximum distance considered for scoring

export const getProgressBarColor = (timeLeft: number): string => {
  const percentage = (timeLeft / ROUND_TIME) * 100;
  if (percentage > 60) return '#4CAF50';
  if (percentage > 30) return '#FFA500';
  return '#FF0000';
};

export const getFeedbackMessage = (distance: number): string => {
  if (distance < 100) return "Incrível! Você é um verdadeiro Caiçara!";
  if (distance < 500) return "Muito bom! Você conhece bem Santos!";
  if (distance < 1000) return "Legal! Continue explorando a cidade!";
  return "Continue tentando! Você está aprendendo!";
}; 