import React from 'react';
import styles from '../GameOverModal.module.css';

interface ScoreDisplayProps {
  score: number;
}

// Estrutura de dados para níveis de pontuação
const scoreLevels = [
  { min: 100000, message: "REI DA GEOGRAFIA! Você conhece Santos!", color: "#FFD700" },
  { min: 80000, message: "MITO SANTISTA! Até as ondas do mar te aplaudem!", color: "#FFA500" },
  { min: 60000, message: "LENDÁRIO! Você é um Pelé da geografia santista!", color: "#FF8C00" },
  { min: 50000, message: "MESTRE DOS BAIRROS! Você é um GPS ambulante!", color: "#FF6347" },
  { min: 40000, message: "IMPRESSIONANTE! Quase um GPS humano!!", color: "#32CD32" },
  { min: 30000, message: "VC É MAIS SANTISTA QUE PASTEL DE VENTO NA FEIRA!", color: "#00CED1" },
  { min: 25000, message: "SANTISTA DE CORAÇÃO! Você manja dos bairros!", color: "#9370DB" },
  { min: 20000, message: "MUITO BOM! Você deve ter ido em algumas aulas de geografia!", color: "#FF69B4" },
  { min: 15000, message: "BOM JOGO! Mas ainda precisa andar mais pela zona noroeste!", color: "#FFD700" },
  { min: 12000, message: "QUASE LÁ! Dá um role no bondinho pra pegar umas dicas!", color: "#98FB98" },
  { min: 10000, message: "MAIS PERDIDO QUE DOIDO NA PONTA DA PRAIA!", color: "#F0E68C" },
  { min: 8000, message: "Eita! Parece que você não sabe nada de Santos!", color: "#87CEEB" },
  { min: 6000, message: "Confundiu Santos com o interior do Mato Grosso!", color: "#DDA0DD" },
  { min: 4000, message: "Te colocaram pra jogar vendado?", color: "#FFB6C1" },
  { min: 2000, message: "Você achava que o Boqueirão era em Salvador?", color: "#F0E68C" },
  { min: 1000, message: "Eita! Parece que você não sabe nada de Santos!", color: "#FF6B6B" },
  { min: 500, message: "Confundiu Santos com o interior do Mato Grosso!", color: "#FF4500" },
  { min: 100, message: "Te colocaram pra jogar vendado?", color: "#8B0000" },
];

const getScoreMeta = (score: number) => {
  return scoreLevels.find(level => score >= level.min) || {
    message: "Eita! Parece que você não sabe nada de Santos!",
    color: "#FF6B6B"
  };
};

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  const { message, color } = getScoreMeta(score);

  return (
    <div className={styles.scoreContainer}>
      <div 
        className={styles.score}
        style={{ color }}
        data-testid="score-display"
      >
        {score.toLocaleString()} PONTOS
      </div>
      <p className={styles.scoreMessage} data-testid="score-message">
        {message}
      </p>
    </div>
  );
}; 