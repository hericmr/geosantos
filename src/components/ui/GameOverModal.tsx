import React, { useState, useEffect, useRef } from 'react';
import { rankingService } from '../../lib/supabase';
import {
  ScoreDisplay,
  StatsDisplay,
  SaveScoreForm,
  RankingPosition,
  TopRanking,
  ConfettiEffect,
  ActionButtons
} from './GameOverModal/index';
import styles from './GameOverModal.module.css';
import { getAudioUrl } from '../../utils/assetUtils';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
  score: number;
  playTime: number;
  roundsPlayed: number;
  accuracy: number;
  currentPlayerName: string;
}

// Mapeamento de frases para arquivos de áudio
const audioMapping: { [key: string]: string } = {
  "BOM JOGO! Mas ainda precisa andar mais pela zona noroeste!": "uau_bom_jogo.opus",
  "Confundiu Santos com o interior do Mato Grosso!": "confundiu_santos_com_ointerior_do_mato_grosso.opus",
  "Eita! Parece que você não sabe nada de Santos!": "eita_parece_que_voce_nao_sabe_nada_de_santos_mesmo.opus",
  "Olha, confundiu Santos com": "olha_confundiu_santos_com.opus"
};

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onClose,
  onPlayAgain,
  score,
  playTime,
  roundsPlayed,
  accuracy,
  currentPlayerName
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [rankingData, setRankingData] = useState<any[]>([]);
  const [playerPosition, setPlayerPosition] = useState<number | null>(null);
  const [showRankingPosition, setShowRankingPosition] = useState(false);
  const [currentScoreMessage, setCurrentScoreMessage] = useState<string>("");
  const gameOverAudioRef = useRef<HTMLAudioElement>(null);

  // Função para obter a mensagem baseada na pontuação
  const getScoreMessage = (score: number): string => {
    const scoreLevels = [
      { min: 100000, message: "REI DA GEOGRAFIA! Você conhece Santos!" },
      { min: 80000, message: "MITO SANTISTA! Até as ondas do mar te aplaudem!" },
      { min: 60000, message: "LENDÁRIO! Você é um Pelé da geografia santista!" },
      { min: 50000, message: "MESTRE DOS BAIRROS! Você é um GPS ambulante!" },
      { min: 40000, message: "IMPRESSIONANTE! Quase um GPS humano!!" },
      { min: 30000, message: "VC É MAIS SANTISTA QUE PASTEL DE VENTO NA FEIRA!" },
      { min: 25000, message: "SANTISTA DE CORAÇÃO! Você manja dos bairros!" },
      { min: 20000, message: "MUITO BOM! Você deve ter ido em algumas aulas de geografia!" },
      { min: 15000, message: "BOM JOGO! Mas ainda precisa andar mais pela zona noroeste!" },
      { min: 12000, message: "QUASE LÁ! Dá um role no bondinho pra pegar umas dicas!" },
      { min: 10000, message: "MAIS PERDIDO QUE DOIDO NA PONTA DA PRAIA!" },
      { min: 8000, message: "Eita! Parece que você não sabe nada de Santos!" },
      { min: 6000, message: "Confundiu Santos com o interior do Mato Grosso!" },
      { min: 4000, message: "Te colocaram pra jogar vendado?" },
      { min: 2000, message: "Você achava que o Boqueirão era em Salvador?" },
      { min: 1000, message: "Eita! Parece que você não sabe nada de Santos!" },
      { min: 500, message: "Confundiu Santos com o interior do Mato Grosso!" },
      { min: 100, message: "Te colocaram pra jogar vendado?" },
    ];

    const level = scoreLevels.find(level => score >= level.min);
    return level ? level.message : "Eita! Parece que você não sabe nada de Santos!";
  };

  // Função para tocar áudio baseado na mensagem
  const playGameOverAudio = (message: string) => {
    const audioFile = audioMapping[message];
    if (audioFile && gameOverAudioRef.current) {
      gameOverAudioRef.current.src = getAudioUrl(audioFile);
      gameOverAudioRef.current.volume = 0.7;
      gameOverAudioRef.current.play().catch((error) => {
        console.log('Erro ao tocar áudio de game over:', error);
      });
    }
  };

  const fetchRanking = async () => {
    try {
      const data = await rankingService.getTopPlayers(3);
      if (data) {
        setRankingData(data.slice(0, 3));
      }
    } catch (err) {
      console.error("Erro ao buscar ranking:", err);
    }
  };

  const fetchPlayerPosition = async () => {
    try {
      const position = await rankingService.getPlayerPosition(currentPlayerName, score);
      setPlayerPosition(position);
      setShowRankingPosition(true);
    } catch (err) {
      console.error("Erro ao buscar posição do jogador:", err);
    }
  };

  const handleScoreSaved = async () => {
    setShowConfetti(true);
    await fetchRanking();
    
    // Buscar posição do jogador após salvar
    await fetchPlayerPosition();
    
    // Parar confetti após 3 segundos
    setTimeout(() => setShowConfetti(false), 3000);
  };

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(false);
      setShowRankingPosition(false);
      setPlayerPosition(null);
      
      // Obter mensagem da pontuação e tocar áudio
      const message = getScoreMessage(score);
      setCurrentScoreMessage(message);
      
      // Tocar áudio com um pequeno delay para garantir que o modal carregou
      setTimeout(() => {
        playGameOverAudio(message);
      }, 500);
    }
  }, [isOpen, score]);

  if (!isOpen) return null;

  return (
    <div 
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      data-testid="game-over-modal"
    >
      <ConfettiEffect isVisible={showConfetti} />

      {/* Áudio para game over */}
      <audio ref={gameOverAudioRef} preload="auto" />

      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h1 
            id="game-over-title"
            className={styles.title}
            data-testid="game-over-title"
          >
            GAME OVER
          </h1>
          <p className={styles.subtitle}>
            DESAFIO GEOGRÁFICO DE SANTOS
          </p>
        </div>

        {/* Pontuação */}
        <ScoreDisplay score={score} />

        {/* Estatísticas */}
        <StatsDisplay
          playTime={playTime}
          roundsPlayed={roundsPlayed}
          accuracy={accuracy}
        />

        {/* Formulário de salvamento */}
        <SaveScoreForm
          currentPlayerName={currentPlayerName}
          score={score}
          playTime={playTime}
          roundsPlayed={roundsPlayed}
          accuracy={accuracy}
          onScoreSaved={handleScoreSaved}
        />

        {/* Posição no Ranking */}
        <RankingPosition
          position={playerPosition}
          isVisible={showRankingPosition}
        />

        {/* Top 3 do Ranking */}
        {showRankingPosition && (
          <TopRanking rankingData={rankingData} />
        )}

        {/* Botões de ação */}
        <ActionButtons
          score={score}
          onPlayAgain={onPlayAgain}
          onClose={onClose}
        />
      </div>
    </div>
  );
}; 