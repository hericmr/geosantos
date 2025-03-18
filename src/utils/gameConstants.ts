export const ROUND_TIME = 10; // 10 seconds per round
export const TIME_BONUS = 1.5; // Time bonus for correct neighborhood
export const MAX_DISTANCE_METERS = 2000; // Maximum distance considered for scoring

export const getProgressBarColor = (timeLeft: number): string => {
  const percentage = (timeLeft / ROUND_TIME) * 100;
  if (percentage > 60) return '#00FF66';
  if (percentage > 30) return '#FFD700';
  return '#FF4444';
};

export const getFeedbackMessage = (distance: number): string => {
  if (distance < 10) return "Perfeição! Você é o Chorão dos bairros! Já pode montar a banca de surfista!";
  if (distance < 30) return "Impressionante! Você é tão santista que até o peixe te respeita!";
  if (distance < 50) return "Brabo! Você é mais santista que pastel de vento na feira!";
  if (distance < 100) return "Incrível! Caiçara raiz, anda mais que o caminhão de peixe!";
  if (distance < 300) return "Muito bom! Você já é praticamente um guia turístico de Santos!";
  if (distance < 500) return "Legal! Manja mais muita gente!";
  if (distance < 1000) return "Tá quase lá! Mais um pouco e você já vira morador de Santos!";
  if (distance < 1500) return "Eita! Tá mais perdido que turista no mercado do peixe!";
  if (distance < 2000) return "Vish! Tá mais perdido que doido na Ponta da Praia!";
  return "Olha... Santos é um ovo! Dá um rolê de bonde pra não se perder mais!";
};
