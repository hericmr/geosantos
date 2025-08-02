import React from 'react';
import { TrophyIcon, XIcon, ShareIcon } from '../GameIcons';
import styles from '../GameOverModal.module.css';

interface ActionButtonsProps {
  score: number;
  onPlayAgain: () => void;
  onClose: () => void;
}

// Função para gerar texto de compartilhamento
const getShareText = (score: number): string => {
  const scoreMessages = [
    { min: 100000, message: "REI DA GEOGRAFIA! Eu conheço Santos!" },
    { min: 80000, message: "MITO SANTISTA! Até as ondas do mar me aplaudem!" },
    { min: 60000, message: "LENDÁRIO! Eu sou um Pelé da geografia santista!" },
    { min: 50000, message: "MESTRE DOS BAIRROS! Eu sou um GPS ambulante!" },
    { min: 40000, message: "IMPRESSIONANTE! Quase um GPS humano!!" },
    { min: 30000, message: "SOU MAIS SANTISTA QUE PASTEL DE VENTO NA FEIRA!" },
    { min: 25000, message: "SANTISTA DE CORAÇÃO! Eu manjo dos bairros!" },
    { min: 20000, message: "MUITO BOM! Eu devo ter ido em algumas aulas de geografia!" },
    { min: 15000, message: "BOM JOGO! Mas ainda preciso andar mais pela zona noroeste!" },
    { min: 12000, message: "QUASE LÁ! Vou dar um rolê no bondinho pra pegar umas dicas!" },
    { min: 10000, message: "MAIS PERDIDO QUE DOIDO NA PONTA DA PRAIA!" },
    { min: 8000, message: "Eita! Parece que eu não sei nada de Santos!" },
    { min: 6000, message: "Confundi Santos com o interior do Mato Grosso!" },
    { min: 4000, message: "Me colocaram pra jogar vendado?" },
    { min: 2000, message: "Eu achava que o Boqueirão era em Salvador?" },
    { min: 1000, message: "Eita! Parece que eu não sei nada de Santos!" },
    { min: 500, message: "Confundi Santos com o interior do Mato Grosso!" },
    { min: 100, message: "Me colocaram pra jogar vendado?" },
  ];

  const scoreMessage = scoreMessages.find(level => score >= level.min)?.message || 
    "Eita! Parece que eu não sei nada de Santos!";

  return `${scoreMessage} Joguei o Geosantos e fiz ${score} pontos! Jogue agora em https://hericmr.github.io/geosantos e veja quanto você consegue fazer!`;
};

// Função para lidar com compartilhamento
const handleShare = async (score: number) => {
  const shareText = getShareText(score);

  try {
    if (navigator.share) {
      await navigator.share({ text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Texto copiado para a área de transferência! Desafie uma pessoa, compartilhe o jogo!');
    }
  } catch (error) {
    console.error('Erro ao compartilhar:', error);
    // Fallback para navegadores mais antigos
    try {
      await navigator.clipboard.writeText(shareText);
      alert('Texto copiado para a área de transferência! Desafie uma pessoa, compartilhe o jogo!');
    } catch (fallbackError) {
      console.error('Erro no fallback:', fallbackError);
      alert('Erro ao compartilhar. Tente copiar manualmente o link do jogo.');
    }
  }
};

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  score,
  onPlayAgain,
  onClose
}) => {
  return (
    <div className={styles.actionButtons}>
      <button
        onClick={onPlayAgain}
        className={`${styles.actionButton} ${styles.primary}`}
        aria-label="Jogar novamente"
        data-testid="play-again-button"
      >
        <TrophyIcon size={16} color="var(--text-primary)" />
        JOGAR NOVAMENTE
      </button>
      
      <button
        onClick={() => handleShare(score)}
        className={`${styles.actionButton} ${styles.secondary}`}
        aria-label="Compartilhar pontuação"
        data-testid="share-button"
      >
        <ShareIcon size={16} color="var(--text-primary)" />
        COMPARTILHAR
      </button>
      
      <button
        onClick={onClose}
        className={`${styles.actionButton} ${styles.tertiary}`}
        aria-label="Voltar ao menu principal"
        data-testid="close-button"
      >
        <XIcon size={16} color="var(--text-primary)" />
        MENU PRINCIPAL
      </button>
    </div>
  );
}; 