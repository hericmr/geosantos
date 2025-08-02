import React, { useState, useRef, useEffect } from 'react';
import { CheckIcon } from '../GameIcons';
import { rankingService } from '../../../lib/supabase';
import styles from '../GameOverModal.module.css';

interface SaveScoreFormProps {
  currentPlayerName: string;
  score: number;
  playTime: number;
  roundsPlayed: number;
  accuracy: number;
  onScoreSaved: () => void;
}

// Validação de input melhorada
const validatePlayerName = (name: string): string | null => {
  if (!name.trim()) {
    return 'Digite um nome para salvar sua pontuação!';
  }
  
  if (name.trim().length < 2) {
    return 'O nome deve ter pelo menos 2 caracteres!';
  }
  
  if (name.trim().length > 50) {
    return 'O nome deve ter no máximo 50 caracteres!';
  }
  
  // Remove emojis e caracteres especiais problemáticos
  const cleanName = name.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
  
  if (cleanName !== name) {
    return 'Não use emojis no nome!';
  }
  
  // Verifica caracteres especiais permitidos
  const allowedPattern = /^[a-zA-ZÀ-ÿ0-9\s\-_\.]+$/;
  if (!allowedPattern.test(name.trim())) {
    return 'Use apenas letras, números, espaços, hífens, pontos e underscores!';
  }
  
  return null;
};

export const SaveScoreForm: React.FC<SaveScoreFormProps> = ({
  currentPlayerName,
  score,
  playTime,
  roundsPlayed,
  accuracy,
  onScoreSaved
}) => {
  const [playerName, setPlayerName] = useState(currentPlayerName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Foco automático no input quando o modal abre
  useEffect(() => {
    if (inputRef.current && !isSubmitted) {
      inputRef.current.focus();
    }
  }, [isSubmitted]);

  const handleSubmit = async () => {
    const validationError = validatePlayerName(playerName);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const success = await rankingService.addScore({
        player_name: playerName.trim(),
        score,
        play_time: playTime,
        rounds_played: roundsPlayed,
        accuracy
      });

      if (success) {
        setIsSubmitted(true);
        onScoreSaved();
      } else {
        setError('Erro ao salvar pontuação. Tente novamente!');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente!');
      console.error('Erro ao salvar pontuação:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (isSubmitted) {
    return (
      <div className={styles.successMessage} role="alert" aria-live="polite">
        <CheckIcon size={24} color="var(--text-primary)" />
        <p className={styles.successText}>
          PONTUAÇÃO SALVA COM SUCESSO!
        </p>
      </div>
    );
  }

  return (
    <div className={styles.formSection}>
      <h3 className={styles.formTitle}>
        SALVAR NO RANKING
      </h3>
      
      <div className={styles.formRow}>
        <input
          ref={inputRef}
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Seu nome"
          maxLength={50}
          className={styles.nameInput}
          onKeyPress={handleKeyPress}
          aria-label="Digite seu nome para salvar no ranking"
          data-testid="player-name-input"
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={styles.saveButton}
          aria-label="Salvar pontuação no ranking"
          data-testid="save-score-button"
        >
          {isSubmitting ? 'SALVANDO...' : 'SALVAR'}
        </button>
      </div>
      
      {error && (
        <p 
          className={styles.errorMessage} 
          role="alert" 
          aria-live="polite"
          data-testid="error-message"
        >
          {error}
        </p>
      )}
    </div>
  );
}; 