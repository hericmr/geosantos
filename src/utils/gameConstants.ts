export const ROUND_TIME = 20; // 20 seconds per round
export const TIME_BONUS = 3; // Time bonus for correct neighborhood
export const MAX_DISTANCE_METERS = 2000; // Maximum distance considered for scoring

export const getProgressBarColor = (timeLeft: number): string => {
  const percentage = (timeLeft / ROUND_TIME) * 100;
  if (percentage > 60) return '#4CAF50';
  if (percentage > 30) return '#FFA500';
  return '#FF0000';
};

export const getFeedbackMessage = (distance: number): string => {
  if (distance < 10) return "Perfeição! Você é o Chorão dos bairros!";
  if (distance < 30) return "Impressionante! Você nasceu e cresceu em Santos!";
  if (distance < 50) return "Brabo! Você é mais santista que pastel de vento!";
  if (distance < 100) return "Incrível! Você é um verdadeiro Caiçara!";
  if (distance < 300) return "Muito bom! Você conhece bem Santos!";
  if (distance < 500) return "Legal! Você manja dos paranauê!";
  if (distance < 1000) return "Tá quase lá! Mais um pouquinho de praia e você chega!";
  if (distance < 1500) return "Eita! Tá mais perdido que turista de São Paulo!";
  if (distance < 2000) return "Vish! Tá mais perdido que doido na Ponta da Praia!";
  return "Olha... Santos é um ovo! Como você erra tanto assim? Vai dar uma volta de bonde pra conhecer melhor a cidade!";
}; 